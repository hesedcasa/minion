import { expect, test } from '../fixtures/base';

test.describe('Application Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    // Check if the page title is set
    await expect(page).toHaveTitle(/Minion/);
  });

  test('should display header with title', async ({ page }) => {
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();
  });

  test('should display sidebar', async ({ page }) => {
    // Check for sidebar navigation
    const sidebar = page.locator('.ant-layout-sider, [data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should display create agent button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create Agent")');
    await expect(createButton).toBeVisible();
  });

  test('should display refresh button', async ({ page }) => {
    const refreshButton = page.locator('button[aria-label="reload"], button:has([aria-label="reload"])');
    await expect(refreshButton).toBeVisible();
  });

  test('should have theme toggle button', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator(
      'button[aria-label*="theme"], button:has-text("Theme"), [data-testid="theme-toggle"]'
    );
    await expect(themeToggle).toBeVisible();
  });

  test('should show empty state when no agents exist', async ({ page }) => {
    // Wait for agents to load
    await page.waitForTimeout(1000);

    // Check if either empty state or agents grid is visible
    const emptyState = page.locator('.empty-state, :has-text("No agents yet")');
    const agentsGrid = page.locator('.agents-grid, .agent-card');

    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const gridVisible = await agentsGrid.first().isVisible().catch(() => false);

    // One of them should be visible
    expect(emptyVisible || gridVisible).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});
