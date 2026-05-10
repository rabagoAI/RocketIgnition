import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { signIn } from '@/src/lib/auth';
import FormInput from '@/src/components/ui/FormInput';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function LoginScreen() {
  const { session, loading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión activa, redirigir a tabs
  if (!loading && session) return <Redirect href="/(tabs)" />;

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(translateError(e instanceof Error ? e.message : 'Error desconocido'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding */}
        <View style={styles.brandBlock}>
          <Text style={styles.logo}>🚀</Text>
          <Text style={styles.appName}>
            ROCKET<Text style={styles.appNameAccent}>IGNITION</Text>
          </Text>
          <Text style={styles.tagline}>Tu radar espacial</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Iniciar sesión</Text>

          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <FormInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            isPassword
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, submitting && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnText}>Entrar</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.secondaryBtnText}>Crear cuenta nueva</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed')) return 'Confirma tu email antes de iniciar sesión';
  if (msg.includes('Too many requests')) return 'Demasiados intentos. Espera unos minutos';
  if (msg.includes('network')) return 'Sin conexión a internet';
  return msg;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.lg },

  brandBlock: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 56, marginBottom: 12 },
  appName: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 4 },
  appNameAccent: { color: Colors.primary },
  tagline: { color: Colors.textMuted, fontSize: 13, marginTop: 4, letterSpacing: 1 },

  form: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },

  errorBox: {
    backgroundColor: Colors.primary + '22',
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  errorText: { color: Colors.primary, fontSize: 13, textAlign: 'center' },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg, gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 13 },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
});
