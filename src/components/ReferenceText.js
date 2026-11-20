// Компонент текста с автоматическим распознаванием и кликабельными ссылками
// на источники (Коран / хадисы).

import React, { useState, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { typography } from '../constants/theme';
import { parseReferences } from '../utils/parseReferences';
import ReferenceModal from './ReferenceModal';
import { useTheme } from '../store/themeStore';

export default function ReferenceText({ text, style, linkStyle }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [openRef, setOpenRef] = useState(null);
  if (!text) return null;
  const segments = parseReferences(text);

  return (
    <>
      <Text style={[styles.text, style]}>
        {segments.map((seg, i) => {
          if (seg.type === 'text') {
            return <Text key={i}>{seg.text}</Text>;
          }
          const isHadith = seg.type === 'hadith';
          return (
            <Text
              key={i}
              onPress={() => setOpenRef(seg)}
              style={[
                styles.link,
                isHadith && styles.linkHadith,
                linkStyle,
              ]}
            >
              {seg.text}{isHadith ? ' 🔗' : ' 📖'}
            </Text>
          );
        })}
      </Text>

      <ReferenceModal
        visible={!!openRef}
        reference={openRef}
        onClose={() => setOpenRef(null)}
      />
    </>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  text: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  linkHadith: {
    color: colors.accentDark,
  },
});
