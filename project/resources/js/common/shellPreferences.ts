import {
    AppShellPreferences,
    AppShellTheme,
    UiPreferences,
} from '../types/page';

export const defaultAppShellPreferences: AppShellPreferences = {
    version: 1,
    layoutType: 'vertical',
    layoutModeType: 'light',
    layoutWidthType: 'fluid',
    layoutPositionType: 'fixed',
    topbarThemeType: 'light',
    leftSidebarType: 'gradient',
    leftsidbarSizeType: 'lg',
    leftSidebarViewType: 'default',
    leftSidebarImageType: 'none',
    sidebarVisibilitytype: 'show',
    preloader: 'disable',
};

export const defaultUiPreferences: UiPreferences = {
    version: 4,
    appShell: defaultAppShellPreferences,
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function normalizeLayoutType(value: unknown): AppShellPreferences['layoutType'] {
    return value === 'horizontal' || value === 'twocolumn' || value === 'semibox' ? value : 'vertical';
}

function normalizeColorMode(value: unknown): AppShellPreferences['layoutModeType'] {
    return value === 'dark' ? 'dark' : 'light';
}

function normalizeContentWidth(value: unknown): AppShellPreferences['layoutWidthType'] {
    if (value === 'boxed') {
        return 'boxed';
    }

    return 'fluid';
}

function normalizeSidebarSize(value: unknown): AppShellPreferences['leftsidbarSizeType'] {
    if (value === 'md' || value === 'sm' || value === 'sm-hover') {
        return value;
    }

    return 'lg';
}

function normalizeTopbarTheme(value: unknown): AppShellPreferences['topbarThemeType'] {
    return value === 'dark' ? 'dark' : 'light';
}

function normalizeSidebarTheme(value: unknown): AppShellTheme {
    if (
        value === 'dark'
        || value === 'gradient'
        || value === 'gradient-2'
        || value === 'gradient-3'
        || value === 'gradient-4'
    ) {
        return value;
    }

    return 'light';
}

function normalizeLayoutPosition(value: unknown): AppShellPreferences['layoutPositionType'] {
    return value === 'scrollable' ? 'scrollable' : 'fixed';
}

function normalizeSidebarView(value: unknown): AppShellPreferences['leftSidebarViewType'] {
    return value === 'detached' ? 'detached' : 'default';
}

function normalizeSidebarImage(value: unknown): AppShellPreferences['leftSidebarImageType'] {
    if (value === 'img-1' || value === 'img-2' || value === 'img-3' || value === 'img-4') {
        return value;
    }

    return 'none';
}

function normalizeSidebarVisibility(value: unknown): AppShellPreferences['sidebarVisibilitytype'] {
    return value === 'hidden' ? 'hidden' : 'show';
}

function normalizePreloader(value: unknown): AppShellPreferences['preloader'] {
    return value === 'enable' ? 'enable' : 'disable';
}

function normalizeFromMinimalCoreShape(value: Record<string, unknown>): AppShellPreferences {
    return {
        version: 1,
        layoutType: 'vertical',
        layoutModeType: normalizeColorMode(value.colorMode),
        layoutWidthType: normalizeContentWidth(value.contentWidth),
        layoutPositionType: 'fixed',
        topbarThemeType: 'light',
        leftSidebarType: 'gradient',
        leftsidbarSizeType: value.sidebarCollapsed === true ? 'sm' : 'lg',
        leftSidebarViewType: 'default',
        leftSidebarImageType: 'none',
        sidebarVisibilitytype: 'show',
        preloader: 'disable',
    };
}

function normalizeFromSplitNamespaces(value: Record<string, unknown>): AppShellPreferences {
    const adminShell = isRecord(value.adminShell) ? value.adminShell : null;
    const workspaceShell = isRecord(value.workspaceShell) ? value.workspaceShell : null;

    if (adminShell) {
        return normalizeAppShellPreferences(adminShell);
    }

    if (workspaceShell) {
        return normalizeFromMinimalCoreShape(workspaceShell);
    }

    return defaultAppShellPreferences;
}

function normalizeCanonicalAppShell(value: Record<string, unknown>): AppShellPreferences {
    return {
        version: 1,
        layoutType: normalizeLayoutType(value.layoutType),
        layoutModeType: normalizeColorMode(value.layoutModeType),
        layoutWidthType: normalizeContentWidth(value.layoutWidthType),
        layoutPositionType: normalizeLayoutPosition(value.layoutPositionType),
        topbarThemeType: normalizeTopbarTheme(value.topbarThemeType),
        leftSidebarType: normalizeSidebarTheme(value.leftSidebarType),
        leftsidbarSizeType: normalizeSidebarSize(value.leftsidbarSizeType),
        leftSidebarViewType: normalizeSidebarView(value.leftSidebarViewType),
        leftSidebarImageType: normalizeSidebarImage(value.leftSidebarImageType),
        sidebarVisibilitytype: normalizeSidebarVisibility(value.sidebarVisibilitytype),
        preloader: normalizePreloader(value.preloader),
    };
}

function normalizeFromTransitionalShape(value: Record<string, unknown>): AppShellPreferences {
    return {
        version: 1,
        layoutType: 'vertical',
        layoutModeType: normalizeColorMode(value.colorMode),
        layoutWidthType: normalizeContentWidth(value.contentWidth),
        layoutPositionType: normalizeLayoutPosition(value.layoutPosition),
        topbarThemeType: normalizeTopbarTheme(value.topbarTheme),
        leftSidebarType: normalizeSidebarTheme(value.sidebarTheme),
        leftsidbarSizeType: normalizeSidebarSize(value.sidebarSize),
        leftSidebarViewType: 'default',
        leftSidebarImageType: 'none',
        sidebarVisibilitytype: 'show',
        preloader: 'disable',
    };
}

export function normalizeAppShellPreferences(value: unknown): AppShellPreferences {
    if (!isRecord(value)) {
        return defaultAppShellPreferences;
    }

    if ('appShell' in value && isRecord(value.appShell)) {
        return normalizeAppShellPreferences(value.appShell);
    }

    if ('adminShell' in value || 'workspaceShell' in value) {
        return normalizeFromSplitNamespaces(value);
    }

    if (
        'layoutType' in value
        || 'layoutModeType' in value
        || 'layoutWidthType' in value
        || 'leftsidbarSizeType' in value
        || 'leftSidebarType' in value
        || 'topbarThemeType' in value
        || 'layoutPositionType' in value
        || 'leftSidebarViewType' in value
        || 'leftSidebarImageType' in value
        || 'sidebarVisibilitytype' in value
        || 'preloader' in value
    ) {
        return normalizeCanonicalAppShell(value);
    }

    if ('colorMode' in value || 'contentWidth' in value || 'sidebarCollapsed' in value) {
        if ('sidebarSize' in value || 'topbarTheme' in value || 'sidebarTheme' in value || 'layoutPosition' in value) {
            return normalizeFromTransitionalShape(value);
        }

        return normalizeFromMinimalCoreShape(value);
    }

    return defaultAppShellPreferences;
}

export function normalizeUiPreferences(value: unknown): UiPreferences {
    return {
        version: 4,
        appShell: normalizeAppShellPreferences(value),
    };
}

export function serializeAppShellPreferences(preferences: AppShellPreferences): AppShellPreferences {
    return {
        version: 1,
        layoutType: preferences.layoutType,
        layoutModeType: preferences.layoutModeType,
        layoutWidthType: preferences.layoutWidthType,
        layoutPositionType: preferences.layoutPositionType,
        topbarThemeType: preferences.topbarThemeType,
        leftSidebarType: preferences.leftSidebarType,
        leftsidbarSizeType: preferences.leftsidbarSizeType,
        leftSidebarViewType: preferences.leftSidebarViewType,
        leftSidebarImageType: preferences.leftSidebarImageType,
        sidebarVisibilitytype: preferences.sidebarVisibilitytype,
        preloader: preferences.preloader,
    };
}

export function serializeUiPreferences(preferences: UiPreferences): UiPreferences {
    return {
        version: 4,
        appShell: serializeAppShellPreferences(preferences.appShell),
    };
}

export function applyAppShellPreferences(preferences: AppShellPreferences) {
    if (typeof document === 'undefined') {
        return;
    }

    const layoutWidth = preferences.layoutWidthType === 'boxed' ? 'boxed' : 'fluid';

    document.documentElement.setAttribute('data-layout', preferences.layoutType);
    document.documentElement.setAttribute('data-bs-theme', preferences.layoutModeType);
    document.documentElement.setAttribute('data-layout-width', layoutWidth);
    document.documentElement.setAttribute('data-layout-position', preferences.layoutPositionType);
    document.documentElement.setAttribute('data-topbar', preferences.topbarThemeType);
    document.documentElement.setAttribute('data-sidebar', preferences.leftSidebarType);
    document.documentElement.setAttribute('data-sidebar-size', preferences.leftsidbarSizeType);
    document.documentElement.setAttribute('data-layout-style', preferences.leftSidebarViewType);
    document.documentElement.setAttribute('data-sidebar-image', preferences.leftSidebarImageType);
    document.documentElement.setAttribute('data-sidebar-visibility', preferences.sidebarVisibilitytype);
    document.documentElement.setAttribute('data-preloader', preferences.preloader);

    if (preferences.layoutType === 'horizontal') {
        document.documentElement.removeAttribute('data-sidebar-size');
    }

    if (preferences.layoutType === 'twocolumn') {
        document.documentElement.removeAttribute('data-layout-width');
    }

    if (preferences.layoutType === 'semibox') {
        document.documentElement.setAttribute('data-layout-width', 'fluid');
        document.documentElement.setAttribute('data-layout-style', 'default');
    }

    document.body.classList.add('app-shell-active');
}
