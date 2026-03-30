<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantMember;
use App\Models\TenantWhatsappMessage;
use App\Models\TenantWhatsappSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantWhatsappServiceIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('broadcasting.default', 'log');
    }

    public function test_connect_forwards_request_to_global_service_when_enabled(): void
    {
        config()->set('whatsapp.enabled', true);
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');
        config()->set('whatsapp.internal_token', 'internal-secret');

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/session/connect' => Http::response([
                'ok' => true,
                'data' => [
                    'connection_status' => 'connecting',
                    'session_name' => 'tenant-' . dechex((int) $tenant->id),
                ],
            ], 200),
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session/connect");

        $response->assertStatus(202)
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.status', 'accepted')
            ->assertJsonPath('data.connection_status', 'connecting');

        Http::assertSent(function ($request) use ($tenant) {
            return $request->url() === "http://wa-service.test/api/v1/tenants/{$tenant->id}/whatsapp/session/connect"
                && $request->hasHeader('X-Internal-Token', 'internal-secret');
        });
    }

    public function test_connect_returns_accepted_with_warning_when_global_service_fails(): void
    {
        config()->set('whatsapp.enabled', true);
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/session/connect' => Http::response([
                'ok' => false,
                'error' => ['code' => 'SERVICE_DOWN', 'message' => 'Service down'],
            ], 503),
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session/connect");

        $response->assertStatus(202)
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.status', 'accepted_with_warning')
            ->assertJsonPath('data.connection_status', 'connecting');

        $this->assertDatabaseHas('tenant_whatsapp_settings', [
            'tenant_id' => $tenant->id,
            'connection_status' => 'connecting',
            'auto_connect' => true,
        ]);
    }

    public function test_send_message_accepts_lid_us_destination_without_polling_flow(): void
    {
        config()->set('whatsapp.enabled', true);
        config()->set('whatsapp.service_enabled', false);

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenant->id,
            'session_name' => 'tenant-' . dechex((int) $tenant->id),
            'connection_status' => 'connected',
            'connected_jid' => '628111111111@c.us',
            'auto_connect' => true,
        ]);

        $jid = '1234567890@lid.us';
        $encodedJid = rawurlencode($jid);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/whatsapp/chats/{$encodedJid}/send", [
            'message' => 'hello lid',
        ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.to', $jid);

        $this->assertDatabaseHas('tenant_whatsapp_messages', [
            'tenant_id' => $tenant->id,
            'direction' => 'outgoing',
            'recipient_jid' => $jid,
            'chat_jid' => $jid,
        ]);
    }

    public function test_connect_sets_auto_connect_true(): void
    {
        config()->set('whatsapp.enabled', true);
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');
        config()->set('whatsapp.internal_token', 'internal-secret');

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenant->id,
            'session_name' => 'tenant-' . dechex((int) $tenant->id),
            'connection_status' => 'disconnected',
            'auto_connect' => false,
        ]);

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/session/connect' => Http::response([
                'ok' => true,
                'data' => ['connection_status' => 'connecting'],
            ], 200),
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session/connect");
        $response->assertStatus(202);

        $this->assertDatabaseHas('tenant_whatsapp_settings', [
            'tenant_id' => $tenant->id,
            'auto_connect' => true,
            'connection_status' => 'connecting',
        ]);
    }

    public function test_disconnect_sets_auto_connect_false(): void
    {
        config()->set('whatsapp.enabled', true);
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');
        config()->set('whatsapp.internal_token', 'internal-secret');

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenant->id,
            'session_name' => 'tenant-' . dechex((int) $tenant->id),
            'connection_status' => 'connecting',
            'auto_connect' => true,
            'meta' => ['qr_generated_at' => now()->toIso8601String()],
        ]);

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/session/disconnect' => Http::response([
                'ok' => true,
                'data' => ['connection_status' => 'disconnected'],
            ], 200),
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session/disconnect");
        $response->assertOk();

        $setting = TenantWhatsappSetting::query()->where('tenant_id', $tenant->id)->firstOrFail();
        $this->assertFalse((bool) $setting->auto_connect);
        $this->assertSame('disconnected', $setting->connection_status);
        $this->assertSame('manual_disconnect', $setting->meta['disconnect_reason'] ?? null);
    }

    public function test_internal_session_state_can_disable_auto_connect_and_merge_meta(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        [$tenant] = $this->seedTenantOwner('pro');

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenant->id,
            'session_name' => 'tenant-' . dechex((int) $tenant->id),
            'connection_status' => 'connecting',
            'auto_connect' => true,
            'meta' => ['connect_requested_at' => now()->subMinute()->toIso8601String()],
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/session-state', [
            'tenant_id' => $tenant->id,
            'connection_status' => 'disconnected',
            'connected_jid' => null,
            'auto_connect' => false,
            'meta' => [
                'disconnect_reason' => 'qr_timeout',
                'disconnected_at' => now()->toIso8601String(),
            ],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk();

        $setting = TenantWhatsappSetting::query()->where('tenant_id', $tenant->id)->firstOrFail();
        $this->assertFalse((bool) $setting->auto_connect);
        $this->assertSame('disconnected', $setting->connection_status);
        $this->assertSame('qr_timeout', $setting->meta['disconnect_reason'] ?? null);
        $this->assertFalse((bool) ($setting->meta['restore_eligible'] ?? true));
        $this->assertArrayHasKey('connect_requested_at', $setting->meta ?? []);
    }

    public function test_internal_session_state_rejects_newcomer_when_connected_jid_is_already_owned(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        [$ownerTenant] = $this->seedTenantOwner('pro');
        [$newcomerTenant] = $this->seedTenantOwner('basic');

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $ownerTenant->id,
            'session_name' => 'tenant-' . dechex((int) $ownerTenant->id),
            'connection_status' => 'connected',
            'connected_jid' => '628111111111@c.us',
            'auto_connect' => true,
            'meta' => ['lifecycle_state' => 'connected'],
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/session-state', [
            'tenant_id' => $newcomerTenant->id,
            'connection_status' => 'connected',
            'connected_jid' => '628111111111@c.us',
            'auto_connect' => true,
            'meta' => ['lifecycle_state' => 'connected'],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        $newcomerSetting = TenantWhatsappSetting::query()
            ->where('tenant_id', $newcomerTenant->id)
            ->firstOrFail();
        $ownerSetting = TenantWhatsappSetting::query()
            ->where('tenant_id', $ownerTenant->id)
            ->firstOrFail();

        $this->assertSame('disconnected', $newcomerSetting->connection_status);
        $this->assertNull($newcomerSetting->connected_jid);
        $this->assertFalse((bool) $newcomerSetting->auto_connect);
        $this->assertSame('jid_conflict', $newcomerSetting->meta['disconnect_reason'] ?? null);
        $this->assertSame($ownerTenant->id, (int) ($newcomerSetting->meta['conflict_owner_tenant_id'] ?? 0));
        $this->assertSame('628111111111@c.us', $newcomerSetting->meta['conflict_connected_jid'] ?? null);

        $this->assertSame('connected', $ownerSetting->connection_status);
        $this->assertSame('628111111111@c.us', $ownerSetting->connected_jid);
        $this->assertTrue((bool) $ownerSetting->auto_connect);
    }

    public function test_connected_jid_unique_index_rejects_duplicate_non_null_values(): void
    {
        [$tenantA] = $this->seedTenantOwner('pro');
        [$tenantB] = $this->seedTenantOwner('basic');

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenantA->id,
            'session_name' => 'tenant-' . dechex((int) $tenantA->id),
            'connection_status' => 'connected',
            'connected_jid' => '628222222222@c.us',
            'auto_connect' => true,
        ]);

        $this->expectException(QueryException::class);

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenantB->id,
            'session_name' => 'tenant-' . dechex((int) $tenantB->id),
            'connection_status' => 'connected',
            'connected_jid' => '628222222222@c.us',
            'auto_connect' => true,
        ]);
    }

    public function test_internal_session_state_jid_conflict_triggers_remove_session_best_effort(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$ownerTenant] = $this->seedTenantOwner('pro');
        [$newcomerTenant] = $this->seedTenantOwner('basic');

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $ownerTenant->id,
            'session_name' => 'tenant-' . dechex((int) $ownerTenant->id),
            'connection_status' => 'connected',
            'connected_jid' => '628333333333@c.us',
            'auto_connect' => true,
        ]);

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/session/remove' => Http::response([
                'ok' => true,
                'data' => ['removed' => true],
            ], 200),
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/session-state', [
            'tenant_id' => $newcomerTenant->id,
            'connection_status' => 'connected',
            'connected_jid' => '628333333333@c.us',
            'auto_connect' => true,
            'meta' => ['lifecycle_state' => 'connected'],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        Http::assertSent(function ($request) use ($newcomerTenant) {
            return $request->url() === "http://wa-service.test/api/v1/tenants/{$newcomerTenant->id}/whatsapp/session/remove";
        });
    }

    public function test_internal_session_state_jid_conflict_remove_failure_does_not_fail_callback(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$ownerTenant] = $this->seedTenantOwner('pro');
        [$newcomerTenant] = $this->seedTenantOwner('basic');

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $ownerTenant->id,
            'session_name' => 'tenant-' . dechex((int) $ownerTenant->id),
            'connection_status' => 'connected',
            'connected_jid' => '628444444444@c.us',
            'auto_connect' => true,
        ]);

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/session/remove' => Http::response([
                'ok' => false,
                'error' => [
                    'code' => 'SERVICE_DOWN',
                    'message' => 'Service down',
                ],
            ], 503),
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/session-state', [
            'tenant_id' => $newcomerTenant->id,
            'connection_status' => 'connected',
            'connected_jid' => '628444444444@c.us',
            'auto_connect' => true,
            'meta' => ['lifecycle_state' => 'connected'],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        $newcomerSetting = TenantWhatsappSetting::query()
            ->where('tenant_id', $newcomerTenant->id)
            ->firstOrFail();
        $this->assertSame('disconnected', $newcomerSetting->connection_status);
        $this->assertSame('jid_conflict', $newcomerSetting->meta['disconnect_reason'] ?? null);
    }

    public function test_internal_session_state_preserves_jid_conflict_metadata_after_manual_remove_follow_up(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        [$ownerTenant] = $this->seedTenantOwner('pro');
        [$newcomerTenant] = $this->seedTenantOwner('basic');

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $ownerTenant->id,
            'session_name' => 'tenant-' . dechex((int) $ownerTenant->id),
            'connection_status' => 'connected',
            'connected_jid' => '628555555555@c.us',
            'auto_connect' => true,
        ]);

        $this->postJson('/internal/v1/whatsapp/session-state', [
            'tenant_id' => $newcomerTenant->id,
            'connection_status' => 'connected',
            'connected_jid' => '628555555555@c.us',
            'auto_connect' => true,
            'meta' => ['lifecycle_state' => 'connected'],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ])->assertOk();

        $this->postJson('/internal/v1/whatsapp/session-state', [
            'tenant_id' => $newcomerTenant->id,
            'connection_status' => 'disconnected',
            'connected_jid' => null,
            'auto_connect' => false,
            'meta' => [
                'disconnect_reason' => 'manual_remove',
                'lifecycle_state' => 'manual_remove',
            ],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ])->assertOk();

        $newcomerSetting = TenantWhatsappSetting::query()
            ->where('tenant_id', $newcomerTenant->id)
            ->firstOrFail();
        $this->assertSame('jid_conflict', $newcomerSetting->meta['disconnect_reason'] ?? null);
        $this->assertSame('manual_remove', $newcomerSetting->meta['lifecycle_state'] ?? null);
        $this->assertSame('628555555555@c.us', $newcomerSetting->meta['conflict_connected_jid'] ?? null);
        $this->assertSame($ownerTenant->id, (int) ($newcomerSetting->meta['conflict_owner_tenant_id'] ?? 0));
    }

    public function test_internal_sessions_supports_eligible_only_filter(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        [$tenantA] = $this->seedTenantOwner('pro');
        [$tenantB] = $this->seedTenantOwner('basic');
        [$tenantC] = $this->seedTenantOwner('enterprise');

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenantA->id,
            'session_name' => 'tenant-' . dechex((int) $tenantA->id),
            'connection_status' => 'connected',
            'auto_connect' => true,
        ]);
        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenantB->id,
            'session_name' => 'tenant-' . dechex((int) $tenantB->id),
            'connection_status' => 'disconnected',
            'auto_connect' => true,
        ]);
        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenantC->id,
            'session_name' => 'tenant-' . dechex((int) $tenantC->id),
            'connection_status' => 'connected',
            'auto_connect' => false,
        ]);

        $eligible = $this->getJson('/internal/v1/whatsapp/sessions?eligible_only=1', [
            'X-Internal-Token' => 'internal-secret',
        ]);
        $eligible->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonCount(1, 'data.sessions')
            ->assertJsonPath('data.sessions.0.tenant_id', $tenantA->id);

        $all = $this->getJson('/internal/v1/whatsapp/sessions?include_all=1', [
            'X-Internal-Token' => 'internal-secret',
        ]);
        $all->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonCount(3, 'data.sessions');
    }

    public function test_remove_session_sets_auto_connect_false_and_reason_manual_remove(): void
    {
        config()->set('whatsapp.enabled', true);
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');
        config()->set('whatsapp.internal_token', 'internal-secret');

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenant->id,
            'session_name' => 'tenant-' . dechex((int) $tenant->id),
            'connection_status' => 'connected',
            'connected_jid' => '628111111111@c.us',
            'auto_connect' => true,
            'meta' => ['qr_generated_at' => now()->toIso8601String()],
        ]);

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/session/remove' => Http::response([
                'ok' => true,
                'data' => ['connection_status' => 'disconnected', 'removed' => true],
            ], 200),
        ]);

        $response = $this->postJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session/remove");
        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.removed', true);

        $setting = TenantWhatsappSetting::query()->where('tenant_id', $tenant->id)->firstOrFail();
        $this->assertFalse((bool) $setting->auto_connect);
        $this->assertSame('disconnected', $setting->connection_status);
        $this->assertSame('manual_remove', $setting->meta['disconnect_reason'] ?? null);
    }

    public function test_session_endpoint_self_heals_stale_connecting_to_qr_timeout(): void
    {
        config()->set('whatsapp.enabled', true);
        config()->set('whatsapp.service_enabled', false);
        config()->set('whatsapp.connecting_timeout_ms', 60000);
        config()->set('whatsapp.connecting_stale_grace_ms', 15000);

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        $setting = TenantWhatsappSetting::query()->create([
            'tenant_id' => $tenant->id,
            'session_name' => 'tenant-' . dechex((int) $tenant->id),
            'connection_status' => 'connecting',
            'auto_connect' => true,
            'meta' => ['lifecycle_state' => 'connecting', 'qr_data_url' => 'stale'],
        ]);
        TenantWhatsappSetting::query()
            ->whereKey($setting->id)
            ->update([
                'updated_at' => now()->subMinutes(3),
                'created_at' => now()->subMinutes(3),
            ]);

        $response = $this->getJson("/api/v1/tenants/{$tenant->slug}/whatsapp/session");
        $response->assertOk()
            ->assertJsonPath('data.session.connection_status', 'disconnected')
            ->assertJsonPath('data.session.auto_connect', false)
            ->assertJsonPath('data.session.meta.lifecycle_state', 'qr_timeout');

        $setting->refresh();
        $this->assertSame('disconnected', $setting->connection_status);
        $this->assertFalse((bool) $setting->auto_connect);
        $this->assertSame('qr_timeout', $setting->meta['lifecycle_state'] ?? null);
    }

    public function test_chat_messages_requires_authentication(): void
    {
        config()->set('whatsapp.enabled', true);

        [$tenant] = $this->seedTenantOwner('pro');
        $jid = rawurlencode('628111111111@c.us');

        $response = $this->getJson("/api/v1/tenants/{$tenant->slug}/whatsapp/chats/{$jid}/messages");

        $response->assertUnauthorized();
    }

    public function test_chat_messages_returns_forbidden_when_plan_has_no_whatsapp_chat_feature(): void
    {
        config()->set('whatsapp.enabled', true);

        [$tenant, $user] = $this->seedTenantOwner('free');
        Sanctum::actingAs($user);
        $jid = rawurlencode('628111111111@c.us');

        $response = $this->getJson("/api/v1/tenants/{$tenant->slug}/whatsapp/chats/{$jid}/messages");

        $response->assertForbidden()
            ->assertJsonPath('error.code', 'FEATURE_NOT_AVAILABLE');
    }

    public function test_chat_messages_supports_cursor_pagination_by_before_id(): void
    {
        config()->set('whatsapp.enabled', true);

        [$tenant, $user] = $this->seedTenantOwner('pro');
        Sanctum::actingAs($user);

        $chatJid = '628111111111@c.us';
        for ($i = 1; $i <= 40; $i++) {
            TenantWhatsappMessage::query()->create([
                'tenant_id' => $tenant->id,
                'direction' => 'incoming',
                'whatsapp_message_id' => 'msg-' . $i,
                'sender_jid' => $chatJid,
                'recipient_jid' => '628999999999@c.us',
                'chat_jid' => $chatJid,
                'payload' => ['text' => 'message ' . $i],
            ]);
        }

        $encodedJid = rawurlencode($chatJid);
        $latestResponse = $this->getJson("/api/v1/tenants/{$tenant->slug}/whatsapp/chats/{$encodedJid}/messages");
        $latestResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.has_more', true);

        $latestMessages = $latestResponse->json('data.messages');
        $this->assertCount(15, $latestMessages);
        $this->assertSame('message 26', $latestMessages[0]['payload']['text']);
        $this->assertSame('message 40', $latestMessages[14]['payload']['text']);

        $nextBeforeId = $latestResponse->json('data.next_before_id');
        $this->assertNotNull($nextBeforeId);

        $olderResponse = $this->getJson(
            "/api/v1/tenants/{$tenant->slug}/whatsapp/chats/{$encodedJid}/messages?before_id={$nextBeforeId}&limit=15"
        );
        $olderResponse->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.has_more', true);

        $olderMessages = $olderResponse->json('data.messages');
        $this->assertCount(15, $olderMessages);
        $this->assertSame('message 11', $olderMessages[0]['payload']['text']);
        $this->assertSame('message 25', $olderMessages[14]['payload']['text']);
    }

    public function test_internal_incoming_ping_command_triggers_auto_reply(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$tenant] = $this->seedTenantOwner('pro');

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/messages/send' => Http::response([
                'ok' => true,
                'data' => [
                    'message_id' => 'reply-1',
                    'delivery' => 'queued',
                ],
            ], 200),
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/messages', [
            'tenant_id' => $tenant->id,
            'direction' => 'incoming',
            'whatsapp_message_id' => 'incoming-cmd-ping',
            'sender_jid' => '6287856575515@c.us',
            'recipient_jid' => '628111111111@c.us',
            'payload' => [
                'text' => '/ping',
            ],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        Http::assertSent(function ($request) use ($tenant) {
            $body = $request->data();
            return $request->url() === "http://wa-service.test/api/v1/tenants/{$tenant->id}/whatsapp/messages/send"
                && ($body['to'] ?? null) === '6287856575515@c.us'
                && str_contains((string) ($body['message'] ?? ''), 'Pong');
        });
    }

    public function test_internal_incoming_help_command_triggers_help_reply(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$tenant] = $this->seedTenantOwner('pro');

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/messages/send' => Http::response([
                'ok' => true,
                'data' => [
                    'message_id' => 'reply-2',
                    'delivery' => 'queued',
                ],
            ], 200),
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/messages', [
            'tenant_id' => $tenant->id,
            'direction' => 'incoming',
            'whatsapp_message_id' => 'incoming-cmd-help',
            'sender_jid' => '6287856575515@c.us',
            'recipient_jid' => '628111111111@c.us',
            'payload' => [
                'text' => '!help',
            ],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        Http::assertSent(function ($request) use ($tenant) {
            $body = $request->data();
            return $request->url() === "http://wa-service.test/api/v1/tenants/{$tenant->id}/whatsapp/messages/send"
                && ($body['to'] ?? null) === '6287856575515@c.us'
                && str_contains((string) ($body['message'] ?? ''), '/ping')
                && str_contains((string) ($body['message'] ?? ''), '/help');
        });
    }

    public function test_internal_incoming_unknown_command_returns_help_reply(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$tenant] = $this->seedTenantOwner('pro');

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/messages/send' => Http::response([
                'ok' => true,
                'data' => [
                    'message_id' => 'reply-3',
                    'delivery' => 'queued',
                ],
            ], 200),
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/messages', [
            'tenant_id' => $tenant->id,
            'direction' => 'incoming',
            'whatsapp_message_id' => 'incoming-cmd-unknown',
            'sender_jid' => '6287856575515@c.us',
            'recipient_jid' => '628111111111@c.us',
            'payload' => [
                'text' => '/unknown',
            ],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        Http::assertSent(function ($request) use ($tenant) {
            $body = $request->data();
            return $request->url() === "http://wa-service.test/api/v1/tenants/{$tenant->id}/whatsapp/messages/send"
                && str_contains((string) ($body['message'] ?? ''), '/help');
        });
    }

    public function test_internal_incoming_non_command_does_not_trigger_auto_reply(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$tenant] = $this->seedTenantOwner('pro');

        Http::fake();

        $response = $this->postJson('/internal/v1/whatsapp/messages', [
            'tenant_id' => $tenant->id,
            'direction' => 'incoming',
            'whatsapp_message_id' => 'incoming-plain-text',
            'sender_jid' => '6287856575515@c.us',
            'recipient_jid' => '628111111111@c.us',
            'payload' => [
                'text' => 'halo admin',
            ],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        Http::assertNothingSent();
    }

    public function test_internal_incoming_command_keeps_success_response_when_service_unavailable(): void
    {
        config()->set('whatsapp.internal_token', 'internal-secret');
        config()->set('whatsapp.service_enabled', true);
        config()->set('whatsapp.service_url', 'http://wa-service.test');

        [$tenant] = $this->seedTenantOwner('pro');

        Http::fake([
            'http://wa-service.test/api/v1/tenants/*/whatsapp/messages/send' => Http::response([
                'ok' => false,
                'error' => [
                    'code' => 'SERVICE_DOWN',
                    'message' => 'Service down',
                ],
            ], 503),
        ]);

        $response = $this->postJson('/internal/v1/whatsapp/messages', [
            'tenant_id' => $tenant->id,
            'direction' => 'incoming',
            'whatsapp_message_id' => 'incoming-cmd-service-down',
            'sender_jid' => '6287856575515@c.us',
            'recipient_jid' => '628111111111@c.us',
            'payload' => [
                'text' => '/ping',
            ],
        ], [
            'X-Internal-Token' => 'internal-secret',
        ]);

        $response->assertOk()->assertJsonPath('ok', true);

        Http::assertSent(function ($request) use ($tenant) {
            return $request->url() === "http://wa-service.test/api/v1/tenants/{$tenant->id}/whatsapp/messages/send";
        });
    }

    private function seedTenantOwner(string $planCode): array
    {
        $user = User::factory()->create();
        $tenant = Tenant::create([
            'owner_user_id' => $user->id,
            'name' => 'Tenant WhatsApp',
            'slug' => 'tenant-whatsapp-' . $planCode,
            'locale' => 'id',
            'timezone' => 'Asia/Jakarta',
            'plan_code' => $planCode,
            'status' => 'active',
        ]);

        TenantMember::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'full_name' => 'Owner WhatsApp',
            'role_code' => 'owner',
            'profile_status' => 'active',
            'row_version' => 1,
        ]);

        return [$tenant, $user];
    }
}
