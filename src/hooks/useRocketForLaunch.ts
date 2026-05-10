import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRocketForLaunch(rocketName: string | null) {
  const [rocketId, setRocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!rocketName) return;

    // Usamos 'as any' porque los tipos manuales de Database no satisfacen
    // el contrato interno de supabase-js v2 (usar `supabase gen types` en producción)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('rockets') as any)
      .select('id')
      .ilike('name', `%${rocketName.split(' ')[0]}%`)
      .eq('is_published', true)
      .limit(1)
      .maybeSingle()
      .then(({ data }: { data: { id: string } | null }) => {
        setRocketId(data?.id ?? null);
      });
  }, [rocketName]);

  return rocketId;
}
