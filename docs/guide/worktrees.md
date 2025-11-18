# Git Worktrees

Learn how Minion uses git worktrees to enable parallel agent execution without conflicts.

## What are Git Worktrees?

Git worktrees allow you to have multiple working trees attached to the same repository. Each worktree can be on a different branch, enabling parallel work without switching branches.

### Traditional Git Workflow

```
repo/
├── .git/
├── src/
└── package.json

# Switch branches
git checkout feature-a  # Working on feature A
git checkout feature-b  # Switches away from A
```

### Git Worktrees Workflow

```
repo/
├── .git/                 # Shared git directory
├── src/                  # Main branch
├── package.json          # Main branch
├── worktree-a/           # Feature A (separate directory)
│   ├── src/
│   └── package.json
└── worktree-b/           # Feature B (separate directory)
    ├── src/
    └── package.json
```

## How Minion Uses Worktrees

### Worktree Structure

When you create an agent, Minion creates:

```
your-repo/
├── .git/                           # Main git directory
├── .minion/                        # Minion's worktree directory
│   ├── agent-abc123/              # Agent 1's worktree
│   │   ├── .git → ../../.git/     # Symlink to main .git
│   │   ├── src/                   # Independent file copy
│   │   └── package.json
│   ├── agent-def456/              # Agent 2's worktree
│   │   ├── .git → ../../.git/
│   │   ├── src/
│   │   └── package.json
│   └── agent-ghi789/              # Agent 3's worktree
│       ├── .git → ../../.git/
│       ├── src/
│       └── package.json
└── (your main working tree files)
```

### Branch Structure

```bash
# Main branch
main

# Agent branches (created automatically)
minion/agent-abc123
minion/agent-def456
minion/agent-ghi789
```

Each agent worktree is checked out to its own branch.

## Worktree Operations

### Creating a Worktree

When you create an agent:

```bash
# Minion executes:
git worktree add .minion/<agent-id> -b minion/<agent-id>
```

This:
1. Creates `.minion/<agent-id>/` directory
2. Creates branch `minion/<agent-id>`
3. Checks out the new branch in the worktree
4. Links to shared `.git` directory

### Listing Worktrees

```bash
# View all worktrees
git worktree list

# Output:
# /path/to/repo              abc123d [main]
# /path/to/repo/.minion/agent-1  def456e [minion/agent-1]
# /path/to/repo/.minion/agent-2  ghi789f [minion/agent-2]
```

### Removing a Worktree

When you delete an agent:

```bash
# Minion executes:
git worktree remove .minion/<agent-id>
git branch -D minion/<agent-id>  # Optional
```

This:
1. Removes the worktree directory
2. Deletes the branch (if specified)
3. Cleans up git metadata

## Benefits of Worktrees

### 1. True Isolation

Each agent has completely independent files:

```bash
# Agent 1 modifies src/api.ts
# Agent 2 modifies src/api.ts
# No conflicts! (Different copies)
```

### 2. No Branch Switching

```bash
# Traditional: Must switch branches
git checkout feature-a
# Work on A
git checkout feature-b
# Context lost, must rebuild

# Worktrees: Both exist simultaneously
cd .minion/agent-feature-a
# Work on A
cd .minion/agent-feature-b
# Work on B (A still exists)
```

### 3. Disk Efficiency

Worktrees share the `.git` directory:

```
Repository: 100 MB
  ├── .git/: 20 MB (shared)
  └── Working files: 80 MB

3 Separate Clones:
  Total: 300 MB (3 × 100 MB)

3 Worktrees:
  Total: 260 MB (20 MB + 3 × 80 MB)

Savings: 40 MB
```

### 4. Fast Creation

```bash
# Clone: 10-30 seconds
git clone <url>

# Worktree: 1-2 seconds
git worktree add path -b branch
```

### 5. Shared Git History

All worktrees share:
- Commits
- Branches
- Tags
- Remotes
- Configuration

Changes in one worktree are immediately visible to others via git commands.

## Worktree Best Practices

### Directory Organization

✅ **Recommended**:
```
.minion/               # All agent worktrees
├── feature-auth/
├── fix-bug-123/
└── refactor-api/
```

❌ **Avoid**:
```
../agent-1/           # Outside repo
/tmp/agent-2/         # Temporary locations
~/agents/agent-3/     # Mixed with other projects
```

### Branch Naming

✅ **Good Names**:
```
minion/feature-user-auth
minion/fix-memory-leak
minion/refactor-database
```

❌ **Bad Names**:
```
temp
test
branch1
```

### Cleanup

**Always clean up** when done:

```bash
# Via Minion UI
# Click "Delete" button

# Or manually
git worktree remove .minion/agent-id
git branch -D minion/agent-id
```

**Orphaned worktrees** waste disk space and can cause confusion.

## Worktree Limitations

### 1. Disk Space

Each worktree duplicates working files:

```
Repository: 1 GB working files
10 Agents: ~10 GB total
```

**Mitigation**: Delete agents when done

### 2. Branch Per Worktree

Git enforces one worktree per branch:

```bash
# Error: Branch already checked out
git worktree add .minion/agent-2 -b existing-branch
# fatal: 'existing-branch' is already checked out
```

**Mitigation**: Use unique branches (Minion does this automatically)

### 3. Git Hooks

Some hooks may need worktree-specific configuration.

**Mitigation**: Configure hooks to handle worktrees

### 4. IDE Indexing

IDEs may struggle with multiple working trees:
- Slow indexing
- Confused file watchers
- Duplicate symbols

**Mitigation**: Exclude `.minion/` from IDE indexing

## Advanced Worktree Usage

### Manual Worktree Creation

```bash
# Create worktree for manual work
git worktree add .minion/manual-work -b feature/manual

# Work in it
cd .minion/manual-work
# Make changes

# Commit and merge
git add .
git commit -m "Manual changes"
git checkout main
git merge feature/manual

# Clean up
cd ../..
git worktree remove .minion/manual-work
git branch -D feature/manual
```

### Inspecting Worktree Changes

```bash
# From main branch
git diff main..minion/agent-id

# From agent worktree
cd .minion/agent-id
git diff main

# Show commits
git log main..HEAD
```

### Merging Multiple Worktrees

```bash
# Merge agent 1
git checkout main
git merge minion/agent-1

# Merge agent 2
git merge minion/agent-2

# Resolve conflicts if any
```

### Moving Worktrees

```bash
# Move worktree location
git worktree move .minion/old-path .minion/new-path

# Update Minion config if needed
```

## Troubleshooting Worktrees

### "Worktree already exists"

```bash
# Check existing worktrees
git worktree list

# Remove if orphaned
git worktree remove .minion/agent-id

# Or prune all
git worktree prune
```

### "Branch already checked out"

```bash
# List worktrees and their branches
git worktree list

# Remove conflicting worktree
git worktree remove path/to/worktree
```

### Locked Worktrees

```bash
# Unlock if locked
git worktree unlock .minion/agent-id

# Then remove
git worktree remove .minion/agent-id
```

### Orphaned Worktrees

```bash
# Clean up orphaned worktrees
git worktree prune

# Remove directories manually if needed
rm -rf .minion/orphaned-agent
```

### Checking Worktree Health

```bash
# Verify worktree integrity
cd .minion/agent-id
git status
git fsck

# Repair if needed
git worktree repair
```

## Integration with Minion

### Automatic Management

Minion handles:
- ✅ Worktree creation
- ✅ Branch creation
- ✅ Cleanup on deletion
- ✅ Merge operations
- ✅ Conflict detection

### Manual Inspection

You can inspect agent worktrees:

```bash
# Enter agent workspace
cd .minion/agent-id

# View changes
git status
git log

# Test changes
npm test

# Manually commit if needed
git add .
git commit -m "Additional changes"
```

### Merge Strategy

Minion uses:

```bash
git checkout main
git merge --no-ff minion/agent-id -m "Merge agent changes"
```

Creates a merge commit for traceability.

## Performance Considerations

### Creation Time

- **Small repos** (<100 MB): ~500ms
- **Medium repos** (100MB-1GB): ~1-3s
- **Large repos** (>1GB): ~5-10s

### Disk Usage

```
Repository Size × Number of Agents
```

### Memory Usage

- **Per worktree**: Minimal (just directory structure)
- **Per agent**: ~20-30 MB (agent instance)

## Next Steps

- [Architecture](/guide/architecture) - How worktrees fit into Minion
- [Creating Agents](/guide/creating-agents) - Create agents with worktrees
- [Merging Changes](/guide/merging-changes) - Merge worktree changes
- [Best Practices](/guide/best-practices) - Worktree optimization tips
