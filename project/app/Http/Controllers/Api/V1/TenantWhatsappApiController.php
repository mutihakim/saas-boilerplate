<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TenantMember;
use App\Models\TenantWhatsappContact;
use App\Models\TenantWhatsappMessage;
use App\Models\TenantWhatsappNotification;
use App\Models\TenantWhatsappSetting;
use App\Services\WhatsappServiceClient;
use App\Support\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TenantWhatsappApiController extends Controller
{
    use ApiResponder;

    public function __construct(
        private readonly WhatsappServiceClient $serviceClient
    ) {
    }

    public function session(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureSettingsAuthorized($request)) {
            return $error;
        }

        $setting = $this->firstOrCreateSetting((int) $tenant->id);
        $setting = $this->healStaleConnectingState($setting);

        return $this->ok([
            'session' => [
                'session_name' => $setting->session_name,
                'connection_status' => $setting->connection_status,
                'connected_jid' => $setting->connected_jid,
                'auto_connect' => (bool) $setting->auto_connect,
                'meta' => $setting->meta,
            ],
        ]);
    }

    public function connect(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureSettingsAuthorized($request)) {
            return $error;
        }

        $setting = $this->firstOrCreateSetting((int) $tenant->id);
        $meta = is_array($setting->meta) ? $setting->meta : [];
        unset(
            $meta['disconnect_reason'],
            $meta['disconnected_at'],
            $meta['last_connect_error'],
            $meta['last_connect_error_at']
        );

        $setting->update([
            'connection_status' => 'connecting',
            'auto_connect' => true,
            'meta' => array_merge($meta, [
                'connect_requested_at' => now()->toIso8601String(),
                'lifecycle_state' => 'connecting',
                'restore_eligible' => true,
            ]),
        ]);

        $connectStatus = 'accepted';
        $serviceStatus = null;
        $serviceCode = null;
        if ($this->serviceClient->isEnabled()) {
            $serviceResponse = $this->serviceClient->connect((int) $tenant->id);
            if (!$serviceResponse['ok']) {
                $connectStatus = 'accepted_with_warning';
                $serviceStatus = (int) ($serviceResponse['status'] ?? 503);
                $serviceCode = (string) ($serviceResponse['code'] ?? 'REQUEST_FAILED');
                $setting->update([
                    'meta' => array_merge(is_array($setting->meta) ? $setting->meta : [], [
                        'connect_requested_at' => now()->toIso8601String(),
                        'lifecycle_state' => 'connecting',
                        'restore_eligible' => true,
                        'last_connect_warning_at' => now()->toIso8601String(),
                        'last_connect_warning' => $serviceCode,
                    ]),
                ]);
            }
        }

        return $this->ok([
            'status' => $connectStatus,
            'message' => $connectStatus === 'accepted_with_warning'
                ? 'Connection is starting (service not reachable yet).'
                : 'Connection is starting.',
            'connection_status' => 'connecting',
            'session_name' => $setting->session_name,
            'service_status' => $serviceStatus,
            'service_code' => $serviceCode,
        ], 202);
    }

    public function disconnect(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureSettingsAuthorized($request)) {
            return $error;
        }

        $setting = $this->firstOrCreateSetting((int) $tenant->id);
        $now = now()->toIso8601String();
        $meta = array_merge(is_array($setting->meta) ? $setting->meta : [], [
            'disconnect_reason' => 'manual_disconnect',
            'lifecycle_state' => 'manual_disconnect',
            'restore_eligible' => false,
            'disconnected_at' => $now,
        ]);
        unset($meta['qr_text'], $meta['qr_data_url'], $meta['qr_generated_at']);

        if ($this->serviceClient->isEnabled()) {
            $serviceResponse = $this->serviceClient->disconnect((int) $tenant->id);
            if (!$serviceResponse['ok']) {
                return $this->error(
                    'WHATSAPP_SERVICE_UNAVAILABLE',
                    'WhatsApp service is unavailable.',
                    [
                        'service_status' => $serviceResponse['status'] ?? 503,
                        'service_code' => $serviceResponse['code'] ?? 'REQUEST_FAILED',
                    ],
                    503
                );
            }
        }

        $setting->update([
            'connection_status' => 'disconnected',
            'connected_jid' => null,
            'auto_connect' => false,
            'meta' => $meta,
        ]);

        return $this->ok([
            'connection_status' => 'disconnected',
        ]);
    }

    public function removeSession(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureSettingsAuthorized($request)) {
            return $error;
        }

        $setting = $this->firstOrCreateSetting((int) $tenant->id);
        $now = now()->toIso8601String();
        $meta = array_merge(is_array($setting->meta) ? $setting->meta : [], [
            'disconnect_reason' => 'manual_remove',
            'lifecycle_state' => 'manual_remove',
            'restore_eligible' => false,
            'disconnected_at' => $now,
            'session_removed_at' => $now,
        ]);
        unset($meta['qr_text'], $meta['qr_data_url'], $meta['qr_generated_at']);

        if ($this->serviceClient->isEnabled()) {
            $serviceResponse = $this->serviceClient->removeSession((int) $tenant->id);
            if (!$serviceResponse['ok']) {
                return $this->error(
                    'WHATSAPP_SERVICE_UNAVAILABLE',
                    'WhatsApp service is unavailable.',
                    [
                        'service_status' => $serviceResponse['status'] ?? 503,
                        'service_code' => $serviceResponse['code'] ?? 'REQUEST_FAILED',
                    ],
                    503
                );
            }
        }

        $setting->update([
            'connection_status' => 'disconnected',
            'connected_jid' => null,
            'auto_connect' => false,
            'meta' => $meta,
        ]);

        return $this->ok([
            'connection_status' => 'disconnected',
            'removed' => true,
        ]);
    }

    public function chats(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureChatsAuthorized($request)) {
            return $error;
        }

        $tenantId = (int) $tenant->id;
        $contacts = TenantWhatsappContact::query()
            ->where('tenant_id', $tenantId)
            ->orderByDesc('last_message_at')
            ->get(['id', 'jid', 'contact_type', 'display_name', 'member_id', 'last_message_at']);

        $membersWithJid = TenantMember::query()
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->whereNotNull('whatsapp_jid')
            ->get(['id', 'full_name', 'whatsapp_jid']);

        $known = $contacts->keyBy('jid');
        foreach ($membersWithJid as $member) {
            if ($known->has($member->whatsapp_jid)) {
                continue;
            }

            $contacts->push(new TenantWhatsappContact([
                'jid' => $member->whatsapp_jid,
                'contact_type' => 'member',
                'display_name' => $member->full_name,
                'member_id' => $member->id,
                'last_message_at' => null,
            ]));
        }

        $latestMessages = TenantWhatsappMessage::query()
            ->where('tenant_id', $tenantId)
            ->whereNotNull('chat_jid')
            ->select('chat_jid', DB::raw('MAX(id) as latest_id'))
            ->groupBy('chat_jid')
            ->pluck('latest_id', 'chat_jid');

        $lastMessages = TenantWhatsappMessage::query()
            ->whereIn('id', $latestMessages->values()->all())
            ->get(['id', 'chat_jid', 'direction', 'payload', 'created_at'])
            ->keyBy('chat_jid');

        $unreadCounts = TenantWhatsappMessage::query()
            ->where('tenant_id', $tenantId)
            ->where('direction', 'incoming')
            ->whereNull('read_at')
            ->whereNotNull('chat_jid')
            ->select('chat_jid', DB::raw('COUNT(*) as unread_count'))
            ->groupBy('chat_jid')
            ->pluck('unread_count', 'chat_jid');

        $chatItems = $contacts
            ->map(function (TenantWhatsappContact $contact) use ($lastMessages, $unreadCounts) {
                $lastMessage = $lastMessages->get($contact->jid);
                $messageText = '';
                if ($lastMessage && is_array($lastMessage->payload)) {
                    $messageText = (string) ($lastMessage->payload['text'] ?? '');
                }

                return [
                    'jid' => $contact->jid,
                    'name' => $contact->display_name ?: $contact->jid,
                    'contact_type' => $contact->contact_type,
                    'member_id' => $contact->member_id,
                    'last_message' => $messageText,
                    'last_message_at' => $contact->last_message_at ?: $lastMessage?->created_at,
                    'unread_count' => (int) ($unreadCounts[$contact->jid] ?? 0),
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();

        return $this->ok([
            'chats' => $chatItems,
        ]);
    }

    public function chatMessages(Request $request, string $jid)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureChatsAuthorized($request)) {
            return $error;
        }

        $payload = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
            'before_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $limit = (int) ($payload['limit'] ?? 15);
        $beforeId = isset($payload['before_id']) ? (int) $payload['before_id'] : null;
        $chatJid = $this->normalizeJid($jid);
        $query = TenantWhatsappMessage::query()
            ->where('tenant_id', $tenant->id)
            ->where('chat_jid', $chatJid);

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        $messages = $query
            ->orderByDesc('id')
            ->limit($limit + 1)
            ->get(['id', 'direction', 'chat_jid', 'sender_jid', 'recipient_jid', 'payload', 'read_at', 'created_at']);

        $hasMore = $messages->count() > $limit;
        if ($hasMore) {
            $messages = $messages->take($limit);
        }

        $messages = $messages->reverse()->values();
        $nextBeforeId = $hasMore ? (int) ($messages->first()?->id ?? 0) : null;

        return $this->ok([
            'jid' => $chatJid,
            'messages' => $messages,
            'has_more' => $hasMore,
            'next_before_id' => $nextBeforeId ?: null,
        ]);
    }

    public function sendToChat(Request $request, string $jid)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureChatsAuthorized($request)) {
            return $error;
        }

        $payload = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'notification_key' => ['nullable', 'string', 'max:160'],
        ]);

        $setting = $this->firstOrCreateSetting((int) $tenant->id);
        $chatJid = $this->normalizeJid($jid);
        $messageId = 'local-' . Str::uuid()->toString();
        $isConnected = $setting->connection_status === 'connected';
        $serviceDelivery = $isConnected ? 'queued' : 'failed_not_connected';
        $serviceMessageId = $messageId;

        if ($isConnected && $this->serviceClient->isEnabled()) {
            $serviceResponse = $this->serviceClient->sendMessage(
                tenantId: (int) $tenant->id,
                to: $chatJid,
                message: $payload['message'],
                notificationKey: $payload['notification_key'] ?? null
            );

            if (!$serviceResponse['ok']) {
                return $this->error(
                    'WHATSAPP_SERVICE_UNAVAILABLE',
                    'WhatsApp service is unavailable.',
                    [
                        'service_status' => $serviceResponse['status'] ?? 503,
                        'service_code' => $serviceResponse['code'] ?? 'REQUEST_FAILED',
                    ],
                    503
                );
            }

            $serviceMessageId = (string) ($serviceResponse['data']['message_id'] ?? $messageId);
            $serviceDelivery = (string) ($serviceResponse['data']['delivery'] ?? 'queued');
        }

        TenantWhatsappMessage::query()->create([
            'tenant_id' => $tenant->id,
            'direction' => 'outgoing',
            'whatsapp_message_id' => $serviceMessageId,
            'sender_jid' => $setting->connected_jid,
            'recipient_jid' => $chatJid,
            'chat_jid' => $chatJid,
            'payload' => [
                'text' => $payload['message'],
                'delivery' => $serviceDelivery,
            ],
        ]);

        $this->upsertContact((int) $tenant->id, $chatJid);

        TenantWhatsappNotification::query()->create([
            'tenant_id' => $tenant->id,
            'member_id' => $request->attributes->get('currentTenantMember')?->id,
            'notification_type' => 'manual_message',
            'notification_key' => $payload['notification_key'] ?? ('manual-' . $messageId),
            'status' => $isConnected ? 'sent' : 'failed',
            'context' => ['to' => $chatJid],
            'service_response' => ['state' => $isConnected ? 'queued' : 'not_connected'],
            'sent_at' => now()->utc(),
        ]);

        if (!$isConnected) {
            return $this->error(
                'WHATSAPP_NOT_CONNECTED',
                'WhatsApp session is not connected.',
                ['hint' => 'Connect session first to send messages.'],
                422
            );
        }

        return $this->ok([
            'queued' => true,
            'message_id' => $serviceMessageId,
            'to' => $chatJid,
        ]);
    }

    public function markChatRead(Request $request, string $jid)
    {
        $tenant = $request->attributes->get('currentTenant');
        if ($error = $this->ensureChatsAuthorized($request)) {
            return $error;
        }

        $chatJid = $this->normalizeJid($jid);
        TenantWhatsappMessage::query()
            ->where('tenant_id', $tenant->id)
            ->where('chat_jid', $chatJid)
            ->where('direction', 'incoming')
            ->whereNull('read_at')
            ->update(['read_at' => now()->utc()]);

        return $this->ok([
            'read' => true,
            'jid' => $chatJid,
        ]);
    }

    private function firstOrCreateSetting(int $tenantId): TenantWhatsappSetting
    {
        return TenantWhatsappSetting::query()->firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'session_name' => $this->sessionName($tenantId),
                'connection_status' => 'disconnected',
                'auto_connect' => true,
            ]
        );
    }

    private function upsertContact(int $tenantId, string $jid): void
    {
        $member = TenantMember::query()
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->where('whatsapp_jid', $jid)
            ->first(['id', 'full_name']);

        TenantWhatsappContact::query()->updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'jid' => $jid,
            ],
            [
                'member_id' => $member?->id,
                'display_name' => $member?->full_name,
                'contact_type' => $member ? 'member' : (str_ends_with($jid, '@g.us') ? 'group' : 'external'),
                'last_message_at' => now()->utc(),
            ]
        );
    }

    private function ensureSettingsAuthorized(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');
        if ($user?->is_superadmin) {
            return null;
        }

        if ($user && ($user->can('whatsapp.settings.view') || $user->can('whatsapp.settings.update'))) {
            return null;
        }

        if (in_array($member?->role_code, ['owner', 'tenant_owner'], true)) {
            return null;
        }

        return $this->error('WHATSAPP_SETTINGS_FORBIDDEN', 'Only workspace owner can manage WhatsApp settings.', [], 403);
    }

    private function ensureChatsAuthorized(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');
        if ($user?->is_superadmin) {
            return null;
        }

        if ($user && ($user->can('whatsapp.chats.view') || $user->can('whatsapp.chats.update'))) {
            return null;
        }

        if (in_array($member?->role_code, ['owner', 'admin', 'tenant_owner', 'tenant_admin'], true)) {
            return null;
        }

        return $this->error('WHATSAPP_CHAT_FORBIDDEN', 'You are not allowed to access WhatsApp chats.', [], 403);
    }

    private function sessionName(int $tenantId): string
    {
        return 'tenant-' . dechex($tenantId);
    }

    private function healStaleConnectingState(TenantWhatsappSetting $setting): TenantWhatsappSetting
    {
        if ((string) $setting->connection_status !== 'connecting') {
            return $setting;
        }

        $updatedAt = $setting->updated_at ?? $setting->created_at;
        if (!$updatedAt) {
            return $setting;
        }

        $ttlMs = max(1000, (int) config('whatsapp.connecting_timeout_ms', 60000));
        $graceMs = max(0, (int) config('whatsapp.connecting_stale_grace_ms', 15000));
        $staleCutoff = now()->subMilliseconds($ttlMs + $graceMs);
        if ($updatedAt->greaterThan($staleCutoff)) {
            return $setting;
        }

        $meta = array_merge(is_array($setting->meta) ? $setting->meta : [], [
            'disconnect_reason' => 'qr_timeout',
            'lifecycle_state' => 'qr_timeout',
            'restore_eligible' => false,
            'disconnected_at' => now()->toIso8601String(),
        ]);
        unset($meta['qr_data_url'], $meta['qr_text'], $meta['qr_generated_at']);

        $setting->update([
            'connection_status' => 'disconnected',
            'connected_jid' => null,
            'auto_connect' => false,
            'meta' => $meta,
        ]);

        Log::warning('whatsapp.session.stale_connecting_healed', [
            'tenant_id' => (int) $setting->tenant_id,
            'session_name' => (string) $setting->session_name,
            'updated_at' => $updatedAt->toIso8601String(),
        ]);

        return $setting->refresh();
    }

    private function normalizeJid(string $input): string
    {
        $decoded = urldecode($input);
        $trimmed = trim($decoded);
        if (preg_match('/^\d{6,20}@(c|g|lid)\.us$/', $trimmed) === 1) {
            return $trimmed;
        }

        $digits = preg_replace('/\D+/', '', $trimmed) ?? '';
        if (strlen($digits) < 6 || strlen($digits) > 20) {
            throw ValidationException::withMessages([
                'jid' => ['Invalid destination number format.'],
            ]);
        }

        return $digits . '@c.us';
    }
}
