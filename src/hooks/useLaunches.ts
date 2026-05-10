import { useState, useEffect, useCallback } from 'react';
import type { SpaceDevsLaunch, SpaceDevsResponse } from '../types/spacedevs';
import { MOCK_UPCOMING, MOCK_PREVIOUS } from '../lib/mockLaunches';

const BASE_URL = process.env.EXPO_PUBLIC_SPACE_DEVS_BASE_URL ?? 'https://ll.thespacedevs.com/2.2.0';
function getMockData(endpoint: 'upcoming' | 'previous', pageSize: number): SpaceDevsLaunch[] {
  return (endpoint === 'upcoming' ? MOCK_UPCOMING : MOCK_PREVIOUS).slice(0, pageSize);
}

// ── Lista genérica con paginación ─────────────────────────────────────────────

function useLaunchList(endpoint: 'upcoming' | 'previous', pageSize = 20) {
  const [launches, setLaunches] = useState<SpaceDevsLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const url = `${BASE_URL}/launch/${endpoint}/?limit=${pageSize}&format=json`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SpaceDevsResponse = await res.json();
      setLaunches(data.results);
      setNextUrl(data.next);
    } catch {
      setLaunches(getMockData(endpoint, pageSize));
      setNextUrl(null);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [endpoint, pageSize]);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(nextUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SpaceDevsResponse = await res.json();
      setLaunches(prev => [...prev, ...data.results]);
      setNextUrl(data.next);
    } catch {
      // Ignoramos errores de paginación (no bloqueantes)
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  useEffect(() => { load(); }, [load]);

  return { launches, loading, loadingMore, error, hasMore: !!nextUrl, refetch: load, loadMore };
}

// ── Hooks públicos ────────────────────────────────────────────────────────────

export const useLaunches = (pageSize?: number) => useLaunchList('upcoming', pageSize);
export const usePreviousLaunches = (pageSize?: number) => useLaunchList('previous', pageSize);

export function useNextLaunch() {
  const { launches, loading, error, refetch } = useLaunches(1);
  return { launch: launches[0] ?? null, loading, error, refetch };
}

export function useLaunchDetail(id: string) {
  const [launch, setLaunch] = useState<SpaceDevsLaunch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/launch/${id}/?format=json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SpaceDevsLaunch>;
      })
      .then(setLaunch)
      .catch(e => setError(e instanceof Error ? e.message : 'Error de red'))
      .finally(() => setLoading(false));
  }, [id]);

  return { launch, loading, error };
}
