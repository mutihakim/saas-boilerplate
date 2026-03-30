declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
declare module '*.webp';
declare module '*.ico';

interface ImportMeta {
    env: Record<string, string>;
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}

interface Window {
    axios: any;
    Echo?: any;
    Pusher?: any;
}

declare const route: (name: string, params?: Record<string, unknown>) => string;
