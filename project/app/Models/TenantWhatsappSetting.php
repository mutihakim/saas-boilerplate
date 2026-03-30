<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantWhatsappSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'session_name',
        'connection_status',
        'connected_jid',
        'auto_connect',
        'meta',
    ];

    protected $casts = [
        'auto_connect' => 'boolean',
        'meta' => 'array',
    ];
}

