<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $routeTenant = $request->route('tenant');

        $tenant = $routeTenant instanceof Tenant
            ? $routeTenant
            : Tenant::query()->where('slug', (string) $routeTenant)->firstOrFail();

        $request->attributes->set('currentTenant', $tenant);
        app()->instance('currentTenant', $tenant);

        return $next($request);
    }
}
