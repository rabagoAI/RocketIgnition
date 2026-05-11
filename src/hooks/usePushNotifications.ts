import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PROJECT_ID = 'b3128efe-f45e-4c40-bdee-4789a9fc8e16';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('launches', {
    name: 'Lanzamientos',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF4D1C',
    sound: 'default',
  });
}

async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const result = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
  return result.data;
}

async function saveTokenToDb(token: string, userId: string) {
  await db.from('push_tokens')
    .upsert({ user_id: userId, token }, { onConflict: 'user_id' });
}

async function ensureNotificationPreferences(userId: string) {
  const { data } = await db.from('notification_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (!data) {
    await db.from('notification_preferences').insert({
      user_id: userId,
      notify_24h: true,
      notify_2h: true,
      notify_30min: true,
      notify_10min: false,
      notify_scrub: true,
      agencies_filter: [],
    });
  }
}

export function usePushNotifications() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;

    setupAndroidChannel();
    getExpoPushToken().then(token => {
      if (token) saveTokenToDb(token, userId);
    });
    ensureNotificationPreferences(userId);

    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const launchId = response.notification.request.content.data?.launchId as string | undefined;
      if (launchId) router.push(`/launch/${launchId}`);
    });

    return () => sub.remove();
  }, [session]);
}
