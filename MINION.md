# 🎵 Minion - AI Agent Orchestrator

Minion is a web-based orchestration platform for managing multiple Claude AI agents working in parallel on the same codebase. Inspired by [Minion.build](https://minion.build/), this implementation runs locally on Node.js and uses the [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript) for TypeScript.

## Overview

Minion allows you to:

- **Create multiple AI agents** that work on different tasks simultaneously
- **Isolate workspaces** using git worktrees to prevent conflicts
- **Orchestrate tasks** through an intuitive web interface
- **Monitor progress** in real-time with WebSocket updates
- **Review and merge changes** from each agent independently

Think of it as conducting an orchestra of AI coding agents, where each agent works in harmony on separate tasks within the same repository.

## Architecture

### Core Components

1. **Agent Manager** (`src/minion/agentManager.ts`)
   - Creates and manages Claude Agent SDK instances
   - Handles task assignment and execution
   - Tracks agent status and lifecycle

2. **Workspace Manager** (`src/minion/workspaceManager.ts`)
   - Creates isolated git worktrees for each agent
   - Manages branch creation and cleanup
   - Handles merging changes back to main branch

3. **Minion Server** (`src/minion/server.ts`)
   - Express.js REST API for agent management
   - WebSocket server for real-time updates
   - Serves the web UI

4. **Web UI** (`public/`)
   - Modern, responsive interface
   - Real-time agent status updates
   - Task assignment and monitoring
   - Diff viewer and merge controls

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Web Browser UI                       │
│  (Agent Dashboard, Task Assignment, Diff Viewer)        │
└─────────────────┬────────────────────┬──────────────────┘
                  │                    │
           REST API │            WebSocket │ (Real-time)
                  │                    │
┌─────────────────┴────────────────────┴──────────────────┐
│              Minion Server (Node.js)                  │
│  ┌──────────────────┐    ┌───────────────────────┐     │
│  │  Agent Manager   │    │  Workspace Manager    │     │
│  │  - Agent SDK     │    │  - Git Worktrees      │     │
│  │  - Task Queue    │    │  - Branch Management  │     │
│  │  - Status Track  │    │  - Merge Operations   │     │
│  └──────────────────┘    └───────────────────────┘     │
└──────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼────┐                      ┌────▼────┐
   │ Agent 1 │                      │ Agent 2 │
   │ Worktree│                      │ Worktree│
   │ Branch A│                      │ Branch B│
   └─────────┘                      └─────────┘
```

## Installation

The package is already installed with the minion project. If you need to install it separately:

```bash
npm install @anthropic-ai/claude-agent-sdk express ws cors
```

## Quick Start

### 1. Set your Anthropic API Key

```bash
export ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 2. Start the Minion Server

```bash
# Using npm script
npm run minion

# Or after building
minion

# With custom port
minion --port 8080

# With custom repo path
minion --repo /path/to/your/repo
```

### 3. Open the Web UI

Navigate to `http://localhost:3000` in your browser.

## Usage Guide

### Creating an Agent

1. Click the **"+ Create New Agent"** button
2. Enter a descriptive name (e.g., "Frontend Developer", "Bug Fixer")
3. Optionally provide a custom API key
4. Click **"Create Agent"**

The agent will be created with:

- A unique ID
- An isolated git worktree at `.minion-worktrees/<agent-id>`
- A dedicated branch `minion/<agent-name>-<short-id>`

### Assigning Tasks

1. Click **"Assign Task"** on any agent card
2. Describe what you want the agent to do
3. Optionally provide additional context
4. Click **"Assign Task"**

The agent will:

- Start working on the task using Claude Agent SDK
- Update its status in real-time
- Make changes in its isolated workspace

### Viewing Changes

1. Click **"View Changes"** on any agent card
2. Review the git diff showing all modifications
3. Optionally click **"Merge Changes"** to merge into main branch

### Managing Agents

- **Stop**: Stops a running agent
- **Remove**: Deletes the agent and its workspace (requires confirmation)

## CLI Options

```bash
minion [options]

Options:
  -p, --port <port>        Port to run the web server on (default: 3000)
  -k, --api-key <key>      Anthropic API key (or use ANTHROPIC_API_KEY env var)
  -r, --repo <path>        Path to git repository (default: current directory)
  -h, --help               Show help message

Environment Variables:
  ANTHROPIC_API_KEY        Default API key for all agents
```

## API Reference

### REST Endpoints

#### Agents

- `POST /api/agents` - Create a new agent

  ```json
  {
    "name": "Agent Name",
    "apiKey": "optional-custom-key"
  }
  ```

- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get specific agent info
- `DELETE /api/agents/:id?force=true` - Remove an agent

#### Tasks

- `POST /api/agents/:id/tasks` - Assign a task to an agent

  ```json
  {
    "description": "Task description",
    "context": "Optional additional context"
  }
  ```

- `GET /api/agents/:id/tasks` - List tasks for an agent

#### Workspace Operations

- `GET /api/agents/:id/diff?target=main` - Get diff for agent's changes
- `POST /api/agents/:id/merge` - Merge agent's branch

  ```json
  {
    "targetBranch": "main",
    "deleteWorktree": false
  }
  ```

- `POST /api/agents/:id/stop` - Stop a running agent

#### General

- `GET /api/health` - Health check
- `GET /api/workspaces` - List all workspaces

### WebSocket Events

Connect to `ws://localhost:3000` to receive real-time updates:

```javascript
{
  "type": "agent_status" | "task_update" | "agent_log" | "error",
  "agentId": "agent-uuid",
  "timestamp": "2025-11-18T...",
  "data": { ... }
}
```

## Git Worktree Management

Minion uses [git worktrees](https://git-scm.com/docs/git-worktree) to provide isolated workspaces for each agent. This means:

- Each agent works in a separate directory (`.minion-worktrees/<agent-id>`)
- Each agent has its own branch (`minion/<name>-<id>`)
- No conflicts between agents working simultaneously
- Easy to review and merge changes independently

### Cleanup

When you remove an agent, its worktree and branch are cleaned up automatically. On server shutdown, all worktrees are removed gracefully.

## Development

### Project Structure

```
src/minion/
├── types.ts              # TypeScript type definitions
├── workspaceManager.ts   # Git worktree operations
├── agentManager.ts       # Agent orchestration
├── server.ts             # Express + WebSocket server
└── index.ts              # Barrel exports

public/
├── index.html            # Web UI HTML
├── styles.css            # Styling
└── app.js                # Frontend JavaScript

src/index.ts      # CLI entry point
```

### Building

```bash
npm run build
```

### Running in Development

```bash
npm run minion:dev
```

## Integration with Claude Agent SDK

The Agent Manager integrates with the Claude Agent SDK to provide autonomous coding capabilities. Each agent:

1. Receives a task prompt
2. Uses Claude Agent SDK's `query()` function
3. Has access to the full codebase in its worktree
4. Can read, edit, and create files
5. Can run commands (tests, builds, etc.)
6. Reports progress back through WebSocket

### Current Implementation

The current implementation includes a placeholder for the Claude Agent SDK integration (see `agentManager.ts:runClaudeAgent()`). To fully integrate:

```typescript
// Uncomment and implement in agentManager.ts
import { query } from '@anthropic-ai/claude-agent-sdk';

private async runClaudeAgent(prompt: string, workingDirectory: string): Promise<string> {
  const apiKey = this.defaultApiKey;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  let output = '';
  for await (const message of query({ prompt, workingDirectory, apiKey })) {
    if (message.type === 'text') {
      output += message.text;
      this.emit('agent_log', { agentId, text: message.text });
    }
  }
  return output;
}
```

## Use Cases

### Parallel Feature Development

Create multiple agents to work on different features simultaneously:

- Agent 1: "Implement user authentication"
- Agent 2: "Add data export functionality"
- Agent 3: "Create responsive mobile layout"

Each agent works in isolation, and you can merge changes as they complete.

### Bug Triage

Assign different bugs to different agents:

- Agent 1: "Fix memory leak in data processing"
- Agent 2: "Resolve login redirect issue"
- Agent 3: "Fix styling bug on dashboard"

### Code Exploration

Use agents to explore and document different parts of your codebase:

- Agent 1: "Document the API layer"
- Agent 2: "Create architecture diagrams for the frontend"
- Agent 3: "Write integration tests for payment flow"

## Limitations

1. **API Key Required**: You must have an Anthropic API key to use the Claude Agent SDK
2. **Git Repository**: Must be run inside a git repository
3. **Network**: Requires internet connection for Claude API calls
4. **Resources**: Each agent runs independently, consuming API credits

## Troubleshooting

### "Not a git repository" Error

Ensure you're running Minion from inside a git repository:

```bash
git init  # If needed
minion
```

### WebSocket Connection Failed

Check that:

1. The server is running
2. No firewall is blocking the port
3. The port is not already in use

### Agent Creation Fails

Verify:

1. ANTHROPIC_API_KEY is set
2. You have sufficient API credits
3. The repository is not in a detached HEAD state

## Security Considerations

- **API Keys**: Never commit API keys to version control
- **Agent Actions**: Review changes before merging
- **Workspace Isolation**: Each agent can only access its worktree
- **Rate Limiting**: Be mindful of API usage with multiple agents

## Contributing

See the main [README.md](./README.md) for contribution guidelines.

## License

Apache-2.0 - See [LICENSE](./LICENSE) file

## Acknowledgments

- Inspired by [Minion.build](https://minion.build/)
- Built with [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript)
- Uses [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Note**: This is an experimental feature. Always review agent changes before merging into your main branch.
