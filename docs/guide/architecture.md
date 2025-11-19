# Architecture

This document provides a detailed overview of Minion's architecture, design decisions, and how the components work together.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Web Browser                       │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │           React UI (Ant Design)                │ │
│  │  - Agent Cards  - Modals  - Real-time Status  │ │
│  └─────────────┬──────────────────────────────────┘ │
└────────────────┼───────────────────────────────────┘
                 │
                 │ HTTP (REST API)
                 │ WebSocket (Real-time Updates)
                 │
┌────────────────▼──────────────────────────────────┐
│              Express Server                       │
│  ┌──────────────────────────────────────────┐    │
│  │  HTTP Routes          WebSocket Server   │    │
│  │  POST /agents         Client Management  │    │
│  │  GET /agents/:id      Broadcast Updates  │    │
│  │  DELETE /agents/:id   Event Handling     │    │
│  └──────────┬────────────────────┬──────────┘    │
└─────────────┼────────────────────┼───────────────┘
              │                    │
              │                    │
┌─────────────▼────────────────────▼───────────────┐
│              Agent Manager                        │
│  ┌────────────────────────────────────────────┐  │
│  │  - createAgent()                           │  │
│  │  - sendMessage()                           │  │
│  │  - deleteAgent()                           │  │
│  │  - listAgents()                            │  │
│  │  - Agent Lifecycle Management              │  │
│  └──────────┬─────────────────────────────────┘  │
└─────────────┼────────────────────────────────────┘
              │
              │ Uses Claude Agent SDK
              │
┌─────────────▼────────────────────────────────────┐
│           Workspace Manager                       │
│  ┌────────────────────────────────────────────┐  │
│  │  - createWorktree()                        │  │
│  │  - deleteWorktree()                        │  │
│  │  - mergeWorktree()                         │  │
│  │  - listWorktrees()                         │  │
│  │  - Git Operations                          │  │
│  └──────────┬─────────────────────────────────┘  │
└─────────────┼────────────────────────────────────┘
              │
              │ Executes git commands
              │
┌─────────────▼────────────────────────────────────┐
│              Git Repository                       │
│                                                   │
│  Main Branch                                      │
│  ├── src/                                         │
│  ├── package.json                                 │
│  └── ...                                          │
│                                                   │
│  .minion/ (Worktrees)                             │
│  ├── agent-abc123/    ← Agent 1's workspace      │
│  ├── agent-def456/    ← Agent 2's workspace      │
│  └── agent-ghi789/    ← Agent 3's workspace      │
└───────────────────────────────────────────────────┘
```

## Core Components

### 1. Web UI (React + TypeScript)

**Location**: `ui/src/`

**Responsibilities**:
- User interface for agent management
- Real-time status updates via WebSocket
- Agent creation, task assignment, deletion
- Diff viewing and merge operations

**Key Files**:
- `App.tsx` - Main application component
- `hooks/useWebSocket.ts` - WebSocket connection management
- `components/` - React components (AgentCard, Modals, etc.)

**Technology Stack**:
- React 19 with TypeScript
- Ant Design UI library
- Vite for build tooling
- WebSocket for real-time updates

### 2. Express Server

**Location**: `src/minion/server.ts`

**Responsibilities**:
- HTTP REST API endpoints
- WebSocket server for real-time communication
- Static file serving (built React UI)
- Request routing and middleware

**Key Endpoints**:

```typescript
// HTTP REST API
POST   /agents            # Create new agent
GET    /agents            # List all agents
GET    /agents/:id        # Get agent details
POST   /agents/:id/message # Send message to agent
DELETE /agents/:id        # Delete agent
GET    /agents/:id/diff   # Get git diff
POST   /agents/:id/merge  # Merge worktree
```

**WebSocket Events**:

```typescript
// Server → Client
{
  type: 'agent_created' | 'agent_updated' | 'agent_deleted',
  data: Agent
}

// Client → Server
// (Currently read-only, server pushes updates)
```

### 3. Agent Manager

**Location**: `src/minion/agentManager.ts`

**Responsibilities**:
- Claude Agent SDK integration
- Agent lifecycle management (create, message, delete)
- Agent state tracking
- Message routing to agents

**Key Functions**:

```typescript
interface AgentManager {
  createAgent(id: string, repoPath: string, message: string): Promise<Agent>;
  sendMessage(id: string, message: string): Promise<string>;
  deleteAgent(id: string): Promise<void>;
  listAgents(): Agent[];
  getAgent(id: string): Agent | undefined;
}
```

**Agent State**:

```typescript
interface Agent {
  id: string;
  status: 'idle' | 'working' | 'error';
  worktreePath: string;
  messages: AgentMessage[];
  createdAt: Date;
  sdk: AgentSDKInstance;
}
```

### 4. Workspace Manager

**Location**: `src/minion/workspaceManager.ts`

**Responsibilities**:
- Git worktree creation and deletion
- Branch management
- Merge operations
- Worktree validation

**Key Functions**:

```typescript
interface WorkspaceManager {
  createWorktree(repoPath: string, agentId: string): Promise<string>;
  deleteWorktree(repoPath: string, agentId: string): Promise<void>;
  mergeWorktree(repoPath: string, agentId: string): Promise<void>;
  listWorktrees(repoPath: string): Promise<Worktree[]>;
  getDiff(worktreePath: string): Promise<string>;
}
```

**Git Operations**:

```bash
# Create worktree
git worktree add .minion/<agent-id> -b minion/<agent-id>

# List worktrees
git worktree list

# Remove worktree
git worktree remove .minion/<agent-id>
git branch -D minion/<agent-id>

# Merge worktree
git checkout main
git merge minion/<agent-id>
```

## Data Flow

### Creating an Agent

```
User → UI: Click "Create Agent"
UI → Server: POST /agents { id, message }
Server → AgentManager: createAgent(id, message)
AgentManager → WorkspaceManager: createWorktree(id)
WorkspaceManager → Git: git worktree add...
Git → WorkspaceManager: Worktree created
WorkspaceManager → AgentManager: worktreePath
AgentManager → Claude SDK: Initialize agent
Claude SDK → AgentManager: Agent ready
AgentManager → Claude SDK: sendMessage(message)
Claude SDK: Execute task...
AgentManager → Server: Agent created
Server → WebSocket: Broadcast 'agent_created'
WebSocket → UI: Update agent list
UI: Display new agent card
```

### Sending a Message

```
User → UI: Click "Assign Task"
UI → Server: POST /agents/:id/message { message }
Server → AgentManager: sendMessage(id, message)
AgentManager → Claude SDK: Send message
Claude SDK: Process and execute...
Claude SDK → AgentManager: Response
AgentManager → Server: Response
Server → WebSocket: Broadcast 'agent_updated'
WebSocket → UI: Update agent card
UI: Display new message in history
```

### Merging Changes

```
User → UI: Click "Merge"
UI → Server: POST /agents/:id/merge
Server → WorkspaceManager: mergeWorktree(id)
WorkspaceManager → Git: git checkout main
Git → WorkspaceManager: Switched to main
WorkspaceManager → Git: git merge minion/:id
Git → WorkspaceManager: Merge complete
WorkspaceManager → Server: Merge successful
Server → WebSocket: Broadcast 'agent_updated'
WebSocket → UI: Update agent status
UI: Show merge success
```

## Design Decisions

### Why Git Worktrees?

**Alternatives Considered**:
1. **Multiple Clones**: Wastes disk space, slower
2. **Branch Switching**: Agents would conflict, context switching issues
3. **Virtual Filesystems**: Complex, platform-specific
4. **Containerization**: Overhead, requires Docker

**Why Worktrees Won**:
- ✅ Native Git feature (no external dependencies)
- ✅ Shared `.git` directory (efficient disk usage)
- ✅ True isolation (no conflicts)
- ✅ Fast creation and cleanup
- ✅ Simple merge workflow

### Why Claude Agent SDK?

**Alternatives Considered**:
1. **Direct API Calls**: More control but complex
2. **LangChain**: Overhead, abstractions not needed
3. **Custom Agent Implementation**: Reinventing the wheel

**Why Claude Agent SDK Won**:
- ✅ Official Anthropic SDK
- ✅ Built-in tool support
- ✅ Message history management
- ✅ Error handling
- ✅ Type safety

### Why WebSocket?

**Alternatives Considered**:
1. **Polling**: Inefficient, delayed updates
2. **Server-Sent Events**: One-way, less flexible
3. **GraphQL Subscriptions**: Overkill for this use case

**Why WebSocket Won**:
- ✅ Real-time bidirectional communication
- ✅ Low latency
- ✅ Efficient (persistent connection)
- ✅ Browser support (via ws library)
- ✅ Simple integration with Express

### Why TypeScript?

**Benefits**:
- ✅ Type safety catches bugs early
- ✅ Better IDE support
- ✅ Self-documenting code
- ✅ Easier refactoring
- ✅ Claude Agent SDK is TypeScript-native

### Why React + Ant Design?

**React**:
- ✅ Component-based architecture
- ✅ Large ecosystem
- ✅ Hooks for state management
- ✅ Easy WebSocket integration

**Ant Design**:
- ✅ Professional UI components
- ✅ Consistent design language
- ✅ TypeScript support
- ✅ Responsive by default

## Security Considerations

### API Key Protection

```typescript
// API key is required but never exposed to client
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY required');
}
```

### Git Operations Safety

```typescript
// All git operations are validated
// Paths are sanitized to prevent injection
// Worktrees are restricted to .minion/ directory
```

### Agent Isolation

- Each agent has its own worktree
- Agents cannot access other agents' workspaces
- Changes are isolated until explicitly merged

## Performance Characteristics

### Agent Creation

- **Time**: ~500ms-2s
- **Bottleneck**: Git worktree creation
- **Optimization**: Worktrees share `.git` directory

### Message Processing

- **Time**: Variable (depends on task complexity)
- **Bottleneck**: Claude API latency
- **Optimization**: Async processing, non-blocking

### WebSocket Updates

- **Latency**: <50ms
- **Bottleneck**: Network
- **Optimization**: Event-driven, no polling

### Memory Usage

- **Server**: ~50-100MB base + ~20-30MB per agent
- **UI**: ~30-50MB
- **Optimization**: Agents cleaned up when deleted

## Scalability

### Current Limits

- **Concurrent Agents**: Recommended 5-10
- **Repository Size**: Works with any size
- **Message History**: In-memory (cleared on restart)

### Future Improvements

- Agent persistence (database)
- Distributed agent execution
- Load balancing
- Message history persistence
- Agent pooling

## Error Handling

### Server Errors

```typescript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
  // Broadcast error to WebSocket clients
}
```

### Agent Errors

```typescript
agent.status = 'error';
agent.lastError = error.message;
// Broadcast agent update
```

### Git Errors

```typescript
// Rollback on failure
// Clean up partial worktrees
// Report to user via UI
```

## Next Steps

- [Project Structure](/dev/project-structure) - Detailed file structure
- [API Reference](/api/overview) - Complete API documentation
- [Contributing](/dev/contributing) - How to contribute
