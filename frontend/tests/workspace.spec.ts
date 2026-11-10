import { expect, test } from '@playwright/test';

test('public landing routes to dashboard without workspace navigation', async ({ page }) => {
  await page.route('**/api/dashboard?*', (route) =>
    route.fulfill({ json: { total_revenue: 0, number_of_tests: 0, transactions: [] } }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Workspace' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Open dashboard', exact: true }).first().click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('link', { name: 'Create order', exact: true }).last()).toBeVisible();
});

test('invoice example recalculates naira totals and provider shares', async ({ page }) => {
  await page.goto('/');
  const example = page.locator('[data-ui="invoice-preview"]');
  await expect(example.locator('.preview-total strong')).toHaveText('₦19,000.00');
  await example.getByRole('button', { name: /Chest X-ray/ }).click();
  await expect(example.locator('.preview-total strong')).toHaveText('₦29,000.00');
  await example.getByRole('button', { name: 'Provider allocation', exact: true }).click();
  await expect(example.getByText('Imaging', { exact: true })).toBeVisible();
  await expect(
    example.getByText('Illustrative allocation, not a completed payment.'),
  ).toBeVisible();
});

test('ledger displays provider revenue with naira precision and transaction date', async ({
  page,
}) => {
  await page.route('**/api/dashboard?*', (route) =>
    route.fulfill({
      json: {
        total_revenue: 7000,
        number_of_tests: 1,
        transactions: [
          {
            transaction_id: 'TXN-TEST-1',
            patient_name: 'Sandbox patient',
            revenue_share: 7000,
            created_at: '2026-11-10T10:30:00Z',
          },
        ],
      },
    }),
  );
  await page.goto('/dashboard');
  const ledger = page.getByRole('region', { name: 'Transaction ledger' });
  await expect(ledger.getByText('₦7,000.00')).toBeVisible();
  await expect(ledger.getByText(/10 Nov 2026/)).toBeVisible();
  await expect(ledger.getByText('Sandbox patient')).toBeVisible();
});

test('dashboard failure is recoverable and never displays fabricated revenue', async ({ page }) => {
  let failing = true;
  await page.route('**/api/dashboard?*', (route) =>
    route.fulfill(
      failing
        ? { status: 503, json: { error: 'Database is unavailable.' } }
        : { json: { total_revenue: 0, number_of_tests: 0, transactions: [] } },
    ),
  );
  await page.goto('/dashboard');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Payment data is unavailable' }),
  ).toContainText('Database is unavailable.');
  await expect(page.getByText('₦0.00', { exact: true })).toHaveCount(0);
  failing = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByText('₦0.00', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Transaction ledger' })).toContainText(
    'No verified payments yet.',
  );
});

for (const width of [390, 768, 1440]) {
  test(`public and workspace screens fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/api/dashboard?*', (route) =>
      route.fulfill({ json: { total_revenue: 0, number_of_tests: 0, transactions: [] } }),
    );
    for (const route of ['/', '/dashboard']) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      if (route === '/dashboard' && width < 1100)
        await expect(page.getByRole('navigation', { name: 'Mobile workspace' })).toBeVisible();
    }
  });
}
