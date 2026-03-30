<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class TenantBrandingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'logo_light' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
            'logo_dark' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
            'logo_icon' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:1024'],
            'favicon' => ['nullable', 'file', 'mimes:ico,png,svg', 'max:512'],
        ];
    }
}
