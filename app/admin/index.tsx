import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function AdminIndexScreen() {
  const { isAdmin, loading, session } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!session) return <Redirect href="/auth/login" />;

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.title}>Acceso restringido</Text>
        <Text style={styles.sub}>Esta sección es solo para administradores.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de administración</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin/rockets')}>
        <Text style={styles.btnText}>🚀 Gestionar cohetes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  lockIcon: { fontSize: 48, marginBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  sub: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.xl, textAlign: 'center' },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: Radii.md },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
