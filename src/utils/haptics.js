// Тактильная отдача (haptics) — тонкая вибрация в ответ на действия.
// Обёртка над expo-haptics: на вебе — no-op, ошибки глушатся
// (на устройствах без Taptic Engine вызовы могут отклоняться).
//
//   tap()     — лёгкий «щелчок»: нажатия счётчиков, переключатели
//   success() — успех: правильный ответ, цель достигнута
//   error()   — ошибка: неправильный ответ
//   warning() — предупреждение

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

export async function tap() {
  if (isWeb) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* ignore */ }
}

export async function success() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* ignore */ }
}

export async function error() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch { /* ignore */ }
}

export async function warning() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch { /* ignore */ }
}
