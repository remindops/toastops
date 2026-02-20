'use client';

import Link from 'next/link';
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

  const navLinks = [
    { href: '/dashboard', label: 'Telemetry Overview' },
    { href: '/dashboard/builder', label: 'AI Toast Architect' },
    { href: '/dashboard/settings', label: 'Enterprise KMS Integrations' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row text-white">
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-neutral-800">
            <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent block">
                ToastOps
            </Link>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Tenant: {userName || 'Loading...'}</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center ${
                pathname === link.href 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
            <button 
                onClick={() => {
                    localStorage.removeItem('toastops_token');
                    window.location.href = '/login';
                }}
                className="w-full px-4 py-2 text-sm text-neutral-500 hover:text-red-400 font-medium transition-colors text-left"
            >
                End Session Securely
            </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
