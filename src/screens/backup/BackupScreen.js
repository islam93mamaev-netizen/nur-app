// Резервная копия прогресса: экспорт и восстановление.
// Без новых зависимостей:
//   - Экспорт: web — скачивание .json-файла; натив — системное меню «Поделиться»
//     (можно отправить себе в Telegram, сохранить в Заметки и т.п.)
//   - Импорт: web — выбор файла; натив — вставка скопированного текста.
//
// В копию входят ВСЕ данные приложения (прогресс, путь арабского, закладки,
// настройки намазов, Рамадан, счётчики), КРОМЕ API-ключа AI (секрет).

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';

const PREFIX = '@nur_app/';
// Секреты в копию не включаем
const EXCLUDE = new Set(['@nur_app/ai_api_key_v1']);

const isWeb = Platform.OS === 'web';

function notify(title, msg) {
  if (isWeb) {
    // eslint-disable-next-line no-alert
    window.alert(`${title}\n\n${msg}`);
  } else {
    Alert.alert(title, msg);
  }
}

async function collectBackup() {
  const keys = (await AsyncStorage.getAllKeys()).filter(
    (k) => k.startsWith(PREFIX) && !EXCLUDE.has(k)
  );
  const pairs = await AsyncStorage.multiGet(keys);
  const data = Object.fromEntries(pairs.filter(([, v]) => v != null));
  return JSON.stringify({
    app: 'nur',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  });
}

async function applyBackup(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Это не похоже на файл резервной копии (некорректный JSON).');
  }
  if (parsed?.app !== 'nur' || typeof parsed.data !== 'object' || !parsed.data) {
    throw new Error('Файл не является резервной копией приложения «Нур».');
  }
  const entries = Object.entries(parsed.data).filter(
    ([k, v]) => k.startsWith(PREFIX) && !EXCLUDE.has(k) && typeof v === 'string'
  );
  if (!entries.length) throw new Error('В копии нет данных.');
  await AsyncStorage.multiSet(entries);
  return entries.length;
}

export default function BackupScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [pasted, setPasted] = useState('');
  const [busy, setBusy] = useState(false);

  const doExport = async () => {
    setBusy(true);
    try {
      const json = await collectBackup();
      const fileName = `nur-backup-${new Date().toISOString().slice(0, 10)}.json`;
      if (isWeb) {
        // Скачиваем файл
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Системное меню «Поделиться»: Telegram «Избранное», Заметки, файл и т.д.
        await Share.share({ message: json, title: fileName });
      }
    } catch (e) {
      notify('Ошибка экспорта', e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const finishImport = (count) => {
    if (isWeb) {
      notify('Готово', `Восстановлено разделов: ${count}. Страница перезагрузится.`);
      window.location.reload();
    } else {
      Alert.alert(
        'Готово',
        `Восстановлено разделов: ${count}.\n\nПолностью закройте приложение и откройте заново, чтобы данные применились.`
      );
    }
  };

  const doImportWeb = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const count = await applyBackup(text);
        finishImport(count);
      } catch (e) {
        notify('Ошибка импорта', e.message || String(e));
      }
    };
    input.click();
  };

  const doImportPaste = async () => {
    setBusy(true);
    try {
      const count = await applyBackup(pasted.trim());
      setPasted('');
      finishImport(count);
    } catch (e) {
      notify('Ошибка импорта', e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Резервная копия</Text>
        <Text style={styles.subtitle}>
          Прогресс хранится только на этом устройстве. Сделайте копию, чтобы не потерять
          его и переносить между телефоном и вебом.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Экспорт */}
        <Card>
          <View style={styles.rowTitle}>
            <Icon name="bookmark" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Экспорт</Text>
          </View>
          <Text style={styles.cardText}>
            {isWeb
              ? 'Скачается файл nur-backup-….json — сохраните его в надёжном месте.'
              : 'Откроется меню «Поделиться»: отправьте копию себе в Telegram («Избранное»), сохраните в Заметки или в файл.'}
          </Text>
          <Button title={busy ? 'Готовим…' : 'Создать копию'} onPress={doExport} loading={busy} style={{ marginTop: spacing.md }} />
        </Card>

        {/* Импорт */}
        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.rowTitle}>
            <Icon name="refresh" size={18} color={colors.accentDark} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Восстановление</Text>
          </View>
          {isWeb ? (
            <>
              <Text style={styles.cardText}>
                Выберите ранее сохранённый файл nur-backup-….json. Текущие данные будут
                заменены данными из копии.
              </Text>
              <Button title="Выбрать файл" variant="outline" onPress={doImportWeb} style={{ marginTop: spacing.md }} />
            </>
          ) : (
            <>
              <Text style={styles.cardText}>
                Откройте сохранённую копию (например, в Telegram), скопируйте весь текст
                и вставьте сюда. Текущие данные будут заменены.
              </Text>
              <TextInput
                style={styles.input}
                value={pasted}
                onChangeText={setPasted}
                placeholder='Вставьте текст копии — начинается с {"app":"nur"…'
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Button
                title="Восстановить из копии"
                variant="outline"
                onPress={doImportPaste}
                disabled={!pasted.trim() || busy}
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
        </Card>

        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.info + '10' }}>
          <Text style={styles.note}>
            В копию входит всё: уроки, путь арабского, выученные слова, закладки, заметки,
            стрик и настройки. API-ключ AI-помощника не экспортируется — это секрет,
            введите его заново при необходимости.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  back: { ...typography.bodyMedium, color: '#fff' },
  title: { ...typography.h1, color: '#fff', marginTop: spacing.sm },
  subtitle: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 20 },

  rowTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { ...typography.h4, color: colors.textPrimary },
  cardText: { ...typography.small, color: colors.textSecondary, lineHeight: 20 },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    padding: spacing.md,
    minHeight: 96,
    textAlignVertical: 'top',
    ...typography.small,
  },
  note: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },
});
