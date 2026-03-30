<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Support\ApiResponder;
use App\Support\PermissionCatalog;
use App\Support\SubscriptionEntitlements;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class TenantRoleApiController extends Controller
{
    use ApiResponder;

    public function index(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $this->authorize('viewAny', Role::class);

        $roles = Role::query()
            ->with('permissions:id,name')
            ->where('tenant_id', $tenant->id)
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        $mapped = $roles->map(function (Role $role) use ($tenant) {
            $visiblePermissionSet = array_flip(PermissionCatalog::matrixPermissions());
            $memberUsers = DB::table('model_has_roles')
                ->join('users', 'users.id', '=', 'model_has_roles.model_id')
                ->join('tenant_members', function ($join) use ($tenant) {
                    $join->on('tenant_members.user_id', '=', 'users.id')
                        ->where('tenant_members.tenant_id', '=', $tenant->id)
                        ->whereNull('tenant_members.deleted_at')
                        ->where('tenant_members.profile_status', '=', 'active');
                })
                ->where('model_has_roles.role_id', $role->id)
                ->where('model_has_roles.model_type', 'App\\Models\\User')
                ->where('model_has_roles.tenant_id', $tenant->id)
                ->select('users.id', 'users.name', 'users.avatar_url')
                ->limit(5)
                ->get();

            $memberCount = DB::table('model_has_roles')
                ->join('tenant_members', function ($join) use ($tenant) {
                    $join->on('tenant_members.user_id', '=', 'model_has_roles.model_id')
                        ->where('tenant_members.tenant_id', '=', $tenant->id)
                        ->whereNull('tenant_members.deleted_at')
                        ->where('tenant_members.profile_status', '=', 'active');
                })
                ->where('model_has_roles.role_id', $role->id)
                ->where('model_has_roles.model_type', 'App\\Models\\User')
                ->where('model_has_roles.tenant_id', $tenant->id)
                ->distinct('model_has_roles.model_id')
                ->count('model_has_roles.model_id');

            return [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?: $role->name,
                'is_system' => (bool) $role->is_system,
                'row_version' => (int) $role->row_version,
                'permissions' => $role->permissions
                    ->pluck('name')
                    ->filter(fn (string $permission) => isset($visiblePermissionSet[$permission]))
                    ->values()
                    ->all(),
                'members_count' => $memberCount,
                'members_preview' => $memberUsers,
            ];
        })->values();

        return $this->ok([
            'roles' => $mapped,
            'permission_modules' => PermissionCatalog::matrixModules(),
        ]);
    }

    public function store(Request $request)
    {
        $tenant = $request->attributes->get('currentTenant');
        $this->authorize('create', Role::class);
        $subscription = app(SubscriptionEntitlements::class);

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:100', 'alpha_dash'],
            'display_name' => ['required', 'string', 'max:120'],
        ]);

        $exists = Role::query()
            ->where('tenant_id', $tenant->id)
            ->where('name', $payload['name'])
            ->exists();

        if ($exists) {
            return $this->error('VALIDATION_ERROR', 'Role name already exists.', [
                'fields' => ['name' => ['Role name already exists in this tenant.']],
            ], 422);
        }

        $currentCustomRoles = Role::query()
            ->where('tenant_id', $tenant->id)
            ->where('is_system', false)
            ->count();
        $maxCustomRoles = $subscription->limit($tenant, 'team.roles.custom.max');
        if ($maxCustomRoles !== null && $currentCustomRoles >= $maxCustomRoles) {
            return $this->error('PLAN_QUOTA_EXCEEDED', 'Custom role quota has been reached for current plan.', [
                'limit_key' => 'team.roles.custom.max',
                'limit_label' => $subscription->limitLabel('team.roles.custom.max'),
                'current_count' => $currentCustomRoles,
                'limit' => $maxCustomRoles,
                'plan_code' => $subscription->normalizePlan($tenant->plan_code),
            ], 422);
        }

        $role = Role::create([
            'tenant_id' => $tenant->id,
            'name' => $payload['name'],
            'display_name' => $payload['display_name'],
            'guard_name' => 'web',
            'is_system' => false,
            'row_version' => 1,
        ]);

        return $this->ok([
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'is_system' => (bool) $role->is_system,
                'row_version' => (int) $role->row_version,
                'permissions' => [],
                'members_count' => 0,
                'members_preview' => [],
            ],
        ], 201);
    }

    public function update(Request $request, int $role)
    {
        $tenant = $request->attributes->get('currentTenant');
        $target = Role::query()->where('tenant_id', $tenant->id)->findOrFail($role);
        $this->authorize('update', $target);

        if ($target->is_system) {
            return $this->error(
                'IMMUTABLE_SYSTEM_ROLE',
                'Default system role cannot be renamed.',
                [],
                422
            );
        }

        $payload = $request->validate([
            'display_name' => ['required', 'string', 'max:120'],
            'row_version' => ['required', 'integer', 'min:1'],
        ]);

        $updated = Role::query()
            ->where('id', $target->id)
            ->where('tenant_id', $tenant->id)
            ->where('row_version', $payload['row_version'])
            ->update([
                'display_name' => $payload['display_name'],
                'row_version' => DB::raw('row_version + 1'),
                'updated_at' => now()->utc(),
            ]);

        if ($updated === 0) {
            $fresh = Role::query()->findOrFail($target->id);
            return $this->error('VERSION_CONFLICT', 'Resource has been modified by another request.', [
                'current_row_version' => $fresh->row_version,
                'server_snapshot' => [
                    'id' => $fresh->id,
                    'display_name' => $fresh->display_name,
                ],
            ], 409);
        }

        return $this->ok([
            'role' => Role::query()->findOrFail($target->id),
        ]);
    }

    public function updatePermissions(Request $request, int $role)
    {
        $tenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');
        $target = Role::query()->where('tenant_id', $tenant->id)->findOrFail($role);
        $this->authorize('assignPermissions', $target);

        if ($target->is_system) {
            return $this->error(
                'IMMUTABLE_SYSTEM_ROLE',
                'Default system role permissions cannot be changed.',
                [],
                422
            );
        }

        $payload = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string'],
            'row_version' => ['required', 'integer', 'min:1'],
        ]);

        $permissions = collect($payload['permissions'] ?? [])
            ->filter(fn ($name) => in_array($name, PermissionCatalog::matrixPermissions(), true))
            ->values()
            ->all();

        $updated = DB::transaction(function () use ($tenant, $request, $actor, $target, $payload, $permissions) {
            $affected = Role::query()
                ->where('id', $target->id)
                ->where('tenant_id', $tenant->id)
                ->where('row_version', $payload['row_version'])
                ->update([
                    'row_version' => DB::raw('row_version + 1'),
                    'updated_at' => now()->utc(),
                ]);

            if ($affected === 0) {
                return null;
            }

            $target->syncPermissions($permissions);
            $fresh = Role::query()->findOrFail($target->id);

            ActivityLog::create([
                'tenant_id' => $tenant->id,
                'actor_user_id' => $request->user()->id,
                'actor_member_id' => $actor?->id,
                'action' => 'tenant_role.permissions_updated',
                'target_type' => 'roles',
                'target_id' => (string) $fresh->id,
                'changes' => ['permissions' => $permissions],
                'metadata' => ['channel' => 'api'],
                'request_id' => (string) $request->header('X-Request-Id', $request->fingerprint()),
                'occurred_at' => now()->utc(),
                'result_status' => 'success',
                'before_version' => $payload['row_version'],
                'after_version' => $fresh->row_version,
                'source_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $fresh;
        });

        if (!$updated) {
            $fresh = Role::query()->findOrFail($target->id);
            return $this->error('VERSION_CONFLICT', 'Resource has been modified by another request.', [
                'current_row_version' => $fresh->row_version,
            ], 409);
        }

        return $this->ok([
            'role' => $updated->load('permissions'),
        ]);
    }

    public function destroy(Request $request, int $role)
    {
        $tenant = $request->attributes->get('currentTenant');
        $target = Role::query()->where('tenant_id', $tenant->id)->findOrFail($role);
        $this->authorize('delete', $target);

        $target->delete();

        return $this->ok(['deleted' => true]);
    }
}
