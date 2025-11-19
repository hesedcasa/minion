# Getting Started

This guide will help you install and set up Minion on your system.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: Version 2.15+ (for worktree support)
- **Anthropic API Key**: Get one from [console.anthropic.com](https://console.anthropic.com/)

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output v18.0.0 or higher

# Check npm version
npm --version

# Check Git version
git --version
# Should output 2.15.0 or higher
```

## Installation

### Option 1: Clone from GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/hesedcasa/minion.git
cd minion

# Install dependencies
npm install

# Build the project
npm run build
```

### Option 2: Install as Global Package

```bash
# Clone and link globally
git clone https://github.com/hesedcasa/minion.git
cd minion
npm install
npm run build
npm link

# Now you can use 'minion' command anywhere
minion --help
```

## Configuration

### Set API Key

Minion requires an Anthropic API key to communicate with Claude AI.

#### Linux/macOS

```bash
export ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

To make it permanent, add to your `~/.bashrc` or `~/.zshrc`:

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-your-api-key-here' >> ~/.bashrc
source ~/.bashrc
```

#### Windows (PowerShell)

```powershell
$env:ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
```

To make it permanent:

```powershell
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-your-api-key-here', 'User')
```

#### Windows (Command Prompt)

```cmd
set ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Verify API Key

```bash
# Should print your API key
echo $ANTHROPIC_API_KEY  # Linux/macOS
echo %ANTHROPIC_API_KEY% # Windows CMD
echo $env:ANTHROPIC_API_KEY # Windows PowerShell
```

## Running Minion

### Start the Server

```bash
# Navigate to project directory
cd minion

# Start Minion (defaults to port 3000)
npm start
```

You should see output like:

```
🚀 Minion server started
📁 Repository: /home/user/minion
🌐 Server: http://localhost:3000
```

### Access the Web UI

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the Minion web interface with:
- Header with project information
- "Create New Agent" button
- Empty agents grid (no agents yet)
- Connection status indicator (green = connected)

### Custom Configuration

#### Change Port

```bash
npm start -- --port 8080
```

#### Use Different Repository

```bash
npm start -- --repo /path/to/your/repo
```

#### Combine Options

```bash
npm start -- --port 8080 --repo /path/to/your/repo
```

## Development Mode

For development with hot reload:

### Backend Development

```bash
# Run server with tsx (no build step)
npm run dev
```

### Frontend Development

```bash
# Terminal 1: Run backend
npm run dev

# Terminal 2: Run UI dev server with hot reload
npm run dev:ui
```

The UI dev server runs on port 5173 and proxies API requests to port 3000.

## Verify Installation

### Check Server Health

```bash
curl http://localhost:3000/agents
```

Should return:

```json
[]
```

### Test WebSocket Connection

The web UI should show a green "Connected" indicator in the top-right corner.

## Project Structure

After installation, your directory should look like:

```
minion/
├── dist/              # Compiled server code (after build)
├── dist-ui/           # Built React UI (after build)
├── node_modules/      # Dependencies
├── src/               # TypeScript source code
│   ├── index.ts
│   └── minion/
├── ui/                # React UI source
│   └── src/
├── package.json
├── tsconfig.json
└── README.md
```

## Common Issues

### "Cannot find module" errors

```bash
# Clean install
rm -rf node_modules dist dist-ui
npm install
npm run build
```

### Port already in use

```bash
# Use different port
npm start -- --port 8080
```

Or find and kill the process:

```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### API Key not set

```
Error: ANTHROPIC_API_KEY environment variable is required
```

Make sure you've set the API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Git not in PATH

```
Error: spawn git ENOENT
```

Install Git and ensure it's in your system PATH:
- [Git Downloads](https://git-scm.com/downloads)

## Next Steps

Now that Minion is installed and running:

1. [Quick Start Tutorial](/guide/quick-start) - Create your first agent
2. [Creating Agents](/guide/creating-agents) - Learn agent creation in detail
3. [Architecture](/guide/architecture) - Understand how Minion works

## Getting Help

- [GitHub Issues](https://github.com/hesedcasa/minion/issues) - Report bugs or request features
- [API Reference](/api/overview) - Detailed API documentation
- [Best Practices](/guide/best-practices) - Tips and tricks
