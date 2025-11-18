# TypeScript API Reference

Programmatic TypeScript/JavaScript API for Minion.

## Installation

Minion is currently designed to be used as a standalone application, but you can import and use its modules programmatically.

```bash
git clone https://github.com/hesedcasa/minion.git
cd minion
npm install
npm run build
```

## Importing

```typescript
import {
  createAgent,
  sendMessage,
  deleteAgent,
  listAgents
} from './src/minion/index.js';

import type { Agent, AgentMessage } from './src/minion/types.js';
```

## Agent Manager API

### createAgent()

Create a new agent with worktree.

```typescript
async function createAgent(
  id: string,
  repoPath: string,
  initialMessage: string
): Promise<Agent>
```

**Parameters**:
- `id` - Unique agent identifier
- `repoPath` - Path to git repository
- `initialMessage` - Initial task message

**Returns**: `Promise<Agent>`

**Example**:
```typescript
const agent = await createAgent(
  'feature-auth',
  '/path/to/repo',
  'Create authentication module'
);

console.log(agent.id);          // 'feature-auth'
console.log(agent.status);      // 'working'
console.log(agent.worktreePath); // '/path/to/repo/.minion/feature-auth'
```

**Throws**:
- Agent ID already exists
- Failed to create worktree
- Failed to initialize agent

---

### sendMessage()

Send a message to an agent.

```typescript
async function sendMessage(
  agentId: string,
  message: string
): Promise<string>
```

**Parameters**:
- `agentId` - Agent ID
- `message` - Message content

**Returns**: `Promise<string>` - Agent's response

**Example**:
```typescript
const response = await sendMessage(
  'feature-auth',
  'Add password hashing using bcrypt'
);

console.log(response); // "I've added bcrypt for password hashing..."
```

**Throws**:
- Agent not found
- Failed to send message

---

### deleteAgent()

Delete an agent and its worktree.

```typescript
async function deleteAgent(agentId: string): Promise<void>
```

**Parameters**:
- `agentId` - Agent ID

**Returns**: `Promise<void>`

**Example**:
```typescript
await deleteAgent('feature-auth');
console.log('Agent deleted');
```

**Throws**:
- Agent not found
- Failed to delete worktree

---

### listAgents()

Get list of all agents.

```typescript
function listAgents(): Agent[]
```

**Returns**: `Agent[]`

**Example**:
```typescript
const agents = listAgents();

agents.forEach(agent => {
  console.log(`${agent.id}: ${agent.status}`);
});
```

---

### getAgent()

Get a specific agent.

```typescript
function getAgent(agentId: string): Agent | undefined
```

**Parameters**:
- `agentId` - Agent ID

**Returns**: `Agent | undefined`

**Example**:
```typescript
const agent = getAgent('feature-auth');

if (agent) {
  console.log(agent.status);
} else {
  console.log('Agent not found');
}
```

## Workspace Manager API

### createWorktree()

Create a git worktree.

```typescript
async function createWorktree(
  repoPath: string,
  agentId: string
): Promise<string>
```

**Parameters**:
- `repoPath` - Repository path
- `agentId` - Agent ID

**Returns**: `Promise<string>` - Worktree path

**Example**:
```typescript
const worktreePath = await createWorktree('/path/to/repo', 'feature-auth');
console.log(worktreePath); // '/path/to/repo/.minion/feature-auth'
```

---

### deleteWorktree()

Delete a git worktree.

```typescript
async function deleteWorktree(
  repoPath: string,
  agentId: string
): Promise<void>
```

**Parameters**:
- `repoPath` - Repository path
- `agentId` - Agent ID

**Returns**: `Promise<void>`

**Example**:
```typescript
await deleteWorktree('/path/to/repo', 'feature-auth');
```

---

### mergeWorktree()

Merge worktree into main branch.

```typescript
async function mergeWorktree(
  repoPath: string,
  agentId: string
): Promise<void>
```

**Parameters**:
- `repoPath` - Repository path
- `agentId` - Agent ID

**Returns**: `Promise<void>`

**Example**:
```typescript
await mergeWorktree('/path/to/repo', 'feature-auth');
console.log('Changes merged');
```

---

### getDiff()

Get git diff of worktree.

```typescript
async function getDiff(worktreePath: string): Promise<string>
```

**Parameters**:
- `worktreePath` - Path to worktree

**Returns**: `Promise<string>` - Git diff output

**Example**:
```typescript
const diff = await getDiff('/path/to/repo/.minion/feature-auth');
console.log(diff);
```

## Types

### Agent

```typescript
interface Agent {
  id: string;
  status: AgentStatus;
  worktreePath: string;
  messages: AgentMessage[];
  createdAt: Date;
  sdk: any; // Claude Agent SDK instance
}
```

### AgentStatus

```typescript
type AgentStatus = 'idle' | 'working' | 'error';
```

### AgentMessage

```typescript
interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

## Example Usage

### Complete Workflow

```typescript
import {
  createAgent,
  sendMessage,
  deleteAgent
} from './src/minion/index.js';

async function main() {
  const repoPath = '/path/to/repo';

  // Create agent
  console.log('Creating agent...');
  const agent = await createAgent(
    'feature-api',
    repoPath,
    'Create a new REST API endpoint at /api/users'
  );

  console.log(`Agent created: ${agent.id}`);
  console.log(`Status: ${agent.status}`);

  // Wait for completion (simple polling)
  while (agent.status === 'working') {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Send follow-up message
  console.log('Sending follow-up...');
  const response = await sendMessage(
    agent.id,
    'Add input validation to the endpoint'
  );

  console.log(`Response: ${response}`);

  // Delete agent
  console.log('Cleaning up...');
  await deleteAgent(agent.id);

  console.log('Done!');
}

main().catch(console.error);
```

### Multiple Agents

```typescript
async function parallelWork() {
  const tasks = [
    { id: 'agent-1', task: 'Task 1' },
    { id: 'agent-2', task: 'Task 2' },
    { id: 'agent-3', task: 'Task 3' }
  ];

  // Create all agents
  const agents = await Promise.all(
    tasks.map(({ id, task }) =>
      createAgent(id, '/path/to/repo', task)
    )
  );

  console.log(`Created ${agents.length} agents`);

  // Wait for all to complete
  // (In practice, use WebSocket or polling)

  // Clean up
  await Promise.all(
    agents.map(agent => deleteAgent(agent.id))
  );
}
```

## Next Steps

- [REST API](/api/rest) - HTTP endpoints
- [WebSocket API](/api/websocket) - Real-time updates
- [Architecture](/guide/architecture) - System design
