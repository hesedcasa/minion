# Building

Guide to building and running Minion from source.

## Prerequisites

- Node.js 18+
- npm
- Git 2.15+
- Anthropic API key

## Quick Build

```bash
# Install dependencies
npm install

# Build everything
npm run build

# Run
npm start
```

## Build Commands

### Build All

```bash
npm run build
```

Builds both server and UI.

### Build Server Only

```bash
npm run build:server
```

Compiles TypeScript to `dist/`.

### Build UI Only

```bash
npm run build:ui
```

Builds React app to `dist-ui/`.

## Development Mode

### Server Development

```bash
# Run with tsx (no build needed)
npm run dev
```

Changes require restart.

### UI Development

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend with hot reload
npm run dev:ui
```

UI dev server runs on port 5173.

## Testing

```bash
# Run tests (if available)
npm test

# Type check
npx tsc --noEmit

# Lint
npm run format

# Find dead code
npm run find-deadcode
```

## Clean Build

```bash
# Remove build artifacts
rm -rf dist dist-ui

# Clean install
rm -rf node_modules
npm install

# Fresh build
npm run build
```

## Production Build

```bash
# Install production dependencies only
npm install --production

# Build for production
NODE_ENV=production npm run build

# Run in production mode
NODE_ENV=production npm start
```

## Troubleshooting

### Build Failures

**TypeScript errors**:
```bash
npx tsc --noEmit
# Fix errors and rebuild
```

**Missing dependencies**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Runtime Issues

**Port in use**:
```bash
# Change port
npm start -- --port 8080
```

**Module not found**:
```bash
# Rebuild
npm run build
```

## Next Steps

- [Project Structure](/dev/project-structure) - Code organization
- [Contributing](/dev/contributing) - How to contribute
