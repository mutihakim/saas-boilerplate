<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantWhatsappMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'direction',
        'whatsapp_message_id',
        'sender_jid',
        'recipient_jid',
        'chat_jid',
        'payload',
        'read_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'read_at' => 'datetime',
    ];
}
