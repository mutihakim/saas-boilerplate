<?php

namespace App\Http\Controllers;

use App\Models\TenantInvitation;
use App\Models\TenantMember;
use App\Models\Tenant;
use App\Support\PermissionCatalog;
use App\Support\SubscriptionEntitlements;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Spatie\Permission\Models\Role;

class TenantWorkspaceController extends Controller
{
    public function selector(Request $request)
    {
        return redirect()->route('admin.tenants.index');
    }

    public function accessRequired(): Response
    {
        return Inertia::render('Tenant/AccessRequired');
    }

    public function dashboard(Request $request): Response
    {
        $tenant = $request->attributes->get('currentTenant');

        return Inertia::render('Tenant/Dashboard', [
            'stats' => [
                'members_count' => TenantMember::query()
                    ->where('tenant_id', $tenant->id)
                    ->count(),
                'invitations_count' => TenantInvitation::query()
                    ->where('tenant_id', $tenant->id)
                    ->count(),
            ],
        ]);
    }

    public function members(Request $request): Response|HttpResponse
    {
        $tenant = $request->attributes->get('currentTenant');
        if (!$this->canViewMembers($request)) {
            return $this->forbiddenPage($request, 'Members access denied.');
        }

        $members = TenantMember::query()
            ->with(['user:id,email,email_verified_at'])
            ->where('tenant_id', $tenant->id)
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get(['id', 'user_id', 'full_name', 'role_code', 'profile_status', 'onboarding_status', 'whatsapp_jid', 'row_version'])
            ->map(function (TenantMember $member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'full_name' => $member->full_name,
                    'role_code' => $member->role_code,
                    'profile_status' => $member->profile_status,
                    'onboarding_status' => $member->onboarding_status,
                    'account_status' => $member->user_id
                        ? ($member->user?->email_verified_at ? 'verified' : 'unverified')
                        : 'no_account',
                    'user_email' => $member->user?->email,
                    'whatsapp_jid' => $member->whatsapp_jid,
                    'row_version' => $member->row_version,
                ];
            })
            ->values();

        return Inertia::render('Tenant/Members/Index', [
            'members' => $members,
            'roleOptions' => Role::query()
                ->where('tenant_id', $tenant->id)
                ->whereNotIn('name', ['owner', 'tenant_owner'])
                ->orderBy('is_system', 'desc')
                ->orderBy('name')
                ->pluck('name')
                ->values()
                ->all(),
        ]);
    }

    public function memberEdit(Request $request, int $member): Response|HttpResponse
    {
        $tenant = $request->attributes->get('currentTenant');
        if (!$this->canUpdateMembers($request)) {
            return $this->forbiddenPage($request, 'You do not have permission to edit member profile.');
        }

        $target = TenantMember::query()
            ->with('user')
            ->where('tenant_id', $tenant->id)
            ->where('id', $member)
            ->firstOrFail();

        return Inertia::render('Tenant/Members/Edit', [
            'member' => [
                'id' => $target->id,
                'full_name' => $target->full_name,
                'role_code' => $target->role_code,
                'profile_status' => $target->profile_status,
                'whatsapp_jid' => $target->whatsapp_jid,
                'row_version' => $target->row_version,
                'user' => $target->user ? [
                    'id' => $target->user->id,
                    'name' => $target->user->name,
                    'email' => $target->user->email,
                    'phone' => $target->user->phone,
                    'job_title' => $target->user->job_title,
                    'bio' => $target->user->bio,
                    'avatar_url' => $target->user->avatar_url,
                    'address_line' => $target->user->address_line,
                    'city' => $target->user->city,
                    'country' => $target->user->country,
                    'postal_code' => $target->user->postal_code,
                ] : null,
            ],
            'roleOptions' => Role::query()
                ->where('tenant_id', $tenant->id)
                ->whereNotIn('name', ['owner', 'tenant_owner'])
                ->orderBy('is_system', 'desc')
                ->orderBy('name')
                ->pluck('name')
                ->values()
                ->all(),
        ]);
    }

    public function memberView(Request $request, int $member): Response|HttpResponse
    {
        $tenant = $request->attributes->get('currentTenant');
        if (!$this->canViewMembers($request)) {
            return $this->forbiddenPage($request, 'Members access denied.');
        }

        $target = TenantMember::query()
            ->with('user')
            ->where('tenant_id', $tenant->id)
            ->where('id', $member)
            ->firstOrFail();

        return Inertia::render('Tenant/Members/View', [
            'member' => [
                'id' => $target->id,
                'full_name' => $target->full_name,
                'role_code' => $target->role_code,
                'profile_status' => $target->profile_status,
                'whatsapp_jid' => $target->whatsapp_jid,
                'row_version' => $target->row_version,
                'user' => $target->user ? [
                    'id' => $target->user->id,
                    'name' => $target->user->name,
                    'email' => $target->user->email,
                    'phone' => $target->user->phone,
                    'job_title' => $target->user->job_title,
                    'bio' => $target->user->bio,
                    'avatar_url' => $target->user->avatar_url,
                    'address_line' => $target->user->address_line,
                    'city' => $target->user->city,
                    'country' => $target->user->country,
                    'postal_code' => $target->user->postal_code,
                ] : null,
            ],
            'canEdit' => $this->canUpdateMembers($request),
        ]);
    }

    public function roles(Request $request): Response|HttpResponse
    {
        $tenant = $request->attributes->get('currentTenant');
        if (!$this->canViewRoles($request)) {
            return $this->forbiddenPage($request, 'Roles access denied.');
        }

        $roles = Role::query()
            ->with('permissions:id,name')
            ->where('tenant_id', $tenant->id)
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function (Role $role) use ($tenant) {
                $visiblePermissionSet = array_flip(PermissionCatalog::matrixPermissions());
                $memberUsers = DB::table('model_has_roles')
                    ->join('users', 'users.id', '=', 'model_has_roles.model_id')
                    ->join('tenant_members', function ($join) use ($tenant) {
                        $join->on('tenant_members.user_id', '=', 'users.id')
                            ->where('tenant_members.tenant_id', '=', $tenant->id)
                            ->whereNull('tenant_members.deleted_at')
                            ->where('tenant_members.profile_status', '=', 'active');
                    })
                    ->where('model_has_roles.role_id', $role->id)
                    ->where('model_has_roles.model_type', 'App\\Models\\User')
                    ->where('model_has_roles.tenant_id', $tenant->id)
                    ->select('users.id', 'users.name', 'users.avatar_url')
                    ->limit(5)
                    ->get();

                $memberCount = DB::table('model_has_roles')
                    ->join('tenant_members', function ($join) use ($tenant) {
                        $join->on('tenant_members.user_id', '=', 'model_has_roles.model_id')
                            ->where('tenant_members.tenant_id', '=', $tenant->id)
                            ->whereNull('tenant_members.deleted_at')
                            ->where('tenant_members.profile_status', '=', 'active');
                    })
                    ->where('model_has_roles.role_id', $role->id)
                    ->where('model_has_roles.model_type', 'App\\Models\\User')
                    ->where('model_has_roles.tenant_id', $tenant->id)
                    ->distinct('model_has_roles.model_id')
                    ->count('model_has_roles.model_id');

                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name ?: $role->name,
                    'is_system' => (bool) $role->is_system,
                    'row_version' => (int) $role->row_version,
                    'permissions' => $role->permissions
                        ->pluck('name')
                        ->filter(fn (string $permission) => isset($visiblePermissionSet[$permission]))
                        ->values()
                        ->all(),
                    'members_count' => $memberCount,
                    'members_preview' => $memberUsers,
                ];
            })
            ->values();

        return Inertia::render('Tenant/Roles/Index', [
            'roles' => $roles,
            'permissionModules' => PermissionCatalog::matrixModules(),
        ]);
    }

    public function invitations(Request $request): Response|HttpResponse
    {
        $tenant = $request->attributes->get('currentTenant');
        if (!$this->canViewInvitations($request)) {
            return $this->forbiddenPage($request, 'Invitations access denied.');
        }

        return Inertia::render('Tenant/Invitations/Index', [
            'roleOptions' => Role::query()
                ->where('tenant_id', $tenant->id)
                ->whereNotIn('name', ['owner', 'tenant_owner'])
                ->orderBy('is_system', 'desc')
                ->orderBy('name')
                ->pluck('name')
                ->values()
                ->all(),
        ]);
    }

    public function whatsappSettings(Request $request): Response|HttpResponse
    {
        if (!(bool) config('whatsapp.enabled', false)) {
            return $this->forbiddenPage($request, 'WhatsApp module is disabled.');
        }

        if (!$this->canManageWhatsappSettings($request)) {
            return $this->forbiddenPage($request, 'WhatsApp settings access denied.');
        }

        return Inertia::render('Tenant/WhatsApp/Settings');
    }

    public function whatsappChats(Request $request): Response|HttpResponse
    {
        if (!(bool) config('whatsapp.enabled', false)) {
            return $this->forbiddenPage($request, 'WhatsApp module is disabled.');
        }

        if (!$this->canViewWhatsappChats($request)) {
            return $this->forbiddenPage($request, 'WhatsApp chats access denied.');
        }

        return Inertia::render('Tenant/WhatsApp/Chats');
    }

    public function upgradeRequired(Request $request, SubscriptionEntitlements $entitlements): Response
    {
        $tenant = $request->attributes->get('currentTenant');
        $module = (string) $request->query('module', '');

        return Inertia::render('Tenant/UpgradeRequired', [
            'module' => $module,
            'module_label' => $module !== '' ? $entitlements->moduleLabel($module) : 'This module',
            'plan_code' => $entitlements->normalizePlan($tenant?->plan_code),
        ]);
    }

    private function forbiddenPage(Request $request, string $message): HttpResponse
    {
        return Inertia::render('Tenant/Forbidden', [
            'message' => $message,
        ])->toResponse($request)->setStatusCode(403);
    }

    private function canViewMembers(Request $request): bool
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');

        if ($user?->is_superadmin) {
            return true;
        }

        if ($user && ($user->can('team.members.view') || $user->can('tenant_members.view'))) {
            return true;
        }

        return in_array($member?->role_code, ['owner', 'admin', 'member', 'viewer', 'operator', 'tenant_owner', 'tenant_admin', 'tenant_member', 'tenant_viewer', 'tenant_operator'], true);
    }

    private function canUpdateMembers(Request $request): bool
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');

        if ($user?->is_superadmin) {
            return true;
        }

        if ($user && ($user->can('team.members.update') || $user->can('tenant_members.update'))) {
            return true;
        }

        return in_array($member?->role_code, ['owner', 'admin', 'operator', 'tenant_owner', 'tenant_admin', 'tenant_operator'], true);
    }

    private function canViewRoles(Request $request): bool
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');

        if ($user?->is_superadmin) {
            return true;
        }

        if ($user && ($user->can('team.roles.view') || $user->can('team.role_permissions.assign'))) {
            return true;
        }

        return in_array($member?->role_code, ['owner', 'admin', 'tenant_owner', 'tenant_admin'], true);
    }

    private function canViewInvitations(Request $request): bool
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');

        if ($user?->is_superadmin) {
            return true;
        }

        if ($user && ($user->can('team.invitations.view') || $user->can('team.invitations.update') || $user->can('team.invitations.create'))) {
            return true;
        }

        return in_array($member?->role_code, ['owner', 'admin', 'tenant_owner', 'tenant_admin'], true);
    }

    private function canManageWhatsappSettings(Request $request): bool
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');

        if ($user?->is_superadmin) {
            return true;
        }

        if ($user && ($user->can('whatsapp.settings.view') || $user->can('whatsapp.settings.update'))) {
            return true;
        }

        return in_array($member?->role_code, ['owner', 'tenant_owner'], true);
    }

    private function canViewWhatsappChats(Request $request): bool
    {
        $user = $request->user();
        $member = $request->attributes->get('currentTenantMember');

        if ($user?->is_superadmin) {
            return true;
        }

        if ($user && ($user->can('whatsapp.chats.view') || $user->can('whatsapp.chats.update'))) {
            return true;
        }

        return in_array($member?->role_code, ['owner', 'admin', 'tenant_owner', 'tenant_admin'], true);
    }
}
