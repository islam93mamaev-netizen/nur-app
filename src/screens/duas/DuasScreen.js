import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { duaCategories, getDuasByCategory, duas } from '../../data/duas';
import { useTheme } from '../../store/themeStore';

export default function DuasScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Дуа на каждый день</Text>
        <Text style={styles.subtitle}>
          {duas.length} дуа из «Хисн аль-Муслим» и достоверных сборников
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {duaCategories.map((cat) => {
          const list = getDuasByCategory(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DuaCategory', { categoryId: cat.id })}
            >
              <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: cat.color }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.iconBox, { backgroundColor: cat.color + '15' }]}>
                    <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catTitle}>{cat.title}</Text>
                    <Text style={styles.catCount}>{list.length} дуа</Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },
  card: { marginBottom: spacing.md },
  iconBox: { width: 56, height: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  catTitle: { ...typography.h4, color: colors.textPrimary },
  catCount: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
});
