<?php

use App\Models\TenantMember;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('tenant.{tenantId}.whatsapp', function ($user, $tenantId) {
    if ((bool) $user->is_superadmin) {
        return true;
    }

    return TenantMember::query()
        ->where('tenant_id', (int) $tenantId)
        ->where('user_id', (int) $user->id)
        ->where('profile_status', 'active')
        ->whereNull('deleted_at')
        ->exists();
});
