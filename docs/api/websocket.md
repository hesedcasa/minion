# WebSocket API Reference

Real-time WebSocket API for agent status updates.

## Connection

### Endpoint

```
ws://localhost:3000
```

### Connecting

**JavaScript/TypeScript**:
```typescript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to Minion');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onclose = () => {
  console.log('Disconnected');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

**Browser (React Hook)**:
```typescript
import { useEffect, useState } from 'react';

function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => console.log('Connected');
    socket.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    setWs(socket);

    return () => socket.close();
  }, [url]);

  return { ws, data };
}
```

## Events

All messages are JSON formatted:

```typescript
interface WebSocketMessage {
  type: 'agent_created' | 'agent_updated' | 'agent_deleted';
  data: Agent;
}
```

### Agent Created

Sent when a new agent is created.

**Event Type**: `agent_created`

**Payload**:
```json
{
  "type": "agent_created",
  "data": {
    "id": "feature-auth",
    "status": "working",
    "worktreePath": "/path/.minion/feature-auth",
    "messages": [...],
    "createdAt": "2025-11-18T..."
  }
}
```

### Agent Updated

Sent when agent status changes or receives new messages.

**Event Type**: `agent_updated`

**Payload**:
```json
{
  "type": "agent_updated",
  "data": {
    "id": "feature-auth",
    "status": "idle",
    "worktreePath": "/path/.minion/feature-auth",
    "messages": [...],
    "createdAt": "2025-11-18T..."
  }
}
```

**Update Triggers**:
- Status change (idle ↔ working ↔ error)
- New message received
- Agent properties modified

### Agent Deleted

Sent when an agent is deleted.

**Event Type**: `agent_deleted`

**Payload**:
```json
{
  "type": "agent_deleted",
  "data": {
    "id": "feature-auth",
    "status": "idle",
    "worktreePath": "/path/.minion/feature-auth",
    "messages": [...],
    "createdAt": "2025-11-18T..."
  }
}
```

## Example Implementation

### React Component

```typescript
import { useEffect, useState } from 'react';
import type { Agent } from './types';

export function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    // Fetch initial agents
    fetch('http://localhost:3000/agents')
      .then(res => res.json())
      .then(setAgents);

    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'agent_created':
          setAgents(prev => [...prev, message.data]);
          break;

        case 'agent_updated':
          setAgents(prev =>
            prev.map(agent =>
              agent.id === message.data.id ? message.data : agent
            )
          );
          break;

        case 'agent_deleted':
          setAgents(prev =>
            prev.filter(agent => agent.id !== message.data.id)
          );
          break;
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>
          {agent.id} - {agent.status}
        </div>
      ))}
    </div>
  );
}
```

### Node.js Client

```typescript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to Minion');
});

ws.on('message', (data: string) => {
  const message = JSON.parse(data);

  switch (message.type) {
    case 'agent_created':
      console.log(`New agent: ${message.data.id}`);
      break;

    case 'agent_updated':
      console.log(`Agent updated: ${message.data.id}`);
      console.log(`Status: ${message.data.status}`);
      break;

    case 'agent_deleted':
      console.log(`Agent deleted: ${message.data.id}`);
      break;
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected');
});
```

## Connection Management

### Reconnection

```typescript
let ws: WebSocket | null = null;
let reconnectInterval: NodeJS.Timeout | null = null;

function connect() {
  ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    console.log('Connected');
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  };

  ws.onclose = () => {
    console.log('Disconnected, reconnecting...');
    reconnectInterval = setInterval(() => {
      console.log('Attempting to reconnect...');
      connect();
    }, 5000);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleMessage(data);
  };
}

connect();
```

### Heartbeat

```typescript
let heartbeatInterval: NodeJS.Timeout;

ws.onopen = () => {
  heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000); // 30 seconds
};

ws.onclose = () => {
  clearInterval(heartbeatInterval);
};
```

## Best Practices

### Handle All States

```typescript
ws.onopen = () => {
  // Connection established
  updateConnectionStatus('connected');
};

ws.onmessage = (event) => {
  // Message received
  handleMessage(JSON.parse(event.data));
};

ws.onerror = (error) => {
  // Error occurred
  console.error('WebSocket error:', error);
  updateConnectionStatus('error');
};

ws.onclose = () => {
  // Connection closed
  updateConnectionStatus('disconnected');
  // Attempt reconnection
};
```

### Parse Messages Safely

```typescript
ws.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    handleMessage(message);
  } catch (error) {
    console.error('Failed to parse message:', error);
  }
};
```

### Clean Up

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000');

  // Setup handlers...

  return () => {
    ws.close();
  };
}, []);
```

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED
```

**Solution**: Ensure Minion server is running on port 3000.

### Connection Closed Immediately

**Solution**: Check server logs for errors, verify WebSocket support.

### Messages Not Received

**Solution**: Verify `onmessage` handler is set up before messages are sent.

## Next Steps

- [REST API](/api/rest) - HTTP endpoints
- [TypeScript API](/api/typescript) - Programmatic usage
- [Quick Start](/guide/quick-start) - Tutorial
