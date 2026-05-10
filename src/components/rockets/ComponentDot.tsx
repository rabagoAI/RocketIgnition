import { useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import type { RocketComponent } from '@/src/types/database';
import { Colors } from '@/src/lib/theme';

const DOT_INNER = 14;
const DOT_RING = 30;

interface Props {
  component: RocketComponent;
  isSelected: boolean;
  onPress: (component: RocketComponent) => void;
}

export default function ComponentDot({ component, isSelected, onPress }: Props) {
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 100 })
      ),
      -1,
      false
    );
    return () => cancelAnimation(pulse);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + pulse.value * 1.2 }],
    opacity: 1 - pulse.value,
  }));

  return (
    <TouchableOpacity
      style={[
        styles.hitArea,
        {
          left: `${component.x_percent}%` as unknown as number,
          top: `${component.y_percent}%` as unknown as number,
        },
      ]}
      onPress={() => onPress(component)}
      activeOpacity={0.7}
      hitSlop={8}
    >
      {/* Anillo externo pulsante */}
      <Animated.View style={[styles.outerRing, ringStyle]} />

      {/* Punto interior sólido */}
      <View style={[styles.innerDot, isSelected && styles.innerDotSelected]} />

      {/* Indicador de selección */}
      {isSelected && <View style={styles.selectedRing} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    position: 'absolute',
    width: DOT_RING,
    height: DOT_RING,
    marginLeft: -DOT_RING / 2,
    marginTop: -DOT_RING / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: DOT_RING,
    height: DOT_RING,
    borderRadius: DOT_RING / 2,
    backgroundColor: Colors.primary + '55',
    borderWidth: 1.5,
    borderColor: Colors.primary + '88',
  },
  innerDot: {
    width: DOT_INNER,
    height: DOT_INNER,
    borderRadius: DOT_INNER / 2,
    backgroundColor: Colors.white,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
  innerDotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.white,
  },
  selectedRing: {
    position: 'absolute',
    width: DOT_RING + 6,
    height: DOT_RING + 6,
    borderRadius: (DOT_RING + 6) / 2,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
