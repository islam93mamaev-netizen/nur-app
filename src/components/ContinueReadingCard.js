// «Продолжить чтение» — карточка на главной с последней открытой сурой.
// Читает позицию из AsyncStorage (пишет её SurahScreen) и обновляется
// при каждом возврате на главный экран (useFocusEffect).

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Card from './Card';
import Icon from './Icon';
import SectionHeader from './SectionHeader';
import { spacing, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';
import { LAST_READ_KEY } from '../screens/quran/SurahScreen';

export default function ContinueReadingCard({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [last, setLast] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      AsyncStorage.getItem(LAST_READ_KEY)
        .then((raw) => {
          if (!alive || !raw) return;
          try { setLast(JSON.parse(raw)); } catch { /* ignore */ }
        })
        .catch(() => {});
      return () => { alive = false; };
    }, [])
  );

  if (!last?.surahId) return null;

  return (
    <>
      <SectionHeader title="Коран" />
      <Card onPress={() => navigation.navigate('Surah', { surahId: last.surahId })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.iconBox}>
            <Icon name="bookOpen" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Продолжить чтение</Text>
            <Text style={styles.title}>
              Сура {last.surahId}. {last.name}{last.nameAr ? `  ${last.nameAr}` : ''}
            </Text>
          </View>
          <Icon name="chevronRight" size={20} color={colors.textMuted} />
        </View>
      </Card>
    </>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  label: { ...typography.caption, color: colors.textSecondary },
  title: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 2 },
});
