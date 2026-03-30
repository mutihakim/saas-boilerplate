<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantMember;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class TenantProvisioningService
{
    public function provisionDefaultWorkspaceForUser(User $user, ?string $workspaceName = null): Tenant
    {
        return DB::transaction(function () use ($user, $workspaceName) {
            $slugBase = str($workspaceName ?: $user->name)->slug()->value();
            if ($slugBase === '') {
                $slugBase = 'tenant';
            }

            $slug = $this->uniqueTenantSlug($slugBase);
            $tenant = Tenant::create([
                'owner_user_id' => $user->id,
                'name' => ($workspaceName ?: $user->name) . ' Workspace',
                'slug' => $slug,
                'locale' => 'id',
                'timezone' => 'Asia/Jakarta',
                'plan_code' => 'free',
                'status' => 'active',
            ]);

            TenantMember::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'full_name' => $user->name,
                'role_code' => 'owner',
                'profile_status' => 'active',
                'onboarding_status' => 'account_active',
                'row_version' => 1,
            ]);

            /** @var PermissionRegistrar $permissionRegistrar */
            $permissionRegistrar = app(PermissionRegistrar::class);
            $permissionRegistrar->setPermissionsTeamId($tenant->id);

            foreach (PermissionCatalog::all() as $permissionName) {
                Permission::query()->firstOrCreate([
                    'name' => $permissionName,
                    'guard_name' => 'web',
                ]);
            }

            $ownerPermissions = PermissionCatalog::matrixPermissions();
            $adminPermissions = collect(PermissionCatalog::matrixPermissions())
                ->filter(fn (string $permission) => str_ends_with($permission, '.create') || str_ends_with($permission, '.view') || str_ends_with($permission, '.update') || str_ends_with($permission, '.manage'))
                ->reject(fn (string $permission) => str_starts_with($permission, 'whatsapp.settings.'))
                ->values()
                ->all();
            $memberPermissions = collect(PermissionCatalog::matrixPermissions())
                ->filter(fn (string $permission) => str_ends_with($permission, '.view'))
                ->reject(fn (string $permission) => str_starts_with($permission, 'whatsapp.settings.'))
                ->reject(fn (string $permission) => str_starts_with($permission, 'tenant.settings.'))
                ->values()
                ->all();

            $ownerRole = Role::query()->firstOrCreate([
                'name' => 'owner',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
            ], [
                'display_name' => 'Owner',
                'is_system' => true,
                'row_version' => 1,
            ]);

            $adminRole = Role::query()->firstOrCreate([
                'name' => 'admin',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
            ], [
                'display_name' => 'Admin',
                'is_system' => true,
                'row_version' => 1,
            ]);

            $memberRole = Role::query()->firstOrCreate([
                'name' => 'member',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
            ], [
                'display_name' => 'Member',
                'is_system' => true,
                'row_version' => 1,
            ]);

            $ownerRole->syncPermissions($ownerPermissions);
            $adminRole->syncPermissions($adminPermissions);
            $memberRole->syncPermissions($memberPermissions);

            $user->syncRoles(['owner']);

            return $tenant;
        });
    }

    private function uniqueTenantSlug(string $base): string
    {
        $slug = $base;
        $suffix = 1;
        while (Tenant::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
