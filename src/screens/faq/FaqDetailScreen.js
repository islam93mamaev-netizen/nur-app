import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, typography } from '../../constants/theme';
import { findFaq, faqCategories } from '../../data/faq';
import ReferenceText from '../../components/ReferenceText';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';
import IconText from '../../components/IconText';

export default function FaqDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const faq = findFaq(route.params.faqId);
  if (!faq) return null;
  const cat = faqCategories.find((c) => c.id === faq.category);

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} background={cat?.color || colors.primary}>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="faq"
            refId={faq.id}
            title={faq.question}
            subtitle={cat?.title}
            route="FaqDetail"
            params={{ faqId: faq.id }}
            color="#fff"
          />
        </View>
        <Pill label={`${cat?.icon || ''} ${cat?.title || 'Общее'}`} background="#fff" textColor={cat?.color || colors.primary} />
        <Text style={styles.question}>{faq.question}</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.accent + '12' }}>
          <Text style={styles.shortLabel}>Кратко</Text>
          <Text style={styles.shortText}>{faq.short}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Полный ответ</Text>
        <Card>
          <ReferenceText text={faq.answer} style={styles.answer} />
        </Card>

        {faq.relatedHadith && (
          <>
            <Text style={styles.sectionTitle}>Источник / хадис</Text>
            <Card>
              <ReferenceText text={faq.relatedHadith} style={styles.hadith} />
            </Card>
          </>
        )}

        {faq.mazhabNote && (
          <>
            <Text style={styles.sectionTitle}>Различия мазхабов</Text>
            <Card style={{ backgroundColor: colors.info + '12' }}>
              <Text style={styles.mazhab}>{faq.mazhabNote}</Text>
            </Card>
          </>
        )}

        <Card style={{ marginTop: spacing.xl, backgroundColor: colors.warning + '12' }}>
          <IconText icon="alert" style={[styles.shortLabel, { color: colors.warning }]}>Важно</IconText>
          <Text style={styles.disclaimer}>
            Это учебная справка. По вашей конкретной ситуации лучше обратиться к знающему имаму или учёному. В вопросах, где есть разногласие мазхабов, у каждого мнения есть свои основания.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  question: { ...typography.h2, color: '#fff', marginTop: spacing.md, lineHeight: 30 },

  shortLabel: { ...typography.caption, color: colors.accentDark, fontWeight: '700', marginBottom: 4 },
  shortText: { ...typography.body, color: colors.textPrimary, lineHeight: 22, fontWeight: '500' },

  sectionTitle: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  answer: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },

  hadith: { ...typography.body, color: colors.primary, fontStyle: 'italic', lineHeight: 22 },
  mazhab: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  disclaimer: { ...typography.small, color: colors.textPrimary, lineHeight: 20 },
});
