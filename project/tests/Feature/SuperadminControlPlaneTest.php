<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SuperadminControlPlaneTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_login_redirects_to_admin_dashboard(): void
    {
        $user = User::factory()->create(['is_superadmin' => true]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/admin/dashboard');
    }

    public function test_non_superadmin_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create(['is_superadmin' => false]);

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }

    public function test_superadmin_tenant_mutation_requires_impersonation(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $tenant = Tenant::create([
            'owner_user_id' => $superadmin->id,
            'name' => 'Tenant A',
            'slug' => 'tenant-a',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'pro',
            'status' => 'active',
        ]);

        $response = $this->actingAs($superadmin)
            ->postJson("/api/v1/tenants/{$tenant->slug}/members", [
                'full_name' => 'Blocked Create',
                'role_code' => 'member',
                'profile_status' => 'active',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error.code', 'SUPERADMIN_IMPERSONATION_REQUIRED');
    }

    public function test_superadmin_can_mutate_tenant_after_impersonation(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $owner = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $owner->id,
            'name' => 'Tenant A',
            'slug' => 'tenant-a',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'pro',
            'status' => 'active',
        ]);

        Role::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'owner', 'guard_name' => 'web'],
            ['display_name' => 'Owner', 'is_system' => true, 'row_version' => 1]
        );
        Role::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'member', 'guard_name' => 'web'],
            ['display_name' => 'Member', 'is_system' => true, 'row_version' => 1]
        );

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'full_name' => 'Owner',
            'role_code' => 'owner',
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        $this->actingAs($superadmin)
            ->postJson("/admin/impersonations/{$owner->id}")
            ->assertOk()
            ->assertJsonPath('ok', true);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/members", [
            'full_name' => 'Allowed Create',
            'role_code' => 'member',
            'profile_status' => 'active',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('ok', true);
    }
}

