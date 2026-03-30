<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;

class WhatsappServiceClient
{
    public function __construct(
        private readonly HttpFactory $http
    ) {
    }

    public function isEnabled(): bool
    {
        return (bool) config('whatsapp.service_enabled', false);
    }

    public function connect(int $tenantId): array
    {
        return $this->post("/api/v1/tenants/{$tenantId}/whatsapp/session/connect");
    }

    public function disconnect(int $tenantId): array
    {
        return $this->post("/api/v1/tenants/{$tenantId}/whatsapp/session/disconnect");
    }

    public function removeSession(int $tenantId): array
    {
        return $this->post("/api/v1/tenants/{$tenantId}/whatsapp/session/remove");
    }

    public function session(int $tenantId): array
    {
        return $this->get("/api/v1/tenants/{$tenantId}/whatsapp/session");
    }

    public function sendMessage(int $tenantId, string $to, string $message, ?string $notificationKey = null): array
    {
        return $this->post("/api/v1/tenants/{$tenantId}/whatsapp/messages/send", [
            'to' => $to,
            'message' => $message,
            'notification_key' => $notificationKey,
        ]);
    }

    private function get(string $path): array
    {
        return $this->request('GET', $path);
    }

    private function post(string $path, array $payload = []): array
    {
        return $this->request('POST', $path, $payload);
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        try {
            $response = $this->http
                ->baseUrl((string) config('whatsapp.service_url'))
                ->timeout((int) config('whatsapp.service_timeout', 5))
                ->acceptJson()
                ->withToken((string) config('whatsapp.internal_token'), 'Bearer')
                ->withHeaders([
                    'X-Internal-Token' => (string) config('whatsapp.internal_token'),
                ])
                ->send($method, $path, $payload === [] ? [] : ['json' => $payload])
                ->throw();
        } catch (ConnectionException $e) {
            return [
                'ok' => false,
                'status' => 503,
                'code' => 'CONNECTION_ERROR',
                'message' => $e->getMessage(),
                'data' => [],
            ];
        } catch (RequestException $e) {
            $status = $e->response?->status() ?? 500;
            $json = $e->response?->json() ?? [];

            return [
                'ok' => false,
                'status' => $status,
                'code' => Arr::get($json, 'error.code', 'REQUEST_FAILED'),
                'message' => Arr::get($json, 'error.message', $e->getMessage()),
                'data' => Arr::get($json, 'data', []),
            ];
        }

        return [
            'ok' => true,
            'status' => $response->status(),
            'code' => null,
            'message' => null,
            'data' => $response->json('data', []),
        ];
    }
}
