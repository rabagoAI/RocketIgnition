import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createRocket } from '@/src/hooks/useAdminRockets';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function AdminRocketNewScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [agency, setAgency] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !agency.trim() || !country.trim()) {
      Alert.alert('Campos obligatorios', 'Nombre, agencia y país son obligatorios.');
      return;
    }
    setSaving(true);
    const result = await createRocket({
      name: name.trim(),
      agency: agency.trim(),
      country: country.trim(),
      description: description.trim() || null,
      is_published: false,
    });
    setSaving(false);
    if (!result) {
      Alert.alert('Error', 'No se pudo crear el cohete. Verifica tu conexión.');
      return;
    }
    // Navegar directo al editor del cohete recién creado
    router.replace(`/admin/rockets/${result.id}` as any);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitle}>
        Completa los datos básicos. Podrás añadir imagen y componentes en el siguiente paso.
      </Text>

      <Text style={styles.label}>Nombre del cohete *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Falcon 9"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.label}>Agencia *</Text>
      <TextInput
        style={styles.input}
        value={agency}
        onChangeText={setAgency}
        placeholder="Ej: SpaceX"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.label}>País *</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="Ej: USA"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.inputMulti]}
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción general del cohete (opcional)"
        placeholderTextColor={Colors.textMuted}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.createBtn, (saving || !name.trim() || !agency.trim() || !country.trim()) && styles.createBtnDisabled]}
        onPress={handleCreate}
        disabled={saving || !name.trim() || !agency.trim() || !country.trim()}
      >
        {saving ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.createBtnText}>Crear cohete →</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  inputMulti: { minHeight: 100, paddingTop: 12 },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
