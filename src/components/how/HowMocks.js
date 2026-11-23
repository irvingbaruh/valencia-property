'use client';
// Illustrative screens of the member panel, drawn in code (no personal data, follow the page language).
import { Heart, Bell, Check, Clock, FileText, Video, MapPin, Home, TrendingDown, Briefcase, Calculator, GraduationCap, Wallet, Landmark, Percent } from 'lucide-react';
import { HOW, hw } from '@/lib/howItWorks';

const T = (o, l) => hw(o, l);

export function Browser({ children, label = 'lockandloft.com' }) {
  return (
    <div className="rounded-2xl bg-white border border-border shadow-[0_20px_60px_rgba(11,11,17,0.15)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F1F2F5] border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-[#DC1C2E]/70" /><span className="w-2.5 h-2.5 rounded-full bg-gold/80" /><span className="w-2.5 h-2.5 rounded-full bg-success/70" />
        <span className="ml-3 flex-1 text-[11px] text-center text-dark/60 bg-white rounded-md py-0.5 truncate">{label}</span>
      </div>
      <div className="p-4 sm:p-5 bg-warm-gray">{children}</div>
    </div>
  );
}

export function Phone({ children }) {
  return (
    <div className="mx-auto w-[250px] rounded-[2.2rem] bg-dark p-2 shadow-[0_20px_60px_rgba(11,11,17,0.25)]">
      <div className="rounded-[1.8rem] bg-warm-gray overflow-hidden min-h-[360px]">
        <div className="h-5 flex justify-center items-end"><span className="w-16 h-1.5 rounded-full bg-dark/80" /></div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

const Badge = ({ tone = 'gold', children }) => {
  const c = { gold: 'bg-gold/20 text-gold-dark', green: 'bg-success/15 text-[#15803D]', gray: 'bg-dark/10 text-dark/70', red: 'bg-[#DC1C2E]/10 text-[#B91C2B]', blue: 'bg-[#003DA5]/10 text-[#003DA5]' }[tone];
  return <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${c}`}>{children}</span>;
};

function HomeCard({ title, price, badge, tone, hearted = true, tint }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="h-20 relative" style={{ background: tint }}>
        <Home className="absolute left-3 bottom-2 text-white/80" size={22} />
        <span className="absolute right-2 top-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow"><Heart size={14} className={hearted ? 'text-[#DC1C2E] fill-[#DC1C2E]' : 'text-dark/40'} /></span>
        {badge && <span className="absolute left-2 top-2"><Badge tone={tone}>{badge}</Badge></span>}
      </div>
      <div className="p-2.5">
        <p className="text-[11px] text-dark/70">{title}</p>
        <p className="text-sm font-semibold text-dark">{price}</p>
      </div>
    </div>
  );
}

export function FavMock({ l }) {
  const m = HOW.mock;
  return (
    <Browser label="lockandloft.com › favourites">
      <div className="grid grid-cols-2 gap-3">
        <HomeCard title={T(m.home1, l)} price="€ 285.000" badge={T(m.priceDown, l)} tone="green" tint="linear-gradient(135deg,#8FA9C7,#4F6D8F)" />
        <HomeCard title={T(m.home2, l)} price="€ 349.000" badge={T(m.sold, l)} tone="red" tint="linear-gradient(135deg,#C9A84C,#8C7430)" />
      </div>
      <p className="mt-3 text-[10px] text-dark/50 text-center">{T(m.example, l)}</p>
    </Browser>
  );
}

export function NotifMock({ l }) {
  const m = HOW.mock;
  const items = [[Home, m.n1, 'gold'], [TrendingDown, m.n2, 'green'], [Percent, m.n3, 'blue'], [Bell, m.n4, 'gray']];
  return (
    <Phone>
      <p className="text-center text-3xl font-light text-dark mt-2">11:20</p>
      <div className="mt-4 space-y-2">
        {items.map(([Icon, txt, tone], i) => (
          <div key={i} className="bg-white/95 rounded-2xl border border-border p-2.5 flex items-start gap-2.5 shadow-sm">
            <span className="w-8 h-8 rounded-lg bg-dark flex items-center justify-center shrink-0"><Icon size={15} className="text-gold" /></span>
            <div className="min-w-0">
              <p className="text-[10px] text-dark/50 flex justify-between"><span>Lock & Loft</span><span>{T(m.now, l)}</span></p>
              <p className="text-[11px] text-dark leading-snug">{T(txt, l)}</p>
            </div>
          </div>
        ))}
      </div>
    </Phone>
  );
}

export function ServiceMock({ l }) {
  const m = HOW.mock;
  const st = [['done', 0], ['done', 1], ['active', 2], ['pending', 3]];
  return (
    <Browser label="lockandloft.com › services">
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm text-dark flex items-center gap-2"><Briefcase size={15} className="text-gold" />{T(m.svcName, l)}</p>
          <Badge tone="gold">{T(m.active, l)}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-dark/60"><span>{T(m.progress, l)}</span><span>50%</span></div>
        <div className="mt-1 h-2 rounded-full bg-dark/10"><div className="h-2 rounded-full bg-gold w-1/2" /></div>
        <ul className="mt-4 space-y-2.5">
          {st.map(([s, i]) => (
            <li key={i} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 ${s === 'done' ? 'bg-success text-white' : s === 'active' ? 'bg-gold text-dark' : 'bg-dark/10 text-dark/50'}`}>{s === 'done' ? <Check size={13} /> : s === 'active' ? <Clock size={13} /> : i + 1}</span>
              <span className={`flex-1 text-sm ${s === 'pending' ? 'text-dark/50' : 'text-dark'}`}>{T(m.stages[i], l)}</span>
              <Badge tone={s === 'done' ? 'green' : s === 'active' ? 'gold' : 'gray'}>{T(s === 'done' ? m.done : s === 'active' ? m.active : m.pending, l)}</Badge>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[10px] text-dark/50 text-center">{T(m.example, l)}</p>
    </Browser>
  );
}

export function DocMock({ l }) {
  const m = HOW.mock;
  const rows = [[m.d1, m.approved, 'green'], [m.d2, m.review, 'gold'], [m.d3, m.uploaded, 'blue']];
  return (
    <Browser label="lockandloft.com › documents">
      <div className="bg-white rounded-xl border border-border divide-y divide-border">
        {rows.map(([n, s, tone], i) => (
          <div key={i} className="flex items-center gap-3 p-3.5">
            <span className="w-9 h-9 rounded-lg bg-dark flex items-center justify-center"><FileText size={16} className="text-gold" /></span>
            <span className="flex-1 text-sm text-dark">{T(n, l)}</span>
            <Badge tone={tone}>{tone === 'green' && <Check size={11} />}{T(s, l)}</Badge>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-dark/50 text-center">{T(m.example, l)}</p>
    </Browser>
  );
}

export function MeetMock({ l }) {
  const m = HOW.mock;
  const slots = ['10:00', '11:30', '16:00', '17:30'];
  return (
    <Browser label="lockandloft.com › video call">
      <div className="bg-white rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-dark flex items-center gap-2"><Video size={15} className="text-gold" />{T(m.pickTime, l)}</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {m.days.map((d, i) => (
            <div key={i} className={`rounded-lg py-2 text-xs ${i === 1 ? 'bg-dark text-white' : 'bg-warm-gray text-dark/70'}`}>{T(d, l)}<div className="font-semibold text-sm">{24 + i}</div></div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {slots.map((s, i) => <span key={s} className={`text-center text-xs rounded-lg py-1.5 border ${i === 1 ? 'bg-gold text-dark border-gold font-semibold' : 'border-border text-dark/70'}`}>{s}</span>)}
        </div>
        <div className="mt-4 rounded-lg bg-success/10 border border-success/30 p-3 flex items-center gap-2 text-xs text-dark">
          <Check size={14} className="text-[#15803D]" /><span><b>{T(m.confirmed, l)}</b> · {T(m.link, l)}</span>
        </div>
      </div>
    </Browser>
  );
}

export function GuideMock({ l }) {
  const m = HOW.mock;
  const icons = [MapPin, GraduationCap, Wallet, Landmark, Calculator, Percent];
  return (
    <Browser label="lockandloft.com › guide">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {m.g.map((t, i) => {
          const Icon = icons[i];
          return (
            <div key={i} className="bg-white rounded-xl border border-border p-3 text-center">
              <span className="mx-auto w-9 h-9 rounded-lg bg-dark flex items-center justify-center"><Icon size={16} className="text-gold" /></span>
              <p className="mt-2 text-[11px] text-dark leading-tight">{T(t, l)}</p>
            </div>
          );
        })}
      </div>
    </Browser>
  );
}

// Overview of the whole panel for the hero.
export function PanelMock({ l }) {
  const m = HOW.mock;
  return (
    <Browser label="lockandloft.com › my account">
      <p className="font-serif text-xl text-dark">{T(m.welcome, l)}</p>
      <div className="mt-3 flex gap-1.5 flex-wrap">
        {m.tabs.map((t, i) => <span key={i} className={`text-[11px] px-3 py-1 rounded-full ${i === 1 ? 'bg-dark text-white' : 'bg-white border border-border text-dark/70'}`}>{T(t, l)}</span>)}
      </div>
      <div className="mt-3 bg-white rounded-xl border border-border p-3.5">
        <div className="flex items-center justify-between"><p className="text-sm font-semibold text-dark">{T(m.svcName, l)}</p><Badge tone="gold">{T(m.active, l)}</Badge></div>
        <div className="mt-2 h-2 rounded-full bg-dark/10"><div className="h-2 rounded-full bg-gold w-1/2" /></div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`text-[10px] rounded-lg py-1.5 ${i < 2 ? 'bg-success/15 text-[#15803D]' : 'bg-gold/20 text-gold-dark'}`}>{T(m.stages[i], l)}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <HomeCard title={T(m.home1, l)} price="€ 285.000" badge={T(m.priceDown, l)} tone="green" tint="linear-gradient(135deg,#8FA9C7,#4F6D8F)" />
        <div className="bg-white rounded-xl border border-border p-3 space-y-2">
          {[m.d1, m.d2].map((n, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-dark"><FileText size={13} className="text-gold" /><span className="flex-1">{T(n, l)}</span><Check size={12} className={i === 0 ? 'text-success' : 'text-gold'} /></div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[10px] text-dark/50 text-center">{T(m.example, l)}</p>
    </Browser>
  );
}
