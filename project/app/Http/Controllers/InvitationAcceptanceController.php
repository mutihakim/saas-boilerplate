<?php

namespace App\Http\Controllers;

use App\Models\TenantInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvitationAcceptanceController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        $invitation = TenantInvitation::query()
            ->where('token', $token)
            ->first();

        $status = 'invalid';
        if ($invitation) {
            if ($invitation->status !== 'pending') {
                $status = $invitation->status;
            } elseif ($invitation->expires_at->isPast()) {
                $status = 'expired';
            } else {
                $status = 'pending';
            }
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'token' => $token,
            'status' => $status,
            'invitation' => $invitation ? [
                'email' => $invitation->email,
                'full_name' => $invitation->full_name,
                'role_code' => $invitation->role_code,
                'note' => $invitation->note,
                'tenant_name' => $invitation->tenant?->name,
            ] : null,
        ]);
    }
}
