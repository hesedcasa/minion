# Best Practices

Tips and best practices for effective multi-agent orchestration with Minion.

## Agent Creation

### Naming

✅ **Use descriptive prefixes**:
```
feature-user-auth
fix-memory-leak
refactor-api-layer
test-checkout-flow
docs-api-reference
```

✅ **Keep it concise but clear**:
```
Good: feature-payment-api
Too long: feature-payment-api-with-stripe-integration-and-webhooks
Too short: payment
```

### Task Assignment

✅ **Be specific and clear**:
```
Create a new REST API endpoint at /api/users that:
- Accepts GET requests
- Returns paginated list of users
- Includes error handling
- Adds TypeScript types
```

❌ **Avoid vague instructions**:
```
Fix the API
Make it better
Update the code
```

✅ **Provide context**:
```
The current login system uses sessions. Refactor it to use
JWT tokens for better scalability. Keep the same API interface
for backward compatibility.
```

✅ **Set boundaries**:
```
Only modify files in src/auth/ directory.
Don't change the database schema.
Maintain existing test coverage.
```

## Agent Management

### Concurrent Agents

**Recommended limits**:
```
Small projects (<100MB): 8-10 agents
Medium projects (100MB-1GB): 5-8 agents
Large projects (>1GB): 3-5 agents
```

**Start small**:
```
Begin with 2-3 agents
Monitor performance
Scale up gradually
```

### Task Sizing

✅ **Optimal task duration: 10-20 minutes**

```
Too small (<5 min): "Add a comment to function X"
Just right (10-20 min): "Refactor auth module to use async/await"
Too large (>60 min): "Rewrite entire application"
```

### Resource Management

✅ **Clean up regularly**:
```
After merging → Delete agent
After failed task → Delete agent
Idle agents → Review and delete
```

✅ **Monitor resources**:
```
Check disk space regularly
Monitor memory usage
Watch API rate limits
```

## Orchestration Patterns

### Divide by Concern

```
Agent 1: Backend API
Agent 2: Frontend UI
Agent 3: Database schema
Agent 4: Documentation
```

### Divide by Feature

```
Agent 1: User authentication
Agent 2: Payment processing
Agent 3: Email notifications
Agent 4: Analytics tracking
```

### Sequential Dependencies

```
Phase 1: Agent 1 (Setup database)
         ↓ Merge
Phase 2: Agent 2 (Create API) + Agent 3 (Build UI)
         ↓ Merge both
Phase 3: Agent 4 (Integration tests)
```

## Conflict Prevention

### File-Based Separation

✅ **Assign different directories**:
```
Agent 1: src/auth/*
Agent 2: src/api/*
Agent 3: src/ui/*
```

✅ **Assign different file types**:
```
Agent 1: *.ts (TypeScript migration)
Agent 2: *.css (Styling updates)
Agent 3: *.test.ts (Test updates)
```

### Merge Frequently

```
✅ Merge each agent after completion
❌ Let multiple agents accumulate changes
```

### Coordinate Overlapping Work

```
If agents need same files:
1. Complete and merge Agent 1 first
2. Then start Agent 2 with updated base
```

## Code Quality

### Review Before Merging

✅ **Always review changes**:
```
1. Click "View Diff"
2. Read through all changes
3. Check for issues
4. Test if possible
5. Then merge
```

✅ **Check for**:
```
- Logic errors
- Security vulnerabilities
- Performance issues
- Code style consistency
- Missing error handling
```

### Testing

```bash
# After merging agent changes
npm test                # Unit tests
npm run build           # Build verification
npm run lint            # Code quality
```

### Documentation

✅ **Keep docs in sync**:
```
Create doc agent: Update README after feature completion
Include docs: "Also update the API documentation"
```

## Performance Optimization

### Stagger Agent Creation

```typescript
// Don't create all at once
❌ agents.forEach(task => createAgent(task.id, task.msg));

// Stagger with delays
✅ for (const task of agents) {
    createAgent(task.id, task.msg);
    await sleep(5000); // 5 second delay
  }
```

### Task Prioritization

```
High Priority → Critical bugs, security fixes
Medium Priority → New features, enhancements
Low Priority → Refactoring, documentation
```

### Monitor and Adjust

```
Track metrics:
- Agent creation time
- Task completion time
- Merge success rate
- Conflict frequency

Adjust strategy based on data
```

## Error Handling

### When Agents Error

✅ **Read error messages carefully**:
```
Error messages contain valuable debugging info
```

✅ **Try recovery first**:
```
Send clarifying message
Provide additional context
Suggest alternative approach
```

✅ **Know when to give up**:
```
After 2-3 retries → Delete and recreate
Manual fix faster → Fix manually and continue
```

### Common Issues

**Agent can't find file**:
```
❌ "Update src/auth.ts"
✅ "Update src/auth/index.ts" (full path)
```

**Ambiguous instructions**:
```
❌ "Fix the bug"
✅ "Fix the null pointer error in login() function at line 45"
```

**Scope too broad**:
```
❌ "Refactor everything"
✅ "Refactor src/auth/ to use async/await"
```

## Security

### API Key Protection

```bash
# Never commit API key
echo 'ANTHROPIC_API_KEY=*' >> .gitignore

# Use environment variables
export ANTHROPIC_API_KEY=sk-ant-...

# Rotate keys regularly
```

### Code Review

✅ **Review agent changes for**:
```
- Hardcoded secrets
- SQL injection vulnerabilities
- XSS vulnerabilities
- Insecure dependencies
- Exposed sensitive data
```

### Git Safety

```bash
# Review before merging
git diff main..minion/agent-id

# Don't merge untrusted code
# Review all changes manually
```

## Workflow Examples

### Feature Development

```
1. Create feature branch agent
2. Agent implements feature
3. Review code
4. Run tests
5. Merge to main
6. Delete agent
```

### Bug Fix Sprint

```
1. Create 5 bug-fix agents in parallel
2. Each targets specific bug
3. Monitor progress
4. Merge as each completes
5. Verify fixes
6. Clean up agents
```

### Large Refactoring

```
1. Plan refactoring (break into pieces)
2. Create agent for each piece
3. Execute in order with dependencies
4. Merge incrementally
5. Test after each merge
6. Rollback if issues
```

## Troubleshooting

### Slow Performance

**Check**:
- Too many concurrent agents?
- Large repository size?
- Low disk space?
- API rate limits?

**Solutions**:
- Reduce agent count
- Delete unused agents
- Free up disk space
- Stagger creation

### Frequent Conflicts

**Check**:
- Agents working on same files?
- Merging infrequently?
- Unclear task boundaries?

**Solutions**:
- Better task separation
- Merge more frequently
- Clearer instructions

### Agent Failures

**Check**:
- Task too complex?
- Instructions unclear?
- Missing context?
- Resource issues?

**Solutions**:
- Break into smaller tasks
- Provide clearer instructions
- Add context and examples
- Check system resources

## Advanced Tips

### Use Templates

```typescript
const templates = {
  feature: 'Create {{name}} in {{location}} with {{requirements}}',
  bugfix: 'Fix {{bug}} in {{file}} by {{solution}}',
  refactor: 'Refactor {{component}} from {{old}} to {{new}}'
};
```

### Automation

```typescript
// Auto-merge simple changes
if (agent.linesChanged < 50 && noConflicts) {
  await mergeAgent(agent.id);
}

// Auto-delete completed agents
if (agent.status === 'idle' && agentMerged(agent.id)) {
  await deleteAgent(agent.id);
}
```

### Metrics

```typescript
// Track success rates
const metrics = {
  totalAgents: 100,
  successful: 95,
  failed: 5,
  avgTime: '15 minutes',
  conflictRate: '2%'
};
```

## Next Steps

- [Creating Agents](/guide/creating-agents) - Detailed creation guide
- [Managing Agents](/guide/managing-agents) - Lifecycle management
- [Orchestration](/guide/orchestration) - Multi-agent coordination
- [API Reference](/api/overview) - REST and WebSocket APIs
