import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/lib/theme';

export default function NotificationsSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Configuración de notificaciones — próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center' },
});
