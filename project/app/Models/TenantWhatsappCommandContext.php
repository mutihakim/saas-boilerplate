<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantWhatsappCommandContext extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'sender_jid',
        'context_type',
        'payload',
        'expires_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'expires_at' => 'datetime',
    ];
}

