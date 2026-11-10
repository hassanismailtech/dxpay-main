import { test, expect } from '@playwright/test';

// Synthetic catalogue fixtures only. All API requests are intercepted.
const catalog = [
  { id: 101, name: 'Full Blood Count', price: 6200, provider_id: 1 },
  { id: 102, name: 'Fasting Blood Sugar', price: 2800, provider_id: 1 },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 503, json: { error: 'Synthetic test: unexpected API request' } }),
  );
});

test('catalogue failure is recoverable without fallback prices', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/tests', (route) => {
    attempts += 1;
    return route.fulfill(
      attempts === 1
        ? { status: 503, json: { error: 'Catalogue temporarily unavailable' } }
        : { json: catalog },
    );
  });
  await page.goto('/terminal');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Catalogue temporarily unavailable' }),
  ).toContainText('Catalogue temporarily unavailable');
  await expect(page.getByRole('button', { name: /Quick add/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry catalogue' }).click();
  await expect(
    page.getByRole('button', { name: 'Quick add Full Blood Count', exact: true }),
  ).toBeVisible();
});

test('fulfillment reports unavailable integration instead of fabricated paid orders', async ({
  page,
}) => {
  await page.goto('/tech');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fulfillment');
  await expect(page.getByRole('status')).toContainText('Fulfillment is not connected');
  await expect(page.getByText('ORD-2024-001', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toHaveCount(0);
});

test('checkout errors remain recoverable and submit one id per selected test', async ({ page }) => {
  await page.route('**/api/tests', (route) => route.fulfill({ json: catalog }));
  let orders = 0;
  let reference = 'DEMO-002';
  await page.route('**/api/orders', async (route) => {
    orders += 1;
    expect(route.request().postDataJSON()).toEqual({ patient_name: reference, test_ids: [101] });
    await route.fulfill({ json: { id: 'synthetic-order-1', order_id: 'synthetic-order-1' } });
  });
  await page.route('**/api/invoices', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ order_id: 'synthetic-order-1' });
    await route.fulfill({ status: 503, json: { error: 'Synthetic checkout unavailable' } });
  });
  await page.goto('/terminal');
  await page.getByRole('button', { name: 'Quick add Full Blood Count', exact: true }).click();
  await page.getByLabel('Patient reference', { exact: true }).fill('DEMO-002');
  const submit = page.getByRole('button', { name: 'Continue to secure checkout' });
  await submit.click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Synthetic checkout unavailable' }),
  ).toBeVisible();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(submit).toBeEnabled();
  expect(orders).toBe(1);
  reference = 'DEMO-003';
  await page.getByLabel('Patient reference', { exact: true }).fill(reference);
  await submit.click();
  await expect(submit).toBeEnabled();
  expect(orders).toBe(2);
});

test('terminal keeps its title and content inside desktop tablet and mobile viewports', async ({
  page,
}, testInfo) => {
  await page.route('**/api/tests', (route) => route.fulfill({ json: catalog }));
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/terminal');
    await expect(page.getByRole('heading', { level: 1, name: 'Order terminal' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Quick add Full Blood Count', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`terminal-${width}.png`), fullPage: true });
  }
  await page.goto('/tech');
  await expect(page.getByRole('status')).toContainText('Fulfillment is not connected');
  await page.screenshot({ path: testInfo.outputPath('fulfillment-390.png'), fullPage: true });
});

test('quick add selects the exact catalogue test once and totals server prices', async ({
  page,
}) => {
  await page.route('**/api/tests', (route) => route.fulfill({ json: catalog }));
  await page.goto('/terminal');
  await page.getByRole('button', { name: 'Quick add Fasting Blood Sugar', exact: true }).click();
  const summary = page.getByRole('region', { name: 'Order summary' });
  await expect(summary.getByText('Fasting Blood Sugar', { exact: true })).toBeVisible();
  await expect(summary.getByText('Full Blood Count', { exact: true })).toHaveCount(0);
  await expect(summary.getByTestId('order-total')).toContainText('2,800');
  await expect(
    page.getByRole('button', { name: 'Quick add Fasting Blood Sugar', exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole('button', { name: /increase|decrease/i })).toHaveCount(0);
  await page.getByRole('button', { name: 'Add Full Blood Count', exact: true }).click();
  await expect(summary.getByTestId('order-total')).toContainText('9,000');
  await page.getByRole('button', { name: 'Remove Full Blood Count', exact: true }).click();
  await expect(summary.getByTestId('order-total')).toContainText('2,800');
  await page.getByLabel('Search tests').fill('no matching test');
  await expect(page.getByText('No tests match your search.', { exact: true })).toBeVisible();
  await expect(summary.getByTestId('order-total')).toContainText('2,800');
  await page.getByLabel('Patient reference', { exact: true }).fill('DEMO-001');
  await page.getByRole('button', { name: 'Clear order', exact: true }).click();
  await expect(page.getByLabel('Patient reference', { exact: true })).toHaveValue('');
  await expect(summary.getByTestId('order-total')).toContainText('0.00');
});
