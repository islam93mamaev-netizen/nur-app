import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import { spacing, radii, typography } from '../../constants/theme';
import { asma } from '../../data/asma';
import { useTheme } from '../../store/themeStore';
import CategoryIcon from '../../components/CategoryIcon';

export default function AsmaScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    if (!query) return asma;
    const q = query.toLowerCase().trim();
    return asma.filter((a) =>
      a.tr.toLowerCase().includes(q) ||
      a.ru.toLowerCase().includes(q) ||
      a.ar.includes(q) ||
      String(a.n) === q
    );
  }, [query]);

  return (
    <Screen padded={false}>
      <DetailHeader onBack={() => navigation.goBack()} align="center" pattern>
        <Text style={styles.bismi}>الأَسْمَاءُ الْحُسْنَى</Text>
        <Text style={styles.title}>99 имён Аллаха</Text>
        <Text style={styles.subtitle}>
          «У Аллаха 99 имён — кто их перечислит, войдёт в Рай» (Бухари, Муслим)
        </Text>
      </DetailHeader>

      <View style={styles.searchBox}>
        <CategoryIcon icon="🔍" textStyle={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск (имя, перевод, номер)…"
          placeholderTextColor={colors.textMuted}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={{ color: colors.textMuted, fontSize: 20, paddingHorizontal: 8 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={list}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AsmaDetail', { id: item.id })}
            style={styles.card}
          >
            <Text style={styles.cardNum}>{item.n}</Text>
            <Text style={styles.cardAr} numberOfLines={1} adjustsFontSizeToFit>{item.ar}</Text>
            <Text style={styles.cardTr} numberOfLines={1}>{item.tr}</Text>
            <Text style={styles.cardRu} numberOfLines={2}>{item.ru}</Text>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bismi: { fontSize: 24, color: colors.accentLight, marginTop: spacing.md },
  title: { ...typography.h1, color: '#fff', marginTop: 4 },
  subtitle: {
    ...typography.small,
    color: '#fff',
    opacity: 0.85,
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
  },

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
  searchInput: { flex: 1, ...typography.body, paddingVertical: spacing.md, color: colors.textPrimary },

  card: {
    flex: 1,
    margin: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 130,
  },
  cardNum: {
    ...typography.caption,
    color: colors.textMuted,
    alignSelf: 'flex-start',
    fontWeight: '700',
  },
  cardAr: { fontSize: 28, color: colors.primary, marginVertical: 4 },
  cardTr: { ...typography.small, color: colors.accentDark, fontStyle: 'italic' },
  cardRu: { ...typography.small, color: colors.textPrimary, marginTop: 4, textAlign: 'center' },
});
