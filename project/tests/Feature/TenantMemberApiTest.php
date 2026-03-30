<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TenantMemberApiTest extends TestCase
{
    use RefreshDatabase;

    private function seedMemberWithRole(string $role = 'admin'): array
    {
        $user = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $user->id,
            'name' => 'Tenant A',
            'slug' => 'tenant-a',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'pro',
            'status' => 'active',
        ]);

        Role::query()->firstOrCreate([
            'tenant_id' => $tenant->id,
            'name' => 'admin',
            'guard_name' => 'web',
        ], [
            'display_name' => 'Admin',
            'is_system' => true,
            'row_version' => 1,
        ]);
        Role::query()->firstOrCreate([
            'tenant_id' => $tenant->id,
            'name' => 'owner',
            'guard_name' => 'web',
        ], [
            'display_name' => 'Owner',
            'is_system' => true,
            'row_version' => 1,
        ]);
        Role::query()->firstOrCreate([
            'tenant_id' => $tenant->id,
            'name' => 'member',
            'guard_name' => 'web',
        ], [
            'display_name' => 'Member',
            'is_system' => false,
            'row_version' => 1,
        ]);

        $member = TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'full_name' => 'Admin A',
            'role_code' => $role,
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        Sanctum::actingAs($user);

        return [$tenant, $member, $user];
    }

    public function test_cross_tenant_access_is_hidden_with_404(): void
    {
        [$tenantA] = $this->seedMemberWithRole();

        $otherOwner = User::factory()->create();
        $tenantB = Tenant::create([
            'owner_user_id' => $otherOwner->id,
            'name' => 'Tenant B',
            'slug' => 'tenant-b',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'free',
            'status' => 'active',
        ]);

        $response = $this->getJson("/api/v1/tenants/{$tenantB->slug}/members");

        $response->assertStatus(404)
            ->assertJson([
                'ok' => false,
                'error' => ['code' => 'NOT_FOUND'],
            ]);
    }

    public function test_stale_row_version_returns_version_conflict(): void
    {
        [$tenantA] = $this->seedMemberWithRole();

        $target = TenantMember::create([
            'tenant_id' => $tenantA->id,
            'user_id' => null,
            'full_name' => 'Operator',
            'role_code' => 'member',
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        $response = $this->patchJson("/api/v1/tenants/{$tenantA->slug}/members/{$target->id}", [
            'full_name' => 'Operator Updated',
            'role_code' => 'member',
            'profile_status' => 'active',
            'row_version' => 99,
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error.code', 'VERSION_CONFLICT');
    }

    public function test_store_member_returns_envelope(): void
    {
        [$tenantA] = $this->seedMemberWithRole();

        $response = $this->postJson("/api/v1/tenants/{$tenantA->slug}/members", [
            'full_name' => 'New Member',
            'role_code' => 'member',
            'profile_status' => 'active',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.member.full_name', 'New Member')
            ->assertJsonPath('data.member.onboarding_status', 'no_account');
    }

    public function test_cannot_create_owner_member_in_same_tenant(): void
    {
        [$tenantA] = $this->seedMemberWithRole('owner');

        $response = $this->postJson("/api/v1/tenants/{$tenantA->slug}/members", [
            'full_name' => 'Second Owner',
            'role_code' => 'owner',
            'profile_status' => 'active',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonPath('error.details.fields.role_code.0', 'The selected role code is invalid.');
    }
}
