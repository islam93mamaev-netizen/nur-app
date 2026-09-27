// Глобальный поиск по всему контенту приложения:
// уроки, хадисы, дуа, слова, FAQ, 99 имён, азкары.
// Индекс строится один раз (useMemo) из статических data-файлов.

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Icon from '../../components/Icon';
import { spacing, radii, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';

import { modules } from '../../data/modules';
import { hadiths } from '../../data/hadiths';
import { duas, duaCategories } from '../../data/duas';
import { faqs } from '../../data/faq';
import { asma } from '../../data/asma';
import { words } from '../../data/words';
import { adhkarSections } from '../../data/adhkar';
import { arbainHadiths } from '../../data/arbain';

const MAX_RESULTS = 50;

// Типы результатов: подпись и цвет пилла
const TYPE_META = {
  lesson: { label: 'Урок',        color: '#1E7B5F' },
  hadith: { label: 'Хадис',       color: '#C9A55B' },
  dua:    { label: 'Дуа',         color: '#2E7D5B' },
  word:   { label: 'Слово',       color: '#3D6E94' },
  faq:    { label: 'Вопрос',      color: '#8C8C8C' },
  asma:   { label: 'Имя Аллаха',  color: '#A68641' },
  adhkar: { label: 'Азкар',       color: '#B23A48' },
  arbain: { label: '40 хадисов',  color: '#1E7B5F' },
};

// Строим единый поисковый индекс приложения.
function buildIndex() {
  const idx = [];

  for (const m of modules) {
    for (const l of m.lessons) {
      idx.push({
        type: 'lesson',
        title: l.title,
        subtitle: m.title,
        route: 'Lesson',
        params: { lessonId: l.id },
        hay: `${l.title} ${l.summary || ''} ${m.title}`.toLowerCase(),
      });
    }
  }

  for (const h of hadiths) {
    idx.push({
      type: 'hadith',
      title: h.title,
      subtitle: h.source,
      route: 'HadithDetail',
      params: { hadithId: h.id },
      hay: `${h.title} ${h.text || ''} ${h.theme || ''} ${h.narrator || ''}`.toLowerCase(),
    });
  }

  for (const d of duas) {
    const cat = duaCategories.find((c) => c.id === d.category);
    idx.push({
      type: 'dua',
      title: d.title,
      subtitle: cat?.title || 'Дуа',
      route: 'DuaCategory',
      params: { categoryId: d.category },
      hay: `${d.title} ${d.ru || ''} ${d.tr || ''} ${d.ctx || ''}`.toLowerCase(),
    });
  }

  for (const w of words) {
    idx.push({
      type: 'word',
      title: `${w.ar} — ${w.ru}`,
      subtitle: w.tr || '',
      route: 'WordDetail',
      params: { wordId: w.id },
      hay: `${w.ar} ${w.ru || ''} ${w.tr || ''} ${w.root || ''}`.toLowerCase(),
    });
  }

  for (const f of faqs) {
    idx.push({
      type: 'faq',
      title: f.question,
      subtitle: 'Вопрос-ответ',
      route: 'FaqDetail',
      params: { faqId: f.id },
      hay: `${f.question} ${f.answer || ''}`.toLowerCase(),
    });
  }

  for (const a of asma) {
    idx.push({
      type: 'asma',
      title: `${a.n}. ${a.ar} — ${a.ru}`,
      subtitle: a.tr || '',
      route: 'AsmaDetail',
      params: { id: a.id },
      hay: `${a.ar} ${a.tr || ''} ${a.ru || ''} ${a.meaning || ''}`.toLowerCase(),
    });
  }

  for (const h of arbainHadiths) {
    idx.push({
      type: 'arbain',
      title: `${h.n}. ${h.title}`,
      subtitle: h.source,
      route: 'ArbainDetail',
      params: { n: h.n },
      hay: `${h.title} ${h.ru || ''} ${h.comment || ''} ${(h.themes || []).join(' ')} ${h.narrator || ''}`.toLowerCase(),
    });
  }

  for (const s of adhkarSections) {
    for (const it of s.items) {
      idx.push({
        type: 'adhkar',
        title: it.title,
        subtitle: `Азкары: ${s.title.toLowerCase()}`,
        route: 'AdhkarSection',
        params: { sectionId: s.id },
        hay: `${it.title} ${it.tr || ''} ${it.ru || ''}`.toLowerCase(),
      });
    }
  }

  return idx;
}

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const index = useMemo(buildIndex, []);
  const [query, setQuery] = useState('');
  // Дебаунс: фильтруем не на каждый символ, а через 200 мс паузы ввода
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const q = debouncedQuery.trim().toLowerCase();
  const results = useMemo(() => {
    if (q.length < 2) return [];
    // Каждое слово запроса должно встретиться в haystack
    const terms = q.split(/\s+/).filter(Boolean);
    const out = [];
    for (const item of index) {
      if (terms.every((t) => item.hay.includes(t))) {
        out.push(item);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }, [q, index]);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.inputRow}>
          <Icon name="search" size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
          <TextInput
            style={styles.input}
            placeholder="Хадисы, дуа, слова, вопросы…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, i) => `${item.type}-${i}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {q.length < 2
              ? 'Введите минимум 2 символа.\nИщет по урокам, хадисам, дуа, словам, FAQ, 99 именам и азкарам.'
              : 'Ничего не найдено. Попробуйте другое слово.'}
          </Text>
        }
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <Card
              style={{ marginBottom: spacing.sm }}
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate(item.route, item.params);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text style={styles.resTitle} numberOfLines={2}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={styles.resSub} numberOfLines={1}>{item.subtitle}</Text>
                  ) : null}
                </View>
                <Pill label={meta.label} background={meta.color + '18'} textColor={meta.color} />
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { ...typography.bodyMedium, color: colors.primary, marginBottom: spacing.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  clear: { ...typography.bodyMedium, color: colors.textMuted, paddingLeft: spacing.sm },
  empty: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 20,
  },
  resTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  resSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
