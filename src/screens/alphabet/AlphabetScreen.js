import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { letters, letterGroups, hamza } from '../../data/alphabet';
import { harakat } from '../../data/harakat';
import { useTheme } from '../../store/themeStore';

export default function AlphabetScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [mode, setMode] = useState('letters'); // 'letters' | 'groups' | 'harakat'

  return (
    <Screen padded={false}>
      <DetailHeader onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Арабский алфавит</Text>
        <Text style={styles.subtitle}>
          28 букв • простой путь от первой буквы до чтения Корана
        </Text>
      </DetailHeader>

      <View style={styles.tabsRow}>
        {[
          { id: 'letters', label: 'Все буквы' },
          { id: 'groups', label: 'Уроки' },
          { id: 'harakat', label: 'Огласовки' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setMode(t.id)}
            style={[styles.tab, mode === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, mode === t.id && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'letters' && (
        <FlatList
          data={letters}
          numColumns={3}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Letter', { letterId: item.id })}
              style={styles.letterCard}
            >
              <Text style={styles.letterIdx}>{index + 1}</Text>
              <Text style={styles.letterChar}>{item.letter}</Text>
              <Text style={styles.letterName}>{item.name}</Text>
              <Text style={styles.letterTr}>{item.tr}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Letter', { letterId: 'hamza' })}
              style={[styles.letterCard, { backgroundColor: colors.accent + '15', width: '100%' }]}
            >
              <Text style={styles.letterIdx}>+</Text>
              <Text style={styles.letterChar}>{hamza.letter}</Text>
              <Text style={styles.letterName}>{hamza.name}</Text>
              <Text style={styles.letterTr}>не буква, но важный знак</Text>
            </TouchableOpacity>
          }
        />
      )}

      {mode === 'groups' && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          <Text style={styles.intro}>
            Простой путь освоения алфавита — учить буквы группами,
            а не по одной. Похожие формы запоминаются за один раз.
          </Text>
          {letterGroups.map((g, i) => (
            <Card key={g.id} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.groupTitle}>Урок {i + 1}: {g.title}</Text>
                <Pill label={`${g.letters.length} букв`} background={colors.primary + '15'} textColor={colors.primary} />
              </View>
              <Text style={styles.groupDesc}>{g.description}</Text>
              <View style={styles.groupRow}>
                {g.letters.map((id) => {
                  const l = letters.find((x) => x.id === id);
                  if (!l) return null;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => navigation.navigate('Letter', { letterId: id })}
                      style={styles.miniLetter}
                    >
                      <Text style={styles.miniChar}>{l.letter}</Text>
                      <Text style={styles.miniName}>{l.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {mode === 'harakat' && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          <Text style={styles.intro}>
            Огласовки (харакаты) — это маленькие знаки,
            показывающие, какая гласная произносится после согласной.
          </Text>
          {harakat.map((h) => (
            <Card key={h.id} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.harakatBox}>
                  <Text style={styles.harakatChar}>{h.onLetter}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.harakatName}>{h.name} ({h.nameAr})</Text>
                  <Text style={styles.harakatTr}>{h.tr} — {h.ru}</Text>
                  <Text style={styles.harakatDesc}>{h.desc}</Text>
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleAr}>{h.example.ar}</Text>
                    <Text style={styles.exampleTr}>{h.example.tr} — {h.example.ru}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  tabsRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radii.md },
  tabActive: { backgroundColor: colors.primary + '12' },
  tabText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.primary, fontWeight: '700' },

  letterCard: {
    flex: 1,
    margin: spacing.xs,
    minWidth: '30%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 130,
  },
  letterIdx: { ...typography.caption, color: colors.textMuted, alignSelf: 'flex-start' },
  letterChar: { fontSize: 46, color: colors.primary, marginVertical: 4 },
  letterName: { ...typography.bodyMedium, color: colors.textPrimary },
  letterTr: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  groupTitle: { ...typography.h4, color: colors.textPrimary, flex: 1 },
  groupDesc: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  miniLetter: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    minWidth: 64,
  },
  miniChar: { fontSize: 28, color: colors.primary },
  miniName: { ...typography.caption, color: colors.textSecondary },

  harakatBox: {
    width: 64, height: 64,
    backgroundColor: colors.primary + '10',
    borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
  },
  harakatChar: { fontSize: 36, color: colors.primary },
  harakatName: { ...typography.h4, color: colors.textPrimary },
  harakatTr: { ...typography.small, color: colors.primary, fontWeight: '600', marginTop: 2 },
  harakatDesc: { ...typography.small, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 18 },
  exampleBox: { marginTop: spacing.sm, padding: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radii.sm },
  exampleAr: { fontSize: 22, color: colors.textPrimary, textAlign: 'right' },
  exampleTr: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
});
