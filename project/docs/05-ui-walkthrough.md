# 05 - UI Walkthrough

## Tujuan

Dokumen ini memetakan halaman UI ke route dan backend contract untuk mempercepat debug/extension.

## Tenant Area

| UI Page | Inertia Page | Web Route | Guard Kunci |
|---|---|---|---|
| Dashboard | `Tenant/Dashboard` | `/t/{tenant}/dashboard` | `tenant.feature:dashboard,view` |
| Members | `Tenant/Members/Index` | `/t/{tenant}/members` | `tenant.feature:team.members,view` |
| Roles | `Tenant/Roles/Index` | `/t/{tenant}/roles` | `tenant.feature:team.roles,view` |
| Invitations | `Tenant/Invitations/Index` | `/t/{tenant}/invitations` | `tenant.feature:team.invitations,view` |
| WhatsApp Settings | `Tenant/WhatsApp/Settings` | `/t/{tenant}/whatsapp/settings` | `tenant.feature:whatsapp.settings,view` |
| WhatsApp Chats | `Tenant/WhatsApp/Chats` | `/t/{tenant}/whatsapp/chats` | `tenant.feature:whatsapp.chats,view` |
| Settings landing | redirect | `/t/{tenant}/settings` | `tenant.initialize`, `tenant.access`, `permission.team` |
| Organization Profile | `Tenant/Settings/Profile` | `/t/{tenant}/settings/profile` | `tenant.initialize`, `tenant.access`, `permission.team`, controller permission check |
| Branding | `Tenant/Settings/Branding` | `/t/{tenant}/settings/branding` | `tenant.initialize`, `tenant.access`, `permission.team`, controller permission check |
| Localization | `Tenant/Settings/Localization` | `/t/{tenant}/settings/localization` | `tenant.initialize`, `tenant.access`, `permission.team`, controller permission check |
| Billing | `Tenant/Settings/Billing` | `/t/{tenant}/settings/billing` | `tenant.initialize`, `tenant.access`, `permission.team`, controller permission check |
| Upgrade Required | `Tenant/UpgradeRequired` | `/t/{tenant}/upgrade-required` | redirect dari `tenant.feature` |

## Admin Area

| UI Page | Inertia Page | Route | Guard |
|---|---|---|---|
| Admin Dashboard | `Admin/Dashboard` | `/admin/dashboard` | `superadmin.only` |
| Tenant Directory | `Admin/Tenants` | `/admin/tenants` | `superadmin.only` |
| Tenant Subscriptions | `Admin/TenantSubscriptions` | `/admin/tenants/subscriptions` | `superadmin.only` |

## Auth/Profile Area

| UI Page | Route | Catatan |
|---|---|---|
| Login/Register | `/login`, `/register` | bootstrap auth |
| Profile | `/profile` | account overview untuk user yang login |
| Profile Settings | `/profile/settings` | user-level settings |
| Profile Security | `/profile/security` | MFA enable/verify/disable |

## Forbidden UX Contract

Workspace pages yang ditolak karena authorization harus tetap terasa sebagai bagian dari produk yang sama.

Aturannya:

1. Route tenant yang ditolak permission harus menampilkan full-page forbidden state di dalam shell workspace.
2. Hindari fallback ke modal generik atau alert datar untuk unauthorized state.
3. Tenant settings mengikuti kontrak yang sama dengan WhatsApp settings, roles, dan route tenant lain yang sudah memakai cover state.
4. Tenant settings hanya muncul sebagai satu item sidebar `Settings`; subsection `Profile/Branding/Localization/Billing` dijaga sebagai tabs di area konten.

## WhatsApp Chats UX Contract

1. Initial load hanya menampilkan 15 pesan terbaru per chat.
2. Tombol `Load more` muncul sebagai banner center di atas percakapan jika backend mengembalikan `has_more=true`.
3. Klik `Load more` memuat 15 pesan sebelumnya menggunakan cursor `before_id` tanpa melompatkan viewport scroll.
4. Jika API mengembalikan `401`, UI harus menghentikan chain request lanjutan dan redirect ke login dengan return URL (`intended`).

## WhatsApp Settings UX Contract

1. Card status sesi mencakup informasi lifecycle, action connect/disconnect/remove, dan panel QR/Handshake dalam satu surface.
2. Halaman settings wajib memiliki section `Command Guide` yang menjelaskan prefix command (`/`, `!`) dan fungsi command aktif (`ping`, `help`).
3. Seluruh copy di section command wajib i18n EN/ID dan tidak boleh hardcoded.
4. Saat lifecycle `jid_conflict` atau `jid_conflict_migration`, halaman wajib menampilkan warning alert yang menjelaskan nomor bentrok dan tenant owner conflict (berbasis metadata callback).

## Screenshot Checklist

Setiap fitur minimal 3 screenshot:

1. Happy path
2. Forbidden/unauthorized
3. Quota/upgrade atau edge-state

Folder screenshot:

- `docs/assets/screenshots/rbac`
- `docs/assets/screenshots/i18n`
- `docs/assets/screenshots/subscription`
- `docs/assets/screenshots/tenant-settings`
- `docs/assets/screenshots/whatsapp`
