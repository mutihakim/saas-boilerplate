<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantMember;
use Inertia\Inertia;
use Inertia\Response;

class TenantDirectoryController extends Controller
{
    public function __invoke(): Response
    {
        $tenants = Tenant::query()
            ->with('owner:id,name,email')
            ->orderBy('name')
            ->get()
            ->map(function (Tenant $tenant) {
                $adminCandidate = TenantMember::query()
                    ->where('tenant_id', $tenant->id)
                    ->whereIn('role_code', ['admin', 'tenant_admin'])
                    ->whereNotNull('user_id')
                    ->whereNull('deleted_at')
                    ->where('profile_status', 'active')
                    ->orderBy('id')
                    ->first();

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'status' => $tenant->status,
                    'plan_code' => $tenant->plan_code,
                    'owner' => $tenant->owner ? [
                        'id' => $tenant->owner->id,
                        'name' => $tenant->owner->name,
                        'email' => $tenant->owner->email,
                    ] : null,
                    'admin_candidate_user_id' => $adminCandidate?->user_id,
                ];
            })
            ->values();

        return Inertia::render('Admin/Tenants', [
            'tenants' => $tenants,
        ]);
    }
}

