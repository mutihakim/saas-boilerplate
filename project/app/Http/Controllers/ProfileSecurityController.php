<?php

namespace App\Http\Controllers;

use App\Services\TwoFactorAuthService;
use App\Support\ApiResponder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileSecurityController extends Controller
{
    use ApiResponder;

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Auth/Security', [
            'mfa' => [
                'enabled' => (bool) $user->two_factor_confirmed_at,
                'confirmed_at' => $user->two_factor_confirmed_at,
                'has_recovery_codes' => !empty($user->two_factor_recovery_codes),
            ],
        ]);
    }

    public function enable(Request $request, TwoFactorAuthService $twoFactor): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $secret = $twoFactor->generateSecret();
        $recoveryCodes = $twoFactor->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            'two_factor_confirmed_at' => null,
        ])->save();

        return $this->ok([
            'secret' => $secret,
            'otpauth_url' => $twoFactor->qrUrl($user, $secret),
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function verify(Request $request, TwoFactorAuthService $twoFactor): \Illuminate\Http\JsonResponse
    {
        $payload = $request->validate([
            'code' => ['required', 'string', 'max:20'],
        ]);

        $user = $request->user();

        if (!$twoFactor->verifyCode($user, $payload['code'])) {
            return $this->error('MFA_INVALID_CODE', 'Invalid authenticator or recovery code.', [], 422);
        }

        if (!$user->two_factor_confirmed_at) {
            $user->forceFill([
                'two_factor_confirmed_at' => now()->utc(),
            ])->save();
        }

        return $this->ok(['enabled' => true]);
    }

    public function disable(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return $this->ok(['enabled' => false]);
    }

    public function passkeys(Request $request): \Illuminate\Http\JsonResponse
    {
        return $this->error('NOT_IMPLEMENTED', 'Passkeys is planned after MFA stabilization phase.', [], 501);
    }
}

