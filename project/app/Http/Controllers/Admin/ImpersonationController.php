<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    use ApiResponder;

    public function start(Request $request, User $user)
    {
        $actor = $request->user();
        abort_unless($actor?->is_superadmin, 403);

        if ($user->is_superadmin) {
            return $this->error('INVALID_TARGET', 'Cannot impersonate another superadmin.', [], 422);
        }

        $request->session()->put('impersonator_id', $actor->id);
        Auth::login($user);

        return $this->ok([
            'impersonating' => true,
            'target_user_id' => $user->id,
        ]);
    }

    public function stop(Request $request)
    {
        $impersonatorId = $request->session()->pull('impersonator_id');
        if (!$impersonatorId) {
            return $this->error('NOT_IMPERSONATING', 'No active impersonation session.', [], 422);
        }

        $impersonator = User::query()->find($impersonatorId);
        if (!$impersonator || !$impersonator->is_superadmin) {
            return $this->error('INVALID_IMPERSONATOR', 'Original superadmin account not found.', [], 404);
        }

        Auth::login($impersonator);

        return $this->ok([
            'impersonating' => false,
        ]);
    }
}

