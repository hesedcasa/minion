# Contributing

Thank you for your interest in contributing to Minion!

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/minion.git
   cd minion
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Make Changes

- Follow the existing code style
- Add TypeScript types
- Write clear commit messages
- Test your changes

### 2. Code Quality

```bash
# Format code
npm run format

# Find unused exports
npm run find-deadcode

# Run pre-commit checks
npm run pre-commit
```

### 3. Test Locally

```bash
# Build
npm run build

# Run
npm start

# Test the UI
open http://localhost:3000
```

### 4. Commit

Use Conventional Commits format:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
git commit -m "refactor: improve code structure"
git commit -m "test: add unit tests"
git commit -m "chore: update dependencies"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use strict TypeScript
- Provide explicit types
- Avoid `any` types
- Export types when needed

### Code Style

- Use ESLint configuration
- Run `npm run format` before committing
- Follow existing patterns
- Keep functions small and focused

### Imports

```typescript
// Use .js extension for local imports
import { createAgent } from './agentManager.js';

// Sort imports logically
import { external } from 'external-lib';
import { internal } from './internal.js';
import type { TypeDef } from './types.js';
```

### Error Handling

```typescript
try {
  await operation();
} catch (error: any) {
  console.error('Operation failed:', error.message);
  throw new Error(`Failed to ...: ${error.message}`);
}
```

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(agent): add support for custom worktree paths

Allow users to specify custom worktree directory via
configuration. Defaults to .minion/ for backward compatibility.

Closes #123
```

```
fix(server): resolve WebSocket connection leak

WebSocket connections were not being properly cleaned up
on disconnect, causing memory leaks.
```

## Pull Request Guidelines

### Title

Use Conventional Commits format:

```
feat: add dark mode support
fix: resolve agent deletion bug
docs: update API documentation
```

### Description

Include:
- What changed
- Why it changed
- How to test
- Related issues

Example:

```markdown
## Summary
Adds support for dark mode in the UI.

## Changes
- Add theme context provider
- Update all components to support dark theme
- Add theme toggle in settings

## Testing
1. Start the server
2. Open UI
3. Click theme toggle
4. Verify colors change

## Related Issues
Closes #456
```

### Checklist

- [ ] Code follows project style
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR title follows convention

## Areas to Contribute

### Features

- Agent persistence (database)
- Agent templates
- CLI improvements
- UI enhancements
- Performance optimizations

### Documentation

- API examples
- Tutorial videos
- Use case guides
- Troubleshooting guides

### Bug Fixes

Check the [GitHub Issues](https://github.com/hesedcasa/minion/issues) for bugs to fix.

### Testing

- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

## Questions?

- [GitHub Issues](https://github.com/hesedcasa/minion/issues)
- [Discussions](https://github.com/hesedcasa/minion/discussions)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
