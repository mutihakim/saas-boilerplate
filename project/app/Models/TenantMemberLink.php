<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantMemberLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'member_id',
        'linked_member_id',
        'link_type',
        'access_scope',
    ];
}
