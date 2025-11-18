# Managing Agents

Learn how to effectively manage agent lifecycles, monitor their progress, and coordinate their work.

## Agent Lifecycle

```
Create → Working → Idle ⟲ → Merge/Delete
           ↓
         Error
```

## Listing Agents

### Via Web UI

The main page shows all active agents in a grid layout:

```
┌─────────────────────────────────────┐
│ Agent: feature-auth                 │
│ Status: ● Working                   │
│ Created: 2 minutes ago              │
│                                     │
│ Messages: 3                         │
│ [View Diff] [Assign Task] [Delete] │
└─────────────────────────────────────┘
```

### Via REST API

```bash
# List all agents
curl http://localhost:3000/agents

# Response
[
  {
    "id": "feature-auth",
    "status": "working",
    "worktreePath": "/path/.minion/feature-auth",
    "messages": [...],
    "createdAt": "2025-11-18T..."
  }
]
```

### Via Git

```bash
# List all worktrees
git worktree list

# List agent branches
git branch | grep minion/
```

## Getting Agent Details

### Via Web UI

Click on an agent card to expand details:
- Full message history
- Current status
- Worktree path
- Creation time
- Action buttons

### Via REST API

```bash
# Get specific agent
curl http://localhost:3000/agents/feature-auth

# Response
{
  "id": "feature-auth",
  "status": "idle",
  "worktreePath": "/path/.minion/feature-auth",
  "messages": [
    {
      "role": "user",
      "content": "Create authentication module",
      "timestamp": "..."
    },
    {
      "role": "assistant",
      "content": "I've created...",
      "timestamp": "..."
    }
  ],
  "createdAt": "..."
}
```

## Sending Messages to Agents

### Via Web UI

1. **Click "Assign Task"** on the agent card
2. **Enter your message** in the modal
3. **Click "Send"**

The agent receives the message and starts working.

### Via REST API

```bash
curl -X POST http://localhost:3000/agents/feature-auth/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Add password hashing"}'
```

### Message Types

**Follow-up Instructions**:
```
Now add unit tests for the authentication functions
```

**Corrections**:
```
The password validation is too strict.
Please allow 8-character passwords.
```

**Additional Requirements**:
```
Also add rate limiting to prevent brute force attacks
```

**Clarifications**:
```
Use bcrypt for password hashing, not SHA256
```

## Monitoring Agent Progress

### Real-Time Updates

The UI receives WebSocket updates for:
- Status changes (idle → working → idle)
- New messages
- Errors
- Completion

### Status Indicators

**🟢 Idle**:
- Agent is ready
- Task completed
- Can receive new messages

**🟡 Working**:
- Agent is processing
- Using tools
- Making changes

**🔴 Error**:
- Agent encountered an error
- Check error message
- May need intervention

### Message History

View the conversation:

```
User: Create authentication module
Assistant: I've created src/auth/index.ts with...
User: Add password hashing
Assistant: I've added bcrypt for password hashing...
```

## Viewing Agent Changes

### Via Web UI

**Click "View Diff"** to see git diff of changes.

Example output:
```diff
+++ b/src/auth/index.ts
@@ +1,20 @@
+export function authenticate(user, pass) {
+  // Authentication logic
+}
```

### Via REST API

```bash
curl http://localhost:3000/agents/feature-auth/diff
```

### Via Git Commands

```bash
# View diff from main
git diff main..minion/feature-auth

# View commit log
git log minion/feature-auth

# View specific file changes
cd .minion/feature-auth
git diff main -- src/auth/index.ts
```

## Deleting Agents

### When to Delete

Delete an agent when:
- ✅ Task is complete and changes are merged
- ✅ Agent encountered unrecoverable error
- ✅ Task is no longer needed
- ✅ Want to start fresh with new approach

Don't delete if:
- ❌ Agent is still working (wait for completion)
- ❌ Changes not yet reviewed
- ❌ Might need to reference work later

### Via Web UI

1. **Click "Delete"** on the agent card
2. **Confirm deletion** in the modal

This will:
- Remove the agent instance
- Delete the git worktree
- Delete the branch (optional)
- Free up resources

### Via REST API

```bash
curl -X DELETE http://localhost:3000/agents/feature-auth
```

### Cleanup Options

**Full Cleanup** (default):
```
✓ Remove agent instance
✓ Delete worktree directory
✓ Delete git branch
```

**Preserve Branch**:
```
✓ Remove agent instance
✓ Delete worktree directory
✗ Keep git branch (for reference)
```

## Agent Status Management

### Handling Idle Agents

When an agent is idle:

**Option 1: Assign New Task**
```
Click "Assign Task" → Enter message → Send
```

**Option 2: Merge Changes**
```
Review changes → Click "Merge" → Confirm
```

**Option 3: Delete**
```
Click "Delete" → Confirm
```

### Handling Working Agents

When an agent is working:

**Do**:
- ✅ Monitor progress
- ✅ Wait for completion
- ✅ Check message history

**Don't**:
- ❌ Delete the agent
- ❌ Manually edit worktree files
- ❌ Send conflicting messages

### Handling Error State

When an agent errors:

**Step 1: Identify Error**
```
Read error message in agent card
Check message history for context
```

**Step 2: Decide Action**

**Option A: Retry**
```
Send message: "Try again using a different approach"
```

**Option B: Clarify**
```
Send message: "The file is located at src/auth/login.ts, not src/login.ts"
```

**Option C: Manual Fix**
```
cd .minion/agent-id
# Fix the issue manually
git add .
git commit -m "Manual fix"
# Continue with agent
```

**Option D: Delete and Recreate**
```
Delete agent
Create new agent with updated instructions
```

## Agent Coordination

### Sequential Work

```typescript
// Agent 1 completes
await waitForAgent('agent-1', 'idle');

// Merge Agent 1
await mergeAgent('agent-1');

// Start Agent 2 with context
createAgent('agent-2', 'Build on the work from agent-1...');
```

### Parallel Work

```typescript
// Start all agents simultaneously
createAgent('agent-1', 'Task A');
createAgent('agent-2', 'Task B');
createAgent('agent-3', 'Task C');

// Wait for all to complete
await Promise.all([
  waitForAgent('agent-1', 'idle'),
  waitForAgent('agent-2', 'idle'),
  waitForAgent('agent-3', 'idle')
]);

// Merge all
mergeAgent('agent-1');
mergeAgent('agent-2');
mergeAgent('agent-3');
```

### Hierarchical Work

```typescript
// Main agent delegates
createAgent('main-agent', `
  Coordinate the following sub-tasks:
  - Database schema (create agent-db)
  - API layer (create agent-api)
  - Frontend (create agent-ui)
`);

// Sub-agents do the work
createAgent('agent-db', 'Create database schema');
createAgent('agent-api', 'Create API layer');
createAgent('agent-ui', 'Create frontend');
```

## Best Practices

### Agent Naming

✅ **Consistent prefixes**:
```
feature-*
fix-*
refactor-*
test-*
docs-*
```

✅ **Descriptive names**:
```
feature-user-auth
fix-memory-leak
refactor-api-layer
```

### Message Management

✅ **Clear communication**:
```
"Add input validation to the login form.
Check for empty fields and invalid email format.
Show error messages to the user."
```

❌ **Vague instructions**:
```
"Fix the login"
```

### Resource Management

✅ **Delete when done**:
```
Task complete → Review → Merge → Delete
```

✅ **Limit concurrent agents**:
```
Start with 3-5 agents
Add more based on performance
```

❌ **Leave agents running**:
```
Idle agents waste resources
Clean up regularly
```

### Monitoring

✅ **Regular checks**:
```
Check status every few minutes
Review message history
Monitor for errors
```

✅ **Set expectations**:
```
Simple tasks: 5-10 minutes
Medium tasks: 15-30 minutes
Complex tasks: 30-60 minutes
```

## Troubleshooting

### Agent Not Responding

**Symptoms**:
- Status stuck on "working"
- No new messages for 10+ minutes

**Solutions**:
1. Check server logs for errors
2. Refresh the UI
3. Check WebSocket connection
4. Restart server if needed

### Agent Stuck in Error State

**Symptoms**:
- Error status persists
- Can't send new messages

**Solutions**:
1. Read error message carefully
2. Try sending recovery message
3. Check worktree for manual issues
4. Delete and recreate if needed

### Can't Delete Agent

**Symptoms**:
- Delete fails
- Worktree remains

**Solutions**:
```bash
# Force remove worktree
git worktree remove --force .minion/agent-id

# Remove branch
git branch -D minion/agent-id

# Clean up manually if needed
rm -rf .minion/agent-id
```

### Lost Agent Connection

**Symptoms**:
- Agent shows in git but not in UI
- Worktree exists but agent doesn't

**Solutions**:
```bash
# List orphaned worktrees
git worktree list

# Clean up
git worktree prune

# Restart server to resync
```

## Performance Tips

### Optimize Agent Count

```typescript
// Based on repository size
Small repo (<100 MB): 8-10 agents
Medium repo (100MB-1GB): 5-8 agents
Large repo (>1GB): 3-5 agents
```

### Task Sizing

```typescript
// Optimal task duration
Target: 10-20 minutes per task

Too short: Overhead not worth it
Too long: Risk of failure increases
```

### Stagger Creation

```typescript
// Don't create all at once
for (const task of tasks) {
  createAgent(task.id, task.message);
  await sleep(5000); // 5 second delay
}
```

## Next Steps

- [Merging Changes](/guide/merging-changes) - How to merge agent work
- [Best Practices](/guide/best-practices) - Tips and tricks
- [API Reference](/api/rest) - REST API documentation
- [Orchestration](/guide/orchestration) - Multi-agent coordination