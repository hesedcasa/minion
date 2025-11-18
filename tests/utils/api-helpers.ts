import type { APIRequestContext } from '@playwright/test';

/**
 * Helper functions for API testing
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export class ApiHelpers {
  constructor(private request: APIRequestContext) {}

  /**
   * Create a test agent
   */
  async createAgent(name: string, apiKey?: string) {
    const response = await this.request.post(`${BASE_URL}/api/agents`, {
      data: { name, apiKey },
    });
    return response;
  }

  /**
   * Get all agents
   */
  async getAgents() {
    const response = await this.request.get(`${BASE_URL}/api/agents`);
    return response;
  }

  /**
   * Get a specific agent
   */
  async getAgent(id: string) {
    const response = await this.request.get(`${BASE_URL}/api/agents/${id}`);
    return response;
  }

  /**
   * Assign a task to an agent
   */
  async assignTask(agentId: string, description: string, context?: string) {
    const response = await this.request.post(`${BASE_URL}/api/agents/${agentId}/tasks`, {
      data: { description, context },
    });
    return response;
  }

  /**
   * Stop an agent
   */
  async stopAgent(agentId: string) {
    const response = await this.request.post(`${BASE_URL}/api/agents/${agentId}/stop`);
    return response;
  }

  /**
   * Remove an agent
   */
  async removeAgent(agentId: string, force: boolean = true) {
    const response = await this.request.delete(`${BASE_URL}/api/agents/${agentId}?force=${force}`);
    return response;
  }

  /**
   * Get agent tasks
   */
  async getAgentTasks(agentId: string) {
    const response = await this.request.get(`${BASE_URL}/api/agents/${agentId}/tasks`);
    return response;
  }

  /**
   * Get agent diff
   */
  async getAgentDiff(agentId: string, target: string = 'main') {
    const response = await this.request.get(`${BASE_URL}/api/agents/${agentId}/diff?target=${target}`);
    return response;
  }

  /**
   * Merge agent changes
   */
  async mergeAgent(agentId: string, targetBranch: string = 'main', deleteWorktree: boolean = false) {
    const response = await this.request.post(`${BASE_URL}/api/agents/${agentId}/merge`, {
      data: { targetBranch, deleteWorktree },
    });
    return response;
  }

  /**
   * Get workspaces
   */
  async getWorkspaces() {
    const response = await this.request.get(`${BASE_URL}/api/workspaces`);
    return response;
  }

  /**
   * Check health
   */
  async checkHealth() {
    const response = await this.request.get(`${BASE_URL}/api/health`);
    return response;
  }
}
