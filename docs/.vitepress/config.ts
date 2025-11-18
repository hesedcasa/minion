import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Minion',
  description:
    'A TypeScript-based AI agent orchestrator for managing multiple Claude AI agents in parallel',
  base: '/minion/',
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'GitHub', link: 'https://github.com/hesedcasa/minion' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Minion?', link: '/guide/what-is-minion' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Quick Start', link: '/guide/quick-start' },
        ],
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Architecture', link: '/guide/architecture' },
          { text: 'Agents', link: '/guide/agents' },
          { text: 'Git Worktrees', link: '/guide/worktrees' },
          { text: 'Multi-Agent Orchestration', link: '/guide/orchestration' },
        ],
      },
      {
        text: 'User Guide',
        items: [
          { text: 'Creating Agents', link: '/guide/creating-agents' },
          { text: 'Managing Agents', link: '/guide/managing-agents' },
          { text: 'Merging Changes', link: '/guide/merging-changes' },
          { text: 'Best Practices', link: '/guide/best-practices' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Project Structure', link: '/dev/project-structure' },
          { text: 'Building', link: '/dev/building' },
          { text: 'Contributing', link: '/dev/contributing' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/overview' },
          { text: 'REST API', link: '/api/rest' },
          { text: 'WebSocket API', link: '/api/websocket' },
          { text: 'TypeScript API', link: '/api/typescript' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hesedcasa/minion' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present',
    },
  },
});
