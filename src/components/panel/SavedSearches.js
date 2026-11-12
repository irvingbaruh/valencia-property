'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bell, BellOff, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import { gt } from '@/lib/growthText';
import { listSavedSearches, setSearchNotify, deleteSavedSearch, stashSearch } from '@/lib/savedSearches';

// The member's saved searches: switch alerts on or off, reopen the search on the listings page, or delete it.
export default function SavedSearches() {
  const locale = useLocale();
  const { user } = useAuth();
  const s = gt(locale).saved;
  const [list, setList] = useState(null);

  useEffect(() => {
    if (!user) return;
    listSavedSearches(user.id).then(setList);
  }, [user]);

  if (list === null) return null;

  const toggle = async (row) => {
    setList((l) => l.map((x) => (x.id === row.id ? { ...x, notify: !x.notify } : x)));
    const { error } = await setSearchNotify(row.id, !row.notify);
    if (error) setList((l) => l.map((x) => (x.id === row.id ? { ...x, notify: row.notify } : x)));
  };
  const remove = async (row) => {
    setList((l) => l.filter((x) => x.id !== row.id));
    const { error } = await deleteSavedSearch(row.id);
    if (error) setList((l) => [row, ...l]);
  };

  return (
    <section className="dark-card rounded-2xl shadow-sm p-5 sm:p-6 mb-8">
      <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--color-dark)] mb-4">
        <Search className="w-5 h-5 text-[var(--color-gold)]" /> {s.my}
      </h3>
      {list.length === 0 ? (
        <p className="text-sm text-[var(--color-charcoal)]">{s.empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {list.map((row) => (
            <li key={row.id} className="py-3 flex flex-wrap items-center gap-3">
              <p className="flex-1 min-w-[12rem] text-sm font-medium text-[var(--color-dark)]">{row.name}</p>
              <button
                type="button"
                onClick={() => toggle(row)}
                aria-pressed={row.notify}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border ${row.notify ? 'border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-gray-300 text-gray-500'}`}
              >
                {row.notify ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                {row.notify ? s.notifyOn : s.notifyOff}
              </button>
              <a
                href={localePath(locale, 'mulkler')}
                onClick={() => stashSearch(row.filters)}
                className="text-sm font-semibold text-[var(--color-gold)] hover:underline"
              >
                {s.open}
              </a>
              <button type="button" onClick={() => remove(row)} aria-label={s.remove} className="text-red-500 hover:text-red-600 p-1.5">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
