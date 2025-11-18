import { expect, test } from '../fixtures/base';
import { ApiHelpers } from '../utils/api-helpers';

test.describe('Tasks API', () => {
  let apiHelpers: ApiHelpers;
  let createdAgentIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    apiHelpers = new ApiHelpers(request);
  });

  test.afterEach(async () => {
    // Clean up created agents
    for (const agentId of createdAgentIds) {
      try {
        await apiHelpers.removeAgent(agentId, true);
      } catch (error) {
        console.log(`Failed to cleanup agent ${agentId}:`, error);
      }
    }
    createdAgentIds = [];
  });

  test.describe('POST /api/agents/:id/tasks', () => {
    test('should assign task to agent', async () => {
      // Create an agent first
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      // Assign a task
      const taskDescription = 'Test task description';
      const response = await apiHelpers.assignTask(agent.id, taskDescription);

      expect(response.status()).toBe(201);

      const task = await response.json();
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('description', taskDescription);
    });

    test('should assign task with context', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const taskDescription = 'Test task with context';
      const taskContext = 'Additional context for the task';
      const response = await apiHelpers.assignTask(agent.id, taskDescription, taskContext);

      expect(response.status()).toBe(201);

      const task = await response.json();
      expect(task).toHaveProperty('description', taskDescription);
    });

    test('should return 400 if description is missing', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.assignTask(agent.id, '');

      expect(response.status()).toBe(400);

      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.error).toContain('description is required');
    });

    test('should return error for non-existent agent', async () => {
      const response = await apiHelpers.assignTask('non-existent-id', 'Test task');

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('GET /api/agents/:id/tasks', () => {
    test('should return tasks for agent', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.getAgentTasks(agent.id);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const tasks = await response.json();
      expect(Array.isArray(tasks)).toBeTruthy();
    });

    test('should return empty array for agent with no tasks', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.getAgentTasks(agent.id);
      const tasks = await response.json();

      expect(Array.isArray(tasks)).toBeTruthy();
    });
  });

  test.describe('POST /api/agents/:id/stop', () => {
    test('should stop agent successfully', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.stopAgent(agent.id);

      expect(response.ok()).toBeTruthy();

      const result = await response.json();
      expect(result).toHaveProperty('success', true);
    });

    test('should handle stopping non-existent agent', async () => {
      const response = await apiHelpers.stopAgent('non-existent-id');

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });
});
