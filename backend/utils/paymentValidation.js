// Forge amounts are NGN major units with at most two decimal places.
function amountInKobo(value) {
  if (!['string', 'number'].includes(typeof value)) return null;
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const kobo = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(kobo) && kobo > 0 ? kobo : null;
}

function validReference(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,254}$/.test(value);
}

function validatedPayment(envelope, transaction) {
  const payment = envelope?.data;
  const statuses = ['pending', 'successful', 'failed', 'partial', 'overpaid', 'reversed'];
  if (envelope?.status !== 'success' || !payment || !statuses.includes(payment.status)) {
    throw new Error('Invalid sandbox verification response.');
  }
  if (payment.reference !== transaction.transaction_reference || payment.currency !== 'NGN') {
    throw new Error('Sandbox payment identity does not match this invoice.');
  }
  const amount = amountInKobo(payment.amount);
  if (amount === null || amount !== amountInKobo(transaction.amount)) {
    throw new Error('Sandbox payment amount does not match this invoice.');
  }
  return payment;
}

function hostedPaymentUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'pay.xtradot.co' &&
      !url.username &&
      !url.password &&
      !url.port &&
      /^\/pay\/[^/]+$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

module.exports = { amountInKobo, validReference, validatedPayment, hostedPaymentUrl };
