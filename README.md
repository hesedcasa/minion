# Minion

[![npm minion package](https://img.shields.io/npm/v/minion.svg)](https://npmjs.org/package/minion)

Orchestrate multiple Claude AI agents working in parallel on your codebase

## Features

### Context7 CLI

- 📡 Persistent connection to Context7 MCP server
- 💻 Interactive REPL for documentation queries
- 🚀 Headless mode for one-off command execution
- 📚 Resolve library IDs and fetch current documentation
- 🔧 Command-specific help and documentation
- 🎯 Topic-focused documentation retrieval

### Minion (NEW! 🎵)

- 🎭 Orchestrate multiple Claude Agent SDK instances in parallel
- 🔀 Isolated git worktrees for conflict-free development
- 🌐 Modern web UI for managing your agent orchestra
- 📡 Real-time WebSocket updates for agent status
- 🔄 Easy review and merge of agent changes
- 🎯 Assign different tasks to different agents simultaneously

**[📖 Read the full Minion documentation →](./MINION.md)**

## Requirements

- [Node.js](https://nodejs.org/) v22.0 or newer
- [npm](https://www.npmjs.com/)
- For Minion: Anthropic API key and a git repository

## Installation

```bash
npm install -g minion
```

## Quick Start

### 🎵 Minion - AI Agent Orchestrator

Start the Minion web server to orchestrate multiple AI agents:

```bash
# Set your API key
export ANTHROPIC_API_KEY=sk-ant-your-api-key

# Start Minion (opens on http://localhost:3000)
minion

# Or with custom options
minion --port 8080 --repo /path/to/repo
```

Then open your browser to `http://localhost:3000` and start creating agents!

**[📖 Full Minion Guide →](./MINION.md)**

---

### Interactive Mode

Start the CLI and interact with Context7 through a REPL:

```bash
npx minion
```

Once started, you'll see the `context7>` prompt:

```
Context7 CLI

Usage:

commands         list all the available commands
<command> -h     quick help on <command>
<command> <arg>  run <command> with argument
clear            clear the screen
exit, quit, q    exit the CLI

context7> commands
# Lists all 2 available commands

context7> resolve-library-id {"libraryName":"mongodb"}
# Resolves "mongodb" to a Context7-compatible library ID

context7> get-library-docs {"context7CompatibleLibraryID":"/mongodb/docs","topic":"aggregation"}
# Gets MongoDB documentation focused on aggregation

context7> exit
```

### Headless Mode

Execute single commands without starting the interactive REPL:

```bash
# General format
npx minion <command> '<json_arguments>'

# Examples
npx minion resolve-library-id '{"libraryName":"mongodb"}'
npx minion get-library-docs '{"context7CompatibleLibraryID":"/mongodb/docs"}'
npx minion get-library-docs '{"context7CompatibleLibraryID":"/vercel/next.js","topic":"routing","page":2}'
```

### Command Line Options

```bash
# Show version
npx minion --version
npx minion -v

# List all commands
npx minion --commands

# Get help for specific command
npx minion resolve-library-id -h
npx minion get-library-docs -h

# General help
npx minion --help
npx minion -h
```

## Available Tools

The CLI exposes **2 documentation tools** from the Context7 MCP server:

### resolve-library-id

Resolves a package/product name to a Context7-compatible library ID and returns a list of matching libraries.

**Parameters:**

- `libraryName` (required): string - The package/product name to resolve (e.g., "mongodb", "next.js", "react")

**Example:**

```bash
context7> resolve-library-id {"libraryName":"mongodb"}
```

### get-library-docs

Fetches up-to-date documentation for a specific library, with optional topic focus and pagination.

**Parameters:**

- `context7CompatibleLibraryID` (required): string - Exact Context7-compatible library ID (e.g., "/mongodb/docs", "/vercel/next.js")
- `topic` (optional): string - Focus topic for the docs (e.g., "routing", "hooks", "authentication")
- `page` (optional): number - Page number for pagination (1-10). If the context is not sufficient, try page=2, page=3, etc. with the same topic.

**Examples:**

```bash
context7> get-library-docs {"context7CompatibleLibraryID":"/mongodb/docs"}
context7> get-library-docs {"context7CompatibleLibraryID":"/vercel/next.js","topic":"routing"}
context7> get-library-docs {"context7CompatibleLibraryID":"/vercel/next.js","topic":"routing","page":2}
```

## Use Cases

### Get Started with a New Library

```bash
# 1. Resolve the library ID
context7> resolve-library-id {"libraryName":"mongodb"}

# 2. Get general documentation
context7> get-library-docs {"context7CompatibleLibraryID":"/mongodb/docs"}

# 3. Get topic-specific documentation
context7> get-library-docs {"context7CompatibleLibraryID":"/mongodb/docs","topic":"aggregation"}
```

### Quick Documentation Lookup

```bash
# Get Next.js routing documentation
npx minion get-library-docs '{"context7CompatibleLibraryID":"/vercel/next.js","topic":"routing"}'

# Get React hooks documentation
npx minion get-library-docs '{"context7CompatibleLibraryID":"/facebook/react","topic":"hooks"}'
```

## About Context7

Context7 is an MCP server that delivers up-to-date, version-specific code documentation and examples directly into LLM prompts and AI code editors. It solves the problem of outdated training data by pulling current documentation straight from the source.

Learn more at [context7.com](https://context7.com) or [github.com/upstash/context7](https://github.com/upstash/context7).

## About Minion

Minion is inspired by [Minion.build](https://minion.build/) and implements a web-based orchestration platform for managing multiple Claude AI agents. It uses the [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript) and git worktrees to enable parallel development with multiple autonomous agents.

**[📖 Full Minion Documentation →](./MINION.md)**

## Repository Structure

```
minion/
├── src/
│   ├── index.ts                 # Context7 CLI entry point
│   ├── minion-cli.ts         # Minion entry point
│   ├── cli/                     # Context7 CLI implementation
│   ├── commands/                # Context7 command handlers
│   ├── config/                  # Context7 configuration
│   ├── utils/                   # Shared utilities
│   └── minion/               # Minion implementation
│       ├── agentManager.ts      # Agent orchestration
│       ├── workspaceManager.ts  # Git worktree management
│       ├── server.ts            # Express + WebSocket server
│       └── types.ts             # TypeScript definitions
├── public/                      # Minion web UI
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── README.md                    # This file
└── MINION.md                 # Detailed Minion docs
```

## License

Apache-2.0
