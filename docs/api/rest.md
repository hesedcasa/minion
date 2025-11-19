# REST API Reference

Complete REST API documentation for Minion.

## Base URL

```
http://localhost:3000
```

## Endpoints

### Create Agent

Create a new agent with an initial task.

**Endpoint**: `POST /agents`

**Request Body**:
```json
{
  "id": "string",      // Required: Unique agent ID
  "message": "string"  // Required: Initial task message
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "feature-auth",
    "message": "Create authentication module"
  }'
```

**Response**: `200 OK`
```json
{
  "id": "feature-auth",
  "status": "working",
  "worktreePath": "/path/.minion/feature-auth",
  "messages": [
    {
      "role": "user",
      "content": "Create authentication module",
      "timestamp": "2025-11-18T..."
    }
  ],
  "createdAt": "2025-11-18T..."
}
```

**Errors**:
- `500` - Agent ID already exists or creation failed

---

### List Agents

Get a list of all active agents.

**Endpoint**: `GET /agents`

**Example**:
```bash
curl http://localhost:3000/agents
```

**Response**: `200 OK`
```json
[
  {
    "id": "feature-auth",
    "status": "idle",
    "worktreePath": "/path/.minion/feature-auth",
    "messages": [...],
    "createdAt": "2025-11-18T..."
  },
  {
    "id": "fix-bug",
    "status": "working",
    "worktreePath": "/path/.minion/fix-bug",
    "messages": [...],
    "createdAt": "2025-11-18T..."
  }
]
```

---

### Get Agent Details

Get details for a specific agent.

**Endpoint**: `GET /agents/:id`

**Parameters**:
- `id` (path) - Agent ID

**Example**:
```bash
curl http://localhost:3000/agents/feature-auth
```

**Response**: `200 OK`
```json
{
  "id": "feature-auth",
  "status": "idle",
  "worktreePath": "/path/.minion/feature-auth",
  "messages": [
    {
      "role": "user",
      "content": "Create authentication module",
      "timestamp": "2025-11-18T..."
    },
    {
      "role": "assistant",
      "content": "I've created the authentication module...",
      "timestamp": "2025-11-18T..."
    }
  ],
  "createdAt": "2025-11-18T..."
}
```

**Errors**:
- `404` - Agent not found

---

### Send Message

Send a message to an agent.

**Endpoint**: `POST /agents/:id/message`

**Parameters**:
- `id` (path) - Agent ID

**Request Body**:
```json
{
  "message": "string"  // Required: Message content
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/agents/feature-auth/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Add password hashing"}'
```

**Response**: `200 OK`
```json
{
  "response": "I've added bcrypt for password hashing..."
}
```

**Errors**:
- `404` - Agent not found
- `500` - Failed to send message

---

### Get Git Diff

Get the git diff of agent changes.

**Endpoint**: `GET /agents/:id/diff`

**Parameters**:
- `id` (path) - Agent ID

**Example**:
```bash
curl http://localhost:3000/agents/feature-auth/diff
```

**Response**: `200 OK`
```
diff --git a/src/auth/index.ts b/src/auth/index.ts
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/src/auth/index.ts
@@ +0,0 +1,10 @@
+export function authenticate() {
+  // ...
+}
```

**Errors**:
- `404` - Agent not found
- `500` - Failed to get diff

---

### Merge Agent Changes

Merge agent worktree into main branch.

**Endpoint**: `POST /agents/:id/merge`

**Parameters**:
- `id` (path) - Agent ID

**Example**:
```bash
curl -X POST http://localhost:3000/agents/feature-auth/merge
```

**Response**: `200 OK`
```json
{
  "message": "Successfully merged agent feature-auth"
}
```

**Errors**:
- `404` - Agent not found
- `500` - Merge failed (conflicts or git error)

---

### Delete Agent

Delete an agent and its worktree.

**Endpoint**: `DELETE /agents/:id`

**Parameters**:
- `id` (path) - Agent ID

**Example**:
```bash
curl -X DELETE http://localhost:3000/agents/feature-auth
```

**Response**: `200 OK`
```json
{
  "message": "Agent feature-auth deleted successfully"
}
```

**Errors**:
- `404` - Agent not found
- `500` - Failed to delete

---

## Types

### Agent

```typescript
interface Agent {
  id: string;
  status: 'idle' | 'working' | 'error';
  worktreePath: string;
  messages: AgentMessage[];
  createdAt: Date;
}
```

### AgentMessage

```typescript
interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

## Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Error message description"
}
```

Common error scenarios:
- Agent ID already exists
- Agent not found
- Git operations failed
- Claude API errors

## Next Steps

- [WebSocket API](/api/websocket) - Real-time updates
- [TypeScript API](/api/typescript) - Programmatic usage
- [Quick Start](/guide/quick-start) - Tutorial
