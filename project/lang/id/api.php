<?php

return [
    'codes' => [
        'VALIDATION_ERROR' => [
            'message' => 'Validasi gagal.',
            'hint' => 'Periksa kembali field yang dikirim lalu coba lagi.',
        ],
        'FORBIDDEN' => [
            'message' => 'Anda tidak memiliki izin untuk melakukan aksi ini.',
            'hint' => 'Hubungi owner/admin tenant untuk meminta izin yang dibutuhkan.',
        ],
        'UNAUTHENTICATED' => [
            'message' => 'Autentikasi dibutuhkan.',
            'hint' => 'Silakan login lalu coba kembali.',
        ],
        'CSRF_TOKEN_MISMATCH' => [
            'message' => 'Sesi Anda sudah berakhir.',
            'hint' => 'Muat ulang halaman lalu kirim ulang permintaan.',
        ],
        'NOT_FOUND' => [
            'message' => 'Resource tidak ditemukan.',
        ],
        'FEATURE_NOT_AVAILABLE' => [
            'message' => 'Fitur ini belum tersedia pada paket langganan Anda saat ini.',
            'hint' => 'Upgrade langganan tenant untuk membuka fitur ini.',
        ],
        'SUPERADMIN_IMPERSONATION_REQUIRED' => [
            'message' => 'Superadmin wajib impersonasi sebelum mutasi data tenant.',
            'hint' => 'Mulai impersonasi dari Admin > Tenants, lalu coba lagi.',
        ],
        'PLAN_QUOTA_EXCEEDED' => [
            'message' => 'Kuota paket Anda sudah mencapai batas.',
            'hint' => 'Upgrade paket atau kurangi penggunaan saat ini.',
        ],
        'VERSION_CONFLICT' => [
            'message' => 'Data ini sudah diubah oleh request lain.',
            'hint' => 'Muat ulang data lalu coba simpan kembali.',
        ],
        'IMMUTABLE_SYSTEM_ROLE' => [
            'message' => 'Role sistem bawaan tidak dapat diubah.',
            'hint' => 'Buat role kustom jika membutuhkan kombinasi izin berbeda.',
        ],
        'IDEMPOTENCY_KEY_REUSED' => [
            'message' => 'Idempotency key sudah dipakai untuk payload yang berbeda.',
            'hint' => 'Gunakan Idempotency-Key baru untuk payload yang berbeda.',
        ],
        'WHATSAPP_NOT_CONNECTED' => [
            'message' => 'Sesi WhatsApp belum terhubung.',
            'hint' => 'Hubungkan sesi terlebih dahulu dari WhatsApp Settings.',
        ],
        'WHATSAPP_SETTINGS_FORBIDDEN' => [
            'message' => 'Anda tidak diizinkan mengelola pengaturan WhatsApp.',
            'hint' => 'Hanya akses setara owner yang bisa mengubah WhatsApp settings.',
        ],
        'WHATSAPP_CHAT_FORBIDDEN' => [
            'message' => 'Anda tidak diizinkan mengakses chat WhatsApp.',
            'hint' => 'Minta izin chat WhatsApp kepada owner/admin tenant.',
        ],
        'WHATSAPP_SERVICE_UNAVAILABLE' => [
            'message' => 'Service WhatsApp tidak tersedia.',
            'hint' => 'Pastikan service WhatsApp global berjalan lalu coba lagi.',
        ],
        'INVITATION_INVALID' => [
            'message' => 'Token undangan tidak valid.',
            'hint' => 'Minta link undangan baru ke admin tenant.',
        ],
        'INVITATION_EXPIRED' => [
            'message' => 'Undangan sudah kedaluwarsa.',
            'hint' => 'Minta link undangan baru ke admin tenant.',
        ],
        'INVITATION_ALREADY_PROCESSED' => [
            'message' => 'Undangan sudah diproses sebelumnya.',
            'hint' => 'Gunakan link undangan terbaru jika diperlukan.',
        ],
        'INVITATION_NOT_PENDING' => [
            'message' => 'Hanya undangan berstatus pending yang bisa dikirim ulang.',
            'hint' => 'Buat undangan baru jika undangan ini tidak lagi pending.',
        ],
        'INVITATION_ROLE_NOT_ALLOWED' => [
            'message' => 'Role undangan tidak diperbolehkan untuk onboarding.',
            'hint' => 'Gunakan role admin/member untuk alur undangan.',
        ],
        'INVITATION_EMAIL_CONFLICT' => [
            'message' => 'Email undangan bentrok dengan membership tenant yang sudah ada.',
            'hint' => 'Gunakan email lain atau selesaikan membership yang bentrok terlebih dahulu.',
        ],
        'INVITATION_EMAIL_ALREADY_REGISTERED' => [
            'message' => 'Email sudah terdaftar sebagai akun aktif.',
            'hint' => 'Gunakan alamat email lain untuk undangan.',
        ],
        'INVITATION_MEMBER_ALREADY_ACTIVE' => [
            'message' => 'Member terpilih sudah memiliki akun aktif.',
            'hint' => 'Member aktif tidak perlu diundang ulang.',
        ],
        'INVITATION_ALREADY_PENDING' => [
            'message' => 'Sudah ada undangan pending untuk email ini.',
            'hint' => 'Gunakan aksi kirim ulang pada undangan yang sudah ada.',
        ],
        'INVALID_TARGET' => [
            'message' => 'Target yang dipilih tidak dapat di-impersonasi.',
        ],
        'NOT_IMPERSONATING' => [
            'message' => 'Tidak ada sesi impersonasi yang aktif.',
        ],
        'INVALID_IMPERSONATOR' => [
            'message' => 'Akun superadmin asal tidak ditemukan.',
        ],
        'MFA_INVALID_CODE' => [
            'message' => 'Kode authenticator atau recovery tidak valid.',
            'hint' => 'Periksa kode Anda lalu coba lagi.',
        ],
        'NOT_IMPLEMENTED' => [
            'message' => 'Fitur ini belum diimplementasikan.',
        ],
        'UNSUPPORTED_MEDIA_TYPE' => [
            'message' => 'Tipe media tidak didukung.',
        ],
    ],
];
