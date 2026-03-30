<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use LogicException;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'actor_user_id',
        'actor_member_id',
        'action',
        'target_type',
        'target_id',
        'changes',
        'metadata',
        'request_id',
        'occurred_at',
        'result_status',
        'before_version',
        'after_version',
        'source_ip',
        'user_agent',
    ];

    protected $casts = [
        'changes' => 'array',
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(function () {
            throw new LogicException('Activity logs are append-only.');
        });

        static::deleting(function () {
            throw new LogicException('Activity logs are append-only.');
        });
    }
}
