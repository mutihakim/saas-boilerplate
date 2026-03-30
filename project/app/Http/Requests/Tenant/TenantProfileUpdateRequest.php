<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class TenantProfileUpdateRequest extends FormRequest
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
            'display_name' => ['nullable', 'string', 'max:160'],
            'legal_name' => ['nullable', 'string', 'max:160'],
            'registration_number' => ['nullable', 'string', 'max:120'],
            'tax_id' => ['nullable', 'string', 'max:120'],
            'industry' => ['nullable', 'string', 'max:120'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'billing_email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'state_region' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:40'],
            'country_code' => ['nullable', 'string', 'size:2'],
        ];
    }
}
