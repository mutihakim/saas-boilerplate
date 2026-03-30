<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class SetPermissionTeamContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $request->attributes->get('currentTenant') ?? tenant();

        if ($tenant) {
            app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->id);
        }

        return $next($request);
    }
}
