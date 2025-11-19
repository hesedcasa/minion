# Creating Agents

Learn how to create and configure agents in Minion for maximum effectiveness.

## Creating Your First Agent

### Via Web UI

1. **Open Minion**
   ```
   http://localhost:3000
   ```

2. **Click "Create New Agent"**

   A modal dialog appears with:
   - Agent ID field
   - Initial Message field

3. **Enter Agent Information**
   ```
   Agent ID: my-feature-agent
   Initial Message: Create a new user authentication module
   ```

4. **Click "Create"**

   The agent is created and starts working immediately.

### Via REST API

```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-feature-agent",
    "message": "Create a new user authentication module"
  }'
```

Response:
```json
{
  "id": "my-feature-agent",
  "status": "working",
  "worktreePath": "/path/to/repo/.minion/my-feature-agent",
  "messages": [...],
  "createdAt": "2025-11-18T..."
}
```

## Agent ID Guidelines

### Naming Conventions

✅ **Good Agent IDs**:
```
feature-user-auth
fix-memory-leak
refactor-api-layer
docs-readme-update
test-unit-coverage
experiment-new-cache
```

✅ **Patterns**:
- `feature-{name}` - New features
- `fix-{issue}` - Bug fixes
- `refactor-{component}` - Refactoring
- `docs-{document}` - Documentation
- `test-{type}` - Testing
- `experiment-{idea}` - Experiments

❌ **Bad Agent IDs**:
```
agent1           # Not descriptive
temp             # Unclear purpose
test             # Too generic
a                # Too short
my-very-long-agent-id-that-describes-everything  # Too long
```

### ID Requirements

- **Characters**: Letters, numbers, hyphens
- **Length**: 3-50 characters
- **Uniqueness**: Must be unique among active agents
- **Case**: lowercase recommended

### ID Examples by Use Case

**Feature Development**:
```
feature-payment-gateway
feature-dark-mode
feature-search-filter
feature-export-csv
```

**Bug Fixes**:
```
fix-login-timeout
fix-race-condition
fix-memory-leak
fix-null-pointer
```

**Refactoring**:
```
refactor-auth-module
refactor-database-layer
refactor-api-endpoints
refactor-ui-components
```

**Testing**:
```
test-e2e-checkout
test-unit-auth
test-integration-api
test-performance
```

## Writing Effective Initial Messages

### Message Structure

**Basic Template**:
```
[Action] [Component/Feature] [Requirements/Constraints]
```

**Examples**:
```
Create a new REST API endpoint for user registration
with email validation and password hashing

Refactor the authentication module to use JWT tokens
instead of session-based authentication

Fix the memory leak in the worker process that occurs
when processing large files
```

### Clear vs. Vague Messages

✅ **Clear Messages**:
```
Create a new file src/api/users.ts with a GET endpoint
that returns a paginated list of users from the database.
Include proper error handling and TypeScript types.
```

❌ **Vague Messages**:
```
Make the API better
```

✅ **Clear Messages**:
```
Refactor src/auth/login.ts to use async/await instead of
callbacks. Update all function signatures and add proper
error handling. Ensure backward compatibility.
```

❌ **Vague Messages**:
```
Update login code
```

### Message Components

#### 1. Action (Required)

What should the agent do?

```
Create
Add
Update
Refactor
Fix
Remove
Test
Document
Implement
Migrate
```

#### 2. Target (Required)

What component/file/feature?

```
the authentication module
src/api/users.ts
the payment processing logic
the React components in src/components/
```

#### 3. Requirements (Recommended)

Specific requirements:

```
- Use TypeScript
- Add error handling
- Include unit tests
- Follow existing patterns
- Maintain backward compatibility
```

#### 4. Context (Optional)

Background information:

```
The current implementation uses callbacks,
but we're migrating to async/await throughout
the codebase.
```

### Message Examples by Task Type

**Feature Implementation**:
```
Implement a dark mode toggle in the settings page.
Add a switch component using Ant Design, create a
theme context provider, and update all styled
components to support both light and dark themes.
Save the user's preference to localStorage.
```

**Bug Fix**:
```
Fix the race condition in src/cache/manager.ts that
occurs when multiple requests try to invalidate the
same cache entry simultaneously. The issue appears
in the clearCache() function around line 45. Add
proper locking or use atomic operations.
```

**Refactoring**:
```
Refactor src/database/connection.ts to use a
connection pool instead of creating a new connection
for each query. Implement proper connection lifecycle
management, error handling, and connection limits
(max 10 concurrent connections).
```

**Testing**:
```
Add comprehensive unit tests for src/utils/validation.ts.
Cover all validation functions (email, phone, password)
including edge cases and error conditions. Use Jest
and aim for 100% code coverage.
```

**Documentation**:
```
Update README.md with a comprehensive API Reference
section. Document all REST endpoints including:
- Endpoint URL
- HTTP method
- Request parameters
- Response format
- Example requests
- Error codes
```

## Agent Configuration

### Initial Message Options

**Short and Simple**:
```
Agent ID: fix-typo
Message: Fix typo in README.md line 42
```

**Detailed with Requirements**:
```
Agent ID: feature-api
Message: |
  Create a new REST API endpoint at /api/products

  Requirements:
  - GET method for listing products
  - Support pagination (limit, offset)
  - Support filtering by category
  - Return JSON with proper status codes
  - Add OpenAPI documentation
  - Include unit tests
```

**With Context**:
```
Agent ID: refactor-auth
Message: |
  Refactor the authentication system to support OAuth2.

  Context:
  The current system uses basic auth (username/password).
  We need to migrate to OAuth2 to support third-party
  authentication providers (Google, GitHub, etc.).

  Requirements:
  - Implement OAuth2 authorization code flow
  - Support multiple providers
  - Maintain backward compatibility with basic auth
  - Update documentation
```

## Advanced Creation Patterns

### Template-Based Creation

Create a library of message templates:

```typescript
const templates = {
  feature: `
    Create a new feature: {{name}}
    Location: {{path}}
    Requirements:
    {{#each requirements}}
    - {{this}}
    {{/each}}
  `,

  bugfix: `
    Fix bug: {{description}}
    Location: {{file}}:{{line}}
    Error: {{error}}
    Expected behavior: {{expected}}
  `,

  refactor: `
    Refactor: {{component}}
    Current approach: {{current}}
    New approach: {{new}}
    Constraints: {{constraints}}
  `
};
```

### Batch Creation

Create multiple agents at once:

```typescript
const tasks = [
  { id: 'feature-1', message: 'Add user auth' },
  { id: 'feature-2', message: 'Add payment' },
  { id: 'feature-3', message: 'Add analytics' }
];

for (const task of tasks) {
  await createAgent(task.id, task.message);
}
```

### Conditional Creation

Create agents based on conditions:

```typescript
// Check if task is needed
const hasAuth = checkFeature('auth');
if (!hasAuth) {
  createAgent('feature-auth', 'Implement authentication');
}

// Create based on repository state
const bugs = await findBugs();
for (const bug of bugs.slice(0, 5)) {
  createAgent(`fix-${bug.id}`, `Fix bug: ${bug.description}`);
}
```

## Best Practices

### Do's

✅ **Be Specific**
```
Good: "Add email validation to src/utils/validators.ts
      using regex pattern and return boolean"

Bad:  "Add validation"
```

✅ **Provide Context**
```
Good: "The app uses Express.js and TypeScript.
      Add rate limiting middleware using express-rate-limit"

Bad:  "Add rate limiting"
```

✅ **Set Expectations**
```
Good: "This should take about 10-15 minutes.
      Create the file, add tests, update docs."

Bad:  "Do this quickly"
```

✅ **Reference Existing Patterns**
```
Good: "Follow the same pattern as src/api/users.ts"
Bad:  "Make it look nice"
```

### Don'ts

❌ **Too Vague**
```
"Update the code"
"Fix bugs"
"Make it better"
```

❌ **Too Broad**
```
"Rewrite the entire application in Rust"
"Fix all bugs in the codebase"
"Implement all missing features"
```

❌ **Contradictory**
```
"Make it faster but don't change anything"
"Add features but keep it simple"
```

❌ **Missing Target**
```
"Refactor something"
"Add tests somewhere"
```

## Validation

Before creating an agent, verify:

### 1. ID Uniqueness

```bash
# Check existing agents
curl http://localhost:3000/agents

# Ensure your ID isn't in the list
```

### 2. Message Clarity

Ask yourself:
- Can I understand what needs to be done?
- Is the scope clear?
- Are requirements specific?
- Is success measurable?

### 3. Repository State

```bash
# Ensure repository is clean
git status

# No uncommitted changes that might conflict
```

### 4. Disk Space

```bash
# Check available space
df -h

# Ensure enough for worktree
# Rule of thumb: 2x repository size
```

## Troubleshooting Creation

### "Agent ID already exists"

```
Error: Agent with ID 'my-agent' already exists
```

**Solution**:
```bash
# Use a different ID
# Or delete the existing agent first
curl -X DELETE http://localhost:3000/agents/my-agent
```

### "Invalid agent ID"

```
Error: Invalid agent ID format
```

**Solution**:
- Use only letters, numbers, hyphens
- No spaces or special characters
- 3-50 characters

### "Failed to create worktree"

```
Error: Could not create git worktree
```

**Solutions**:
- Check disk space
- Ensure repository is a git repo
- Verify git version (2.15+)
- Check for existing worktree with same path

### "API key not set"

```
Error: ANTHROPIC_API_KEY environment variable required
```

**Solution**:
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key
```

## Next Steps

- [Managing Agents](/guide/managing-agents) - Agent lifecycle
- [Best Practices](/guide/best-practices) - Tips and tricks
- [Quick Start](/guide/quick-start) - Tutorial
- [API Reference](/api/rest) - REST API documentation
