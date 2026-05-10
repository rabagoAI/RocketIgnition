import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/src/lib/supabase';
import type {
  RocketRow, RocketInsert, RocketVersionRow, RocketVersionInsert,
  RocketComponentRow, RocketComponentInsert,
} from '@/src/types/database';

const db = supabase as any;

// ── Rockets ──────────────────────────────────────────────────────────────────

export function useAdminRocketList() {
  const [rockets, setRockets] = useState<RocketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await db
      .from('rockets')
      .select('*')
      .order('name', { ascending: true });
    if (e) setError(e.message);
    else setRockets(data ?? []);
    setLoading(false);
  }, []);

  async function togglePublish(rocket: RocketRow) {
    await db.from('rockets').update({ is_published: !rocket.is_published }).eq('id', rocket.id);
    setRockets(prev =>
      prev.map(r => (r.id === rocket.id ? { ...r, is_published: !r.is_published } : r))
    );
  }

  async function deleteRocket(id: string) {
    await db.from('rockets').delete().eq('id', id);
    setRockets(prev => prev.filter(r => r.id !== id));
  }

  return { rockets, loading, error, load, togglePublish, deleteRocket };
}

export function useAdminRocket(id: string) {
  const [rocket, setRocket] = useState<RocketRow | null>(null);
  const [versions, setVersions] = useState<RocketVersionRow[]>([]);
  const [components, setComponents] = useState<RocketComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [rRes, vRes, cRes] = await Promise.all([
      db.from('rockets').select('*').eq('id', id).single(),
      db.from('rocket_versions').select('*').eq('rocket_id', id).order('year', { ascending: true }),
      db.from('rocket_components').select('*').eq('rocket_id', id).order('order_index', { ascending: true }),
    ]);
    if (rRes.error) { setError(rRes.error.message); setLoading(false); return; }
    setRocket(rRes.data);
    setVersions(vRes.data ?? []);
    setComponents(cRes.data ?? []);
    setLoading(false);
  }, [id]);

  async function updateRocket(fields: Partial<RocketInsert>) {
    setSaving(true);
    const { error: e } = await db.from('rockets').update(fields).eq('id', id);
    if (!e) setRocket(prev => prev ? { ...prev, ...fields } : prev);
    setSaving(false);
    return e?.message ?? null;
  }

  // Sube imagen al Storage y actualiza image_url del cohete
  async function uploadImage(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const path = `rockets/${id}/main.${ext}`;

    const resp = await fetch(asset.uri);
    const blob = await resp.blob();
    const { error: upErr } = await supabase.storage.from('rockets').upload(path, blob, {
      contentType: `image/${ext}`,
      upsert: true,
    });
    if (upErr) return null;

    const { data: urlData } = supabase.storage.from('rockets').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    await updateRocket({ image_url: publicUrl });
    return publicUrl;
  }

  // ── Versiones ────────────────────────────────────────────────────────────

  async function addVersion(insert: Omit<RocketVersionInsert, 'rocket_id'>) {
    const { data, error: e } = await db
      .from('rocket_versions')
      .insert({ ...insert, rocket_id: id })
      .select()
      .single();
    if (!e && data) setVersions(prev => [...prev, data]);
    return e?.message ?? null;
  }

  async function deleteVersion(versionId: string) {
    await db.from('rocket_versions').delete().eq('id', versionId);
    setVersions(prev => prev.filter(v => v.id !== versionId));
    setComponents(prev => prev.filter(c => c.version_id !== versionId));
  }

  // ── Componentes ──────────────────────────────────────────────────────────

  async function addComponent(insert: Omit<RocketComponentInsert, 'rocket_id'>): Promise<RocketComponentRow | null> {
    const nextIndex = components.length;
    const { data, error: e } = await db
      .from('rocket_components')
      .insert({ ...insert, rocket_id: id, order_index: nextIndex })
      .select()
      .single();
    if (!e && data) {
      setComponents(prev => [...prev, data]);
      return data;
    }
    return null;
  }

  async function updateComponent(componentId: string, fields: Partial<RocketComponentInsert>) {
    const { error: e } = await db
      .from('rocket_components')
      .update(fields)
      .eq('id', componentId);
    if (!e) {
      setComponents(prev =>
        prev.map(c => (c.id === componentId ? { ...c, ...fields } : c))
      );
    }
    return e?.message ?? null;
  }

  async function deleteComponent(componentId: string) {
    await db.from('rocket_components').delete().eq('id', componentId);
    setComponents(prev => prev.filter(c => c.id !== componentId));
  }

  // Genera descripciones con Claude Haiku vía Edge Function
  async function generateDescriptions(componentName: string): Promise<{
    short_description: string;
    full_description: string;
    simple_description: string;
    key_fact: string;
  } | null> {
    const { data, error: e } = await supabase.functions.invoke('generate-component', {
      body: {
        rocketName: rocket?.name ?? '',
        componentName,
        rocketDescription: rocket?.description ?? '',
      },
    });
    if (e || !data) return null;
    return data;
  }

  return {
    rocket, versions, components, loading, saving, error,
    load, updateRocket, uploadImage,
    addVersion, deleteVersion,
    addComponent, updateComponent, deleteComponent, generateDescriptions,
    setComponents,
  };
}

// ── Crear cohete ─────────────────────────────────────────────────────────────

export async function createRocket(insert: RocketInsert): Promise<{ id: string } | null> {
  const { data, error } = await db
    .from('rockets')
    .insert(insert)
    .select('id')
    .single();
  if (error || !data) return null;
  return data;
}
