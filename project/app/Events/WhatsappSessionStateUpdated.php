<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhatsappSessionStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly int $tenantId,
        public readonly string $sessionName,
        public readonly string $connectionStatus,
        public readonly ?string $connectedJid,
        public readonly ?array $meta,
        public readonly string $updatedAt
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("tenant.{$this->tenantId}.whatsapp")];
    }

    public function broadcastAs(): string
    {
        return 'whatsapp.session.state.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'tenant_id' => $this->tenantId,
            'session_name' => $this->sessionName,
            'connection_status' => $this->connectionStatus,
            'connected_jid' => $this->connectedJid,
            'meta' => $this->meta,
            'updated_at' => $this->updatedAt,
        ];
    }
}
