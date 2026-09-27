import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Button from '../../components/Button';
import { spacing, radii, typography } from '../../constants/theme';
import { arbainHadiths } from '../../data/arbain';
import { hadiths } from '../../data/hadiths';
import { useTheme } from '../../store/themeStore';

const ARBAIN_TEXT = `«Сорок хадисов ан-Навави» — это не сборник в смысле «Сахиха» Бухари или Муслима, а особый жанр исламской науки, называемый «китаб аль-арбаʿин» («книга сорока»).

Традиция восходит к хадису пророка ﷺ: «Кто сохранит для моей уммы сорок хадисов из её религии, того Аллах воскресит в День Воскрешения среди фукаха и ʿуляма». Хадис передаётся разными путями (одни учёные оценивают как достоверный, другие — как слабый), но на его основании учёные на протяжении веков составляли свои подборки.

Самой популярной стала подборка имама Йахьи ибн Шарафа ан-Навави (ум. 676 г.х. / 1277 г.), потому что он выбрал хадисы по специфическому критерию: каждый из них — «джавамиʿ аль-калим», то есть короткое высказывание пророка ﷺ, в котором сжата целая фундаментальная тема Ислама.

Из 42 хадисов (название «сорок» — округление) можно вывести почти весь корпус акыды, фикха, ахляка и адаба. Имам Ибн Раджаб написал к ним отдельный комментарий «Джамиʿ аль-улюм валь-хикам» — два толстых тома, потому что каждый хадис разворачивается в целую науку.

В исламской педагогике это «обязательный школьный минимум»: сначала «Арбаʿин» ан-Навави целиком — затем «Рияд ас-Салихин» того же автора (≈1 900 хадисов по 372 темам) — и только потом углублённое чтение Бухари и Муслима.`;

export default function HadithsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [showSahihs, setShowSahihs] = useState(false);

  const data = useMemo(
    () =>
      arbainHadiths.map((it) => ({
        type: 'arbain',
        key: 'a_' + it.n,
        n: it.n,
        title: it.title,
        themes: it.themes,
        source: it.source,
      })),
    []
  );

  const renderArbainItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ArbainDetail', { n: item.n })}
    >
      <Card style={{ marginBottom: spacing.md }}>
        <View style={styles.row}>
          <View style={styles.numBox}>
            <Text style={styles.numText}>{item.n}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.themesRow}>
              {(item.themes || []).slice(0, 3).map((t, i) => (
                <Pill key={i} label={t} background={colors.primary + '15'} textColor={colors.primary} />
              ))}
            </View>
            <Text style={styles.src}>{item.source}</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Хадисы</Text>
            <Text style={styles.subtitle}>40 хадисов имама ан-Навави — учебный фундамент</Text>
          </View>
          <TouchableOpacity
            onPress={() => setInfoOpen(true)}
            style={styles.infoBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.infoIcon}>ⓘ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={renderArbainItem}
        ListFooterComponent={
          <View style={{ marginTop: spacing.lg }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowSahihs((v) => !v)}
              style={styles.sahihsHeader}
            >
              <Text style={styles.sahihsHeaderTitle}>
                Другие хадисы из сахихов
              </Text>
              <Text style={styles.sahihsHeaderSub}>
                {hadiths.length} хадисов из Бухари, Муслима и др.
                {!showSahihs && '  ·  нажмите чтобы открыть'}
              </Text>
              <Text style={[styles.chev, showSahihs && { transform: [{ rotate: '90deg' }] }]}>›</Text>
            </TouchableOpacity>

            {showSahihs && hadiths.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('HadithDetail', { hadithId: item.id })}
              >
                <Card style={{ marginBottom: spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.smallNum}>№ {item.number}</Text>
                    <Pill label={item.theme} background={colors.primary + '15'} textColor={colors.primary} />
                  </View>
                  <Text style={styles.smallTitle}>{item.title}</Text>
                  <Text style={styles.smallSource}>{item.source}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      <Modal visible={infoOpen} animationType="slide" transparent onRequestClose={() => setInfoOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
              <Text style={styles.modalTitle}>О сборнике «40 хадисов»</Text>
              <Text style={styles.modalText}>{ARBAIN_TEXT}</Text>
              <View style={{ marginTop: spacing.lg }}>
                <Button title="Закрыть" variant="ghost" onPress={() => setInfoOpen(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  infoBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#ffffff25',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4, marginLeft: spacing.sm,
  },
  infoIcon: { fontSize: 20, color: '#fff', fontWeight: '700' },

  row: { flexDirection: 'row', alignItems: 'center' },
  numBox: {
    width: 48, height: 48, borderRadius: radii.md,
    backgroundColor: colors.accent + '20',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  numText: { ...typography.h3, color: colors.accentDark, fontWeight: '700' },
  hTitle: { ...typography.h4, color: colors.textPrimary },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4 },
  src: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  chev: { fontSize: 26, color: colors.textMuted, marginLeft: spacing.sm },

  sahihsHeader: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sahihsHeaderTitle: { ...typography.h4, color: colors.textPrimary, flex: 1 },
  sahihsHeaderSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2, width: '100%' },

  smallNum: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  smallTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.sm },
  smallSource: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginTop: 8,
  },
  modalTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  modalText: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
});
