// «Источники и проверка» — откуда взят контент и как оценивается его достоверность.
// Открывается из Профиля. Цифры по хадисам считаются из данных, не вписаны руками.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { hadiths } from '../../data/hadiths';
import { arbainHadiths } from '../../data/arbain';
import { faqs } from '../../data/faq';
import { hadithGrade } from '../../utils/hadithGrade';

const SUPPORT_EMAIL = 'islam93.mamaev@gmail.com';

const SECTIONS = [
  {
    title: 'Коран',
    items: [
      'Арабский текст — мусхаф Усмани (через AlQuran Cloud).',
      'Перевод смыслов — Эльмир Кулиев.',
      'Аудио — чтецы с CDN islamic.network.',
    ],
  },
  {
    title: 'Хадисы',
    items: [
      '«Сорок хадисов» имама ан-Навави с пояснениями по Ибн Раджабу («Джамиʿ аль-улюм валь-хикам»).',
      '«Рияд ас-Салихин», «Сахих» аль-Бухари и «Сахих» Муслима.',
      'Переводы смысловые; для серьёзного изучения сверяйтесь с авторитетными изданиями.',
    ],
  },
  {
    title: 'Азкары и дуа',
    items: [
      '«Хисн аль-Муслим» Саʿида аль-Кахтани.',
      '«Аль-Калим ат-Таййиб» Ибн Таймии.',
      'У каждого текста указан источник.',
    ],
  },
  {
    title: 'Фикх (вопросы и ответы)',
    items: [
      '«Аль-Фикх аль-Муяссар», «Минхадж ат-Талибин» и «Аль-Маджму» имама ан-Навави.',
      'Там, где мазхабы расходятся, это указано в ответе.',
    ],
  },
  {
    title: 'Время намаза',
    items: [
      'Расчёт по астрономическим формулам (библиотека adhan), метод и мазхаб выбираются в настройках.',
      'Время может отличаться от расписания местной мечети на несколько минут — ориентируйтесь на неё.',
    ],
  },
];

export default function SourcesScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const stats = useMemo(() => {
    const all = [...hadiths, ...arbainHadiths];
    const graded = all.filter((h) => hadithGrade(h));
    const sahih = graded.filter((h) => hadithGrade(h).id === 'sahih').length;
    return { total: all.length, graded: graded.length, sahih, pending: all.length - graded.length };
  }, []);
  const faqWithMazhab = faqs.filter((q) => !!q.mazhabNote).length;

  const report = () => {
    const subject = encodeURIComponent('Нур: ошибка в контенте');
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`).catch(() => {});
  };

  return (
    <Screen padded={false}>
      <DetailHeader
        onBack={() => navigation.goBack()}
        title="Источники и проверка"
        subtitle="Откуда взят контент и как мы отмечаем достоверность"
        pattern
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={styles.cardTitle}>Достоверность хадисов</Text>
          <Text style={styles.p}>
            У каждого хадиса показана степень: сахих (достоверный), хасан (хороший) или
            «не указана». Хадисы из Сахихов аль-Бухари и Муслима — сахих по единогласному
            мнению учёных. Для остальных приводится оценка из классического источника
            (например, ан-Навави в «40 хадисах»). Если оценки нет — мы не придумываем её.
          </Text>
          <View style={styles.statsRow}>
            <Stat styles={styles} value={stats.total} label="хадисов" />
            <Stat styles={styles} value={stats.sahih} label="сахих" />
            <Stat styles={styles} value={stats.graded - stats.sahih} label="хасан" />
            <Stat styles={styles} value={stats.pending} label="уточняется" />
          </View>
          <Text style={[styles.p, { marginTop: spacing.sm }]}>
            Вопросов по фикху с пометкой о мазхабах: {faqWithMazhab} из {faqs.length}.
          </Text>
        </Card>

        {SECTIONS.map((s) => (
          <View key={s.title} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.sectionLabel}>{s.title}</Text>
            <Card>
              {s.items.map((t, i) => (
                <Text key={i} style={[styles.p, i > 0 && { marginTop: spacing.sm }]}>• {t}</Text>
              ))}
            </Card>
          </View>
        ))}

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={styles.cardTitle}>Важно</Text>
          <Text style={styles.p}>
            Нур — учебное приложение, а не фетва. В личных и спорных вопросах обращайтесь
            к знающему учёному вашего мазхаба.
          </Text>
        </Card>

        <Button title="Сообщить об ошибке в контенте" onPress={report} />
        <Text style={styles.footnote}>Письмо на {SUPPORT_EMAIL}</Text>
      </ScrollView>
    </Screen>
  );
}

function Stat({ styles, value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  sectionLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  p: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.h3, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  footnote: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
