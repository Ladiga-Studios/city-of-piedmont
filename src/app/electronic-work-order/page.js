import '../pages.css';
import './work-order.css';
import WorkOrderForm from './WorkOrderForm';

// ------------------------------------------------------------------
// INTERNAL PAGE — Electronic Work Order
// Used by the Mayor, Council, Administration Office, and Police Dept.
// Deliberately unlisted: not in the nav, not in the sitemap, and
// marked noindex below so search engines skip it. Anyone with the
// URL can open it (same as the old Google Form setup).
// Submissions email to payments@piedmontcity.org via /api/work-order.
// ------------------------------------------------------------------

export const metadata = {
  title: 'Electronic Work Order',
  description: 'Internal work order submission form for City of Piedmont staff and officials.',
  robots: { index: false, follow: false },
};

export default function ElectronicWorkOrderPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <div className="hero-text-col">
            <p className="eyebrow">City Staff &amp; Officials</p>
            <h1>Electronic Work Order</h1>
            <p>
              Submit a work order to the appropriate city department. Submissions go to the
              Administration Office for routing. This form is for the Mayor, City Council,
              Administration Office, and Police Department — it is not a public request form.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container wo-wrap">
          <WorkOrderForm />
        </div>
      </section>
    </>
  );
}
