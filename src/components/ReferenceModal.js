// Модал для просмотра источника.
// - Коран: подгружает аят через quranService и показывает арабский + перевод
// - Хадис: открывает Sunnah.com во встроенном браузере

import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Pressable, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { spacing, radii, typography } from '../constants/theme';
import { getAyat, getAyatAudioUrl } from '../services/quranService';
import { hadithSourceLabel, hadithSourceMeta, hadithUrlForService, findIsnadChapterRange } from '../utils/parseReferences';
import * as audio from '../services/audioService';
import { useTheme } from '../store/themeStore';
import { useSettings, HADITH_SERVICES } from '../store/settingsStore';
import IconText from './IconText';

export default function ReferenceModal({ visible, reference, onClose }) {
  const { colors } = useTheme();
  const { hadithService } = useSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [ayat, setAyat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!visible || !reference) return;
    setAyat(null);
    setError(null);

    if (reference.type === 'quran') {
      setLoading(true);
      const key = `${reference.ref.surah}:${reference.ref.ayat}`;
      getAyat(key)
        .then((data) => setAyat(data))
        .catch((e) => setError('Не удалось загрузить аят. Проверьте интернет.'))
        .finally(() => setLoading(false));
    }
    return () => { audio.stop(); setPlaying(false); };
  }, [visible, reference]);

  if (!reference) return null;

  const openExternal = async (url) => {
    if (!url) return;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch {/* ignore */}
  };

  const playAyat = async () => {
    if (!ayat) return;
    if (playing) {
      await audio.stop();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      const url = getAyatAudioUrl(reference.ref.surah, reference.ref.ayat);
      await audio.play(url, { onFinish: () => setPlaying(false) });
    } catch {
      setPlaying(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.bg} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {reference.type === 'quran' ? (
            <ScrollView style={{ maxHeight: '90%' }}>
              <View style={styles.headerRow}>
                <Text style={styles.tag}>Коран</Text>
                <Text style={styles.title}>
                  Сура {reference.ref.surah}, аят {reference.ref.ayat}
                </Text>
              </View>

              {loading && (
                <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Загрузка аята…</Text>
                </View>
              )}

              {error && (
                <View style={{ padding: spacing.lg, backgroundColor: colors.danger + '15', borderRadius: radii.md, marginVertical: spacing.md }}>
                  <Text style={{ color: colors.danger }}>{error}</Text>
                </View>
              )}

              {ayat && (
                <View>
                  <View style={styles.ayatBox}>
                    <Text style={styles.ayatAr}>{ayat.ar}</Text>
                    {ayat.tr ? <Text style={styles.ayatTr}>{ayat.tr}</Text> : null}
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.ayatRu}>{ayat.ru}</Text>
                  <Text style={styles.source}>{ayat.ref}</Text>

                  <TouchableOpacity onPress={playAyat} style={[styles.playBtn, playing && styles.playBtnActive]}>
                    <Text style={styles.playText}>{playing ? '⏸ Остановить' : 'Прослушать (Mishary Alafasy)'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          ) : (
            (() => {
              const meta = hadithSourceMeta(reference.ref.source);
              const isnadAvailable = !!(meta && meta.isnadSlug);
              const isnadHref = hadithUrlForService(reference.ref, HADITH_SERVICES.ISNAD);
              const sunnahHref = hadithUrlForService(reference.ref, HADITH_SERVICES.SUNNAH);
              const primaryIsIsnad = hadithService === HADITH_SERVICES.ISNAD && isnadAvailable;
              const chapterRange = isnadAvailable
                ? findIsnadChapterRange(meta.isnadSlug, reference.ref.number)
                : null;

              return (
                <View>
                  <View style={styles.headerRow}>
                    <Text style={styles.tag}>Хадис</Text>
                    <Text style={styles.title}>
                      {hadithSourceLabel(reference.ref.source)} № {reference.ref.number}
                    </Text>
                  </View>

                  <View style={styles.hadithBox}>
                    <Text style={styles.hadithDesc}>
                      Полный текст хадиса с иснадом, арабским оригиналом и переводом.
                      Изменить сервис по умолчанию: Профиль → «Источник хадисов».
                    </Text>

                    {!isnadAvailable && hadithService === HADITH_SERVICES.ISNAD && (
                      <View style={styles.noteBox}>
                        <Text style={styles.noteText}>
                          ℹ️ «{hadithSourceLabel(reference.ref.source)}» на Isnad.link отсутствует —
                          открываем Sunnah.com.
                        </Text>
                      </View>
                    )}

                    {primaryIsIsnad ? (
                      <>
                        <TouchableOpacity onPress={() => openExternal(isnadHref)} style={styles.openBtn}>
                          <Text style={styles.openText}>🇷🇺 Открыть на Isnad.link</Text>
                        </TouchableOpacity>
                        <Text style={styles.urlText}>{isnadHref}</Text>
                        <TouchableOpacity onPress={() => openExternal(sunnahHref)} style={styles.openBtnSecondary}>
                          <IconText icon="globe" style={styles.openTextSecondary}>Открыть на Sunnah.com</IconText>
                        </TouchableOpacity>
                        {chapterRange && (
                          <IconText icon="bulb" style={styles.hintText}>На Isnad.link откроется глава с хадисами {chapterRange.from}–{chapterRange.to}. Найдите № {reference.ref.number} прокруткой.</IconText>
                        )}
                      </>
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => openExternal(sunnahHref)} style={styles.openBtn}>
                          <IconText icon="bookOpen" style={styles.openText}>Открыть на Sunnah.com</IconText>
                        </TouchableOpacity>
                        <Text style={styles.urlText}>{sunnahHref}</Text>
                        {isnadAvailable && (
                          <TouchableOpacity onPress={() => openExternal(isnadHref)} style={styles.openBtnSecondary}>
                            <Text style={styles.openTextSecondary}>🇷🇺 Открыть на Isnad.link</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })()
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Закрыть</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.md,
  },

  headerRow: { marginBottom: spacing.md },
  tag: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  title: { ...typography.h3, color: colors.textPrimary, marginTop: 4 },

  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },

  ayatBox: { marginVertical: spacing.md },
  ayatAr: {
    fontSize: 30,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 48,
  },
  ayatTr: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  ayatRu: { ...typography.body, color: colors.textPrimary, lineHeight: 26 },
  source: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },

  playBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  playBtnActive: { backgroundColor: colors.primaryDark },
  playText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  hadithBox: { marginVertical: spacing.md },
  hadithDesc: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  openBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  openText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  urlText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  openBtnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  openTextSecondary: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  noteBox: {
    backgroundColor: colors.warning + '15',
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.md,
  },
  noteText: { ...typography.small, color: colors.warning, lineHeight: 18 },
  hintText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  closeBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  closeText: { color: colors.textPrimary, fontWeight: '600' },
});
