<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ThemePreferenceController extends Controller
{
    private const DEFAULT_PREFERENCES = [
        'version' => 1,
        'layoutType' => 'vertical',
        'layoutModeType' => 'light',
        'layoutWidthType' => 'fluid',
        'layoutPositionType' => 'fixed',
        'topbarThemeType' => 'light',
        'leftSidebarType' => 'gradient',
        'leftsidbarSizeType' => 'lg',
        'leftSidebarViewType' => 'default',
        'leftSidebarImageType' => 'none',
        'sidebarVisibilitytype' => 'show',
        'preloader' => 'disable',
    ];

    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->ui_preferences = $this->normalizePreferences($request->all());
        $user->save();

        return response()->json([
            'ok' => true,
            'data' => [
                'saved' => true,
            ],
        ]);
    }

    private function normalizePreferences(array $payload): array
    {
        if (array_key_exists('appShell', $payload)) {
            $validated = Validator::make($payload, [
                'version' => ['nullable', 'integer'],
                'appShell' => ['required', 'array'],
                'appShell.layoutType' => ['nullable', 'in:vertical,horizontal,twocolumn,semibox'],
                'appShell.layoutModeType' => ['nullable', 'in:light,dark'],
                'appShell.layoutWidthType' => ['nullable', 'in:fluid,boxed,lg'],
                'appShell.layoutPositionType' => ['nullable', 'in:fixed,scrollable'],
                'appShell.topbarThemeType' => ['nullable', 'in:light,dark'],
                'appShell.leftSidebarType' => ['nullable', 'in:light,dark,gradient,gradient-2,gradient-3,gradient-4'],
                'appShell.leftsidbarSizeType' => ['nullable', 'in:lg,md,sm,sm-hover,sm-hover-active'],
                'appShell.leftSidebarViewType' => ['nullable', 'in:default,detached'],
                'appShell.leftSidebarImageType' => ['nullable', 'in:none,img-1,img-2,img-3,img-4'],
                'appShell.sidebarVisibilitytype' => ['nullable', 'in:show,hidden'],
                'appShell.preloader' => ['nullable', 'in:enable,disable'],
                'appShell.colorMode' => ['nullable', 'in:light,dark'],
                'appShell.contentWidth' => ['nullable', 'in:fluid,boxed'],
                'appShell.sidebarSize' => ['nullable', 'in:lg,md,sm,sm-hover,sm-hover-active'],
                'appShell.topbarTheme' => ['nullable', 'in:light,dark'],
                'appShell.sidebarTheme' => ['nullable', 'in:light,dark,gradient,gradient-2,gradient-3,gradient-4'],
                'appShell.layoutPosition' => ['nullable', 'in:fixed,scrollable'],
            ])->validate();

            return [
                'version' => 4,
                'appShell' => $this->normalizeAppShell($validated['appShell']),
            ];
        }

        if (array_key_exists('adminShell', $payload) || array_key_exists('workspaceShell', $payload)) {
            $validated = Validator::make($payload, [
                'version' => ['nullable', 'integer'],
                'adminShell' => ['nullable', 'array'],
                'workspaceShell' => ['nullable', 'array'],
            ])->validate();

            return [
                'version' => 4,
                'appShell' => $this->normalizeFromSplitPreferences($validated),
            ];
        }

        if (
            array_key_exists('colorMode', $payload)
            || array_key_exists('sidebarCollapsed', $payload)
            || array_key_exists('contentWidth', $payload)
            || array_key_exists('sidebarSize', $payload)
        ) {
            $validated = Validator::make($payload, [
                'version' => ['nullable', 'integer'],
                'colorMode' => ['required', 'in:light,dark'],
                'sidebarCollapsed' => ['nullable', 'boolean'],
                'contentWidth' => ['required', 'in:fluid,boxed'],
                'sidebarSize' => ['nullable', 'in:lg,md,sm,sm-hover,sm-hover-active'],
                'topbarTheme' => ['nullable', 'in:light,dark'],
                'sidebarTheme' => ['nullable', 'in:light,dark,gradient,gradient-2,gradient-3,gradient-4'],
                'layoutPosition' => ['nullable', 'in:fixed,scrollable'],
            ])->validate();

            return [
                'version' => 4,
                'appShell' => $this->normalizeAppShell([
                    'layoutType' => 'vertical',
                    'layoutModeType' => $validated['colorMode'],
                    'layoutWidthType' => $validated['contentWidth'],
                    'layoutPositionType' => $validated['layoutPosition'] ?? 'fixed',
                    'topbarThemeType' => $validated['topbarTheme'] ?? 'light',
                    'leftSidebarType' => $validated['sidebarTheme'] ?? 'gradient',
                    'leftsidbarSizeType' => $validated['sidebarSize'] ?? (($validated['sidebarCollapsed'] ?? false) ? 'sm' : 'lg'),
                    'leftSidebarViewType' => 'default',
                    'leftSidebarImageType' => 'none',
                    'sidebarVisibilitytype' => 'show',
                    'preloader' => 'disable',
                ]),
            ];
        }

        $validated = Validator::make($payload, [
            'layoutType' => ['nullable', 'string', 'max:32'],
            'layoutModeType' => ['required', 'string', 'max:32'],
            'layoutWidthType' => ['required', 'string', 'max:32'],
            'leftsidbarSizeType' => ['required', 'string', 'max:32'],
            'topbarThemeType' => ['nullable', 'string', 'max:32'],
            'leftSidebarType' => ['nullable', 'string', 'max:32'],
            'layoutPositionType' => ['nullable', 'string', 'max:32'],
            'leftSidebarViewType' => ['nullable', 'string', 'max:32'],
            'leftSidebarImageType' => ['nullable', 'string', 'max:32'],
            'sidebarVisibilitytype' => ['nullable', 'string', 'max:32'],
            'preloader' => ['nullable', 'string', 'max:32'],
        ])->validate();

        return [
            'version' => 4,
            'appShell' => $this->normalizeAppShell($validated),
        ];
    }

    private function normalizeFromSplitPreferences(array $validated): array
    {
        $adminShell = $validated['adminShell'] ?? null;
        if (is_array($adminShell) && ! empty($adminShell)) {
            return $this->normalizeAppShell($adminShell);
        }

        $workspaceShell = $validated['workspaceShell'] ?? [];

        return $this->normalizeAppShell([
            'layoutType' => 'vertical',
            'layoutModeType' => $workspaceShell['colorMode'] ?? 'light',
            'layoutWidthType' => $workspaceShell['contentWidth'] ?? 'fluid',
            'layoutPositionType' => 'fixed',
            'topbarThemeType' => 'light',
            'leftSidebarType' => 'gradient',
            'leftsidbarSizeType' => ($workspaceShell['sidebarCollapsed'] ?? false) ? 'sm' : 'lg',
            'leftSidebarViewType' => 'default',
            'leftSidebarImageType' => 'none',
            'sidebarVisibilitytype' => 'show',
            'preloader' => 'disable',
        ]);
    }

    private function normalizeAppShell(array $payload): array
    {
        $normalized = self::DEFAULT_PREFERENCES;

        if (($payload['layoutType'] ?? null) === 'horizontal' || ($payload['layoutType'] ?? null) === 'twocolumn' || ($payload['layoutType'] ?? null) === 'semibox') {
            $normalized['layoutType'] = $payload['layoutType'];
        }

        $normalized['layoutModeType'] = ($payload['layoutModeType'] ?? $payload['colorMode'] ?? 'light') === 'dark' ? 'dark' : 'light';
        $normalized['layoutWidthType'] = ($payload['layoutWidthType'] ?? $payload['contentWidth'] ?? 'fluid') === 'boxed' ? 'boxed' : 'fluid';
        $normalized['layoutPositionType'] = ($payload['layoutPositionType'] ?? $payload['layoutPosition'] ?? 'fixed') === 'scrollable' ? 'scrollable' : 'fixed';
        $normalized['topbarThemeType'] = ($payload['topbarThemeType'] ?? $payload['topbarTheme'] ?? 'light') === 'dark' ? 'dark' : 'light';

        $sidebarTheme = $payload['leftSidebarType'] ?? $payload['sidebarTheme'] ?? 'gradient';
        if (in_array($sidebarTheme, ['light', 'dark', 'gradient', 'gradient-2', 'gradient-3', 'gradient-4'], true)) {
            $normalized['leftSidebarType'] = $sidebarTheme;
        }

        $sidebarSize = $payload['leftsidbarSizeType'] ?? $payload['sidebarSize'] ?? 'lg';
        if ($sidebarSize === 'sm-hover-active') {
            $sidebarSize = 'sm-hover';
        }
        if (in_array($sidebarSize, ['lg', 'md', 'sm', 'sm-hover'], true)) {
            $normalized['leftsidbarSizeType'] = $sidebarSize;
        }

        if (($payload['leftSidebarViewType'] ?? 'default') === 'detached') {
            $normalized['leftSidebarViewType'] = 'detached';
        }

        $sidebarImage = $payload['leftSidebarImageType'] ?? 'none';
        if (in_array($sidebarImage, ['none', 'img-1', 'img-2', 'img-3', 'img-4'], true)) {
            $normalized['leftSidebarImageType'] = $sidebarImage;
        }

        if (($payload['sidebarVisibilitytype'] ?? 'show') === 'hidden') {
            $normalized['sidebarVisibilitytype'] = 'hidden';
        }

        if (($payload['preloader'] ?? 'disable') === 'enable') {
            $normalized['preloader'] = 'enable';
        }

        if ($normalized['layoutType'] === 'horizontal') {
            $normalized['leftsidbarSizeType'] = 'lg';
            $normalized['leftSidebarViewType'] = 'default';
            $normalized['sidebarVisibilitytype'] = 'show';
        }

        if ($normalized['layoutType'] === 'twocolumn') {
            $normalized['layoutWidthType'] = 'fluid';
            $normalized['leftSidebarViewType'] = 'default';
        }

        if ($normalized['layoutType'] === 'semibox') {
            $normalized['layoutWidthType'] = 'fluid';
            $normalized['leftSidebarViewType'] = 'default';
        }

        return $normalized;
    }
}
