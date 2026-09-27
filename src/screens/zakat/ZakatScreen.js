// Калькулятор закята.
// Принцип: с активов, удерживаемых ≥ 1 лунного года и превышающих нисаб,
// взимается 2,5%.
// Нисаб: эквивалент 85 г золота (или 595 г серебра — более низкий порог,
// большинство современных учёных рекомендуют брать тот, что ниже, для пользы бедных).

import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { fetchMetalPrices, clearMetalPriceCache } from '../../services/goldPriceService';
import { useTheme } from '../../store/themeStore';

// Список валют — самые распространённые в мусульманских странах + основные мировые.
const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'Доллар США' },
  { code: 'EUR', symbol: '€',   name: 'Евро' },
  { code: 'RUB', symbol: '₽',   name: 'Российский рубль' },
  { code: 'AED', symbol: 'د.إ', name: 'Дирхам ОАЭ' },
  { code: 'SAR', symbol: '﷼',   name: 'Саудовский риял' },
  { code: 'TRY', symbol: '₺',   name: 'Турецкая лира' },
  { code: 'KZT', symbol: '₸',   name: 'Казахстанский тенге' },
  { code: 'AZN', symbol: '₼',   name: 'Азербайджанский манат' },
  { code: 'UZS', symbol: 'soʼm', name: 'Узбекский сум' },
  { code: 'MYR', symbol: 'RM',  name: 'Малайзийский ринггит' },
  { code: 'IDR', symbol: 'Rp',  name: 'Индонезийская рупия' },
  { code: 'PKR', symbol: '₨',   name: 'Пакистанская рупия' },
  { code: 'EGP', symbol: 'E£',  name: 'Египетский фунт' },
  { code: 'GBP', symbol: '£',   name: 'Британский фунт' },
];

// Ориентировочные дефолты по валютам (на случай отсутствия интернета) — за 1 г, актуальность 2024-2026.
const FALLBACK_PRICES = {
  USD: { gold: 88,    silver: 1.05 },
  EUR: { gold: 81,    silver: 0.97 },
  RUB: { gold: 8500,  silver: 95   },
  AED: { gold: 323,   silver: 3.85 },
  SAR: { gold: 330,   silver: 3.95 },
  TRY: { gold: 3000,  silver: 36   },
  KZT: { gold: 44000, silver: 525  },
  AZN: { gold: 150,   silver: 1.8  },
  UZS: { gold: 1100000, silver: 13000 },
  MYR: { gold: 410,   silver: 4.9  },
  IDR: { gold: 1400000, silver: 16700 },
  PKR: { gold: 24500, silver: 295  },
  EGP: { gold: 4300,  silver: 51   },
  GBP: { gold: 69,    silver: 0.83 },
};

const DEFAULTS = {
  goldNisabGrams: 85,
  silverNisabGrams: 595,
};

function parseNum(s) {
  const n = parseFloat(String(s).replace(/[\s,]/g, '.').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function formatMoney(n, currency) {
  const cur = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n));
  return `${formatted} ${cur.symbol}`;
}

export default function ZakatScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [currency, setCurrency] = useState('RUB');
  const fallback = FALLBACK_PRICES[currency] || FALLBACK_PRICES.USD;

  // Цены за грамм — могут быть загружены онлайн или введены вручную
  const [goldPrice, setGoldPrice] = useState(String(fallback.gold));
  const [silverPrice, setSilverPrice] = useState(String(fallback.silver));

  // Статус онлайн-загрузки
  const [fetching, setFetching] = useState(false);
  const [lastFetchInfo, setLastFetchInfo] = useState(null); // { ok: bool, ts, message }

  // Активы
  const [cash, setCash] = useState('');
  const [bank, setBank] = useState('');
  const [gold, setGold] = useState('');       // граммы
  const [silver, setSilver] = useState('');   // граммы
  const [businessStock, setBusinessStock] = useState('');
  const [investments, setInvestments] = useState('');
  const [receivables, setReceivables] = useState('');
  const [payables, setPayables] = useState('');

  // При смене валюты — подменим дефолты, если пользователь их не правил
  useEffect(() => {
    const f = FALLBACK_PRICES[currency] || FALLBACK_PRICES.USD;
    setGoldPrice(String(f.gold));
    setSilverPrice(String(f.silver));
    setLastFetchInfo(null);
  }, [currency]);

  const fetchOnline = async () => {
    setFetching(true);
    setLastFetchInfo(null);
    clearMetalPriceCache();
    try {
      const prices = await fetchMetalPrices(currency);
      if (prices) {
        setGoldPrice(prices.gold.toFixed(2));
        if (prices.silver) setSilverPrice(prices.silver.toFixed(3));
        setLastFetchInfo({
          ok: true,
          ts: new Date(prices.ts),
          message: 'Обновлено по биржевой цене',
        });
      } else {
        setLastFetchInfo({
          ok: false,
          message: 'Не удалось получить онлайн-курс. Введите вручную.',
        });
      }
    } finally {
      setFetching(false);
    }
  };

  // Расчёт
  const goldValue = parseNum(gold) * parseNum(goldPrice);
  const silverValue = parseNum(silver) * parseNum(silverPrice);
  const totalAssets =
    parseNum(cash) + parseNum(bank) + goldValue + silverValue +
    parseNum(businessStock) + parseNum(investments) + parseNum(receivables);
  const debt = parseNum(payables);
  const taxBase = Math.max(0, totalAssets - debt);

  const goldNisab = DEFAULTS.goldNisabGrams * parseNum(goldPrice);
  const silverNisab = DEFAULTS.silverNisabGrams * parseNum(silverPrice);
  const nisab = Math.min(goldNisab, silverNisab);

  const aboveNisab = taxBase >= nisab && nisab > 0;
  const zakat = aboveNisab ? taxBase * 0.025 : 0;

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Калькулятор закята</Text>
        <Text style={styles.subtitle}>2,5% с активов, удерживаемых ≥ 1 лунного года</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {/* Выбор валюты */}
        <Card>
          <Text style={styles.sectionLabel}>Валюта расчёта</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {CURRENCIES.map((c) => {
              const active = c.code === currency;
              return (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => setCurrency(c.code)}
                  style={[styles.curChip, active && styles.curChipActive]}
                >
                  <Text style={[styles.curCode, active && styles.curCodeActive]}>{c.code}</Text>
                  <Text style={[styles.curName, active && styles.curNameActive]}>{c.symbol}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* Цены золота и серебра */}
        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.priceHeader}>
            <Text style={styles.sectionLabel}>Цена за 1 г ({currency})</Text>
            <TouchableOpacity onPress={fetchOnline} disabled={fetching} style={[styles.refreshBtn, { opacity: fetching ? 0.5 : 1 }]}>
              {fetching ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.refreshText}>↻ Загрузить цену онлайн</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Field label="🥇 Золото 24K" value={goldPrice} onChange={setGoldPrice} colors={colors} styles={styles} />
            <Field label="⚪ Серебро" value={silverPrice} onChange={setSilverPrice} colors={colors} styles={styles} />
          </View>

          {lastFetchInfo && (
            <View style={[styles.fetchInfo, { backgroundColor: lastFetchInfo.ok ? colors.success + '15' : colors.warning + '15' }]}>
              <Text style={[styles.fetchInfoText, { color: lastFetchInfo.ok ? colors.success : colors.warning }]}>
                {lastFetchInfo.ok ? '✓ ' : '⚠ '}{lastFetchInfo.message}
                {lastFetchInfo.ts && ` · ${lastFetchInfo.ts.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
              </Text>
            </View>
          )}

          <Text style={styles.help}>
            Нисаб = 85 г золота или 595 г серебра — берётся меньший.
            Онлайн-цена — биржевая (gold-api.com), для розничного золота добавляйте ~5-15% наценки.
          </Text>
        </Card>

        {/* Активы */}
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>Ваши активы ({currency})</Text>
          <Field label="💵 Наличность" value={cash} onChange={setCash} colors={colors} styles={styles} />
          <Field label="🏦 На счетах / вкладах" value={bank} onChange={setBank} colors={colors} styles={styles} />
          <Field label="🥇 Золото (граммы)" value={gold} onChange={setGold} colors={colors} styles={styles} suffix="г" />
          <Field label="⚪ Серебро (граммы)" value={silver} onChange={setSilver} colors={colors} styles={styles} suffix="г" />
          <Field label="🛒 Товары на продажу (рыночная цена)" value={businessStock} onChange={setBusinessStock} colors={colors} styles={styles} />
          <Field label="📈 Инвестиции (акции/доли)" value={investments} onChange={setInvestments} colors={colors} styles={styles} />
          <Field label="💳 Долги в вашу сторону" value={receivables} onChange={setReceivables} colors={colors} styles={styles} />
        </Card>

        {/* Долги */}
        <Card style={{ marginTop: spacing.md, backgroundColor: colors.danger + '08' }}>
          <Text style={styles.sectionLabel}>Ваши долги (вычитаются)</Text>
          <Field
            label="💸 Краткосрочные долги (≤ 1 года)"
            value={payables}
            onChange={setPayables}
            colors={colors}
            styles={styles}
          />
          <Text style={styles.help}>Долгосрочная ипотека не вычитается — только то, что выплачивается в ближайший год.</Text>
        </Card>

        {/* Результат */}
        <Card style={[styles.result, { backgroundColor: aboveNisab ? colors.success + '15' : colors.warning + '15' }]}>
          <Text style={[styles.resultLabel, { color: aboveNisab ? colors.success : colors.warning }]}>
            {aboveNisab ? '✓ Закят обязателен' : '⚠ Сумма ниже нисаба'}
          </Text>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Итого активов:</Text>
            <Text style={styles.calcValue}>{formatMoney(totalAssets, currency)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>– Долги:</Text>
            <Text style={styles.calcValue}>{formatMoney(debt, currency)}</Text>
          </View>
          <View style={[styles.calcRow, { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 8 }]}>
            <Text style={[styles.calcLabel, { fontWeight: '700' }]}>Чистая сумма:</Text>
            <Text style={[styles.calcValue, { fontWeight: '700' }]}>{formatMoney(taxBase, currency)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Нисаб (мин. из золота/серебра):</Text>
            <Text style={styles.calcValue}>{formatMoney(nisab, currency)}</Text>
          </View>

          <View style={styles.bigResultBox}>
            <Text style={[styles.bigLabel, { color: aboveNisab ? colors.success : colors.warning }]}>
              {aboveNisab ? 'К выплате (2,5%)' : 'Сумма ниже нисаба'}
            </Text>
            <Text style={[styles.bigValue, { color: aboveNisab ? colors.success : colors.textMuted }]}>
              {formatMoney(zakat, currency)}
            </Text>
          </View>
        </Card>

        {/* Памятка */}
        <Card style={{ marginTop: spacing.md, backgroundColor: colors.info + '10' }}>
          <Text style={[styles.label, { color: colors.info }]}>📚 Что считается активами</Text>
          <Text style={styles.body}>
            ВКЛЮЧАЕТСЯ: золото, серебро, валюта, наличность, банковские средства, товары на продажу, инвестиционные доли по рыночной цене, ожидаемые возвраты долгов.{'\n\n'}
            НЕ включается: дом проживания, машина, мебель, личная одежда, инструменты профессии.
          </Text>
        </Card>

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.accent + '10' }}>
          <Text style={[styles.label, { color: colors.accentDark }]}>👥 Кому отдавать (Коран 9:60)</Text>
          <Text style={styles.body}>
            1. Бедным (фукара){'\n'}
            2. Нуждающимся (масакин){'\n'}
            3. Сборщикам закята{'\n'}
            4. Тем, чьи сердца склоняют к Исламу{'\n'}
            5. Для выкупа рабов (исторически){'\n'}
            6. Должникам, не могущим выплатить{'\n'}
            7. На пути Аллаха (фи сабилиЛлях){'\n'}
            8. Путникам в нужде
          </Text>
        </Card>

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.warning + '12' }}>
          <Text style={[styles.label, { color: colors.warning }]}>⚠ Внимание</Text>
          <Text style={styles.body}>
            Расчёт — ориентировочный. По конкретным ситуациям (наследство, бизнес-партнёрство, особые активы) — посоветуйтесь с шариатским советом или знающим имамом.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, value, onChange, suffix, colors, styles }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={value}
          onChangeText={onChange}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.lg },
  back: { ...typography.bodyMedium, color: '#fff', marginBottom: spacing.md },
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  sectionLabel: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },

  // Селектор валют
  curChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: 6, alignItems: 'center', minWidth: 64,
  },
  curChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  curCode: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
  curCodeActive: { color: colors.primary },
  curName: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  curNameActive: { color: colors.primary },

  // Цены
  priceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, flexWrap: 'wrap' },
  refreshBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary + '15',
    flexDirection: 'row', alignItems: 'center',
  },
  refreshText: { ...typography.small, color: colors.primary, fontWeight: '700' },
  fetchInfo: { marginTop: 6, padding: spacing.sm, borderRadius: radii.sm },
  fetchInfoText: { ...typography.small, fontWeight: '600' },

  field: { marginBottom: spacing.md, flex: 1 },
  fieldLabel: { ...typography.small, color: colors.textSecondary, marginBottom: 4, fontWeight: '600' },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    ...typography.body, flex: 1,
    color: colors.textPrimary, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  suffix: { ...typography.body, color: colors.textSecondary, marginLeft: 6 },
  help: { ...typography.caption, color: colors.textMuted, marginTop: 6, lineHeight: 16 },

  result: { marginTop: spacing.lg, padding: spacing.lg },
  resultLabel: { ...typography.h3, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center' },

  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  calcLabel: { ...typography.body, color: colors.textPrimary },
  calcValue: { ...typography.body, color: colors.textPrimary },

  bigResultBox: { marginTop: spacing.lg, alignItems: 'center' },
  bigLabel: { ...typography.caption, fontWeight: '700' },
  bigValue: { fontSize: 36, fontWeight: '700', marginTop: 4 },

  label: { ...typography.caption, fontWeight: '700', marginBottom: 4 },
  body: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
});
