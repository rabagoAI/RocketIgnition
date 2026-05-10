import { View, Text, StyleSheet, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useNotificationPreferences } from '@/src/hooks/useNotificationPreferences';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

interface RowProps {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}

function PrefRow({ label, description, value, disabled, onChange }: RowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

export default function NotificationsSettingsScreen() {
  const { session } = useAuth();
  if (!session) return <Redirect href="/auth/login" />;

  const { prefs, loading, saving, update } = useNotificationPreferences();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!prefs) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No se pudieron cargar las preferencias.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Avisos de lanzamiento</Text>
      <Text style={styles.sectionHint}>
        Recibe una notificación antes de cada lanzamiento. Puedes activar varios avisos a la vez.
      </Text>

      <View style={styles.card}>
        <PrefRow
          label="24 horas antes"
          description="Aviso el día anterior al lanzamiento"
          value={prefs.notify_24h}
          disabled={saving}
          onChange={v => update({ notify_24h: v })}
        />
        <View style={styles.divider} />
        <PrefRow
          label="2 horas antes"
          description="Cuando la ventana de lanzamiento está cerca"
          value={prefs.notify_2h}
          disabled={saving}
          onChange={v => update({ notify_2h: v })}
        />
        <View style={styles.divider} />
        <PrefRow
          label="30 minutos antes"
          description="Cuenta atrás final"
          value={prefs.notify_30min}
          disabled={saving}
          onChange={v => update({ notify_30min: v })}
        />
        <View style={styles.divider} />
        <PrefRow
          label="10 minutos antes"
          description="Lanzamiento inminente"
          value={prefs.notify_10min}
          disabled={saving}
          onChange={v => update({ notify_10min: v })}
        />
      </View>

      <Text style={styles.sectionTitle}>Otros avisos</Text>

      <View style={styles.card}>
        <PrefRow
          label="Cancelaciones (scrub)"
          description="Aviso si un lanzamiento se pospone o cancela"
          value={prefs.notify_scrub}
          disabled={saving}
          onChange={v => update({ notify_scrub: v })}
        />
      </View>

      {saving && (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.savingText}>Guardando...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },

  sectionTitle: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionHint: {
    color: Colors.textMuted, fontSize: 13, lineHeight: 18,
    marginBottom: Spacing.sm, marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  rowText: { flex: 1 },
  rowLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  rowDesc: { color: Colors.textMuted, fontSize: 12, lineHeight: 16 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.md },

  savingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    justifyContent: 'center', marginTop: Spacing.lg,
  },
  savingText: { color: Colors.textSecondary, fontSize: 13 },
});
