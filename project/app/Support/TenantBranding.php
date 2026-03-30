<?php

namespace App\Support;

use App\Models\Tenant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Vite;
use InvalidArgumentException;

class TenantBranding
{
    public const SLOT_MAP = [
        'logo_light' => [
            'column' => 'logo_light_path',
            'filename' => 'logo-light',
            'fallback' => 'resources/images/appsah-logo-light.png',
            'key' => 'logoLightUrl',
        ],
        'logo_dark' => [
            'column' => 'logo_dark_path',
            'filename' => 'logo-dark',
            'fallback' => 'resources/images/appsah-logo-dark.png',
            'key' => 'logoDarkUrl',
        ],
        'logo_icon' => [
            'column' => 'logo_icon_path',
            'filename' => 'logo-icon',
            'fallback' => 'resources/images/appsah-logo-sm.png',
            'key' => 'logoIconUrl',
        ],
        'favicon' => [
            'column' => 'favicon_path',
            'filename' => 'favicon',
            'fallback' => 'public/favicon.ico',
            'key' => 'faviconUrl',
        ],
    ];

    public static function slotKeys(): array
    {
        return array_keys(self::SLOT_MAP);
    }

    public static function resolved(?Tenant $tenant): array
    {
        $resolved = [];

        foreach (self::SLOT_MAP as $slot => $config) {
            $path = $tenant?->getAttribute($config['column']);
            $resolved[$config['key']] = $path
                ? Storage::disk('public')->url($path)
                : self::safeViteAsset($config['fallback']);
        }

        return $resolved;
    }

    private static function safeViteAsset(string $assetPath): string
    {
        if ($assetPath === 'public/favicon.ico') {
            return asset('favicon.ico');
        }

        try {
            return Vite::asset($assetPath);
        } catch (\Throwable) {
            return asset(str_replace('resources/', '', $assetPath));
        }
    }

    public static function store(Tenant $tenant, string $slot, UploadedFile $file): string
    {
        $config = self::configFor($slot);
        $disk = Storage::disk('public');
        $directory = self::directory($tenant);
        $extension = self::normalizedExtension($file);
        $path = "{$directory}/{$config['filename']}.{$extension}";

        self::removeSlotFiles($tenant, $slot);
        $stored = $disk->putFileAs($directory, $file, "{$config['filename']}.{$extension}");

        if ($stored === false) {
            throw new InvalidArgumentException("Unable to store branding asset for slot [{$slot}].");
        }

        return $path;
    }

    public static function remove(Tenant $tenant, string $slot): void
    {
        self::configFor($slot);
        self::removeSlotFiles($tenant, $slot);
    }

    public static function purgeTenantAssets(Tenant $tenant): void
    {
        Storage::disk('public')->deleteDirectory("tenants/{$tenant->id}");
    }

    private static function removeSlotFiles(Tenant $tenant, string $slot): void
    {
        $config = self::configFor($slot);
        $disk = Storage::disk('public');
        $directory = self::directory($tenant);
        $prefix = "{$directory}/{$config['filename']}.";

        foreach ($disk->files($directory) as $filePath) {
            if (str_starts_with($filePath, $prefix)) {
                $disk->delete($filePath);
            }
        }
    }

    private static function normalizedExtension(UploadedFile $file): string
    {
        $original = strtolower((string) $file->getClientOriginalExtension());

        if ($original === 'svg') {
            return 'svg';
        }

        if ($original === 'ico') {
            return 'ico';
        }

        return $file->extension() ?: 'png';
    }

    private static function directory(Tenant $tenant): string
    {
        return "tenants/{$tenant->id}/branding";
    }

    private static function configFor(string $slot): array
    {
        $config = self::SLOT_MAP[$slot] ?? null;

        if (! is_array($config)) {
            throw new InvalidArgumentException("Unsupported branding slot [{$slot}].");
        }

        return $config;
    }
}
