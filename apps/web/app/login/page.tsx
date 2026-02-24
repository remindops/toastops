'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Explicit DIY token storage
      localStorage.setItem('toastops_token', data.token);
      localStorage.setItem('toastops_user', JSON.stringify(data.user));

      window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-inter flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 md:left-32 w-24 h-24 bg-yellow-300 border-4 border-black rounded-full neo-shadow animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-20 right-10 md:right-32 w-32 h-32 bg-blue-300 border-4 border-black rotate-12 neo-shadow animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-40 right-20 w-16 h-16 bg-pink-300 border-4 border-black rotate-45 neo-shadow" />
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-300 border-4 border-black rounded-full neo-shadow" />

      <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 text-2xl font-black tracking-tighter uppercase flex items-center gap-2 z-20 hover:scale-105 transition-transform">
        <span className="bg-orange-400 text-white px-2 py-1 border-2 border-black neo-shadow-sm rotate-[-2deg]">Toast</span>
        <span className="text-black">Ops</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-4 border-black p-8 md:p-10 neo-shadow rotate-1">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              Welcome <span className="text-orange-500 font-caveat text-5xl md:text-6xl lowercase tracking-normal">back!</span>
            </h1>
            <p className="text-lg font-bold bg-yellow-200 border-2 border-black inline-block px-3 py-1 -rotate-2 neo-shadow-sm">
              Sign in to your Tenant
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-100 border-4 border-black p-4 flex items-start gap-3 neo-shadow-sm rotate-1">
                <ShieldAlert className="text-red-500 shrink-0 mt-1" />
                <p className="font-bold text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-black uppercase flex items-center gap-2 text-lg">
                  <Mail size={20} /> Enterprise Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-4 border-black p-4 font-mono text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all neo-shadow-sm"
                  placeholder="admin@remindops.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-black uppercase flex items-center gap-2 text-lg">
                  <Lock size={20} /> KMS Password
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-4 border-black p-4 font-mono text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all neo-shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group w-full bg-orange-500 text-white border-4 border-black p-4 text-xl font-black uppercase tracking-wider neo-shadow transition-all neo-shadow-hover hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 mt-4"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In Securely
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </>
              )}
            </button>

            <p className="text-center font-bold text-sm mt-2">
              Don't have an account?{' '}
              <Link href="/signup" className="text-orange-600 hover:text-orange-500 underline decoration-2 underline-offset-2">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
