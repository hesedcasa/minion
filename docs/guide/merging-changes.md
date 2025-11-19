# Merging Changes

Learn how to review and merge agent changes back into your main branch.

## Merge Workflow

```
Agent Working → Review Changes → Merge → Cleanup
```

## Reviewing Changes

### Via Web UI

**Click "View Diff"** on an agent card to see:

```diff
diff --git a/src/auth/index.ts b/src/auth/index.ts
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/src/auth/index.ts
@@ +0,0 +1,20 @@
+export function authenticate(user: string, pass: string) {
+  // Authentication logic
+  return true;
+}
```

### Via Git Commands

```bash
# View all changes
git diff main..minion/agent-id

# View files changed
git diff main..minion/agent-id --name-only

# View commit history
git log main..minion/agent-id

# View specific file
git diff main..minion/agent-id -- path/to/file.ts
```

## Merging via Web UI

1. **Review the changes** using "View Diff"
2. **Click "Merge"** button
3. **Confirm** the merge operation

Minion will:
- Switch to main branch
- Merge the agent's branch
- Create a merge commit
- Update the UI

## Merging via REST API

```bash
curl -X POST http://localhost:3000/agents/agent-id/merge
```

## Manual Merge

```bash
# Switch to main branch
git checkout main

# Merge agent branch
git merge minion/agent-id -m "Merge agent-id changes"

# Push if needed
git push origin main
```

## Merge Strategies

### Fast-Forward Merge

```bash
git merge --ff minion/agent-id
```

Creates linear history (no merge commit).

### No Fast-Forward (Recommended)

```bash
git merge --no-ff minion/agent-id
```

Always creates a merge commit for traceability.

## Handling Merge Conflicts

### Identifying Conflicts

```bash
git merge minion/agent-id
# Auto-merging src/file.ts
# CONFLICT (content): Merge conflict in src/file.ts
```

### Resolving Conflicts

**Manual Resolution**:

```bash
# 1. Open conflicted files
vim src/file.ts

# 2. Look for conflict markers
<<<<<<< HEAD
  Current main branch code
=======
  Agent's changes
>>>>>>> minion/agent-id

# 3. Choose or combine changes
# 4. Remove conflict markers
# 5. Save file

# 6. Stage resolved files
git add src/file.ts

# 7. Complete merge
git commit
```

### Preventing Conflicts

✅ **Keep agents focused**:
```
Agent 1: src/auth/
Agent 2: src/api/
Agent 3: src/ui/
```

✅ **Merge frequently**:
```
Merge completed agents before starting new ones
```

✅ **Coordinate overlapping work**:
```
If two agents need same file, merge first agent before second starts
```

## Best Practices

### When to Merge

✅ **Merge when**:
- Agent task is complete
- Changes have been reviewed
- Tests pass (if applicable)
- No conflicts expected

❌ **Don't merge when**:
- Agent still working
- Changes not reviewed
- Known issues exist
- Other agents depend on different state

### Merge Order

**Recommended order**:

1. **Simple changes first**
   ```
   - Documentation updates
   - Configuration changes
   - Simple bug fixes
   ```

2. **Independent features**
   ```
   - New modules
   - Isolated components
   ```

3. **Complex changes last**
   ```
   - Large refactorings
   - API changes
   - Breaking changes
   ```

### Testing After Merge

```bash
# After merging
npm test          # Run tests
npm run build     # Verify build
npm start         # Test locally
```

## Rollback

### Undo Merge

```bash
# If merge just completed
git reset --hard HEAD~1

# Or revert the merge commit
git revert -m 1 <merge-commit-hash>
```

### Return to Previous State

```bash
# Find commit before merge
git log

# Reset to that commit
git reset --hard <commit-hash>
```

## Next Steps

- [Managing Agents](/guide/managing-agents) - Agent lifecycle
- [Best Practices](/guide/best-practices) - Tips and tricks
- [Architecture](/guide/architecture) - How Minion works
