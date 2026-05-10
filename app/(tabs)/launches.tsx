import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLaunches, usePreviousLaunches } from '@/src/hooks/useLaunches';
import LaunchCard from '@/src/components/launches/LaunchCard';
import AgencyFilterBar from '@/src/components/launches/AgencyFilterBar';
import type { SpaceDevsLaunch } from '@/src/types/spacedevs';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

type Tab = 'upcoming' | 'previous';

function filterLaunches(launches: SpaceDevsLaunch[], agency: string, search: string) {
  let list = launches;
  if (agency) {
    list = list.filter(l =>
      l.launch_service_provider.name.toLowerCase().includes(agency.toLowerCase()) ||
      l.launch_service_provider.abbrev.toLowerCase().includes(agency.toLowerCase())
    );
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(l => l.name.toLowerCase().includes(q));
  }
  return list;
}

export default function LaunchesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [agency, setAgency] = useState('');
  const [search, setSearch] = useState('');

  const upcoming = useLaunches(20);
  const previous = usePreviousLaunches(20);

  const active = tab === 'upcoming' ? upcoming : previous;
  const filtered = useMemo(
    () => filterLaunches(active.launches, agency, search),
    [active.launches, agency, search]
  );

  function renderEmpty() {
    if (active.loading) return null;
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyIcon}>🔭</Text>
        <Text style={styles.emptyText}>
          {search || agency ? 'Sin resultados para esa búsqueda' : 'Sin lanzamientos'}
        </Text>
      </View>
    );
  }

  function renderFooter() {
    if (active.loadingMore) return <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} />;
    if (active.hasMore && !active.loading) {
      return (
        <TouchableOpacity style={styles.loadMoreBtn} onPress={active.loadMore}>
          <Text style={styles.loadMoreText}>Cargar más</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Tabs: Próximos / Historial */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>Próximos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'previous' && styles.tabBtnActive]}
          onPress={() => setTab('previous')}
        >
          <Text style={[styles.tabText, tab === 'previous' && styles.tabTextActive]}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar misión..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor={Colors.primary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros por agencia */}
      <AgencyFilterBar selected={agency} onSelect={setAgency} />

      {/* Lista */}
      {active.loading && active.launches.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : active.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{active.error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={active.refetch}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LaunchCard launch={item} isPast={tab === 'previous'} />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={active.loading}
              onRefresh={active.refetch}
              tintColor={Colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: 12,
  },

  list: { paddingTop: Spacing.sm, paddingBottom: 32 },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  errorText: { color: Colors.textSecondary, marginBottom: Spacing.md, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radii.sm },
  retryText: { color: Colors.white, fontWeight: '700' },

  emptyBox: { alignItems: 'center', padding: Spacing.xxl },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center' },

  loadMoreBtn: {
    marginHorizontal: Spacing.lg,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  loadMoreText: { color: Colors.textSecondary, fontWeight: '600' },
});
