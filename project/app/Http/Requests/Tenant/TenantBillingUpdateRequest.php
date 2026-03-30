<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class TenantBillingUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $countryCode = strtoupper((string) $this->input('country_code', ''));

        $this->merge([
            'country_code' => $countryCode !== '' ? $countryCode : null,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'billing_contact_name' => ['nullable', 'string', 'max:160'],
            'billing_email' => ['nullable', 'email', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:160'],
            'tax_id' => ['nullable', 'string', 'max:120'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'state_region' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:40'],
            'country_code' => ['nullable', 'string', 'size:2'],
        ];
    }
}
