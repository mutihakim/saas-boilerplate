<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class TenantLocalizationUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $countryCode = strtoupper((string) $this->input('country_code', ''));
        $currencyCode = strtoupper((string) $this->input('currency_code', ''));

        $this->merge([
            'country_code' => $countryCode !== '' ? $countryCode : null,
            'currency_code' => $currencyCode !== '' ? $currencyCode : null,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'locale' => ['required', 'string', 'max:10'],
            'timezone' => ['required', 'timezone'],
            'currency_code' => ['required', 'string', 'size:3'],
            'country_code' => ['required', 'string', 'size:2'],
        ];
    }
}
