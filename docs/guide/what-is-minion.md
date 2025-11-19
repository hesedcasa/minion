# What is Minion?

Minion is a **TypeScript-based AI agent orchestrator** that enables you to manage multiple Claude AI agents working in parallel on the same codebase. Each agent operates in its own isolated git worktree, allowing for conflict-free parallel development.

## The Problem

When working on complex software projects, you often need to:

- Work on multiple features simultaneously
- Test different approaches in parallel
- Refactor different parts of the codebase
- Fix multiple bugs at once

Traditional development workflows make this challenging because:
- Multiple branches can lead to merge conflicts
- Context switching between tasks is mentally taxing
- Coordinating parallel work requires careful planning
- Manual merge conflicts are time-consuming

## The Solution

Minion solves these problems by:

1. **Agent Isolation**: Each Claude AI agent works in its own git worktree
2. **Parallel Execution**: Multiple agents can work simultaneously without interference
3. **Easy Management**: Simple web UI to create, monitor, and manage agents
4. **Conflict-Free**: Isolated workspaces prevent most merge conflicts
5. **Real-Time Updates**: WebSocket connections keep you informed of agent progress

## Key Features

### 🤖 Multi-Agent Orchestration

Run multiple Claude AI agents at once, each with its own task:

```typescript
// Agent 1: Refactoring authentication
// Agent 2: Adding new API endpoints
// Agent 3: Fixing bug in payment processing
```

Each agent maintains its own state and context, working independently.

### 🌳 Git Worktree Integration

Every agent gets its own git worktree in the `.minion/` directory:

```
.minion/
├── agent-abc123/  # Agent 1's workspace
├── agent-def456/  # Agent 2's workspace
└── agent-ghi789/  # Agent 3's workspace
```

This allows agents to:
- Make commits without affecting each other
- Work on separate branches
- Merge changes back when ready

### ⚡ Real-Time Communication

WebSocket-powered updates provide instant feedback:

- Agent status changes (idle, working, error)
- Message history and responses
- Progress tracking
- Error notifications

### 🎨 Modern Web UI

Beautiful React-based interface with:

- Agent creation wizard
- Task assignment modal
- Real-time status indicators
- Git diff viewer
- Message history

## Use Cases

### Parallel Feature Development

```bash
# Agent 1: Add user authentication
# Agent 2: Create admin dashboard
# Agent 3: Implement payment processing
```

All three features can be developed simultaneously without conflicts.

### Large-Scale Refactoring

```bash
# Agent 1: Refactor database layer
# Agent 2: Update API endpoints
# Agent 3: Migrate frontend components
```

Divide a large refactoring task into smaller, manageable pieces.

### Bug Triage

```bash
# Agent 1: Fix memory leak in worker process
# Agent 2: Resolve race condition in cache
# Agent 3: Patch security vulnerability
```

Tackle multiple bugs in parallel for faster resolution.

### Experimental Development

```bash
# Agent 1: Try approach A
# Agent 2: Try approach B
# Agent 3: Try approach C
```

Test different solutions and choose the best one.

## How It Works

1. **Create an Agent**: Use the web UI to create a new agent with a specific task
2. **Agent Gets Worktree**: Minion creates an isolated git worktree for the agent
3. **Agent Works**: Claude AI agent executes the task in its workspace
4. **Monitor Progress**: Watch real-time updates in the web UI
5. **Review Changes**: Use the diff viewer to see what changed
6. **Merge or Delete**: Merge successful changes back or delete the worktree

## Architecture Overview

```
┌─────────────┐
│   Web UI    │  ← You interact here
└──────┬──────┘
       │ HTTP/WS
┌──────▼──────┐
│   Server    │  ← Manages connections
└──────┬──────┘
       │
┌──────▼──────┐
│Agent Manager│  ← Creates & manages agents
└──────┬──────┘
       │
┌──────▼──────┐
│  Workspace  │  ← Git worktree operations
│   Manager   │
└──────┬──────┘
       │
┌──────▼──────┐
│   Agents    │  ← Claude AI agents working
└─────────────┘
```

## Technology Stack

- **Backend**: TypeScript, Node.js, Express
- **Frontend**: React, TypeScript, Vite, Ant Design
- **AI**: Claude Agent SDK (Anthropic)
- **Version Control**: Git worktrees
- **Communication**: WebSocket (ws library)

## Next Steps

Ready to get started?

- [Installation Guide](/guide/getting-started) - Set up Minion
- [Quick Start](/guide/quick-start) - Run your first agent
- [Architecture Deep Dive](/guide/architecture) - Learn how it works under the hood
