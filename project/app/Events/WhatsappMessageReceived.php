<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

use Illuminate\Broadcasting\InteractsWithSockets;

class WhatsappMessageReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $tenantId
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("tenant.{$this->tenantId}.whatsapp")];
    }

    public function broadcastAs(): string
    {
        return 'whatsapp.message.received';
    }

    public function broadcastWith(): array
    {
        return [
            'tenant_id' => $this->tenantId,
        ];
    }
}
