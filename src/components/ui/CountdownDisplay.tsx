import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/src/lib/theme';

interface Props {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.digitBlock}>
      <View style={styles.digitBox}>
        <Text style={styles.digitValue}>{String(value).padStart(2, '0')}</Text>
      </View>
      <Text style={styles.digitLabel}>{label}</Text>
    </View>
  );
}

export default function CountdownDisplay({ days, hours, minutes, seconds, isPast }: Props) {
  if (isPast) {
    return (
      <View style={styles.pastContainer}>
        <Text style={styles.pastText}>LANZADO</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Digit value={days} label="DÍAS" />
      <Text style={styles.separator}>:</Text>
      <Digit value={hours} label="HRS" />
      <Text style={styles.separator}>:</Text>
      <Digit value={minutes} label="MIN" />
      <Text style={styles.separator}>:</Text>
      <Digit value={seconds} label="SEG" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  digitBlock: {
    alignItems: 'center',
    gap: 4,
  },
  digitBox: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 52,
    alignItems: 'center',
  },
  digitValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  digitLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  separator: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 14,
  },
  pastContainer: {
    backgroundColor: Colors.statusGo + '22',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pastText: {
    color: Colors.statusGo,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
  },
});
