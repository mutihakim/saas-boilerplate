import i18next from 'i18next';

export type InvitationErrorText = {
    title: string;
    detail: string;
};

type ApiErrorEnvelope = {
    code?: string;
    message?: string;
    details?: {
        hint?: string;
        fields?: Record<string, string[]>;
        limit_key?: string;
    };
};

function firstField(error: ApiErrorEnvelope | undefined): { key: string; message: string } | null {
    const fields = error?.details?.fields;
    if (!fields) return null;
    const entry = Object.entries(fields)[0];
    if (!entry || !entry[1]?.[0]) return null;
    return { key: entry[0], message: entry[1][0] };
}

export function parseInvitationError(err: any, fallbackTitle = 'Unable to process invitation'): InvitationErrorText {
    const t = i18next.t.bind(i18next);
    const error = err?.response?.data?.error as ApiErrorEnvelope | undefined;
    const code = error?.code;
    const field = firstField(error);

    if (code === 'PLAN_QUOTA_EXCEEDED') {
        return {
            title: t('tenant.invitations.parse.quota_title', { defaultValue: 'Tidak bisa mengirim undangan' }),
            detail: t('tenant.invitations.parse.quota_detail', { defaultValue: 'Kuota undangan pending pada paket tenant ini sudah penuh.' }),
        };
    }

    if (code === 'INVITATION_NOT_PENDING') {
        return {
            title: t('tenant.invitations.parse.not_pending_title', { defaultValue: 'Undangan tidak bisa dikirim ulang' }),
            detail: t('tenant.invitations.parse.not_pending_detail', { defaultValue: 'Hanya undangan dengan status pending yang bisa di-resend.' }),
        };
    }

    if (code === 'INVITATION_ALREADY_PENDING') {
        return {
            title: t('tenant.invitations.parse.already_pending_title', { defaultValue: 'Tidak bisa mengirim undangan' }),
            detail: t('tenant.invitations.parse.already_pending_detail', { defaultValue: 'Email ini masih memiliki undangan pending. Gunakan resend atau revoke terlebih dahulu.' }),
        };
    }

    if (code === 'INVITATION_EMAIL_ALREADY_REGISTERED') {
        return {
            title: t('tenant.invitations.parse.email_registered_title', { defaultValue: 'Tidak bisa mengirim undangan' }),
            detail: t('tenant.invitations.parse.email_registered_detail', { defaultValue: 'Email ini sudah terdaftar sebagai akun aktif.' }),
        };
    }

    if (code === 'INVITATION_MEMBER_ALREADY_ACTIVE') {
        return {
            title: t('tenant.invitations.parse.member_active_title', { defaultValue: 'Tidak bisa mengirim undangan' }),
            detail: t('tenant.invitations.parse.member_active_detail', { defaultValue: 'Member ini sudah punya akun aktif.' }),
        };
    }

    if (code === 'INVITATION_EMAIL_CONFLICT') {
        if (field?.key === 'member_id') {
            return {
                title: t('tenant.invitations.parse.member_active_title', { defaultValue: 'Tidak bisa mengirim undangan' }),
                detail: t('tenant.invitations.parse.member_active_detail', { defaultValue: 'Member ini sudah punya akun aktif.' }),
            };
        }

        return {
            title: t('tenant.invitations.parse.email_conflict_title', { defaultValue: 'Tidak bisa mengirim undangan' }),
            detail: t('tenant.invitations.parse.email_conflict_detail', { defaultValue: 'Email ini sudah terhubung ke tenant lain atau akun aktif yang tidak bisa diundang ulang.' }),
        };
    }

    if (code === 'VALIDATION_ERROR') {
        if (field?.key === 'email') {
            return {
                title: t('tenant.invitations.parse.invalid_email_title', { defaultValue: 'Data undangan tidak valid' }),
                detail: t('tenant.invitations.parse.invalid_email_detail', { defaultValue: 'Periksa email undangan. Bisa jadi format salah atau sudah ada undangan pending.' }),
            };
        }

        if (field?.key === 'role_code') {
            return {
                title: t('tenant.invitations.parse.invalid_role_title', { defaultValue: 'Role undangan tidak valid' }),
                detail: t('tenant.invitations.parse.invalid_role_detail', { defaultValue: 'Pilih role yang diizinkan untuk invitation.' }),
            };
        }

        if (field?.key === 'full_name') {
            return {
                title: t('tenant.invitations.parse.missing_name_title', { defaultValue: 'Nama penerima wajib diisi' }),
                detail: t('tenant.invitations.parse.missing_name_detail', { defaultValue: 'Isi nama lengkap sebelum mengirim undangan.' }),
            };
        }
    }

    return {
        title: fallbackTitle,
        detail: error?.message ?? t('api.error.generic.detail', { defaultValue: 'Please try again in a few moments.' }),
    };
}
