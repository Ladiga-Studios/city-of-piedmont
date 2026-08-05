import '../pages.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'The terms and conditions for using the City of Piedmont, Alabama website.',
};

const UPDATED = 'June 30, 2026';

export default function TermsConditions() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <span>Terms &amp; Conditions</span>
          </nav>
          <p className="eyebrow">Legal</p>
          <h1>Terms &amp; Conditions</h1>
          <p>The terms for using the City of Piedmont website.</p>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <p className="legal-updated">Last updated: {UPDATED}</p>

          <p>
            Welcome to the City of Piedmont, Alabama website. By using this site you agree
            to these terms. If you do not agree, please do not use the site.
          </p>

          <h2>Use of this website</h2>
          <p>
            This site is provided for general information about the City of Piedmont and its
            services. You agree to use it lawfully and not to interfere with its operation,
            security, or other people&rsquo;s use of it.
          </p>

          <h2>Accuracy of information</h2>
          <p>
            We work to keep information on this site current and correct, but we cannot
            guarantee it is always complete, accurate, or up to date. Dates, fees, hours,
            schedules, and contact details can change. For official or time-sensitive
            matters, please confirm directly with the relevant city department before
            relying on what you read here.
          </p>

          <h2>Links to other sites</h2>
          <p>
            This site links to third-party websites, such as the online payment
            portal, state and county resources, and local businesses in our directory. We
            provide those links for convenience and do not control or endorse those sites.
            Their content and their own terms and privacy policies are their responsibility,
            not the City&rsquo;s.
          </p>

          <h2>Online payments</h2>
          <p>
            Bill payments are processed by a third-party provider, not on this website. Any
            payment you make is governed by that provider&rsquo;s terms. Please review them
            before completing a transaction.
          </p>

          <h2>Business directory</h2>
          <p>
            Listings in the local business directory are provided as a community resource. A
            listing is not an endorsement by the City, and the City is not responsible for
            the goods, services, or conduct of any listed business.
          </p>

          <h2>Intellectual property</h2>
          <p>
            The City seal, name, and the content on this site are the property of the City of
            Piedmont or its licensors. You may view and print pages for personal,
            non-commercial use. Please do not reuse the city seal or branding in a way that
            suggests official affiliation without permission.
          </p>

          <h2>No warranty &amp; limitation of liability</h2>
          <p>
            This website is provided &ldquo;as is&rdquo; without warranties of any kind. To
            the fullest extent allowed by law, the City is not liable for any loss or damage
            arising from your use of, or inability to use, this site or any site it links to.
          </p>

          <h2>Changes to these terms</h2>
          <p>We may update these terms from time to time. The &ldquo;last updated&rdquo; date above shows when they last changed.</p>

          <h2>Contact us</h2>
          <p>
            Questions about these terms? Reach the City at{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or{' '}
            <a href={SITE.phoneHref}>{SITE.phone}</a>, or visit our{' '}
            <Link href="/contact">contact page</Link>.
          </p>

          <p className="legal-disclaimer">
            This page is provided for general information and is not legal advice. The City
            may adapt these terms to fit its specific needs.
          </p>
        </div>
      </section>
    </>
  );
}
