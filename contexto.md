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
  _layout.tsx               — root layout (GestureHandlerRootView + AuthProvider + NotificationSetup)
  (tabs)/
    _layout.tsx             — 5 tabs: Inicio, Lanzamientos, Cohetes, Noticias, Favoritos
    index.tsx               — pantalla inicio con hero countdown
    launches.tsx            — lista próximos/histórico con filtros
    rockets.tsx             — grid de cohetes (enciclopedia)
    news.tsx                — feed de noticias EN/ES con toggle de idioma
    favorites.tsx           — panel de cuenta + acceso a ajustes
  rocket/[id].tsx           — infografía interactiva del cohete
  launch/[id].tsx           — detalle completo del lanzamiento
  auth/
    login.tsx
    register.tsx
  settings/
    notifications.tsx       — preferencias de notificación (toggles 24h/2h/30min/10min/scrub)
    profile.tsx             — stub
  admin/
    index.tsx               — panel admin (solo role=admin)
    rockets/
      index.tsx             — lista cohetes admin
      new.tsx               — crear cohete
      [id].tsx              — editor completo (datos/imagen/canvas/versiones)
```

## Fases completadas
- **Fase 1** — Setup: Expo SDK 54, TypeScript, tema oscuro, sistema de diseño
- **Fase 2** — Supabase: 6 tablas, RLS, Storage bucket "rockets"
- **Fase 3** — Auth: login, registro, guards de ruta, panel admin
- **Fase 4** — Lanzamientos: lista con filtros, paginación, detalle completo
- **Fase 5** — Cohetes: infografía con zoom/pan, puntos interactivos, bottom sheet
- **Fase 6** — Admin: CRUD cohetes, canvas para colocar puntos, Edge Function IA
- **Fase 7** — Noticias EN/ES + Notificaciones push completas
- **Deploy:** Vercel publicado ✅ · EAS inicializado ✅

## Base de datos (Supabase)
- **Proyecto ID:** `dgxixxawvlazqauxmvfv`
- **URL:** `https://dgxixxawvlazqauxmvfv.supabase.co`
- **Tablas:** rockets, rocket_versions, rocket_components, user_favorites, notification_preferences, push_tokens
- **Storage bucket:** `rockets` (público, 10 MB, webp/jpg/png)
- **Edge Functions:**
  - `generate-component` — Claude Haiku genera descripciones de componentes
  - `send-launch-notifications` — envía push notifications via Expo Push API (se dispara cada 10 min via pg_cron)
  - `spanish-news` — proxy RSS que agrega noticias en español de El País, El Mundo, Muy Interesante y Magnet
- **6 cohetes** en BD: Falcon 9, Starship, Artemis SLS, Ariane 5, Soyuz, New Glenn
- **32 componentes** con descripciones en 3 niveles + dato clave

## Expo / EAS
- **Expo account:** rabagoai
- **Project ID:** `b3128efe-f45e-4c40-bdee-4789a9fc8e16`
- **EAS CLI:** instalado globalmente (`npm install -g eas-cli`)
- Para builds nativos: `EXPO_TOKEN=<token> eas build --platform android`

## Datos mock de lanzamientos
`src/lib/mockLaunches.ts` — 4 próximos + 3 históricos. Se usan automáticamente si la API falla (en desarrollo y producción).

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
- El `.env` no está en git. Si clonas el repo en una máquina nueva, créalo manualmente.
- La API de Space Devs puede estar lenta — la app usa datos mock automáticamente si falla.
- Las notificaciones push **no funcionan en Expo Go** ni en simulador. Requieren EAS Development Build en dispositivo físico.
- Para el botón "Generar con IA" en el admin: añadir `ANTHROPIC_API_KEY` en Supabase Dashboard → Project Settings → Edge Functions → Secrets.

---

## Tareas pendientes

### Mejoras pendientes
- [ ] Ajustar posiciones (x%/y%) de puntos en los cohetes — usar panel admin → Canvas
- [ ] Añadir `ANTHROPIC_API_KEY` en Supabase Edge Function Secrets
- [ ] Imágenes de las versiones de cohete (`rocket_versions.image_url` vacío)
- [ ] Implementar lista real de favoritos del usuario (lanzamientos y cohetes guardados)
- [ ] EAS Development Build para probar notificaciones push en dispositivo físico

### Técnico
- [ ] `supabase gen types typescript` para eliminar los `as any` en los hooks de Supabase
- [ ] Navegar al lanzamiento al tocar una notificación push (handler en usePushNotifications)
