import i18next from 'i18next';

type ApiErrorEnvelope = {
    code?: string;
    message?: string;
    details?: {
        hint?: string;
        fields?: Record<string, string[]>;
    };
};

export type ParsedApiError = {
    title: string;
    detail?: string;
};

export function parseApiError(err: any, fallback: string): ParsedApiError {
    const t = i18next.t.bind(i18next);
    const status = err?.response?.status as number | undefined;
    const envelope = err?.response?.data?.error as ApiErrorEnvelope | undefined;
    const message = envelope?.message ?? fallback;
    const hint = envelope?.details?.hint;
    const fields = envelope?.details?.fields;

    const firstFieldEntry = fields ? Object.entries(fields)[0] : null;
    const firstFieldName = firstFieldEntry?.[0];
    const firstFieldMessage = firstFieldEntry?.[1]?.[0];

    if (firstFieldMessage && firstFieldName) {
        return {
            title: message,
            detail: firstFieldMessage,
        };
    }

    if (hint) {
        return {
            title: message,
            detail: hint,
        };
    }

    if (status === 401) {
        return {
            title: t('api.error.unauthenticated.title', { defaultValue: 'Authentication required' }),
            detail: t('api.error.unauthenticated.detail', { defaultValue: 'Your session has expired. Please sign in again and retry.' }),
        };
    }

    if (status === 403) {
        return {
            title: t('api.error.forbidden.title', { defaultValue: 'Access denied' }),
            detail: t('api.error.forbidden.detail', { defaultValue: 'You do not have permission to perform this action in the active tenant.' }),
        };
    }

    if (status === 419) {
        return {
            title: t('api.error.csrf.title', { defaultValue: 'Session expired' }),
            detail: t('api.error.csrf.detail', { defaultValue: 'Refresh the page and try again.' }),
        };
    }

    return {
        title: message,
        detail: t('api.error.generic.detail', { defaultValue: 'Please try again in a few moments.' }),
    };
}
