import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');

function load(file, imports) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const compiled = { exports: {} };
  const localRequire = (id) => (Object.hasOwn(imports, id) ? imports[id] : require(id));
  // Compile only trusted repository source; no user/network strings enter this test loader.
  new Function('require', 'module', 'exports', outputText)(
    localRequire,
    compiled,
    compiled.exports,
  );
  return compiled.exports;
}

const apiPath = '../api/paymentApi';
function storeWith(verification) {
  return load('../model/usePaymentStore.ts', {
    [apiPath]: { paymentApi: { verifyPayment: async () => verification } },
  }).usePaymentStore;
}

test('payment store uses backend payment_status and does not mistake pending for failure', async () => {
  for (const status of ['pending', 'successful', 'failed', 'partial', 'overpaid', 'reversed']) {
    const store = storeWith({
      reference: 'TXN-test',
      amount: 100,
      currency: 'NGN',
      payment_status: status,
    });
    await store.getState().verifyPayment('TXN-test');
    assert.equal(store.getState().paymentStatus, status === 'successful' ? 'success' : status);
  }
});

test('verification unavailability clears old success instead of claiming a failed charge', async () => {
  const store = load('../model/usePaymentStore.ts', {
    [apiPath]: {
      paymentApi: {
        verifyPayment: async () => {
          throw new Error('Unavailable');
        },
      },
    },
  }).usePaymentStore;
  store.setState({ verification: { payment_status: 'successful' }, paymentStatus: 'success' });
  await store.getState().verifyPayment('TXN-test');
  assert.equal(store.getState().verification, null);
  assert.equal(store.getState().paymentStatus, 'unavailable');
});

test('pay action uses the hosted URL without collecting card data or running an SDK', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const imports = {
    '@/shared/ui/button': { Button: (props) => React.createElement('button', props) },
    '@/shared/ui/CurrencyAmount': {
      CurrencyAmount: ({ amount }) => React.createElement('span', null, `NGN ${amount}`),
    },
    '../model/usePaymentStore': { usePaymentStore: () => ({ paymentStatus: 'idle' }) },
    '@/shared/config/env': { env: {} },
  };
  const { PayButton } = load('../ui/PayButton.tsx', imports);
  const html = renderToStaticMarkup(
    React.createElement(PayButton, {
      invoiceId: 'TXN-test',
      amount: 100,
      paymentLink: 'https://pay.xtradot.co/pay/token',
    }),
  );
  assert.match(html, /href="https:\/\/pay.xtradot.co\/pay\/token"/);
  const unavailable = renderToStaticMarkup(
    React.createElement(PayButton, { invoiceId: 'TXN-test', amount: 100, paymentLink: null }),
  );
  assert.match(unavailable, /disabled/);
  assert.doesNotMatch(unavailable, /href=/);
});

test('a receipt cannot be downloaded before a verified sandbox allocation', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { DownloadReceiptButton } = load('../ui/DownloadReceiptButton.tsx', {
    '@/shared/ui/button': { Button: (props) => React.createElement('button', props) },
  });
  assert.match(renderToStaticMarkup(React.createElement(DownloadReceiptButton)), /disabled/);
});

test('payment API loads a persisted invoice by encoded reference', async () => {
  const calls = [];
  const api = load('../api/paymentApi.ts', {
    '@/shared/api/axiosClient': {
      api: {
        get: async (...args) => {
          calls.push(args);
          return { data: { id: 'TXN-test', payment_link: 'https://pay.xtradot.co/pay/token' } };
        },
      },
    },
  }).paymentApi;
  const invoice = await api.getInvoice('TXN-test');
  assert.equal(invoice.payment_link, 'https://pay.xtradot.co/pay/token');
  assert.equal(calls[0][0], '/api/invoices/TXN-test');
});
