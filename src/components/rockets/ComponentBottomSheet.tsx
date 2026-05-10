import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Share,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import type { RocketComponent } from '@/src/types/database';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

type TabId = 'technical' | 'simple' | 'keyfact';

const TABS: { id: TabId; label: string }[] = [
  { id: 'technical', label: 'Técnico' },
  { id: 'simple', label: 'Simple' },
  { id: 'keyfact', label: 'Dato clave' },
] as const as { id: TabId; label: string }[];

const SNAP_SPRING = { damping: 20, stiffness: 200, mass: 0.8 };

interface Props {
  component: RocketComponent;
  isSimpleMode: boolean;
  onClose: () => void;
}

export default function ComponentBottomSheet({ component, isSimpleMode, onClose }: Props) {
  const { height: SCREEN_H } = useWindowDimensions();
  const SHEET_H = SCREEN_H * 0.62;
  const translateY = useSharedValue(SHEET_H);
  const [activeTab, setActiveTab] = useState<TabId>(isSimpleMode ? 'simple' : 'technical');

  // Abrir al montar
  useEffect(() => {
    translateY.value = withSpring(0, SNAP_SPRING);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar tab con modo global
  useEffect(() => {
    setActiveTab(isSimpleMode ? 'simple' : 'technical');
  }, [isSimpleMode]);

  function close() {
    translateY.value = withTiming(SHEET_H, { duration: 240 }, () => runOnJS(onClose)());
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY >= 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > SHEET_H * 0.28 || e.velocityY > 600) {
        translateY.value = withTiming(SHEET_H, { duration: 220 }, () => runOnJS(onClose)());
      } else {
        translateY.value = withSpring(0, SNAP_SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - translateY.value / SHEET_H) * 0.55,
  }));

  async function handleShare() {
    const text = [
      `🚀 ${component.name}`,
      component.key_fact ? `\n💡 ${component.key_fact}` : '',
      component.short_description ? `\n${component.short_description}` : '',
    ].join('');
    await Share.share({ message: text, title: component.name });
  }

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]} />
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={close} activeOpacity={1} />

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { height: SHEET_H }, sheetStyle]}>

        {/* Handle draggable */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />

            {/* Cabecera del sheet */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderLeft}>
                <View style={styles.componentDotMini} />
                <Text style={styles.componentName} numberOfLines={2}>{component.name}</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleShare} style={styles.iconBtn} hitSlop={8}>
                  <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={close} style={styles.iconBtn} hitSlop={8}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GestureDetector>

        {/* Contenido scrollable */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {activeTab === 'technical' && <TechnicalTab component={component} />}
          {activeTab === 'simple' && <SimpleTab component={component} />}
          {activeTab === 'keyfact' && <KeyFactTab component={component} />}
        </ScrollView>
      </Animated.View>
    </>
  );
}

// ── Contenido de cada tab ─────────────────────────────────────────────────────

function TechnicalTab({ component }: { component: RocketComponent }) {
  return (
    <View style={tabStyles.container}>
      {component.full_description ? (
        <Text style={tabStyles.body}>{component.full_description}</Text>
      ) : component.short_description ? (
        <Text style={tabStyles.body}>{component.short_description}</Text>
      ) : (
        <Text style={tabStyles.empty}>Sin descripción técnica disponible.</Text>
      )}
      {component.key_fact && (
        <View style={tabStyles.keyFactRow}>
          <Ionicons name="flash" size={16} color={Colors.warning} />
          <Text style={tabStyles.keyFactText}>{component.key_fact}</Text>
        </View>
      )}
    </View>
  );
}

function SimpleTab({ component }: { component: RocketComponent }) {
  return (
    <View style={tabStyles.container}>
      {component.simple_description ? (
        <Text style={tabStyles.simpleBody}>{component.simple_description}</Text>
      ) : (
        <Text style={tabStyles.empty}>Sin descripción simplificada disponible.</Text>
      )}
    </View>
  );
}

function KeyFactTab({ component }: { component: RocketComponent }) {
  return (
    <View style={[tabStyles.container, tabStyles.keyFactCenter]}>
      <View style={tabStyles.keyFactCard}>
        <Ionicons name="flash" size={32} color={Colors.warning} style={{ marginBottom: 12 }} />
        {component.key_fact ? (
          <Text style={tabStyles.keyFactBig}>{component.key_fact}</Text>
        ) : (
          <Text style={tabStyles.empty}>Sin dato clave disponible.</Text>
        )}
        <Text style={tabStyles.keyFactLabel}>{component.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.black,
    pointerEvents: 'none',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handleArea: {
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sheetHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  componentDotMini: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginTop: 3,
    flexShrink: 0,
  },
  componentName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  headerButtons: { flexDirection: 'row', gap: 4, paddingTop: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radii.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  tabActive: { backgroundColor: Colors.cardElevated },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  tabTextActive: { color: Colors.textPrimary, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
});

const tabStyles = StyleSheet.create({
  container: { paddingVertical: Spacing.md, paddingBottom: 40 },
  body: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24 },
  simpleBody: { color: Colors.textPrimary, fontSize: 17, lineHeight: 26, fontWeight: '400' },
  empty: { color: Colors.textMuted, fontSize: 14, fontStyle: 'italic' },
  keyFactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: Spacing.lg,
    backgroundColor: Colors.warning + '15',
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '33',
  },
  keyFactText: { flex: 1, color: Colors.warning, fontSize: 14, fontWeight: '600', lineHeight: 20 },

  // KeyFact tab
  keyFactCenter: { alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  keyFactCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warning + '44',
    width: '100%',
  },
  keyFactBig: {
    color: Colors.warning,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  keyFactLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
