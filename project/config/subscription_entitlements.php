<?php

return [
    'default_plan' => 'free',

    'plans' => [
        'free' => [
            'features' => [
                'dashboard' => ['view'],
                'team.members' => ['view', 'create', 'update', 'delete'],
                'team.roles' => ['view', 'create', 'update', 'delete', 'assign'],
                'team.invitations' => [],
                'whatsapp.settings' => [],
                'whatsapp.chats' => [],
            ],
            'limits' => [
                'team.members.max' => 5,
                'team.roles.custom.max' => 2,
                'team.invitations.pending.max' => 3,
            ],
        ],
        'pro' => [
            'features' => [
                'dashboard' => ['view'],
                'team.members' => ['view', 'create', 'update', 'delete'],
                'team.roles' => ['view', 'create', 'update', 'delete', 'assign'],
                'team.invitations' => ['view', 'create', 'update'],
                'whatsapp.settings' => ['view', 'update'],
                'whatsapp.chats' => ['view', 'update'],
            ],
            'limits' => [
                'team.members.max' => 50,
                'team.roles.custom.max' => 25,
                'team.invitations.pending.max' => 100,
            ],
        ],
        'business' => [
            'features' => [
                'dashboard' => ['view'],
                'team.members' => ['view', 'create', 'update', 'delete'],
                'team.roles' => ['view', 'create', 'update', 'delete', 'assign'],
                'team.invitations' => ['view', 'create', 'update'],
                'whatsapp.settings' => ['view', 'update'],
                'whatsapp.chats' => ['view', 'update'],
            ],
            'limits' => [
                'team.members.max' => 50,
                'team.roles.custom.max' => 25,
                'team.invitations.pending.max' => 100,
            ],
        ],
        'enterprise' => [
            'features' => [
                'dashboard' => ['view'],
                'team.members' => ['view', 'create', 'update', 'delete'],
                'team.roles' => ['view', 'create', 'update', 'delete', 'assign'],
                'team.invitations' => ['view', 'create', 'update'],
                'whatsapp.settings' => ['view', 'update'],
                'whatsapp.chats' => ['view', 'update'],
            ],
            'limits' => [
                'team.members.max' => 50,
                'team.roles.custom.max' => 25,
                'team.invitations.pending.max' => 100,
            ],
        ],
    ],

    'module_labels' => [
        'dashboard' => 'Dashboard',
        'team.members' => 'Team / Members',
        'team.roles' => 'Team / Roles',
        'team.invitations' => 'Team / Invitations',
        'whatsapp.settings' => 'WhatsApp / Settings',
        'whatsapp.chats' => 'WhatsApp / Chats',
    ],

    'limit_labels' => [
        'team.members.max' => 'Max Members',
        'team.roles.custom.max' => 'Max Custom Roles',
        'team.invitations.pending.max' => 'Max Pending Invitations',
    ],
];
