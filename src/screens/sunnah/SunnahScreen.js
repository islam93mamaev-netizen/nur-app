// «Сунны дня» — чек-лист ежедневных сунн Пророка ﷺ (раздел «Поклонение»).
// Отметки хранятся в progressStore и сбрасываются автоматически при смене даты.
// За каждую отмеченную сунну начисляется немного XP (раз в день).

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import Icon from '../../components/Icon';
import CategoryIcon from '../../components/CategoryIcon';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { useProgress } from '../../store/progressStore';
import { sunnahDaily } from '../../data/sunnahDaily';
import * as haptics from '../../utils/haptics';
import IconText from '../../components/IconText';

// Экраны-вкладки лежат внутри навигатора «Main»: в React Navigation 7
// к ним нужно переходить через родителя, иначе переход не сработает.
const TAB_ROUTES = new Set(['Home', 'Foundations', 'Quran', 'Words', 'Profile']);

export default function SunnahScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { getSunnahDoneToday, toggleSunnahDone } = useProgress();

  const done = getSunnahDoneToday();
  const total = sunnahDaily.length;
  const doneCount = sunnahDaily.filter((s) => done[s.id]).length;
  const pct = Math.round((doneCount / total) * 100);

  const toggle = (id) => {
    const willComplete = !done[id] && doneCount + 1 === total;
    if (willComplete) haptics.success();
    else haptics.tap();
    toggleSunnahDone(id);
  };

  const open = (route, params) => {
    if (TAB_ROUTES.has(route)) navigation.navigate('Main', { screen: route, params });
    else navigation.navigate(route, params);
  };

  return (
    <Screen padded={false}>
      <DetailHeader
        onBack={() => navigation.goBack()}
        title="Сунны дня"
        subtitle="Ежедневные сунны Пророка ﷺ — отмечайте выполненное. Список обновляется каждый день."
        pattern
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Прогресс за сегодня */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressLabel}>Сегодня</Text>
              <Text style={styles.progressValue}>{doneCount} из {total}</Text>
            </View>
            <View style={[styles.badge, pct === 100 && { backgroundColor: colors.success }]}>
              <Text style={styles.badgeText}>{pct}%</Text>
            </View>
          </View>
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar value={doneCount} max={total} color={pct === 100 ? colors.success : colors.primary} />
          </View>
          {pct === 100 && (
            <IconText icon="star" style={styles.allDone}>МашаАллах! Все сунны на сегодня выполнены</IconText>
          )}
        </Card>

        {/* Список сунн */}
        <Card padded={false}>
          {sunnahDaily.map((item, i) => {
            const isDone = !!done[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => toggle(item.id)}
                style={[styles.row, i < total - 1 && styles.rowBorder]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
                accessibilityLabel={item.title}
              >
                <View style={[styles.check, isDone && styles.checkDone]}>
                  {isDone && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
                </View>
                <CategoryIcon icon={item.icon} size={22} color={colors.primary} style={{ marginRight: spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, isDone && styles.titleDone]}>{item.title}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                {!!item.refRoute && (
                  <TouchableOpacity
                    onPress={() => open(item.refRoute, item.refParams)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.goBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Открыть: ${item.title}`}
                  >
                    <Icon name="chevronRight" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </Card>

        <Text style={styles.footnote}>
          Это сунна, а не обязательные действия (фард). Отметки сбрасываются в полночь —
          завтра начнёте с чистого листа.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressLabel: { ...typography.caption, color: colors.textSecondary },
  progressValue: { ...typography.h3, color: colors.textPrimary, marginTop: 2 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  badgeText: { ...typography.bodyMedium, color: '#fff', fontWeight: '800' },
  allDone: { ...typography.bodyMedium, color: colors.success, fontWeight: '700', textAlign: 'center', marginTop: spacing.md },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
  title: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  desc: { ...typography.caption, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  goBtn: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },

  footnote: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, lineHeight: 17 },
});
