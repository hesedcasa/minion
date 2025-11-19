# Playwright Test Suite for Minion

This directory contains the comprehensive Playwright test suite for the Minion project, covering both API endpoints and end-to-end UI testing.

## 📁 Test Structure

```
tests/
├── api/              # API endpoint tests
│   ├── health.spec.ts
│   ├── agents.spec.ts
│   ├── tasks.spec.ts
│   └── workspaces.spec.ts
├── e2e/              # End-to-end UI tests
│   ├── app-layout.spec.ts
│   ├── create-agent.spec.ts
│   ├── websocket.spec.ts
│   ├── theme.spec.ts
│   └── agent-workflow.spec.ts
├── fixtures/         # Test fixtures and base configuration
│   └── base.ts
├── utils/           # Test utilities and helpers
│   ├── api-helpers.ts
│   └── ui-helpers.ts
└── README.md        # This file
```

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run API tests only
```bash
npm run test:api
```

### Run E2E tests only
```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

### Open Playwright UI Mode
```bash
npm run test:ui
```

### View test report
```bash
npm run test:report
```

### Generate tests with Codegen
```bash
npm run test:codegen
```

## 📝 Test Categories

### API Tests (`tests/api/`)

Test the Express REST API endpoints:

- **Health Endpoint** (`health.spec.ts`)
  - Server health checks
  - Response format validation

- **Agents API** (`agents.spec.ts`)
  - Creating agents
  - Listing agents
  - Getting agent details
  - Deleting agents
  - Error handling

- **Tasks API** (`tasks.spec.ts`)
  - Assigning tasks to agents
  - Listing agent tasks
  - Stopping agents
  - Validation and error handling

- **Workspaces API** (`workspaces.spec.ts`)
  - Listing workspaces
  - Getting diffs
  - Merging changes
  - Git operations

### E2E Tests (`tests/e2e/`)

Test the React UI and user workflows:

- **Application Layout** (`app-layout.spec.ts`)
  - Page loading
  - Header and sidebar visibility
  - Responsive design
  - Empty state

- **Create Agent** (`create-agent.spec.ts`)
  - Modal interactions
  - Form validation
  - Agent creation flow
  - Error handling

- **WebSocket** (`websocket.spec.ts`)
  - Connection establishment
  - Real-time updates
  - Reconnection handling

- **Theme** (`theme.spec.ts`)
  - Theme toggling
  - Persistence
  - CSS class application

- **Agent Workflow** (`agent-workflow.spec.ts`)
  - Complete agent lifecycle
  - Multiple agents
  - Status updates
  - Navigation

## 🛠️ Test Utilities

### API Helpers (`utils/api-helpers.ts`)

Helper class for making API requests in tests:

```typescript
const apiHelpers = new ApiHelpers(request);
await apiHelpers.createAgent('agent-name');
await apiHelpers.assignTask('agent-id', 'description');
```

### UI Helpers (`utils/ui-helpers.ts`)

Helper class for common UI interactions:

```typescript
const uiHelpers = new UiHelpers(page);
await uiHelpers.createAgent('agent-name');
await uiHelpers.assignTask('agent-id', 'description');
```

## 🔧 Configuration

Test configuration is in `playwright.config.ts` at the project root.

Key settings:
- **Browser**: Chromium (can be extended to Firefox, WebKit)
- **Base URL**: `http://localhost:3000`
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Web Server**: Automatically starts the application before tests

## 📊 CI/CD Integration

Tests run automatically on GitHub Actions for:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

The workflow is defined in `.github/workflows/playwright.yml`.

Features:
- Parallel execution with sharding
- Artifact uploads for reports and traces
- Automatic browser installation

## 🧪 Writing New Tests

### API Test Example

```typescript
import { expect, test } from '../fixtures/base';
import { ApiHelpers } from '../utils/api-helpers';

test.describe('My API Tests', () => {
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ request }) => {
    apiHelpers = new ApiHelpers(request);
  });

  test('should do something', async () => {
    const response = await apiHelpers.checkHealth();
    expect(response.ok()).toBeTruthy();
  });
});
```

### E2E Test Example

```typescript
import { expect, test } from '../fixtures/base';

test.describe('My E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should interact with UI', async ({ page }) => {
    await page.click('button:has-text("Click Me")');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## 🐛 Debugging Tests

### Using Debug Mode

```bash
npm run test:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Inspect locators
- View console logs
- See screenshots

### Using UI Mode

```bash
npm run test:ui
```

This opens Playwright UI where you can:
- See all tests in a browser
- Run tests individually
- Watch mode
- Time travel debugging

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots (on failure)
- Videos (on failure)
- Traces (on retry)

Find them in `test-results/` directory.

## 📚 Best Practices

1. **Use test fixtures** - Extend base test for common setup
2. **Clean up after tests** - Remove created agents in `afterEach`
3. **Use meaningful test names** - Describe what the test validates
4. **Keep tests isolated** - Each test should be independent
5. **Use Page Object Model** - Utilize helper classes for common actions
6. **Wait for conditions** - Use `waitFor` instead of fixed timeouts
7. **Test user flows** - Focus on what users actually do
8. **Handle async properly** - Use `await` for all Playwright operations

## 🔍 Troubleshooting

### Tests timing out
- Check if the server is starting correctly
- Increase timeout in `playwright.config.ts`
- Check network conditions

### Flaky tests
- Use proper wait conditions instead of fixed timeouts
- Ensure tests are isolated and don't depend on each other
- Check for race conditions in the application

### Browser not launching
- Run `npx playwright install` to install browsers
- Check system dependencies with `npx playwright install --with-deps`

## 📖 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [API Testing Guide](https://playwright.dev/docs/api-testing)
- [Debugging Guide](https://playwright.dev/docs/debug)
