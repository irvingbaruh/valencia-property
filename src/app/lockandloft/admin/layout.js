import { AuthProvider } from '@/components/providers/AuthProvider';
import AdminPwa from '@/components/admin/AdminPwa';

export const metadata = {
  title: { absolute: 'Yönetim | Lock & Loft' },
  robots: { index: false, follow: false },
  manifest: '/lockandloft/admin/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'L&L Yönetim', statusBarStyle: 'black-translucent' },
  icons: { apple: '/brand/apple-touch-icon.png', icon: '/brand/app-192.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B0B11',
};

export default function AdminRootLayout({ children }) {
  return (
    <AuthProvider>
      <AdminPwa />
      {children}
    </AuthProvider>
  );
}
