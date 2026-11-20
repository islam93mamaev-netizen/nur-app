// Модальное окно выбора города (для ручного местоположения намазов).
// Поиск по названию города или страны, список сгруппирован по странам.

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, SectionList, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import { spacing, radii, typography } from '../constants/theme';
import { useTheme } from '../store/themeStore';
import { citiesByCountry } from '../data/cities';

export default function CityPickerModal({ visible, selectedId, onSelect, onClose }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const sections = useMemo(() => citiesByCountry(query), [query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Выберите город</Text>
            <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>Закрыть</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Icon name="search" size={16} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Город или страна…"
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
            />
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            renderSectionHeader={({ section }) => (
              <Text style={styles.country}>{section.title}</Text>
            )}
            renderItem={({ item }) => {
              const active = item.id === selectedId;
              return (
                <TouchableOpacity
                  onPress={() => { setQuery(''); onSelect(item); }}
                  style={[styles.cityRow, active && styles.cityRowActive]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cityName, active && { color: colors.primary, fontWeight: '700' }]}>
                    {item.name}
                  </Text>
                  {active && <Icon name="check" size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                Города нет в списке. Выберите ближайший крупный город в том же часовом поясе.
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    height: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.textPrimary },
  closeText: { ...typography.bodyMedium, color: colors.primary },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: 10 },
  country: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  cityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  cityRowActive: { backgroundColor: colors.primary + '12' },
  cityName: { ...typography.body, color: colors.textPrimary },
  empty: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, lineHeight: 20 },
});
