import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRocketList } from '@/src/hooks/useRocket';
import { Colors, Spacing, Radii } from '@/src/lib/theme';
import type { Rocket } from '@/src/types/database';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

function RocketCard({ rocket }: { rocket: Rocket }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/rocket/${rocket.id}`)}
    >
      {rocket.image_url ? (
        <Image source={{ uri: rocket.image_url }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderIcon}>🚀</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{rocket.name}</Text>
        <Text style={styles.agency} numberOfLines={1}>{rocket.agency}</Text>
        {rocket.height_m && (
          <Text style={styles.stat}>{rocket.height_m} m</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function RocketsScreen() {
  const { rockets, loading, error, refetch } = useRocketList();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (rockets.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay cohetes publicados aún.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rockets}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RocketCard rocket={item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.header}>Enciclopedia de cohetes</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  list: { padding: Spacing.md, paddingBottom: Spacing.xl },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  header: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#0D1220',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#0D1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48 },
  info: { padding: Spacing.sm },
  name: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  agency: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  stat: { color: Colors.accent, fontSize: 12, fontWeight: '500' },
  errorText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: Spacing.md },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.sm },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
