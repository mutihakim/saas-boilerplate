import { expect, test, type Page } from '@playwright/test';

const workspaceEmail = process.env.E2E_AUTH_EMAIL;
const workspacePassword = process.env.E2E_AUTH_PASSWORD;
const tenantSlug = process.env.E2E_TENANT_SLUG;
const adminDashboardUrl = process.env.E2E_ADMIN_DASHBOARD_URL;
const upgradeUrl = process.env.E2E_UPGRADE_URL;

async function login(page: Page, locale: 'en' | 'id' = 'en') {
    await page.addInitScript((language) => {
        window.localStorage.setItem('I18N_LANGUAGE', language);
    }, locale);

    await page.goto('/login');
    await page.getByLabel('Email').fill(workspaceEmail ?? '');
    await page.getByLabel('Password').fill(workspacePassword ?? '');
    await page.getByRole('button', { name: 'Sign In' }).click();
}

test.describe('workspace smoke', () => {
    test.skip(!workspaceEmail || !workspacePassword || !tenantSlug, 'Set E2E_AUTH_EMAIL, E2E_AUTH_PASSWORD, and E2E_TENANT_SLUG to run workspace smoke tests.');

    test('tenant dashboard renders shared premium shell', async ({ page }) => {
        await login(page);
        await page.goto(`/t/${tenantSlug}/dashboard`);

        await expect(page.getByRole('heading', { name: 'Tenant Dashboard' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Open app theme customizer' })).toBeVisible();
        await page.getByRole('button', { name: 'Team' }).click();
        await expect(page.getByRole('link', { name: 'Members' })).toBeVisible();
    });

    test('language switch is reflected on tenant dashboard', async ({ page }) => {
        await login(page, 'id');
        await page.goto(`/t/${tenantSlug}/dashboard`);

        await expect(page.getByRole('heading', { name: 'Dashboard Tenant' })).toBeVisible();
    });

    test('subscription upgrade surface renders', async ({ page }) => {
        await login(page);
        await page.goto(upgradeUrl ?? `/t/${tenantSlug}/upgrade-required?module=whatsapp.chats`);

        await expect(page.getByRole('heading', { name: 'Feature Locked by Subscription' })).toBeVisible();
    });

    test('admin dashboard renders for seeded superadmin', async ({ page }) => {
        test.skip(!adminDashboardUrl, 'Set E2E_ADMIN_DASHBOARD_URL to verify the admin shell.');

        await login(page);
        await page.goto(adminDashboardUrl ?? '/admin/dashboard');

        await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Manage Tenants' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Open app theme customizer' })).toBeVisible();
        await page.getByRole('button', { name: 'Operations' }).click();
        await expect(page.getByRole('link', { name: 'Tenants' })).toBeVisible();

        await page.getByRole('button', { name: 'Open app theme customizer' }).first().click();
        await expect(page.getByText('Theme Customizer')).toBeVisible();
        await expect(page.getByLabel('Small Hover')).toBeVisible();
    });
});
