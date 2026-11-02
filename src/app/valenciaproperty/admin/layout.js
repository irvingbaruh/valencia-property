import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = {
  title: 'Valencia Property — Yönetim',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
