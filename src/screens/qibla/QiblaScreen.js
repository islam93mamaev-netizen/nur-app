import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../store/themeStore';
import { notify } from '../../utils/dialogs';

const KAABA = { lat: 21.4225, lon: 39.8262 };

// Вычисление азимута от точки A до Каабы
function calcQiblaBearing(lat, lon) {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lon - lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}


export default function QiblaScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [coords, setCoords] = useState(null);
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [heading, setHeading] = useState(0);
  const [supported, setSupported] = useState(true);
  const [city, setCity] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          notify('Разрешение', 'Без местоположения используется Мекка.');
          setCoords({ latitude: KAABA.lat, longitude: KAABA.lon });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        try {
          const r = await Location.reverseGeocodeAsync(loc.coords);
          if (r?.[0]) setCity([r[0].city, r[0].country].filter(Boolean).join(', '));
        } catch {/* ignore */}
      } catch {
        setCoords({ latitude: KAABA.lat, longitude: KAABA.lon });
      }
    })();
  }, []);

  useEffect(() => {
    if (!coords) return;
    setQiblaBearing(calcQiblaBearing(coords.latitude, coords.longitude));
  }, [coords]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setSupported(false);
      return;
    }
    // Используем системный compass через expo-location:
    // он сам учитывает калибровку, гироскоп и магнитное склонение.
    let sub;
    let cancelled = false;
    (async () => {
      try {
        // Heading требует разрешения геолокации (уже выдано выше)
        const watcher = await Location.watchHeadingAsync((data) => {
          // trueHeading — истинный север (учтено склонение). Если -1 — нет данных.
          // magHeading — магнитный север (fallback).
          const h =
            typeof data.trueHeading === 'number' && data.trueHeading >= 0
              ? data.trueHeading
              : data.magHeading;
          if (typeof h === 'number') setHeading(h);
        });
        if (cancelled) watcher?.remove?.();
        else sub = watcher;
      } catch {
        setSupported(false);
      }
    })();
    return () => {
      cancelled = true;
      if (sub) sub.remove();
    };
  }, []);

  const arrowRotation = qiblaBearing - heading;

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Кибла</Text>
        {city ? <Text style={styles.subtitle}>{city}</Text> : null}
      </DetailHeader>

      <View style={styles.body}>
        <Svg width={280} height={280} viewBox="0 0 280 280">
          {/* Циферблат компаса */}
          <Circle cx="140" cy="140" r="130" fill={colors.surfaceAlt} stroke={colors.border} strokeWidth="2" />

          {/* Метки направлений */}
          <G transform={`rotate(${-heading} 140 140)`}>
            <SvgText x="140" y="30" fontSize="18" fontWeight="bold" textAnchor="middle" fill={colors.danger}>С</SvgText>
            <SvgText x="140" y="262" fontSize="14" textAnchor="middle" fill={colors.textSecondary}>Ю</SvgText>
            <SvgText x="20" y="148" fontSize="14" textAnchor="middle" fill={colors.textSecondary}>З</SvgText>
            <SvgText x="260" y="148" fontSize="14" textAnchor="middle" fill={colors.textSecondary}>В</SvgText>
          </G>

          {/* Стрелка на киблу */}
          <G transform={`rotate(${arrowRotation} 140 140)`}>
            <Path
              d="M140,40 L155,140 L140,130 L125,140 Z"
              fill={colors.primary}
              stroke={colors.primaryDark}
              strokeWidth="2"
            />
            {/* Иконка Каабы на острие */}
            <Circle cx="140" cy="30" r="14" fill={colors.primary} />
            <SvgText x="140" y="36" fontSize="16" textAnchor="middle" fill="#fff">🕋</SvgText>
          </G>

          {/* Центр */}
          <Circle cx="140" cy="140" r="6" fill={colors.primary} />
        </Svg>

        <Card style={{ marginTop: spacing.xl, width: '100%' }}>
          <Text style={styles.infoLabel}>Направление на Каабу</Text>
          <Text style={styles.infoValue}>{Math.round(qiblaBearing)}°</Text>
          <Text style={styles.infoCaption}>
            от вашего положения на север (азимут)
          </Text>
        </Card>

        {!supported && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.warning + '15' }}>
            <Text style={{ color: colors.warning, ...typography.small }}>
              ⚠️ Магнитометр недоступен в этом окружении (например, в браузере или эмуляторе).
              На реальном устройстве стрелка будет крутиться вместе с поворотом телефона.
            </Text>
          </Card>
        )}

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.info + '10' }}>
          <Text style={[styles.infoLabel, { color: colors.info }]}>💡 Как пользоваться</Text>
          <Text style={styles.tip}>
            Положите телефон горизонтально. Поворачивайте его так, чтобы стрелка с 🕋 указывала вверх — это и есть направление на Каабу. Удалите от электроники для точности.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },
  body: { padding: spacing.lg, alignItems: 'center' },
  infoLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  infoValue: { fontSize: 48, fontWeight: '700', color: colors.primary, marginTop: 4 },
  infoCaption: { ...typography.small, color: colors.textMuted },
  tip: { ...typography.small, color: colors.textPrimary, lineHeight: 20, marginTop: 4 },
});
