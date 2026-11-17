import Link from 'next/link';
import { Mail, Bell } from 'lucide-react';
import { ADMIN_BASE } from '@/components/admin/AdminLayout';

// E-posta (mailing) and push live under one menu entry; these tabs switch between them.
export default function MessagingTabs({ active }) {
  const tab = (id, href, Icon, label) => (
    <Link href={`${ADMIN_BASE}${href}`} aria-current={active === id ? 'page' : undefined} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
      style={active === id ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C' } : { background: '#151521', border: '1px solid #1E1E2E', color: '#9A9AAA' }}>
      <Icon className="w-4 h-4" />{label}
    </Link>
  );
  return <div className="flex gap-2 mb-6">{tab('mail', '/mailing/', Mail, 'E-posta')}{tab('push', '/push/', Bell, 'Push bildirim')}</div>;
}
