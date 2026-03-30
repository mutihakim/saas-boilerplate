<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantWhatsappNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'member_id',
        'notification_type',
        'notification_key',
        'status',
        'context',
        'service_response',
        'sent_at',
    ];

    protected $casts = [
        'context' => 'array',
        'service_response' => 'array',
        'sent_at' => 'datetime',
    ];
}

