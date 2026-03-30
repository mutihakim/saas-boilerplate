<?php

return [
    'dashboard' => ['view'],
    'tenant.settings' => ['view', 'manage'],
    'team.members' => ['create', 'view', 'update', 'delete'],
    'team.roles' => ['create', 'view', 'update', 'delete'],
    'team.invitations' => ['create', 'view', 'update'],
    'team.role_permissions' => ['assign'],
    'whatsapp.settings' => ['view', 'update'],
    'whatsapp.chats' => ['view', 'update'],
];
