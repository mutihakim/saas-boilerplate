<?php

namespace App\Support;

use App\Models\Tenant;
use RuntimeException;

class SubscriptionEntitlements
{
    public function allModules(): array
    {
        return array_keys((array) config('subscription_entitlements.module_labels', []));
    }

    public function moduleLabel(string $module): string
    {
        return (string) (config("subscription_entitlements.module_labels.{$module}") ?? $module);
    }

    public function limitLabel(string $limitKey): string
    {
        return (string) (config("subscription_entitlements.limit_labels.{$limitKey}") ?? $limitKey);
    }

    public function availablePlans(): array
    {
        return array_keys((array) config('subscription_entitlements.plans', []));
    }

    public function normalizePlan(?string $planCode): string
    {
        $default = (string) config('subscription_entitlements.default_plan', 'free');
        $plans = (array) config('subscription_entitlements.plans', []);

        if (!$planCode || !array_key_exists($planCode, $plans)) {
            return $default;
        }

        return $planCode;
    }

    public function can(Tenant $tenant, string $module, string $action = 'view'): bool
    {
        $plan = $this->normalizePlan($tenant->plan_code);
        $plans = (array) config('subscription_entitlements.plans', []);
        $definition = $plans[$plan]['features'][$module] ?? [];

        if (is_bool($definition)) {
            return $definition;
        }

        if (!is_array($definition)) {
            return false;
        }

        if (in_array('*', $definition, true)) {
            return true;
        }

        return in_array($action, $definition, true);
    }

    public function has(Tenant $tenant, string $module, string $action = 'view'): bool
    {
        return $this->can($tenant, $module, $action);
    }

    public function limit(Tenant $tenant, string $limitKey): ?int
    {
        $plan = $this->normalizePlan($tenant->plan_code);
        $plans = (array) config('subscription_entitlements.plans', []);
        $value = $plans[$plan]['limits'][$limitKey] ?? null;

        if ($value === null) {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    public function assertCan(Tenant $tenant, string $module, string $action = 'view'): void
    {
        if ($this->can($tenant, $module, $action)) {
            return;
        }

        throw new RuntimeException('FEATURE_NOT_AVAILABLE');
    }

    public function assertUnderLimit(Tenant $tenant, string $limitKey, int $currentCount): void
    {
        $limit = $this->limit($tenant, $limitKey);
        if ($limit === null) {
            return;
        }

        if ($currentCount >= $limit) {
            throw new RuntimeException('PLAN_QUOTA_EXCEEDED');
        }
    }

    public function moduleMapForTenant(Tenant $tenant): array
    {
        $map = [];
        foreach ($this->allModules() as $module) {
            $map[$module] = $this->can($tenant, $module, 'view');
        }

        return $map;
    }

    public function limitsForTenant(Tenant $tenant): array
    {
        $plan = $this->normalizePlan($tenant->plan_code);
        $plans = (array) config('subscription_entitlements.plans', []);

        return (array) ($plans[$plan]['limits'] ?? []);
    }
}

