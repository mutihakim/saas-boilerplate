<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class MfaAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_with_confirmed_mfa_must_submit_code(): void
    {
        config(['services.turnstile.enabled' => false]);

        $user = User::factory()->create([
            'password' => bcrypt('password'),
            'two_factor_secret' => encrypt(app(Google2FA::class)->generateSecretKey()),
            'two_factor_recovery_codes' => encrypt(json_encode(['RECOVERY-TEST'])),
            'two_factor_confirmed_at' => now()->utc(),
        ]);

        $response = $this->from('/login')->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('otp_code');
        $this->assertGuest();
    }
}

