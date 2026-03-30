<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantInvitation;
use App\Models\TenantMember;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TenantSubscriptionQuotaTest extends TestCase
{
    use RefreshDatabase;

    private function bootstrapTenant(string $planCode = 'free'): array
    {
        $owner = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $owner->id,
            'name' => 'Tenant Quota',
            'slug' => 'tenant-quota',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => $planCode,
            'status' => 'active',
        ]);

        Role::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'owner', 'guard_name' => 'web'],
            ['display_name' => 'Owner', 'is_system' => true, 'row_version' => 1]
        );
        Role::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'member', 'guard_name' => 'web'],
            ['display_name' => 'Member', 'is_system' => false, 'row_version' => 1]
        );

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'full_name' => 'Owner',
            'role_code' => 'owner',
            'profile_status' => 'active',
            'onboarding_status' => 'account_active',
            'row_version' => 1,
        ]);

        Sanctum::actingAs($owner);

        return [$tenant, $owner];
    }

    public function test_member_quota_exceeded_returns_plan_quota_error(): void
    {
        [$tenant] = $this->bootstrapTenant('free');

        for ($i = 0; $i < 4; $i++) {
            TenantMember::create([
                'tenant_id' => $tenant->id,
                'user_id' => null,
                'full_name' => 'Existing '.$i,
                'role_code' => 'member',
                'profile_status' => 'active',
                'row_version' => 1,
            ]);
        }

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/members", [
            'full_name' => 'Overflow Member',
            'role_code' => 'member',
            'profile_status' => 'active',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'PLAN_QUOTA_EXCEEDED')
            ->assertJsonPath('error.details.limit_key', 'team.members.max');
    }

    public function test_custom_role_quota_exceeded_returns_plan_quota_error(): void
    {
        [$tenant] = $this->bootstrapTenant('free');

        Role::query()->create([
            'tenant_id' => $tenant->id,
            'name' => 'custom_a',
            'display_name' => 'Custom A',
            'guard_name' => 'web',
            'is_system' => false,
            'row_version' => 1,
        ]);
        Role::query()->create([
            'tenant_id' => $tenant->id,
            'name' => 'custom_b',
            'display_name' => 'Custom B',
            'guard_name' => 'web',
            'is_system' => false,
            'row_version' => 1,
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/roles", [
            'name' => 'custom_c',
            'display_name' => 'Custom C',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'PLAN_QUOTA_EXCEEDED')
            ->assertJsonPath('error.details.limit_key', 'team.roles.custom.max');
    }

    public function test_pending_invitation_quota_exceeded_returns_plan_quota_error(): void
    {
        $plans = Config::get('subscription_entitlements.plans', []);
        $plans['pro']['limits']['team.invitations.pending.max'] = 3;
        Config::set('subscription_entitlements.plans', $plans);
        [$tenant, $owner] = $this->bootstrapTenant('pro');

        for ($i = 0; $i < 3; $i++) {
            TenantInvitation::create([
                'tenant_id' => $tenant->id,
                'invited_by_user_id' => $owner->id,
                'email' => "pending{$i}@example.com",
                'role_code' => 'member',
                'status' => 'pending',
                'token' => 'token-'.$i,
                'expires_at' => now()->addDays(5),
            ]);
        }

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/invitations", [
            'email' => 'overflow@example.com',
            'full_name' => 'Overflow User',
            'role_code' => 'member',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'PLAN_QUOTA_EXCEEDED')
            ->assertJsonPath('error.details.limit_key', 'team.invitations.pending.max');
    }
}
