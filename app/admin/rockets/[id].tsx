import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TouchableWithoutFeedback,
  TextInput, ActivityIndicator, Alert, Switch, LayoutChangeEvent,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminRocket } from '@/src/hooks/useAdminRockets';
import ComponentEditorSheet, { ComponentFormData } from '@/src/components/admin/ComponentEditorSheet';
import type { RocketComponentRow } from '@/src/types/database';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

type Section = 'info' | 'image' | 'canvas' | 'versions';

export default function AdminRocketEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    rocket, versions, components, loading, saving, error,
    load, updateRocket, uploadImage,
    addVersion, deleteVersion,
    addComponent, updateComponent, deleteComponent,
    generateDescriptions,
  } = useAdminRocket(id);

  const [section, setSection] = useState<Section>('info');

  // ── Info form ────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [agency, setAgency] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [heightM, setHeightM] = useState('');
  const [payloadLeo, setPayloadLeo] = useState('');
  const [payloadGto, setPayloadGto] = useState('');
  const [firstFlight, setFirstFlight] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (rocket) {
      setName(rocket.name);
      setAgency(rocket.agency);
      setCountry(rocket.country);
      setDescription(rocket.description ?? '');
      setHeightM(rocket.height_m != null ? String(rocket.height_m) : '');
      setPayloadLeo(rocket.payload_leo_kg != null ? String(rocket.payload_leo_kg) : '');
      setPayloadGto(rocket.payload_gto_kg != null ? String(rocket.payload_gto_kg) : '');
      setFirstFlight(rocket.first_flight ?? '');
      setIsPublished(rocket.is_published);
    }
  }, [rocket]);

  async function saveInfo() {
    const err = await updateRocket({
      name: name.trim(),
      agency: agency.trim(),
      country: country.trim(),
      description: description.trim() || null,
      height_m: heightM ? parseFloat(heightM) : null,
      payload_leo_kg: payloadLeo ? parseFloat(payloadLeo) : null,
      payload_gto_kg: payloadGto ? parseFloat(payloadGto) : null,
      first_flight: firstFlight.trim() || null,
      is_published: isPublished,
    });
    if (err) Alert.alert('Error', err);
    else { setInfoSaved(true); setTimeout(() => setInfoSaved(false), 2000); }
  }

  // ── Canvas / componentes ──────────────────────────────────────────────────
  const [canvasSize, setCanvasSize] = useState({ w: 1, h: 1 });
  const [canvasImageSize, setCanvasImageSize] = useState<{ width: number; height: number } | null>(null);
  const [addingMode, setAddingMode] = useState(false);
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);
  const [editingComponent, setEditingComponent] = useState<RocketComponentRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function onCanvasLayout(e: LayoutChangeEvent) {
    setCanvasSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  }

  function getImageBounds() {
    const { w, h } = canvasSize;
    if (!canvasImageSize) return { x: 0, y: 0, w, h };
    const imgAspect = canvasImageSize.width / canvasImageSize.height;
    const canvasAspect = w / h;
    if (imgAspect < canvasAspect) {
      const imgW = h * imgAspect;
      return { x: (w - imgW) / 2, y: 0, w: imgW, h };
    }
    const imgH = w / imgAspect;
    return { x: 0, y: (h - imgH) / 2, w, h: imgH };
  }

  function handleCanvasTap(e: any) {
    if (!addingMode) return;
    const { locationX, locationY } = e.nativeEvent;
    const bounds = getImageBounds();
    const relX = locationX - bounds.x;
    const relY = locationY - bounds.y;
    if (relX < 0 || relX > bounds.w || relY < 0 || relY > bounds.h) return;
    const xPercent = Math.round((relX / bounds.w) * 100 * 10) / 10;
    const yPercent = Math.round((relY / bounds.h) * 100 * 10) / 10;
    setPendingPos({ x: xPercent, y: yPercent });
    setEditingComponent(null);
    setSheetOpen(true);
    setAddingMode(false);
  }

  async function handleSaveComponent(data: ComponentFormData) {
    if (editingComponent) {
      await updateComponent(editingComponent.id, data);
    } else if (pendingPos) {
      await addComponent({
        ...data,
        x_percent: pendingPos.x,
        y_percent: pendingPos.y,
      });
    }
    setPendingPos(null);
    setEditingComponent(null);
  }

  async function handleDeleteComponent() {
    if (!editingComponent) return;
    await deleteComponent(editingComponent.id);
    setEditingComponent(null);
    setSheetOpen(false);
  }

  // ── Versiones ────────────────────────────────────────────────────────────
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionYear, setNewVersionYear] = useState('');

  async function handleAddVersion() {
    if (!newVersionName.trim()) return;
    const err = await addVersion({
      version_name: newVersionName.trim(),
      year: newVersionYear ? parseInt(newVersionYear, 10) : null,
    });
    if (err) Alert.alert('Error', err);
    else { setNewVersionName(''); setNewVersionYear(''); }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
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

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      {/* Tabs de sección */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {(['info', 'image', 'canvas', 'versions'] as Section[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.tabBtn, section === s && styles.tabBtnActive]}
            onPress={() => setSection(s)}
          >
            <Ionicons
              name={s === 'info' ? 'document-text-outline' : s === 'image' ? 'image-outline' : s === 'canvas' ? 'map-outline' : 'git-branch-outline'}
              size={14}
              color={section === s ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabBtnText, section === s && styles.tabBtnTextActive]}>
              {s === 'info' ? 'Datos' : s === 'image' ? 'Imagen' : s === 'canvas' ? `Canvas (${components.length})` : 'Versiones'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Sección: Datos básicos ───────────────────────────────────────── */}
      {section === 'info' && (
        <ScrollView contentContainerStyle={[styles.sectionContent, { paddingBottom: 60 }]} keyboardShouldPersistTaps="handled">
          <Field label="Nombre *" value={name} onChange={setName} />
          <Field label="Agencia *" value={agency} onChange={setAgency} />
          <Field label="País *" value={country} onChange={setCountry} />
          <Field label="Primer vuelo (YYYY-MM-DD)" value={firstFlight} onChange={setFirstFlight} placeholder="2010-06-04" />
          <Field label="Altura (m)" value={heightM} onChange={setHeightM} keyboard="numeric" />
          <Field label="Carga útil LEO (kg)" value={payloadLeo} onChange={setPayloadLeo} keyboard="numeric" />
          <Field label="Carga útil GTO (kg)" value={payloadGto} onChange={setPayloadGto} keyboard="numeric" />
          <Field label="Descripción" value={description} onChange={setDescription} multiline />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Publicado</Text>
            <Switch
              value={isPublished}
              onValueChange={setIsPublished}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={saveInfo}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>{infoSaved ? '✓ Guardado' : 'Guardar cambios'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── Sección: Imagen ──────────────────────────────────────────────── */}
      {section === 'image' && (
        <ScrollView contentContainerStyle={styles.sectionContent}>
          <View style={styles.imagePreviewWrapper}>
            {rocket.image_url ? (
              <Image
                source={{ uri: rocket.image_url }}
                style={styles.imagePreview}
                contentFit="contain"
              />
            ) : (
              <View style={[styles.imagePreview, styles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.placeholderText}>Sin imagen</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={async () => {
              const url = await uploadImage();
              if (!url) Alert.alert('Error', 'No se pudo subir la imagen.');
            }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={Colors.white} />
            <Text style={styles.uploadBtnText}>
              {rocket.image_url ? 'Cambiar imagen' : 'Subir imagen'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.imageHint}>
            Formatos admitidos: JPG, PNG, WebP · Máx. 10 MB{'\n'}
            Recomendado: imagen del cohete en vertical con fondo transparente o oscuro.
          </Text>
        </ScrollView>
      )}

      {/* ── Sección: Canvas ──────────────────────────────────────────────── */}
      {section === 'canvas' && (
        <View style={styles.canvasSection}>
          {/* Barra de herramientas */}
          <View style={styles.canvasToolbar}>
            <Text style={styles.canvasToolbarLabel}>
              {addingMode ? '↙ Toca la imagen para añadir un punto' : `${components.length} componentes`}
            </Text>
            <TouchableOpacity
              style={[styles.addDotBtn, addingMode && styles.addDotBtnActive]}
              onPress={() => setAddingMode(v => !v)}
            >
              <Ionicons
                name={addingMode ? 'close-circle' : 'add-circle-outline'}
                size={16}
                color={addingMode ? Colors.warning : Colors.accent}
              />
              <Text style={[styles.addDotBtnText, addingMode && styles.addDotBtnTextActive]}>
                {addingMode ? 'Cancelar' : 'Añadir punto'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Canvas con imagen + puntos */}
          <TouchableWithoutFeedback onPress={handleCanvasTap}>
            <View style={styles.canvasWrapper} onLayout={onCanvasLayout}>
              {rocket.image_url ? (
                <>
                  <Image
                    source={{ uri: rocket.image_url }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                    onLoad={e => setCanvasImageSize({ width: e.source.width, height: e.source.height })}
                  />
                  {/* Puntos dentro del área exacta de la imagen */}
                  {(() => {
                    const b = getImageBounds();
                    return (
                      <View
                        style={[StyleSheet.absoluteFillObject, { left: b.x, top: b.y, width: b.w, height: b.h }]}
                        pointerEvents="box-none"
                      >
                        {components.map(comp => (
                          <TouchableOpacity
                            key={comp.id}
                            style={[
                              styles.dot,
                              {
                                left: `${comp.x_percent}%` as unknown as number,
                                top: `${comp.y_percent}%` as unknown as number,
                              },
                              editingComponent?.id === comp.id && styles.dotSelected,
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              setEditingComponent(comp);
                              setPendingPos(null);
                              setSheetOpen(true);
                            }}
                            hitSlop={8}
                          >
                            <View style={styles.dotInner} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })()}
                </>
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.canvasPlaceholder]}>
                  <Ionicons name="image-outline" size={40} color={Colors.textMuted} />
                  <Text style={styles.canvasPlaceholderText}>Sube una imagen primero</Text>
                </View>
              )}

              {/* Indicador modo añadir */}
              {addingMode && (
                <View style={styles.addModeOverlay}>
                  <Text style={styles.addModeText}>Toca donde quieres añadir el componente</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Lista de componentes */}
          <ScrollView style={styles.componentList} showsVerticalScrollIndicator={false}>
            {components.map((comp, i) => (
              <TouchableOpacity
                key={comp.id}
                style={styles.componentRow}
                onPress={() => { setEditingComponent(comp); setPendingPos(null); setSheetOpen(true); }}
              >
                <View style={styles.componentDotMini} />
                <View style={styles.componentRowInfo}>
                  <Text style={styles.componentRowName} numberOfLines={1}>{comp.name}</Text>
                  <Text style={styles.componentRowPos}>
                    x: {comp.x_percent}% · y: {comp.y_percent}%
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Sección: Versiones ───────────────────────────────────────────── */}
      {section === 'versions' && (
        <ScrollView contentContainerStyle={styles.sectionContent}>
          <Text style={styles.sectionHint}>
            Las versiones permiten filtrar los componentes por variante del cohete (Block 5, v1.1, etc.)
          </Text>

          {/* Añadir versión */}
          <View style={styles.addVersionRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newVersionName}
              onChangeText={setNewVersionName}
              placeholder="Nombre (Ej: Block 5)"
              placeholderTextColor={Colors.textMuted}
            />
            <TextInput
              style={[styles.input, styles.yearInput]}
              value={newVersionYear}
              onChangeText={setNewVersionYear}
              placeholder="Año"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
            />
            <TouchableOpacity
              style={[styles.addVersionBtn, !newVersionName.trim() && { opacity: 0.4 }]}
              onPress={handleAddVersion}
              disabled={!newVersionName.trim()}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Lista de versiones */}
          {versions.length === 0 ? (
            <Text style={styles.emptyText}>Sin versiones. Los componentes serán globales.</Text>
          ) : (
            versions.map(v => (
              <View key={v.id} style={styles.versionRow}>
                <View style={styles.versionInfo}>
                  <Text style={styles.versionName}>{v.version_name}</Text>
                  {v.year && <Text style={styles.versionYear}>{v.year}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert(
                    'Eliminar versión',
                    `¿Eliminar "${v.version_name}"? Los componentes de esta versión también se eliminarán.`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', style: 'destructive', onPress: () => deleteVersion(v.id) },
                    ]
                  )}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ── ComponentEditorSheet ──────────────────────────────────────────── */}
      {sheetOpen && (
        <ComponentEditorSheet
          component={editingComponent}
          onSave={handleSaveComponent}
          onDelete={editingComponent ? handleDeleteComponent : undefined}
          onClose={() => { setSheetOpen(false); setEditingComponent(null); setPendingPos(null); }}
          onGenerateAI={generateDescriptions}
        />
      )}
    </View>
  );
}

// ── Campo de formulario reutilizable ─────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, multiline, keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboard?: 'default' | 'numeric';
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboard ?? 'default'}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },

  // Tabs
  tabBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card },
  tabBarContent: { paddingHorizontal: Spacing.md, gap: 4, paddingVertical: 8 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1, borderColor: 'transparent',
  },
  tabBtnActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary + '55' },
  tabBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
  tabBtnTextActive: { color: Colors.primary, fontWeight: '700' },

  // Formulario info
  sectionContent: { padding: Spacing.lg },
  sectionHint: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: Spacing.lg },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 14,
  },
  inputMulti: { minHeight: 90, paddingTop: 12 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.xl, paddingVertical: Spacing.sm,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
  },
  switchLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radii.md,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.xl,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  // Imagen
  imagePreviewWrapper: {
    height: 280, borderRadius: Radii.lg, overflow: 'hidden',
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  imagePreview: { flex: 1 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  placeholderText: { color: Colors.textMuted, fontSize: 14 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radii.md,
    paddingVertical: 13, justifyContent: 'center',
  },
  uploadBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  imageHint: {
    color: Colors.textMuted, fontSize: 12, lineHeight: 18,
    marginTop: Spacing.md, textAlign: 'center',
  },

  // Canvas
  canvasSection: { flex: 1 },
  canvasToolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  canvasToolbarLabel: { color: Colors.textSecondary, fontSize: 13 },
  addDotBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radii.full, borderWidth: 1, borderColor: Colors.accent,
  },
  addDotBtnActive: { borderColor: Colors.warning },
  addDotBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  addDotBtnTextActive: { color: Colors.warning },
  canvasWrapper: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  canvasPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  canvasPlaceholderText: { color: Colors.textMuted, fontSize: 13 },
  addModeOverlay: {
    position: 'absolute', bottom: 12, alignSelf: 'center',
    backgroundColor: 'rgba(255,77,28,0.9)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radii.full,
  },
  addModeText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  dot: {
    position: 'absolute',
    width: 28, height: 28,
    marginLeft: -14, marginTop: -14,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2, borderColor: Colors.primary + '88',
    backgroundColor: Colors.primary + '22',
  },
  dotSelected: { borderColor: Colors.white, backgroundColor: Colors.primary + '55' },
  dotInner: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.white,
    borderWidth: 2, borderColor: Colors.primary,
  },
  componentList: { maxHeight: 220 },
  componentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  componentDotMini: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.primary,
  },
  componentRowInfo: { flex: 1 },
  componentRowName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  componentRowPos: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },

  // Versiones
  addVersionRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: Spacing.lg },
  yearInput: { width: 72 },
  addVersionBtn: {
    width: 42, height: 42, borderRadius: Radii.md,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  versionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  versionInfo: { flex: 1 },
  versionName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  versionYear: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: Spacing.lg, textAlign: 'center' },

  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: Spacing.lg },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radii.md },
  retryText: { color: Colors.white, fontWeight: '700' },
});
