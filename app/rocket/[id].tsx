import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRocket } from '@/src/hooks/useRocket';
import ComponentDot from '@/src/components/rockets/ComponentDot';
import ComponentBottomSheet from '@/src/components/rockets/ComponentBottomSheet';
import VersionSelector from '@/src/components/rockets/VersionSelector';
import type { RocketComponent } from '@/src/types/database';
import { Colors, Spacing, Radii } from '@/src/lib/theme';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';

const MIN_SCALE = 0.9;
const MAX_SCALE = 5;

function clamp(val: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(val, min), max);
}

export default function RocketInfographicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const { rocket, versions, components, loading, error } = useRocket(id);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('rocket_id', id)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, id]);

  async function toggleFavorite() {
    if (!user) { router.push('/auth/login'); return; }
    setTogglingFav(true);
    try {
      if (isFavorite) {
        await (supabase as any).from('user_favorites').delete().eq('user_id', user.id).eq('rocket_id', id);
      } else {
        await (supabase as any).from('user_favorites').insert({ user_id: user.id, rocket_id: id });
      }
      setIsFavorite(f => !f);
    } finally {
      setTogglingFav(false);
    }
  }

  // Estado de UI
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<RocketComponent | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // Componentes filtrados por versión
  const visibleComponents = useMemo(() => {
    if (!selectedVersion) return components;
    return components.filter(c => c.version_id === selectedVersion || c.version_id === null);
  }, [components, selectedVersion]);

  // Bounds reales de la imagen dentro del canvas (con contain hay letterboxing)
  const imageBounds = useMemo(() => {
    const canvasH = H - (insets.top + 52);
    if (!imageNaturalSize) return { x: 0, y: 0, width: W, height: canvasH };
    const imgAspect = imageNaturalSize.width / imageNaturalSize.height;
    const canvasAspect = W / canvasH;
    if (imgAspect < canvasAspect) {
      const w = canvasH * imgAspect;
      return { x: (W - w) / 2, y: 0, width: w, height: canvasH };
    }
    const h = W / imgAspect;
    return { x: 0, y: (canvasH - h) / 2, width: W, height: h };
  }, [imageNaturalSize, W, H, insets.top]);

  // ── Zoom + Pan (Reanimated v4 + Gesture Handler) ──────────────────────────
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        savedScale.value = 1;
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .minDistance(4)
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const imageAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  function handleDotPress(component: RocketComponent) {
    setSelectedComponent(component);
  }

  function resetZoom() {
    scale.value = withSpring(1);
    tx.value = withSpring(0);
    ty.value = withSpring(0);
    savedScale.value = 1;
    savedTx.value = 0;
    savedTy.value = 0;
  }

  // ── Estados de carga ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error || !rocket) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Cohete no encontrado'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const HEADER_H = insets.top + 52;
  const CANVAS_H = H - HEADER_H;

  return (
    <View style={styles.root}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top, height: HEADER_H }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{rocket.name}</Text>

        <View style={styles.headerRight}>
          {/* Favorito */}
          <TouchableOpacity onPress={toggleFavorite} style={styles.headerBtn} hitSlop={8} disabled={togglingFav}>
            {togglingFav
              ? <ActivityIndicator color={Colors.primary} size="small" />
              : <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? Colors.primary : Colors.textSecondary} />
            }
          </TouchableOpacity>

          {/* Toggle técnico/simple */}
          <TouchableOpacity
            style={[styles.modeToggle, isSimpleMode && styles.modeToggleActive]}
            onPress={() => setIsSimpleMode(v => !v)}
          >
            <Ionicons
              name={isSimpleMode ? 'people' : 'flask'}
              size={15}
              color={isSimpleMode ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.modeToggleText, isSimpleMode && styles.modeToggleTextActive]}>
              {isSimpleMode ? 'Simple' : 'Técnico'}
            </Text>
          </TouchableOpacity>

          {/* Reset zoom */}
          <TouchableOpacity onPress={resetZoom} style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="scan-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Selector de versión ──────────────────────────────────────────── */}
      {versions.length > 0 && (
        <View style={[styles.versionBar, { top: HEADER_H }]}>
          <VersionSelector
            versions={versions}
            selectedId={selectedVersion}
            onSelect={setSelectedVersion}
          />
        </View>
      )}

      {/* ── Canvas: imagen + puntos ──────────────────────────────────────── */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.canvas, { height: CANVAS_H }, imageAnimStyle]}>
          {rocket.image_url ? (
            <>
              <Image
                source={{ uri: rocket.image_url }}
                style={styles.rocketImage}
                contentFit="contain"
                transition={400}
                onLoad={e => setImageNaturalSize({ width: e.source.width, height: e.source.height })}
              />
              {/* Puntos dentro del área exacta de la imagen */}
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    left: imageBounds.x,
                    top: imageBounds.y,
                    width: imageBounds.width,
                    height: imageBounds.height,
                  },
                ]}
                pointerEvents="box-none"
              >
                {visibleComponents.map(comp => (
                  <ComponentDot
                    key={comp.id}
                    component={comp}
                    isSelected={selectedComponent?.id === comp.id}
                    onPress={handleDotPress}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={[styles.rocketImage, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>Sin imagen</Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Leyenda de componentes (si no hay uno seleccionado y hay componentes) */}
      {!selectedComponent && visibleComponents.length > 0 && (
        <View style={[styles.hintBadge, { bottom: insets.bottom + 24 }]}>
          <Ionicons name="hand-left-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.hintText}>Toca un punto para ver detalles</Text>
        </View>
      )}

      {/* Sin componentes */}
      {!selectedComponent && visibleComponents.length === 0 && !loading && (
        <View style={[styles.hintBadge, { bottom: insets.bottom + 24 }]}>
          <Text style={styles.hintText}>Sin componentes publicados aún</Text>
        </View>
      )}

      {/* ── Bottom Sheet ─────────────────────────────────────────────────── */}
      {selectedComponent && (
        <ComponentBottomSheet
          component={selectedComponent}
          isSimpleMode={isSimpleMode}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 20,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 4,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  modeToggleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeToggleText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  modeToggleTextActive: { color: Colors.white },

  // Version bar
  versionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
  },

  // Canvas
  canvas: {
    width: '100%',
    overflow: 'hidden',
  },
  rocketImage: {
    flex: 1,
    width: '100%',
  },
  imagePlaceholder: {
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: Colors.textMuted, fontSize: 16 },

  // Hints
  hintBadge: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13,18,32,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintText: { color: Colors.textMuted, fontSize: 13 },

  // Error
  errorText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: Spacing.lg },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radii.md },
  retryText: { color: Colors.white, fontWeight: '700' },
});
