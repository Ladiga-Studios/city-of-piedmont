import '../../pages.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';

export const metadata = {
  title: 'The Permanent Record',
  description:
    'How the City of Piedmont preserves council minutes, public notices, and city news in a tamper-evident public archive, and how anyone can verify a record.',
  alternates: { canonical: 'https://www.piedmontcity.org/government/records' },
};

export const revalidate = 300;

async function anchoredCount() {
  try {
    const supabase = createClient();
    const tables = ['minutes', 'public_notices', 'news'];
    let total = 0;
    for (const t of tables) {
      const { count } = await supabase
        .from(t)
        .select('id', { count: 'exact', head: true })
        .eq('anchor_status', 'anchored');
      total += count || 0;
    }
    return total;
  } catch {
    return 0;
  }
}

export default async function RecordsPage() {
  const count = await anchoredCount();

  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/government">Government</Link><span aria-hidden="true">/</span>
            <span>Permanent Record</span>
          </nav>
          <p className="eyebrow">Open Government</p>
          <h1>The Permanent Record</h1>
          <p>
            Council minutes, public notices, and city news posted on this site are filed
            in a public archive that cannot be quietly altered by a future website,
            a change in staff, or even the city itself.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <h2>What this is</h2>
          <p>
            City websites change. Software gets replaced, vendors come and go, and in many
            towns, years of posted records disappear along the way. Piedmont keeps a second,
            independent copy of the essentials: whenever the city posts meeting minutes, a
            public notice, or a news item, the document&rsquo;s digital fingerprint is filed
            in a permanent public archive along with the date it was posted.
            {count > 0 && <> So far, <strong>{count} record{count === 1 ? '' : 's'}</strong> have been filed.</>}
          </p>
          <p>
            A fingerprint (technically, a SHA-256 hash) is a short code computed from the
            exact contents of a file. Change even one letter in the file and the fingerprint
            changes completely. Because the fingerprint is filed in an archive no one can
            edit, anyone can later prove that a document is, or is not, the same one the
            city originally posted.
          </p>

          <h2>What it means for you</h2>
          <ul>
            <li>
              <strong>Records can&rsquo;t be silently rewritten.</strong> If a posted document
              were ever altered, its fingerprint would no longer match the one on file.
              Corrections are still possible. They simply appear as new entries rather than
              replacing history.
            </li>
            <li>
              <strong>The record outlives this website.</strong> The archive lives outside
              city servers, so the fingerprints and filing dates survive redesigns, vendor
              changes, and staff turnover.
            </li>
            <li>
              <strong>You don&rsquo;t have to take our word for it.</strong> Every filed
              record shows a &ldquo;Filed in the permanent record&rdquo; mark. Expand it to
              see the fingerprint and the public ledger entry.
            </li>
          </ul>

          <h2>How to verify a document yourself</h2>
          <p>
            Download the PDF from this site, then compute its SHA-256 fingerprint and compare
            it to the one shown under the record. On most computers this takes one command:
          </p>
          <ul>
            <li><strong>Windows</strong> (PowerShell): <code>Get-FileHash minutes.pdf -Algorithm SHA256</code></li>
            <li><strong>Mac</strong> (Terminal): <code>shasum -a 256 minutes.pdf</code></li>
            <li><strong>Linux</strong>: <code>sha256sum minutes.pdf</code></li>
          </ul>
          <p>
            If the codes match, the file in your hands is byte-for-byte the one the city
            filed. If they don&rsquo;t, it isn&rsquo;t.
          </p>

          <h2>What is and isn&rsquo;t in the archive</h2>
          <p>
            Only fingerprints and basic public details (title, date, and where the document
            is posted) are filed. The documents themselves stay on the city&rsquo;s website,
            exactly as before. Nothing personal or private is placed in the archive, and the
            archive adds no new information. It only proves what was already public.
          </p>

          <h2>The technical details</h2>
          <p>
            For those who want to check the math: the archive is built on{' '}
            <a href="https://github.com/fangorn-network/fangorn" target="_blank" rel="noopener noreferrer">
              Fangorn
            </a>, an open-source system for verifiable public data. Each record class
            (minutes, notices, news) is a namespace in the city&rsquo;s data graph; each
            filing is a content-addressed entry, and the archive&rsquo;s current state is
            settled on a public ledger where every update is timestamped and every previous
            state remains checkable. The &ldquo;public ledger entry&rdquo; link under any
            filed record opens the corresponding settlement transaction, which anyone can
            inspect without an account.
          </p>
          <p>
            This system is currently running as a pilot on a test network while the city
            evaluates it. The fingerprints shown on each record are computed and stored the
            moment a document is posted and are verifiable today, as described above.
          </p>

          <p>
            Questions about a specific record?{' '}
            <Link href="/contact">Contact City Hall</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
