// Push-уведомления через expo-notifications.
// Поддерживает:
//   - Запрос разрешений
//   - Запланированный аят дня каждое утро
//   - Напоминания о намазах (каждое индивидуально)

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'web') return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Запланировать ежедневный аят дня на 08:00
export async function scheduleDailyAyat() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync('daily-ayat').catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-ayat',
    content: {
      title: 'Аят дня',
      body: 'Откройте приложение, чтобы прочитать сегодняшний аят.',
      data: { type: 'daily-ayat' },
    },
    trigger: { hour: 8, minute: 0, repeats: true },
  });
}

// Напоминания о намазах. prayers — { fajr: Date, dhuhr: Date, ... }
export async function schedulePrayerReminders(prayers) {
  if (Platform.OS === 'web') return;
  const ids = ['p-fajr', 'p-dhuhr', 'p-asr', 'p-maghrib', 'p-isha'];
  for (const id of ids) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

  const titleByKey = {
    fajr: 'Фаджр', dhuhr: 'Зухр', asr: 'Аср', maghrib: 'Магриб', isha: 'Иша',
  };
  const now = new Date();
  for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
    const time = prayers[key];
    if (!(time instanceof Date)) continue;
    if (time <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: 'p-' + key,
      content: {
        title: 'Время намаза: ' + titleByKey[key],
        body: 'Аллаху Акбар',
        data: { type: 'prayer', key },
      },
      trigger: time,
    });
  }
}

export async function cancelAll() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
