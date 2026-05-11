import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import type { RocketRow } from '@/src/types/database';

const db = supabase as any;

export interface FavoriteRocket {
  favoriteId: string;
  rocket: RocketRow;
}

export interface FavoriteLaunch {
  favoriteId: string;
  launchId: string;
  launchName: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const [rockets, setRockets] = useState<FavoriteRocket[]>([]);
  const [launches, setLaunches] = useState<FavoriteLaunch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRockets([]);
      setLaunches([]);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);

      // Favoritos de cohetes
      const { data: rocketFavs } = await db
        .from('user_favorites')
        .select('id, rocket_id')
        .eq('user_id', user!.id)
        .not('rocket_id', 'is', null)
        .order('created_at', { ascending: false });

      if (rocketFavs && rocketFavs.length > 0) {
        const ids = rocketFavs.map((f: any) => f.rocket_id as string);
        const { data: rocketsData } = await db
          .from('rockets')
          .select('*')
          .in('id', ids);

        if (rocketsData) {
          const byId = Object.fromEntries((rocketsData as RocketRow[]).map(r => [r.id, r]));
          setRockets(
            rocketFavs
              .filter((f: any) => byId[f.rocket_id])
              .map((f: any) => ({ favoriteId: f.id, rocket: byId[f.rocket_id] as RocketRow }))
          );
        }
      } else {
        setRockets([]);
      }

      // Favoritos de lanzamientos
      const { data: launchFavs } = await db
        .from('user_favorites')
        .select('id, launch_id, launch_name')
        .eq('user_id', user!.id)
        .not('launch_id', 'is', null)
        .order('created_at', { ascending: false });

      setLaunches(
        (launchFavs ?? []).map((f: any) => ({
          favoriteId: f.id,
          launchId: f.launch_id as string,
          launchName: f.launch_name ?? f.launch_id,
        }))
      );

      setLoading(false);
    }

    load();
  }, [user?.id]);

  async function removeRocket(favoriteId: string) {
    await db.from('user_favorites').delete().eq('id', favoriteId);
    setRockets(prev => prev.filter(f => f.favoriteId !== favoriteId));
  }

  async function removeLaunch(favoriteId: string) {
    await db.from('user_favorites').delete().eq('id', favoriteId);
    setLaunches(prev => prev.filter(f => f.favoriteId !== favoriteId));
  }

  return { rockets, launches, loading, removeRocket, removeLaunch };
}
