# RocketIgnition — Contexto del proyecto

## ¿Qué es?
App móvil (React Native + Expo) de seguimiento de lanzamientos espaciales con enciclopedia interactiva de cohetes. Proyecto de portfolio/aprendizaje.

## Stack
- **Framework:** React Native + Expo SDK 54, Expo Router v6
- **Lenguaje:** TypeScript strict
- **Backend:** Supabase (PostgreSQL + Storage + Edge Functions)
- **Animaciones:** Reanimated v4 + Gesture Handler
- **API externa:** The Space Devs (`lldev.thespacedevs.com` en dev, `ll.thespacedevs.com` en producción)
- **IA:** Claude Haiku desde Edge Function de Supabase

## Estructura de rutas
```
app/
  _layout.tsx           — root layout (GestureHandlerRootView + AuthProvider)
  (tabs)/
    _layout.tsx         — 5 tabs: Inicio, Lanzamientos, Cohetes, Noticias, Favoritos
    index.tsx           — pantalla inicio con hero countdown
    launches.tsx        — lista próximos/histórico con filtros
    rockets.tsx         — grid de cohetes (enciclopedia)
    news.tsx            — stub (Fase 7)
    favorites.tsx       — requiere login
  rocket/[id].tsx       — infografía interactiva del cohete
  launch/[id].tsx       — detalle completo del lanzamiento
  auth/
    login.tsx
    register.tsx
  admin/
    index.tsx           — panel admin (solo role=admin)
    rockets/
      index.tsx         — lista cohetes admin
      new.tsx           — crear cohete
      [id].tsx          — editor completo (datos/imagen/canvas/versiones)
```

## Fases completadas
- **Fase 1** — Setup: Expo SDK 54, TypeScript, tema oscuro, sistema de diseño
- **Fase 2** — Supabase: 6 tablas, RLS, Storage bucket "rockets"
- **Fase 3** — Auth: login, registro, guards de ruta, panel admin
- **Fase 4** — Lanzamientos: lista con filtros, paginación, detalle completo
- **Fase 5** — Cohetes: infografía con zoom/pan, puntos interactivos, bottom sheet
- **Fase 6** — Admin: CRUD cohetes, canvas para colocar puntos, Edge Function IA
- **Nombre cambiado** de RocketWatch → RocketIgnition

## Base de datos (Supabase)
- **Proyecto ID:** `dgxixxawvlazqauxmvfv`
- **URL:** `https://dgxixxawvlazqauxmvfv.supabase.co`
- **Tablas:** rockets, rocket_versions, rocket_components, user_favorites, notification_preferences, push_tokens
- **Storage bucket:** `rockets` (público, 10 MB, webp/jpg/png)
- **Edge Function:** `generate-component` (Claude Haiku)
- **6 cohetes** en BD: Falcon 9, Starship, Artemis SLS, Ariane 5, Soyuz, New Glenn
- **32 componentes** con descripciones en 3 niveles + dato clave

## Datos mock de lanzamientos
`src/lib/mockLaunches.ts` — 4 próximos + 3 históricos. Se usan automáticamente si la API falla (tanto en desarrollo como producción).

## Variables de entorno (.env — NO subir a git)
```
EXPO_PUBLIC_SUPABASE_URL=https://dgxixxawvlazqauxmvfv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_SPACE_DEVS_BASE_URL=https://lldev.thespacedevs.com/2.2.0
```

---

## Cómo iniciar el servidor de desarrollo

### Requisitos previos
- Node.js 20+
- `npx` disponible
- App **Expo Go** instalada en el móvil (iOS o Android)

### Pasos
```bash
# 1. Ir al directorio del proyecto
cd ~/Claude/rocket-ignition/rocketwatch

# 2. Instalar dependencias (solo la primera vez o tras cambios en package.json)
npm install

# 3. Iniciar el servidor de desarrollo
npx expo start

# Con limpieza de caché (usar si se cambia el .env o hay errores raros)
npx expo start --clear
```

### Opciones desde el menú de Metro
- **`w`** — abrir en el navegador (localhost:8081)
- **`s`** — escanear QR con Expo Go desde el móvil
- **`a`** — abrir en emulador Android
- **`i`** — abrir en simulador iOS (solo macOS)

### Notas importantes
- El `.env` no está en git. Si clonas el repo en una máquina nueva, créalo manualmente con las variables de arriba.
- La API de Space Devs puede estar lenta o caída — en ese caso la app usa datos mock automáticamente.
- Para que el botón "Generar con IA" funcione en el panel admin, hay que añadir `ANTHROPIC_API_KEY` en Supabase Dashboard → Project Settings → Edge Functions → Secrets.

---

## Tareas pendientes

### Fase 7 — Notificaciones push + Feed de noticias
- [ ] Configurar Expo Notifications (ya instalado)
- [ ] Implementar `app/(tabs)/news.tsx` con RSS o API de noticias espaciales
- [ ] Edge Function para enviar notificaciones push de lanzamientos
- [ ] Pantalla de ajustes de notificaciones (`notification_preferences`)
- [ ] Guardar push token en BD al hacer login

### Deploy
- [ ] Subir a Vercel (web estática)
  - `vercel.json` ya configurado
  - Añadir variables de entorno en Vercel Dashboard
  - Build: `npx expo export --platform web` → output: `dist/`
- [ ] (Opcional) EAS Build para APK de Android

### Mejoras pendientes menores
- [ ] Ajustar posiciones (x%/y%) de algunos puntos en los cohetes — usar panel admin → Canvas
- [ ] Añadir `ANTHROPIC_API_KEY` en Supabase Edge Function Secrets
- [ ] Imágenes de las versiones de cohete (`rocket_versions.image_url` está vacío)
- [ ] Pantalla `app/(tabs)/favorites.tsx` — implementar lista real de favoritos del usuario

### Técnico
- [ ] Ejecutar `supabase gen types typescript` cuando la API esté estable para eliminar los `as any` en los hooks de Supabase
- [ ] Considerar alternativa a `react-native-rss-parser` (vulnerabilidad en `xmldom@0.3.0`)
