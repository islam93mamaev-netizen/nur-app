import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { gregorianToHijri, HIJRI_MONTHS } from '../../utils/hijri';

// Календарные события исламского года (по лунному календарю)
const EVENTS = [
  { month: 1, day: 1,  title: 'Новый год по хиджре', desc: 'Начало исламского года', icon: '🌙' },
  { month: 1, day: 9,  title: 'Тасуʿа', desc: 'Желательный пост накануне Ашуры', icon: '🌿' },
  { month: 1, day: 10, title: 'Ашура', desc: 'Желательный пост — искупает грехи прошедшего года', icon: '🤲' },
  { month: 3, day: 12, title: 'Мавлид', desc: 'День рождения пророка Мухаммада ﷺ (не отмечается как праздник большинством учёных)', icon: '🌹' },
  { month: 7, day: 27, title: 'Исра ва Миʿрадж', desc: 'Ночное путешествие пророка ﷺ (точная дата неизвестна)', icon: '✨' },
  { month: 8, day: 15, title: 'Лейлят аль-Бараʿа', desc: 'Ночь освобождения (по некоторым мнениям)', icon: '🕯️' },
  { month: 9, day: 1,  title: 'Начало Рамадана', desc: 'Месяц обязательного поста', icon: '🕌' },
  { month: 9, day: 21, title: 'Последняя декада Рамадана', desc: 'Иʿтикаф; усиленное поклонение', icon: '📿' },
  { month: 9, day: 27, title: 'Лейлят аль-Кадр (вероятная)', desc: 'Ночь Предопределения — лучше тысячи месяцев', icon: '⭐' },
  { month: 10, day: 1, title: 'Иду-ль-Фитр', desc: 'Праздник разговения; нельзя поститься', icon: '🎉' },
  { month: 10, day: 2, title: 'Шесть дней Шавваля', desc: '6 дней поста после Эйда = как годовой пост', icon: '🌿' },
  { month: 12, day: 1, title: 'Первые 10 дней Зу-ль-Хиджа', desc: 'Лучшие дни года для поклонения', icon: '⭐' },
  { month: 12, day: 8, title: 'Тарвия', desc: 'Начало Хаджа; паломники выходят в Мину', icon: '🕋' },
  { month: 12, day: 9, title: 'День Арафата', desc: 'Главный день хаджа; пост искупает 2 года для не-паломников', icon: '🌄' },
  { month: 12, day: 10, title: 'Иду-ль-Адха', desc: 'Праздник жертвоприношения', icon: '🐑' },
  { month: 12, day: 11, title: 'Дни Ташрик', desc: '11-13 — нельзя поститься, поминание Аллаха', icon: '✨' },
];

// «Айям аль-Бид» — белые дни каждого месяца (13, 14, 15) — желательный пост.
function isWhiteDays(hijriDay) {
  return hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
}

// Понедельник/четверг — желательный пост.
function isMondayOrThursday(gregorianDate) {
  const d = gregorianDate.getDay();
  return d === 1 || d === 4;
}

export default function HijriScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const today = new Date();
  const hijri = gregorianToHijri(today);
  const upcoming = EVENTS
    .map((e) => ({ ...e, daysAway: calculateDaysUntil(hijri, e) }))
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, 5);

  return (
    <Screen padded={false}>
      <DetailHeader onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Календарь хиджры</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={styles.todayLabel}>Сегодня</Text>
          <Text style={styles.todayDate}>
            {hijri.day} {HIJRI_MONTHS[hijri.month - 1]} {hijri.year} г.х.
          </Text>
          <Text style={styles.greg}>
            {today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} по григорианскому
          </Text>
        </Card>

        {/* Подсказки о желательных постах */}
        {(isWhiteDays(hijri.day) || isMondayOrThursday(today)) && (
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.success + '12', borderLeftWidth: 4, borderLeftColor: colors.success }}>
            <Text style={[styles.todayLabel, { color: colors.success }]}>🌿 Желательный пост сегодня</Text>
            {isWhiteDays(hijri.day) && (
              <Text style={styles.note}>
                Айям аль-Бид (13, 14, 15 числа лунного месяца) — пост каждого месяца, по сунне равен непрерывному посту в течение года.
              </Text>
            )}
            {isMondayOrThursday(today) && (
              <Text style={styles.note}>
                Понедельник или четверг — пророк ﷺ постился в эти дни: «В эти дни деяния поднимаются к Аллаху, и я люблю, чтобы моё дело было поднято, когда я пощусь».
              </Text>
            )}
          </Card>
        )}

        <Text style={styles.sectionTitle}>Ближайшие события</Text>
        {upcoming.map((e, i) => (
          <Card key={i} style={{ marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.accent }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{e.title}</Text>
                <Text style={styles.eventDate}>
                  {e.day} {HIJRI_MONTHS[e.month - 1]}
                </Text>
                <Text style={styles.eventDesc}>{e.desc}</Text>
              </View>
              <Pill
                label={e.daysAway === 0 ? 'Сегодня' : `Через ${e.daysAway} ≈ дн.`}
                background={colors.accent + '20'}
                textColor={colors.accentDark}
              />
            </View>
          </Card>
        ))}

        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.info + '10' }}>
          <Text style={[styles.sectionTitle, { color: colors.info, marginTop: 0 }]}>📅 О хиджре</Text>
          <Text style={styles.note}>
            Хиджра — исламский лунный календарь, начатый с переселения пророка Мухаммада ﷺ из Мекки в Медину в 622 году. Лунный год короче солнечного на ~11 дней.{'\n\n'}
            Конвертация выполняется по астрономической формуле и может расходиться с официальным календарём Умм аль-Кура на ±1 день.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function calculateDaysUntil(today, ev) {
  // Простая аппроксимация: посчитаем количество лунных дней до события
  const lunarDaysPerMonth = 29.53;
  const todayDays = today.month * lunarDaysPerMonth + today.day;
  let eventDays = ev.month * lunarDaysPerMonth + ev.day;
  if (eventDays < todayDays) eventDays += 354.36; // следующий год
  return Math.max(0, Math.round(eventDays - todayDays));
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  todayLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  todayDate: { ...typography.h2, color: colors.primary, marginTop: 4 },
  greg: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  eventTitle: { ...typography.h4, color: colors.textPrimary },
  eventDate: { ...typography.small, color: colors.accentDark, marginTop: 2, fontWeight: '700' },
  eventDesc: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  note: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },
});
