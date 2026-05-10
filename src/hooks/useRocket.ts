import { useState, useEffect, useCallback } from 'react';
import type { Rocket, RocketVersion, RocketComponent } from '../types/database';
import { supabase } from '../lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useRocketList() {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db
        .from('rockets')
        .select('*')
        .eq('is_published', true)
        .order('name', { ascending: true });
      if (err) throw new Error(err.message);
      setRockets((data ?? []) as Rocket[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar cohetes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { rockets, loading, error, refetch: load };
}

interface RocketData {
  rocket: Rocket | null;
  versions: RocketVersion[];
  components: RocketComponent[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRocket(id: string): RocketData {
  const [rocket, setRocket] = useState<Rocket | null>(null);
  const [versions, setVersions] = useState<RocketVersion[]>([]);
  const [components, setComponents] = useState<RocketComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rRes, vRes, cRes] = await Promise.all([
        db.from('rockets').select('*').eq('id', id).single(),
        db.from('rocket_versions').select('*').eq('rocket_id', id).order('year', { ascending: true }),
        db.from('rocket_components').select('*').eq('rocket_id', id).order('order_index', { ascending: true }),
      ]);
      if (rRes.error) throw new Error(rRes.error.message);
      setRocket(rRes.data as Rocket);
      setVersions((vRes.data ?? []) as RocketVersion[]);
      setComponents((cRes.data ?? []) as RocketComponent[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el cohete');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { rocket, versions, components, loading, error, refetch: load };
}
