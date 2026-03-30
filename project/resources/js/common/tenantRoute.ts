import { usePage } from '@inertiajs/react';

function buildTenantPath(slug: string | undefined, isSuperadmin: boolean, path = ''): string {
    if (!slug) return isSuperadmin ? '/tenants' : '/tenant-access-required';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `/t/${slug}${normalized}`;
}

function tenantSlugFromPath(pathname: string): string | undefined {
    const match = pathname.match(/^\/t\/([^/]+)/);
    return match?.[1];
}

export function useTenantRoute() {
    const page = usePage<any>();
    const slug = page.props.currentTenant?.slug ?? tenantSlugFromPath(window.location.pathname);
    const isSuperadmin = Boolean(page.props.auth?.user?.is_superadmin);

    return {
        to: (path = '') => buildTenantPath(slug, isSuperadmin, path),
        routeTenant: (path = '') => buildTenantPath(slug, isSuperadmin, path),
    };
}
