import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/lib/theme';

export default function RocketCompareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Comparador de cohetes</Text>
      <Text style={styles.sub}>Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { color: Colors.textPrimary, fontSize: 16, marginBottom: 8 },
  sub: { color: Colors.textSecondary, fontSize: 14 },
});
