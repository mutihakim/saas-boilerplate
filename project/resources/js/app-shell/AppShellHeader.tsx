import { Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import ApplicationLogo from '../Components/ApplicationLogo';
import LanguageDropdown from '../Components/Common/LanguageDropdown';
import LightDark from '../Components/Common/LightDark';
import ProfileDropdown from '../Components/Common/ProfileDropdown';
import SearchOption from '../Components/Common/SearchOption';
import { AppShellPreferences, SharedPageProps } from '../types/page';

type Props = {
    headerClass: string;
    preferences: AppShellPreferences;
    onToggleTheme: (mode: 'light' | 'dark') => void;
    onOpenCustomizer: () => void;
    onToggleHamburger: () => void;
};

function resolveHomeLink(props: SharedPageProps) {
    if (props.app?.area === 'admin') {
        return '/admin/dashboard';
    }

    if (props.auth?.is_superadmin && !props.currentTenant?.slug) {
        return '/admin/dashboard';
    }

    if (props.currentTenant?.slug) {
        return `/t/${props.currentTenant.slug}/dashboard`;
    }

    return '/tenant-access-required';
}

export default function AppShellHeader({
    headerClass,
    preferences,
    onToggleTheme,
    onOpenCustomizer,
    onToggleHamburger,
}: Props) {
    const { props } = usePage<SharedPageProps>();
    const { t } = useTranslation();
    const homeLink = resolveHomeLink(props);
    const usesDarkLogo = preferences.topbarThemeType !== 'dark' && preferences.layoutModeType !== 'dark';
    const tenantLabel = props.currentTenant?.presentable_name || props.currentTenant?.display_name || props.currentTenant?.name;
    const [search, setSearch] = useState(false);

    return (
        <header id="page-topbar" className={headerClass}>
            <div className="layout-width">
                <div className="navbar-header">
                    <div className="d-flex">
                        <div className="navbar-brand-box horizontal-logo">
                            <Link href={homeLink} className="logo logo-dark">
                                <span className="logo-sm">
                                    <ApplicationLogo compact dark />
                                </span>
                                <span className="logo-lg">
                                    <ApplicationLogo dark />
                                </span>
                            </Link>

                            <Link href={homeLink} className="logo logo-light">
                                <span className="logo-sm">
                                    <ApplicationLogo compact dark={usesDarkLogo} />
                                </span>
                                <span className="logo-lg">
                                    <ApplicationLogo dark={usesDarkLogo} />
                                </span>
                            </Link>
                        </div>

                        <button
                            onClick={onToggleHamburger}
                            type="button"
                            className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                            id="topnav-hamburger-icon"
                        >
                            <span className="hamburger-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>

                        <SearchOption />

                        {tenantLabel ? (
                            <div className="d-none d-xl-flex align-items-center ms-3">
                                <span
                                    className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2"
                                    title={t('layout.shell.topbar.active_workspace', { tenant: tenantLabel })}
                                >
                                    <i className="ri-building-4-line align-bottom me-1"></i>
                                    {tenantLabel}
                                </span>
                            </div>
                        ) : null}
                    </div>

                    <div className="d-flex align-items-center">
                        <Dropdown
                            show={search}
                            onToggle={(nextShow) => setSearch(nextShow)}
                            className="d-md-none topbar-head-dropdown header-item"
                        >
                            <Dropdown.Toggle
                                type="button"
                                as="button"
                                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                                aria-label={t('layout.shell.search.mobile_trigger')}
                            >
                                <i className="bx bx-search fs-22"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-lg dropdown-menu-end p-0">
                                <Form className="p-3">
                                    <div className="form-group m-0">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={t('layout.shell.search.placeholder')}
                                                aria-label={t('layout.shell.search.placeholder')}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                type="submit"
                                                aria-label={t('layout.shell.search.submit')}
                                            >
                                                <i className="mdi mdi-magnify"></i>
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            </Dropdown.Menu>
                        </Dropdown>

                        <LanguageDropdown />
                        <LightDark layoutMode={preferences.layoutModeType} onChangeLayoutMode={onToggleTheme} />

                        <div className="ms-1 header-item d-none d-sm-flex">
                            <button
                                type="button"
                                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                                aria-label={t('layout.shell.topbar.open_customizer')}
                                title={t('layout.shell.topbar.open_customizer')}
                                onClick={onOpenCustomizer}
                            >
                                <i className="mdi mdi-cog-outline fs-22"></i>
                            </button>
                        </div>

                        <ProfileDropdown />
                    </div>
                </div>
            </div>
        </header>
    );
}
