import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Screen from '../../components/Screen';
import CategoryIcon from '../../components/CategoryIcon';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { faqCategories, faqs, getFaqsByCategory, searchFaqs } from '../../data/faq';
import { useTheme } from '../../store/themeStore';

export default function FaqScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const list = useMemo(() => {
    if (search) return searchFaqs(search);
    if (activeCategory === 'all') return faqs;
    return getFaqsByCategory(activeCategory);
  }, [search, activeCategory]);

  const renderFaqItem = useCallback(
    ({ item }) => (
      <FaqItem
        item={item}
        cat={faqCategories.find((c) => c.id === item.category)}
        colors={colors}
        styles={styles}
        onPress={() => navigation.navigate('FaqDetail', { faqId: item.id })}
      />
    ),
    [colors, styles, navigation]
  );

  return (
    <Screen padded={false}>
      <DetailHeader
        onBack={() => navigation.goBack()}
        title="Часто задаваемые вопросы"
        subtitle={`${faqs.length} ответов по фикху • с указанием источников`}
        pattern
      />

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск по вопросам…"
          placeholderTextColor={colors.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!search && (
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => setActiveCategory('all')}
              style={[styles.tab, activeCategory === 'all' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeCategory === 'all' && styles.tabTextActive]}>
                Все
              </Text>
            </TouchableOpacity>
            {faqCategories.map((c) => {
              const active = c.id === activeCategory;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setActiveCategory(c.id)}
                  style={[styles.tab, active && [styles.tabActive, { backgroundColor: c.color }]]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CategoryIcon icon={c.icon} size={14} color={active ? '#fff' : colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{c.title}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderFaqItem}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        initialNumToRender={10}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
            <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🔍</Text>
            <Text style={{ ...typography.body, color: colors.textSecondary }}>
              Ничего не нашлось по запросу
            </Text>
          </View>
        }
        ListFooterComponent={
          !search ? (
            <Card style={{ marginTop: spacing.lg, backgroundColor: colors.warning + '15' }}>
              <Text style={[styles.tipTitle, { color: colors.warning }]}>⚠️ Важно</Text>
              <Text style={styles.tipText}>
                Эти ответы — учебная справка, основанная на классических трудах учёных. По вопросам, касающимся вашей жизненной ситуации (особенно в сложных случаях), всегда обращайтесь к знающему имаму или учёному вашей местности. В вопросах, где есть разногласие мазхабов, оно указано явно.
              </Text>
            </Card>
          ) : null
        }
      />
    </Screen>
  );
}

// Мемоизированная карточка вопроса — не перерисовывается при скролле,
// если её данные не менялись.
const FaqItem = React.memo(function FaqItem({ item, cat, colors, styles, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card style={{ marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: cat?.color || colors.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <CategoryIcon icon={cat?.icon || '❓'} size={24} color={cat?.color || colors.primary} style={{ marginRight: spacing.md, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemQuestion}>{item.question}</Text>
            <Text style={styles.itemShort} numberOfLines={2}>{item.short}</Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
              <Pill
                label={cat?.title || 'Общее'}
                background={(cat?.color || colors.primary) + '15'}
                textColor={cat?.color || colors.primary}
              />
            </View>
          </View>
          <Text style={styles.chev}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
});

const makeStyles = (colors) => StyleSheet.create({

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.lg,
    marginBottom: 0,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 18, marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  },
  clearBtn: { padding: spacing.sm },

  tabsContainer: { height: 56, marginTop: spacing.md },
  tabsRow: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
    marginRight: 8,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.textOnPrimary },

  itemQuestion: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  itemShort: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm, alignSelf: 'center' },

  tipTitle: { ...typography.h4, marginBottom: spacing.sm },
  tipText: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },
});
