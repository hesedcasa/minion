import { expect, test } from '../fixtures/base';
import { ApiHelpers } from '../utils/api-helpers';

test.describe('Health Endpoint', () => {
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ request }) => {
    apiHelpers = new ApiHelpers(request);
  });

  test('should return 200 status and ok status', async () => {
    const response = await apiHelpers.checkHealth();

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
  });

  test('should return timestamp in valid format', async () => {
    const response = await apiHelpers.checkHealth();
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});
