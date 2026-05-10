import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import type { RocketVersion } from '@/src/types/database';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

interface Props {
  versions: RocketVersion[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function VersionSelector({ versions, selectedId, onSelect }: Props) {
  if (versions.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <TouchableOpacity
          style={[styles.chip, selectedId === null && styles.chipActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.chipText, selectedId === null && styles.chipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>

        {versions.map(v => (
          <TouchableOpacity
            key={v.id}
            style={[styles.chip, selectedId === v.id && styles.chipActive]}
            onPress={() => onSelect(v.id)}
          >
            <Text style={[styles.chipText, selectedId === v.id && styles.chipTextActive]}>
              {v.version_name}
              {v.year ? ` (${v.year})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(13,18,32,0.85)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white, fontWeight: '700' },
});
