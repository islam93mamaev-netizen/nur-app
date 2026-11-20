import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ReferenceText from '../../components/ReferenceText';
import { spacing, radii, typography } from '../../constants/theme';
import { asma, findAsma } from '../../data/asma';
import { speak, stop } from '../../services/ttsService';
import BookmarkButton from '../../components/BookmarkButton';
import { useTheme } from '../../store/themeStore';

export default function AsmaDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const item = findAsma(route.params.id);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => { stop(); }, []);

  if (!item) return null;

  const sayName = async () => {
    setSpeaking(true);
    await speak(item.ar, { rate: 0.5 });
    setSpeaking(false);
  };

  const idx = asma.findIndex((a) => a.id === item.id);
  const prev = idx > 0 ? asma[idx - 1] : null;
  const next = idx < asma.length - 1 ? asma[idx + 1] : null;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} backLabel="← К списку" pattern>
        <View style={styles.headerTop}>
          
          <BookmarkButton
            type="asma"
            refId={item.id}
            title={`${item.ar} — ${item.ru}`}
            subtitle={item.tr}
            route="AsmaDetail"
            params={{ id: item.id }}
            color="#fff"
          />
        </View>

        <Text style={styles.num}>№ {item.n} из 99</Text>
        <Text style={styles.bigAr}>{item.ar}</Text>
        <Text style={styles.tr}>{item.tr}</Text>
        <Text style={styles.ru}>{item.ru}</Text>

        <TouchableOpacity
          onPress={sayName}
          style={[styles.playBtn, speaking && styles.playBtnActive]}
        >
          <Text style={styles.playIcon}>🔊</Text>
          <Text style={styles.playText}>{speaking ? 'Произношу…' : 'Произнести имя'}</Text>
        </TouchableOpacity>
      </DetailHeader>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Text style={styles.sectionLabel}>Смысл</Text>
        <Card>
          <Text style={styles.meaning}>{item.meaning}</Text>
        </Card>

        {item.reference ? (
          <>
            <Text style={styles.sectionLabel}>Где упоминается</Text>
            <Card>
              <ReferenceText text={item.reference} style={styles.ref} />
            </Card>
          </>
        ) : null}

        <View style={styles.nav}>
          <View style={{ flex: 1, marginRight: 4 }}>
            {prev ? (
              <Button
                title={`← ${prev.n}. ${prev.ru}`}
                variant="ghost"
                onPress={() => navigation.replace('AsmaDetail', { id: prev.id })}
              />
            ) : null}
          </View>
          <View style={{ flex: 1, marginLeft: 4 }}>
            {next ? (
              <Button
                title={`${next.n}. ${next.ru} →`}
                variant="ghost"
                onPress={() => navigation.replace('AsmaDetail', { id: next.id })}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: spacing.md },
  num: { ...typography.caption, color: colors.accentLight, fontWeight: '700' },
  bigAr: { fontSize: 64, color: '#fff', marginVertical: spacing.md, lineHeight: 80 },
  tr: { ...typography.body, color: colors.accent, fontStyle: 'italic' },
  ru: { ...typography.h2, color: '#fff', marginTop: spacing.sm, textAlign: 'center' },

  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    marginTop: spacing.lg,
  },
  playBtnActive: { backgroundColor: colors.accentDark },
  playIcon: { fontSize: 20, marginRight: spacing.sm },
  playText: { ...typography.bodyMedium, color: colors.textOnAccent, fontWeight: '700' },

  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  meaning: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
  ref: { ...typography.body, color: colors.primary, fontStyle: 'italic' },

  nav: { flexDirection: 'row', marginTop: spacing.xl },
});
