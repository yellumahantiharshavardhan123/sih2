"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabaseClient";

/**
 * AccountMenu
 * - Top-right user menu with sign out.
 * - Uses Supabase client-side auth to fetch current user and sign out securely.
 */
export default function AccountMenu() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const e = data.user?.email ?? null;
      setEmail(e);
    });
  }, [supabase]);

  function displayName() {
    if (!email) return "Account";
    // Convert phone-based emails back to phone label if applicable
    if (email.endsWith("@tripsafe.local")) return email.replace("@tripsafe.local", "");
    return email;
  }

  async function onSignOut() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (e) {
      console.error("Sign out failed", e);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-semibold">
          {displayName().slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden sm:block text-sm text-slate-700 truncate max-w-[160px]" title={displayName()}>
          {displayName()}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-slate-500"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg">
          <div className="border-b p-3 text-xs text-slate-500">
            Signed in as
            <div className="truncate text-slate-700" title={email ?? ""}>
              {email ?? "Unknown"}
            </div>
          </div>
          <div className="p-1">
            <a
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </a>
            <button
              onClick={onSignOut}
              disabled={loading}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Sign out
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
