'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '../../src/components/InputField';

/**
 * Login Page (/login)
 * - Basic validation for phone + password
 * - Redirects to /dashboard on success
 * - Ready for Supabase/Firebase integration via comments
 */
export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password.trim()) {
      setError('Phone and password are required');
      return;
    }

    setLoading(true);
    try {
      // Placeholder: authenticate with your backend here
      // Example (Supabase):
      // const { error } = await supabase.auth.signInWithPassword({ phone, password });
      // if (error) throw error;
      await new Promise((r) => setTimeout(r, 600));
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-slate-500">Log in to access the TripSafe dashboard</p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField label="Phone Number" name="phone" type="tel" value={phone} onChange={setPhone} required placeholder="e.g., +911100000000" autoComplete="tel" />
            <InputField label="Password" name="password" type="password" value={password} onChange={setPassword} required placeholder="••••••••" autoComplete="current-password" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-white shadow hover:bg-brand/90 focus:outline-none focus:ring-4 focus:ring-brand/30 disabled:opacity-60">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
            <div className="text-center text-sm text-slate-600">
              New here? <a href="/signup" className="text-brand hover:underline">Create an account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
