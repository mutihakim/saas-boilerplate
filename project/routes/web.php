<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfileSecurityController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ImpersonationController;
use App\Http\Controllers\Admin\TenantDirectoryController;
use App\Http\Controllers\Admin\TenantSubscriptionController;
use App\Http\Controllers\InvitationAcceptanceController;
use App\Http\Controllers\Api\V1\InternalWhatsappCallbackController;
use App\Http\Controllers\TenantSettingsController;
use App\Http\Controllers\ThemePreferenceController;
use App\Http\Controllers\TenantWorkspaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing/OnePage/index');
})->name('home');

Route::get('/landing', function () {
    return Inertia::render('Landing/OnePage/index');
})->name('landing');
Route::get('/health', fn () => response()->json(['ok' => true]));
Route::get('/test-broadcast', function() {
    event(new \App\Events\WhatsappMessageReceived(tenantId: 4));
    return 'Broadcast Sent!';
});
Route::get('/invitations/accept/{token}', [InvitationAcceptanceController::class, 'show'])->name('invitation.accept.page');
Route::middleware('api')->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class)->prefix('/internal/v1/whatsapp')->group(function () {
    Route::get('/sessions', [InternalWhatsappCallbackController::class, 'sessions']);
    Route::post('/session-state', [InternalWhatsappCallbackController::class, 'sessionState']);
    Route::post('/messages', [InternalWhatsappCallbackController::class, 'messages']);
    Route::post('/media', [InternalWhatsappCallbackController::class, 'media']);
});

Route::get('/robots.txt', function () {
    return response("User-agent: *\nAllow: /\nSitemap: ".url('/sitemap.xml')."\n", 200)
        ->header('Content-Type', 'text/plain');
});

Route::get('/sitemap.xml', function () {
    $xml = '<?xml version="1.0" encoding="UTF-8"?>'
        .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        .'<url><loc>'.url('/').'</loc></url>'
        .'<url><loc>'.url('/landing').'</loc></url>'
        .'<url><loc>'.url('/login').'</loc></url>'
        .'<url><loc>'.url('/register').'</loc></url>'
        .'</urlset>';

    return response($xml, 200)->header('Content-Type', 'application/xml');
});

Route::middleware('auth')->group(function () {
    Route::get('/tenants', [TenantWorkspaceController::class, 'selector'])
        ->middleware('superadmin.selector')
        ->name('tenant.selector');
    Route::get('/tenant-access-required', [TenantWorkspaceController::class, 'accessRequired'])->name('tenant.access.required');
    Route::put('/settings/theme', ThemePreferenceController::class)->name('settings.theme.update');

    Route::middleware(['tenant.initialize', 'tenant.access', 'permission.team'])
        ->prefix('/t/{tenant}')
        ->group(function () {
            Route::get('/dashboard', [TenantWorkspaceController::class, 'dashboard'])
                ->middleware('tenant.feature:dashboard,view')
                ->name('tenant.dashboard');
            Route::get('/members', [TenantWorkspaceController::class, 'members'])
                ->middleware('tenant.feature:team.members,view')
                ->name('tenant.members');
            Route::get('/members/{member}', [TenantWorkspaceController::class, 'memberView'])
                ->middleware('tenant.feature:team.members,view')
                ->name('tenant.members.view');
            Route::get('/members/{member}/edit', [TenantWorkspaceController::class, 'memberEdit'])
                ->middleware('tenant.feature:team.members,update')
                ->name('tenant.members.edit');
            Route::get('/roles', [TenantWorkspaceController::class, 'roles'])
                ->middleware('tenant.feature:team.roles,view')
                ->name('tenant.roles');
            Route::get('/invitations', [TenantWorkspaceController::class, 'invitations'])
                ->middleware('tenant.feature:team.invitations,view')
                ->name('tenant.invitations');
            Route::get('/whatsapp/settings', [TenantWorkspaceController::class, 'whatsappSettings'])
                ->middleware('tenant.feature:whatsapp.settings,view')
                ->name('tenant.whatsapp.settings');
            Route::get('/whatsapp/chats', [TenantWorkspaceController::class, 'whatsappChats'])
                ->middleware('tenant.feature:whatsapp.chats,view')
                ->name('tenant.whatsapp.chats');
            Route::get('/settings', fn () => redirect("/t/".request()->segment(2)."/settings/profile"))
                ->name('tenant.settings');
            Route::get('/settings/profile', [TenantSettingsController::class, 'profile'])->name('tenant.settings.profile');
            Route::patch('/settings/profile', [TenantSettingsController::class, 'updateProfile'])->name('tenant.settings.profile.update');
            Route::get('/settings/branding', [TenantSettingsController::class, 'branding'])->name('tenant.settings.branding');
            Route::post('/settings/branding', [TenantSettingsController::class, 'updateBranding'])->name('tenant.settings.branding.update');
            Route::delete('/settings/branding/{slot}', [TenantSettingsController::class, 'removeBranding'])->name('tenant.settings.branding.remove');
            Route::get('/settings/localization', [TenantSettingsController::class, 'localization'])->name('tenant.settings.localization');
            Route::patch('/settings/localization', [TenantSettingsController::class, 'updateLocalization'])->name('tenant.settings.localization.update');
            Route::get('/settings/billing', [TenantSettingsController::class, 'billing'])->name('tenant.settings.billing');
            Route::patch('/settings/billing', [TenantSettingsController::class, 'updateBilling'])->name('tenant.settings.billing.update');
            Route::get('/upgrade-required', [TenantWorkspaceController::class, 'upgradeRequired'])->name('tenant.upgrade.required');
        });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/settings', [ProfileController::class, 'settings'])->name('profile.settings');
    Route::get('/profile/security', [ProfileSecurityController::class, 'index'])->name('profile.security');
    Route::post('/profile/security/mfa/enable', [ProfileSecurityController::class, 'enable'])->name('profile.security.mfa.enable');
    Route::post('/profile/security/mfa/verify', [ProfileSecurityController::class, 'verify'])->name('profile.security.mfa.verify');
    Route::delete('/profile/security/mfa', [ProfileSecurityController::class, 'disable'])->name('profile.security.mfa.disable');
    Route::post('/profile/security/passkeys', [ProfileSecurityController::class, 'passkeys'])->name('profile.security.passkeys');

    Route::middleware('superadmin.only')->prefix('/admin')->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('admin.dashboard');
        Route::get('/tenants', TenantDirectoryController::class)->name('admin.tenants.index');
        Route::get('/tenants/subscriptions', [TenantSubscriptionController::class, 'index'])->name('admin.tenants.subscriptions');
        Route::patch('/tenants/{tenant}/subscription', [TenantSubscriptionController::class, 'update'])->name('admin.tenants.subscription.update');
        Route::post('/impersonations/{user}', [ImpersonationController::class, 'start'])->name('admin.impersonations.start');
    });
    Route::delete('/admin/impersonations', [ImpersonationController::class, 'stop'])->name('admin.impersonations.stop');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
