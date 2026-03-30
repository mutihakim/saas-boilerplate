<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TenantMember;
use App\Support\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TenantMemberProfileApiController extends Controller
{
    use ApiResponder;

    public function update(Request $request, int $member)
    {
        $tenant = $request->attributes->get('currentTenant');
        $actor = $request->attributes->get('currentTenantMember');

        $target = TenantMember::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $member)
            ->firstOrFail();

        $this->authorize('update', [$target, $actor]);

        $payload = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'role_code' => [
                'required',
                'string',
                Rule::exists('roles', 'name')->where(fn ($query) => $query->where('tenant_id', $tenant->id)),
            ],
            'profile_status' => ['required', 'in:active,inactive'],
            'whatsapp_jid' => [
                'nullable',
                'string',
                'max:60',
                Rule::unique('tenant_members', 'whatsapp_jid')
                    ->ignore($target->id)
                    ->where(fn ($query) => $query
                        ->where('tenant_id', $tenant->id)
                        ->whereNull('deleted_at')),
            ],
            'row_version' => ['required', 'integer', 'min:1'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'address_line' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
        ]);

        $normalizedJid = $this->normalizeJidOrNull($payload['whatsapp_jid'] ?? null);

        $updated = DB::transaction(function () use ($target, $payload, $tenant, $normalizedJid) {
            $affected = TenantMember::query()
                ->where('id', $target->id)
                ->where('tenant_id', $tenant->id)
                ->where('row_version', $payload['row_version'])
                ->update([
                    'full_name' => $payload['full_name'],
                    'role_code' => $payload['role_code'],
                    'profile_status' => $payload['profile_status'],
                    'whatsapp_jid' => $normalizedJid,
                    'row_version' => DB::raw('row_version + 1'),
                    'updated_at' => now()->utc(),
                ]);

            if ($affected === 0) {
                return null;
            }

            $fresh = TenantMember::query()->findOrFail($target->id);

            if ($fresh->user) {
                $fresh->user->fill([
                    'name' => $payload['name'] ?? $fresh->user->name,
                    'email' => $payload['email'] ?? $fresh->user->email,
                    'phone' => $payload['phone'] ?? null,
                    'job_title' => $payload['job_title'] ?? null,
                    'bio' => $payload['bio'] ?? null,
                    'avatar_url' => $payload['avatar_url'] ?? null,
                    'address_line' => $payload['address_line'] ?? null,
                    'city' => $payload['city'] ?? null,
                    'country' => $payload['country'] ?? null,
                    'postal_code' => $payload['postal_code'] ?? null,
                ]);
                $fresh->user->save();
            }

            return $fresh->load('user');
        });

        if (!$updated) {
            $server = TenantMember::query()->findOrFail($target->id);

            return $this->error('VERSION_CONFLICT', 'Resource has been modified by another request.', [
                'current_row_version' => $server->row_version,
            ], 409);
        }

        return $this->ok([
            'member' => $updated,
        ]);
    }

    private function normalizeJidOrNull(?string $input): ?string
    {
        if ($input === null || trim($input) === '') {
            return null;
        }

        $trimmed = trim($input);
        if (preg_match('/^\d{6,20}@(c|g|lid)\.us$/', $trimmed) === 1) {
            return $trimmed;
        }

        $digits = preg_replace('/\D+/', '', $trimmed) ?? '';
        if (strlen($digits) < 6 || strlen($digits) > 20) {
            throw ValidationException::withMessages([
                'whatsapp_jid' => ['Invalid WhatsApp JID format.'],
            ]);
        }

        return $digits.'@c.us';
    }
}
