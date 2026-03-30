<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantInvitation;
use App\Models\TenantMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TenantLifecycleApiTest extends TestCase
{
    use RefreshDatabase;

    private function bootstrapTenantAdmin(): array
    {
        $user = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $user->id,
            'name' => 'Tenant X',
            'slug' => 'tenant-x',
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => 'pro',
            'status' => 'active',
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
            'is_system' => true,
            'row_version' => 1,
        ]);

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'full_name' => 'Owner',
            'role_code' => 'owner',
            'profile_status' => 'active',
            'onboarding_status' => 'account_active',
            'row_version' => 1,
        ]);

        Sanctum::actingAs($user);

        return [$tenant, $user];
    }

    public function test_owner_can_create_invitation(): void
    {
        [$tenant] = $this->bootstrapTenantAdmin();

        $member = TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => null,
            'full_name' => 'Invite Candidate',
            'role_code' => 'member',
            'profile_status' => 'active',
            'onboarding_status' => 'no_account',
            'row_version' => 1,
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/invitations", [
            'email' => 'invitee@example.com',
            'full_name' => 'Invitee Member',
            'role_code' => 'member',
            'member_id' => $member->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.invitation.email', 'invitee@example.com')
            ->assertJsonPath('data.invitation.full_name', 'Invitee Member')
            ->assertJsonPath('data.invitation.member_id', $member->id);

        $this->assertSame(
            'invitation_pending',
            TenantMember::query()->findOrFail($member->id)->onboarding_status
        );
    }

    public function test_invitation_can_be_accepted(): void
    {
        [$tenant] = $this->bootstrapTenantAdmin();

        $invitation = TenantInvitation::create([
            'tenant_id' => $tenant->id,
            'invited_by_user_id' => $tenant->owner_user_id,
            'email' => 'invitee@example.com',
            'full_name' => 'Invitee Member',
            'role_code' => 'member',
            'status' => 'pending',
            'token' => 'token-123',
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->postJson('/api/v1/invitations/accept', [
            'token' => $invitation->token,
            'action' => 'accept',
            'name' => 'Invitee Member',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.accepted', true);
    }

    public function test_cannot_invite_member_with_active_account(): void
    {
        [$tenant] = $this->bootstrapTenantAdmin();

        $existingUser = User::factory()->create(['email' => 'active@example.com']);
        $member = TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $existingUser->id,
            'full_name' => 'Active Member',
            'role_code' => 'member',
            'profile_status' => 'active',
            'onboarding_status' => 'account_active',
            'row_version' => 1,
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/invitations", [
            'member_id' => $member->id,
            'email' => 'active@example.com',
            'full_name' => 'Active Member',
            'role_code' => 'member',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'INVITATION_EMAIL_ALREADY_REGISTERED');
    }

    public function test_existing_registered_email_is_rejected_even_if_old_membership_soft_deleted(): void
    {
        [$tenant] = $this->bootstrapTenantAdmin();

        $formerUser = User::factory()->create(['email' => 'rehire@example.com']);
        $oldMember = TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $formerUser->id,
            'full_name' => 'Former Member',
            'role_code' => 'member',
            'profile_status' => 'active',
            'onboarding_status' => 'account_active',
            'row_version' => 1,
        ]);
        $oldMember->delete();

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/invitations", [
            'email' => 'rehire@example.com',
            'full_name' => 'Rehired Member',
            'role_code' => 'member',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'INVITATION_EMAIL_ALREADY_REGISTERED');

        $this->assertSoftDeleted('tenant_members', ['id' => $oldMember->id]);
    }

    public function test_duplicate_pending_invitation_is_rejected(): void
    {
        [$tenant] = $this->bootstrapTenantAdmin();

        TenantInvitation::create([
            'tenant_id' => $tenant->id,
            'invited_by_user_id' => $tenant->owner_user_id,
            'email' => 'dup@example.com',
            'full_name' => 'Duplicate Invitee',
            'role_code' => 'member',
            'status' => 'pending',
            'token' => 'pending-token-1',
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/invitations", [
            'email' => 'dup@example.com',
            'full_name' => 'Duplicate Invitee',
            'role_code' => 'member',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'INVITATION_ALREADY_PENDING');
    }

    public function test_user_with_invitations_view_permission_can_list_invitations(): void
    {
        [$tenant, $owner] = $this->bootstrapTenantAdmin();

        $viewer = User::factory()->create();
        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $viewer->id,
            'full_name' => 'Invitation Viewer',
            'role_code' => 'member',
            'profile_status' => 'active',
            'onboarding_status' => 'account_active',
            'row_version' => 1,
        ]);

        app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->id);
        $viewer->givePermissionTo('team.invitations.view');

        Sanctum::actingAs($viewer);
        $response = $this->getJson("/api/v1/tenants/{$tenant->slug}/invitations");

        $response->assertOk()
            ->assertJsonPath('ok', true);
    }
}
