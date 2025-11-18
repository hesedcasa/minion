---
layout: home

hero:
  name: "Minion"
  text: "AI Agent Orchestrator"
  tagline: Manage multiple Claude AI agents working in parallel on your codebase
  image:
    src: /hero.svg
    alt: Minion
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/hesedcasa/minion

features:
  - icon: 🤖
    title: Multi-Agent Orchestration
    details: Run multiple Claude AI agents simultaneously, each working on different tasks in isolated environments.

  - icon: 🌳
    title: Git Worktrees Integration
    details: Each agent operates in its own git worktree, enabling parallel development without conflicts.

  - icon: ⚡
    title: Real-Time Updates
    details: WebSocket-powered live updates keep you informed of agent status and progress in real-time.

  - icon: 🎨
    title: Modern React UI
    details: Beautiful, responsive web interface built with React, TypeScript, and Ant Design for seamless agent management.

  - icon: 🔧
    title: TypeScript & Type-Safe
    details: Fully written in TypeScript with comprehensive type definitions for reliability and developer experience.

  - icon: 🚀
    title: Easy to Deploy
    details: Simple installation and deployment with npm. Works with any git repository out of the box.
---

## Quick Start

```bash
# Install dependencies
npm install

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-your-api-key

# Build the project
npm run build

# Start Minion
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to access the web UI.

## Why Minion?

Minion solves the challenge of orchestrating multiple AI agents working on a single codebase. By leveraging git worktrees, each agent gets an isolated workspace, allowing them to:

- Work on different features simultaneously
- Avoid merge conflicts
- Maintain clean separation of concerns
- Merge changes back when ready

Perfect for:
- **Parallel Development**: Have multiple agents work on different features at once
- **Code Refactoring**: Let agents tackle different parts of a large refactor
- **Bug Fixing**: Assign different bugs to different agents
- **Experimentation**: Try different approaches in parallel without conflicts

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Web UI (React + TypeScript)           │
│              Port 3000 / 5173                   │
└────────────────┬────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────┐
│         Express Server + WebSocket              │
│         (Real-time Communication)               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            Agent Manager                        │
│     (Claude Agent SDK Integration)              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│          Workspace Manager                      │
│        (Git Worktree Operations)                │
└─────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    ┌───▼───┐       ┌─────▼────┐
    │Agent 1│  ...  │ Agent N  │
    │Worktree│      │ Worktree │
    └───────┘       └──────────┘
```

## Learn More

- [Getting Started Guide](/guide/getting-started) - Complete setup and installation
- [Architecture Overview](/guide/architecture) - Understand how Minion works
- [API Reference](/api/overview) - REST and WebSocket API documentation
- [Best Practices](/guide/best-practices) - Tips for effective multi-agent workflows
