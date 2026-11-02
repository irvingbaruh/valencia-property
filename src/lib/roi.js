import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FALLBACK } from '@/lib/roiCalc';

export { computeROI, FALLBACK } from '@/lib/roiCalc';

export function useRoiData() {
  const [data, setData] = useState(FALLBACK);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [d, m, a] = await Promise.all([
        supabase.from('roi_districts').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('roi_mortgages').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('roi_assumptions').select('key, value, updated_at'),
      ]);
      if (cancelled) return;
      if (!d.error && d.data?.length && !a.error && a.data?.length) {
        const assumptions = { ...FALLBACK.assumptions };
        a.data.forEach((row) => (assumptions[row.key] = Number(row.value)));
        const stamps = [...d.data, ...(m.data || []), ...a.data].map((r) => r.updated_at).filter(Boolean);
        setData({
          districts: d.data.map((r) => ({ ...r, ref_price: Number(r.ref_price), ref_rent: Number(r.ref_rent) })),
          mortgages: (m.data || []).map((r) => ({
            ...r,
            rate_pct: Number(r.rate_pct),
            max_ltv_pct: Number(r.max_ltv_pct),
            fee_pct: Number(r.fee_pct),
          })),
          assumptions,
          updatedAt: stamps.sort().slice(-1)[0] || null,
          fromFallback: false,
        });
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, ready };
}

