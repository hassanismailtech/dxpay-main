import { expect, test } from '@playwright/test';

// Synthetic API fixtures: these tests never contact or charge a payment provider.
const invoice = {
  id: 'TXN-BROWSER-TEST',
  invoice_number: 'TXN-BROWSER-TEST',
  patient_name: 'Sandbox patient',
  provider_name: 'Test laboratory',
  date: '2026-11-10T10:30:00Z',
  tests: [{ name: 'Full Blood Count', price: 7000 }],
  subtotal: 7000,
  total: 7000,
  currency: 'NGN',
  payment_status: 'pending',
  payment_link: 'https://pay.xtradot.co/pay/browser-fixture',
};

test('invoice reloads by reference without workspace chrome and has a readable hosted payment action', async ({
  page,
}) => {
  await page.route('**/api/invoices/TXN-BROWSER-TEST', (route) => route.fulfill({ json: invoice }));
  await page.goto('/pay/TXN-BROWSER-TEST');
  const pay = page.getByRole('link', { name: 'Pay ₦7,000.00', exact: true });
  await expect(pay).toHaveAttribute('href', invoice.payment_link);
  await expect(page.getByRole('navigation', { name: 'Workspace' })).toHaveCount(0);
  expect(await pay.locator('span').evaluate((span) => getComputedStyle(span).color)).toBe(
    await pay.evaluate((link) => getComputedStyle(link).color),
  );
  await page.reload();
  await expect(page.getByText('Sandbox patient', { exact: true })).toBeVisible();
  await expect(pay).toBeVisible();
});

test('untrusted checkout URLs cannot become payment actions', async ({ page }) => {
  await page.route('**/api/invoices/TXN-BROWSER-TEST', (route) =>
    route.fulfill({ json: { ...invoice, payment_link: 'https://untrusted.invalid/pay/fixture' } }),
  );
  await page.goto('/pay/TXN-BROWSER-TEST');
  await expect(page.getByRole('button', { name: 'Checkout unavailable' })).toBeDisabled();
  await expect(page.getByRole('link', { name: /^Pay ₦/ })).toHaveCount(0);
});
