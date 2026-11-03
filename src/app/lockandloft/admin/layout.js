import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = {
  title: { absolute: 'Yönetim | Lock & Loft' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
