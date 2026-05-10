import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function FavoritesScreen() {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <Text style={styles.header}>Mi cuenta</Text>

      <Text style={styles.email}>{session.user.email}</Text>

      {/* Accesos directos */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/notifications')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>Notificaciones</Text>
            <Text style={styles.menuDesc}>Configura avisos de lanzamientos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} disabled>
          <View style={styles.menuIcon}>
            <Ionicons name="heart-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>Favoritos</Text>
            <Text style={styles.menuDesc}>Lanzamientos y cohetes guardados — próximamente</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
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
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.md + 36 + Spacing.md },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, justifyContent: 'center',
  },
  signOutText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
