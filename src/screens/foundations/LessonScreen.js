import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { findLesson } from '../../data/modules';
import { useProgress } from '../../store/progressStore';
import WuduIllustration, { WUDU_STEP_ORDER } from '../../components/WuduIllustration';
import { getPrayerImage } from '../../data/prayerAssets';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

// Главные позиции намаза для галереи в уроке m4l2.
// Ссылки на ключи из prayerAssets.js (наши собственные картинки).
const PRAYER_GALLERY = [
  { image: 'niet',        title: 'Намерение (ният)',        desc: 'Встать лицом к кибле. Намерение — в сердце.' },
  { image: 'takbir',      title: 'Такбиратуль-Ихрам',       desc: 'Поднять руки до ушей, произнести «Аллаху Акбар».' },
  { image: 'qyam',        title: 'Кыям — Стояние',          desc: 'Сложить руки, прочитать Аль-Фатиху и доп. суру.' },
  { image: 'ruku',        title: 'Руку — Поясной поклон',   desc: 'Спина горизонтально. «Субхана Раббия аль-Азым» × 3.' },
  { image: 'sajda',       title: 'Суджуд — Земной поклон',  desc: 'Лоб, нос, ладони, колени, пальцы ног на полу. «Субхана Раббия аль-Аʿля» × 3.' },
  { image: 'tashahud',    title: 'Ташаххуд — Сидение',      desc: 'Прочитать Ат-Тахийят. При свидетельстве — указательный палец вверх.' },
  { image: 'salam_right', title: 'Таслим вправо',           desc: 'Повернуть голову направо: «Ас-саляму ‘алейкум ва рахматуЛлах».' },
  { image: 'salam_left',  title: 'Таслим влево',            desc: 'Затем повернуть голову налево с теми же словами. Намаз завершён.' },
];

export default function LessonScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const data = findLesson(route.params.lessonId);
  const { completeLesson, state } = useProgress();

  if (!data) return null;
  const { lesson, module } = data;
  const isDone = !!state.completedLessons[lesson.id];

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Text style={styles.back}>← {module.title}</Text>
        </TouchableOpacity>

        <Pill label={module.title} background={module.color + '15'} textColor={module.color} />
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.summary}>{lesson.summary}</Text>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.content}>{lesson.content}</Text>
        </Card>

        {/* Иллюстрации для урока про омовение */}
        {lesson.id === 'm4l1' && (
          <>
            <IconText icon="image" style={styles.sectionLabel}>Пошагово</IconText>
            {WUDU_STEP_ORDER.map((s, i) => (
              <View key={s} style={{ marginBottom: spacing.sm }}>
                <View style={styles.stepHead}>
                  <View style={[styles.stepNum, { backgroundColor: module.color }]}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                </View>
                <WuduIllustration step={s} />
              </View>
            ))}
          </>
        )}

        {/* Иллюстрации для урока про намаз */}
        {lesson.id === 'm4l2' && (
          <>
            <IconText icon="image" style={styles.sectionLabel}>Позиции намаза</IconText>
            {PRAYER_GALLERY.map((p, i) => {
              const img = getPrayerImage(p.image);
              return (
                <Card key={p.image} style={{ marginBottom: spacing.md }}>
                  <View style={styles.galleryRow}>
                    <View style={[styles.stepNum, { backgroundColor: module.color }]}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.galleryTitle}>{p.title}</Text>
                  </View>
                  {img && (
                    <View style={styles.galleryImgBox}>
                      <Image source={img} style={styles.galleryImg} resizeMode="contain" />
                    </View>
                  )}
                  <Text style={styles.galleryDesc}>{p.desc}</Text>
                </Card>
              );
            })}

            <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
              <Text style={[styles.caption, { color: colors.accentDark }]}>
                Один ракят = Кыям → Руку → Иʿтидаль → Суджуд → Сидение → Суджуд.
                В намазах из 2/3/4 ракятов это повторяется; в конце — ташаххуд + таслим.
              </Text>
            </Card>

            <Button
              title="Открыть пошаговый интерактивный урок"
              size="lg"
              onPress={() => navigation.navigate('PrayerLesson', { lessonId: 'zuhr_4' })}
              style={{ marginBottom: spacing.md }}
            />
          </>
        )}

        <Text style={styles.sectionLabel}>Ключевые мысли</Text>
        <Card>
          {lesson.keyPoints.map((kp, i) => (
            <View key={i} style={styles.kpRow}>
              <View style={[styles.bullet, { backgroundColor: module.color }]} />
              <Text style={styles.kpText}>{kp}</Text>
            </View>
          ))}
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          {!isDone && (
            <Button
              title="Отметить как пройденный"
              variant="outline"
              onPress={() => completeLesson(lesson.id)}
              style={{ marginBottom: spacing.sm }}
            />
          )}
          {isDone && (
            <View style={styles.donePill}>
              <Text style={styles.doneText}>✓ Урок пройден</Text>
            </View>
          )}
          {lesson.quizId && (
            <Button
              title="Пройти тест"
              size="lg"
              onPress={() => navigation.navigate('Quiz', { quizId: lesson.quizId, returnTo: 'Lesson' })}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  back: { ...typography.bodyMedium, color: colors.primary },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.md },
  summary: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: 'italic' },
  content: { ...typography.body, color: colors.textPrimary, lineHeight: 26 },
  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
  kpRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  bullet: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  kpText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  caption: { ...typography.small, color: colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },
  stepHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '700' },
  donePill: {
    backgroundColor: colors.success + '20',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  doneText: { ...typography.bodyMedium, color: colors.success, fontWeight: '700' },

  // Галерея позиций намаза
  galleryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  galleryTitle: { ...typography.h4, color: colors.textPrimary, marginLeft: spacing.sm, flex: 1 },
  galleryImgBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.sm,
  },
  galleryImg: { width: 180, height: 220 },
  galleryDesc: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
});
