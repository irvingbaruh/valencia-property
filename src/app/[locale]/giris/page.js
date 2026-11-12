import { setRequestLocale } from 'next-intl/server';
import AuthForm from '@/components/auth/AuthForm';
import MemberBenefitsList from '@/components/auth/MemberBenefitsList';

export default async function GirisPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AuthForm />
      <MemberBenefitsList />
    </>
  );
}
