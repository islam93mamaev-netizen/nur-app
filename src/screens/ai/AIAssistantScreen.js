import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { askAI, isAiConfigured } from '../../services/aiService';
import { useTheme } from '../../store/themeStore';
import { useSettings, AI_PROVIDER_LABEL } from '../../store/settingsStore';

// Заготовленные ответы — используются, если ключ Claude API не настроен.
const SUGGESTIONS = [
  'Что означает аят 2:255?',
  'Объясни хадис «Дела по намерениям»',
  'Покажи слова о милости',
  'Какие слова встречаются чаще всего?',
  'Что такое таджвид?',
];

const SCRIPTED = {
  'что означает аят 2:255':
    'Аят 2:255 — «Аят аль-Курси» («Аят трона»). Он описывает величие Аллаха: Он Живой, Самодостаточный, Его не охватывает ни дремота, ни сон. Ему принадлежит всё на небесах и на земле. Никто не заступится перед Ним без Его позволения. Это один из величайших аятов Корана.',
  'объясни хадис':
    'Хадис «Поистине, дела оцениваются по намерениям» (Бухари №1, Муслим №1907) — первый в сборнике имама ан-Навави. Учит, что Аллах оценивает поступки по тому, ради чего они совершались. Внешне одинаковые действия получают разную награду в зависимости от намерения в сердце.',
  'покажи слова о милости':
    'Слова с корнем ر ح م:\n• رَحْمَة — милость\n• ٱلرَّحْمَٰن — Милостивый (одно из имён Аллаха)\n• ٱلرَّحِيم — Милосердный\nКорень رحم встречается в Коране более 300 раз.',
  'какие слова встречаются чаще всего':
    'Самые частые слова в Коране:\n1. ٱللَّه — Аллах (~2698)\n2. قَالَ — сказать (~1722)\n3. كَانَ — быть (~1361)\n4. عَلِمَ — знать (~854)\n5. آمَنَ — уверовать (~537)\n6. كَفَرَ — отрицать (~525)\n7. ٱلْأَرْض — земля (~461)\nЗнание частых слов помогает понимать значительную долю текста Корана.',
  'что такое таджвид':
    'Таджвид — это правила правильного произношения арабских букв при чтении Корана. Цель — сохранять речь так, как её произносил пророк ﷺ. Изучается у учителя, с особым вниманием к махраджу (месту произношения букв) и сифатам (характеристикам).',
};

function findScripted(q) {
  const lc = q.toLowerCase().trim();
  for (const key of Object.keys(SCRIPTED)) {
    if (lc.includes(key)) return SCRIPTED[key];
  }
  return null;
}

export default function AIAssistantScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const settings = useSettings();
  const { aiApiKey, aiProvider } = settings;
  const providerLabel = AI_PROVIDER_LABEL[aiProvider]?.short || 'DeepSeek';
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ассаламу алейкум! Я ваш AI-помощник (DeepSeek). Спросите о Коране, хадисах или арабских словах.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();
  const aiOn = isAiConfigured({ aiApiKey });

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    const userMsg = { role: 'user', text: q };
    setMessages((m) => [...m, userMsg]);

    setLoading(true);
    try {
      let reply;
      if (aiOn) {
        // Реальный AI (DeepSeek через OpenRouter или прямой DeepSeek API)
        const history = messages.filter((m) => m.role !== 'system');
        const answer = await askAI(q, history, settings);
        reply = { role: 'assistant', text: answer };
      } else {
        // Заглушка: офлайн скрипт + подсказка как включить
        const scripted = findScripted(q);
        reply = {
          role: 'assistant',
          text: scripted || `🔌 AI-помощник работает в офлайн-режиме (заготовленные ответы).

Чтобы получить настоящие ответы DeepSeek:
1. Откройте Профиль → AI-помощник
2. Получите бесплатный ключ на openrouter.ai (1 минута)
3. Вставьте его в настройках

Можно также использовать прямой ключ DeepSeek (platform.deepseek.com).`,
        };
      }
      setMessages((m) => [...m, reply]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: '⚠️ ' + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>AI-помощник</Text>
        <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
          <Pill
            label={aiOn ? `DeepSeek · ${providerLabel}` : 'Офлайн / без ключа'}
            background="#fff"
            textColor={aiOn ? colors.success : colors.warning}
          />
          {!aiOn && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
              style={styles.setupBtn}
            >
              <Text style={styles.setupText}>Настроить →</Text>
            </TouchableOpacity>
          )}
        </View>
      </DetailHeader>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  m.role === 'user' ? styles.userText : styles.aiText,
                ]}
              >
                {m.text}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.bubble, styles.aiBubble, { flexDirection: 'row', alignItems: 'center' }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginLeft: 8, color: colors.textSecondary }}>Думаю…</Text>
            </View>
          )}

          {messages.length <= 1 && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={styles.sugTitle}>Попробуйте:</Text>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  activeOpacity={0.85}
                  onPress={() => send(s)}
                  style={styles.sugBtn}
                >
                  <Text style={styles.sugText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Задайте вопрос…"
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={() => send()}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => send()} style={styles.sendBtn} disabled={loading}>
            <Text style={styles.sendText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h2, color: '#fff' },

  bubble: { padding: spacing.md, borderRadius: radii.lg, marginBottom: spacing.sm, maxWidth: '85%' },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleText: { ...typography.body, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: colors.textPrimary },

  sugTitle: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  sugBtn: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sugText: { ...typography.body, color: colors.primary },

  inputRow: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    ...typography.body,
    color: colors.textPrimary,
  },
  sendBtn: {
    marginLeft: spacing.sm,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 22, fontWeight: '700' },

  setupBtn: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.pill,
  },
  setupText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
