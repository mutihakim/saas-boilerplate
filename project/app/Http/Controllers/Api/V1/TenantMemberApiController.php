<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreTenantMemberRequest;
use App\Http\Requests\Tenant\UpdateTenantMemberRequest;
use App\Models\ActivityLog;
use App\Models\TenantMember;
use App\Models\User;
use App\Support\ApiResponder;
use App\Support\SubscriptionEntitlements;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\PermissionRegistrar;

class TenantMemberApiController extends Controller
{
    use ApiResponder;

    public function index(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $this->authorize('viewAny', [TenantMember::class, $actor]);

        $members = TenantMember::query()
            ->with(['user:id,email,email_verified_at'])
            ->where('tenant_id', $tenant->id)
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get(['id', 'user_id', 'full_name', 'role_code', 'profile_status', 'onboarding_status', 'whatsapp_jid', 'row_version']);

        return $this->ok(['members' => $members->map(fn (TenantMember $member) => $this->mapMemberPayload($member))->values()]);
    }

    public function store(StoreTenantMemberRequest $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $this->authorize('create', [TenantMember::class, $actor]);
        $subscription = app(SubscriptionEntitlements::class);

        $currentMembers = TenantMember::query()
            ->where('tenant_id', $tenant->id)
            ->whereNull('deleted_at')
            ->count();
        $maxMembers = $subscription->limit($tenant, 'team.members.max');
        if ($maxMembers !== null && $currentMembers >= $maxMembers) {
            return $this->error('PLAN_QUOTA_EXCEEDED', 'Tenant member quota has been reached for current plan.', [
                'limit_key' => 'team.members.max',
                'limit_label' => $subscription->limitLabel('team.members.max'),
                'current_count' => $currentMembers,
                'limit' => $maxMembers,
                'plan_code' => $subscription->normalizePlan($tenant->plan_code),
            ], 422);
        }

        $payload = $request->validated();
        $normalizedJid = $this->normalizeJidOrNull($payload['whatsapp_jid'] ?? null);
        $idempotencyKey = $request->header('Idempotency-Key');
        $requestHash = hash('sha256', json_encode($payload));

        if ($idempotencyKey) {
            $cached = DB::table('idempotency_keys')
                ->where('tenant_id', $tenant->id)
                ->where('actor_user_id', $request->user()->id)
                ->where('endpoint', 'tenant_members.store')
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($cached && $cached->request_hash === $requestHash && $cached->response_payload) {
                return response()->json(json_decode((string) $cached->response_payload, true), 201);
            }

            if ($cached && $cached->request_hash !== $requestHash) {
                return $this->error(
                    'IDEMPOTENCY_KEY_REUSED',
                    'Idempotency-Key already used with different payload.',
                    [],
                    409
                );
            }
        }

        $member = DB::transaction(function () use ($request, $tenant, $actor, $payload, $normalizedJid) {
            $linkedUserId = $payload['user_id'] ?? null;

            if ($linkedUserId) {
                $existingMembership = TenantMember::query()
                    ->where('user_id', $linkedUserId)
                    ->whereNull('deleted_at')
                    ->first();

                if ($existingMembership && (int) $existingMembership->tenant_id !== (int) $tenant->id) {
                    throw ValidationException::withMessages([
                        'user_id' => ['User already has tenant membership.'],
                    ]);
                }
            }

            $member = TenantMember::create([
                'tenant_id' => $tenant->id,
                'user_id' => $linkedUserId,
                'full_name' => $payload['full_name'],
                'role_code' => $payload['role_code'],
                'profile_status' => $payload['profile_status'],
                'onboarding_status' => $linkedUserId ? 'account_active' : 'no_account',
                'whatsapp_jid' => $normalizedJid,
                'row_version' => 1,
            ]);

            $this->syncUserRoleForTenant($tenant->id, $member);

            ActivityLog::create([
                'tenant_id' => $tenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => $actor->id,
                'action' => 'tenant_member.created',
                'target_type' => 'tenant_members',
                'target_id' => (string) $member->id,
                'changes' => ['after' => $member->only(['full_name', 'role_code', 'profile_status'])],
                'metadata' => ['channel' => 'api'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => null,
                'after_version' => 1,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $member;
        });

        Log::info('tenant_member.created', [
            'service' => config('app.name'),
            'tenant_id' => $tenant->id,
            'actor_id' => $request->user()->id,
            'event_name' => 'tenant_member.created',
            'request_id' => $request->header('X-Request-Id'),
        ]);

        $response = [
            'ok' => true,
            'data' => [
                'member' => $this->mapMemberPayload($member->fresh(['user:id,email,email_verified_at'])),
            ],
        ];

        if ($idempotencyKey) {
            DB::table('idempotency_keys')->updateOrInsert(
                [
                    'tenant_id' => $tenant->id,
                    'actor_user_id' => $request->user()->id,
                    'endpoint' => 'tenant_members.store',
                    'idempotency_key' => $idempotencyKey,
                ],
                [
                    'request_hash' => $requestHash,
                    'response_payload' => json_encode($response),
                    'created_at' => now()->utc(),
                ]
            );
        }

        return response()->json($response, 201);
    }

    public function update(UpdateTenantMemberRequest $request, int $member)
    {
        $currentTenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $target = TenantMember::query()
            ->where('tenant_id', $currentTenant->id)
            ->where('id', $member)
            ->firstOrFail();

        $this->authorize('update', [$target, $actor]);

        $payload = $request->validated();
        $normalizedJid = $this->normalizeJidOrNull($payload['whatsapp_jid'] ?? null);
        $currentVersion = $target->row_version;

        $updated = DB::transaction(function () use ($request, $currentTenant, $actor, $target, $payload, $currentVersion, $normalizedJid) {
            $affected = TenantMember::query()
                ->where('id', $target->id)
                ->where('tenant_id', $currentTenant->id)
                ->where('row_version', $payload['row_version'])
                ->update([
                    'full_name' => $payload['full_name'],
                    'role_code' => $payload['role_code'],
                    'profile_status' => $payload['profile_status'],
                    'onboarding_status' => $target->user_id ? 'account_active' : $target->onboarding_status,
                    'whatsapp_jid' => $normalizedJid,
                    'row_version' => DB::raw('row_version + 1'),
                    'updated_at' => now()->utc(),
                ]);

            if ($affected === 0) {
                return null;
            }

            $fresh = TenantMember::query()->with(['user:id,email,email_verified_at'])->findOrFail($target->id);
            $this->syncUserRoleForTenant($currentTenant->id, $fresh);

            ActivityLog::create([
                'tenant_id' => $currentTenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => $actor->id,
                'action' => 'tenant_member.updated',
                'target_type' => 'tenant_members',
                'target_id' => (string) $fresh->id,
                'changes' => [
                    'before' => $target->only(['full_name', 'role_code', 'profile_status']),
                    'after' => $fresh->only(['full_name', 'role_code', 'profile_status']),
                ],
                'metadata' => ['channel' => 'api'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => $currentVersion,
                'after_version' => $fresh->row_version,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $fresh;
        });

        if (!$updated) {
            $server = TenantMember::query()->findOrFail($target->id);
            return $this->error(
                'VERSION_CONFLICT',
                'Resource has been modified by another request.',
                [
                    'current_row_version' => $server->row_version,
                    'server_snapshot' => $server->only(['id', 'full_name', 'role_code', 'profile_status']),
                ],
                409
            );
        }

        return $this->ok([
            'member' => $this->mapMemberPayload($updated),
        ]);
    }

    public function updateWhatsappJid(Request $request, int $member)
    {
        $currentTenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $target = TenantMember::query()
            ->where('tenant_id', $currentTenant->id)
            ->where('id', $member)
            ->firstOrFail();

        $this->authorize('update', [$target, $actor]);

        $payload = $request->validate([
            'whatsapp_jid' => [
                'nullable',
                'string',
                'max:60',
                Rule::unique('tenant_members', 'whatsapp_jid')
                    ->ignore($target->id)
                    ->where(fn ($query) => $query
                        ->where('tenant_id', $currentTenant->id)
                        ->whereNull('deleted_at')),
            ],
        ]);

        $target->update([
            'whatsapp_jid' => $this->normalizeJidOrNull($payload['whatsapp_jid'] ?? null),
        ]);

        return $this->ok([
            'member' => $target->only(['id', 'full_name', 'whatsapp_jid']),
        ]);
    }

    public function destroy(Request $request, int $member)
    {
        $request->validate([
            'row_version' => ['required', 'integer', 'min:1'],
        ]);

        $currentTenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $target = TenantMember::query()
            ->where('tenant_id', $currentTenant->id)
            ->where('id', $member)
            ->firstOrFail();

        $this->authorize('delete', [$target, $actor]);

        $deleted = DB::transaction(function () use ($request, $currentTenant, $actor, $target) {
            $affected = TenantMember::query()
                ->where('id', $target->id)
                ->where('tenant_id', $currentTenant->id)
                ->where('row_version', $request->integer('row_version'))
                ->update([
                    'deleted_at' => now()->utc(),
                    'row_version' => DB::raw('row_version + 1'),
                    'updated_at' => now()->utc(),
                ]);

            if ($affected === 0) {
                return null;
            }

            $this->clearUserRoleForTenant($currentTenant->id, $target->user_id);

            $fresh = TenantMember::query()->withTrashed()->findOrFail($target->id);

            ActivityLog::create([
                'tenant_id' => $currentTenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => $actor->id,
                'action' => 'tenant_member.deleted',
                'target_type' => 'tenant_members',
                'target_id' => (string) $fresh->id,
                'changes' => ['before' => $target->only(['full_name', 'role_code', 'profile_status'])],
                'metadata' => ['channel' => 'api'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => $target->row_version,
                'after_version' => $fresh->row_version,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $fresh;
        });

        if (!$deleted) {
            $server = TenantMember::query()->withTrashed()->findOrFail($target->id);
            return $this->error(
                'VERSION_CONFLICT',
                'Resource has been modified by another request.',
                [
                    'current_row_version' => $server->row_version,
                ],
                409
            );
        }

        return $this->ok(['deleted' => true]);
    }

    private function syncUserRoleForTenant(int $tenantId, TenantMember $member): void
    {
        if (!$member->user_id) {
            return;
        }

        $user = User::query()->find($member->user_id);
        if (!$user) {
            return;
        }

        /** @var PermissionRegistrar $permissionRegistrar */
        $permissionRegistrar = app(PermissionRegistrar::class);
        $permissionRegistrar->setPermissionsTeamId($tenantId);
        $user->syncRoles([$member->role_code]);
    }

    private function clearUserRoleForTenant(int $tenantId, ?int $userId): void
    {
        if (!$userId) {
            return;
        }

        $user = User::query()->find($userId);
        if (!$user) {
            return;
        }

        /** @var PermissionRegistrar $permissionRegistrar */
        $permissionRegistrar = app(PermissionRegistrar::class);
        $permissionRegistrar->setPermissionsTeamId($tenantId);
        $user->syncRoles([]);
    }

    private function normalizeJidOrNull(?string $input): ?string
    {
        if ($input === null || trim($input) === '') {
            return null;
        }

        $trimmed = trim($input);
        if (preg_match('/^\d{6,20}@(c|g|lid)\.us$/', $trimmed) === 1) {
            return $trimmed;
        }

        $digits = preg_replace('/\D+/', '', $trimmed) ?? '';
        if (strlen($digits) < 6 || strlen($digits) > 20) {
            throw ValidationException::withMessages([
                'whatsapp_jid' => ['Invalid WhatsApp JID format.'],
            ]);
        }

        return $digits.'@c.us';
    }

    private function mapMemberPayload(TenantMember $member): array
    {
        $member->loadMissing(['user:id,email,email_verified_at']);

        return [
            'id' => $member->id,
            'user_id' => $member->user_id,
            'full_name' => $member->full_name,
            'role_code' => $member->role_code,
            'profile_status' => $member->profile_status,
            'onboarding_status' => $member->onboarding_status,
            'account_status' => $member->user_id
                ? ($member->user?->email_verified_at ? 'verified' : 'unverified')
                : 'no_account',
            'user_email' => $member->user?->email,
            'whatsapp_jid' => $member->whatsapp_jid,
            'row_version' => $member->row_version,
        ];
    }
}
