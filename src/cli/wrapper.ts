import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import readline from 'readline';

import { getCurrentVersion, printAvailableCommands, printCommandDetail } from '../commands/index.js';
import { DEFAULT_MCP_SERVER } from '../config/index.js';

/**
 * Main CLI class for Context7 interaction
 */
export class wrapper {
  private client: Client | null = null;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'context7> ',
    });
  }

  /**
   * Connects to the Context7 MCP server
   */
  async connect(): Promise<void> {
    try {
      const command = DEFAULT_MCP_SERVER.command;
      const args = DEFAULT_MCP_SERVER.args;

      this.client = new Client(
        {
          name: 'minion',
          version: '1',
        },
        {
          capabilities: {},
        }
      );

      const transport = new StdioClientTransport({
        command,
        args,
      });

      await this.client.connect(transport);

      this.printHelp();
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      process.exit(1);
    }
  }

  /**
   * Handles user input commands
   * @param input - The raw user input string
   */
  private async handleCommand(input: string): Promise<void> {
    const trimmed = input.trim();

    if (!trimmed) {
      this.rl.prompt();
      return;
    }

    // Handle special commands
    if (trimmed === 'exit' || trimmed === 'quit' || trimmed === 'q') {
      await this.disconnect();
      return;
    }

    if (trimmed === 'help' || trimmed === '?') {
      this.printHelp();
      this.rl.prompt();
      return;
    }

    if (trimmed === 'commands') {
      printAvailableCommands();
      this.rl.prompt();
      return;
    }

    if (trimmed === 'clear') {
      console.clear();
      this.rl.prompt();
      return;
    }

    // Parse tool invocation: command [args...]
    const parts = trimmed.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    if (args[0] === '-h') {
      printCommandDetail(command);
      this.rl.prompt();
      return;
    }

    await this.runCommand(command, args[0]);
  }

  /**
   * Runs a command
   * @param command - The command/tool name to execute
   * @param arg - JSON string or null for the command arguments
   */
  private async runCommand(command: string, arg: string): Promise<void> {
    if (!this.client) {
      console.log('MCP server not available!');
      this.rl.prompt();
      return;
    }

    try {
      console.log([command, arg].filter(Boolean).join(' '));

      const argObj: { [key: string]: unknown } = arg && arg.trim() !== '' ? JSON.parse(arg) : {};

      const result = await this.client.callTool(
        {
          name: command,
          arguments: argObj,
        },
        CallToolResultSchema
      );

      console.log(JSON.stringify(result, null, 2));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error running command:', errorMessage);
    }

    this.rl.prompt();
  }

  /**
   * Prints help message
   */
  private printHelp(): void {
    const version = getCurrentVersion();

    console.log(`
Context7 CLI v${version}

Usage:

commands         list all the available commands
<command> -h     quick help on <command>
<command> <arg>  run <command> with argument
clear            clear the screen
exit, quit, q    exit the CLI

All commands:

resolve-library-id, get-library-docs

Examples:
  >resolve-library-id {"libraryName":"mongodb"}
  >get-library-docs {"context7CompatibleLibraryID":"/mongodb/docs"}
  >get-library-docs {"context7CompatibleLibraryID":"/vercel/next.js","topic":"routing"}

`);
  }

  /**
   * Starts the interactive REPL loop
   */
  async start(): Promise<void> {
    this.rl.prompt();

    this.rl.on('line', async line => {
      await this.handleCommand(line);
    });

    this.rl.on('close', async () => {
      await this.client?.close();
      process.exit(0);
    });

    const gracefulShutdown = async () => {
      try {
        await this.disconnect();
      } catch (error) {
        console.error('Error during shutdown:', error);
      } finally {
        process.exit(0);
      }
    };

    ['SIGINT', 'SIGTERM'].forEach(sig => {
      process.on(sig, () => {
        gracefulShutdown();
      });
    });
  }

  /**
   * Disconnects from the server and closes the CLI
   */
  private async disconnect(): Promise<void> {
    this.rl.close();
  }
}
