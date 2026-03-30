<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'job_title',
        'bio',
        'avatar_url',
        'address_line',
        'city',
        'country',
        'postal_code',
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'is_superadmin',
        'ui_preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_superadmin' => 'boolean',
        'ui_preferences' => 'array',
        'two_factor_confirmed_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function tenantMemberships()
    {
        return $this->hasMany(TenantMember::class);
    }

    public function ownedTenants()
    {
        return $this->hasMany(Tenant::class, 'owner_user_id');
    }

    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }
}
