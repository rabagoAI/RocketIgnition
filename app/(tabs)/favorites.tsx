import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { useFavorites } from '@/src/hooks/useFavorites';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function FavoritesScreen() {
  const { session, isAdmin, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { rockets, launches, loading, removeRocket, removeLaunch } = useFavorites();

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>🔖</Text>
        <Text style={styles.title}>Guarda tus favoritos</Text>
        <Text style={styles.sub}>
          Inicia sesión para guardar lanzamientos y cohetes y acceder a ellos desde cualquier dispositivo.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.registerLink}>
          <Text style={styles.registerText}>¿No tienes cuenta? <Text style={styles.registerAccent}>Regístrate gratis</Text></Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cuenta */}
      <Text style={styles.header}>Mi cuenta</Text>
      <Text style={styles.email}>{session.user.email}</Text>

      {/* Accesos directos */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/notifications')}>
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>Notificaciones</Text>
            <Text style={styles.menuDesc}>Configura avisos de lanzamientos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* ── Cohetes favoritos ─────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Cohetes guardados</Text>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
      ) : rockets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="rocket-outline" size={28} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin cohetes guardados</Text>
        </View>
      ) : (
        <View style={styles.listCard}>
          {rockets.map((fav, i) => (
            <View key={fav.favoriteId}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.rocketRow}>
                <TouchableOpacity
                  style={styles.rocketRowContent}
                  onPress={() => router.push(`/rocket/${fav.rocket.id}`)}
                >
                  {fav.rocket.image_url ? (
                    <Image source={{ uri: fav.rocket.image_url }} style={styles.rocketThumb} contentFit="contain" />
                  ) : (
                    <View style={[styles.rocketThumb, styles.rocketThumbPlaceholder]}>
                      <Ionicons name="rocket-outline" size={18} color={Colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.rocketInfo}>
                    <Text style={styles.rocketName} numberOfLines={1}>{fav.rocket.name}</Text>
                    <Text style={styles.rocketAgency} numberOfLines={1}>{fav.rocket.agency}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRocket(fav.favoriteId)} hitSlop={8} style={styles.removeBtn}>
                  <Ionicons name="heart" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Lanzamientos favoritos ────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Lanzamientos guardados</Text>
      {loading ? null : launches.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={28} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin lanzamientos guardados</Text>
        </View>
      ) : (
        <View style={styles.listCard}>
          {launches.map((fav, i) => (
            <View key={fav.favoriteId}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.launchRow}>
                <TouchableOpacity
                  style={styles.launchRowContent}
                  onPress={() => router.push(`/launch/${fav.launchId}`)}
                >
                  <View style={styles.launchIcon}>
                    <Ionicons name="rocket-outline" size={16} color={Colors.accent} />
                  </View>
                  <Text style={styles.launchName} numberOfLines={2}>{fav.launchName}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeLaunch(fav.favoriteId)} hitSlop={8} style={styles.removeBtn}>
                  <Ionicons name="bookmark" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Panel admin */}
      {isAdmin && (
        <TouchableOpacity style={styles.adminBtn} onPress={() => router.push('/admin')}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.accent} />
          <Text style={styles.adminBtnText}>Panel de administración</Text>
        </TouchableOpacity>
      )}

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.md },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },

  // Sin sesión
  icon: { fontSize: 56, marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  sub: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: Spacing.xl },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radii.md, width: '100%', alignItems: 'center' },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  registerLink: { marginTop: Spacing.md, padding: Spacing.sm },
  registerText: { color: Colors.textSecondary, fontSize: 14 },
  registerAccent: { color: Colors.primary, fontWeight: '700' },

  // Con sesión
  header: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: Spacing.xs },
  email: { color: Colors.textMuted, fontSize: 13, marginBottom: Spacing.xl },
  menu: {
    backgroundColor: Colors.card, borderRadius: Radii.md,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  menuIcon: {
    width: 36, height: 36, borderRadius: Radii.sm,
    backgroundColor: Colors.cardElevated, alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  menuDesc: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },

  // Secciones de favoritos
  sectionTitle: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: Spacing.sm, marginTop: Spacing.xs,
  },
  listCard: {
    backgroundColor: Colors.card, borderRadius: Radii.md,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: Spacing.xl,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.md },
  emptyCard: {
    backgroundColor: Colors.card, borderRadius: Radii.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  emptyText: { color: Colors.textMuted, fontSize: 13 },

  // Cohete
  rocketRow: { flexDirection: 'row', alignItems: 'center' },
  rocketRowContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.md,
  },
  rocketThumb: { width: 40, height: 40, borderRadius: Radii.sm },
  rocketThumbPlaceholder: {
    backgroundColor: Colors.cardElevated, alignItems: 'center', justifyContent: 'center',
  },
  rocketInfo: { flex: 1 },
  rocketName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  rocketAgency: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },

  // Lanzamiento
  launchRow: { flexDirection: 'row', alignItems: 'center' },
  launchRowContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.md,
  },
  launchIcon: {
    width: 32, height: 32, borderRadius: Radii.sm,
    backgroundColor: Colors.cardElevated, alignItems: 'center', justifyContent: 'center',
  },
  launchName: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },

  // Quitar favorito
  removeBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },

  // Admin
  adminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1, borderColor: Colors.accent,
  },
  adminBtnText: { color: Colors.accent, fontSize: 15, fontWeight: '600' },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, justifyContent: 'center',
  },
  signOutText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
