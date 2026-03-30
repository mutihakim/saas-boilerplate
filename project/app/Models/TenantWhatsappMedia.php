<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantWhatsappMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'sender_jid',
        'mime_type',
        'size_bytes',
        'storage_path',
        'meta',
        'consumed_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'consumed_at' => 'datetime',
    ];
}

