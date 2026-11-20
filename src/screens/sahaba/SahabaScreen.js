import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import SectionTestsBlock from '../../components/SectionTestsBlock';
import { spacing, typography } from '../../constants/theme';
import { sahaba, sahabaGroups, getSahabaByGroup } from '../../data/sahaba';
import { useTheme } from '../../store/themeStore';

export default function SahabaScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Сподвижники пророка ﷺ</Text>
        <Text style={styles.subtitle}>Биографии {sahaba.length} ключевых сахабов</Text>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {sahabaGroups.map((g) => {
          const items = getSahabaByGroup(g.id);
          if (items.length === 0) return null;
          return (
            <View key={g.id} style={{ marginBottom: spacing.lg }}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupIcon}>{g.icon}</Text>
                <Text style={[styles.groupTitle, { color: g.color }]}>{g.title}</Text>
              </View>
              {items.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('SahabaDetail', { id: p.id })}
                >
                  <Card style={{ marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: g.color }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nameAr}>{p.nameAr}</Text>
                        <Text style={styles.name}>{p.name}</Text>
                        <Pill label={p.period} background={g.color + '15'} textColor={g.color} />
                      </View>
                      <Text style={styles.chev}>›</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        <SectionTestsBlock
          examIds={['sahaba_beginner', 'sahaba_intermediate', 'sahaba_advanced']}
          navigation={navigation}
        />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  groupIcon: { fontSize: 24, marginRight: spacing.sm },
  groupTitle: { ...typography.h3, fontWeight: '700' },

  nameAr: { fontSize: 22, color: colors.primary, textAlign: 'right' },
  name: { ...typography.h4, color: colors.textPrimary, marginTop: 2 },
  chev: { fontSize: 26, color: colors.textMuted, marginLeft: spacing.sm },
});
