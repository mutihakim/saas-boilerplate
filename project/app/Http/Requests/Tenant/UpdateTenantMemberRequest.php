<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTenantMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenant = $this->attributes->get('currentTenant');
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'role_code' => [
                'required',
                'string',
                Rule::exists('roles', 'name')->where(fn ($query) => $query->where('tenant_id', $tenant?->id)),
                Rule::notIn(['owner', 'tenant_owner']),
            ],
            'profile_status' => ['required', 'string', Rule::in(['active', 'inactive'])],
            'whatsapp_jid' => [
                'nullable',
                'string',
                'max:60',
                Rule::unique('tenant_members', 'whatsapp_jid')
                    ->ignore((int) $this->route('member'))
                    ->where(fn ($query) => $query
                        ->where('tenant_id', $tenant?->id)
                        ->whereNull('deleted_at')),
            ],
            'row_version' => ['required', 'integer', 'min:1'],
        ];
    }
}
