import { Link } from '@inertiajs/react';
import React from 'react';
import { Col, Collapse, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { ShellNavItem, isShellNavItemActive } from '../common/shellNavigation';

type CommonProps = {
    items: ShellNavItem[];
    pathname: string;
    openIds: Set<string>;
    onToggle: (id: string) => void;
    onNavigate?: () => void;
};

function renderBadge(item: ShellNavItem, t: (key: string) => string) {
    if (item.locked) {
        return <span className="badge badge-pill bg-warning-subtle text-warning ms-auto">{t('Locked')}</span>;
    }

    if (!item.badge) {
        return null;
    }

    return <span className={`badge badge-pill bg-${item.badge.tone} ms-auto`}>{t(item.badge.labelKey)}</span>;
}

function NavCollapseLink({
    item,
    className,
    isActive,
    isOpen,
    onToggle,
}: {
    item: ShellNavItem;
    className: string;
    isActive: boolean;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const { t } = useTranslation();

    return (
        <Link
            onClick={(event) => {
                event.preventDefault();
                onToggle();
            }}
            className={`${className} ${isActive ? 'active' : ''}`.trim()}
            href="/#"
            data-bs-toggle="collapse"
            aria-expanded={isOpen}
        >
            {item.icon ? <i className={item.icon}></i> : null}
            <span>{t(item.labelKey)}</span>
            {renderBadge(item, t)}
        </Link>
    );
}

export function VerticalNavMenu({
    items,
    pathname,
    openIds,
    onToggle,
    onNavigate,
}: CommonProps) {
    const { t } = useTranslation();

    return (
        <>
            {items.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isOpen = openIds.has(item.id);
                const isActive = isShellNavItemActive(item, pathname);

                return (
                    <li className="nav-item" key={item.id}>
                        {hasChildren ? (
                            <>
                                <NavCollapseLink
                                    item={item}
                                    className="nav-link menu-link"
                                    isActive={isActive}
                                    isOpen={isOpen}
                                    onToggle={() => onToggle(item.id)}
                                />
                                <Collapse className="menu-dropdown" in={isOpen}>
                                    <div>
                                        <ul className="nav nav-sm flex-column">
                                            <NestedVerticalNavMenu
                                                items={item.children ?? []}
                                                pathname={pathname}
                                                openIds={openIds}
                                                onToggle={onToggle}
                                                onNavigate={onNavigate}
                                            />
                                        </ul>
                                    </div>
                                </Collapse>
                            </>
                        ) : (
                            <Link
                                href={item.href ?? '/#'}
                                className={`nav-link menu-link ${isActive ? 'active' : ''}`.trim()}
                                onClick={onNavigate}
                            >
                                {item.icon ? <i className={item.icon}></i> : null}
                                <span>{t(item.labelKey)}</span>
                                {renderBadge(item, t)}
                            </Link>
                        )}
                    </li>
                );
            })}
        </>
    );
}

function NestedVerticalNavMenu({
    items,
    pathname,
    openIds,
    onToggle,
    onNavigate,
}: CommonProps) {
    const { t } = useTranslation();

    return (
        <>
            {items.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isOpen = openIds.has(item.id);
                const isActive = isShellNavItemActive(item, pathname);

                return (
                    <li className="nav-item" key={item.id}>
                        {hasChildren ? (
                            <>
                                <NavCollapseLink
                                    item={item}
                                    className="nav-link"
                                    isActive={isActive}
                                    isOpen={isOpen}
                                    onToggle={() => onToggle(item.id)}
                                />
                                <Collapse className="menu-dropdown" in={isOpen}>
                                    <div>
                                        <ul className="nav nav-sm flex-column">
                                            <NestedVerticalNavMenu
                                                items={item.children ?? []}
                                                pathname={pathname}
                                                openIds={openIds}
                                                onToggle={onToggle}
                                                onNavigate={onNavigate}
                                            />
                                        </ul>
                                    </div>
                                </Collapse>
                            </>
                        ) : (
                            <Link
                                href={item.href ?? '/#'}
                                className={`nav-link ${isActive ? 'active' : ''}`.trim()}
                                onClick={onNavigate}
                            >
                                {t(item.labelKey)}
                                {renderBadge(item, t)}
                            </Link>
                        )}
                    </li>
                );
            })}
        </>
    );
}

export function HorizontalNavMenu({
    items,
    pathname,
    openIds,
    onToggle,
    onNavigate,
}: CommonProps) {
    const { t } = useTranslation();
    const menuItems = [...items];
    const splitMenuItems: ShellNavItem[] = [];
    const menuSplitContainer = 6;

    menuItems.forEach((item, index) => {
        if (index >= menuSplitContainer) {
            splitMenuItems.push(item);
        }
    });

    const visibleItems = menuItems.slice(0, menuSplitContainer);

    if (splitMenuItems.length > 0) {
        visibleItems.push({
            id: 'more',
            labelKey: 'layout.shell.nav.items.more',
            icon: 'ri-briefcase-2-line',
            children: splitMenuItems,
        });
    }

    return (
        <>
            {visibleItems.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isOpen = openIds.has(item.id);
                const isActive = isShellNavItemActive(item, pathname);

                return (
                    <li className="nav-item" key={item.id}>
                        {hasChildren ? (
                            <>
                                <NavCollapseLink
                                    item={item}
                                    className="nav-link menu-link"
                                    isActive={isActive}
                                    isOpen={isOpen}
                                    onToggle={() => onToggle(item.id)}
                                />
                                <Collapse
                                    className={item.id === 'baseUi' && (item.children?.length ?? 0) > 13 ? 'menu-dropdown mega-dropdown-menu' : 'menu-dropdown'}
                                    in={isOpen}
                                >
                                    <div>
                                        {item.id === 'baseUi' && (item.children?.length ?? 0) > 13 ? (
                                            <div className="menu-dropdown mega-dropdown-menu">
                                                <Row>
                                                    {(item.children ?? []).map((subItem) => (
                                                        <Col lg={4} key={subItem.id}>
                                                            <ul className="nav nav-sm flex-column">
                                                                <li className="nav-item">
                                                                    <Link href={subItem.href ?? '/#'} className="nav-link" onClick={onNavigate}>
                                                                        {t(subItem.labelKey)}
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        ) : (
                                            <ul className="nav nav-sm flex-column test">
                                                <NestedVerticalNavMenu
                                                    items={item.children ?? []}
                                                    pathname={pathname}
                                                    openIds={openIds}
                                                    onToggle={onToggle}
                                                    onNavigate={onNavigate}
                                                />
                                            </ul>
                                        )}
                                    </div>
                                </Collapse>
                            </>
                        ) : (
                            <Link
                                className={`nav-link menu-link ${isActive ? 'active' : ''}`.trim()}
                                href={item.href ?? '/#'}
                                onClick={onNavigate}
                            >
                                {item.icon ? <i className={item.icon}></i> : null}
                                <span>{t(item.labelKey)}</span>
                            </Link>
                        )}
                    </li>
                );
            })}
        </>
    );
}

export function TwoColumnNavIcons({
    items,
    pathname,
    activeRootId,
    onSelect,
}: {
    items: ShellNavItem[];
    pathname: string;
    activeRootId: string | null;
    onSelect: (item: ShellNavItem) => void;
}) {
    return (
        <>
            {items.map((item) => {
                if (!item.icon) {
                    return null;
                }

                const isActive = activeRootId === item.id || isShellNavItemActive(item, pathname);

                return (
                    <li key={item.id}>
                        <Link
                            href={item.href ?? '/#'}
                            data-sub-items={item.id}
                            className={`nav-icon ${isActive ? 'active' : ''}`.trim()}
                            data-bs-toggle={item.children?.length ? 'collapse' : undefined}
                            onClick={(event) => {
                                if (item.children?.length) {
                                    event.preventDefault();
                                    onSelect(item);
                                }
                            }}
                        >
                            <i className={item.icon}></i>
                        </Link>
                    </li>
                );
            })}
        </>
    );
}
