<?php

namespace App\Models;

use App\Support\TenantBranding;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Stancl\Tenancy\Contracts\Tenant as TenantContract;
use Stancl\Tenancy\Tenancy;

class Tenant extends Model implements TenantContract
{
    use HasFactory;
    protected array $tenancyInternal = [];

    protected $fillable = [
        'owner_user_id',
        'name',
        'slug',
        'display_name',
        'legal_name',
        'registration_number',
        'tax_id',
        'industry',
        'website_url',
        'support_email',
        'billing_email',
        'billing_contact_name',
        'phone',
        'address_line_1',
        'address_line_2',
        'city',
        'state_region',
        'postal_code',
        'country_code',
        'locale',
        'timezone',
        'currency_code',
        'plan_code',
        'status',
        'logo_light_path',
        'logo_dark_path',
        'logo_icon_path',
        'favicon_path',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Tenant $tenant): void {
            TenantBranding::purgeTenantAssets($tenant);
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getTenantKeyName(): string
    {
        return 'slug';
    }

    public function getTenantKey()
    {
        return $this->getAttribute($this->getTenantKeyName());
    }

    public function getInternal(string $key)
    {
        return $this->tenancyInternal[$key] ?? null;
    }

    public function setInternal(string $key, $value)
    {
        $this->tenancyInternal[$key] = $value;
    }

    public function run(callable $callback)
    {
        /** @var Tenancy $tenancy */
        $tenancy = app(Tenancy::class);
        $previous = $tenancy->tenant;
        $tenancy->initialize($this);

        try {
            return $callback($this);
        } finally {
            if ($previous) {
                $tenancy->initialize($previous);
            } else {
                $tenancy->end();
            }
        }
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function members()
    {
        return $this->hasMany(TenantMember::class);
    }

    public function presentableName(): string
    {
        return Str::of((string) ($this->display_name ?: $this->name))->trim()->value() ?: $this->name;
    }
}
