import { Link, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';

import ApplicationLogo from '../Components/ApplicationLogo';
import {
    ShellNavItem,
    ShellNavSection,
    buildHorizontalNavigation,
    collectExpandedIds,
    isShellNavItemActive,
} from '../common/shellNavigation';
import { AppShellPreferences, SharedPageProps } from '../types/page';

import { HorizontalNavMenu, TwoColumnNavIcons, VerticalNavMenu } from './AppShellNav';

type Props = {
    sections: ShellNavSection[];
    preferences: AppShellPreferences;
    onCloseMobileSidebar: () => void;
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

function flattenSections(sections: ShellNavSection[]) {
    return sections.flatMap((section) => section.items);
}

function initialTwoColumnItem(items: ShellNavItem[], pathname: string): ShellNavItem | null {
    for (const item of items) {
        if (item.children?.length && isShellNavItemActive(item, pathname)) {
            return item;
        }
    }

    return items.find((item) => item.children?.length) ?? null;
}

export default function AppShellSidebar({ sections, preferences, onCloseMobileSidebar }: Props) {
    const pathname = window.location.pathname;
    const { props } = usePage<SharedPageProps>();
    const { t } = useTranslation();
    const homeLink = resolveHomeLink(props);
    const usesDarkLogo = preferences.leftSidebarType === 'light' && preferences.layoutModeType !== 'dark';
    const horizontalItems = useMemo(() => buildHorizontalNavigation(sections), [sections]);
    const flatItems = useMemo(() => flattenSections(sections), [sections]);
    const navigationScopeKey = `${preferences.layoutType}:${pathname}`;
    const [openOverrides, setOpenOverrides] = useState<{ scopeKey: string; values: Record<string, boolean> }>({
        scopeKey: navigationScopeKey,
        values: {},
    });
    const [twoColumnSelection, setTwoColumnSelection] = useState<{ scopeKey: string; itemId: string | null }>({
        scopeKey: navigationScopeKey,
        itemId: null,
    });

    const baseOpenIds = useMemo(
        () => collectExpandedIds(preferences.layoutType === 'horizontal' ? horizontalItems : flatItems, pathname),
        [flatItems, horizontalItems, pathname, preferences.layoutType]
    );

    const openIds = useMemo(() => {
        const next = new Set(baseOpenIds);
        const overrides = openOverrides.scopeKey === navigationScopeKey ? openOverrides.values : {};

        Object.entries(overrides).forEach(([id, open]) => {
            if (open) {
                next.add(id);
            } else {
                next.delete(id);
            }
        });

        return next;
    }, [baseOpenIds, navigationScopeKey, openOverrides]);

    const activeTwoColumnItem = useMemo(() => {
        const itemId = twoColumnSelection.scopeKey === navigationScopeKey ? twoColumnSelection.itemId : null;
        if (itemId) {
            const selected = flatItems.find((item) => item.id === itemId);
            if (selected) {
                return selected;
            }
        }

        return initialTwoColumnItem(flatItems, pathname);
    }, [flatItems, navigationScopeKey, pathname, twoColumnSelection]);

    const handleToggle = useCallback((id: string) => {
        setOpenOverrides((current) => {
            const values = current.scopeKey === navigationScopeKey ? current.values : {};
            const nextOpen = !openIds.has(id);

            return {
                scopeKey: navigationScopeKey,
                values: {
                    ...values,
                    [id]: nextOpen,
                },
            };
        });
    }, [navigationScopeKey, openIds]);

    useEffect(() => {
        const verticalOverlay = document.getElementsByClassName('vertical-overlay');
        if (!verticalOverlay[0]) {
            return undefined;
        }

        const handleOverlay = () => {
            document.body.classList.remove('vertical-sidebar-enable');
            onCloseMobileSidebar();
        };

        verticalOverlay[0].addEventListener('click', handleOverlay);

        return () => {
            verticalOverlay[0].removeEventListener('click', handleOverlay);
        };
    }, [onCloseMobileSidebar]);

    const toggleSmHoverMenu = () => {
        const currentSize = document.documentElement.getAttribute('data-sidebar-size');

        if (currentSize === 'sm-hover') {
            document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
            return;
        }

        if (currentSize === 'sm-hover-active') {
            document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
            return;
        }

        document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    };

    return (
        <>
            <div className="app-menu navbar-menu">
                <div className="navbar-brand-box">
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
                    <button
                        onClick={toggleSmHoverMenu}
                        type="button"
                        className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
                        id="vertical-hover"
                    >
                        <i className="ri-record-circle-line"></i>
                    </button>
                </div>

                {preferences.layoutType === 'horizontal' ? (
                    <div id="scrollbar">
                        <Container fluid>
                            <div id="two-column-menu"></div>
                            <ul className="navbar-nav" id="navbar-nav">
                                <HorizontalNavMenu
                                    items={horizontalItems}
                                    pathname={pathname}
                                    openIds={openIds}
                                    onToggle={handleToggle}
                                    onNavigate={onCloseMobileSidebar}
                                />
                            </ul>
                        </Container>
                    </div>
                ) : preferences.layoutType === 'twocolumn' ? (
                    <>
                        <div id="scrollbar">
                            <Container fluid>
                                <div id="two-column-menu">
                                    <SimpleBar className="twocolumn-iconview">
                                        <Link href={homeLink} className="logo">
                                            <ApplicationLogo compact dark />
                                        </Link>
                                        <TwoColumnNavIcons
                                            items={flatItems}
                                            pathname={pathname}
                                            activeRootId={activeTwoColumnItem?.id ?? null}
                                            onSelect={(item) => setTwoColumnSelection({ scopeKey: navigationScopeKey, itemId: item.id })}
                                        />
                                    </SimpleBar>
                                </div>
                                <SimpleBar id="navbar-nav" className="navbar-nav">
                                    {activeTwoColumnItem?.children?.length ? (
                                        <li className="nav-item">
                                            <div>
                                                <ul className="nav nav-sm flex-column" id={activeTwoColumnItem.id}>
                                                    <VerticalNavMenu
                                                        items={activeTwoColumnItem.children}
                                                        pathname={pathname}
                                                        openIds={openIds}
                                                        onToggle={handleToggle}
                                                        onNavigate={onCloseMobileSidebar}
                                                    />
                                                </ul>
                                            </div>
                                        </li>
                                    ) : null}
                                </SimpleBar>
                            </Container>
                        </div>
                        <div className="sidebar-background"></div>
                    </>
                ) : (
                    <>
                        <SimpleBar id="scrollbar" className="h-100">
                            <Container fluid>
                                <div id="two-column-menu"></div>
                                <ul className="navbar-nav" id="navbar-nav">
                                    {sections.map((section) => (
                                        <React.Fragment key={section.id}>
                                            <li className="menu-title">
                                                <span>{t(section.titleKey)}</span>
                                            </li>
                                            <VerticalNavMenu
                                                items={section.items}
                                                pathname={pathname}
                                                openIds={openIds}
                                                onToggle={handleToggle}
                                                onNavigate={onCloseMobileSidebar}
                                            />
                                        </React.Fragment>
                                    ))}
                                </ul>
                            </Container>
                        </SimpleBar>
                        <div className="sidebar-background"></div>
                    </>
                )}
            </div>
            <div className="vertical-overlay"></div>
        </>
    );
}
