<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantWhatsappContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'member_id',
        'jid',
        'contact_type',
        'display_name',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];
}

