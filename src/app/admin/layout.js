'use client';

import './admin.css';
import { usePathname } from 'next/navigation';
import AdminNav from '@/components/AdminNav';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  // Login page has no sidebar.
  if (pathname === '/admin/login') return children;

  return (
    <div className="adminx-shell">
      <AdminNav />
      <div className="adminx-content">{children}</div>
    </div>
  );
}
