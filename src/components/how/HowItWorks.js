'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, UserPlus, Video, LayoutDashboard, Heart, Bell, Briefcase, FileText, MapPin, Check, X, Layers, BellRing, Eye } from 'lucide-react';
import { HOW, hw } from '@/lib/howItWorks';
import { localePath } from '@/lib/routes';
import { useAuth } from '@/components/providers/AuthProvider';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { PanelMock, FavMock, NotifMock, ServiceMock, DocMock, MeetMock, GuideMock } from '@/components/how/HowMocks';

const MOCKS = { fav: FavMock, notif: NotifMock, svc: ServiceMock, doc: DocMock, meet: MeetMock, guide: GuideMock };
const TOUR_ICONS = { Heart, Bell, Briefcase, FileText, Video, MapPin };
const VAL_ICONS = { Layers, BellRing, Eye };
const STEP_ICONS = [UserPlus, Video, LayoutDashboard];

export default function HowItWorks() {
  const l = useLocale();
  const { user } = useAuth();
  const joinHref = user ? localePath(l, 'panel') : `${localePath(l, 'giris')}?app=1`;
  const joinLabel = user ? hw(HOW.panel, l) : hw(HOW.join, l);
  const bookHref = user ? `${localePath(l, 'panel')}?tab=meeting` : `${localePath(l, 'giris')}?app=1`;

  return (
    <div className="bg-band">
      {/* Hero */}
      <section className="bg-soft border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-44 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="accent-line mb-4" />
            <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-5">{hw(HOW.title, l)}</h1>
            <p className="text-lg text-text-muted leading-relaxed mb-8">{hw(HOW.sub, l)}</p>
            <Link href={joinHref} className="inline-flex items-center gap-2 rounded-xl bg-dark text-white px-6 py-3.5 text-sm font-medium hover:bg-gold hover:text-dark transition-colors">
              {joinLabel}<ArrowRight size={16} />
            </Link>
          </div>
          <PanelMock l={l} />
        </div>
      </section>

      {/* Visitor vs member */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-serif text-dark text-center mb-10">{hw(HOW.cmpTitle, l)}</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-white border border-border p-6">
            <p className="font-serif text-xl text-dark mb-4">{hw(HOW.guest, l)}</p>
            <ul className="space-y-3">
              {HOW.guestItems.map((it, i) => (
                <li key={i} className="flex gap-3 text-dark/80"><span className="mt-0.5 w-5 h-5 rounded-full bg-dark/10 flex items-center justify-center shrink-0"><X size={12} className="text-dark/50" /></span>{hw(it, l)}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-dark text-white p-6 border border-gold/40 shadow-[0_10px_40px_rgba(201,168,76,0.2)]">
            <p className="font-serif text-xl text-gold mb-4">{hw(HOW.member, l)}</p>
            <ul className="space-y-3">
              {HOW.memberItems.map((it, i) => (
                <li key={i} className="flex gap-3 text-white"><span className="mt-0.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0"><Check size={12} className="text-dark" /></span>{hw(it, l)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-dark text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-serif text-white text-center mb-12">{hw(HOW.stepsTitle, l)}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW.steps.map(([h, p], i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div key={i} className="relative text-center">
                  {i < 2 && <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold/50 to-transparent" />}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-charcoal border border-white/10 mb-5">
                    <Icon size={28} className="text-gold" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gold text-dark text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2">{hw(h, l)}</h3>
                  <p className="text-sm text-white/90 leading-relaxed max-w-xs mx-auto">{hw(p, l)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Panel tour */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-serif text-dark text-center mb-14">{hw(HOW.toursTitle, l)}</h2>
        <div className="space-y-16">
          {HOW.tours.map((t, i) => {
            const Icon = TOUR_ICONS[t.icon];
            const Mock = MOCKS[t.k];
            return (
              <ScrollReveal key={t.k} className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
                <div className={i % 2 ? 'md:order-2' : ''}>
                  <span className="inline-flex w-12 h-12 rounded-xl bg-dark items-center justify-center mb-4"><Icon size={22} className="text-gold" /></span>
                  <h3 className="text-2xl font-serif text-dark mb-3">{hw(t.h, l)}</h3>
                  <p className="text-text-muted leading-relaxed">{hw(t.p, l)}</p>
                </div>
                <div className={i % 2 ? 'md:order-1' : ''}><Mock l={l} /></div>
              </ScrollReveal>
            );
          })}
        </div>
        <p className="mt-12 text-xs text-center text-dark/60">{hw(HOW.sample, l)}</p>
      </section>

      {/* Values */}
      <section className="bg-soft border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-serif text-dark text-center mb-10">{hw(HOW.valuesTitle, l)}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {HOW.values.map(([ic, h, p], i) => {
              const Icon = VAL_ICONS[ic];
              return (
                <div key={i} className="rounded-2xl bg-white border border-border p-6 text-center">
                  <span className="mx-auto w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mb-4"><Icon size={22} className="text-gold-dark" /></span>
                  <h3 className="font-serif text-xl text-dark mb-2">{hw(h, l)}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{hw(p, l)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-dark mb-3">{hw(HOW.ctaTitle, l)}</h2>
        <p className="text-text-muted mb-8">{hw(HOW.ctaText, l)}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={joinHref} className="inline-flex items-center gap-2 rounded-xl bg-dark text-white px-6 py-3.5 text-sm font-medium hover:bg-gold hover:text-dark transition-colors">{joinLabel}<ArrowRight size={16} /></Link>
          <Link href={bookHref} className="inline-flex items-center gap-2 rounded-xl border border-dark text-dark px-6 py-3.5 text-sm font-medium hover:bg-dark hover:text-white transition-colors"><Video size={16} />{hw(HOW.book, l)}</Link>
        </div>
      </section>
    </div>
  );
}
