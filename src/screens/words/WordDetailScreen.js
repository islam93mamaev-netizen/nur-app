import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Pill from '../../components/Pill';
import WordBreakdown from '../../components/WordBreakdown';
import { spacing, typography } from '../../constants/theme';
import { findWord, words } from '../../data/words';
import { useProgress } from '../../store/progressStore';
import { speak } from '../../services/ttsService';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

// Несколько готовых простых предложений по словам — для запоминания в контексте.
// Если слова нет в словаре — показываем только аят-пример.
const SENTENCE_BANK = {
  // Местоимения
  p1: { ar: 'هُوَ ٱللَّهُ ٱلْأَحَدُ', ru: 'Он — Аллах Единый. (112:1)' },
  p2: { ar: 'هِيَ أُمِّي', ru: 'Она — моя мать.' },
  p3: { ar: 'هُمْ مِنَ ٱلْمُؤْمِنِينَ', ru: 'Они — из верующих.' },
  p5: { ar: 'أَنْتَ صَدِيقِي', ru: 'Ты — мой друг.' },
  p8: { ar: 'أَنَا مُسْلِمٌ', ru: 'Я — мусульманин.' },
  p9: { ar: 'نَحْنُ نَعْبُدُ ٱللَّهَ', ru: 'Мы поклоняемся Аллаху.' },
  // Местоимения общеконтекстные
  p18: { ar: 'كُلُّ نَفْسٍ ذَائِقَةُ ٱلْمَوْتِ', ru: 'Каждая душа вкусит смерть. (3:185)' },

  // Имена Аллаха
  a1: { ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', ru: 'Во имя Аллаха, Милостивого, Милосердного.' },
  a2: { ar: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', ru: 'Хвала Аллаху — Господу миров. (1:2)' },

  // Существительные
  n6: { ar: 'فِي قَلْبِي إِيمَانٌ', ru: 'В моём сердце — вера.' },
  n12: { ar: 'هَٰذَا خَيْرٌ لَكَ', ru: 'Это благо для тебя.' },
  n8: { ar: 'إِنَّ ٱلْإِنْسَانَ لَفِي خُسْرٍ', ru: 'Воистину, человек в убытке. (103:2)' },

  // Глаголы
  v1: { ar: 'قَالَ ٱلنَّبِيُّ ﷺ', ru: 'Сказал пророк ﷺ.' },
  v2: { ar: 'كَانَ ٱللَّهُ غَفُورًا رَّحِيمًا', ru: 'Аллах был Прощающим, Милосердным. (4:96)' },
  v3: { ar: 'ٱللَّهُ يَعْلَمُ كُلَّ شَيْءٍ', ru: 'Аллах знает каждую вещь.' },
  v4: { ar: 'ءَامَنَّا بِٱللَّهِ', ru: 'Мы уверовали в Аллаха.' },

  // Время / Место
  t1: { ar: 'فِي ٱللَّيْلِ نُصَلِّي', ru: 'Ночью мы молимся.' },
  pl1: { ar: 'فِي ٱلْأَرْضِ آيَاتٌ', ru: 'На земле — знамения. (51:20)' },
  pl2: { ar: 'فِي ٱلسَّمَاءِ نُجُومٌ', ru: 'На небе — звёзды.' },

  // Люди
  h1: { ar: 'أَبِي مُسْلِمٌ', ru: 'Мой отец — мусульманин.' },
  h2: { ar: 'أُمِّي تُحِبُّنِي', ru: 'Моя мать любит меня.' },
  h7: { ar: 'إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌ', ru: 'Воистину, верующие — братья. (49:10)' },

  // Религия
  r1: { ar: 'ٱلْإِسْلَامُ دِينُ ٱللَّهِ', ru: 'Ислам — религия Аллаха.' },
  r3: { ar: 'أَقِيمُوا ٱلصَّلَاةَ', ru: 'Совершайте молитву.' },
  r4: { ar: 'وَآتُوا ٱلزَّكَاةَ', ru: 'И давайте закят.' },
  r14: { ar: 'ٱلْقُرْآنُ كَلَامُ ٱللَّهِ', ru: 'Коран — слово Аллаха.' },
};

export default function WordDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const word = findWord(route.params.wordId);
  const { markWordLearned, state } = useProgress();
  if (!word) return null;

  const learnedInfo = state.learnedWords[word.id];
  const sameRoot = words.filter((w) => w.root === word.root && w.id !== word.id && w.root);
  const sentence = SENTENCE_BANK[word.id];

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        
        <TouchableOpacity onPress={() => speak(word.ar)}>
          <Text style={styles.arabic}>{word.ar}</Text>
        </TouchableOpacity>
        <Text style={styles.translit}>{word.tr}</Text>
        <Text style={styles.translation}>{word.ru}</Text>
        <TouchableOpacity
          onPress={() => speak(word.ar, { rate: 0.5 })}
          style={styles.listenBtn}
        >
          <IconText icon="volume" style={{ color: colors.primary, fontWeight: '700' }}>Прослушать</IconText>
        </TouchableOpacity>
        {word.freq ? (
          <Pill
            label={`в Коране ≈ ${word.freq} раз`}
            background="#fff"
            textColor={colors.primary}
          />
        ) : null}
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Разбор по буквам — это главная новая фича */}
        <Card style={{ marginBottom: spacing.md }}>
          <IconText icon="bookOpen" style={styles.label}>Разбор по буквам</IconText>
          <Text style={styles.caption}>Как из букв и огласовок складывается слово</Text>
          <View style={{ marginTop: spacing.sm }}>
            <WordBreakdown word={word.ar} transcription={word.tr} />
          </View>
        </Card>

        {!!word.root && (
          <Card style={{ marginBottom: spacing.md }}>
            <IconText icon="leaf" style={styles.label}>Корень</IconText>
            <Text style={styles.rootValue}>{word.root}</Text>
            <Text style={styles.caption}>
              В арабском все слова строятся из 3-4 коренных букв. Понимание корня — ключ к словарному запасу.
            </Text>
          </Card>
        )}

        {!!sentence && (
          <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
            <IconText icon="messageCircle" style={[styles.label, { color: colors.accentDark }]}>В предложении</IconText>
            <TouchableOpacity onPress={() => speak(sentence.ar)}>
              <Text style={styles.sentenceAr}>{sentence.ar}</Text>
            </TouchableOpacity>
            <Text style={styles.sentenceRu}>{sentence.ru}</Text>
            <TouchableOpacity onPress={() => speak(sentence.ar, { rate: 0.45 })} style={styles.sentenceBtn}>
              <IconText icon="volume" style={{ color: colors.accentDark, fontWeight: '700' }}>Прослушать медленно</IconText>
            </TouchableOpacity>
          </Card>
        )}

        {!!word.example && (
          <Card style={{ marginBottom: spacing.md }}>
            <IconText icon="scroll" style={styles.label}>Пример из Корана</IconText>
            <TouchableOpacity onPress={() => speak(word.example)}>
              <Text style={styles.exampleAr}>{word.example}</Text>
            </TouchableOpacity>
          </Card>
        )}

        {sameRoot.length > 0 && (
          <Card style={{ marginBottom: spacing.md }}>
            <IconText icon="link" style={styles.label}>Однокоренные слова</IconText>
            {sameRoot.map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => navigation.replace('WordDetail', { wordId: w.id })}
                style={styles.relRow}
              >
                <Text style={styles.relAr}>{w.ar}</Text>
                <Text style={styles.relRu}>{w.ru}</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {learnedInfo ? (
          <Card style={{ marginBottom: spacing.md }}>
            <IconText icon="barChart" style={styles.label}>Прогресс</IconText>
            <Text style={styles.value}>Этап SRS: {learnedInfo.stage + 1}</Text>
            <Text style={styles.caption}>
              Следующее повторение: {new Date(learnedInfo.nextReview).toLocaleDateString('ru-RU')}
            </Text>
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
          <Button
            title="Не знаю"
            variant="outline"
            onPress={() => markWordLearned(word.id, false)}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <Button
            title="Знаю"
            onPress={() => {
              markWordLearned(word.id, true);
              navigation.goBack();
            }}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  arabic: { fontSize: 56, color: '#fff', marginVertical: spacing.md },
  translit: { ...typography.body, color: '#fff', fontStyle: 'italic', opacity: 0.85 },
  translation: { ...typography.h3, color: '#fff', marginBottom: spacing.md },
  listenBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#fff', borderRadius: 999,
    marginTop: 8, marginBottom: spacing.sm,
  },

  label: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  value: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  rootValue: { fontSize: 26, color: colors.primary, marginVertical: 4 },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: 4 },

  sentenceAr: {
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: spacing.sm,
    lineHeight: 44,
  },
  sentenceRu: { ...typography.body, color: colors.textPrimary, marginTop: spacing.sm },
  sentenceBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#fff', borderRadius: 999,
    marginTop: spacing.sm,
  },

  exampleAr: {
    ...typography.arabic,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: spacing.sm,
    lineHeight: 40,
  },

  relRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  relAr: { fontSize: 20, color: colors.primary },
  relRu: { ...typography.body, color: colors.textSecondary },
});
