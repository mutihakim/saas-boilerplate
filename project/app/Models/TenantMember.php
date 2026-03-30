<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TenantMember extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const ROLES = [
        'owner',
        'admin',
        'operator',
        'member',
        'viewer',
        'tenant_owner',
        'tenant_admin',
        'tenant_operator',
        'tenant_member',
        'tenant_viewer',
    ];

    protected $fillable = [
        'tenant_id',
        'user_id',
        'full_name',
        'role_code',
        'profile_status',
        'onboarding_status',
        'whatsapp_jid',
        'row_version',
    ];

    protected $casts = [
        'row_version' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
