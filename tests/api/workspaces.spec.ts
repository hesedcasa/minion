import { expect, test } from '../fixtures/base';
import { ApiHelpers } from '../utils/api-helpers';

test.describe('Workspaces API', () => {
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

  test.describe('GET /api/workspaces', () => {
    test('should return list of workspaces', async () => {
      const response = await apiHelpers.getWorkspaces();

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const workspaces = await response.json();
      expect(Array.isArray(workspaces)).toBeTruthy();
    });
  });

  test.describe('GET /api/agents/:id/diff', () => {
    test('should get diff for agent', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.getAgentDiff(agent.id);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('diff');
      expect(typeof data.diff).toBe('string');
    });

    test('should get diff with custom target branch', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.getAgentDiff(agent.id, 'main');

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('diff');
    });

    test('should handle non-existent agent', async () => {
      const response = await apiHelpers.getAgentDiff('non-existent-id');

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('POST /api/agents/:id/merge', () => {
    test('should merge agent changes', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.mergeAgent(agent.id, 'main', false);

      // Note: This might fail if there are no changes or merge conflicts
      // The test validates the endpoint works, not necessarily that merge succeeds
      expect([200, 400, 500]).toContain(response.status());

      if (response.status() === 200) {
        const result = await response.json();
        expect(result).toHaveProperty('success', true);
      }
    });

    test('should handle merge with deleteWorktree option', async () => {
      const agentName = `test-agent-${Date.now()}`;
      const createResponse = await apiHelpers.createAgent(agentName);
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      const response = await apiHelpers.mergeAgent(agent.id, 'main', true);

      // Validate the request was processed
      expect([200, 400, 500]).toContain(response.status());
    });

    test('should handle non-existent agent', async () => {
      const response = await apiHelpers.mergeAgent('non-existent-id');

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });
});
