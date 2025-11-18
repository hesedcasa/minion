/**
 * Database schema definitions using Drizzle ORM
 */
import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * Users table - stores user accounts and settings
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  settings: text('settings'), // JSON string for user preferences
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Projects table - stores repository configurations
 */
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  repositoryPath: text('repository_path').notNull(),
  defaultBranch: varchar('default_branch', { length: 100 }).notNull().default('main'),
  settings: text('settings'), // JSON string for project-specific settings
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Agents table - stores AI agent instances and their state
 */
export const agents = pgTable(
  'agents',
  {
    id: uuid('id').primaryKey(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('idle'), // idle, running, completed, error, stopped
    workspacePath: text('workspace_path').notNull(),
    branchName: varchar('branch_name', { length: 255 }).notNull(),
    currentTaskId: uuid('current_task_id'),
    metadata: text('metadata'), // JSON string for additional agent metadata
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastActivity: timestamp('last_activity', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  table => ({
    projectIdIdx: index('agents_project_id_idx').on(table.projectId),
    statusIdx: index('agents_status_idx').on(table.status),
  })
);

/**
 * Tasks table - stores agent tasks and execution history
 */
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    context: text('context'), // Additional context for the task
    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, running, completed, error
    output: text('output'), // Task execution output
    error: text('error'), // Error message if failed
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  table => ({
    agentIdIdx: index('tasks_agent_id_idx').on(table.agentId),
    statusIdx: index('tasks_status_idx').on(table.status),
    createdAtIdx: index('tasks_created_at_idx').on(table.createdAt),
  })
);

/**
 * Agent logs table - stores detailed agent activity logs
 */
export const agentLogs = pgTable(
  'agent_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
    logType: varchar('log_type', { length: 50 }).notNull(), // info, error, warning, debug, agent_message
    message: text('message').notNull(),
    metadata: text('metadata'), // JSON string for additional log data
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({
    agentIdIdx: index('agent_logs_agent_id_idx').on(table.agentId),
    taskIdIdx: index('agent_logs_task_id_idx').on(table.taskId),
    timestampIdx: index('agent_logs_timestamp_idx').on(table.timestamp),
  })
);

/**
 * Relations definitions for better query support
 */
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  project: one(projects, {
    fields: [agents.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
  logs: many(agentLogs),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  agent: one(agents, {
    fields: [tasks.agentId],
    references: [agents.id],
  }),
  logs: many(agentLogs),
}));

export const agentLogsRelations = relations(agentLogs, ({ one }) => ({
  agent: one(agents, {
    fields: [agentLogs.agentId],
    references: [agents.id],
  }),
  task: one(tasks, {
    fields: [agentLogs.taskId],
    references: [tasks.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type AgentLog = typeof agentLogs.$inferSelect;
export type NewAgentLog = typeof agentLogs.$inferInsert;
