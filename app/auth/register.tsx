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
import { signUp } from '@/src/lib/auth';
import FormInput from '@/src/components/ui/FormInput';
import { Colors, Spacing, Radii } from '@/src/lib/theme';

export default function RegisterScreen() {
  const { session, loading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; general?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!loading && session) return <Redirect href="/(tabs)" />;

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email no válido';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirm) e.confirm = 'Las contraseñas no coinciden';
    return e;
  }

  async function handleRegister() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const { user } = await signUp(email.trim().toLowerCase(), password);
      // Si el email no está confirmado, mostramos aviso en lugar de redirigir
      if (!user?.email_confirmed_at) {
        setSuccess(true);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      setErrors({ general: translateError(err instanceof Error ? err.message : 'Error desconocido') });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <View style={[styles.flex, styles.successCenter, { paddingTop: insets.top }]}>
        <Text style={styles.successIcon}>📬</Text>
        <Text style={styles.successTitle}>¡Casi listo!</Text>
        <Text style={styles.successText}>
          Te hemos enviado un email de confirmación.{'\n'}Ábrelo y pulsa el enlace para activar tu cuenta.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.btnText}>Ir al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabecera */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Crear cuenta</Text>
        <Text style={styles.pageSubtitle}>Únete a la comunidad espacial</Text>

        {/* Formulario */}
        <View style={styles.form}>
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
            error={errors.email}
          />

          <FormInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            isPassword
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            error={errors.password}
          />

          <FormInput
            label="Confirmar contraseña"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite la contraseña"
            isPassword
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            error={errors.confirm}
          />

          {errors.general && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, submitting && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnText}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <Text style={styles.terms}>
            Al registrarte aceptas recibir notificaciones de lanzamientos espaciales.
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>¿Ya tienes cuenta? <Text style={styles.loginLinkAccent}>Inicia sesión</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function translateError(msg: string): string {
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email';
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres';
  if (msg.includes('network')) return 'Sin conexión a internet';
  return msg;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.lg },

  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.textSecondary, fontSize: 15 },

  pageTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 6 },
  pageSubtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: Spacing.xl },

  form: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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

  terms: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: Spacing.md, lineHeight: 16 },

  loginLink: { alignItems: 'center', padding: Spacing.md },
  loginLinkText: { color: Colors.textSecondary, fontSize: 14 },
  loginLinkAccent: { color: Colors.primary, fontWeight: '700' },

  // Estado de éxito (email enviado)
  successCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successIcon: { fontSize: 64, marginBottom: Spacing.lg },
  successTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: Spacing.sm },
  successText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
});
