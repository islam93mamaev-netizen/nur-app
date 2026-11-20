import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import CategoryIcon from '../../components/CategoryIcon';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import { spacing, typography } from '../../constants/theme';
import { adhkarSections } from '../../data/adhkar';
import { useTheme } from '../../store/themeStore';

export default function AdhkarScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen padded={false}>
      <DetailHeader
        onBack={() => navigation.goBack()}
        title="Азкары"
        subtitle="Утренние, вечерние, после намаза и предсонные поминания — крепость мусульманина"
        pattern
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {adhkarSections.map((s) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdhkarSection', { sectionId: s.id })}
          >
            <Card style={{ marginBottom: spacing.md, backgroundColor: s.color + '12', borderLeftWidth: 4, borderLeftColor: s.color }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CategoryIcon icon={s.icon} size={32} color={s.color} style={{ marginRight: spacing.md }} />
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

  secTitle: { ...typography.h3, fontWeight: '700' },
  secSub: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  bodyText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
});
