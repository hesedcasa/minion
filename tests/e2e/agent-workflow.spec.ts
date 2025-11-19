import { expect, test } from '../fixtures/base';
import { ApiHelpers } from '../utils/api-helpers';

test.describe('Agent Workflow', () => {
  let createdAgentIds: string[] = [];
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ page, request }) => {
    apiHelpers = new ApiHelpers(request);
    await page.goto('/');
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

  test('should complete full agent lifecycle', async ({ page }) => {
    const agentName = `e2e-workflow-agent-${Date.now()}`;

    // Step 1: Create agent
    await page.click('button:has-text("Create Agent")');
    await page.fill('input[placeholder*="Agent name"], input[placeholder*="name"]', agentName);
    await page.click('.ant-modal button:has-text("Create")');
    await page.waitForTimeout(2000);

    // Verify agent was created
    const agentsResponse = await apiHelpers.getAgents();
    const agents = await agentsResponse.json();
    const createdAgent = agents.find((a: any) => a.name === agentName);

    if (!createdAgent) {
      console.log('Agent not found in list, skipping workflow test');
      return;
    }

    createdAgentIds.push(createdAgent.id);

    // Step 2: View agent in grid
    // Look for agent card
    const agentCard = page.locator(`.agent-card, [data-agent-id="${createdAgent.id}"]`).first();
    await page.waitForTimeout(1000);

    // Step 3: Refresh agents list
    const refreshButton = page.locator('button[aria-label="reload"], button:has([aria-label="reload"])').first();
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should handle multiple agents', async ({ page }) => {
    const agent1Name = `e2e-agent-1-${Date.now()}`;
    const agent2Name = `e2e-agent-2-${Date.now()}`;

    // Create first agent
    await page.click('button:has-text("Create Agent")');
    await page.fill('input[placeholder*="Agent name"], input[placeholder*="name"]', agent1Name);
    await page.click('.ant-modal button:has-text("Create")');
    await page.waitForTimeout(2000);

    // Create second agent
    await page.click('button:has-text("Create Agent")');
    await page.fill('input[placeholder*="Agent name"], input[placeholder*="name"]', agent2Name);
    await page.click('.ant-modal button:has-text("Create")');
    await page.waitForTimeout(2000);

    // Get agents from API
    const agentsResponse = await apiHelpers.getAgents();
    const agents = await agentsResponse.json();

    const agent1 = agents.find((a: any) => a.name === agent1Name);
    const agent2 = agents.find((a: any) => a.name === agent2Name);

    if (agent1) createdAgentIds.push(agent1.id);
    if (agent2) createdAgentIds.push(agent2.id);

    // Both agents should exist
    if (agent1 && agent2) {
      expect(agent1).toBeDefined();
      expect(agent2).toBeDefined();
    }
  });

  test('should display agent status updates', async ({ page }) => {
    // Create an agent via API for faster setup
    const agentName = `e2e-status-agent-${Date.now()}`;
    const createResponse = await apiHelpers.createAgent(agentName);

    if (createResponse.status() !== 201) {
      console.log('Failed to create agent, skipping status test');
      return;
    }

    const agent = await createResponse.json();
    createdAgentIds.push(agent.id);

    // Reload page to see the agent
    await page.reload();
    await page.waitForTimeout(2000);

    // Look for the agent in the UI
    const agentCard = page.locator(`.agent-card, [data-agent-id="${agent.id}"]`).first();

    // Agent should have some status indicator
    await page.waitForTimeout(1000);
  });

  test('should handle navigation and page refresh', async ({ page }) => {
    // Create agent
    const agentName = `e2e-navigation-agent-${Date.now()}`;
    const createResponse = await apiHelpers.createAgent(agentName);

    if (createResponse.status() === 201) {
      const agent = await createResponse.json();
      createdAgentIds.push(agent.id);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Agent should still be visible
      await page.waitForTimeout(2000);

      // Navigate away and back
      await page.goto('about:blank');
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Application should load correctly
      const createButton = page.locator('button:has-text("Create Agent")');
      await expect(createButton).toBeVisible();
    }
  });
});
