'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'uyeler', href: '/admin/uyeler', icon: Users, label: 'Üyeler' },
  { id: 'hizmetler', href: '/admin/hizmetler', icon: Briefcase, label: 'Hizmetler', disabled: true },
  { id: 'dosyalar', href: '/admin/dosyalar', icon: FileText, label: 'Dosyalar', disabled: true },
  { id: 'bildirimler', href: '/admin/bildirimler', icon: Bell, label: 'Bildirimler', disabled: true },
  { id: 'ayarlar', href: '/admin/ayarlar', icon: Settings, label: 'Ayarlar', disabled: true },
];

export default function AdminLayout({ children, activeSection = 'dashboard' }) {
  const locale = useLocale();
  const router = useRouter();
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push(`/${locale}/giris`);
    }
  }, [user, loading, isAdmin, locale, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0B11' }}>
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0B0B11', color: '#F5F0E8' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#151521', borderRight: '1px solid #1E1E2E' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#DC1C2E' }}
            >
              VP
            </div>
            <span className="font-semibold text-sm tracking-wide text-white">ADMIN PANEL</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#9A9AAA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map(({ id, href, icon: Icon, label, disabled }) => {
            const isActive = activeSection === id;
            return (
              <Link
                key={id}
                href={disabled ? '#' : `/${locale}${href}`}
                onClick={(e) => disabled && e.preventDefault()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : disabled
                    ? 'text-[#6A6A7A] cursor-not-allowed'
                    : 'text-[#9A9AAA] hover:text-white hover:bg-white/5'
                }`}
                style={isActive ? { background: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C' } : {}}
              >
                <Icon className="w-5 h-5" />
                {label}
                {disabled && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#1E1E2E', color: '#6A6A7A' }}>
                    Yakında
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid #1E1E2E' }}>
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9A9AAA] hover:text-white hover:bg-white/5 transition-colors"
          >
            <Home className="w-5 h-5" />
            Siteye Dön
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9A9AAA] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30"
          style={{ background: '#0B0B11', borderBottom: '1px solid #1E1E2E' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#9A9AAA] hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-[#9A9AAA]">{user.email}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)', color: '#0B0B11' }}
            >
              {(profile?.full_name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
