/**
 * Momen Auth Layout
 * Shared layout for authentication pages
 */

import { ReactNode } from 'react';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="border-b border-default">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-slate rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate">Momen</span>
          </Link>

          <nav className="ml-auto flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate hover:text-slate transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 bg-sky text-white text-sm font-medium rounded-md hover:bg-sky-600 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-default py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-sky">
          © {new Date().getFullYear()} Momen. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
