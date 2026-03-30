import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Cabinet Project Docs',
  description: 'Developer-facing documentation for the Cabinet SaaS boilerplate project.',
  base: '/cabinet/project/docs/.vitepress/dist/',
  lastUpdated: true,
  cleanUrls: false,
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Overview', link: '/00-overview' },
      { text: 'API', link: '/04-api-reference' },
      { text: 'Testing', link: '/06-testing-quality' },
    ],
    sidebar: [
      {
        text: 'Core',
        items: [
          { text: '00. Overview', link: '/00-overview' },
          { text: '01. Quickstart', link: '/01-quickstart' },
          { text: '02. Architecture', link: '/02-architecture' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'RBAC', link: '/03-features/rbac' },
          { text: 'i18n', link: '/03-features/i18n' },
          { text: 'Subscription', link: '/03-features/subscription' },
          { text: 'Tenant Settings', link: '/03-features/tenant-settings' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: '04. API Reference', link: '/04-api-reference' },
          { text: '05. UI Walkthrough', link: '/05-ui-walkthrough' },
          { text: '06. Testing & Quality', link: '/06-testing-quality' },
          { text: '07. Extension Guide', link: '/07-extension-guide' },
        ],
      },
      {
        text: 'Progress',
        items: [
          { text: '08. Progress Dashboard', link: '/08-progress/index' },
          { text: 'RBAC Progress', link: '/08-progress/modules/rbac' },
          { text: 'i18n Progress', link: '/08-progress/modules/i18n' },
          { text: 'Subscription Progress', link: '/08-progress/modules/subscription' },
          { text: 'Changelog 2026-03', link: '/08-progress/changelog/2026-03' },
        ],
      },
    ],
  },
});
