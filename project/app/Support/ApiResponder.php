<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

trait ApiResponder
{
    protected function ok(array $data = [], int $status = 200): JsonResponse
    {
        return response()->json([
            'ok' => true,
            'data' => $data,
        ], $status);
    }

    protected function error(
        string $code,
        string $message = '',
        array $details = [],
        int $status = 400
    ): JsonResponse {
        $catalogEntry = trans("api.codes.{$code}");
        if (is_array($catalogEntry)) {
            $message = (string) ($catalogEntry['message'] ?? $message);
            if (!isset($details['hint']) && isset($catalogEntry['hint'])) {
                $details['hint'] = (string) $catalogEntry['hint'];
            }
        }

        return response()->json([
            'ok' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $details,
            ],
        ], $status);
    }
}
