<?php

namespace App\Support;

class PermissionCatalog
{
    public static function matrixPermissions(): array
    {
        $permissions = [];
        $modules = config('permission_modules', []);

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $permissions[] = "{$module}.{$action}";
            }
        }

        return $permissions;
    }

    public static function all(): array
    {
        return array_merge(
            self::matrixPermissions(),
            // Legacy aliases kept for compatibility with existing checks.
            [
                'tenant_members.view',
                'tenant_members.create',
                'tenant_members.update',
                'tenant_members.delete',
            ]
        );
    }

    public static function matrixModules(): array
    {
        $modules = [];
        $order = ['create', 'view', 'update', 'delete', 'assign'];

        foreach (config('permission_modules', []) as $module => $actions) {
            $modules[$module] = array_values(array_unique($actions));
        }

        foreach ($modules as $module => $actions) {
            usort($actions, function (string $a, string $b) use ($order): int {
                $aIdx = array_search($a, $order, true);
                $bIdx = array_search($b, $order, true);
                $aIdx = $aIdx === false ? 999 : $aIdx;
                $bIdx = $bIdx === false ? 999 : $bIdx;
                return $aIdx <=> $bIdx;
            });
            $modules[$module] = $actions;
        }

        ksort($modules);

        return $modules;
    }
}
