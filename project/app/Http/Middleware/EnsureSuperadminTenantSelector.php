<?php

namespace App\Http\Middleware;

use App\Models\TenantMember;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperadminTenantSelector
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        if ($user->is_superadmin) {
            return $next($request);
        }

        $membership = TenantMember::query()
            ->with('tenant:id,slug')
            ->where('user_id', $user->id)
            ->where('profile_status', 'active')
            ->whereNull('deleted_at')
            ->first();

        if (!$membership || !$membership->tenant) {
            return redirect()->route('tenant.access.required');
        }

        return redirect()->route('tenant.dashboard', ['tenant' => $membership->tenant->slug]);
    }
}