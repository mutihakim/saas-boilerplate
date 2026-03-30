<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/tenant-access-required';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth.login', function (Request $request) {
            return [
                Limit::perMinute(8)->by(Str::lower((string) $request->input('email')).'|'.$request->ip()),
            ];
        });

        RateLimiter::for('auth.password', function (Request $request) {
            return [
                Limit::perMinute(5)->by(Str::lower((string) $request->input('email')).'|'.$request->ip()),
            ];
        });

        RateLimiter::for('tenant.mutation', function (Request $request) {
            $tenant = $request->route('tenant');
            $tenantKey = is_object($tenant) && method_exists($tenant, 'getKey') ? $tenant->getKey() : (string) $tenant;
            return [
                Limit::perMinute(40)->by("tenant:{$tenantKey}|".($request->user()?->id ?: $request->ip())),
            ];
        });

        RateLimiter::for('invitation.accept', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()),
            ];
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
