/**
 * Agent manager for orchestrating multiple Claude agents
 */
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';

import { agentRepository, taskRepository, agentLogRepository } from '../db/index.js';
import type { AgentInfo, AgentStatus, AgentTask, TaskRequest } from './types.js';
import type { WorkspaceManager } from './workspaceManager.js';

// Import Claude Agent SDK
// Note: Actual import will be: import { query } from '@anthropic-ai/claude-agent-sdk';

export class AgentManager extends EventEmitter {
  private agents: Map<string, AgentInfo> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private workspaceManager: WorkspaceManager;
  private defaultApiKey?: string;
  private projectId?: string;

  constructor(workspaceManager: WorkspaceManager, apiKey?: string, projectId?: string) {
    super();
    this.workspaceManager = workspaceManager;
    this.defaultApiKey = apiKey || process.env.ANTHROPIC_API_KEY;
    this.projectId = projectId;
  }

  /**
   * Creates a new agent instance
   */
  async createAgent(name: string): Promise<AgentInfo> {
    const agentId = randomUUID();
    const branchName = `minion/${name.toLowerCase().replaceAll(/\s+/g, '-')}-${agentId.slice(0, 8)}`;

    try {
      // Create isolated workspace using git worktree
      const workspacePath = await this.workspaceManager.createWorktree(agentId, branchName);

      const agentInfo: AgentInfo = {
        id: agentId,
        name,
        status: 'idle',
        workspacePath,
        branchName,
        createdAt: new Date(),
      };

      // Persist to database
      await agentRepository.create({
        id: agentId,
        projectId: this.projectId,
        name,
        status: 'idle',
        workspacePath,
        branchName,
        createdAt: new Date(),
      });

      // Log agent creation
      await agentLogRepository.create({
        agentId,
        logType: 'info',
        message: `Agent created: ${name}`,
      });

      this.agents.set(agentId, agentInfo);
      this.emit('agent_created', agentInfo);

      return agentInfo;
    } catch (error: unknown) {
      throw new Error(`Failed to create agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Assigns a task to an agent
   */
  async assignTask(agentId: string, taskRequest: TaskRequest): Promise<AgentTask> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status === 'running') {
      throw new Error(`Agent ${agentId} is already running a task`);
    }

    const taskId = randomUUID();
    const task: AgentTask = {
      id: taskId,
      agentId,
      description: taskRequest.description,
      status: 'pending',
      createdAt: new Date(),
    };

    // Persist to database
    await taskRepository.create({
      id: taskId,
      agentId,
      description: taskRequest.description,
      context: taskRequest.context,
      status: 'pending',
      createdAt: new Date(),
    });

    // Log task creation
    await agentLogRepository.create({
      agentId,
      taskId,
      logType: 'info',
      message: `Task assigned: ${taskRequest.description}`,
    });

    this.tasks.set(task.id, task);
    agent.currentTask = task;
    this.agents.set(agentId, agent);

    // Execute task asynchronously
    this.executeTask(agentId, task, taskRequest.context).catch(error => {
      console.error(`Task execution failed for agent ${agentId}:`, error);
      this.updateTaskStatus(task.id, 'error', undefined, error instanceof Error ? error.message : String(error));
    });

    return task;
  }

  /**
   * Executes a task using Claude Agent SDK
   */
  private async executeTask(agentId: string, task: AgentTask, context?: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    try {
      // Update status
      this.updateAgentStatus(agentId, 'running');
      this.updateTaskStatus(task.id, 'running');

      // Build prompt
      let prompt = task.description;
      if (context) {
        prompt = `${context}\n\n${prompt}`;
      }

      // Execute using Claude Agent SDK
      // Note: This is a simplified version. Actual implementation would use:
      // const { query } = await import('@anthropic-ai/claude-agent-sdk');
      const output = await this.runClaudeAgent(prompt, agent.workspacePath);

      // Update task with output
      this.updateTaskStatus(task.id, 'completed', output);
      this.updateAgentStatus(agentId, 'completed');

      this.emit('task_completed', { agentId, taskId: task.id, output });
    } catch (error: unknown) {
      this.updateTaskStatus(task.id, 'error', undefined, error instanceof Error ? error.message : String(error));
      this.updateAgentStatus(agentId, 'error');
      this.emit('task_error', {
        agentId,
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Runs Claude Agent SDK query
   * This is a placeholder - actual implementation will use the SDK
   */
  private async runClaudeAgent(prompt: string, workingDirectory: string): Promise<string> {
    // TODO: Implement actual Claude Agent SDK integration
    // For now, this is a placeholder that simulates agent execution
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          `Agent executed task in ${workingDirectory}\n\nPrompt: ${prompt}\n\n[Placeholder: Claude Agent SDK will be integrated here]`
        );
      }, 2000);
    });

    /*
     * Actual implementation would be:
     *
     * const { query } = await import('@anthropic-ai/claude-agent-sdk');
     * const apiKey = this.defaultApiKey;
     * if (!apiKey) {
     *   throw new Error('ANTHROPIC_API_KEY not set');
     * }
     *
     * let output = '';
     * for await (const message of query({ prompt, workingDirectory, apiKey })) {
     *   if (message.type === 'text') {
     *     output += message.text;
     *     this.emit('agent_log', { agentId, text: message.text });
     *   }
     * }
     * return output;
     */
  }

  /**
   * Stops an agent
   */
  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Update status
    this.updateAgentStatus(agentId, 'stopped');

    // If there's a running task, mark it as error
    if (agent.currentTask && agent.currentTask.status === 'running') {
      this.updateTaskStatus(agent.currentTask.id, 'error', undefined, 'Agent stopped');
    }

    this.emit('agent_stopped', { agentId });
  }

  /**
   * Removes an agent and its workspace
   */
  async removeAgent(agentId: string, force: boolean = false): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Stop agent if running
    if (agent.status === 'running') {
      if (!force) {
        throw new Error(`Agent ${agentId} is running. Use force=true to remove.`);
      }
      await this.stopAgent(agentId);
    }

    // Remove worktree
    await this.workspaceManager.removeWorktree(agentId, force);

    // Log agent removal before deleting from database
    await agentLogRepository.create({
      agentId,
      logType: 'info',
      message: 'Agent removed',
    });

    // Remove from database (cascades to tasks and logs)
    await agentRepository.delete(agentId);

    // Remove from memory
    this.agents.delete(agentId);
    this.emit('agent_removed', { agentId });
  }

  /**
   * Gets agent info
   */
  getAgent(agentId: string): AgentInfo | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Lists all agents
   */
  listAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  /**
   * Loads agents from database into memory
   */
  async loadAgentsFromDatabase(): Promise<void> {
    try {
      const dbAgents = await agentRepository.findAll();
      for (const dbAgent of dbAgents) {
        const agentInfo: AgentInfo = {
          id: dbAgent.id,
          name: dbAgent.name,
          status: dbAgent.status as AgentStatus,
          workspacePath: dbAgent.workspacePath,
          branchName: dbAgent.branchName,
          createdAt: dbAgent.createdAt,
          lastActivity: dbAgent.lastActivity || undefined,
        };
        this.agents.set(dbAgent.id, agentInfo);

        // Load current task if exists
        const runningTask = await taskRepository.findRunningByAgentId(dbAgent.id);
        if (runningTask) {
          const task: AgentTask = {
            id: runningTask.id,
            agentId: runningTask.agentId,
            description: runningTask.description,
            status: runningTask.status as AgentTask['status'],
            createdAt: runningTask.createdAt,
            startedAt: runningTask.startedAt || undefined,
            completedAt: runningTask.completedAt || undefined,
            error: runningTask.error || undefined,
            output: runningTask.output || undefined,
          };
          this.tasks.set(task.id, task);
          agentInfo.currentTask = task;
        }
      }
      console.log(`Loaded ${dbAgents.length} agents from database`);
    } catch (error) {
      console.error('Failed to load agents from database:', error);
    }
  }

  /**
   * Gets task info
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Lists tasks for an agent
   */
  listTasksForAgent(agentId: string): AgentTask[] {
    return Array.from(this.tasks.values()).filter(task => task.agentId === agentId);
  }

  /**
   * Updates agent status
   */
  private updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.status = status;
    agent.lastActivity = new Date();
    this.agents.set(agentId, agent);

    // Persist to database
    agentRepository.updateStatus(agentId, status, agent.lastActivity).catch(error => {
      console.error(`Failed to update agent status in database:`, error);
    });

    // Log status change
    agentLogRepository
      .create({
        agentId,
        logType: 'info',
        message: `Agent status changed to: ${status}`,
      })
      .catch(error => {
        console.error(`Failed to log agent status change:`, error);
      });

    this.emit('agent_status_changed', { agentId, status });
  }

  /**
   * Updates task status
   */
  private updateTaskStatus(taskId: string, status: AgentTask['status'], output?: string, error?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = status;
    if (status === 'running') {
      task.startedAt = new Date();
    } else if (status === 'completed' || status === 'error') {
      task.completedAt = new Date();
    }
    if (output) task.output = output;
    if (error) task.error = error;

    this.tasks.set(taskId, task);

    // Persist to database
    taskRepository.updateStatus(taskId, status, output, error).catch(err => {
      console.error(`Failed to update task status in database:`, err);
    });

    // Log task status change
    const logType = error ? 'error' : 'info';
    const message = error ? `Task failed: ${error}` : `Task status: ${status}`;
    agentLogRepository
      .create({
        agentId: task.agentId,
        taskId,
        logType,
        message,
      })
      .catch(err => {
        console.error(`Failed to log task status change:`, err);
      });

    this.emit('task_status_changed', { taskId, status });
  }

  /**
   * Cleanup all agents
   */
  async cleanup(): Promise<void> {
    const agentIds = Array.from(this.agents.keys());
    for (const agentId of agentIds) {
      try {
        await this.removeAgent(agentId, true);
      } catch (error) {
        console.error(`Failed to cleanup agent ${agentId}:`, error);
      }
    }
  }
}
