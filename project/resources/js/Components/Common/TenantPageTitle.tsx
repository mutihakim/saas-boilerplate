import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTenantRoute } from '../../common/tenantRoute';

type Props = {
    title?: string;
    parentLabel?: string;
    parentHref?: string;
};

function labelsFromPath(pathname: string): { title: string; parentLabel: string } {
    if (/^\/t\/[^/]+\/members\/\d+\/edit$/.test(pathname)) {
        return { title: 'tenant.members.edit.title', parentLabel: 'tenant.members.parent' };
    }
    if (/^\/t\/[^/]+\/members$/.test(pathname)) {
        return { title: 'tenant.members.title', parentLabel: 'tenant.members.parent' };
    }
    if (/^\/t\/[^/]+\/roles$/.test(pathname)) {
        return { title: 'tenant.roles.title', parentLabel: 'tenant.roles.parent' };
    }
    if (/^\/t\/[^/]+\/whatsapp\/settings$/.test(pathname)) {
        return { title: 'tenant.whatsapp.settings.title', parentLabel: 'tenant.whatsapp.settings.parent' };
    }
    if (/^\/t\/[^/]+\/whatsapp\/chats$/.test(pathname)) {
        return { title: 'tenant.whatsapp.chats.title', parentLabel: 'tenant.whatsapp.chats.parent' };
    }
    if (/^\/t\/[^/]+\/settings\/profile$/.test(pathname)) {
        return { title: 'tenant.settings.tabs.profile', parentLabel: 'layout.shell.nav.items.settings' };
    }
    if (/^\/t\/[^/]+\/settings\/branding$/.test(pathname)) {
        return { title: 'tenant.settings.tabs.branding', parentLabel: 'layout.shell.nav.items.settings' };
    }
    if (/^\/t\/[^/]+\/settings\/localization$/.test(pathname)) {
        return { title: 'tenant.settings.tabs.localization', parentLabel: 'layout.shell.nav.items.settings' };
    }
    if (/^\/t\/[^/]+\/settings\/billing$/.test(pathname)) {
        return { title: 'tenant.settings.tabs.billing', parentLabel: 'layout.shell.nav.items.settings' };
    }
    if (/^\/profile\/settings$/.test(pathname)) {
        return { title: 'Profile Settings', parentLabel: 'layout.shell.nav.sections.account' };
    }
    if (/^\/profile$/.test(pathname)) {
        return { title: 'Profile', parentLabel: 'layout.shell.nav.sections.account' };
    }
    if (/^\/t\/[^/]+\/dashboard$/.test(pathname)) {
        return { title: 'Dashboard', parentLabel: 'Workspace' };
    }

    return { title: 'Workspace', parentLabel: 'layout.shell.nav.sections.account' };
}

export default function TenantPageTitle({ title, parentLabel, parentHref }: Props) {
    const { t } = useTranslation();
    const tenantRoute = useTenantRoute();
    const derived = labelsFromPath(window.location.pathname);
    const finalTitle = title ?? derived.title;
    const finalParentLabel = parentLabel ?? derived.parentLabel;
    const resolvedParentHref = parentHref
        ?? (finalParentLabel === 'layout.shell.nav.items.settings'
            ? tenantRoute.to('/settings')
            : (finalParentLabel === 'layout.shell.nav.sections.account' ? '/profile' : tenantRoute.to('/dashboard')));

    return (
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">{t(finalTitle)}</h4>
            <div className="page-title-right">
                <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                        <Link href={resolvedParentHref}>{t(finalParentLabel)}</Link>
                    </li>
                    <li className="breadcrumb-item active">{t(finalTitle)}</li>
                </ol>
            </div>
        </div>
    );
}
