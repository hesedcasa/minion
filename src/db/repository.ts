/**
 * Database repository for agent and task operations
 */
import { eq, desc, and, inArray } from 'drizzle-orm';

import { getDatabase } from './connection.js';
import {
  agents,
  tasks,
  agentLogs,
  projects,
  users,
  type Agent,
  type NewAgent,
  type Task,
  type NewTask,
  type AgentLog,
  type NewAgentLog,
  type Project,
  type NewProject,
  type User,
  type NewUser,
} from './schema.js';

/**
 * User operations
 */
export class UserRepository {
  async create(user: NewUser): Promise<User> {
    const db = getDatabase();
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async findById(id: string): Promise<User | undefined> {
    const db = getDatabase();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const db = getDatabase();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const db = getDatabase();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async update(id: string, updates: Partial<NewUser>): Promise<User | undefined> {
    const db = getDatabase();
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
}

/**
 * Project operations
 */
export class ProjectRepository {
  async create(project: NewProject): Promise<Project> {
    const db = getDatabase();
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async findById(id: string): Promise<Project | undefined> {
    const db = getDatabase();
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const db = getDatabase();
    return db.select().from(projects).where(eq(projects.userId, userId));
  }

  async findActive(): Promise<Project[]> {
    const db = getDatabase();
    return db.select().from(projects).where(eq(projects.isActive, true));
  }

  async update(id: string, updates: Partial<NewProject>): Promise<Project | undefined> {
    const db = getDatabase();
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.delete(projects).where(eq(projects.id, id));
  }
}

/**
 * Agent operations
 */
export class AgentRepository {
  async create(agent: NewAgent): Promise<Agent> {
    const db = getDatabase();
    const [created] = await db.insert(agents).values(agent).returning();
    return created;
  }

  async findById(id: string): Promise<Agent | undefined> {
    const db = getDatabase();
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async findByProjectId(projectId: string): Promise<Agent[]> {
    const db = getDatabase();
    return db.select().from(agents).where(eq(agents.projectId, projectId)).orderBy(desc(agents.createdAt));
  }

  async findAll(): Promise<Agent[]> {
    const db = getDatabase();
    return db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  async findByStatus(status: string): Promise<Agent[]> {
    const db = getDatabase();
    return db.select().from(agents).where(eq(agents.status, status));
  }

  async update(id: string, updates: Partial<NewAgent>): Promise<Agent | undefined> {
    const db = getDatabase();
    const [updated] = await db.update(agents).set(updates).where(eq(agents.id, id)).returning();
    return updated;
  }

  async updateStatus(id: string, status: string, lastActivity?: Date): Promise<Agent | undefined> {
    const db = getDatabase();
    const updates: Partial<NewAgent> = { status };
    if (lastActivity) {
      updates.lastActivity = lastActivity;
    }
    const [updated] = await db.update(agents).set(updates).where(eq(agents.id, id)).returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.delete(agents).where(eq(agents.id, id));
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = getDatabase();
    await db.delete(agents).where(inArray(agents.id, ids));
  }
}

/**
 * Task operations
 */
export class TaskRepository {
  async create(task: NewTask): Promise<Task> {
    const db = getDatabase();
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async findById(id: string): Promise<Task | undefined> {
    const db = getDatabase();
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async findByAgentId(agentId: string): Promise<Task[]> {
    const db = getDatabase();
    return db.select().from(tasks).where(eq(tasks.agentId, agentId)).orderBy(desc(tasks.createdAt));
  }

  async findByStatus(status: string): Promise<Task[]> {
    const db = getDatabase();
    return db.select().from(tasks).where(eq(tasks.status, status));
  }

  async findRunningByAgentId(agentId: string): Promise<Task | undefined> {
    const db = getDatabase();
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.agentId, agentId), eq(tasks.status, 'running')));
    return task;
  }

  async update(id: string, updates: Partial<NewTask>): Promise<Task | undefined> {
    const db = getDatabase();
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async updateStatus(
    id: string,
    status: string,
    output?: string,
    error?: string
  ): Promise<Task | undefined> {
    const db = getDatabase();
    const updates: Partial<NewTask> = { status };

    if (status === 'running' && !updates.startedAt) {
      updates.startedAt = new Date();
    } else if (status === 'completed' || status === 'error') {
      updates.completedAt = new Date();
    }

    if (output !== undefined) updates.output = output;
    if (error !== undefined) updates.error = error;

    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}

/**
 * Agent log operations
 */
export class AgentLogRepository {
  async create(log: NewAgentLog): Promise<AgentLog> {
    const db = getDatabase();
    const [created] = await db.insert(agentLogs).values(log).returning();
    return created;
  }

  async findByAgentId(agentId: string, limit?: number): Promise<AgentLog[]> {
    const db = getDatabase();
    let query = db.select().from(agentLogs).where(eq(agentLogs.agentId, agentId)).orderBy(desc(agentLogs.timestamp));

    if (limit) {
      query = query.limit(limit) as typeof query;
    }

    return query;
  }

  async findByTaskId(taskId: string, limit?: number): Promise<AgentLog[]> {
    const db = getDatabase();
    let query = db.select().from(agentLogs).where(eq(agentLogs.taskId, taskId)).orderBy(desc(agentLogs.timestamp));

    if (limit) {
      query = query.limit(limit) as typeof query;
    }

    return query;
  }

  async findRecent(limit: number = 100): Promise<AgentLog[]> {
    const db = getDatabase();
    return db.select().from(agentLogs).orderBy(desc(agentLogs.timestamp)).limit(limit);
  }

  async deleteByAgentId(agentId: string): Promise<void> {
    const db = getDatabase();
    await db.delete(agentLogs).where(eq(agentLogs.agentId, agentId));
  }
}

// Export singleton instances
export const userRepository = new UserRepository();
export const projectRepository = new ProjectRepository();
export const agentRepository = new AgentRepository();
export const taskRepository = new TaskRepository();
export const agentLogRepository = new AgentLogRepository();
