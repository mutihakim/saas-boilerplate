<?php

namespace App\Http\Requests\Auth;

use App\Services\TurnstileService;
use App\Services\TwoFactorAuthService;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'otp_code' => ['nullable', 'string', 'max:20'],
            'turnstile_token' => ['nullable', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();
        $turnstile = app(TurnstileService::class);
        if (!$turnstile->verify($this->string('turnstile_token')->toString(), $this->ip())) {
            throw ValidationException::withMessages([
                'email' => 'Captcha validation failed.',
            ]);
        }

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $user = Auth::user();
        if ($user?->two_factor_confirmed_at) {
            $code = trim((string) $this->input('otp_code'));
            if ($code === '') {
                Auth::logout();
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'otp_code' => 'Authenticator code is required.',
                ]);
            }

            $twoFactor = app(TwoFactorAuthService::class);
            if (!$twoFactor->verifyCode($user, $code)) {
                Auth::logout();
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'otp_code' => 'Invalid authenticator or recovery code.',
                ]);
            }
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('email')).'|'.$this->ip());
    }
}
