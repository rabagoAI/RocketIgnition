import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export const AGENCIES = [
  { label: 'Todos', value: '' },
  { label: 'SpaceX', value: 'SpaceX' },
  { label: 'NASA', value: 'NASA' },
  { label: 'ESA', value: 'ESA' },
  { label: 'Rocket Lab', value: 'Rocket Lab' },
  { label: 'ULA', value: 'ULA' },
  { label: 'Roscosmos', value: 'Roscosmos' },
  { label: 'ISRO', value: 'ISRO' },
];

interface Props {
  selected: string;
  onSelect: (value: string) => void;
}

export default function AgencyFilterBar({ selected, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {AGENCIES.map(agency => {
          const active = selected === agency.value;
          return (
            <TouchableOpacity
              key={agency.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(agency.value)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {agency.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.sm },
  scrollContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
