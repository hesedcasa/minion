/**
 * Agent manager for orchestrating multiple Claude agents
 */

import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type {
	AgentConfig,
	AgentInfo,
	AgentStatus,
	AgentTask,
	TaskRequest,
} from './types.js';
import type { WorkspaceManager } from './workspaceManager.js';

// Import Claude Agent SDK
// Note: Actual import will be: import { query } from '@anthropic-ai/claude-agent-sdk';
// For now, we'll use a type-safe interface approach

interface AgentSDKQuery {
	// Placeholder for Claude Agent SDK query function
	(options: { prompt: string; workingDirectory: string; apiKey?: string }): AsyncIterable<any>;
}

export class AgentManager extends EventEmitter {
	private agents: Map<string, AgentInfo> = new Map();
	private tasks: Map<string, AgentTask> = new Map();
	private workspaceManager: WorkspaceManager;
	private defaultApiKey?: string;

	constructor(workspaceManager: WorkspaceManager, apiKey?: string) {
		super();
		this.workspaceManager = workspaceManager;
		this.defaultApiKey = apiKey || process.env.ANTHROPIC_API_KEY;
	}

	/**
	 * Creates a new agent instance
	 */
	async createAgent(name: string, customApiKey?: string): Promise<AgentInfo> {
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

			this.agents.set(agentId, agentInfo);
			this.emit('agent_created', agentInfo);

			return agentInfo;
		} catch (error: any) {
			throw new Error(`Failed to create agent: ${error.message}`);
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

		const task: AgentTask = {
			id: randomUUID(),
			agentId,
			description: taskRequest.description,
			status: 'pending',
			createdAt: new Date(),
		};

		this.tasks.set(task.id, task);
		agent.currentTask = task;
		this.agents.set(agentId, agent);

		// Execute task asynchronously
		this.executeTask(agentId, task, taskRequest.context).catch((error) => {
			console.error(`Task execution failed for agent ${agentId}:`, error);
			this.updateTaskStatus(task.id, 'error', undefined, error.message);
		});

		return task;
	}

	/**
	 * Executes a task using Claude Agent SDK
	 */
	private async executeTask(
		agentId: string,
		task: AgentTask,
		context?: string
	): Promise<void> {
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
		} catch (error: any) {
			this.updateTaskStatus(task.id, 'error', undefined, error.message);
			this.updateAgentStatus(agentId, 'error');
			this.emit('task_error', { agentId, taskId: task.id, error: error.message });
		}
	}

	/**
	 * Runs Claude Agent SDK query
	 * This is a placeholder - actual implementation will use the SDK
	 */
	private async runClaudeAgent(prompt: string, workingDirectory: string): Promise<string> {
		// TODO: Implement actual Claude Agent SDK integration
		// For now, this is a placeholder that simulates agent execution
		return new Promise((resolve, reject) => {
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
	 * Gets task info
	 */
	getTask(taskId: string): AgentTask | undefined {
		return this.tasks.get(taskId);
	}

	/**
	 * Lists tasks for an agent
	 */
	listTasksForAgent(agentId: string): AgentTask[] {
		return Array.from(this.tasks.values()).filter((task) => task.agentId === agentId);
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

		this.emit('agent_status_changed', { agentId, status });
	}

	/**
	 * Updates task status
	 */
	private updateTaskStatus(
		taskId: string,
		status: AgentTask['status'],
		output?: string,
		error?: string
	): void {
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
