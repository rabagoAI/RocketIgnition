import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/lib/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Modal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.textPrimary, fontSize: 18 },
});
