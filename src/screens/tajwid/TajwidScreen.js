import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import SectionTestsBlock from '../../components/SectionTestsBlock';
import { spacing, radii, typography } from '../../constants/theme';
import { tajwidSections } from '../../data/tajwid';
import { useTheme } from '../../store/themeStore';

export default function TajwidScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Таджвид</Text>
        <Text style={styles.subtitle}>Правила правильного чтения Корана</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {tajwidSections.map((s) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TajwidSection', { sectionId: s.id })}
          >
            <Card style={{ marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: s.color }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconBox, { backgroundColor: s.color + '15' }]}>
                  <Text style={[styles.iconText, { color: s.color }]}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.secTitle}>{s.title}</Text>
                  <Text style={styles.secSub}>{s.rules.length} правил</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>💡 Главный совет</Text>
          <Text style={styles.body}>
            Таджвид нельзя выучить только по книге — нужен учитель. Слушайте признанных чтецов и подражайте им,
            это первый шаг. Для серьёзного освоения найдите шейха в местной мечети или на онлайн-курсах.
          </Text>
        </Card>

        <SectionTestsBlock
          examIds={['tajwid_beginner', 'tajwid_intermediate', 'tajwid_advanced']}
          navigation={navigation}
        />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  iconBox: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  iconText: { fontSize: 24, fontWeight: '700' },
  secTitle: { ...typography.h4, color: colors.textPrimary },
  secSub: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  body: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
});
