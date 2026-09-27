import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, typography, radii } from '../../constants/theme';
import { surahs as fallbackSurahs } from '../../data/quran';
import { getChaptersList } from '../../services/quranService';
import { useTheme } from '../../store/themeStore';

export default function QuranScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [surahs, setSurahs] = useState(fallbackSurahs);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await getChaptersList();
        if (alive && list?.length) {
          setSurahs(list);
          setOnline(true);
        }
      } catch (e) {
        // оффлайн — используем встроенные суры
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <Screen padded={false}>
      <View style={{ padding: spacing.lg }}>
        <Text style={styles.title}>Коран</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={styles.subtitle}>{surahs.length} сур</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: spacing.sm }} />
          ) : (
            <Pill
              label={online ? 'Онлайн' : 'Офлайн'}
              background={online ? colors.success + '20' : colors.warning + '20'}
              textColor={online ? colors.success : colors.warning}
            />
          )}
        </View>
      </View>

      <FlatList
        data={surahs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Surah', { surahId: item.id })}
          >
            <Card style={{ marginBottom: spacing.md }}>
              <View style={styles.row}>
                <View style={styles.numBox}>
                  <Text style={styles.numText}>{item.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.surahName}>{item.name}</Text>
                    <Text style={styles.surahNameAr}>{item.nameAr}</Text>
                  </View>
                  <Text style={styles.surahMeta}>
                    {item.translation} • {item.ayatCount} аят.
                  </Text>
                </View>
                <Pill
                  label={item.type === 'meccan' ? 'Мекка' : 'Медина'}
                  background={item.type === 'meccan' ? colors.accent + '20' : colors.info + '20'}
                  textColor={item.type === 'meccan' ? colors.accentDark : colors.info}
                />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginRight: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  numBox: {
    width: 44, height: 44, borderRadius: radii.md,
    backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  numText: { ...typography.h4, color: colors.primary },
  surahName: { ...typography.h4, color: colors.textPrimary, marginRight: spacing.sm },
  surahNameAr: { fontSize: 18, color: colors.primary },
  surahMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
