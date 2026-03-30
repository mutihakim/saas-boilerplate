<?php

namespace App\Providers;

use App\Models\TenantMember;
use App\Policies\TenantMemberPolicy;
use App\Policies\TenantRolePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Spatie\Permission\Models\Role;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        TenantMember::class => TenantMemberPolicy::class,
        Role::class => TenantRolePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
