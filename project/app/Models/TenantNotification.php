<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantNotification extends Model
{
    use HasFactory;

    protected $table = 'tenant_notifications';

    protected $fillable = [
        'tenant_id',
        'member_id',
        'notification_type',
        'payload',
        'read_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'read_at' => 'datetime',
    ];
}
