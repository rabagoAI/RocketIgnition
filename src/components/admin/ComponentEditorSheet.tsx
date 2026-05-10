import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii } from '@/src/lib/theme';
import type { RocketComponentRow } from '@/src/types/database';

const SNAP_SPRING = { damping: 20, stiffness: 200, mass: 0.8 };

export interface ComponentFormData {
  name: string;
  short_description: string;
  full_description: string;
  simple_description: string;
  key_fact: string;
}

interface Props {
  component?: RocketComponentRow | null;
  onSave: (data: ComponentFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
  onGenerateAI: (name: string) => Promise<{
    short_description: string;
    full_description: string;
    simple_description: string;
    key_fact: string;
  } | null>;
}

export default function ComponentEditorSheet({
  component, onSave, onDelete, onClose, onGenerateAI,
}: Props) {
  const { height: SCREEN_H } = useWindowDimensions();
  const SHEET_H = SCREEN_H * 0.88;
  const translateY = useSharedValue(0);

  const [name, setName] = useState(component?.name ?? '');
  const [shortDesc, setShortDesc] = useState(component?.short_description ?? '');
  const [fullDesc, setFullDesc] = useState(component?.full_description ?? '');
  const [simpleDesc, setSimpleDesc] = useState(component?.simple_description ?? '');
  const [keyFact, setKeyFact] = useState(component?.key_fact ?? '');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

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

  async function handleGenerate() {
    if (!name.trim()) { setGenError('Escribe el nombre del componente primero'); return; }
    setGenError(null);
    setGenerating(true);
    const result = await onGenerateAI(name.trim());
    setGenerating(false);
    if (!result) { setGenError('No se pudo generar. Verifica la clave API.'); return; }
    setShortDesc(result.short_description);
    setFullDesc(result.full_description);
    setSimpleDesc(result.simple_description);
    setKeyFact(result.key_fact);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), short_description: shortDesc, full_description: fullDesc, simple_description: simpleDesc, key_fact: keyFact });
    setSaving(false);
    onClose();
  }

  function close() {
    translateY.value = withTiming(SHEET_H, { duration: 240 }, () => runOnJS(onClose)());
  }

  return (
    <>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={close} activeOpacity={1} />

      <Animated.View style={[styles.sheet, { height: SHEET_H }, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>
                {component ? 'Editar componente' : 'Nuevo componente'}
              </Text>
              <TouchableOpacity onPress={close} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nombre */}
          <Text style={styles.label}>Nombre del componente *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Motor Merlin 1D"
            placeholderTextColor={Colors.textMuted}
          />

          {/* Botón generar IA */}
          <TouchableOpacity
            style={[styles.genBtn, generating && styles.genBtnDisabled]}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="sparkles" size={16} color={Colors.white} />
            )}
            <Text style={styles.genBtnText}>
              {generating ? 'Generando con IA…' : 'Generar descripciones con IA'}
            </Text>
          </TouchableOpacity>

          {genError && <Text style={styles.errorText}>{genError}</Text>}

          {/* Short description */}
          <Text style={styles.label}>Descripción corta <Text style={styles.hint}>(máx 90 car.)</Text></Text>
          <TextInput
            style={styles.input}
            value={shortDesc}
            onChangeText={setShortDesc}
            placeholder="Resumen conciso"
            placeholderTextColor={Colors.textMuted}
            maxLength={90}
          />

          {/* Full description */}
          <Text style={styles.label}>Descripción técnica</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={fullDesc}
            onChangeText={setFullDesc}
            placeholder="Descripción detallada para ingenieros y entusiastas"
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          {/* Simple description */}
          <Text style={styles.label}>Descripción simple</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={simpleDesc}
            onChangeText={setSimpleDesc}
            placeholder="Explicación para el público general"
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          {/* Key fact */}
          <Text style={styles.label}>Dato clave <Text style={styles.hint}>(máx 65 car.)</Text></Text>
          <TextInput
            style={styles.input}
            value={keyFact}
            onChangeText={setKeyFact}
            placeholder="Dato impresionante o cifra relevante"
            placeholderTextColor={Colors.textMuted}
            maxLength={65}
          />

          {/* Acciones */}
          <View style={styles.actions}>
            {onDelete && (
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Ionicons name="trash-outline" size={18} color={Colors.primary} />
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveBtn, (!name.trim() || saving) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!name.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  handleArea: { paddingBottom: 0 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { color: Colors.textPrimary, fontSize: 17, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: Spacing.md },
  hint: { color: Colors.textMuted, fontWeight: '400' },
  input: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  inputMulti: { minHeight: 90, paddingTop: 10 },
  genBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: Radii.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    justifyContent: 'center',
  },
  genBtnDisabled: { opacity: 0.6 },
  genBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  errorText: { color: Colors.primary, fontSize: 13, marginTop: 6 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  deleteBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
