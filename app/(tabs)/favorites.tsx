import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function FavoritesScreen() {
  const { session } = useAuth();

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
    <View style={styles.center}>
      <Text style={styles.sub}>Favoritos — próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  icon: { fontSize: 56, marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  sub: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: Spacing.xl },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radii.md, width: '100%', alignItems: 'center' },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  registerLink: { marginTop: Spacing.md, padding: Spacing.sm },
  registerText: { color: Colors.textSecondary, fontSize: 14 },
  registerAccent: { color: Colors.primary, fontWeight: '700' },
});
