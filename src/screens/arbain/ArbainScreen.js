import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { arbainHadiths } from '../../data/arbain';
import { useTheme } from '../../store/themeStore';

export default function ArbainScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen padded={false}>
      <DetailHeader onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>40 хадисов ан-Навави</Text>
        <Text style={styles.subtitle}>Учебный фундамент: 42 хадиса с переводом и комментариями Ибн Раджаба</Text>
      </DetailHeader>

      <FlatList
        data={arbainHadiths}
        keyExtractor={(item) => String(item.n)}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ArbainDetail', { n: item.n })}
          >
            <Card style={{ marginBottom: spacing.md }}>
              <View style={styles.row}>
                <View style={styles.numBox}>
                  <Text style={styles.numText}>{item.n}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.themesRow}>
                    {(item.themes || []).slice(0, 3).map((t, i) => (
                      <Pill key={i} label={t} background={colors.primary + '15'} textColor={colors.primary} />
                    ))}
                  </View>
                  <Text style={styles.src}>{item.source}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  row: { flexDirection: 'row', alignItems: 'center' },
  numBox: {
    width: 48, height: 48, borderRadius: radii.md,
    backgroundColor: colors.accent + '20',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  numText: { ...typography.h3, color: colors.accentDark, fontWeight: '700' },
  hTitle: { ...typography.h4, color: colors.textPrimary },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4 },
  src: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  chev: { fontSize: 26, color: colors.textMuted, marginLeft: spacing.sm },
});
