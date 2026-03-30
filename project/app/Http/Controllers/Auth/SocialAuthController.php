<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\TenantMember;
use App\Models\User;
use App\Services\TenantProvisioningService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect(string $provider)
    {
        abort_unless(in_array($provider, ['google', 'github'], true), 404);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider, TenantProvisioningService $provisioningService)
    {
        abort_unless(in_array($provider, ['google', 'github'], true), 404);

        $socialUser = Socialite::driver($provider)->user();
        $email = $socialUser->getEmail();

        $user = DB::transaction(function () use ($provider, $socialUser, $email, $provisioningService) {
            $account = SocialAccount::query()
                ->where('provider', $provider)
                ->where('provider_id', $socialUser->getId())
                ->first();

            if ($account) {
                return $account->user;
            }

            $user = $email
                ? User::query()->where('email', $email)->first()
                : null;

            if (!$user) {
                $user = User::query()->create([
                    'name' => $socialUser->getName() ?: ($socialUser->getNickname() ?: 'Social User'),
                    'email' => $email ?: sprintf('%s_%s@social.local', $provider, Str::uuid()),
                    'email_verified_at' => now()->utc(),
                    'password' => Str::password(32),
                ]);

                $provisioningService->provisionDefaultWorkspaceForUser($user);
            }

            SocialAccount::query()->updateOrCreate(
                [
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ],
                [
                    'user_id' => $user->id,
                    'provider_email' => $email,
                    'provider_payload' => [
                        'name' => $socialUser->getName(),
                        'nickname' => $socialUser->getNickname(),
                        'avatar' => $socialUser->getAvatar(),
                    ],
                ]
            );

            return $user;
        });

        Auth::login($user, true);

        if ($user->is_superadmin) {
            return redirect('/tenants');
        }

        $membership = TenantMember::query()
            ->with('tenant:id,slug')
            ->where('user_id', $user->id)
            ->where('profile_status', 'active')
            ->whereNull('deleted_at')
            ->first();

        if ($membership?->tenant?->slug) {
            return redirect("/t/{$membership->tenant->slug}/dashboard");
        }

        return redirect('/tenant-access-required');
    }
}

