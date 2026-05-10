import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// En el contexto SSR de Expo Router (Node.js), window y WebSocket no existen.
// Este bloque garantiza que supabase-js pueda inicializarse sin lanzar errores.
const isServer = typeof window === 'undefined';

if (!globalThis.WebSocket) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).WebSocket = class WebSocketStub {};
}

// AsyncStorage requiere `window`; en SSR usamos un storage en memoria que
// devuelve null (sin sesión) para que el servidor no intente recuperar auth.
const storage = isServer
  ? {
      getItem: async (_key: string) => null,
      setItem: async (_key: string, _value: string) => {},
      removeItem: async (_key: string) => {},
    }
  : AsyncStorage;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});
