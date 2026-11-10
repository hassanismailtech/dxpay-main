// Offline browser regression: every API response is an explicit synthetic fixture.
// No checkout is submitted and no bank endpoint is contacted.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const reference = 'TXN-isolated-browser-test';
  let status = 'pending';
  let unavailable = false;
  await page.route('**/api/invoices/**', (route) =>
    route.fulfill({
      json: {
        id: reference,
        invoice_number: reference,
        patient_name: 'Sandbox Patient',
        provider_name: 'Sandbox Lab',
        date: '2026-11-10T12:00:00Z',
        tests: [{ name: 'Synthetic diagnostic test', price: 100 }],
        subtotal: 100,
        total: 100,
        currency: 'NGN',
        payment_status: 'pending',
        payment_link: 'https://pay.xtradot.co/pay/isolated-browser-token',
      },
    }),
  );
  await page.route('**/api/payment/verify?**', (route) =>
    route.fulfill({
      status: unavailable ? 502 : 200,
      json: unavailable
        ? { error: 'Isolated provider unavailable' }
        : {
            reference,
            amount: 100,
            currency: 'NGN',
            payment_status: status,
            ...(status === 'successful' ? { allocation_status: 'allocated' } : {}),
          },
    }),
  );
  const base = process.env.PAYMENT_TEST_ORIGIN || 'http://localhost:3103';
  await page.goto(`${base}/pay/${reference}`);
  const pay = page.getByRole('link', { name: /Pay.*100/ });
  await pay.waitFor();
  assert.equal(await pay.getAttribute('href'), 'https://pay.xtradot.co/pay/isolated-browser-token');
  await page.reload();
  await pay.waitFor();
  assert.ok(await page.getByText('Sandbox Patient', { exact: true }).isVisible());
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.getByRole('link', { name: 'Check payment status' }).click();
  await page.getByRole('status').filter({ hasText: 'Payment status: pending' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Download Receipt' }).count(), 0);
  status = 'successful';
  await page.getByRole('button', { name: 'Check again' }).click();
  await page.getByRole('button', { name: 'Download Receipt' }).waitFor();
  assert.ok(await page.getByRole('status').filter({ hasText: 'recorded locally' }).isVisible());
  unavailable = true;
  await page.reload();
  await page.getByRole('status').filter({ hasText: 'Verification is unavailable' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Download Receipt' }).count(), 0);
  assert.ok(await page.getByRole('button', { name: 'Check again' }).isEnabled());
  console.log(
    'PASS: invoice survives reload; hosted URL preserved; pending cannot issue receipt; retry confirms allocation; provider outage cannot retain success; mobile has no overflow.',
  );
} finally {
  await browser.close();
}
