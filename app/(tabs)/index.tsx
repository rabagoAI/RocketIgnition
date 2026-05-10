import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNextLaunch } from '@/src/hooks/useLaunches';
import { useCountdown } from '@/src/hooks/useCountdown';
import CountdownDisplay from '@/src/components/ui/CountdownDisplay';
import { Colors, Spacing, Radii } from '@/src/lib/theme';
import { getLaunchStatusLabel, getLaunchStatusColor } from '@/src/lib/launchUtils';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { launch, loading, error, refetch } = useNextLaunch();
  const countdown = useCountdown(launch?.net ?? null);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>
          ROCKET<Text style={styles.appNameAccent}>IGNITION</Text>
        </Text>
      </View>

      {/* Hero: próximo lanzamiento */}
      <View style={styles.heroSection}>
        <Text style={styles.sectionLabel}>PRÓXIMO LANZAMIENTO</Text>

        {loading && !launch ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error al cargar: {error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : launch ? (
          <TouchableOpacity
            style={styles.heroCard}
            onPress={() => router.push(`/launch/${launch.id}`)}
            activeOpacity={0.85}
          >
            {launch.image && (
              <Image
                source={{ uri: launch.image }}
                style={styles.heroImage}
                contentFit="cover"
                transition={300}
              />
            )}
            <View style={styles.heroOverlay} />

            <View style={styles.heroContent}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getLaunchStatusColor(launch.status.abbrev) + '33',
                    borderColor: getLaunchStatusColor(launch.status.abbrev),
                  },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: getLaunchStatusColor(launch.status.abbrev) }]} />
                <Text style={[styles.statusText, { color: getLaunchStatusColor(launch.status.abbrev) }]}>
                  {getLaunchStatusLabel(launch.status.abbrev)}
                </Text>
              </View>

              <Text style={styles.heroMission} numberOfLines={2}>
                {launch.name}
              </Text>
              <Text style={styles.heroAgency}>
                {launch.launch_service_provider.abbrev} · {launch.rocket.configuration.name}
              </Text>

              <View style={styles.countdownContainer}>
                <CountdownDisplay {...countdown} />
              </View>

              <Text style={styles.heroPad} numberOfLines={1}>
                {launch.pad.location.name}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },

  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 3,
  },
  appNameAccent: {
    color: Colors.primary,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  heroSection: { marginBottom: Spacing.xl },

  heroCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 300,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,12,20,0.72)',
  },
  heroContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    minHeight: 300,
    justifyContent: 'flex-end',
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

  heroMission: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 26,
  },
  heroAgency: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },

  countdownContainer: {
    marginBottom: Spacing.md,
  },

  heroPad: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },

  errorBox: { alignItems: 'center', padding: Spacing.xl },
  errorText: { color: Colors.textSecondary, marginBottom: Spacing.md },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.sm,
  },
  retryText: { color: Colors.white, fontWeight: '700' },
});
