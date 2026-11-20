import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import CategoryIcon from '../../components/CategoryIcon';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import { spacing, typography, radii } from '../../constants/theme';
import { modules } from '../../data/modules';
import { useProgress } from '../../store/progressStore';
import { useTheme } from '../../store/themeStore';

export default function FoundationsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state } = useProgress();

  return (
    <Screen padded={false}>
      <View style={{ padding: spacing.lg }}>
        <Text style={styles.title}>Основы Ислама</Text>
        <Text style={styles.subtitle}>Поэтапное изучение веры и практики</Text>
      </View>

      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => {
          const completed = item.lessons.filter((l) => state.completedLessons[l.id]).length;
          const total = item.lessons.length;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Module', { moduleId: item.id })}
            >
              <Card style={{ marginBottom: spacing.md }}>
                <View style={styles.row}>
                  <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                    <CategoryIcon icon={item.icon} size={24} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleTitle}>{item.title}</Text>
                    <Text style={styles.moduleDesc} numberOfLines={2}>{item.description}</Text>
                  </View>
                </View>
                <View style={{ marginTop: spacing.md }}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressText}>{completed} / {total} уроков</Text>
                    <Text style={[styles.progressText, { color: item.color }]}>
                      {Math.round((completed / total) * 100)}%
                    </Text>
                  </View>
                  <ProgressBar value={completed} max={total} color={item.color} />
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
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  moduleTitle: { ...typography.h4, color: colors.textPrimary },
  moduleDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { ...typography.caption, color: colors.textSecondary },
});
