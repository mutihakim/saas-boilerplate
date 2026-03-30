<?php

namespace App\Http\Middleware;

use App\Support\ApiResponder;
use App\Support\SubscriptionEntitlements;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantFeatureEnabled
{
    use ApiResponder;

    public function __construct(private readonly SubscriptionEntitlements $entitlements)
    {
    }

    public function handle(Request $request, Closure $next, string $module, string $action = 'view'): Response
    {
        $tenant = $request->attributes->get('currentTenant') ?? tenant();

        if (!$tenant) {
            abort(404);
        }

        if ($this->entitlements->has($tenant, $module, $action)) {
            return $next($request);
        }

        $details = [
            'module' => $module,
            'module_label' => $this->entitlements->moduleLabel($module),
            'action' => $action,
            'plan_code' => $this->entitlements->normalizePlan($tenant->plan_code),
        ];

        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->error('FEATURE_NOT_AVAILABLE', '', $details, 403);
        }

        return redirect()->route('tenant.upgrade.required', [
            'tenant' => $tenant->slug,
            'module' => $module,
        ]);
    }
}
