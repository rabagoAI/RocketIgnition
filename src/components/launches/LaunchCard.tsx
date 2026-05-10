import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { SpaceDevsLaunch } from '@/src/types/spacedevs';
import { getLaunchStatusColor, getLaunchStatusLabel } from '@/src/lib/launchUtils';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

interface Props {
  launch: SpaceDevsLaunch;
  isPast?: boolean;
}

function timeLabel(netISO: string, isPast: boolean): string {
  if (isPast) {
    return new Date(netISO).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const diff = new Date(netISO).getTime() - Date.now();
  if (diff <= 0) return 'Lanzado';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 7) return `En ${days} días`;
  if (days > 0) return `En ${days}d ${hours}h`;
  if (hours > 0) return `En ${hours}h ${mins}m`;
  return `En ${mins} min`;
}

export default function LaunchCard({ launch, isPast = false }: Props) {
  const statusColor = getLaunchStatusColor(launch.status.abbrev);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/launch/${launch.id}`)}
      activeOpacity={0.88}
    >
      {/* Imagen de fondo */}
      {launch.image ? (
        <Image source={{ uri: launch.image }} style={styles.image} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(8,12,20,0.9)', Colors.background]}
        locations={[0, 0.55, 1]}
        style={styles.gradient}
      />

      <View style={styles.content}>
        {/* Fila superior: badge de estado + tiempo */}
        <View style={styles.topRow}>
          <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: statusColor + '22' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getLaunchStatusLabel(launch.status.abbrev)}
            </Text>
          </View>
          <Text style={[styles.timeText, isPast && styles.timeTextPast]}>
            {timeLabel(launch.net, isPast)}
          </Text>
        </View>

        {/* Nombre de misión */}
        <Text style={styles.missionName} numberOfLines={2}>{launch.name}</Text>

        {/* Agencia · Cohete */}
        <Text style={styles.meta} numberOfLines={1}>
          {launch.launch_service_provider.abbrev}
          {' · '}
          {launch.rocket.configuration.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 160,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    backgroundColor: Colors.cardElevated,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  timeText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  timeTextPast: { color: Colors.textMuted },
  missionName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 3,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
