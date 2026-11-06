'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/brand/Logo';
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
  PenSquare,
  Calculator,
  Mail,
} from 'lucide-react';

export const ADMIN_BASE = '/lockandloft/admin';

const navItems = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'uyeler', href: '/uyeler', icon: Users, label: 'Üyeler' },
  { id: 'hizmetler', href: '/hizmetler', icon: Briefcase, label: 'Hizmetler' },
  { id: 'blog', href: '/blog', icon: PenSquare, label: 'Blog' },
  { id: 'mailing', href: '/mailing', icon: Mail, label: 'Mailing' },
  { id: 'dosyalar', href: '/dosyalar', icon: FileText, label: 'Dosyalar' },
  { id: 'bildirimler', href: '/bildirimler', icon: Bell, label: 'Bildirimler' },
  { id: 'roi', href: '/roi', icon: Calculator, label: 'ROI Ayarları' },
  { id: 'ayarlar', href: '/ayarlar', icon: Settings, label: 'Ayarlar' },
];

export default function AdminLayout({ children, activeSection = 'dashboard' }) {
  const router = useRouter();
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aalOk, setAalOk] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace(`${ADMIN_BASE}/giris/`);
    }
  }, [user, loading, isAdmin, router]);

  // If an authenticator is enrolled, the session must have passed the code check
  useEffect(() => {
    if (loading || !user || !isAdmin) return;
    let cancelled = false;
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      if (cancelled) return;
      if (data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2') {
        router.replace(`${ADMIN_BASE}/giris/`);
      } else {
        setAalOk(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loading, user, isAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace(`${ADMIN_BASE}/giris/`);
  };

  if (loading || !user || !isAdmin || !aalOk) {
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
          <Link href={`${ADMIN_BASE}/dashboard/`} className="flex items-center gap-2">
            <Logo icon variant="dark" className="h-9 w-auto" />
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
                href={disabled ? '#' : `${ADMIN_BASE}${href}/`}
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
            href="/tr/"
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
