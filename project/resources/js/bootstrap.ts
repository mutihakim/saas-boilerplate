/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.axios = axios;
window.Pusher = Pusher;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

const resolveLocale = (): string => {
    const raw = localStorage.getItem('I18N_LANGUAGE') || 'en';
    return ['en', 'id'].includes(raw) ? raw : 'en';
};

window.axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const locale = resolveLocale();
    config.headers = config.headers ?? {};
    config.headers['X-Locale'] = locale;
    config.headers['Accept-Language'] = locale;
    return config;
});

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
if (reverbKey) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
    });
}
