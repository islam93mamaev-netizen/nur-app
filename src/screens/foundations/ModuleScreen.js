import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { spacing, radii, typography } from '../../constants/theme';
import { findModule } from '../../data/modules';
import { useProgress } from '../../store/progressStore';
import { useTheme } from '../../store/themeStore';

export default function ModuleScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const module = findModule(route.params.moduleId);
  const { state } = useProgress();

  if (!module) return null;

  return (
    <Screen padded={false}>
      <View style={[styles.header, { backgroundColor: module.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.icon}>{module.icon}</Text>
        <Text style={styles.title}>{module.title}</Text>
        <Text style={styles.desc}>{module.description}</Text>
      </View>

      <FlatList
        data={module.lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={({ item, index }) => {
          const done = !!state.completedLessons[item.id];
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Lesson', { lessonId: item.id })}
            >
              <Card style={{ marginBottom: spacing.md }}>
                <View style={styles.row}>
                  <View style={[styles.number, { backgroundColor: done ? module.color : colors.surfaceAlt }]}>
                    <Text style={[styles.numberText, { color: done ? colors.textOnPrimary : colors.textMuted }]}>
                      {done ? '✓' : index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonTitle}>{item.title}</Text>
                    <Text style={styles.lessonSummary} numberOfLines={2}>{item.summary}</Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  back: { marginBottom: spacing.md },
  backText: { ...typography.bodyMedium, color: '#fff' },
  icon: { fontSize: 36, marginBottom: spacing.sm },
  title: { ...typography.h1, color: '#fff', marginBottom: 4 },
  desc: { ...typography.body, color: '#fff', opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center' },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  numberText: { ...typography.bodyMedium, fontWeight: '700' },
  lessonTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 2 },
  lessonSummary: { ...typography.small, color: colors.textSecondary },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
});
