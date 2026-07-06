'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

// Wraps the public site with its header + footer, but renders a bare
// passthrough on /admin routes (the admin has its own sidebar shell).
export default function SiteChrome({ alertBar, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <TopBar />
      {alertBar}
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
