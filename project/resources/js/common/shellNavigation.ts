import { SharedPageProps } from '../types/page';

export type ShellNavBadgeTone = 'primary' | 'success' | 'warning' | 'info';

export type ShellNavBadge = {
    labelKey: string;
    tone: ShellNavBadgeTone;
};

export type ShellNavMatcher = (pathname: string) => boolean;

export type ShellNavItem = {
    id: string;
    labelKey: string;
    href?: string;
    icon?: string;
    match?: ShellNavMatcher;
    locked?: boolean;
    badge?: ShellNavBadge;
    children?: ShellNavItem[];
};

export type ShellNavSection = {
    id: string;
    titleKey: string;
    icon: string;
    items: ShellNavItem[];
};

function startsWith(path: string) {
    return (pathname: string) => pathname === path || pathname.startsWith(`${path}/`);
}

function upgradeHref(workspaceBase: string, moduleKey: string, hasTenant: boolean) {
    return hasTenant
        ? `${workspaceBase}/upgrade-required?module=${encodeURIComponent(moduleKey)}`
        : '/tenant-access-required';
}

function lockedItem(
    id: string,
    labelKey: string,
    href: string,
    icon: string,
    locked: boolean,
    match: ShellNavMatcher
): ShellNavItem {
    return {
        id,
        labelKey,
        href,
        icon,
        locked,
        match,
    };
}

export function buildShellNavigation(props: SharedPageProps): ShellNavSection[] {
    const area = props.app?.area ?? 'tenant';
    const tenantSlug = props.currentTenant?.slug;
    const hasTenant = Boolean(tenantSlug);
    const entitlements = props.entitlements?.modules ?? {};
    const features = props.features ?? {};
    const isSuperadmin = Boolean(props.auth?.is_superadmin || props.auth?.user?.is_superadmin);

    const workspaceBase = hasTenant ? `/t/${tenantSlug}` : (isSuperadmin ? '/admin/dashboard' : '/tenant-access-required');
    const workspaceUpgradeHref = (moduleKey: string) => upgradeHref(workspaceBase, moduleKey, hasTenant);

    const accountChildren: ShellNavItem[] = [
        { id: 'account-profile', labelKey: 'layout.shell.nav.items.profile', href: '/profile', icon: 'ri-user-line', match: startsWith('/profile') },
        { id: 'account-settings', labelKey: 'layout.shell.nav.items.profile_settings', href: '/profile/settings', icon: 'ri-settings-4-line', match: startsWith('/profile/settings') },
        { id: 'account-security', labelKey: 'layout.shell.nav.items.security', href: '/profile/security', icon: 'ri-lock-password-line', match: startsWith('/profile/security') },
    ];

    if (area === 'admin') {
        return [
            {
                id: 'admin-platform',
                titleKey: 'layout.shell.nav.sections.platform',
                icon: 'ri-dashboard-line',
                items: [
                    { id: 'admin-overview', labelKey: 'layout.shell.nav.items.overview', href: '/admin/dashboard', icon: 'ri-dashboard-line', match: startsWith('/admin/dashboard') },
                    {
                        id: 'admin-operations',
                        labelKey: 'layout.shell.nav.items.operations',
                        icon: 'ri-stack-line',
                        children: [
                            { id: 'admin-tenants', labelKey: 'layout.shell.nav.items.tenants', href: '/admin/tenants', icon: 'ri-building-line', match: startsWith('/admin/tenants') },
                            {
                                id: 'admin-billing',
                                labelKey: 'layout.shell.nav.items.billing',
                                icon: 'ri-vip-crown-line',
                                children: [
                                    {
                                        id: 'admin-subscriptions',
                                        labelKey: 'layout.shell.nav.items.subscriptions',
                                        href: '/admin/tenants/subscriptions',
                                        icon: 'ri-vip-crown-line',
                                        match: startsWith('/admin/tenants/subscriptions'),
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'admin-account',
                titleKey: 'layout.shell.nav.sections.account',
                icon: 'ri-user-line',
                items: [
                    {
                        id: 'admin-account-menu',
                        labelKey: 'layout.shell.nav.items.my_account',
                        icon: 'ri-account-circle-line',
                        children: accountChildren,
                    },
                ],
            },
        ];
    }

    const workspaceItems: ShellNavItem[] = [
        lockedItem(
            'tenant-dashboard',
            'layout.shell.nav.items.dashboard',
            entitlements.dashboard === false ? workspaceUpgradeHref('dashboard') : `${workspaceBase}/dashboard`,
            'ri-dashboard-line',
            entitlements.dashboard === false,
            startsWith(`${workspaceBase}/dashboard`)
        ),
    ];

    if (hasTenant) {
        workspaceItems.push({
            id: 'tenant-team',
            labelKey: 'layout.shell.nav.items.team',
            icon: 'ri-team-line',
            children: [
                lockedItem(
                    'tenant-members',
                    'layout.shell.nav.items.members',
                    entitlements['team.members'] === false ? workspaceUpgradeHref('team.members') : `${workspaceBase}/members`,
                    'ri-team-line',
                    entitlements['team.members'] === false,
                    startsWith(`${workspaceBase}/members`)
                ),
                {
                    id: 'tenant-access',
                    labelKey: 'layout.shell.nav.items.access',
                    icon: 'ri-shield-user-line',
                    children: [
                        lockedItem(
                            'tenant-roles',
                            'layout.shell.nav.items.roles',
                            entitlements['team.roles'] === false ? workspaceUpgradeHref('team.roles') : `${workspaceBase}/roles`,
                            'ri-shield-user-line',
                            entitlements['team.roles'] === false,
                            startsWith(`${workspaceBase}/roles`)
                        ),
                        lockedItem(
                            'tenant-invitations',
                            'layout.shell.nav.items.invitations',
                            entitlements['team.invitations'] === false ? workspaceUpgradeHref('team.invitations') : `${workspaceBase}/invitations`,
                            'ri-mail-open-line',
                            entitlements['team.invitations'] === false,
                            startsWith(`${workspaceBase}/invitations`)
                        ),
                    ],
                },
            ],
        });

        if (features.whatsapp) {
            workspaceItems.push({
                id: 'tenant-whatsapp',
                labelKey: 'layout.shell.nav.items.whatsapp',
                icon: 'ri-whatsapp-line',
                badge: { labelKey: 'layout.shell.badges.live', tone: 'success' },
                children: [
                    lockedItem(
                        'tenant-whatsapp-settings',
                        'layout.shell.nav.items.settings',
                        entitlements['whatsapp.settings'] === false ? workspaceUpgradeHref('whatsapp.settings') : `${workspaceBase}/whatsapp/settings`,
                        'ri-settings-3-line',
                        entitlements['whatsapp.settings'] === false,
                        startsWith(`${workspaceBase}/whatsapp/settings`)
                    ),
                    lockedItem(
                        'tenant-whatsapp-chats',
                        'layout.shell.nav.items.chats',
                        entitlements['whatsapp.chats'] === false ? workspaceUpgradeHref('whatsapp.chats') : `${workspaceBase}/whatsapp/chats`,
                        'ri-message-3-line',
                        entitlements['whatsapp.chats'] === false,
                        startsWith(`${workspaceBase}/whatsapp/chats`)
                    ),
                ],
            });
        }

        workspaceItems.push({
            id: 'tenant-settings',
            labelKey: 'layout.shell.nav.items.settings',
            icon: 'ri-settings-4-line',
            href: `${workspaceBase}/settings`,
            match: startsWith(`${workspaceBase}/settings`),
        });
    }

    const sections: ShellNavSection[] = [
        {
            id: 'tenant-workspace',
            titleKey: 'layout.shell.nav.sections.workspace',
            icon: 'ri-dashboard-line',
            items: workspaceItems,
        },
        {
            id: 'tenant-account',
            titleKey: 'layout.shell.nav.sections.account',
            icon: 'ri-user-line',
            items: [
                {
                    id: 'tenant-account-menu',
                    labelKey: 'layout.shell.nav.items.my_account',
                    icon: 'ri-account-circle-line',
                    children: accountChildren,
                },
            ],
        },
    ];

    if (isSuperadmin) {
        sections.push({
            id: 'tenant-platform',
            titleKey: 'layout.shell.nav.sections.platform',
            icon: 'ri-command-line',
            items: [
                {
                    id: 'tenant-admin-console',
                    labelKey: 'layout.shell.nav.items.admin_console',
                    href: '/admin/dashboard',
                    icon: 'ri-command-line',
                    match: startsWith('/admin/dashboard'),
                },
            ],
        });
    }

    return sections;
}

export function isShellNavItemActive(item: ShellNavItem, pathname: string): boolean {
    if (item.match?.(pathname) || (item.href && pathname === item.href)) {
        return true;
    }

    return item.children?.some((child) => isShellNavItemActive(child, pathname)) ?? false;
}

export function collectExpandedIds(items: ShellNavItem[], pathname: string, expanded = new Set<string>()): Set<string> {
    for (const item of items) {
        if (!item.children?.length) {
            continue;
        }

        if (item.children.some((child) => isShellNavItemActive(child, pathname))) {
            expanded.add(item.id);
            collectExpandedIds(item.children, pathname, expanded);
        }
    }

    return expanded;
}

export function buildHorizontalNavigation(sections: ShellNavSection[]): ShellNavItem[] {
    const flattenedItems: ShellNavItem[] = [];
    for (const section of sections) {
        flattenedItems.push(...section.items);
    }
    return flattenedItems;
}
