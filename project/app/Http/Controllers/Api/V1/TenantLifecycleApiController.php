<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Tenant;
use App\Models\TenantInvitation;
use App\Models\TenantMember;
use App\Models\User;
use App\Services\TenantProvisioningService;
use App\Support\ApiResponder;
use App\Support\SubscriptionEntitlements;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class TenantLifecycleApiController extends Controller
{
    use ApiResponder;

    public function createTenant(Request $request, TenantProvisioningService $provisioningService)
    {
        $this->ensureSuperadmin($request);

        $payload = $request->validate([
            'owner_user_id' => ['required', 'integer', 'exists:users,id'],
            'workspace_name' => ['nullable', 'string', 'max:120'],
        ]);

        $owner = User::query()->findOrFail($payload['owner_user_id']);
        $tenant = $provisioningService->provisionDefaultWorkspaceForUser($owner, $payload['workspace_name'] ?? null);

        return $this->ok([
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'status' => $tenant->status,
            ],
        ], 201);
    }

    public function invitationsIndex(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $this->ensureTenantInvitationView($request);

        $invitations = TenantInvitation::query()
            ->where('tenant_id', $tenant->id)
            ->orderByDesc('id')
            ->get(['id', 'member_id', 'email', 'full_name', 'role_code', 'note', 'status', 'token', 'expires_at', 'created_at'])
            ->map(function (TenantInvitation $invitation) {
                return [
                    'id' => $invitation->id,
                    'member_id' => $invitation->member_id,
                    'email' => $invitation->email,
                    'full_name' => $invitation->full_name,
                    'role_code' => $invitation->role_code,
                    'note' => $invitation->note,
                    'status' => $invitation->status,
                    'expires_at' => $invitation->expires_at,
                    'created_at' => $invitation->created_at,
                    'invite_url' => url("/invitations/accept/{$invitation->token}"),
                ];
            })
            ->values();

        return $this->ok(['invitations' => $invitations]);
    }

    public function invitationsStore(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $this->ensureTenantAdmin($request);
        $subscription = app(SubscriptionEntitlements::class);

        $payload = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'full_name' => ['required', 'string', 'max:255'],
            'role_code' => [
                'required',
                'string',
                'max:50',
                Rule::exists('roles', 'name')->where(fn ($query) => $query->where('tenant_id', $tenant->id)),
                Rule::notIn(['owner', 'tenant_owner']),
            ],
            'member_id' => [
                'nullable',
                'integer',
                Rule::exists('tenant_members', 'id')
                    ->where(fn ($query) => $query->where('tenant_id', $tenant->id)->whereNull('deleted_at')),
            ],
            'note' => ['nullable', 'string', 'max:500'],
            'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:30'],
        ]);

        $email = Str::lower($payload['email']);

        $violation = $this->resolveInvitationCreationViolation($tenant, $email, $payload['member_id'] ?? null);
        if ($violation) {
            return $this->error($violation['code'], $violation['message'], $violation['details'], 422);
        }

        $pendingCount = TenantInvitation::query()
            ->where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->count();
        $pendingLimit = $subscription->limit($tenant, 'team.invitations.pending.max');
        if ($pendingLimit !== null && $pendingCount >= $pendingLimit) {
            return $this->error('PLAN_QUOTA_EXCEEDED', 'Pending invitation quota has been reached for current plan.', [
                'limit_key' => 'team.invitations.pending.max',
                'limit_label' => $subscription->limitLabel('team.invitations.pending.max'),
                'current_count' => $pendingCount,
                'limit' => $pendingLimit,
                'plan_code' => $subscription->normalizePlan($tenant->plan_code),
            ], 422);
        }

        $invitation = DB::transaction(function () use ($request, $tenant, $actor, $payload, $email) {
            $member = $this->resolveMemberForInvitation(
                tenant: $tenant,
                memberId: $payload['member_id'] ?? null,
                email: $email,
                fullName: $payload['full_name'],
                roleCode: $payload['role_code']
            );

            $invitation = TenantInvitation::query()->create([
                'tenant_id' => $tenant->id,
                'invited_by_user_id' => $request->user()->id,
                'member_id' => $member->id,
                'email' => $email,
                'full_name' => $payload['full_name'],
                'role_code' => $payload['role_code'],
                'note' => $payload['note'] ?? null,
                'status' => 'pending',
                'token' => Str::random(64),
                'expires_at' => now()->utc()->addDays($payload['expires_in_days'] ?? 7),
            ]);

            $member->update([
                'full_name' => $payload['full_name'],
                'role_code' => $payload['role_code'],
                'profile_status' => 'active',
                'onboarding_status' => 'invitation_pending',
                'row_version' => $member->row_version + 1,
            ]);

            ActivityLog::create([
                'tenant_id' => $tenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => $actor?->id,
                'action' => 'tenant_invitation.created',
                'target_type' => 'tenant_invitations',
                'target_id' => (string) $invitation->id,
                'changes' => ['after' => $invitation->only(['member_id', 'email', 'full_name', 'role_code', 'note', 'status'])],
                'metadata' => ['channel' => 'api'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => null,
                'after_version' => null,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $invitation->fresh();
        });

        return $this->ok([
            'invitation' => [
                'id' => $invitation->id,
                'member_id' => $invitation->member_id,
                'email' => $invitation->email,
                'full_name' => $invitation->full_name,
                'role_code' => $invitation->role_code,
                'note' => $invitation->note,
                'status' => $invitation->status,
                'expires_at' => $invitation->expires_at,
            ],
            'invite_url' => url("/invitations/accept/{$invitation->token}"),
        ], 201);
    }

    public function invitationsRevoke(Request $request, int $invitation)
    {
        $tenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $this->ensureTenantAdmin($request);

        $target = TenantInvitation::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $invitation)
            ->firstOrFail();

        DB::transaction(function () use ($request, $tenant, $actor, $target) {
            $target->update(['status' => 'revoked']);
            $this->syncMemberOnboardingStatus($target->member_id);

            ActivityLog::create([
                'tenant_id' => $tenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => $actor?->id,
                'action' => 'tenant_invitation.revoked',
                'target_type' => 'tenant_invitations',
                'target_id' => (string) $target->id,
                'changes' => ['after' => ['status' => 'revoked']],
                'metadata' => ['channel' => 'api'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => null,
                'after_version' => null,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return $this->ok(['revoked' => true]);
    }

    public function invitationsResend(Request $request, int $invitation)
    {
        $tenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $this->ensureTenantAdmin($request);

        $target = TenantInvitation::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $invitation)
            ->firstOrFail();

        if ($target->status !== 'pending') {
            return $this->error('INVITATION_NOT_PENDING', 'Only pending invitation can be resent.', [], 422);
        }

        DB::transaction(function () use ($request, $tenant, $actor, $target) {
            $target->update([
                'token' => Str::random(64),
                'expires_at' => now()->utc()->addDays(7),
            ]);

            if ($target->member_id) {
                TenantMember::query()
                    ->where('tenant_id', $tenant->id)
                    ->where('id', $target->member_id)
                    ->update([
                        'onboarding_status' => 'invitation_pending',
                        'updated_at' => now()->utc(),
                    ]);
            }

            ActivityLog::create([
                'tenant_id' => $tenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => $actor?->id,
                'action' => 'tenant_invitation.resent',
                'target_type' => 'tenant_invitations',
                'target_id' => (string) $target->id,
                'changes' => ['after' => ['expires_at' => $target->expires_at]],
                'metadata' => ['channel' => 'api'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => null,
                'after_version' => null,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return $this->ok([
            'resent' => true,
            'invite_url' => url("/invitations/accept/{$target->fresh()->token}"),
        ]);
    }

    public function invitationsAccept(Request $request)
    {
        $payload = $request->validate([
            'token' => ['required', 'string'],
            'action' => ['nullable', 'in:accept,reject'],
            'name' => ['nullable', 'string', 'max:255'],
            'password' => ['required_if:action,accept', 'nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $action = $payload['action'] ?? 'accept';

        $invitation = TenantInvitation::query()
            ->where('token', $payload['token'])
            ->first();

        if (!$invitation) {
            return $this->error('INVITATION_INVALID', 'Invitation token is invalid.', [], 422);
        }

        if ($invitation->status !== 'pending') {
            return $this->error('INVITATION_ALREADY_PROCESSED', 'Invitation has already been processed.', [
                'status' => $invitation->status,
            ], 422);
        }

        if ($invitation->expires_at->isPast()) {
            return $this->error('INVITATION_EXPIRED', 'Invitation has expired.', [], 422);
        }

        $tenant = Tenant::query()->findOrFail($invitation->tenant_id);

        if ($action === 'reject') {
            $invitation->update(['status' => 'rejected']);
            $this->syncMemberOnboardingStatus($invitation->member_id);
            return $this->ok(['accepted' => false, 'rejected' => true]);
        }

        if (in_array($invitation->role_code, ['owner', 'tenant_owner'], true)) {
            return $this->error('INVITATION_ROLE_NOT_ALLOWED', 'Invitation role is not allowed for onboarding.', [], 422);
        }

        $email = Str::lower($invitation->email);
        $name = trim((string) ($payload['name'] ?? $invitation->full_name ?? ''));
        $password = (string) $payload['password'];

        try {
            $user = DB::transaction(function () use ($request, $tenant, $invitation, $email, $name, $password) {
                $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

                if ($user) {
                    $existingOtherTenant = TenantMember::query()
                        ->where('user_id', $user->id)
                        ->whereNull('deleted_at')
                        ->where('tenant_id', '!=', $tenant->id)
                        ->exists();

                    if ($existingOtherTenant && !$user->is_superadmin) {
                        throw ValidationException::withMessages([
                            'token' => ['User already belongs to a different tenant.'],
                        ]);
                    }

                    $user->update([
                        'name' => $name !== '' ? $name : $user->name,
                        'password' => Hash::make($password),
                        'email_verified_at' => $user->email_verified_at ?? now()->utc(),
                    ]);
                } else {
                    $user = User::query()->create([
                        'name' => $name !== '' ? $name : (string) Str::of($email)->before('@')->replace('.', ' ')->title(),
                        'email' => $email,
                        'password' => Hash::make($password),
                        'email_verified_at' => now()->utc(),
                        'is_superadmin' => false,
                    ]);
                }

                $member = null;
                if ($invitation->member_id) {
                    $member = TenantMember::query()
                        ->where('tenant_id', $tenant->id)
                        ->where('id', $invitation->member_id)
                        ->first();
                }

                if (!$member) {
                    $member = TenantMember::query()
                        ->where('tenant_id', $tenant->id)
                        ->where('user_id', $user->id)
                        ->first();
                }

                if ($member) {
                    $member->update([
                        'user_id' => $user->id,
                        'full_name' => $name !== '' ? $name : $member->full_name,
                        'role_code' => $invitation->role_code,
                        'profile_status' => 'active',
                        'onboarding_status' => 'account_active',
                        'row_version' => $member->row_version + 1,
                    ]);
                    $member->refresh();
                } else {
                    $member = TenantMember::query()->create([
                        'tenant_id' => $tenant->id,
                        'user_id' => $user->id,
                        'full_name' => $name !== '' ? $name : $user->name,
                        'role_code' => $invitation->role_code,
                        'profile_status' => 'active',
                        'onboarding_status' => 'account_active',
                        'row_version' => 1,
                    ]);
                }

                $role = Role::query()
                    ->where('tenant_id', $tenant->id)
                    ->where('name', $invitation->role_code)
                    ->first();

                if ($role) {
                    /** @var PermissionRegistrar $permissionRegistrar */
                    $permissionRegistrar = app(PermissionRegistrar::class);
                    $permissionRegistrar->setPermissionsTeamId($tenant->id);
                    $user->syncRoles([$role->name]);
                }

                $invitation->update([
                    'status' => 'accepted',
                    'member_id' => $member->id,
                ]);

                ActivityLog::create([
                    'tenant_id' => $tenant->id,
                    'actor_user_id' => $user->id,
                    'actor_member_id' => $member->id,
                    'action' => 'tenant_invitation.accepted',
                    'target_type' => 'tenant_invitations',
                    'target_id' => (string) $invitation->id,
                    'changes' => ['after' => ['status' => 'accepted', 'member_id' => $member->id]],
                    'metadata' => ['channel' => 'api'],
                    'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                    'occurred_at' => now()->utc(),
                    'result_status' => 'success',
                    'before_version' => null,
                    'after_version' => null,
                    'source_ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return $user;
            });
        } catch (ValidationException $exception) {
            return $this->error('INVITATION_EMAIL_CONFLICT', 'Invitation email already linked to different tenant membership.', [
                'fields' => $exception->errors(),
            ], 422);
        }

        Auth::guard('web')->login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return $this->ok(['accepted' => true, 'tenant_slug' => $tenant->slug]);
    }

    public function suspendTenant(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $this->ensureSuperadmin($request);

        $tenant->update(['status' => 'suspended']);

        return $this->ok(['status' => 'suspended']);
    }

    public function restoreTenant(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $this->ensureSuperadmin($request);

        $tenant->update(['status' => 'active']);

        return $this->ok(['status' => 'active']);
    }

    private function resolveMemberForInvitation(Tenant $tenant, ?int $memberId, string $email, string $fullName, string $roleCode): TenantMember
    {
        if ($memberId) {
            $member = TenantMember::query()
                ->where('tenant_id', $tenant->id)
                ->whereNull('deleted_at')
                ->where('id', $memberId)
                ->firstOrFail();

            if ($member->user_id) {
                throw ValidationException::withMessages([
                    'member_id' => ['Member already has active account and cannot be invited again.'],
                ]);
            }

            $member->update([
                // Invitation flow keeps account link empty until token acceptance.
                'user_id' => null,
                'full_name' => $fullName,
                'role_code' => $roleCode,
                'profile_status' => 'active',
            ]);

            return $member;
        }

        $member = null;
        $linkedFromInvitation = TenantInvitation::query()
            ->where('tenant_id', $tenant->id)
            ->where('email', $email)
            ->whereNotNull('member_id')
            ->orderByDesc('id')
            ->first();

        if ($linkedFromInvitation?->member_id) {
            $member = TenantMember::query()
                ->where('tenant_id', $tenant->id)
                ->whereNull('deleted_at')
                ->where('id', $linkedFromInvitation->member_id)
                ->first();
        }

        if ($member) {
            if ($member->user_id) {
                throw ValidationException::withMessages([
                    'email' => ['User already has active account in this tenant.'],
                ]);
            }

            $member->update([
                // Invitation flow keeps account link empty until token acceptance.
                'user_id' => null,
                'full_name' => $fullName,
                'role_code' => $roleCode,
                'profile_status' => 'active',
            ]);

            return $member;
        }

        return TenantMember::query()->create([
            'tenant_id' => $tenant->id,
            // Keep unlinked until invitation is accepted to avoid soft-delete uniqueness collisions.
            'user_id' => null,
            'full_name' => $fullName,
            'role_code' => $roleCode,
            'profile_status' => 'active',
            'onboarding_status' => 'no_account',
            'row_version' => 1,
        ]);
    }

    private function resolveInvitationCreationViolation(Tenant $tenant, string $email, ?int $memberId): ?array
    {
        if (User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            return [
                'code' => 'INVITATION_EMAIL_ALREADY_REGISTERED',
                'message' => 'Invitation email is already registered as active account.',
                'details' => [
                    'fields' => [
                        'email' => ['Email is already registered as active account.'],
                    ],
                ],
            ];
        }

        if ($memberId) {
            $targetMember = TenantMember::query()
                ->where('tenant_id', $tenant->id)
                ->whereNull('deleted_at')
                ->where('id', $memberId)
                ->first();

            if ($targetMember?->user_id) {
                return [
                    'code' => 'INVITATION_MEMBER_ALREADY_ACTIVE',
                    'message' => 'Selected member already has active account.',
                    'details' => [
                        'fields' => [
                            'member_id' => ['Member already has active account and cannot be invited again.'],
                        ],
                    ],
                ];
            }
        }

        $existingPendingInvitation = TenantInvitation::query()
            ->where('tenant_id', $tenant->id)
            ->where('email', $email)
            ->where('status', 'pending')
            ->first();
        if ($existingPendingInvitation) {
            return [
                'code' => 'INVITATION_ALREADY_PENDING',
                'message' => 'Pending invitation already exists for this email.',
                'details' => [
                    'invitation_id' => $existingPendingInvitation->id,
                    'fields' => [
                        'email' => ['Pending invitation already exists for this email.'],
                    ],
                ],
            ];
        }

        return null;
    }

    private function syncMemberOnboardingStatus(?int $memberId): void
    {
        if (!$memberId) {
            return;
        }

        $member = TenantMember::query()->find($memberId);
        if (!$member) {
            return;
        }

        if ($member->user_id) {
            $member->update(['onboarding_status' => 'account_active']);
            return;
        }

        $hasPending = TenantInvitation::query()
            ->where('member_id', $member->id)
            ->where('status', 'pending')
            ->exists();

        $member->update([
            'onboarding_status' => $hasPending ? 'invitation_pending' : 'no_account',
        ]);
    }

    private function ensureTenantAdmin(Request $request): void
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');
        if ($user?->is_superadmin) {
            return;
        }

        if ($user && ($user->can('team.members.update') || $user->can('team.roles.update') || $user->can('team.invitations.update') || $user->can('team.invitations.create'))) {
            return;
        }

        if (!in_array($member?->role_code, ['owner', 'admin'], true)) {
            abort(403);
        }
    }

    private function ensureTenantInvitationView(Request $request): void
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');

        if ($user?->is_superadmin) {
            return;
        }

        if ($user && ($user->can('team.invitations.view') || $user->can('team.invitations.update') || $user->can('team.invitations.create'))) {
            return;
        }

        if (!in_array($member?->role_code, ['owner', 'admin'], true)) {
            abort(403);
        }
    }

    private function ensureSuperadmin(Request $request): void
    {
        abort_unless($request->user()?->is_superadmin, 403);
    }
}
