<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tenant\TenantBillingUpdateRequest;
use App\Http\Requests\Tenant\TenantBrandingUpdateRequest;
use App\Http\Requests\Tenant\TenantLocalizationUpdateRequest;
use App\Http\Requests\Tenant\TenantProfileUpdateRequest;
use App\Models\Tenant;
use App\Support\TenantBranding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class TenantSettingsController extends Controller
{
    public function profile(Request $request): Response|HttpResponse
    {
        if ($response = $this->ensureViewAccess($request, 'tenant.settings.errors.access_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        return Inertia::render('Tenant/Settings/Profile', [
            'tenant' => $this->tenantPayload($tenant),
            'statusKey' => session('statusKey'),
        ]);
    }

    public function updateProfile(TenantProfileUpdateRequest $request): RedirectResponse|HttpResponse
    {
        if ($response = $this->ensureManageAccess($request, 'tenant.settings.errors.profile_manage_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        $tenant->fill($request->validated());
        $tenant->save();

        return Redirect::route('tenant.settings.profile', ['tenant' => $tenant->slug])->with('statusKey', 'tenant.settings.status.profile_updated');
    }

    public function branding(Request $request): Response|HttpResponse
    {
        if ($response = $this->ensureViewAccess($request, 'tenant.settings.errors.access_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        return Inertia::render('Tenant/Settings/Branding', [
            'tenant' => $this->tenantPayload($tenant),
            'brandingGuidance' => [
                'logo_light' => 'tenant.settings.branding.guidance.logo_light',
                'logo_dark' => 'tenant.settings.branding.guidance.logo_dark',
                'logo_icon' => 'tenant.settings.branding.guidance.logo_icon',
                'favicon' => 'tenant.settings.branding.guidance.favicon',
            ],
            'statusKey' => session('statusKey'),
        ]);
    }

    public function updateBranding(TenantBrandingUpdateRequest $request): RedirectResponse|HttpResponse
    {
        if ($response = $this->ensureManageAccess($request, 'tenant.settings.errors.branding_manage_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        foreach (TenantBranding::slotKeys() as $slot) {
            if (! $request->hasFile($slot)) {
                continue;
            }

            $path = TenantBranding::store($tenant, $slot, $request->file($slot));
            $column = TenantBranding::SLOT_MAP[$slot]['column'];
            $tenant->setAttribute($column, $path);
        }

        $tenant->save();

        return Redirect::route('tenant.settings.branding', ['tenant' => $tenant->slug])->with('statusKey', 'tenant.settings.status.branding_updated');
    }

    public function removeBranding(Request $request, string $slot): RedirectResponse|HttpResponse
    {
        if ($response = $this->ensureManageAccess($request, 'tenant.settings.errors.branding_manage_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        if (! in_array($slot, TenantBranding::slotKeys(), true)) {
            abort(404);
        }

        TenantBranding::remove($tenant, $slot);
        $tenant->setAttribute(TenantBranding::SLOT_MAP[$slot]['column'], null);
        $tenant->save();

        return Redirect::route('tenant.settings.branding', ['tenant' => $tenant->slug])->with('statusKey', "tenant.settings.status.reset.{$slot}");
    }

    public function localization(Request $request): Response|HttpResponse
    {
        if ($response = $this->ensureViewAccess($request, 'tenant.settings.errors.access_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        return Inertia::render('Tenant/Settings/Localization', [
            'tenant' => $this->tenantPayload($tenant),
            'options' => [
                'locales' => [
                    ['value' => 'id', 'labelKey' => 'tenant.settings.localization.options.locale.id'],
                    ['value' => 'en', 'labelKey' => 'tenant.settings.localization.options.locale.en'],
                ],
                'timezones' => [
                    ['value' => 'Asia/Jakarta', 'labelKey' => 'tenant.settings.localization.options.timezone.asia_jakarta'],
                    ['value' => 'Asia/Makassar', 'labelKey' => 'tenant.settings.localization.options.timezone.asia_makassar'],
                    ['value' => 'Asia/Jayapura', 'labelKey' => 'tenant.settings.localization.options.timezone.asia_jayapura'],
                    ['value' => 'Asia/Singapore', 'labelKey' => 'tenant.settings.localization.options.timezone.asia_singapore'],
                    ['value' => 'UTC', 'labelKey' => 'tenant.settings.localization.options.timezone.utc'],
                ],
                'currencies' => [
                    ['value' => 'IDR', 'labelKey' => 'tenant.settings.localization.options.currency.idr'],
                    ['value' => 'USD', 'labelKey' => 'tenant.settings.localization.options.currency.usd'],
                    ['value' => 'SGD', 'labelKey' => 'tenant.settings.localization.options.currency.sgd'],
                    ['value' => 'EUR', 'labelKey' => 'tenant.settings.localization.options.currency.eur'],
                ],
                'countries' => [
                    ['value' => 'ID', 'labelKey' => 'tenant.settings.localization.options.country.id'],
                    ['value' => 'SG', 'labelKey' => 'tenant.settings.localization.options.country.sg'],
                    ['value' => 'MY', 'labelKey' => 'tenant.settings.localization.options.country.my'],
                    ['value' => 'AU', 'labelKey' => 'tenant.settings.localization.options.country.au'],
                    ['value' => 'US', 'labelKey' => 'tenant.settings.localization.options.country.us'],
                ],
            ],
            'statusKey' => session('statusKey'),
        ]);
    }

    public function updateLocalization(TenantLocalizationUpdateRequest $request): RedirectResponse|HttpResponse
    {
        if ($response = $this->ensureManageAccess($request, 'tenant.settings.errors.localization_manage_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        $tenant->fill($request->validated());
        $tenant->save();

        return Redirect::route('tenant.settings.localization', ['tenant' => $tenant->slug])->with('statusKey', 'tenant.settings.status.localization_updated');
    }

    public function billing(Request $request): Response|HttpResponse
    {
        if ($response = $this->ensureViewAccess($request, 'tenant.settings.errors.access_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        return Inertia::render('Tenant/Settings/Billing', [
            'tenant' => $this->tenantPayload($tenant),
            'statusKey' => session('statusKey'),
        ]);
    }

    public function updateBilling(TenantBillingUpdateRequest $request): RedirectResponse|HttpResponse
    {
        if ($response = $this->ensureManageAccess($request, 'tenant.settings.errors.billing_manage_denied')) {
            return $response;
        }

        $tenant = $this->resolveTenant($request);

        $tenant->fill($request->validated());
        $tenant->save();

        return Redirect::route('tenant.settings.billing', ['tenant' => $tenant->slug])->with('statusKey', 'tenant.settings.status.billing_updated');
    }

    private function tenantPayload(Tenant $tenant): array
    {
        return [
            'id' => $tenant->id,
            'slug' => $tenant->slug,
            'name' => $tenant->name,
            'display_name' => $tenant->display_name,
            'presentable_name' => $tenant->presentableName(),
            'legal_name' => $tenant->legal_name,
            'registration_number' => $tenant->registration_number,
            'tax_id' => $tenant->tax_id,
            'industry' => $tenant->industry,
            'website_url' => $tenant->website_url,
            'support_email' => $tenant->support_email,
            'billing_email' => $tenant->billing_email,
            'billing_contact_name' => $tenant->billing_contact_name,
            'phone' => $tenant->phone,
            'address_line_1' => $tenant->address_line_1,
            'address_line_2' => $tenant->address_line_2,
            'city' => $tenant->city,
            'state_region' => $tenant->state_region,
            'postal_code' => $tenant->postal_code,
            'country_code' => $tenant->country_code,
            'locale' => $tenant->locale,
            'timezone' => $tenant->timezone,
            'currency_code' => $tenant->currency_code,
            'branding' => TenantBranding::resolved($tenant),
        ];
    }

    private function ensureViewAccess(Request $request, string $message): ?HttpResponse
    {
        if ($this->canManage($request) || $this->canView($request)) {
            return null;
        }

        return $this->forbiddenPage($request, $message);
    }

    private function ensureManageAccess(Request $request, string $message): ?HttpResponse
    {
        if ($this->canManage($request)) {
            return null;
        }

        return $this->forbiddenPage($request, $message);
    }

    private function canView(Request $request): bool
    {
        $user = $request->user();

        return (bool) ($user?->is_superadmin || $user?->can('tenant.settings.view'));
    }

    private function canManage(Request $request): bool
    {
        $user = $request->user();

        return (bool) ($user?->is_superadmin || $user?->can('tenant.settings.manage'));
    }

    private function resolveTenant(Request $request): Tenant
    {
        $tenant = $request->attributes->get('currentTenant');

        if ($tenant instanceof Tenant) {
            return $tenant;
        }

        $routeTenant = $request->route('tenant');
        if ($routeTenant instanceof Tenant) {
            return $routeTenant;
        }

        return Tenant::query()->where('slug', (string) $routeTenant)->firstOrFail();
    }

    private function forbiddenPage(Request $request, string $message): HttpResponse
    {
        return Inertia::render('Tenant/Forbidden', [
            'messageKey' => $message,
        ])->toResponse($request)->setStatusCode(403);
    }
}
