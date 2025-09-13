import './globals.css';
import type { ReactNode } from 'react';
import AccountMenu from '../src/components/AccountMenu';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen grid grid-cols-[240px_1fr]">
          <aside className="bg-slate-50 border-r">
            <div className="p-4 text-xl font-semibold text-brand">TripSafe</div>
            <nav className="flex flex-col gap-2 p-4 text-sm">
              <a href="/map" className="hover:text-brand">Map</a>
              <a href="/alerts" className="hover:text-brand">Alerts</a>
              <a href="/tourists" className="hover:text-brand">Tourists</a>
              <a href="/incidents" className="hover:text-brand">Incidents</a>
              <a href="/reports" className="hover:text-brand">Reports</a>
            </nav>
          </aside>
          <main className="p-4">
            <div className="mb-4 flex items-center justify-end">
              <AccountMenu />
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
