<?php

namespace App\Services;

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthService
{
    public function __construct(private readonly Google2FA $google2fa)
    {
    }

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    public function qrUrl(User $user, string $secret): string
    {
        return $this->google2fa->getQRCodeUrl(config('app.name'), $user->email, $secret);
    }

    public function generateRecoveryCodes(int $count = 8): array
    {
        return collect(range(1, $count))
            ->map(fn () => strtoupper(bin2hex(random_bytes(4)) . '-' . bin2hex(random_bytes(4))))
            ->all();
    }

    public function verifyCode(User $user, string $code): bool
    {
        $secret = $user->two_factor_secret ? decrypt($user->two_factor_secret) : null;
        if (!$secret) {
            return false;
        }

        if ($this->google2fa->verifyKey($secret, trim($code))) {
            return true;
        }

        $codes = $this->recoveryCodes($user);
        $idx = array_search(strtoupper(trim($code)), $codes, true);
        if ($idx === false) {
            return false;
        }

        unset($codes[$idx]);
        $user->forceFill([
            'two_factor_recovery_codes' => encrypt(json_encode(array_values($codes))),
        ])->save();

        return true;
    }

    public function recoveryCodes(User $user): array
    {
        if (!$user->two_factor_recovery_codes) {
            return [];
        }

        $decoded = json_decode((string) decrypt($user->two_factor_recovery_codes), true);

        return is_array($decoded) ? array_values($decoded) : [];
    }
}

