/**
 * Momen Organizer Layout
 * Protected layout for organizer dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, LayoutDashboard, Calendar, Image, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/providers';

const navItems = [
  { href: '/organizer', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/organizer/events', icon: Calendar, label: 'Events' },
  { href: '/organizer/photos', icon: Image, label: 'Photos' },
  { href: '/organizer/settings', icon: Settings, label: 'Settings' },
];

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="bg-card border-b border-default sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center">
          {/* Logo */}
          <Link href="/organizer" className="inline-flex items-center gap-2 mr-8">
            <div className="w-8 h-8 bg-slate rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate hidden sm:block">Momen</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate/10 text-slate'
                      : 'text-sky hover:text-slate hover:bg-cream/40'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="ml-auto flex items-center gap-4">
            {/* User Menu */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate">{user.name}</p>
                <p className="text-xs text-sky">{user.email}</p>
              </div>
              <div className="w-9 h-9 bg-sky/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-sky">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-sky hover:text-slate hover:bg-cream/40 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate hover:bg-cream/40"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-default py-2">
            <nav className="flex flex-col">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate/10 text-slate'
                        : 'text-sky hover:text-slate hover:bg-cream/40'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Info */}
            <div className="px-4 py-3 border-t border-default mt-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-sky/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-sky">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate">{user.name}</p>
                  <p className="text-xs text-sky">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
