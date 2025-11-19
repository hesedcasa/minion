# Database Integration Additions to CLAUDE.md

## Add to Quick Start section (after npm install):

```bash
# Set up database (PostgreSQL required)
# 1. Create database: createdb minion
# 2. Copy .env.example to .env and configure
cp .env.example .env
# 3. Run migrations
npm run db:push

# Database management
npm run db:generate         # Generate migration from schema changes
npm run db:push             # Push schema to database
npm run db:migrate          # Run migrations
npm run db:studio           # Open Drizzle Studio (database GUI)
```

## Add to Project Structure section:

```
src/
├── index.ts (entry point)        # Main CLI entry point
├── db/                           # Database layer (NEW)
│   ├── index.ts                  # Barrel export
│   ├── schema.ts                 # Database schema (Drizzle ORM)
│   ├── connection.ts             # Database connection management
│   └── repository.ts             # Data access layer
└── minion/
    ├── index.ts                       # Barrel export
    ├── agentManager.ts                # Agent lifecycle management (UPDATED for DB)
    ├── workspaceManager.ts            # Git worktree operations
    ├── server.ts                      # Express + WebSocket server (UPDATED for DB)
    └── types.ts                       # TypeScript type definitions

drizzle/                              # Database migrations (generated)
```

## Add Database Module documentation:

#### Database Module (`src/db/`)

- **schema.ts** - Database schema using Drizzle ORM
  - `users` - User accounts and settings
  - `projects` - Repository configurations
  - `agents` - AI agent instances and state
  - `tasks` - Task history and execution details
  - `agentLogs` - Detailed agent activity logs

- **connection.ts** - Database connection management
  - `initDatabase()` - Initialize database connection pool
  - `getDatabase()` - Get database instance
  - `closeDatabase()` - Close connection pool
  - `testConnection()` - Test database connectivity

- **repository.ts** - Data access layer
  - `AgentRepository` - Agent CRUD operations
  - `TaskRepository` - Task CRUD operations
  - `AgentLogRepository` - Log operations
  - `ProjectRepository` - Project operations
  - `UserRepository` - User operations

## Update Minion Module documentation:

- **agentManager.ts** - Manages Claude Agent SDK instances
  - `createAgent()` - Creates new agent in isolated worktree (persists to DB)
  - `assignTask()` - Assigns task to agent (persists to DB)
  - `removeAgent()` - Cleans up agent and worktree (removes from DB)
  - `listAgents()` - Returns all active agents
  - `loadAgentsFromDatabase()` - Restores agents from database on startup

- **server.ts** - Web server with WebSocket
  - Express routes for agent operations
  - WebSocket connections for real-time updates
  - Serves built React UI from dist-ui/
  - Initializes database on startup
  - Tests database connection

## Add to Key Features:

- **PostgreSQL Database**: Persistent storage for agents, tasks, and history
- **Drizzle ORM**: Type-safe database operations with migrations

## Add Database Configuration section (after Environment Setup):

### Database Configuration

The application uses PostgreSQL for persistent storage. Configure using either:

**Option 1: Connection String (recommended)**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/minion
```

**Option 2: Individual Parameters**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=minion
DB_USER=minion
DB_PASSWORD=minion
```

### Setting up PostgreSQL

```bash
# Create database user
createuser -P minion

# Create database
createdb -O minion minion

# Run migrations
npm run db:push
```

## Update Dependencies section:

**Runtime** (add):
- `drizzle-orm@^0.44.7` - TypeScript ORM
- `pg@^8.16.3` - PostgreSQL client
- `@types/pg@^8.15.6` - PostgreSQL types

**Development** (add):
- `drizzle-kit@^0.31.7` - Drizzle migration toolkit

## Update Important Notes section (add):

6. **Database Required**: PostgreSQL database for persistent storage
7. **Database Migrations**: Use Drizzle Kit for schema changes
8. **Type Safety**: Drizzle ORM provides full TypeScript type inference

## Add new section "Working with the Database":

### Working with the Database

1. **Schema Changes**: Edit `src/db/schema.ts` for schema modifications
2. **Generating Migrations**: Run `npm run db:generate` after schema changes
3. **Applying Migrations**: Use `npm run db:push` to apply to database
4. **Database GUI**: Use `npm run db:studio` to open Drizzle Studio
5. **Persistence**: All agents and tasks are automatically persisted
6. **Recovery**: Agents are loaded from database on server restart
