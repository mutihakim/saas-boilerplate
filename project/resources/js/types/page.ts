export type AppArea = 'tenant' | 'admin';

export type AppLayoutType = 'vertical' | 'horizontal' | 'twocolumn' | 'semibox';
export type ShellColorMode = 'light' | 'dark';
export type ShellContentWidth = 'fluid' | 'boxed';
export type AppSidebarSize = 'lg' | 'md' | 'sm' | 'sm-hover';
export type AppSidebarView = 'default' | 'detached';
export type AppSidebarVisibility = 'show' | 'hidden';
export type AppSidebarImage = 'none' | 'img-1' | 'img-2' | 'img-3' | 'img-4';
export type AppPreloader = 'enable' | 'disable';
export type AppShellTheme = 'light' | 'dark' | 'gradient' | 'gradient-2' | 'gradient-3' | 'gradient-4';
export type AppLayoutPosition = 'fixed' | 'scrollable';

export type AppShellPreferences = {
    version: 1;
    layoutType: AppLayoutType;
    layoutModeType: ShellColorMode;
    layoutWidthType: ShellContentWidth;
    layoutPositionType: AppLayoutPosition;
    topbarThemeType: 'light' | 'dark';
    leftSidebarType: AppShellTheme;
    leftsidbarSizeType: AppSidebarSize;
    leftSidebarViewType: AppSidebarView;
    leftSidebarImageType: AppSidebarImage;
    sidebarVisibilitytype: AppSidebarVisibility;
    preloader: AppPreloader;
};

export type UiPreferences = {
    version: 4;
    appShell: AppShellPreferences;
};

export type SharedUser = {
    id?: number;
    name: string;
    email?: string | null;
    avatar_url?: string | null;
    job_title?: string | null;
    is_superadmin?: boolean;
};

export type SharedPageProps = {
    app?: {
        area?: AppArea;
        branding?: {
            logoLightUrl: string;
            logoDarkUrl: string;
            logoIconUrl: string;
            faviconUrl: string;
        };
    };
    auth?: {
        user?: SharedUser | null;
        is_superadmin?: boolean;
        is_impersonating?: boolean;
        permissions?: string[];
        ui_preferences?: unknown;
    };
    currentTenant?: {
        id: number;
        slug: string;
        name: string;
        display_name?: string | null;
        presentable_name?: string;
        locale?: string | null;
        timezone?: string | null;
        currency_code?: string | null;
        plan_code: string;
        branding?: {
            logoLightUrl: string;
            logoDarkUrl: string;
            logoIconUrl: string;
            faviconUrl: string;
        };
    } | null;
    currentTenantMember?: {
        id: number;
        role_code: string;
    } | null;
    entitlements?: {
        modules?: Record<string, boolean>;
    };
    features?: {
        whatsapp?: boolean;
    };
};
