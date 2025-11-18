# API Overview

Minion provides REST and WebSocket APIs for programmatic agent management.

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Authentication

Currently no authentication required. The API relies on the `ANTHROPIC_API_KEY` environment variable set on the server.

## Available APIs

### REST API

HTTP endpoints for CRUD operations on agents:

- `POST /agents` - Create new agent
- `GET /agents` - List all agents
- `GET /agents/:id` - Get agent details
- `POST /agents/:id/message` - Send message to agent
- `GET /agents/:id/diff` - Get git diff
- `POST /agents/:id/merge` - Merge agent changes
- `DELETE /agents/:id` - Delete agent

See [REST API Reference](/api/rest) for details.

### WebSocket API

Real-time updates for agent status changes:

- Agent created
- Agent updated
- Agent deleted
- Status changes
- New messages

See [WebSocket API Reference](/api/websocket) for details.

### TypeScript API

Programmatic access via TypeScript/JavaScript:

```typescript
import { createAgent, sendMessage, deleteAgent } from './minion/index.js';

const agent = await createAgent('my-agent', '/path/to/repo', 'Task message');
await sendMessage(agent.id, 'Follow-up message');
await deleteAgent(agent.id);
```

See [TypeScript API Reference](/api/typescript) for details.

## Quick Start

### Using cURL

```bash
# Create agent
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{"id": "test-agent", "message": "Create a hello.txt file"}'

# List agents
curl http://localhost:3000/agents

# Send message
curl -X POST http://localhost:3000/agents/test-agent/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Add more content"}'

# Delete agent
curl -X DELETE http://localhost:3000/agents/test-agent
```

### Using JavaScript

```javascript
const API_URL = 'http://localhost:3000';

// Create agent
const response = await fetch(`${API_URL}/agents`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'test-agent',
    message: 'Create a hello.txt file'
  })
});

const agent = await response.json();
console.log(agent);
```

## Response Format

### Success Response

```json
{
  "id": "test-agent",
  "status": "working",
  "worktreePath": "/path/.minion/test-agent",
  "messages": [...],
  "createdAt": "2025-11-18T..."
}
```

### Error Response

```json
{
  "error": "Error message here"
}
```

HTTP status codes:
- `200` - Success
- `404` - Agent not found
- `500` - Server error

## Rate Limits

No rate limits on the Minion API itself, but Claude AI API has rate limits. Monitor your usage.

## Next Steps

- [REST API](/api/rest) - Detailed REST API reference
- [WebSocket API](/api/websocket) - Real-time updates
- [TypeScript API](/api/typescript) - Programmatic access
