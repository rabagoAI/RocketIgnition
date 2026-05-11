import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useLaunchDetail } from '@/src/hooks/useLaunches';
import { useRocketForLaunch } from '@/src/hooks/useRocketForLaunch';
import { useCountdown } from '@/src/hooks/useCountdown';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';
import CountdownDisplay from '@/src/components/ui/CountdownDisplay';
import { getLaunchStatusColor, getLaunchStatusLabel, formatLaunchDate } from '@/src/lib/launchUtils';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function LaunchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { launch, loading, error } = useLaunchDetail(id);
  const countdown = useCountdown(launch?.net ?? null);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  const rocketName = launch?.rocket.configuration.name ?? null;
  const rocketId = useRocketForLaunch(rocketName);

  // Comprobar si está en favoritos
  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('launch_id', id)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, id]);

  async function toggleFavorite() {
    if (!user) { router.push('/auth/login'); return; }
    setTogglingFav(true);
    try {
      if (isFavorite) {
        await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('launch_id', id);
      } else {
        await (supabase as any).from('user_favorites').insert({ user_id: user.id, launch_id: id, launch_name: launch?.name ?? null });
      }
      setIsFavorite(f => !f);
    } finally {
      setTogglingFav(false);
    }
  }

  function openMaps() {
    if (!launch) return;
    const { latitude, longitude, name } = launch.pad.location;
    const label = encodeURIComponent(launch.pad.name);
    const url = Platform.OS === 'ios'
      ? `maps://maps.apple.com/?q=${label}&ll=${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`)
    );
  }

  function openYouTube(url: string) {
    Linking.openURL(url);
  }

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error || !launch) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error ?? 'No se pudo cargar el lanzamiento'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getLaunchStatusColor(launch.status.abbrev);
  const isPast = new Date(launch.net).getTime() < Date.now();
  const youtubeLinks = launch.vidURLs.filter(v => v.url.includes('youtube') || v.url.includes('youtu.be'));

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ── Header con imagen ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          {launch.image
            ? <Image source={{ uri: launch.image }} style={styles.headerImage} contentFit="cover" transition={300} />
            : <View style={[styles.headerImage, styles.headerPlaceholder]} />
          }
          <LinearGradient
            colors={['rgba(8,12,20,0.5)', 'transparent', Colors.background]}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Botones encima de la imagen */}
          <View style={[styles.headerActions, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={toggleFavorite} disabled={togglingFav}>
              {togglingFav
                ? <ActivityIndicator color={Colors.primary} size="small" />
                : <Ionicons name={isFavorite ? 'bookmark' : 'bookmark-outline'} size={22} color={isFavorite ? Colors.primary : Colors.textPrimary} />
              }
            </TouchableOpacity>
          </View>

          {/* Info de misión sobre la imagen */}
          <View style={styles.headerContent}>
            <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: statusColor + '22' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getLaunchStatusLabel(launch.status.abbrev)}
              </Text>
            </View>
            <Text style={styles.missionName}>{launch.name}</Text>
            <Text style={styles.agencyRocket}>
              {launch.launch_service_provider.name} · {launch.rocket.configuration.name}
            </Text>
          </View>
        </View>

        {/* ── Cuenta atrás (solo si es próximo) ────────────────────────────── */}
        {!isPast && (
          <View style={styles.countdownSection}>
            <CountdownDisplay {...countdown} />
            <Text style={styles.netDate}>{formatLaunchDate(launch.net)}</Text>
          </View>
        )}

        {/* ── La misión ─────────────────────────────────────────────────────── */}
        {launch.mission?.description && (
          <Section title="La misión">
            <Text style={styles.body}>{launch.mission.description}</Text>
          </Section>
        )}

        {/* ── Payload ───────────────────────────────────────────────────────── */}
        {(launch.mission?.type || launch.mission?.orbit) && (
          <Section title="Payload">
            {launch.mission?.type && (
              <InfoRow icon="cube-outline" label="Tipo" value={launch.mission.type} />
            )}
            {launch.mission?.orbit && (
              <InfoRow icon="planet-outline" label="Órbita" value={launch.mission.orbit.name} />
            )}
          </Section>
        )}

        {/* ── Plataforma ────────────────────────────────────────────────────── */}
        <Section title="Plataforma de lanzamiento">
          <InfoRow icon="location-outline" label="Pad" value={launch.pad.name} />
          <InfoRow icon="earth-outline" label="Ubicación" value={launch.pad.location.name} />
          {launch.pad.location.latitude && (
            <TouchableOpacity style={styles.mapsBtn} onPress={openMaps}>
              <Ionicons name="map-outline" size={16} color={Colors.accent} />
              <Text style={styles.mapsBtnText}>Ver en mapa</Text>
            </TouchableOpacity>
          )}
        </Section>

        {/* ── Ventana de lanzamiento ────────────────────────────────────────── */}
        {launch.window_start && (
          <Section title="Ventana de lanzamiento">
            <InfoRow icon="time-outline" label="Apertura" value={formatLaunchDate(launch.window_start)} />
            {launch.window_end && launch.window_end !== launch.window_start && (
              <InfoRow icon="time-outline" label="Cierre" value={formatLaunchDate(launch.window_end)} />
            )}
            {launch.probability != null && (
              <InfoRow icon="analytics-outline" label="Probabilidad" value={`${launch.probability}%`} />
            )}
          </Section>
        )}

        {/* ── Livestream ────────────────────────────────────────────────────── */}
        {youtubeLinks.length > 0 && (
          <Section title="Cobertura en directo">
            {youtubeLinks.map((link, i) => (
              <TouchableOpacity key={i} style={styles.youtubeBtn} onPress={() => openYouTube(link.url)}>
                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                <Text style={styles.youtubeBtnText} numberOfLines={1}>
                  {link.title || 'Ver en YouTube'}
                </Text>
                <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </Section>
        )}

        {/* ── Ver infografía del cohete ─────────────────────────────────────── */}
        {rocketId && (
          <View style={styles.infographicSection}>
            <TouchableOpacity
              style={styles.infographicBtn}
              onPress={() => router.push(`/rocket/${rocketId}`)}
              activeOpacity={0.85}
            >
              <Text style={styles.infographicBtnText}>🚀 Ver infografía del cohete</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },

  // Header
  header: { height: 320, overflow: 'hidden' },
  headerImage: { ...StyleSheet.absoluteFillObject },
  headerPlaceholder: { backgroundColor: Colors.cardElevated },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(8,12,20,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  missionName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28, marginBottom: 4 },
  agencyRocket: { fontSize: 13, color: Colors.textSecondary },

  // Countdown
  countdownSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  netDate: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },

  // Sections
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 2, marginBottom: Spacing.sm },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  body: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoIcon: { marginRight: 8, marginTop: 2 },
  infoLabel: { width: 90, color: Colors.textMuted, fontSize: 13 },
  infoValue: { flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '500' },

  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingVertical: 4,
  },
  mapsBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },

  youtubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  youtubeBtnText: { flex: 1, color: Colors.textPrimary, fontSize: 14 },

  infographicSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  infographicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 16,
    gap: 8,
  },
  infographicBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },

  errorText: { color: Colors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radii.md },
  retryText: { color: Colors.white, fontWeight: '700' },
});
