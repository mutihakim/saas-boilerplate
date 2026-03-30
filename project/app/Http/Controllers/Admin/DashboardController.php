<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Support\SubscriptionEntitlements;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(SubscriptionEntitlements $entitlements): Response
    {
        $plans = $entitlements->availablePlans();
        $planBreakdown = [];
        foreach ($plans as $plan) {
            $planBreakdown[$plan] = Tenant::query()->where('plan_code', $plan)->count();
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'tenants_total' => Tenant::query()->count(),
                'tenants_active' => Tenant::query()->where('status', 'active')->count(),
                'superadmins_total' => User::query()->where('is_superadmin', true)->count(),
                'plan_breakdown' => $planBreakdown,
            ],
        ]);
    }
}

