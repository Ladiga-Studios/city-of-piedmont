import '../pages.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How the City of Piedmont, Alabama collects, uses, and protects information on this website.',
};

const UPDATED = 'June 30, 2026';

export default function PrivacyPolicy() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <span>Privacy Policy</span>
          </nav>
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p>How we handle information you share with the City of Piedmont through this website.</p>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <p className="legal-updated">Last updated: {UPDATED}</p>

          <p>
            The City of Piedmont, Alabama (&ldquo;the City,&rdquo; &ldquo;we,&rdquo; or
            &ldquo;us&rdquo;) respects your privacy. This policy explains what information
            this website collects, how we use it, and the choices you have. It applies to
            this website only and not to other sites we link to.
          </p>

          <h2>Information we collect</h2>
          <p>We try to collect as little personal information as possible. Depending on how you use the site, that may include:</p>
          <ul>
            <li><strong>Information you give us.</strong> If you subscribe to our newsletter, submit the contact or report-an-issue form, or otherwise message the City, we receive what you provide — typically your name, email address, and the content of your message.</li>
            <li><strong>Basic technical information.</strong> Like most websites, our hosting may automatically log standard details such as browser type, device type, and pages visited, used to keep the site running and secure.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To respond to your questions, requests, and reports.</li>
            <li>To send city news, events, and announcements if you subscribed to the newsletter.</li>
            <li>To operate, maintain, and improve the website.</li>
            <li>To meet legal or public-records obligations that apply to municipal government.</li>
          </ul>

          <h2>Payments</h2>
          <p>
            Online bill payments are handled by a third-party payment provider, not on
            this website. When you choose &ldquo;Pay My Bill,&rdquo; you leave this site and
            your payment information is collected and processed by that provider under its
            own terms and privacy policy. The City does not receive or store your full card
            or bank details through this website.
          </p>

          <h2>Sharing</h2>
          <p>
            We do not sell your personal information. We may share information with
            service providers that help us operate the site (for example, hosting or email
            delivery), or when required by law, public-records requests, or to protect the
            safety and rights of the City and the public.
          </p>

          <h2>Public records</h2>
          <p>
            As a unit of Alabama local government, communications you send to the City may
            be subject to the Alabama Open Records Act and could be disclosed in response
            to a lawful public-records request.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li><strong>Newsletter.</strong> You can unsubscribe at any time using the link in any newsletter email, or by contacting us.</li>
            <li><strong>Access &amp; corrections.</strong> Contact us to ask what information we hold about you or to request a correction.</li>
          </ul>

          <h2>Children</h2>
          <p>This website is intended for a general audience and is not directed to children under 13. We do not knowingly collect personal information from children.</p>

          <h2>Changes to this policy</h2>
          <p>We may update this policy from time to time. The &ldquo;last updated&rdquo; date above shows when it last changed.</p>

          <h2>Contact us</h2>
          <p>
            Questions about this policy? Reach the City at{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or{' '}
            <a href={SITE.phoneHref}>{SITE.phone}</a>, or visit our{' '}
            <Link href="/contact">contact page</Link>. City Hall is at {SITE.address}, {SITE.cityState}.
          </p>

          <p className="legal-disclaimer">
            This page is provided for general information and is not legal advice. The City
            may adapt this policy to fit its specific practices.
          </p>
        </div>
      </section>
    </>
  );
}
