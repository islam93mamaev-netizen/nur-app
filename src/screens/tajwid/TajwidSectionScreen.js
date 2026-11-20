import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import ReferenceText from '../../components/ReferenceText';
import { spacing, typography } from '../../constants/theme';
import { findTajwidSection } from '../../data/tajwid';
import { useTheme } from '../../store/themeStore';
import CategoryIcon from '../../components/CategoryIcon';

export default function TajwidSectionScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const section = findTajwidSection(route.params.sectionId);
  if (!section) return null;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К таджвиду" background={section.color}>
        
        <CategoryIcon icon={section.icon} textStyle={styles.icon} />
        <Text style={styles.title}>{section.title}</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {section.rules.map((r, i) => (
          <Card key={i} style={{ marginBottom: spacing.md }}>
            <Text style={styles.ruleTitle}>{r.title}</Text>
            <Text style={styles.ruleDesc}>{r.desc}</Text>
            <View style={[styles.body, { borderLeftColor: section.color }]}>
              <ReferenceText text={r.body} style={styles.bodyText} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  icon: { fontSize: 56, color: '#fff', marginBottom: spacing.sm },
  title: { ...typography.h1, color: '#fff', textAlign: 'center' },

  ruleTitle: { ...typography.h4, color: colors.textPrimary },
  ruleDesc: { ...typography.body, color: colors.textPrimary, marginTop: spacing.sm, fontWeight: '500' },
  body: { marginTop: spacing.sm, paddingLeft: spacing.md, borderLeftWidth: 3 },
  bodyText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
});
