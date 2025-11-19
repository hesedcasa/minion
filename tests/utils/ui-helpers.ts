import type { Page } from '@playwright/test';

/**
 * Helper functions for UI testing
 */

export class UiHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the app to be loaded
   */
  async waitForAppLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open create agent modal
   */
  async openCreateAgentModal() {
    await this.page.click('button:has-text("Create Agent")');
    await this.page.waitForSelector('.ant-modal', { state: 'visible' });
  }

  /**
   * Create an agent via UI
   */
  async createAgent(name: string, apiKey?: string) {
    await this.openCreateAgentModal();
    await this.page.fill('input[placeholder="Agent name"]', name);

    if (apiKey) {
      await this.page.fill('input[placeholder="API Key (optional)"]', apiKey);
    }

    await this.page.click('.ant-modal button:has-text("Create")');
    await this.page.waitForSelector('.ant-modal', { state: 'hidden' });
  }

  /**
   * Assign a task to an agent via UI
   */
  async assignTask(agentId: string, description: string, context?: string) {
    // Click assign task button for the specific agent
    await this.page.click(`[data-agent-id="${agentId}"] button:has-text("Assign Task")`);
    await this.page.waitForSelector('.ant-modal', { state: 'visible' });

    // Fill task description
    await this.page.fill('textarea[placeholder*="task description"]', description);

    if (context) {
      await this.page.fill('textarea[placeholder*="context"]', context);
    }

    await this.page.click('.ant-modal button:has-text("Assign")');
    await this.page.waitForSelector('.ant-modal', { state: 'hidden' });
  }

  /**
   * View diff for an agent
   */
  async viewDiff(agentId: string) {
    await this.page.click(`[data-agent-id="${agentId}"] button:has-text("View Diff")`);
    await this.page.waitForSelector('.ant-modal', { state: 'visible' });
  }

  /**
   * Stop an agent
   */
  async stopAgent(agentId: string) {
    await this.page.click(`[data-agent-id="${agentId}"] button:has-text("Stop")`);
    // Confirm the modal
    await this.page.waitForSelector('.ant-modal-confirm', { state: 'visible' });
    await this.page.click('.ant-modal-confirm button:has-text("Stop")');
  }

  /**
   * Remove an agent
   */
  async removeAgent(agentId: string) {
    await this.page.click(`[data-agent-id="${agentId}"] button:has-text("Remove")`);
    // Confirm the modal
    await this.page.waitForSelector('.ant-modal-confirm', { state: 'visible' });
    await this.page.click('.ant-modal-confirm button:has-text("Remove")');
  }

  /**
   * Get agent count
   */
  async getAgentCount() {
    const agents = await this.page.locator('.agent-card').count();
    return agents;
  }

  /**
   * Wait for WebSocket connection
   */
  async waitForWebSocketConnection() {
    // Wait for the connection indicator to show connected
    await this.page.waitForSelector('[data-testid="connection-status"][data-connected="true"]', {
      timeout: 10000,
    });
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible() {
    return await this.page.isVisible('.empty-state');
  }

  /**
   * Toggle theme
   */
  async toggleTheme() {
    await this.page.click('[data-testid="theme-toggle"]');
  }
}
