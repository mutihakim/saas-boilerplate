<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class TenantRolePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->allow($user, ['team.roles.view'], ['owner', 'admin', 'tenant_owner', 'tenant_admin']);
    }

    public function create(User $user): bool
    {
        return $this->allow($user, ['team.roles.create'], ['owner', 'admin', 'tenant_owner', 'tenant_admin']);
    }

    public function update(User $user, Role $role): bool
    {
        if ($role->is_system && $role->name === 'owner') {
            return false;
        }

        return $this->allow($user, ['team.roles.update'], ['owner', 'admin', 'tenant_owner', 'tenant_admin']);
    }

    public function delete(User $user, Role $role): bool
    {
        if ($role->is_system) {
            return false;
        }

        return $this->allow($user, ['team.roles.delete'], ['owner', 'admin', 'tenant_owner', 'tenant_admin']);
    }

    public function assignPermissions(User $user, Role $role): bool
    {
        if ($role->is_system && $role->name === 'owner') {
            return false;
        }

        return $this->allow($user, ['team.role_permissions.assign'], ['owner', 'admin', 'tenant_owner', 'tenant_admin']);
    }

    private function allow(User $user, array $permissions, array $roleFallback = []): bool
    {
        if ($user->is_superadmin) {
            return true;
        }

        if (!empty($roleFallback)) {
            $member = app()->bound('currentTenantMember') ? app('currentTenantMember') : null;
            $roleCode = $member?->role_code;
            if ($roleCode && in_array($roleCode, $roleFallback, true)) {
                return true;
            }
        }

        foreach ($permissions as $permission) {
            if ($user->can($permission)) {
                return true;
            }
        }

        return false;
    }
}
