const test = require('node:test');
const assert = require('node:assert/strict');
const { validatedPayment } = require('../utils/paymentValidation');

// Participant API Specification v2 (9 November 2026), Collections / Verify a payment.
// Contract fixture, not a captured sandbox response. Common conventions specify NGN major units.
const verification = {
  status: 'success',
  data: {
    reference: 'COL-20261109-0007',
    status: 'successful',
    amount: 15000.00,
    amount_paid: 15000.00,
    channel: 'card',
    customer: { name: 'Babatunde Olumide Adeyemi', email: 'tunde.adeyemi@example.ng' },
    merchant_fee: 225.00,
    settlement_amount: 14775.00,
    paid_at: '2026-11-09T11:47:18Z',
    metadata: { order_id: 'ORD-88213' },
  },
};
const transaction = { transaction_reference: 'COL-20261109-0007', amount: '15000.00' };

test('documented verify fixture accepts omitted currency under the NGN endpoint contract', () => {
  assert.equal(validatedPayment(verification, transaction), verification.data);
  assert.equal(Object.hasOwn(verification.data, 'currency'), false);
});
