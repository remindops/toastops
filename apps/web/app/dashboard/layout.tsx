'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Explicit DIY Session Hydration
    const token = localStorage.getItem('toastops_token');
    const user = localStorage.getItem('toastops_user');

    if (!token) {
      window.location.href = '/login';
    }

    if (user) {
      setUserName(JSON.parse(user).name);
    }
  }, []);

  return <>{children}</>;
}
