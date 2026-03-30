<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantSelectorAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_access_tenant_selector(): void
    {
        $user = User::factory()->create(['is_superadmin' => true]);
        Tenant::create([
            'owner_user_id' => $user->id,
            'name' => 'Tenant A',
            'slug' => 'tenant-a',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'free',
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->get('/tenants')
            ->assertRedirect('/admin/tenants');
    }

    public function test_non_superadmin_is_redirected_from_tenant_selector_to_dashboard(): void
    {
        $user = User::factory()->create(['is_superadmin' => false]);
        $tenant = Tenant::create([
            'owner_user_id' => $user->id,
            'name' => 'Tenant A',
            'slug' => 'tenant-a',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'free',
            'status' => 'active',
        ]);

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'full_name' => 'Member A',
            'role_code' => 'owner',
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        $this->actingAs($user)
            ->get('/tenants')
            ->assertRedirect('/t/tenant-a/dashboard');
    }
}
