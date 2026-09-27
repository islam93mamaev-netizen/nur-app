import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, typography, radii } from '../../constants/theme';
import { modules } from '../../data/modules';
import { useTheme } from '../../store/themeStore';

export default function PracticeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Берём модуль «Практика мусульманина»
  const practice = modules.find((m) => m.id === 'm4');
  if (!practice) return null;

  return (
    <Screen padded={false}>
      <View style={[styles.header, { backgroundColor: practice.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.icon}>{practice.icon}</Text>
        <Text style={styles.title}>{practice.title}</Text>
        <Text style={styles.desc}>{practice.description}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Баннер: пошаговый интерактивный урок намаза */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('PrayerLesson', { lessonId: 'zuhr_4' })}
        >
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '15', borderLeftWidth: 4, borderLeftColor: colors.accent }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 36, marginRight: spacing.md }}>🕌</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lessonTitle, { color: colors.accentDark }]}>
                  Обучение намазу — пошаговый урок
                </Text>
                <Text style={styles.lessonSummary}>
                  Зухр, 4 ракята. Каждый шаг — иллюстрация, арабский / транскрипция / перевод, аудио-проговор.
                </Text>
              </View>
              <Text style={{ fontSize: 28, color: colors.textMuted }}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {practice.lessons.map((l) => (
          <TouchableOpacity
            key={l.id}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Lesson', { lessonId: l.id })}
          >
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={styles.lessonTitle}>{l.title}</Text>
              <Text style={styles.lessonSummary}>{l.summary}</Text>
              <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
                <Pill label="Открыть" background={practice.color + '15'} textColor={practice.color} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  back: { ...typography.bodyMedium, color: '#fff' },
  icon: { fontSize: 36, marginBottom: spacing.sm },
  title: { ...typography.h1, color: '#fff' },
  desc: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },
  lessonTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  lessonSummary: { ...typography.small, color: colors.textSecondary },
});
