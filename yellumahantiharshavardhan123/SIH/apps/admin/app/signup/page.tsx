'use client';
import React, { useState } from 'react';
import InputField from '../../src/components/InputField';

/**
 * Signup Page (/signup)
 * - Modern card UI using Tailwind
 * - Validates required fields
 * - Shows success message on submission
 * - Ready to connect to Supabase/Firebase (see comments)
 */
export default function SignupPage() {
  const [name, setName] = useState('');
  const [fromAddr, setFromAddr] = useState('');
  const [toAddr, setToAddr] = useState('');
  const [nativeLang, setNativeLang] = useState('');
  const [altNumbers, setAltNumbers] = useState(''); // comma-separated
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!fromAddr.trim()) e.from = 'From address is required';
    if (!toAddr.trim()) e.to = 'To address is required';
    if (!nativeLang.trim()) e.lang = 'Native language is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    // Optional: validate phone formats here
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // Placeholder for auth + profile creation:
    // 1) Create auth user with phone/email provider
    // 2) Insert profile row (name, addresses, nativeLang, altNumbers array, phone)
    // 3) Handle errors and show user-friendly messages
    // Example with Supabase (pseudo):
    // const { data: auth, error } = await supabase.auth.signUp({ phone, password });
    // await supabase.from('profiles').upsert({ id: auth.user.id, name, ... });

    setSubmitted(true);
  }

  return (
    <div className="min-h-[80vh] grid place-items-center">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="text-slate-500">Join TripSafe and set up your safety profile</p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {submitted ? (
            <div className="space-y-2 text-center">
              <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">✓</div>
              <h2 className="text-xl font-semibold">Signup successful</h2>
              <p className="text-sm text-slate-600">You can now log in with your phone number and password.</p>
              <a href="/login" className="text-brand hover:underline">Go to Login</a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <InputField label="Name" name="name" value={name} onChange={setName} required error={errors.name} placeholder="Full name" />
              <InputField label="From Address" name="from" as="textarea" rows={3} value={fromAddr} onChange={setFromAddr} required error={errors.from} placeholder="Home address / origin" />
              <InputField label="To Address" name="to" as="textarea" rows={3} value={toAddr} onChange={setToAddr} required error={errors.to} placeholder="Destination address" />
              <InputField label="Native Language" name="nativeLang" value={nativeLang} onChange={setNativeLang} required error={errors.lang} placeholder="e.g., English, Hindi" />
              <InputField label="Alternative Numbers (comma-separated)" name="alt" value={altNumbers} onChange={setAltNumbers} placeholder="e.g., +911100000001, +911100000002" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Phone Number" name="phone" type="tel" value={phone} onChange={setPhone} required error={errors.phone} placeholder="e.g., +911100000000" autoComplete="tel" />
                <InputField label="Password" name="password" type="password" value={password} onChange={setPassword} required error={errors.password} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-brand px-4 py-2.5 font-medium text-white shadow hover:bg-brand/90 focus:outline-none focus:ring-4 focus:ring-brand/30">
                Create account
              </button>
              <div className="text-center text-sm text-slate-600">
                Already have an account? <a href="/login" className="text-brand hover:underline">Log in</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
