import { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminRocketList } from '@/src/hooks/useAdminRockets';
import type { RocketRow } from '@/src/types/database';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function AdminRocketListScreen() {
  const insets = useSafeAreaInsets();
  const { rockets, loading, error, load, togglePublish, deleteRocket } = useAdminRocketList();

  useEffect(() => { load(); }, [load]);

  function confirmDelete(rocket: RocketRow) {
    Alert.alert(
      'Eliminar cohete',
      `¿Eliminar "${rocket.name}" y todos sus componentes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteRocket(rocket.id) },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <FlatList
        data={rockets}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay cohetes todavía</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardMain}
              onPress={() => router.push(`/admin/rockets/${item.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardAgency}>{item.agency} · {item.country}</Text>
              </View>

              <View style={[styles.badge, item.is_published ? styles.badgePublished : styles.badgeDraft]}>
                <Text style={[styles.badgeText, item.is_published ? styles.badgeTextPublished : styles.badgeTextDraft]}>
                  {item.is_published ? 'Publicado' : 'Borrador'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => togglePublish(item)}
                hitSlop={4}
              >
                <Ionicons
                  name={item.is_published ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={item.is_published ? Colors.textMuted : Colors.accent}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => confirmDelete(item)}
                hitSlop={4}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB nuevo cohete */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => router.push('/admin/rockets/new')}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  list: { padding: Spacing.md, gap: 10 },
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardInfo: { flex: 1 },
  cardName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  cardAgency: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  badgePublished: { backgroundColor: Colors.statusGo + '22', borderColor: Colors.statusGo + '55' },
  badgeDraft: { backgroundColor: Colors.border, borderColor: Colors.border },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextPublished: { color: Colors.statusGo },
  badgeTextDraft: { color: Colors.textMuted },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.sm,
    gap: 2,
    borderLeftWidth: 1,
    borderColor: Colors.border,
  },
  actionBtn: {
    width: 38,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: Spacing.lg },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radii.md },
  retryText: { color: Colors.white, fontWeight: '700' },
});
