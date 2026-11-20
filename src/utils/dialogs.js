// Кроссплатформенные диалоги. В react-native-web Alert.alert ничего не делает,
// поэтому на вебе используем window.alert / window.confirm.
//
//   notify('Готово', 'Напоминания включены');
//   confirmAction({ title: 'Удалить?', message: '…', confirmText: 'Удалить', onConfirm: () => … });

import { Alert, Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export function notify(title, message = '') {
  if (isWeb) {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction({
  title,
  message = '',
  confirmText = 'OK',
  cancelText = 'Отмена',
  destructive = true,
  onConfirm,
}) {
  if (isWeb) {
    // eslint-disable-next-line no-alert
    const ok = typeof window !== 'undefined' && window.confirm(message ? `${title}\n\n${message}` : title);
    if (ok) onConfirm?.();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
