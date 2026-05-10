import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/lib/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mi perfil — próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { color: Colors.textSecondary, fontSize: 16 },
});
