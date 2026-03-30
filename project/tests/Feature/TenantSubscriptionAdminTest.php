<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantSubscriptionAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_update_tenant_subscription(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $tenantOwner = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $tenantOwner->id,
            'name' => 'Tenant Plan',
            'slug' => 'tenant-plan',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'free',
            'status' => 'active',
        ]);

        $response = $this->actingAs($superadmin)
            ->patchJson("/admin/tenants/{$tenant->slug}/subscription", [
                'plan_code' => 'pro',
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.tenant.plan_code', 'pro');
    }

    public function test_non_superadmin_cannot_update_tenant_subscription(): void
    {
        $user = User::factory()->create(['is_superadmin' => false]);
        $tenantOwner = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $tenantOwner->id,
            'name' => 'Tenant Plan',
            'slug' => 'tenant-plan',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'free',
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->patchJson("/admin/tenants/{$tenant->slug}/subscription", [
                'plan_code' => 'pro',
            ])
            ->assertForbidden();
    }
}

