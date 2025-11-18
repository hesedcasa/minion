/**
 * Default Context7 MCP server configuration
 */
export const DEFAULT_MCP_SERVER = {
  command: 'npx',
  args: ['-y', '@upstash/context7-mcp'],
};

/**
 * Available Context7 commands
 */
export const COMMANDS: string[] = ['resolve-library-id', 'get-library-docs'];

/**
 * Brief descriptions for each command
 */
export const COMMANDS_INFO: string[] = [
  'Resolves a package/product name to a Context7-compatible library ID and returns a list of matching libraries',
  'Fetches up-to-date documentation for a specific library, with optional topic focus and token limit',
];

/**
 * Detailed parameter information for each command
 */
export const COMMANDS_DETAIL: string[] = [
  `
- libraryName (required): string - The name of the library to search for (e.g., "mongodb", "next.js", "react")

Example:
resolve-library-id {"libraryName": "mongodb"}
`,
  `
- context7CompatibleLibraryID (required): string - Exact Context7-compatible library ID (e.g., "/mongodb/docs", "/vercel/next.js")
- topic (optional): string - Focus the docs on a specific topic (e.g., "routing", "hooks")
- page (optional): number - Page number for pagination (1-10). If the context is not sufficient, try page=2, page=3, etc. with the same topic.

Examples:
get-library-docs {"context7CompatibleLibraryID": "/mongodb/docs"}
get-library-docs {"context7CompatibleLibraryID": "/vercel/next.js", "topic": "routing", "page": 5}
`,
];
