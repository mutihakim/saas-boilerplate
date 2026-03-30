import { Link, usePage } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import avatar1 from '../../../images/users/avatar-1.jpg';
import { SharedPageProps } from '../../types/page';

export default function ProfileDropdown() {
    const { t } = useTranslation();
    const { props } = usePage<SharedPageProps>();
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const user = props.auth?.user;

    const workspaceLink = useMemo(() => {
        const slugFromPath = window.location.pathname.match(/^\/t\/([^/]+)/)?.[1];
        const tenantSlug = props.currentTenant?.slug ?? slugFromPath;

        return tenantSlug ? `/t/${tenantSlug}/dashboard` : '/tenant-access-required';
    }, [props.currentTenant?.slug]);

    if (!user) {
        return null;
    }

    const isSuperadmin = Boolean(user.is_superadmin);
    const roleCode = props.currentTenantMember?.role_code;
    const subtitle = user.job_title
        || (isSuperadmin
            ? t('Superadmin')
            : (roleCode ? t(`tenant.members.roles.${roleCode}`) : t('Member')));
    const profileImage = user.avatar_url || avatar1;

    return (
        <Dropdown
            show={isProfileDropdown}
            onToggle={(nextShow) => setIsProfileDropdown(nextShow)}
            className="ms-sm-3 header-item topbar-user"
        >
            <Dropdown.Toggle as="button" type="button" className="arrow-none btn">
                <span className="d-flex align-items-center">
                    <img className="rounded-circle header-profile-user" src={profileImage} alt={t('layout.shell.profile.avatar_alt')} />
                    <span className="text-start ms-xl-2">
                        <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{user.name}</span>
                        <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text text-capitalize">{subtitle}</span>
                    </span>
                </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-end">
                <h6 className="dropdown-header">{t('layout.shell.profile.welcome', { name: user.name })}</h6>

                <Dropdown.Item href={route('profile.edit')} className="dropdown-item">
                    <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                    <span className="align-middle">{t('Profile')}</span>
                </Dropdown.Item>

                <Dropdown.Item href={route('profile.settings')} className="dropdown-item">
                    <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>
                    <span className="align-middle">{t('Profile Settings')}</span>
                </Dropdown.Item>

                <Dropdown.Item href={route('profile.security')} className="dropdown-item">
                    <i className="mdi mdi-shield-lock-outline text-muted fs-16 align-middle me-1"></i>
                    <span className="align-middle">{t('Security')}</span>
                </Dropdown.Item>

                <div className="dropdown-divider"></div>

                {isSuperadmin ? (
                    <Dropdown.Item href={route('tenant.selector')} className="dropdown-item">
                        <i className="mdi mdi-domain text-muted fs-16 align-middle me-1"></i>
                        <span className="align-middle">{t('My Tenants')}</span>
                    </Dropdown.Item>
                ) : (
                    <Dropdown.Item href={workspaceLink} className="dropdown-item">
                        <i className="mdi mdi-view-dashboard-outline text-muted fs-16 align-middle me-1"></i>
                        <span className="align-middle">{t('My Workspace')}</span>
                    </Dropdown.Item>
                )}

                <Link className="dropdown-item" as="button" method="post" href={route('logout')}>
                    <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                    <span className="align-middle">{t('Logout')}</span>
                </Link>
            </Dropdown.Menu>
        </Dropdown>
    );
}
