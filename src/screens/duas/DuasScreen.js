import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import CategoryIcon from '../../components/CategoryIcon';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import { spacing, radii, typography } from '../../constants/theme';
import { duaCategories, getDuasByCategory, duas } from '../../data/duas';
import { useTheme } from '../../store/themeStore';

export default function DuasScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Screen padded={false}>
      <DetailHeader
        onBack={() => navigation.goBack()}
        title="Дуа на каждый день"
        subtitle={`${duas.length} дуа из «Хисн аль-Муслим» и достоверных сборников`}
        pattern
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {duaCategories.map((cat) => {
          const list = getDuasByCategory(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DuaCategory', { categoryId: cat.id })}
            >
              <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: cat.color }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.iconBox, { backgroundColor: cat.color + '15' }]}>
                    <CategoryIcon icon={cat.icon} size={26} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catTitle}>{cat.title}</Text>
                    <Text style={styles.catCount}>{list.length} дуа</Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  card: { marginBottom: spacing.md },
  iconBox: { width: 56, height: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  catTitle: { ...typography.h4, color: colors.textPrimary },
  catCount: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  chev: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
});
