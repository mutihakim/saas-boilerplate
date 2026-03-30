import { Link } from '@inertiajs/react';
import React from 'react';
import { Alert, Card, Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { CompatPageTitle } from '../../../compat/velzon';

export type TenantSettingsTenant = {
    id: number;
    slug: string;
    name: string;
    display_name?: string | null;
    presentable_name: string;
    legal_name?: string | null;
    registration_number?: string | null;
    tax_id?: string | null;
    industry?: string | null;
    website_url?: string | null;
    support_email?: string | null;
    billing_email?: string | null;
    billing_contact_name?: string | null;
    phone?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state_region?: string | null;
    postal_code?: string | null;
    country_code?: string | null;
    locale?: string | null;
    timezone?: string | null;
    currency_code?: string | null;
    branding: {
        logoLightUrl: string;
        logoDarkUrl: string;
        logoIconUrl: string;
        faviconUrl: string;
    };
};

const items = [
    { key: 'profile', labelKey: 'tenant.settings.tabs.profile', routeName: 'tenant.settings.profile' },
    { key: 'branding', labelKey: 'tenant.settings.tabs.branding', routeName: 'tenant.settings.branding' },
    { key: 'localization', labelKey: 'tenant.settings.tabs.localization', routeName: 'tenant.settings.localization' },
    { key: 'billing', labelKey: 'tenant.settings.tabs.billing', routeName: 'tenant.settings.billing' },
] as const;

export function TenantSettingsHeader({
    tenant,
    titleKey,
    subtitleKey,
}: {
    tenant: TenantSettingsTenant;
    titleKey: string;
    subtitleKey: string;
}) {
    const { t } = useTranslation();

    return (
        <CompatPageTitle
            title={t(titleKey)}
            subtitle={t(subtitleKey)}
            actions={
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                    <span className="badge bg-primary-subtle text-primary fs-6">{tenant.presentable_name}</span>
                    <span className="badge bg-light text-dark fs-6 text-uppercase">{tenant.currency_code || 'IDR'}</span>
                </div>
            }
        />
    );
}

export function TenantSettingsTabs({
    tenant,
    active,
}: {
    tenant: TenantSettingsTenant;
    active: (typeof items)[number]['key'];
}) {
    const { t } = useTranslation();

    return (
        <Card className="mb-3">
            <Card.Body className="p-0">
                <Nav className="nav-tabs-custom nav-success px-3" role="tablist">
                    {items.map((item) => (
                        <Nav.Item key={item.key}>
                            <Nav.Link
                                as={Link}
                                href={route(item.routeName, { tenant: tenant.slug })}
                                className={item.key === active ? 'active' : ''}
                            >
                                {t(item.labelKey)}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>
            </Card.Body>
        </Card>
    );
}

export function TenantSettingsStatus({ statusKey }: { statusKey?: string | null }) {
    const { t } = useTranslation();

    if (!statusKey) {
        return null;
    }

    return <Alert variant="success">{t(statusKey)}</Alert>;
}
