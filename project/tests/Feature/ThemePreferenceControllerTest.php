<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemePreferenceControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_flat_workspace_theme_payload_is_normalized_into_full_app_shell_preferences(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/settings/theme', [
                'colorMode' => 'dark',
                'sidebarCollapsed' => true,
                'contentWidth' => 'boxed',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertSame([
            'version' => 4,
            'appShell' => [
                'version' => 1,
                'layoutType' => 'vertical',
                'layoutModeType' => 'dark',
                'layoutWidthType' => 'boxed',
                'layoutPositionType' => 'fixed',
                'topbarThemeType' => 'light',
                'leftSidebarType' => 'gradient',
                'leftsidbarSizeType' => 'sm',
                'leftSidebarViewType' => 'default',
                'leftSidebarImageType' => 'none',
                'sidebarVisibilitytype' => 'show',
                'preloader' => 'disable',
            ],
        ], $user->fresh()->ui_preferences);
    }

    public function test_legacy_split_payload_is_collapsed_into_single_app_shell_namespace(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/settings/theme', [
                'version' => 3,
                'adminShell' => [
                    'layoutType' => 'twocolumn',
                    'layoutModeType' => 'light',
                    'layoutWidthType' => 'fluid',
                    'layoutPositionType' => 'fixed',
                    'topbarThemeType' => 'dark',
                    'leftSidebarType' => 'gradient-3',
                    'leftsidbarSizeType' => 'md',
                    'leftSidebarViewType' => 'default',
                    'leftSidebarImageType' => 'img-2',
                    'sidebarVisibilitytype' => 'show',
                    'preloader' => 'disable',
                ],
                'workspaceShell' => [
                    'colorMode' => 'dark',
                    'sidebarCollapsed' => false,
                    'contentWidth' => 'boxed',
                ],
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $preferences = $user->fresh()->ui_preferences['appShell'];
        $this->assertSame('twocolumn', $preferences['layoutType']);
        $this->assertSame('dark', $preferences['topbarThemeType']);
        $this->assertSame('gradient-3', $preferences['leftSidebarType']);
        $this->assertSame('img-2', $preferences['leftSidebarImageType']);
    }

    public function test_legacy_velzon_payload_is_mapped_to_the_shared_app_shell(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/settings/theme', [
                'layoutType' => 'semibox',
                'layoutModeType' => 'dark',
                'layoutWidthType' => 'boxed',
                'leftsidbarSizeType' => 'sm-hover',
                'topbarThemeType' => 'dark',
                'leftSidebarType' => 'gradient-4',
                'layoutPositionType' => 'scrollable',
                'leftSidebarViewType' => 'detached',
                'leftSidebarImageType' => 'img-4',
                'sidebarVisibilitytype' => 'hidden',
                'preloader' => 'enable',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $preferences = $user->fresh()->ui_preferences['appShell'];
        $this->assertSame('semibox', $preferences['layoutType']);
        $this->assertSame('dark', $preferences['layoutModeType']);
        $this->assertSame('fluid', $preferences['layoutWidthType']);
        $this->assertSame('sm-hover', $preferences['leftsidbarSizeType']);
        $this->assertSame('gradient-4', $preferences['leftSidebarType']);
        $this->assertSame('img-4', $preferences['leftSidebarImageType']);
        $this->assertSame('hidden', $preferences['sidebarVisibilitytype']);
        $this->assertSame('enable', $preferences['preloader']);
    }

    public function test_namespaced_app_shell_payload_is_persisted_as_the_canonical_shape(): void
    {
        $user = User::factory()->create();

        $payload = [
            'version' => 4,
            'appShell' => [
                'layoutType' => 'horizontal',
                'layoutModeType' => 'light',
                'layoutWidthType' => 'boxed',
                'layoutPositionType' => 'scrollable',
                'topbarThemeType' => 'dark',
                'leftSidebarType' => 'dark',
                'leftsidbarSizeType' => 'md',
                'leftSidebarViewType' => 'detached',
                'leftSidebarImageType' => 'img-1',
                'sidebarVisibilitytype' => 'show',
                'preloader' => 'enable',
            ],
        ];

        $this->actingAs($user)
            ->putJson('/settings/theme', $payload)
            ->assertOk()
            ->assertJsonPath('ok', true);

        $preferences = $user->fresh()->ui_preferences['appShell'];
        $this->assertSame('horizontal', $preferences['layoutType']);
        $this->assertSame('boxed', $preferences['layoutWidthType']);
        $this->assertSame('enable', $preferences['preloader']);
        $this->assertSame('dark', $preferences['leftSidebarType']);
    }

    public function test_transitional_minimal_app_shell_payload_is_upgraded_into_full_canonical_shape(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/settings/theme', [
                'version' => 4,
                'appShell' => [
                    'colorMode' => 'dark',
                    'contentWidth' => 'boxed',
                    'sidebarSize' => 'sm',
                    'topbarTheme' => 'dark',
                    'sidebarTheme' => 'gradient',
                    'layoutPosition' => 'scrollable',
                ],
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $preferences = $user->fresh()->ui_preferences['appShell'];
        $this->assertSame('vertical', $preferences['layoutType']);
        $this->assertSame('dark', $preferences['layoutModeType']);
        $this->assertSame('boxed', $preferences['layoutWidthType']);
        $this->assertSame('sm', $preferences['leftsidbarSizeType']);
        $this->assertSame('scrollable', $preferences['layoutPositionType']);
    }
}
