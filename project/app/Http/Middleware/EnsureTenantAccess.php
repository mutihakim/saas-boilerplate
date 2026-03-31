<?php

namespace App\Http\Middleware;

use App\Models\TenantMember;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $request->attributes->get('currentTenant') ?? tenant();
        $user = $request->user();

        if (!$tenant || !$user) {
            abort(404);
        }

        if ($tenant->status !== 'active' && !$user->is_superadmin) {
            abort(404);
        }

        $request->attributes->set('currentTenant', $tenant);
        app()->instance('currentTenant', $tenant);

        if (!empty($tenant->locale)) {
            \Illuminate\Support\Facades\App::setLocale($tenant->locale);
        }

        $member = TenantMember::query()
            ->where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)
            ->where('profile_status', 'active')
            ->whereNull('deleted_at')
            ->first();

        if (!$member && !$user->is_superadmin) {
            abort(404);
        }

        if (!$member && $user->is_superadmin) {
            $member = new TenantMember([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'full_name' => $user->name,
                'role_code' => 'owner',
                'profile_status' => 'active',
                'row_version' => 1,
            ]);
        }

        $request->attributes->set('currentTenantMember', $member);
        app()->instance('currentTenantMember', $member);

        return $next($request);
    }
}
