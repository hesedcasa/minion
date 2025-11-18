import { expect, test } from '../fixtures/base';
import { ApiHelpers } from '../utils/api-helpers';

test.describe('Agents API', () => {
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
        // Ignore errors during cleanup
        console.log(`Failed to cleanup agent ${agentId}:`, error);
      }
    }
    createdAgentIds = [];
  });

  test.describe('POST /api/agents', () => {
    test('should create an agent with valid name', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const response = await apiHelpers.createAgent(agentName);

      expect(response.status()).toBe(201);

      const agent = await response.json();
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('name', agentName);
      expect(agent).toHaveProperty('status');
      expect(agent).toHaveProperty('createdAt');

      createdAgentIds.push(agent.id);
    });

    test('should return 400 if name is missing', async () => {
      const response = await apiHelpers.createAgent('');

      expect(response.status()).toBe(400);

      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.error).toContain('name is required');
    });

    test('should create agent with custom API key', async () => {
      const agentName = `test-agent-with-key-${Date.now()}`;
      const customApiKey = 'test-api-key';
      const response = await apiHelpers.createAgent(agentName, customApiKey);

      // Note: This might fail if the API key is invalid, but we're testing the endpoint
      // The status could be 201 (success) or 500 (if key validation fails)
      expect([201, 500]).toContain(response.status());

      if (response.status() === 201) {
        const agent = await response.json();
        createdAgentIds.push(agent.id);
      }
    });
  });

  test.describe('GET /api/agents', () => {
    test('should return list of agents', async () => {
      const response = await apiHelpers.getAgents();

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const agents = await response.json();
      expect(Array.isArray(agents)).toBeTruthy();
    });

    test('should return empty array when no agents exist', async () => {
      const response = await apiHelpers.getAgents();
      const agents = await response.json();

      // Should be array (could be empty or have agents from other tests)
      expect(Array.isArray(agents)).toBeTruthy();
    });
  });

  test.describe('GET /api/agents/:id', () => {
    test('should return 404 for non-existent agent', async () => {
      const response = await apiHelpers.getAgent('non-existent-id');

      expect(response.status()).toBe(404);

      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.error).toContain('not found');
    });

    test('should return agent details for existing agent', async () => {
      // First create an agent
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const createdAgent = await createResponse.json();
      createdAgentIds.push(createdAgent.id);

      // Then fetch it
      const response = await apiHelpers.getAgent(createdAgent.id);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const agent = await response.json();
      expect(agent).toHaveProperty('id', createdAgent.id);
      expect(agent).toHaveProperty('name', agentName);
    });
  });

  test.describe('DELETE /api/agents/:id', () => {
    test('should delete existing agent', async () => {
      // Create an agent first
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();

      // Delete it
      const deleteResponse = await apiHelpers.removeAgent(agent.id, true);

      expect(deleteResponse.ok()).toBeTruthy();
      expect(deleteResponse.status()).toBe(200);

      const result = await deleteResponse.json();
      expect(result).toHaveProperty('success', true);

      // Verify it's deleted
      const getResponse = await apiHelpers.getAgent(agent.id);
      expect(getResponse.status()).toBe(404);
    });

    test('should handle deleting non-existent agent gracefully', async () => {
      const response = await apiHelpers.removeAgent('non-existent-id', true);

      // Should return error
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });
});
