<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantSubscriptionGuardTest extends TestCase
{
    use RefreshDatabase;

    private function seedTenant(string $planCode): array
    {
        $user = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $user->id,
            'name' => 'Tenant Guard',
            'slug' => 'tenant-guard-' . $planCode,
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => $planCode,
            'status' => 'active',
        ]);

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'full_name' => 'Owner Guard',
            'role_code' => 'owner',
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        return [$tenant, $user];
    }

    public function test_free_plan_cannot_access_whatsapp_api(): void
    {
        config()->set('whatsapp.enabled', true);
        [$tenant, $user] = $this->seedTenant('free');
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session");

        $response->assertStatus(403)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error.code', 'FEATURE_NOT_AVAILABLE');
    }

    public function test_pro_plan_can_access_whatsapp_api(): void
    {
        config()->set('whatsapp.enabled', true);
        [$tenant, $user] = $this->seedTenant('pro');
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session");

        $response->assertOk()
            ->assertJsonPath('ok', true);
    }

    public function test_locked_web_module_redirects_to_upgrade_page(): void
    {
        [$tenant, $user] = $this->seedTenant('free');

        $response = $this->actingAs($user)
            ->get("/t/{$tenant->slug}/invitations");

        $response->assertRedirect("/t/{$tenant->slug}/upgrade-required?module=team.invitations");
    }

    public function test_roles_web_route_returns_forbidden_cover_for_unauthorized_member(): void
    {
        [$tenant] = $this->seedTenant('pro');
        $memberUser = User::factory()->create();

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $memberUser->id,
            'full_name' => 'Member Guard',
            'role_code' => 'member',
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        $response = $this->actingAs($memberUser)
            ->get("/t/{$tenant->slug}/roles");

        $response->assertStatus(403);
        $response->assertInertia(fn (Assert $page) => $page->component('Tenant/Forbidden'));
    }

    public function test_whatsapp_settings_web_route_returns_forbidden_cover_for_non_owner(): void
    {
        config()->set('whatsapp.enabled', true);
        [$tenant] = $this->seedTenant('pro');
        $memberUser = User::factory()->create();

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $memberUser->id,
            'full_name' => 'Member Guard',
            'role_code' => 'member',
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        $response = $this->actingAs($memberUser)
            ->get("/t/{$tenant->slug}/whatsapp/settings");

        $response->assertStatus(403);
        $response->assertInertia(fn (Assert $page) => $page->component('Tenant/Forbidden'));
    }
}
