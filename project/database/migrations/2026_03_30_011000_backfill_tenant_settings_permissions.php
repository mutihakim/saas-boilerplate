<?php

use App\Support\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        foreach (PermissionCatalog::all() as $permissionName) {
            Permission::query()->firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        $ownerRoles = Role::query()->whereIn('name', ['owner', 'tenant_owner'])->get();
        foreach ($ownerRoles as $role) {
            $role->givePermissionTo(['tenant.settings.view', 'tenant.settings.manage']);
        }

        $adminRoles = Role::query()->whereIn('name', ['admin', 'tenant_admin'])->get();
        foreach ($adminRoles as $role) {
            $role->givePermissionTo(['tenant.settings.view', 'tenant.settings.manage']);
        }
    }

    public function down(): void
    {
        $roles = Role::query()->whereIn('name', ['owner', 'tenant_owner', 'admin', 'tenant_admin'])->get();
        foreach ($roles as $role) {
            $role->revokePermissionTo('tenant.settings.manage');
            $role->revokePermissionTo('tenant.settings.view');
        }

        Permission::query()->whereIn('name', ['tenant.settings.view', 'tenant.settings.manage'])->delete();
    }
};
