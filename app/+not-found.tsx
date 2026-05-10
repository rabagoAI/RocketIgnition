import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/lib/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pantalla no encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>Ruta no encontrada</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 20 },
  link: { padding: 12 },
  linkText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
});
