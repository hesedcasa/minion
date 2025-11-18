# Project Structure

Detailed overview of the Minion codebase structure.

## Directory Layout

```
minion/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Main entry point
│   └── minion/                   # Core module
│       ├── index.ts              # Barrel export
│       ├── agentManager.ts       # Agent lifecycle
│       ├── workspaceManager.ts   # Git worktree operations
│       ├── server.ts             # Express + WebSocket server
│       └── types.ts              # TypeScript definitions
│
├── ui/                           # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Header.tsx
│   │   │   ├── Controls.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentsGrid.tsx
│   │   │   ├── ConnectionStatus.tsx
│   │   │   └── modals/
│   │   │       ├── CreateAgentModal.tsx
│   │   │       ├── AssignTaskModal.tsx
│   │   │       └── DiffModal.tsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts   # WebSocket hook
│   │   ├── types/
│   │   │   └── agent.ts          # Type definitions
│   │   ├── App.tsx               # Main component
│   │   ├── App.css               # Styles
│   │   └── main.tsx              # React entry point
│   ├── index.html                # HTML template
│   ├── tsconfig.json             # TypeScript config
│   └── vite.config.ts            # Vite config
│
├── dist/                         # Compiled server code
├── dist-ui/                      # Built React app
├── .minion/                      # Agent worktrees (gitignored)
│
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config
├── eslint.config.ts              # ESLint config
├── CLAUDE.md                     # Claude Code instructions
└── README.md                     # Project documentation
```

## Source Files

### `src/index.ts`

Main entry point that:
- Parses command-line arguments
- Starts the Express server
- Initializes WebSocket
- Serves the React UI

### `src/minion/agentManager.ts`

Agent lifecycle management:
- `createAgent()` - Creates new agent with worktree
- `sendMessage()` - Sends messages to agents
- `deleteAgent()` - Cleans up agent and worktree
- `listAgents()` - Returns all agents

### `src/minion/workspaceManager.ts`

Git worktree operations:
- `createWorktree()` - Creates isolated workspace
- `deleteWorktree()` - Removes worktree
- `mergeWorktree()` - Merges changes back
- `getDiff()` - Gets git diff

### `src/minion/server.ts`

Express server with WebSocket:
- REST API endpoints
- WebSocket connections
- Static file serving
- Real-time updates

### `src/minion/types.ts`

TypeScript type definitions for agents, messages, and configuration.

## UI Components

### `ui/src/App.tsx`

Main application component that manages:
- Agent list state
- WebSocket connection
- Modal visibility
- User interactions

### `ui/src/components/AgentCard.tsx`

Individual agent card displaying:
- Agent ID and status
- Creation time
- Message count
- Action buttons

### `ui/src/hooks/useWebSocket.ts`

Custom hook for WebSocket management:
- Connection lifecycle
- Message handling
- Reconnection logic
- Event broadcasting

## Build Output

### `dist/`

Compiled TypeScript server code:
```
dist/
├── index.js
└── minion/
    ├── index.js
    ├── agentManager.js
    ├── workspaceManager.js
    ├── server.js
    └── types.js
```

### `dist-ui/`

Production-ready React app:
```
dist-ui/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

## Key Patterns

### Barrel Exports

```typescript
// src/minion/index.ts
export { createAgent, deleteAgent } from './agentManager.js';
export { createWorktree } from './workspaceManager.js';
export type { Agent } from './types.js';
```

### ES Modules

```typescript
// All imports use .js extension
import { createAgent } from './minion/index.js';
```

### Type Safety

```typescript
// Comprehensive TypeScript types
interface Agent {
  id: string;
  status: AgentStatus;
  worktreePath: string;
  messages: AgentMessage[];
}
```

## Next Steps

- [Building](/dev/building) - Build and run guide
- [Contributing](/dev/contributing) - Contribution guidelines
- [Architecture](/guide/architecture) - System architecture
