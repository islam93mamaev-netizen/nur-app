import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { spacing, radii, typography } from '../../constants/theme';
import { adhkarSections } from '../../data/adhkar';
import { useTheme } from '../../store/themeStore';

export default function AdhkarScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Азкары</Text>
        <Text style={styles.subtitle}>Утренние, вечерние, после намаза и предсонные поминания — крепость мусульманина</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {adhkarSections.map((s) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdhkarSection', { sectionId: s.id })}
          >
            <Card style={{ marginBottom: spacing.md, backgroundColor: s.color + '12', borderLeftWidth: 4, borderLeftColor: s.color }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 38, marginRight: spacing.md }}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.secTitle, { color: s.color }]}>{s.title}</Text>
                  <Text style={styles.secSub}>{s.items.length} азкаров</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>💡 Как пользоваться</Text>
          <Text style={styles.bodyText}>
            На каждом азкаре есть счётчик. Нажимайте на круг — пока не выполните нужное число повторов.
            Утренние — после Фаджра до восхода. Вечерние — после Аср до заката. Перед сном — последние действия после Иша.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  secTitle: { ...typography.h3, fontWeight: '700' },
  secSub: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  bodyText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
});
