<?php

return [
    'codes' => [
        'VALIDATION_ERROR' => [
            'message' => 'Validation failed.',
            'hint' => 'Please check the submitted fields and try again.',
        ],
        'FORBIDDEN' => [
            'message' => 'You do not have permission to perform this action.',
            'hint' => 'Contact tenant owner/admin to request the required permission.',
        ],
        'UNAUTHENTICATED' => [
            'message' => 'Authentication required.',
            'hint' => 'Please sign in and retry.',
        ],
        'CSRF_TOKEN_MISMATCH' => [
            'message' => 'Your session has expired.',
            'hint' => 'Refresh the page and submit again.',
        ],
        'NOT_FOUND' => [
            'message' => 'Resource not found.',
        ],
        'FEATURE_NOT_AVAILABLE' => [
            'message' => 'This feature is not available on your current plan.',
            'hint' => 'Upgrade the tenant subscription to unlock this feature.',
        ],
        'SUPERADMIN_IMPERSONATION_REQUIRED' => [
            'message' => 'Superadmin impersonation is required for tenant mutations.',
            'hint' => 'Start impersonation from Admin > Tenants, then try again.',
        ],
        'PLAN_QUOTA_EXCEEDED' => [
            'message' => 'Your current plan quota has been reached.',
            'hint' => 'Upgrade your plan or reduce existing usage.',
        ],
        'VERSION_CONFLICT' => [
            'message' => 'This record was changed by another request.',
            'hint' => 'Reload the data and retry your change.',
        ],
        'IMMUTABLE_SYSTEM_ROLE' => [
            'message' => 'Default system role cannot be modified.',
            'hint' => 'Create a custom role if you need different permissions.',
        ],
        'IDEMPOTENCY_KEY_REUSED' => [
            'message' => 'Idempotency key was reused with a different payload.',
            'hint' => 'Use a new Idempotency-Key for a different request body.',
        ],
        'WHATSAPP_NOT_CONNECTED' => [
            'message' => 'WhatsApp session is not connected.',
            'hint' => 'Connect the session first from WhatsApp Settings.',
        ],
        'WHATSAPP_SETTINGS_FORBIDDEN' => [
            'message' => 'You are not allowed to manage WhatsApp settings.',
            'hint' => 'Only owner-level access can update WhatsApp settings.',
        ],
        'WHATSAPP_CHAT_FORBIDDEN' => [
            'message' => 'You are not allowed to access WhatsApp chats.',
            'hint' => 'Ask tenant owner/admin for WhatsApp chat permission.',
        ],
        'WHATSAPP_SERVICE_UNAVAILABLE' => [
            'message' => 'WhatsApp service is unavailable.',
            'hint' => 'Ensure the global WhatsApp service is running, then try again.',
        ],
        'INVITATION_INVALID' => [
            'message' => 'Invitation token is invalid.',
            'hint' => 'Request a new invitation link from your tenant admin.',
        ],
        'INVITATION_EXPIRED' => [
            'message' => 'Invitation has expired.',
            'hint' => 'Request a new invitation link from your tenant admin.',
        ],
        'INVITATION_ALREADY_PROCESSED' => [
            'message' => 'Invitation has already been processed.',
            'hint' => 'Use the latest invitation link if you need a new access flow.',
        ],
        'INVITATION_NOT_PENDING' => [
            'message' => 'Only pending invitations can be resent.',
            'hint' => 'Create a new invitation if this one is no longer pending.',
        ],
        'INVITATION_ROLE_NOT_ALLOWED' => [
            'message' => 'Invitation role is not allowed for onboarding.',
            'hint' => 'Use admin/member role for invitation onboarding.',
        ],
        'INVITATION_EMAIL_CONFLICT' => [
            'message' => 'Invitation email conflicts with existing tenant membership.',
            'hint' => 'Use another email or resolve the existing membership first.',
        ],
        'INVITATION_EMAIL_ALREADY_REGISTERED' => [
            'message' => 'Email is already registered as an active account.',
            'hint' => 'Use another email address for invitation.',
        ],
        'INVITATION_MEMBER_ALREADY_ACTIVE' => [
            'message' => 'Selected member already has an active account.',
            'hint' => 'Active members do not need a new invitation.',
        ],
        'INVITATION_ALREADY_PENDING' => [
            'message' => 'A pending invitation already exists for this email.',
            'hint' => 'Use resend action on the existing invitation.',
        ],
        'INVALID_TARGET' => [
            'message' => 'Selected target cannot be impersonated.',
        ],
        'NOT_IMPERSONATING' => [
            'message' => 'No active impersonation session.',
        ],
        'INVALID_IMPERSONATOR' => [
            'message' => 'Original superadmin account was not found.',
        ],
        'MFA_INVALID_CODE' => [
            'message' => 'Authenticator or recovery code is invalid.',
            'hint' => 'Check your code and try again.',
        ],
        'NOT_IMPLEMENTED' => [
            'message' => 'This feature is not implemented yet.',
        ],
        'UNSUPPORTED_MEDIA_TYPE' => [
            'message' => 'Unsupported media type.',
        ],
    ],
];
