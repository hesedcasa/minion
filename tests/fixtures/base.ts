import { test as base } from '@playwright/test';

/**
 * Custom test fixture with common utilities
 */
export const test = base.extend({
  /**
   * API context for making API requests
   */
  apiContext: async ({ request }, use) => {
    await use(request);
  },
});

export { expect } from '@playwright/test';
