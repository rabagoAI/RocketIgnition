import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, NewsResponse } from '../types/news';

const BASE_URL = 'https://api.spaceflightnewsapi.net/v4';
const PAGE_SIZE = 20;

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
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
      const url = `${BASE_URL}/articles/?limit=${PAGE_SIZE}&ordering=-published_at`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NewsResponse = await res.json();
      setArticles(data.results);
      setNextUrl(data.next);
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message);
      } else {
        setError('No se pudo cargar las noticias. Toca para reintentar.');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(nextUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NewsResponse = await res.json();
      setArticles(prev => [...prev, ...data.results]);
      setNextUrl(data.next);
    } catch {
      // Error de paginación no bloqueante
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  useEffect(() => { load(); }, [load]);

  return { articles, loading, loadingMore, error, hasMore: !!nextUrl, refetch: load, loadMore };
}
