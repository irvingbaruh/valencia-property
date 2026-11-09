'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchNotes, TOPICS } from '@/lib/marketNotes';
import MarketNoteCard from './MarketNoteCard';

export default function MarketNotesList() {
  const t = useTranslations('market');
  const [notes, setNotes] = useState(null);
  const [topic, setTopic] = useState('all');
  useEffect(() => {
    let off = false;
    fetchNotes().then((r) => { if (!off) setNotes(r); });
    return () => { off = true; };
  }, []);
  const list = (notes || []).filter((n) => topic === 'all' || n.topic === topic);
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', ...TOPICS].map((k) => (
          <button key={k} onClick={() => setTopic(k)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${topic === k ? 'bg-gold text-dark border-gold' : 'bg-dark-mid text-white/60 border-white/10 hover:border-gold'}`}>
            {k === 'all' ? t('all') : t(`topics.${k}`)}
          </button>
        ))}
      </div>
      {notes === null ? null : list.length === 0 ? (
        <p className="text-text-muted py-12 text-center">{t('empty')}</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {list.map((n, i) => <MarketNoteCard key={n.id} note={n} index={i} large={i === 0 && topic === 'all' && list.length > 1} />)}
        </div>
      )}
      <p className="text-xs text-text-muted mt-10 max-w-2xl">{t('disclaimer')}</p>
    </>
  );
}
