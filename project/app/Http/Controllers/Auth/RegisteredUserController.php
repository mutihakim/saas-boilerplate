<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\TenantInvitation;
use App\Models\TenantMember;
use App\Models\User;
use App\Services\TenantProvisioningService;
use App\Services\TurnstileService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $invitationToken = request()->query('invitation_token');
        $invitationEmail = null;
        if ($invitationToken) {
            $invitation = TenantInvitation::query()
                ->where('token', (string) $invitationToken)
                ->where('status', 'pending')
                ->first();
            if ($invitation && !$invitation->expires_at->isPast()) {
                $invitationEmail = $invitation->email;
            }
        }

        return Inertia::render('Auth/Register', [
            'turnstileSiteKey' => app(TurnstileService::class)->siteKey(),
            'turnstileEnabled' => app(TurnstileService::class)->enabled(),
            'invitationToken' => $invitationToken,
            'invitationEmail' => $invitationEmail,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, TenantProvisioningService $provisioningService, TurnstileService $turnstile): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'turnstile_token' => ['nullable', 'string'],
            'invitation_token' => ['nullable', 'string', 'max:255'],
        ]);

        if (!$turnstile->verify($request->string('turnstile_token')->toString(), $request->ip())) {
            return back()
                ->withErrors(['email' => 'Captcha validation failed.'])
                ->withInput($request->except(['password', 'password_confirmation']));
        }

        $invitationToken = $request->string('invitation_token')->toString();
        if ($invitationToken !== '') {
            $invitation = TenantInvitation::query()
                ->where('token', $invitationToken)
                ->where('status', 'pending')
                ->first();

            if (!$invitation || $invitation->expires_at->isPast()) {
                return back()
                    ->withErrors(['email' => 'Invitation is invalid or expired.'])
                    ->withInput($request->except(['password', 'password_confirmation']));
            }

            if (strtolower($request->string('email')->toString()) !== strtolower($invitation->email)) {
                return back()
                    ->withErrors(['email' => 'Email must match invited email address.'])
                    ->withInput($request->except(['password', 'password_confirmation']));
            }
        }

        $user = DB::transaction(function () use ($request, $provisioningService, $invitationToken) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            if ($invitationToken === '') {
                $provisioningService->provisionDefaultWorkspaceForUser($user);
            }

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        if ($invitationToken !== '') {
            return redirect("/invitations/accept/{$invitationToken}");
        }

        $membership = TenantMember::query()
            ->with('tenant:id,slug')
            ->where('user_id', $user->id)
            ->where('profile_status', 'active')
            ->first();

        if ($membership?->tenant?->slug) {
            return redirect("/t/{$membership->tenant->slug}/dashboard");
        }

        return redirect('/tenant-access-required');
    }
}
