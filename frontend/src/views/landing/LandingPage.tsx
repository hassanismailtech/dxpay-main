'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, ArrowUpRight, Check, Minus, Plus } from 'lucide-react';
import { formatNaira } from '@/shared/lib/utils';

const services = [
  { name: 'Full Blood Count', provider: 'Hematology', amount: 7000 },
  { name: 'Liver Function Test', provider: 'Chemistry', amount: 12000 },
  { name: 'Chest X-ray', provider: 'Imaging', amount: 10000 },
];

export const LandingPage = () => {
  const [selected, setSelected] = useState([0, 1]);
  const [view, setView] = useState<'invoice' | 'allocation'>('invoice');
  const total = selected.reduce((sum, index) => sum + services[index].amount, 0);
  const toggle = (index: number) =>
    setSelected((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );

  return (
    <div className="marketing">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header page-width">
        <Link href="/" aria-label="DxPay home" className="brand">
          <Activity aria-hidden="true" />
          <span>
            DxPay<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Website">
          <a href="#workflow">How it works</a>
          <a href="#allocations">Provider allocations</a>
        </nav>
        <Link href="/dashboard" className="nav-action">
          Open dashboard <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>
      <main id="main-content">
        <section className="hero page-width">
          <div className="hero-copy">
            <h1>
              One bill.
              <br />
              Care connected.
            </h1>
            <p>
              Bring diagnostic orders, payments, and provider allocations into one clear workflow.
              Built for care. Accounted for in naira.
            </p>
            <Link href="/dashboard" className="primary-link">
              Open dashboard <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <p className="hero-footnote">
              Access Bank Youth Forge Hackathon prototype.
              <br />
              Sandbox payments only. No live funds.
            </p>
          </div>
          <div className="invoice-stage">
            <div className="invoice-preview" data-ui="invoice-preview">
              <div className="preview-heading">
                <span className="preview-mark">
                  <Activity size={18} aria-hidden="true" />
                  DxPay
                </span>
                <span>Interactive example · NGN</span>
              </div>
              <div className="preview-title">
                <h2>Your diagnostic bill</h2>
                <p>Select services to see one bill come together.</p>
              </div>
              <div className="preview-tabs" aria-label="Example view">
                <button aria-pressed={view === 'invoice'} onClick={() => setView('invoice')}>
                  Unified invoice
                </button>
                <button aria-pressed={view === 'allocation'} onClick={() => setView('allocation')}>
                  Provider allocation
                </button>
              </div>
              {view === 'invoice' ? (
                <div className="preview-services">
                  {services.map((service, index) => (
                    <button
                      key={service.name}
                      className="preview-service"
                      aria-pressed={selected.includes(index)}
                      onClick={() => toggle(index)}
                    >
                      <span
                        className={
                          selected.includes(index) ? 'selection-mark selected' : 'selection-mark'
                        }
                      >
                        {selected.includes(index) ? <Check size={13} /> : <Plus size={13} />}
                      </span>
                      <span>
                        <strong>{service.name}</strong>
                        <small>{service.provider}</small>
                      </span>
                      <span className="preview-amount">{formatNaira(service.amount)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="preview-allocations">
                  {services
                    .filter((_, index) => selected.includes(index))
                    .map((service) => (
                      <div key={service.name}>
                        <span>{service.provider}</span>
                        <strong>{formatNaira(service.amount)}</strong>
                      </div>
                    ))}
                  {!selected.length && <p>No services selected.</p>}
                  <p>Illustrative allocation, not a completed payment.</p>
                </div>
              )}
              <div className="preview-total">
                <span>
                  Total due<strong>{formatNaira(total)}</strong>
                </span>
                <span className="currency-label">NGN</span>
              </div>
              <div className="preview-caption">
                <span className="status-dot" />
                <span>
                  One invoice across{' '}
                  {new Set(selected.map((index) => services[index].provider)).size} departments
                </span>
              </div>
            </div>
          </div>
        </section>
        <section id="workflow" className="workflow-section page-width">
          <div className="section-intro">
            <h2>
              Less payment friction.
              <br />
              More room for care.
            </h2>
            <p>A single diagnostic journey, from the clinician’s order to the provider’s ledger.</p>
          </div>
          <div className="workflow-steps">
            <article>
              <h3>Order together</h3>
              <p>
                Select diagnostic services and create one order, rather than separate bills for each
                department.
              </p>
              <Link href="/terminal">
                Create an order <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Pay once</h3>
              <p>
                Generate an invoice and continue to the configured Forge sandbox checkout. Payment
                status is verified by the backend.
              </p>
              <span>Hosted checkout. Server-side verification.</span>
            </article>
            <article>
              <h3>Keep shares clear</h3>
              <p>
                Record provider allocations only after a matching payment is verified. Keep the
                financial record separate from bank settlement.
              </p>
              <Link href="/dashboard">
                View the ledger <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>
        <section id="allocations" className="allocation-section">
          <div className="page-width allocation-layout">
            <div>
              <h2>
                Every share,
                <br />
                accounted for.
              </h2>
              <p>
                A unified bill should not mean an unclear ledger. DxPay connects each ordered
                service to its provider, so verified payments can be allocated to the right
                department.
              </p>
              <p className="allocation-disclaimer">
                An allocation records a provider’s share. It does not claim money has been paid out.
              </p>
            </div>
            <div className="allocation-example" data-ui="allocation-example">
              <div className="allocation-example-header">
                <h3>Provider allocation</h3>
                <span>Illustrative example</span>
              </div>
              {services.slice(0, 2).map((service) => (
                <div className="allocation-example-row" key={service.name}>
                  <span>
                    {service.provider}
                    <small>{service.name}</small>
                  </span>
                  <strong>{formatNaira(service.amount)}</strong>
                </div>
              ))}
              <div className="allocation-example-total">
                <span>Invoice total</span>
                <strong>{formatNaira(services[0].amount + services[1].amount)}</strong>
              </div>
              <p>
                <Minus size={14} aria-hidden="true" />
                Bank settlement is not connected.
              </p>
            </div>
          </div>
        </section>
        <section className="closing-section page-width">
          <div>
            <h2>Start with one order.</h2>
            <p>Explore the workspace, create an invoice, and follow the payment record.</p>
          </div>
          <Link href="/dashboard" className="primary-link">
            Explore workspace <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="site-footer page-width">
        <Link href="/" className="brand">
          DxPay<span className="brand-dot">.</span>
        </Link>
        <p>Diagnostic payments, connected.</p>
        <span>Hackathon prototype · NGN</span>
      </footer>
    </div>
  );
};
