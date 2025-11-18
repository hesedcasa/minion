#!/usr/bin/env node
/**
 * Minion CLI - Entry point for the web orchestrator
 */
import { MinionServer } from './minion/index.js';

async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  let port = 3000;
  let apiKey: string | undefined;
  let repoPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--port' || arg === '-p') {
      port = Number.parseInt(args[++i], 10);
    } else if (arg === '--api-key' || arg === '-k') {
      apiKey = args[++i];
    } else if (arg === '--repo' || arg === '-r') {
      repoPath = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  try {
    // Create and start server
    const server = new MinionServer(port, repoPath, apiKey);

    // Handle graceful shutdown
    const shutdown = async () => {
      await server.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Start the server
    await server.start();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to start Minion:', message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
🎵 Minion - AI Agent Orchestrator

Usage: minion [options]

Options:
  -p, --port <port>        Port to run the web server on (default: 3000)
  -k, --api-key <key>      Anthropic API key (or use ANTHROPIC_API_KEY env var)
  -r, --repo <path>        Path to git repository (default: current directory)
  -h, --help               Show this help message

Example:
  minion --port 8080
  minion --api-key sk-ant-xxx --repo /path/to/repo

Environment Variables:
  ANTHROPIC_API_KEY        Default API key for all agents

Once started, open your browser to http://localhost:3000 to orchestrate your AI agents!
  `);
}

main();
