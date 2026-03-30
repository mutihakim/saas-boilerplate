<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AttachRequestContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-Id') ?: (string) Str::uuid();
        $request->headers->set('X-Request-Id', $requestId);

        $tenant = $request->attributes->get('currentTenant');
        $user = $request->user();

        logger()->withContext([
            'request_id' => $requestId,
            'tenant_id' => $tenant?->id,
            'user_id' => $user?->id,
            'route' => optional($request->route())->getName(),
            'method' => $request->method(),
            'path' => $request->path(),
        ]);

        $startedAt = microtime(true);
        $response = $next($request);
        $latencyMs = (int) ((microtime(true) - $startedAt) * 1000);

        $response->headers->set('X-Request-Id', $requestId);
        logger()->info('http.request', [
            'request_id' => $requestId,
            'tenant_id' => $tenant?->id,
            'user_id' => $user?->id,
            'status' => $response->getStatusCode(),
            'latency_ms' => $latencyMs,
        ]);

        return $response;
    }
}

