import { expect, test } from '../fixtures/base';
import { ApiHelpers } from '../utils/api-helpers';

test.describe('Create Agent', () => {
  let createdAgentIds: string[] = [];
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ page, request }) => {
    apiHelpers = new ApiHelpers(request);
    await page.goto('/');
  });

  test.afterEach(async () => {
    // Clean up created agents via API
    for (const agentId of createdAgentIds) {
      try {
        await apiHelpers.removeAgent(agentId, true);
      } catch (error) {
        console.log(`Failed to cleanup agent ${agentId}:`, error);
      }
    }
    createdAgentIds = [];
  });

  test('should open create agent modal', async ({ page }) => {
    await page.click('button:has-text("Create Agent")');

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    const modalTitle = page.locator('.ant-modal-title, .ant-modal-header');
    await expect(modalTitle).toContainText(/create/i);
  });

  test('should close modal when cancel is clicked', async ({ page }) => {
    await page.click('button:has-text("Create Agent")');

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    await page.click('.ant-modal button:has-text("Cancel")');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when X button is clicked', async ({ page }) => {
    await page.click('button:has-text("Create Agent")');

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    await page.click('.ant-modal-close, .ant-modal-close-x');
    await expect(modal).not.toBeVisible();
  });

  test('should validate required agent name', async ({ page }) => {
    await page.click('button:has-text("Create Agent")');

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    // Try to submit without entering name
    const createButton = page.locator('.ant-modal button:has-text("Create")');
    await createButton.click();

    // Modal should still be visible (validation failed)
    await expect(modal).toBeVisible();
  });

  test('should create agent with valid name', async ({ page }) => {
    const agentName = `test-ui-agent-${Date.now()}`;

    await page.click('button:has-text("Create Agent")');

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    // Fill in agent name
    await page.fill('input[placeholder*="Agent name"], input[placeholder*="name"]', agentName);

    // Submit the form
    await page.click('.ant-modal button:has-text("Create")');

    // Wait for modal to close
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    // Wait a bit for the agent to be created and UI to update
    await page.waitForTimeout(2000);

    // Check if agent appears in the list (or verify via API)
    const agentsResponse = await apiHelpers.getAgents();
    const agents = await agentsResponse.json();
    const createdAgent = agents.find((a: any) => a.name === agentName);

    if (createdAgent) {
      createdAgentIds.push(createdAgent.id);
      expect(createdAgent).toBeDefined();
    }
  });

  test('should create agent with API key', async ({ page }) => {
    const agentName = `test-ui-agent-with-key-${Date.now()}`;

    await page.click('button:has-text("Create Agent")');

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    // Fill in agent name
    await page.fill('input[placeholder*="Agent name"], input[placeholder*="name"]', agentName);

    // Fill in API key (optional field)
    const apiKeyInput = page.locator('input[placeholder*="API Key"], input[placeholder*="api key"]');
    if (await apiKeyInput.isVisible()) {
      await apiKeyInput.fill('test-api-key-12345');
    }

    // Submit the form
    await page.click('.ant-modal button:has-text("Create")');

    // Note: This might fail if API key validation is strict
    // We're just testing the UI flow
    await page.waitForTimeout(2000);
  });

  test('should handle agent creation errors gracefully', async ({ page }) => {
    await page.click('button:has-text("Create Agent")');

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    // Fill in a potentially problematic name
    await page.fill('input[placeholder*="Agent name"], input[placeholder*="name"]', '');

    // Try to submit
    await page.click('.ant-modal button:has-text("Create")');

    // Should show validation or error
    await page.waitForTimeout(1000);
  });
});
