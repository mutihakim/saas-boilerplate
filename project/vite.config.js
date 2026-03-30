import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('/resources/js/i18n.ts') || id.includes('/resources/js/locales/')) {
                        return 'i18n';
                    }

                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    if (id.includes('@inertiajs') || id.includes('ziggy-js')) {
                        return 'inertia';
                    }

                    if (id.includes('react-bootstrap') || id.includes('@restart') || id.includes('react-overlays')) {
                        return 'ui-kit';
                    }

                    if (id.includes('i18next') || id.includes('react-i18next')) {
                        return 'i18n';
                    }

                    if (id.includes('bootstrap')) {
                        return 'bootstrap';
                    }

                    if (id.includes('axios') || id.includes('laravel-echo') || id.includes('pusher-js')) {
                        return 'app-vendor';
                    }

                    if (id.includes('react') || id.includes('scheduler')) {
                        return 'react-vendor';
                    }

                    return undefined;
                },
            },
        },
    },
});
