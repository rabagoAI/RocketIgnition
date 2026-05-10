import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { NotificationPreferences } from '../types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useNotificationPreferences() {
  const { session } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data } = await db.from('notification_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    setPrefs(data ?? null);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  async function update(fields: Partial<Omit<NotificationPreferences, 'id' | 'user_id'>>) {
    if (!session || !prefs) return;
    setSaving(true);
    const updated = { ...prefs, ...fields };
    await db.from('notification_preferences')
      .update(fields)
      .eq('user_id', session.user.id);
    setPrefs(updated);
    setSaving(false);
  }

  return { prefs, loading, saving, update };
}
