// «Путь арабского» — дорожка обучения: этапы → шаги.
// Линейная разблокировка, прогресс в progressStore.completedPathUnits.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import PatternBackground from '../../components/PatternBackground';
import Icon from '../../components/Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { useProgress } from '../../store/progressStore';
import { pathStages, allUnits, getNextUnit, isUnitUnlocked } from '../../data/arabicPath';
import CategoryIcon from '../../components/CategoryIcon';
import IconText from '../../components/IconText';

export default function ArabicPathScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state } = useProgress();
  const completed = state.completedPathUnits || {};

  const doneCount = allUnits.filter((u) => completed[u.id]).length;
  const next = getNextUnit(completed);

  // Дневная цель: пройден ли хотя бы один шаг сегодня
  const today = new Date().toDateString();
  const doneToday = Object.values(completed).some(
    (v) => v?.date && new Date(v.date).toDateString() === today
  );
  const dailyMinutes = state.profile?.dailyMinutes || 10;

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <PatternBackground from={colors.primary} to={colors.primaryDark} />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Путь арабского</Text>
        <Text style={styles.subtitle}>
          От первой буквы до чтения Корана · шаг за шагом
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <ProgressBar value={doneCount} max={allUnits.length} color={colors.accent} />
          <Text style={styles.headProgress}>
            {doneCount} из {allUnits.length} шагов пройдено
          </Text>
        </View>
        {/* Дневная цель — из онбординга (минут в день) */}
        <View style={styles.dailyGoal}>
          <Icon name={doneToday ? 'check' : 'flame'} size={14} color={doneToday ? '#7CE0B8' : 'rgba(255,255,255,0.9)'} />
          <Text style={styles.dailyGoalText}>
            {doneToday
              ? 'Цель на сегодня выполнена — шаг пройден!'
              : `Цель на сегодня: 1 шаг ≈ ${dailyMinutes} мин`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Продолжить */}
        {next && (
          <Card
            onPress={() => navigation.navigate('PathUnit', { unitId: next.id })}
            style={[styles.nextCard, { borderColor: colors.accent }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.nextIcon, { backgroundColor: colors.accent + '20' }]}>
                <Icon name="play" size={18} color={colors.accentDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextLabel}>Продолжить путь</Text>
                <Text style={styles.nextTitle} numberOfLines={1}>{next.title}</Text>
              </View>
              <Icon name="chevronRight" size={20} color={colors.textMuted} />
            </View>
          </Card>
        )}
        {!next && (
          <Card style={{ backgroundColor: colors.success + '15', marginBottom: spacing.lg }}>
            <IconText icon="star" style={{ ...typography.h4, color: colors.success, textAlign: 'center' }}>МашаАллах! Весь путь пройден</IconText>
          </Card>
        )}

        {pathStages.map((stage, si) => {
          const stageDone = stage.units.filter((u) => completed[u.id]).length;
          return (
            <View key={stage.id} style={{ marginBottom: spacing.lg }}>
              <View style={styles.stageHeader}>
                <View style={[styles.stageNum, { backgroundColor: stage.color }]}>
                  <Text style={styles.stageNumText}>{si + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stageTitle}>{stage.title}</Text>
                  <Text style={styles.stageDesc}>{stage.desc}</Text>
                </View>
                <Text style={[styles.stageCount, { color: stage.color }]}>
                  {stageDone}/{stage.units.length}
                </Text>
              </View>

              <Card padded={false}>
                {stage.units.map((unit, ui) => {
                  const done = !!completed[unit.id];
                  const unlocked = isUnitUnlocked(unit.id, completed);
                  const isNext = next?.id === unit.id;
                  return (
                    <TouchableOpacity
                      key={unit.id}
                      disabled={!unlocked}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('PathUnit', { unitId: unit.id })}
                      style={[
                        styles.unitRow,
                        ui < stage.units.length - 1 && styles.unitRowBorder,
                        !unlocked && { opacity: 0.45 },
                      ]}
                    >
                      <View
                        style={[
                          styles.unitStatus,
                          done && { backgroundColor: stage.color, borderColor: stage.color },
                          isNext && !done && { borderColor: stage.color },
                        ]}
                      >
                        {done ? (
                          <Icon name="check" size={13} color="#fff" />
                        ) : unlocked ? (
                          <Icon name="play" size={11} color={stage.color} />
                        ) : (
                          <CategoryIcon icon="🔒" textStyle={styles.lock} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.unitTitle, isNext && { color: stage.color, fontWeight: '700' }]}
                          numberOfLines={1}
                        >
                          {unit.title}
                        </Text>
                        {unit.subtitle ? (
                          <Text style={styles.unitSub} numberOfLines={1}>{unit.subtitle}</Text>
                        ) : null}
                      </View>
                      {unlocked && <Icon name="chevronRight" size={16} color={colors.textMuted} />}
                    </TouchableOpacity>
                  );
                })}
              </Card>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  back: { ...typography.bodyMedium, color: '#fff' },
  title: { ...typography.h1, color: '#fff', marginTop: spacing.sm },
  subtitle: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  headProgress: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  dailyGoal: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    gap: 6,
  },
  dailyGoalText: { ...typography.caption, color: '#fff', fontWeight: '600' },

  nextCard: { marginBottom: spacing.lg, borderWidth: 1.5 },
  nextIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  nextLabel: { ...typography.caption, color: colors.textSecondary },
  nextTitle: { ...typography.h4, color: colors.textPrimary, marginTop: 2 },

  stageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  stageNum: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stageNumText: { ...typography.bodyMedium, color: '#fff', fontWeight: '800' },
  stageTitle: { ...typography.h4, color: colors.textPrimary },
  stageDesc: { ...typography.caption, color: colors.textSecondary },
  stageCount: { ...typography.bodyMedium, fontWeight: '700' },

  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  unitRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  unitStatus: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.surface,
  },
  lock: { fontSize: 11 },
  unitTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  unitSub: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
});
