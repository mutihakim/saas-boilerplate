<?php

return [
    'enabled' => env('WHATSAPP_MODULE_ENABLED', true),
    'service_enabled' => env('WHATSAPP_SERVICE_ENABLED', false),
    'service_url' => env('WHATSAPP_SERVICE_URL', 'http://127.0.0.1:3010'),
    'service_timeout' => (int) env('WHATSAPP_SERVICE_TIMEOUT', 5),
    'internal_token' => env('WHATSAPP_INTERNAL_TOKEN', ''),
    'auth_dir' => env('WA_AUTH_DIR', storage_path('app/whatsapp-auth')),
    'connecting_timeout_ms' => (int) env('WHATSAPP_CONNECTING_TIMEOUT_MS', 60000),
    'connecting_stale_grace_ms' => (int) env('WHATSAPP_CONNECTING_STALE_GRACE_MS', 15000),
    'auto_command' => [
        'enabled' => env('WHATSAPP_AUTO_COMMAND_ENABLED', true),
        'prefixes' => ['/', '!'],
        'commands' => [
            'ping' => [
                'description' => [
                    'en' => 'Check if bot is alive.',
                    'id' => 'Cek apakah bot aktif.',
                ],
                'response' => [
                    'en' => 'Pong! WhatsApp bot is active.',
                    'id' => 'Pong! Bot WhatsApp aktif.',
                ],
            ],
            'help' => [
                'description' => [
                    'en' => 'Show command list.',
                    'id' => 'Tampilkan daftar command.',
                ],
            ],
        ],
    ],
];
