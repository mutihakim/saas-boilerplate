<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TurnstileService
{
    public function enabled(): bool
    {
        return filter_var(config('services.turnstile.enabled'), FILTER_VALIDATE_BOOL);
    }

    public function siteKey(): ?string
    {
        return config('services.turnstile.site_key');
    }

    public function verify(?string $token, ?string $ip = null): bool
    {
        if (!$this->enabled()) {
            return true;
        }

        $secret = (string) config('services.turnstile.secret_key');
        if ($secret === '' || !$token) {
            return false;
        }

        $response = Http::asForm()
            ->timeout(6)
            ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]);

        return (bool) data_get($response->json(), 'success', false);
    }
}
