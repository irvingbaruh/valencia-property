import { setRequestLocale } from 'next-intl/server';
import NewPasswordForm from '@/components/auth/NewPasswordForm';

export default async function NewPasswordPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NewPasswordForm />;
}
