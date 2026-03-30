<?php

namespace App\Policies;

use App\Models\TenantMember;
use App\Models\User;

class TenantMemberPolicy
{
    public function viewAny(User $user, TenantMember $actor): bool
    {
        return $this->allow($user, $actor, ['team.members.view', 'tenant_members.view'], TenantMember::ROLES);
    }

    public function create(User $user, TenantMember $actor): bool
    {
        return $this->allow($user, $actor, ['team.members.create', 'tenant_members.create'], ['owner', 'admin', 'tenant_owner', 'tenant_admin']);
    }

    public function update(User $user, TenantMember $target, TenantMember $actor): bool
    {
        if (in_array($target->role_code, ['owner', 'tenant_owner'], true) && !in_array($actor->role_code, ['owner', 'tenant_owner'], true)) {
            return false;
        }

        return $this->allow($user, $actor, ['team.members.update', 'tenant_members.update'], ['owner', 'admin', 'operator', 'tenant_owner', 'tenant_admin', 'tenant_operator']);
    }

    public function delete(User $user, TenantMember $target, TenantMember $actor): bool
    {
        if (in_array($target->role_code, ['owner', 'tenant_owner'], true)) {
            return false;
        }

        return $this->allow($user, $actor, ['team.members.delete', 'tenant_members.delete'], ['owner', 'admin', 'tenant_owner', 'tenant_admin']);
    }

    private function allow(User $user, TenantMember $actor, array $permissions, array $legacyRoles): bool
    {
        if ($user->is_superadmin) {
            return true;
        }

        foreach ($permissions as $permission) {
            if ($user->can($permission)) {
                return true;
            }
        }

        return in_array($actor->role_code, $legacyRoles, true);
    }
}
