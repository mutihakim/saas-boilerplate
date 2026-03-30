<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Models\TenantMember;
use App\Support\SubscriptionEntitlements;
use App\Support\TenantBranding;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\Permission\PermissionRegistrar;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $entitlementService = app(SubscriptionEntitlements::class);
        $isAdminArea = $request->is('admin') || $request->is('admin/*');
        $tenant = $request->attributes->get('currentTenant');
        $user = $request->user();

        if (!$isAdminArea && !$tenant && $request->route('tenant')) {
            $routeTenant = $request->route('tenant');
            $tenant = $routeTenant instanceof Tenant
                ? $routeTenant
                : Tenant::query()->where('slug', (string) $routeTenant)->first();
        }

        // Fallback tenant context for non-/t routes (e.g. /profile) so the shared logged-in shell stays consistent.
        if (!$isAdminArea && !$tenant && $user) {
            $sessionTenantId = $request->session()->get('active_tenant_id');
            if ($sessionTenantId) {
                $tenant = Tenant::query()->find($sessionTenantId);
            }

            if (!$tenant && !$user->is_superadmin) {
                $tenant = Tenant::query()
                    ->join('tenant_members', 'tenant_members.tenant_id', '=', 'tenants.id')
                    ->where('tenant_members.user_id', $user->id)
                    ->where('tenant_members.profile_status', 'active')
                    ->whereNull('tenant_members.deleted_at')
                    ->select('tenants.*')
                    ->first();
            }
        }

        if ($tenant) {
            $request->session()->put('active_tenant_id', $tenant->id);
            app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->id);
        }

        $member = $request->attributes->get('currentTenantMember');
        if (!$member && $tenant && $user) {
            $member = TenantMember::query()
                ->where('tenant_id', $tenant->id)
                ->where('user_id', $user->id)
                ->where('profile_status', 'active')
                ->whereNull('deleted_at')
                ->first();
        }

        return [
            ...parent::share($request),
            'app' => [
                'area' => $isAdminArea ? 'admin' : 'tenant',
                'branding' => TenantBranding::resolved(null),
            ],
            'auth' => [
                'user' => $user,
                'is_superadmin' => (bool) $user?->is_superadmin,
                'is_impersonating' => (bool) $request->session()->get('impersonator_id'),
                'roles' => $user && $tenant ? $user->getRoleNames()->values()->all() : [],
                'permissions' => $user && $tenant ? $user->getAllPermissions()->pluck('name')->values()->all() : [],
                'ui_preferences' => $user?->ui_preferences,
            ],
            'currentTenant' => $tenant ? [
                'id' => $tenant->id,
                'slug' => $tenant->slug,
                'name' => $tenant->name,
                'display_name' => $tenant->display_name,
                'presentable_name' => $tenant->presentableName(),
                'locale' => $tenant->locale,
                'timezone' => $tenant->timezone,
                'currency_code' => $tenant->currency_code,
                'plan_code' => $entitlementService->normalizePlan($tenant->plan_code),
                'branding' => TenantBranding::resolved($tenant),
            ] : null,
            'currentTenantMember' => $member ? [
                'id' => $member->id,
                'role_code' => $member->role_code,
            ] : null,
            'entitlements' => [
                'modules' => $tenant ? $entitlementService->moduleMapForTenant($tenant) : [],
            ],
            'subscription' => [
                'plan' => $tenant ? [
                    'code' => $entitlementService->normalizePlan($tenant->plan_code),
                    'limits' => $entitlementService->limitsForTenant($tenant),
                ] : null,
                'usage' => $tenant && $request->routeIs('tenant.dashboard') ? [
                    'team.members.max' => [
                        'current' => TenantMember::query()->where('tenant_id', $tenant->id)->whereNull('deleted_at')->count(),
                        'limit' => $entitlementService->limit($tenant, 'team.members.max'),
                    ],
                    'team.roles.custom.max' => [
                        'current' => \Spatie\Permission\Models\Role::query()->where('tenant_id', $tenant->id)->where('is_system', false)->count(),
                        'limit' => $entitlementService->limit($tenant, 'team.roles.custom.max'),
                    ],
                    'team.invitations.pending.max' => [
                        'current' => \App\Models\TenantInvitation::query()->where('tenant_id', $tenant->id)->where('status', 'pending')->count(),
                        'limit' => $entitlementService->limit($tenant, 'team.invitations.pending.max'),
                    ],
                ] : [],
            ],
            'features' => [
                'whatsapp' => (bool) config('whatsapp.enabled', false),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
