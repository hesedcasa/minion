# Multi-Agent Orchestration

Learn how to effectively orchestrate multiple Claude AI agents working in parallel on complex projects.

## What is Multi-Agent Orchestration?

Multi-agent orchestration is the practice of coordinating multiple AI agents to work simultaneously on different parts of a project. Each agent operates independently in its own isolated workspace, enabling true parallel development.

## Why Orchestrate Multiple Agents?

### Parallel Development

Instead of sequential work:

```
Traditional: Agent A → Agent B → Agent C (60 minutes)
Orchestrated: Agent A | Agent B | Agent C (20 minutes)
```

### Task Decomposition

Break complex projects into manageable pieces:

```
Large Refactoring:
├── Agent 1: Refactor backend API
├── Agent 2: Update frontend components
├── Agent 3: Migrate database schema
└── Agent 4: Update documentation
```

### Experimental Approaches

Try multiple solutions simultaneously:

```
Problem: Slow query performance
├── Agent 1: Try adding database index
├── Agent 2: Try query optimization
└── Agent 3: Try caching layer

→ Compare results and choose the best
```

## Orchestration Patterns

### 1. Independent Parallel Tasks

**Use Case**: Tasks that don't depend on each other

```
Goal: Add three new features

┌─────────┐  ┌─────────┐  ┌─────────┐
│Agent 1  │  │Agent 2  │  │Agent 3  │
│Feature A│  │Feature B│  │Feature C│
└─────────┘  └─────────┘  └─────────┘
     │            │            │
     └────────────┴────────────┘
              Merge
                ↓
            Main Branch
```

**Example**:
```typescript
// Agent 1: User authentication
// Agent 2: Payment processing
// Agent 3: Email notifications

// All can work simultaneously
// Merge all three when complete
```

### 2. Sequential with Parallel Branches

**Use Case**: Some dependencies, but parallel work possible

```
        Agent 1
        (Setup)
           ↓
    ┌──────┴──────┐
Agent 2        Agent 3
(Backend)     (Frontend)
    │              │
    └──────┬───────┘
        Agent 4
       (Testing)
```

**Example**:
```typescript
// Agent 1: Set up database schema
// Wait for Agent 1 to complete
// Agent 2: Create API endpoints (needs schema)
// Agent 3: Build UI components (independent)
// Wait for Agents 2 & 3
// Agent 4: Write integration tests
```

### 3. Hierarchical Coordination

**Use Case**: Complex projects with sub-projects

```
     Main Agent
    (Coordinator)
         |
    ┌────┼────┐
Agent A  Agent B  Agent C
(Module 1)(Module 2)(Module 3)
    |        |        |
  ┌─┴─┐    ┌─┴─┐    ┌─┴─┐
 A1  A2   B1  B2   C1  C2
```

**Example**:
```typescript
// Main Agent: Overall architecture
// Agent A: User module
//   - A1: User model
//   - A2: User controller
// Agent B: Product module
//   - B1: Product model
//   - B2: Product controller
// Agent C: Order module
//   - C1: Order model
//   - C2: Order controller
```

### 4. Divide and Conquer

**Use Case**: Large refactoring or migration

```
    Large Codebase
         |
    Split by:
    ┌────┼────┐
Directory  File Type  Feature
    |        |        |
  Agents   Agents   Agents
```

**Example**:
```typescript
// Split by directory
Agent 1: src/backend/
Agent 2: src/frontend/
Agent 3: src/shared/

// Or by file type
Agent 1: *.ts (TypeScript migration)
Agent 2: *.css (Style updates)
Agent 3: *.test.ts (Test updates)

// Or by feature
Agent 1: Authentication code
Agent 2: Payment code
Agent 3: Analytics code
```

## Best Practices

### Planning Your Orchestration

#### 1. Identify Dependencies

```typescript
// Dependency graph
const tasks = {
  setupDB: { deps: [] },
  createAPI: { deps: ['setupDB'] },
  buildUI: { deps: [] },
  integrate: { deps: ['createAPI', 'buildUI'] },
  test: { deps: ['integrate'] }
};
```

#### 2. Group Independent Tasks

```typescript
// Phase 1: No dependencies
[
  'Agent 1: setupDB',
  'Agent 2: buildUI',
  'Agent 3: documentation'
]

// Phase 2: Depends on Phase 1
[
  'Agent 4: createAPI',  // Needs setupDB
  'Agent 5: styling'     // Needs buildUI
]
```

#### 3. Estimate Complexity

```typescript
// Simple (5-10 min)
'Update README with new instructions'

// Medium (15-30 min)
'Add new API endpoint with validation'

// Complex (30-60 min)
'Refactor authentication system'
```

### Agent Coordination

#### Communication Between Agents

Agents can't directly communicate, but you can:

**Option 1: Sequential Handoff**
```
Agent 1: Creates schema
→ Merge
Agent 2: Uses schema
```

**Option 2: Shared Documentation**
```
Agent 1: Documents API in api-spec.md
Agent 2: Reads api-spec.md and implements
```

**Option 3: Manual Coordination**
```
Agent 1: Reports completion
You: Assign task to Agent 2 with context
Agent 2: Continues work
```

#### Load Balancing

```typescript
// Don't overload
❌ 10 agents all doing complex tasks

// Balance complexity
✅ 3 complex tasks + 5 simple tasks
   Agents finish around the same time
```

### Merge Strategy

#### Merge Order Matters

```typescript
// Recommended: Simple to complex
1. Merge documentation changes
2. Merge configuration changes
3. Merge simple feature additions
4. Merge complex refactoring
5. Resolve conflicts manually
```

#### Batch vs. Individual Merges

**Individual Merges**:
```bash
# Merge as each agent completes
git merge minion/agent-1
git merge minion/agent-2
git merge minion/agent-3
```

**Batch Merges**:
```bash
# Wait for all agents, then merge together
git merge minion/agent-1 minion/agent-2 minion/agent-3
```

**Recommendation**: Individual merges for fewer conflicts

## Orchestration Examples

### Example 1: E-commerce Feature

```typescript
// Goal: Add complete shopping cart feature

// Parallel Phase 1 (Independent)
Agent 1: Create cart database schema
Agent 2: Design cart UI components
Agent 3: Write cart documentation

// Wait for all Phase 1 agents to complete

// Parallel Phase 2 (Depends on Phase 1)
Agent 4: Implement cart API (needs schema)
Agent 5: Implement cart frontend (needs UI design)

// Wait for Phase 2

// Sequential Phase 3
Agent 6: Integration testing

// Merge all changes
```

### Example 2: Code Migration

```typescript
// Goal: Migrate from JavaScript to TypeScript

// Divide by directory
Agent 1: src/utils/
Agent 2: src/components/
Agent 3: src/pages/
Agent 4: src/api/
Agent 5: src/hooks/

// All agents work in parallel
// Each converts .js to .ts and adds types

// Merge in order:
// 1. utils (no dependencies)
// 2. hooks (depends on utils)
// 3. components (depends on hooks)
// 4. api (depends on utils)
// 5. pages (depends on all)
```

### Example 3: Bug Triage

```typescript
// Goal: Fix multiple bugs

// Parallel execution
Agent 1: Fix memory leak in worker
Agent 2: Fix race condition in cache
Agent 3: Fix validation bug in API
Agent 4: Fix UI rendering issue
Agent 5: Fix authentication timeout

// Merge independently as they complete
// No dependencies between bug fixes
```

## Monitoring Orchestration

### Dashboard View

```
┌────────────────────────────────────────┐
│ Active Agents: 5                       │
├────────────────────────────────────────┤
│ ✓ Agent 1: Idle (completed)           │
│ ⟳ Agent 2: Working (in progress)      │
│ ⟳ Agent 3: Working (in progress)      │
│ ⚠ Agent 4: Error (needs attention)    │
│ ⟳ Agent 5: Working (in progress)      │
└────────────────────────────────────────┘
```

### Progress Tracking

```typescript
// Total tasks
const total = 10;

// Completed
const completed = agents.filter(a => a.status === 'idle').length;

// Progress
const progress = (completed / total) * 100; // 40%
```

### Status Indicators

```typescript
// All agents
🟢 Idle: Task complete, ready for more
🟡 Working: Currently processing
🔴 Error: Needs attention
```

## Performance Optimization

### Agent Limits

**Recommended Concurrent Agents**:
- Small repos (<100 MB): 8-10 agents
- Medium repos (100MB-1GB): 5-8 agents
- Large repos (>1GB): 3-5 agents

**Bottlenecks**:
- Claude API rate limits
- Disk I/O for git operations
- Memory usage (~30MB per agent)

### Task Sizing

**Optimal Task Size**: 10-20 minutes

```typescript
// Too small (inefficient)
❌ 'Add a comment to function X'

// Too large (high failure risk)
❌ 'Refactor the entire application'

// Just right
✅ 'Refactor authentication module to use async/await'
```

### Staggered Starts

```typescript
// Don't start all at once
❌ Create 10 agents simultaneously

// Stagger creation
✅ Create 3 agents
   Wait 30 seconds
   Create 3 more
   ...
```

## Error Handling

### Agent Failures

```typescript
if (agent.status === 'error') {
  // Options:
  // 1. Send recovery message
  sendMessage(agent.id, 'Try again with different approach');

  // 2. Reassign to new agent
  createAgent('agent-backup', originalTask);
  deleteAgent(agent.id);

  // 3. Manual intervention
  console.log('Review agent worktree manually');
}
```

### Merge Conflicts

```typescript
// Minimize conflicts
// 1. Merge frequently
// 2. Keep agents focused on separate files
// 3. Coordinate overlapping work

// When conflicts occur
// 1. Review both changes
// 2. Manually resolve
// 3. Test after merging
```

## Advanced Techniques

### Agent Pooling

```typescript
// Maintain a pool of ready agents
const pool = ['agent-1', 'agent-2', 'agent-3'];

function assignTask(task) {
  const agent = pool.find(a => a.status === 'idle');
  if (agent) {
    sendMessage(agent.id, task);
  }
}
```

### Dynamic Scaling

```typescript
// Scale based on workload
const tasks = getTasks();
const agentCount = Math.min(tasks.length, MAX_AGENTS);

for (let i = 0; i < agentCount; i++) {
  createAgent(`agent-${i}`, tasks[i]);
}
```

### Priority Queues

```typescript
// High priority tasks first
const tasks = [
  { priority: 'high', task: 'Fix security vulnerability' },
  { priority: 'medium', task: 'Add feature' },
  { priority: 'low', task: 'Update docs' }
].sort((a, b) => b.priority - a.priority);
```

## Troubleshooting

### Too Many Agents

**Symptoms**:
- Slow responses
- High memory usage
- API rate limit errors

**Solution**: Reduce concurrent agents

### Merge Hell

**Symptoms**:
- Many merge conflicts
- Difficult to resolve

**Solution**:
- Better task division
- More frequent merges
- Clearer agent boundaries

### Agent Starvation

**Symptoms**:
- Some agents idle
- Uneven workload

**Solution**:
- Better task sizing
- Load balancing
- Dynamic task assignment

## Next Steps

- [Creating Agents](/guide/creating-agents) - Learn to create agents
- [Managing Agents](/guide/managing-agents) - Agent lifecycle
- [Best Practices](/guide/best-practices) - Orchestration tips
- [Architecture](/guide/architecture) - How it works
