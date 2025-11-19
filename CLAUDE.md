# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies
npm install

# Build the TypeScript source
npm run build

# Run Minion
npm start

# Run in development
npm run dev

# Code quality
npm run format              # Format code with ESLint and Prettier
npm run find-deadcode       # Find unused exports with ts-prune
npm run pre-commit          # Run format + find-deadcode

# Testing
npm test                    # Run all Playwright tests
npm run test:api            # Run API tests only
npm run test:e2e            # Run E2E tests only
npm run test:ui             # Open Playwright UI mode
npm run test:report         # View test report
```

## Project Architecture

This is a **TypeScript-based AI agent orchestrator** that manages multiple Claude AI agents working in parallel on a codebase using git worktrees.

### Project Structure

```
src/
├── index.ts (entry point)        # Main CLI entry point
└── minion/
    ├── index.ts                       # Barrel export
    ├── agentManager.ts                # Agent lifecycle management
    ├── workspaceManager.ts            # Git worktree operations
    ├── server.ts                      # Express + WebSocket server
    └── types.ts                       # TypeScript type definitions

ui/                                    # React UI (built with Vite)
├── src/
│   ├── components/                    # React components
│   │   ├── Header.tsx
│   │   ├── Controls.tsx
│   │   ├── AgentCard.tsx
│   │   ├── AgentsGrid.tsx
│   │   ├── ConnectionStatus.tsx
│   │   └── modals/
│   │       ├── CreateAgentModal.tsx
│   │       ├── AssignTaskModal.tsx
│   │       └── DiffModal.tsx
│   ├── hooks/
│   │   └── useWebSocket.ts           # WebSocket hook for real-time updates
│   ├── types/
│   │   └── agent.ts                  # TypeScript type definitions
│   ├── App.tsx                       # Main App component
│   ├── App.css                       # Styling
│   └── main.tsx                      # React entry point
├── index.html                        # HTML template
└── tsconfig.json                     # TypeScript config for UI

dist/                                 # Compiled server code (TypeScript)
dist-ui/                              # Built React UI (production)
```

### Core Components

#### Entry Point (`src/index.ts`)

- Bootstraps the Minion server
- Parses command-line arguments (port, repository path)
- Initializes Express server with WebSocket support
- Serves the web UI

#### Minion Module (`src/minion/`)

- **agentManager.ts** - Manages Claude Agent SDK instances
  - `createAgent()` - Creates new agent in isolated worktree
  - `sendMessage()` - Sends messages to agents
  - `deleteAgent()` - Cleans up agent and worktree
  - `listAgents()` - Returns all active agents

- **workspaceManager.ts** - Git worktree operations
  - `createWorktree()` - Creates isolated git worktree
  - `deleteWorktree()` - Removes worktree
  - `listWorktrees()` - Lists all worktrees
  - `mergeWorktree()` - Merges worktree changes back

- **server.ts** - Web server with WebSocket
  - Express routes for agent operations
  - WebSocket connections for real-time updates
  - Serves built React UI from dist-ui/

- **types.ts** - TypeScript definitions
  - Agent types
  - Message types
  - Server configuration types

### Key Features

- **Multi-Agent Orchestration**: Run multiple Claude agents in parallel
- **Git Worktrees**: Each agent works in isolated git worktree
- **Real-Time Updates**: WebSocket communication for live status
- **React UI**: Modern React-based interface for managing agents
- **Conflict-Free Development**: Isolated workspaces prevent conflicts

### TypeScript Configuration

- **Target**: ES2022 modules (package.json `"type": "module"`)
- **Output**: Compiles to `dist/` directory
- **Declarations**: Generates `.d.ts` files
- **Source Maps**: Enabled for debugging

## Common Development Tasks

### Building and Running

```bash
# Build everything (server + UI)
npm run build

# Build server only
npm run build:server

# Build UI only
npm run build:ui

# Run server with tsx (no build step needed)
npm start
# or
npm run dev

# Run UI dev server (with hot reload)
npm run dev:ui

# After building, use the compiled binary
npm link  # Link globally
minion    # Use the CLI command
```

### Environment Setup

```bash
# Required: Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-your-api-key

# Optional: Specify repository path
minion --repo /path/to/repo

# Optional: Specify port
minion --port 8080
```

## Code Structure & Module Responsibilities

### Entry Point (`index.ts`)

- Main bootstrapper for the Minion server
- Command-line argument parsing
- Server initialization
- Environment variable handling

### Agent Manager (`minion/agentManager.ts`)

- Agent lifecycle (create, message, delete)
- Claude Agent SDK integration
- Agent state management
- Message routing

### Workspace Manager (`minion/workspaceManager.ts`)

- Git worktree operations
- Branch management
- Merge operations
- Cleanup and validation

### Server (`minion/server.ts`)

- Express HTTP server
- WebSocket server
- REST API endpoints
- Static file serving

### Key Implementation Details

- **Barrel Exports**: Each module directory has `index.ts` exporting public APIs
- **ES Modules**: All imports use `.js` extensions (TypeScript requirement)
- **Git Integration**: Uses git CLI commands for worktree management
- **Real-Time Updates**: WebSocket broadcasts for agent status changes
- **Error Handling**: Try-catch blocks with user-friendly messages
- **API Key Management**: Environment variable for Anthropic API key

## Dependencies

**Runtime**:

- `@anthropic-ai/claude-agent-sdk@^0.1.44` - Claude Agent SDK
- `express@^5.1.0` - Web server
- `ws@^8.18.3` - WebSocket server
- `cors@^2.8.5` - CORS middleware
- `react@^19.2.0` - React library
- `react-dom@^19.2.0` - React DOM renderer
- `@types/express@^5.0.5` - Express types
- `@types/ws@^8.18.1` - WebSocket types
- `@types/cors@^2.8.19` - CORS types

**Development**:

- `typescript@^5.0.0` - TypeScript compiler
- `tsx@^4.0.0` - TypeScript execution runtime
- `vite@^7.2.2` - Frontend build tool
- `@vitejs/plugin-react@^5.1.1` - Vite React plugin
- `@types/node@^24.10.1` - Node.js type definitions
- `@types/react@^19.2.6` - React type definitions
- `@types/react-dom@^19.2.3` - React DOM type definitions
- `eslint@^9.39.1` - Linting
- `prettier@3.6.2` - Code formatting
- `ts-prune@^0.10.3` - Find unused exports

## Important Notes

1. **Modular Structure**: Code is organized into focused modules
2. **ES2022 Modules**: Project uses `"type": "module"` - no CommonJS
3. **Agent SDK Integration**: Uses official Claude Agent SDK
4. **Git Worktrees**: Requires git repository for operation
5. **API Key Required**: Must set ANTHROPIC_API_KEY environment variable

## Commit Message Convention

**Always use Conventional Commits format** for all commit messages and PR titles:

- `feat:` - New features or capabilities
- `fix:` - Bug fixes
- `docs:` - Documentation changes only
- `refactor:` - Code refactoring without changing functionality
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks, dependency updates, build configuration

**Examples:**

```
feat: add parallel agent execution support
fix: resolve git worktree cleanup issue
docs: update README with environment setup
refactor: extract git operations into separate module
chore: update dependencies to latest versions
```

When creating pull requests, the PR title must follow this format. The PR description should provide additional context about what changed and why.

## Development Tips

### Working with Agents

1. Each agent runs in its own git worktree
2. Agents are isolated and can work in parallel
3. Changes can be merged back to main branch
4. WebSocket provides real-time agent status

### Working with Git Worktrees

1. Worktrees are created in `.minion/` directory
2. Each worktree is on its own branch
3. Cleanup removes both worktree and branch
4. Merge operations bring changes back

### Working with the React UI

1. **Development Mode**: Run `npm run dev:ui` to start Vite dev server with hot reload on port 5173
   - Changes to React components update instantly
   - Proxies API requests to backend server (port 3000)
   - WebSocket connections for real-time updates

2. **Production Build**: Run `npm run build:ui` to create optimized production build
   - Output goes to `dist-ui/` directory
   - Server automatically serves from `dist-ui/` in production

3. **Component Structure**:
   - Components in `ui/src/components/`
   - Hooks in `ui/src/hooks/`
   - Types in `ui/src/types/`
   - Modals use React state for open/close

4. **Styling**: CSS is in `ui/src/App.css` (same styles as original, unchanged)

5. **Ant Design Reference**: **ALWAYS refer to `ANT_DESIGN.md`** when working on UI components
   - Contains comprehensive Ant Design component documentation links
   - Design principles and UX patterns for enterprise applications
   - Vite integration guides (this project uses Vite)
   - Theming and customization documentation
   - Best practices for accessibility and component usage
   - Use this reference to ensure proper implementation following Ant Design standards

### Building and Testing

```bash
# Clean build
rm -rf dist && npm run build

# Test the CLI
npm start

# Test specific functionality (after building)
node dist/index.js --help
```

### Testing with Playwright

The project includes a comprehensive Playwright test suite covering both API endpoints and end-to-end UI testing.

**Test Structure:**

```
tests/
├── api/              # API endpoint tests
│   ├── health.spec.ts
│   ├── agents.spec.ts
│   ├── tasks.spec.ts
│   └── workspaces.spec.ts
├── e2e/              # End-to-end UI tests
│   ├── app-layout.spec.ts
│   ├── create-agent.spec.ts
│   ├── websocket.spec.ts
│   ├── theme.spec.ts
│   └── agent-workflow.spec.ts
├── fixtures/         # Test fixtures and base configuration
└── utils/           # Test utilities and helpers
```

**Running Tests:**

```bash
# Run all tests
npm test

# Run API tests only
npm run test:api

# Run E2E tests only
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# Open Playwright UI mode
npm run test:ui

# View test report
npm run test:report

# Generate tests with Codegen
npm run test:codegen
```

**Key Features:**

- **API Testing**: Tests all REST endpoints (agents, tasks, workspaces)
- **E2E Testing**: Tests user workflows and UI interactions
- **WebSocket Testing**: Tests real-time updates and connection handling
- **Fixtures and Helpers**: Reusable test utilities for common operations
- **CI/CD Integration**: Automated tests run on GitHub Actions
- **Parallel Execution**: Tests run in parallel with sharding on CI
- **Automatic Cleanup**: Tests clean up created agents after execution

See `tests/README.md` for detailed documentation on writing and debugging tests.

### Common Patterns

**Importing from modules:**

```typescript
import { createAgent, deleteAgent } from './minion/index.js';
import type { Agent, AgentMessage } from './minion/types.js';
```

**Error handling:**

```typescript
try {
  // Operation
} catch (error: any) {
  console.error('Error:', error.message || error);
  res.status(500).json({ error: error.message });
}
```

**WebSocket broadcast:**

```typescript
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'update', data }));
  }
});
```

## Code Quality Tools

### ESLint

The project uses ESLint with TypeScript support:

- Configuration: `eslint.config.ts`
- Extends `@eslint/js` recommended rules
- Uses `typescript-eslint` for TypeScript-specific linting
- Target: Node.js globals

### Prettier

Code formatting is handled by Prettier with the following plugins:

- `@trivago/prettier-plugin-sort-imports` - Auto-sorts imports

### Dead Code Detection

Use `ts-prune` to find unused exports:

```bash
npm run find-deadcode
```

### Pre-commit Hook

Run formatting and dead code detection before committing:

```bash
npm run pre-commit
```
