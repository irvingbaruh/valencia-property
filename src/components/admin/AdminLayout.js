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
  Building2,
  Newspaper,
  CalendarDays,
  MessageSquare,
  MailCheck,
  BarChart3,
  Star,
} from 'lucide-react';

export const ADMIN_BASE = '/lockandloft/admin';

const navItems = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'uyeler', href: '/uyeler', icon: Users, label: 'Üyeler' },
  { id: 'ilanlar', href: '/ilanlar', icon: Building2, label: 'İlanlar' },
  { id: 'piyasa', href: '/piyasa', icon: Newspaper, label: 'Piyasa Notları' },
  { id: 'takvim', href: '/takvim', icon: CalendarDays, label: 'Şehir Takvimi' },
  { id: 'trafik', href: '/trafik', icon: BarChart3, label: 'Trafik' },
  { id: 'sohbetler', href: '/sohbetler', icon: MessageSquare, label: 'Sohbetler' },
  { id: 'yorumlar', href: '/yorumlar', icon: Star, label: 'Yorumlar' },
  { id: 'hizmetler', href: '/hizmetler', icon: Briefcase, label: 'Hizmetler' },
  { id: 'blog', href: '/blog', icon: PenSquare, label: 'Blog' },
  { id: 'mailing', href: '/mailing', icon: Mail, label: 'Mailing' },
  { id: 'otomatik-mailler', href: '/otomatik-mailler', icon: MailCheck, label: 'Otomatik Mailler' },
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
  const [openMsgs, setOpenMsgs] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

  // Before sending anyone to the login page, make one more attempt to renew the session
  // (a phone that was asleep comes back with an expired access token).
  useEffect(() => {
    if (loading || (user && isAdmin)) return;
    let cancelled = false;
    (async () => {
      if (!user) {
        const { data } = await supabase.auth.refreshSession();
        if (cancelled || data?.session) return;
      }
      router.replace(`${ADMIN_BASE}/giris/`);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, isAdmin, router]);

  // Waking the app up renews the session right away
  useEffect(() => {
    const onShow = () => document.visibilityState === 'visible' && supabase.auth.getSession();
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, []);

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

  // an admin's own visits are not counted in the site statistics
  useEffect(() => {
    if (isAdmin) {
      try { localStorage.setItem('ll_notrack', '1'); } catch {}
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_handled', false)
      .then(({ count }) => setOpenMsgs(count || 0));
  }, [isAdmin, activeSection]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = () => supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      .then(({ count }) => setPendingReviews(count || 0));
    load();
    window.addEventListener('reviews-changed', load);
    return () => window.removeEventListener('reviews-changed', load);
  }, [isAdmin, activeSection]);

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
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#151521', borderRight: '1px solid #1E1E2E', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Logo */}
        <div className="h-16 shrink-0 flex items-center justify-between px-5" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <Link href={`${ADMIN_BASE}/dashboard/`} className="flex items-center gap-2">
            <Logo icon variant="dark" className="h-9 w-auto" />
            <span className="font-semibold text-sm tracking-wide text-white">ADMIN PANEL</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#9A9AAA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto min-h-0">
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
                {id === 'yorumlar' && pendingReviews > 0 && (
                  <span className="ml-1 min-w-[20px] h-5 px-1.5 rounded-full bg-[#DC1C2E] text-white text-[11px] leading-5 text-center">{pendingReviews}</span>
                )}
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
        <div className="shrink-0 p-4" style={{ borderTop: '1px solid #1E1E2E' }}>
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
          className="h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 box-content"
          style={{ background: '#0B0B11', borderBottom: '1px solid #1E1E2E', paddingTop: 'env(safe-area-inset-top)' }}
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
        <main className="flex-1 p-4 lg:p-8 overflow-auto pb-28 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Phone tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5"
        style={{ background: '#151521', borderTop: '1px solid #1E1E2E', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {[
          ['dashboard', '/dashboard', LayoutDashboard, 'Özet'],
          ['bildirimler', '/bildirimler', Bell, 'Bildirimler'],
          ['sohbetler', '/sohbetler', MessageSquare, 'Sohbetler'],
          ['trafik', '/trafik', BarChart3, 'Trafik'],
        ].map(([id, href, Icon, label]) => (
          <Link
            key={id}
            href={`${ADMIN_BASE}${href}/`}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px]"
            style={{ color: activeSection === id ? '#C9A84C' : '#9A9AAA' }}
          >
            <Icon className="w-6 h-6" />
            {label}
            {id === 'bildirimler' && openMsgs > 0 && (
              <span className="absolute top-1.5 left-1/2 ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC1C2E] text-white text-[10px] leading-[18px] text-center">{openMsgs}</span>
            )}
          </Link>
        ))}
        <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] text-[#9A9AAA]">
          <Menu className="w-6 h-6" />
          Menü
        </button>
      </nav>
    </div>
  );
}
