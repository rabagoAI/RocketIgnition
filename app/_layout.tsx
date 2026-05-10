import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, IBMPlexMono_400Regular, IBMPlexMono_700Bold } from '@expo-google-fonts/ibm-plex-mono';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Colors } from '@/src/lib/theme';
import { AuthProvider } from '@/src/context/AuthContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.card,
    border: Colors.border,
    primary: Colors.primary,
    text: Colors.textPrimary,
    notification: Colors.primary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    IBMPlexMono_400Regular,
    IBMPlexMono_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={darkTheme}>
          <Stack screenOptions={{ headerStyle: { backgroundColor: Colors.card }, headerTintColor: Colors.textPrimary }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="launch/[id]" options={{ title: 'Lanzamiento', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="rocket/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="rocket/compare" options={{ title: 'Comparar cohetes', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="settings/notifications" options={{ title: 'Notificaciones', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="settings/profile" options={{ title: 'Mi perfil', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="admin/index" options={{ title: 'Admin', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="admin/rockets/index" options={{ title: 'Cohetes', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="admin/rockets/new" options={{ title: 'Nuevo cohete', headerBackTitle: 'Atrás' }} />
            <Stack.Screen name="admin/rockets/[id]" options={{ title: 'Editar cohete', headerBackTitle: 'Atrás' }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
