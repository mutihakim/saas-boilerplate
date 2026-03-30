<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\WhatsappSessionStateUpdated;
use App\Http\Controllers\Controller;
use App\Models\TenantMember;
use App\Models\Tenant;
use App\Models\TenantWhatsappContact;
use App\Models\TenantWhatsappMedia;
use App\Models\TenantWhatsappMessage;
use App\Models\TenantWhatsappSetting;
use App\Services\WhatsappServiceClient;
use App\Support\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;

class InternalWhatsappCallbackController extends Controller
{
    use ApiResponder;

    public function __construct(
        private readonly WhatsappServiceClient $serviceClient
    ) {
    }

    public function sessions(Request $request)
    {
        if ($error = $this->ensureInternalToken($request)) {
            return $error;
        }

        $includeAll = $request->boolean('include_all', false);
        $eligibleOnly = $request->boolean('eligible_only', false);
        $query = TenantWhatsappSetting::query();
        if ($includeAll) {
            // no filter
        } elseif ($eligibleOnly) {
            $query
                ->where('auto_connect', true)
                ->whereIn('connection_status', ['connecting', 'connected']);
        } else {
            $query->where('auto_connect', true);
        }

        $sessions = $query->get(['tenant_id', 'session_name', 'connection_status', 'auto_connect', 'meta']);

        return $this->ok(['sessions' => $sessions]);
    }

    public function sessionState(Request $request)
    {
        if ($error = $this->ensureInternalToken($request)) {
            return $error;
        }

        $payload = $request->validate([
            'tenant_id' => ['required', 'integer', 'exists:tenants,id'],
            'connection_status' => ['required', 'string', 'max:30'],
            'connected_jid' => ['nullable', 'string', 'max:60'],
            'auto_connect' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
        ]);
        Log::info('whatsapp.callback.session_state.received', [
            'tenant_id' => (int) $payload['tenant_id'],
            'connection_status' => (string) $payload['connection_status'],
            'auto_connect' => array_key_exists('auto_connect', $payload) ? (bool) $payload['auto_connect'] : null,
        ]);
        $tenantId = (int) $payload['tenant_id'];
        $requestedConnectedJid = trim((string) ($payload['connected_jid'] ?? ''));
        $payload['connected_jid'] = $requestedConnectedJid !== '' ? $requestedConnectedJid : null;
        $conflictOwnerTenantId = null;
        $shouldRemoveConflictedSession = false;
        if ($payload['connection_status'] === 'connected' && $requestedConnectedJid !== '') {
            $conflictOwnerTenantId = $this->findConnectedJidConflictOwner($tenantId, $requestedConnectedJid);
            if ($conflictOwnerTenantId !== null) {
                $payload['connection_status'] = 'disconnected';
                $payload['connected_jid'] = null;
                $payload['auto_connect'] = false;
                $payload['meta'] = array_merge(
                    is_array($payload['meta'] ?? null) ? $payload['meta'] : [],
                    [
                        'disconnect_reason' => 'jid_conflict',
                        'lifecycle_state' => 'manual_remove',
                        'restore_eligible' => false,
                        'conflict_connected_jid' => $requestedConnectedJid,
                        'conflict_owner_tenant_id' => $conflictOwnerTenantId,
                        'conflict_at' => now()->toIso8601String(),
                    ]
                );
                Log::warning('whatsapp.callback.session_state.jid_conflict_reject_newcomer', [
                    'tenant_id' => $tenantId,
                    'owner_tenant_id' => $conflictOwnerTenantId,
                    'connected_jid' => $requestedConnectedJid,
                ]);
                $shouldRemoveConflictedSession = true;
            }
        }
        $setting = null;

        try {
            $setting = TenantWhatsappSetting::query()->firstOrNew(['tenant_id' => $tenantId]);
            $setting->session_name = $setting->session_name ?: ('tenant-' . dechex($tenantId));
            $setting->connection_status = $payload['connection_status'];
            $setting->connected_jid = $payload['connected_jid'] ?? null;

            if (array_key_exists('auto_connect', $payload)) {
                $setting->auto_connect = (bool) $payload['auto_connect'];
            } elseif (!$setting->exists && !isset($setting->auto_connect)) {
                $setting->auto_connect = true;
            }

            $existingMeta = is_array($setting->meta) ? $setting->meta : [];
            $incomingMeta = is_array($payload['meta'] ?? null) ? $payload['meta'] : [];
            $meta = array_merge($existingMeta, $incomingMeta);

            $hadExistingJidConflict = ($existingMeta['disconnect_reason'] ?? null) === 'jid_conflict'
                || is_string($existingMeta['conflict_connected_jid'] ?? null)
                || isset($existingMeta['conflict_owner_tenant_id']);
            if ($hadExistingJidConflict) {
                if (!is_string($meta['conflict_connected_jid'] ?? null) || trim((string) $meta['conflict_connected_jid']) === '') {
                    $meta['conflict_connected_jid'] = $existingMeta['conflict_connected_jid'] ?? null;
                }
                if (!isset($meta['conflict_owner_tenant_id']) && isset($existingMeta['conflict_owner_tenant_id'])) {
                    $meta['conflict_owner_tenant_id'] = $existingMeta['conflict_owner_tenant_id'];
                }
                if (!is_string($meta['conflict_at'] ?? null) && is_string($existingMeta['conflict_at'] ?? null)) {
                    $meta['conflict_at'] = $existingMeta['conflict_at'];
                }
            }

            if (($meta['disconnect_reason'] ?? null) === 'manual_remove' && $hadExistingJidConflict) {
                // Keep conflict reason for UI alert even after service emits follow-up remove callback.
                $meta['disconnect_reason'] = 'jid_conflict';
            }
            
            if (isset($incomingMeta['qr_data_url']) || isset($incomingMeta['qr_text'])) {
                $meta['lifecycle_state'] = 'qr';
            }

            if (!is_string($meta['lifecycle_state'] ?? null) && is_string($meta['disconnect_reason'] ?? null)) {
                $meta['lifecycle_state'] = $meta['disconnect_reason'];
            }
            if ($setting->connection_status === 'connecting' && !is_string($meta['lifecycle_state'] ?? null)) {
                $meta['lifecycle_state'] = 'connecting';
            }
            if ($setting->connection_status === 'connected' && !is_string($meta['lifecycle_state'] ?? null)) {
                $meta['lifecycle_state'] = 'connected';
            }
            $meta['restore_eligible'] = (bool) $setting->auto_connect
                && in_array((string) $setting->connection_status, ['connecting', 'connected'], true);
                
            if ($setting->connection_status !== 'connecting') {
                unset($meta['qr_data_url'], $meta['qr_text']);
            }
            
            $setting->meta = $meta;

            try {
                $setting->save();
            } catch (QueryException $queryException) {
                if (!$this->isConnectedJidUniqueConstraintViolation($queryException, $setting->connected_jid)) {
                    throw $queryException;
                }

                $raceConnectedJid = (string) $setting->connected_jid;
                $raceOwnerTenantId = $this->findConnectedJidConflictOwner($tenantId, $raceConnectedJid);
                $raceMeta = is_array($setting->meta) ? $setting->meta : [];
                $raceMeta = array_merge($raceMeta, [
                    'disconnect_reason' => 'jid_conflict',
                    'lifecycle_state' => 'manual_remove',
                    'restore_eligible' => false,
                    'conflict_connected_jid' => $raceConnectedJid,
                    'conflict_owner_tenant_id' => $raceOwnerTenantId,
                    'conflict_at' => now()->toIso8601String(),
                ]);
                unset($raceMeta['qr_data_url'], $raceMeta['qr_text']);

                $setting->connection_status = 'disconnected';
                $setting->connected_jid = null;
                $setting->auto_connect = false;
                $setting->meta = $raceMeta;
                $setting->save();

                Log::warning('whatsapp.callback.session_state.jid_conflict_unique_index_race', [
                    'tenant_id' => $tenantId,
                    'owner_tenant_id' => $raceOwnerTenantId,
                    'connected_jid' => $raceConnectedJid,
                ]);
                $this->tryRemoveSessionAfterJidConflict($tenantId, $raceConnectedJid, $raceOwnerTenantId);
            }
            Log::info('whatsapp.callback.session_state.persisted', [
                'tenant_id' => (int) $setting->tenant_id,
                'session_name' => (string) $setting->session_name,
                'connection_status' => (string) $setting->connection_status,
                'auto_connect' => (bool) $setting->auto_connect,
            ]);
            if ($shouldRemoveConflictedSession) {
                $this->tryRemoveSessionAfterJidConflict($tenantId, $requestedConnectedJid, $conflictOwnerTenantId);
            }

            $broadcastMeta = is_array($setting->meta) ? $setting->meta : [];
            unset($broadcastMeta['qr_data_url'], $broadcastMeta['qr_text']);

            event(new WhatsappSessionStateUpdated(
                tenantId: (int) $setting->tenant_id,
                sessionName: (string) $setting->session_name,
                connectionStatus: (string) $setting->connection_status,
                connectedJid: $setting->connected_jid,
                meta: empty($broadcastMeta) ? null : $broadcastMeta,
                updatedAt: $setting->updated_at?->toIso8601String() ?? now()->toIso8601String()
            ));
        } catch (\Throwable $e) {
            Log::error('whatsapp.callback.session_state.failed', [
                'tenant_id' => (int) $payload['tenant_id'],
                'session_name' => (string) ($setting->session_name ?? ('tenant-' . dechex((int) $payload['tenant_id']))),
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        return $this->ok(['updated' => true]);
    }

    private function findConnectedJidConflictOwner(int $tenantId, string $connectedJid): ?int
    {
        $ownerTenantId = TenantWhatsappSetting::query()
            ->where('connected_jid', $connectedJid)
            ->where('connection_status', 'connected')
            ->where('tenant_id', '!=', $tenantId)
            ->orderBy('updated_at')
            ->orderBy('id')
            ->value('tenant_id');

        return $ownerTenantId ? (int) $ownerTenantId : null;
    }

    private function isConnectedJidUniqueConstraintViolation(QueryException $exception, ?string $connectedJid): bool
    {
        if (!$connectedJid) {
            return false;
        }

        $sqlState = (string) ($exception->errorInfo[0] ?? '');
        $message = Str::lower($exception->getMessage());

        return $sqlState === '23505'
            && (str_contains($message, 'tenant_whatsapp_settings_connected_jid_active_unique')
                || str_contains($message, 'connected_jid'));
    }

    private function tryRemoveSessionAfterJidConflict(int $tenantId, string $connectedJid, ?int $ownerTenantId): void
    {
        if (!$this->serviceClient->isEnabled()) {
            return;
        }

        try {
            $response = $this->serviceClient->removeSession($tenantId);
            if (!($response['ok'] ?? false)) {
                Log::warning('whatsapp.callback.session_state.jid_conflict_remove_session_failed', [
                    'tenant_id' => $tenantId,
                    'owner_tenant_id' => $ownerTenantId,
                    'connected_jid' => $connectedJid,
                    'status' => $response['status'] ?? null,
                    'code' => $response['code'] ?? null,
                ]);
            }
        } catch (\Throwable $exception) {
            Log::warning('whatsapp.callback.session_state.jid_conflict_remove_session_exception', [
                'tenant_id' => $tenantId,
                'owner_tenant_id' => $ownerTenantId,
                'connected_jid' => $connectedJid,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    public function messages(Request $request)
    {
        if ($error = $this->ensureInternalToken($request)) {
            return $error;
        }

        $payload = $request->validate([
            'tenant_id' => ['required', 'integer', 'exists:tenants,id'],
            'direction' => ['required', 'in:incoming,outgoing'],
            'whatsapp_message_id' => ['required', 'string', 'max:120'],
            'sender_jid' => ['nullable', 'string', 'max:60'],
            'recipient_jid' => ['nullable', 'string', 'max:60'],
            'payload' => ['nullable', 'array'],
        ]);

        $chatJid = $payload['direction'] === 'incoming'
            ? ($payload['sender_jid'] ?? null)
            : ($payload['recipient_jid'] ?? null);

        $messageModel = TenantWhatsappMessage::query()->firstOrCreate(
            [
                'tenant_id' => $payload['tenant_id'],
                'direction' => $payload['direction'],
                'whatsapp_message_id' => $payload['whatsapp_message_id'],
            ],
            [
                'sender_jid' => $payload['sender_jid'] ?? null,
                'recipient_jid' => $payload['recipient_jid'] ?? null,
                'chat_jid' => $chatJid,
                'payload' => $payload['payload'] ?? null,
            ]
        );

        if ($chatJid) {
            $member = TenantMember::query()
                ->where('tenant_id', $payload['tenant_id'])
                ->whereNull('deleted_at')
                ->where('whatsapp_jid', $chatJid)
                ->first(['id', 'full_name']);

            TenantWhatsappContact::query()->updateOrCreate(
                [
                    'tenant_id' => $payload['tenant_id'],
                    'jid' => $chatJid,
                ],
                [
                    'member_id' => $member?->id,
                    'display_name' => $member?->full_name,
                    'contact_type' => $member ? 'member' : (str_ends_with($chatJid, '@g.us') ? 'group' : 'external'),
                    'last_message_at' => now()->utc(),
                ]
            );
        }

        if (isset($messageModel)) {
            event(new \App\Events\WhatsappMessageReceived(
                tenantId: (int) $payload['tenant_id']
            ));
        }

        $this->handleIncomingAutoCommand($payload);

        return $this->ok(['received' => true]);
    }

    public function media(Request $request)
    {
        if ($error = $this->ensureInternalToken($request)) {
            return $error;
        }

        $payload = $request->validate([
            'tenant_id' => ['required', 'integer', 'exists:tenants,id'],
            'sender_jid' => ['nullable', 'string', 'max:60'],
            'mime_type' => ['required', 'string', 'max:120'],
            'size_bytes' => ['required', 'integer', 'min:1', 'max:4194304'],
            'storage_path' => ['nullable', 'string', 'max:255'],
            'content_base64' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ]);

        $allowed = ['application/pdf'];
        $isImage = Str::startsWith($payload['mime_type'], 'image/');
        if (!$isImage && !in_array($payload['mime_type'], $allowed, true)) {
            return $this->error('UNSUPPORTED_MEDIA_TYPE', 'Unsupported media type.', [], 422);
        }

        $path = $payload['storage_path'] ?? ('whatsapp/media/' . Str::uuid()->toString());

        TenantWhatsappMedia::query()->create([
            'tenant_id' => $payload['tenant_id'],
            'sender_jid' => $payload['sender_jid'] ?? null,
            'mime_type' => $payload['mime_type'],
            'size_bytes' => $payload['size_bytes'],
            'storage_path' => $path,
            'meta' => $payload['meta'] ?? null,
            'consumed_at' => null,
        ]);

        return $this->ok(['stored' => true, 'storage_path' => $path]);
    }

    private function ensureInternalToken(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $token = (string) config('whatsapp.internal_token', '');
        if ($token === '' || !hash_equals($token, (string) $request->header('X-Internal-Token', ''))) {
            return $this->error('FORBIDDEN', 'Invalid internal callback token.', [
                'debug_expected' => $token,
                'debug_received' => $request->header('X-Internal-Token', '')
            ], 403);
        }

        return null;
    }

    private function handleIncomingAutoCommand(array $payload): void
    {
        if (($payload['direction'] ?? null) !== 'incoming') {
            return;
        }

        $commandConfig = config('whatsapp.auto_command', []);
        if (!(bool) ($commandConfig['enabled'] ?? false)) {
            return;
        }

        $text = trim((string) (($payload['payload']['text'] ?? '') ?: ''));
        if ($text === '') {
            return;
        }

        $prefixes = array_values(array_filter(
            is_array($commandConfig['prefixes'] ?? null) ? $commandConfig['prefixes'] : [],
            fn ($prefix) => is_string($prefix) && $prefix !== ''
        ));
        if ($prefixes === []) {
            return;
        }

        $firstChar = Str::substr($text, 0, 1);
        if (!in_array($firstChar, $prefixes, true)) {
            return;
        }

        $senderJid = trim((string) ($payload['sender_jid'] ?? ''));
        if (!preg_match('/^\d{6,20}@(c|g|lid)\.us$/', $senderJid)) {
            return;
        }

        if (!$this->serviceClient->isEnabled()) {
            Log::warning('whatsapp.auto_command.skipped_service_disabled', [
                'tenant_id' => (int) $payload['tenant_id'],
                'sender_jid' => $senderJid,
            ]);
            return;
        }

        $withoutPrefix = trim(Str::substr($text, 1));
        $slug = Str::lower((string) Str::of($withoutPrefix)->before(' ')->value());
        if ($slug === '') {
            return;
        }

        $commands = is_array($commandConfig['commands'] ?? null) ? $commandConfig['commands'] : [];
        $matched = is_array($commands[$slug] ?? null) ? $commands[$slug] : null;

        $tenantLocale = (string) Tenant::query()
            ->whereKey((int) $payload['tenant_id'])
            ->value('locale');
        $locale = in_array($tenantLocale, ['en', 'id'], true) ? $tenantLocale : 'en';

        $helpText = $this->buildAutoCommandHelpText($commands, $locale);
        $message = null;

        if ($matched) {
            if ($slug === 'help') {
                $message = $helpText;
            } else {
                $message = $this->pickLocalizedValue($matched['response'] ?? null, $locale) ?: $helpText;
            }
        } else {
            $message = $helpText;
        }

        $message = trim((string) $message);
        if ($message === '') {
            return;
        }

        $response = $this->serviceClient->sendMessage(
            tenantId: (int) $payload['tenant_id'],
            to: $senderJid,
            message: $message,
            notificationKey: 'auto-command-' . Str::uuid()->toString()
        );

        if (!($response['ok'] ?? false)) {
            Log::warning('whatsapp.auto_command.reply_failed', [
                'tenant_id' => (int) $payload['tenant_id'],
                'sender_jid' => $senderJid,
                'command' => $slug,
                'status' => $response['status'] ?? null,
                'code' => $response['code'] ?? null,
            ]);
        }
    }

    private function buildAutoCommandHelpText(array $commands, string $locale): string
    {
        $helpLines = [];
        foreach ($commands as $slug => $command) {
            if (!is_array($command)) {
                continue;
            }

            $description = $this->pickLocalizedValue($command['description'] ?? null, $locale);
            if (!$description) {
                continue;
            }

            $helpLines[] = '/' . $slug . ' - ' . $description;
        }

        $header = $locale === 'id' ? 'Perintah tersedia:' : 'Available commands:';
        if ($helpLines === []) {
            return $header;
        }

        return $header . "\n" . implode("\n", $helpLines);
    }

    private function pickLocalizedValue(mixed $value, string $locale): ?string
    {
        if (is_string($value)) {
            return $value;
        }

        if (!is_array($value)) {
            return null;
        }

        $localized = $value[$locale] ?? $value['en'] ?? null;
        return is_string($localized) ? $localized : null;
    }
}
