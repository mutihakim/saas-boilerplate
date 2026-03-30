module.exports = {
    apps: [
        {
            name: 'tenant-whatsapp-service',
            script: './src/index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
                PORT: 3010,
                APP_CALLBACK_URL: 'http://project-saas.test',
                WHATSAPP_INTERNAL_TOKEN: 'change-me',
                WA_AUTH_DIR: 'F:\\laragon\\www\\cabinet\\services\\whatsapp\\wa-auth',
                REQUEST_TIMEOUT_MS: 8000,
                CONNECTING_TIMEOUT_MS: 60000,
            },
        },
    ],
};
