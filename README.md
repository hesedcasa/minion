# Minion

[![npm minion package](https://img.shields.io/npm/v/minion.svg)](https://npmjs.org/package/minion)

Orchestrate multiple Claude AI agents working in parallel on your codebase

## Features

- 🎭 Orchestrate multiple Claude Agent SDK instances in parallel
- 🔀 Isolated git worktrees for conflict-free development
- 🌐 Modern web UI for managing your agent orchestra
- 📡 Real-time WebSocket updates for agent status
- 🔄 Easy review and merge of agent changes
- 🎯 Assign different tasks to different agents simultaneously

**[📖 Read the full Minion documentation →](./MINION.md)**

## Requirements

- [Node.js](https://nodejs.org/) v22.0 or newer
- [npm](https://www.npmjs.com/)
- Anthropic API key and a git repository

## Installation

```bash
npm install -g minion
```

## Quick Start

Start the Minion web server to orchestrate multiple AI agents:

```bash
# Set your API key
export ANTHROPIC_API_KEY=sk-ant-your-api-key

# Start Minion (opens on http://localhost:3000)
minion

# Or with custom options
minion --port 8080 --repo /path/to/repo
```

Then open your browser to `http://localhost:3000` and start creating agents!

**[📖 Full Minion Guide →](./MINION.md)**

## About Minion

Minion is inspired by [Minion.build](https://minion.build/) and implements a web-based orchestration platform for managing multiple Claude AI agents. It uses the [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript) and git worktrees to enable parallel development with multiple autonomous agents.

**[📖 Full Minion Documentation →](./MINION.md)**

## Repository Structure

```
minion/
├── src/
│   ├── index.ts            # Minion entry point
│   └── minion/                  # Minion implementation
│       ├── agentManager.ts      # Agent orchestration
│       ├── workspaceManager.ts  # Git worktree management
│       ├── server.ts            # Express + WebSocket server
│       └── types.ts             # TypeScript definitions
├── public/                      # Minion web UI
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── README.md                    # This file
└── MINION.md                    # Detailed Minion docs
```

## License

Apache-2.0
