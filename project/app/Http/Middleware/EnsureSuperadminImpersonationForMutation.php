<?php

namespace App\Http\Middleware;

use App\Support\ApiResponder;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperadminImpersonationForMutation
{
    use ApiResponder;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $isMutation = in_array(strtoupper($request->method()), ['POST', 'PUT', 'PATCH', 'DELETE'], true);

        if (!$isMutation || !$user?->is_superadmin) {
            return $next($request);
        }

        if ($request->hasSession() && $request->session()->has('impersonator_id')) {
            return $next($request);
        }

        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->error('SUPERADMIN_IMPERSONATION_REQUIRED', '', [], 403);
        }

        $tenant = $request->attributes->get('currentTenant') ?? tenant();
        if ($tenant) {
            return redirect()->route('admin.tenants.index')
                ->with('status', 'Start impersonation before mutating tenant data.');
        }

        return redirect()->route('admin.tenants.index');
    }
}
