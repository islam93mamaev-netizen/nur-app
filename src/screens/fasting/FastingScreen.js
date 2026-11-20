import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import ReferenceText from '../../components/ReferenceText';
import { spacing, radii, typography } from '../../constants/theme';
import { fastingSections, getFastsBySection } from '../../data/fasting';
import { useTheme } from '../../store/themeStore';
import CategoryIcon from '../../components/CategoryIcon';
import IconText from '../../components/IconText';

// Сколько символов «why» показывать в свёрнутом виде
const COLLAPSE_THRESHOLD = 180;

export default function FastingScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [section, setSection] = useState('sunnah');
  const [expanded, setExpanded] = useState({});

  const fasts = getFastsBySection(section);
  const curSec = fastingSections.find((s) => s.id === section);
  const toggle = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <Screen padded={false}>
      <DetailHeader onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Пост</Text>
        <Text style={styles.subtitle}>Обязательные, по сунне и запрещённые дни</Text>
      </DetailHeader>

      {/* Переключатель разделов — как в Этике */}
      <View style={styles.tabsRow}>
        {fastingSections.map((s) => {
          const active = s.id === section;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSection(s.id)}
              style={[styles.tab, active && { backgroundColor: s.color }]}
            >
              <CategoryIcon icon={s.icon} textStyle={styles.tabIcon} />
              <Text style={[styles.tabTitle, active && { color: '#fff' }]} numberOfLines={1}>
                {s.title.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Text style={styles.intro}>{curSec?.description}</Text>

        {fasts.map((f) => {
          const isOpen = !!expanded[f.id];
          const needsCollapse = (f.why || '').length > COLLAPSE_THRESHOLD;
          const whyShort = needsCollapse && !isOpen
            ? f.why.slice(0, COLLAPSE_THRESHOLD).trim() + '…'
            : f.why;

          return (
            <Card
              key={f.id}
              style={[styles.fastCard, { borderLeftWidth: 4, borderLeftColor: curSec?.color }]}
            >
              <Text style={[styles.fastTitle, { color: curSec?.color }]}>{f.title}</Text>

              <View style={styles.whenBox}>
                <IconText icon="calendar" style={styles.whenLabel}>Когда</IconText>
                <Text style={styles.whenText}>{f.when}</Text>
              </View>

              <Text style={styles.sectionLabel}>Почему</Text>
              <Text style={styles.whyText}>{whyShort}</Text>
              {needsCollapse && (
                <TouchableOpacity onPress={() => toggle(f.id)} style={{ marginTop: 4 }}>
                  <Text style={[styles.expandText, { color: curSec?.color }]}>
                    {isOpen ? '↑ Свернуть' : '↓ Развернуть'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Доказательства из Корана и сунны */}
              {f.proofs?.length > 0 && (
                <View style={styles.proofsBlock}>
                  <IconText icon="book" style={styles.sectionLabel}>Доказательства</IconText>
                  {f.proofs.map((p, i) => (
                    <View key={i} style={styles.proofItem}>
                      <Text style={styles.proofText}>«{p.text}»</Text>
                      <ReferenceText text={p.ref} style={styles.proofRef} />
                    </View>
                  ))}
                </View>
              )}

              {!!f.note && (
                <View style={styles.noteBox}>
                  <IconText icon="bulb" style={styles.noteLabel}>Замечание</IconText>
                  <Text style={styles.noteText}>{f.note}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
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
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  tabIcon: { fontSize: 18, marginRight: 6 },
  tabTitle: { ...typography.small, color: colors.textPrimary, fontWeight: '700' },

  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },

  fastCard: { marginBottom: spacing.md, padding: spacing.md },
  fastTitle: { ...typography.h4, fontWeight: '700', marginBottom: spacing.sm },

  whenBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  whenLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', marginBottom: 2 },
  whenText: { ...typography.small, color: colors.textPrimary, lineHeight: 18 },

  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  whyText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  expandText: { ...typography.small, fontWeight: '700' },

  proofsBlock: { marginTop: spacing.sm },
  proofItem: {
    backgroundColor: colors.accent + '10',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  proofText: { ...typography.small, color: colors.textPrimary, lineHeight: 20, fontStyle: 'italic' },
  proofRef: { ...typography.caption, color: colors.primary, fontWeight: '700', marginTop: 4 },

  noteBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.info + '10',
    borderRadius: radii.sm,
  },
  noteLabel: { ...typography.caption, color: colors.info, fontWeight: '700', marginBottom: 2 },
  noteText: { ...typography.small, color: colors.textPrimary, lineHeight: 18 },
});
