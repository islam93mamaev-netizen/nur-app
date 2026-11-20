import React, { useMemo } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProgress } from '../store/progressStore';
import { useTheme } from '../store/themeStore';

import TabNavigator from './TabNavigator';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import LessonScreen from '../screens/foundations/LessonScreen';
import ModuleScreen from '../screens/foundations/ModuleScreen';
import SurahScreen from '../screens/quran/SurahScreen';
import HadithsScreen from '../screens/hadiths/HadithsScreen';
import HadithDetailScreen from '../screens/hadiths/HadithDetailScreen';
import PracticeScreen from '../screens/practice/PracticeScreen';
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';
import PrayerTimesScreen from '../screens/prayer/PrayerTimesScreen';
import WordDetailScreen from '../screens/words/WordDetailScreen';
import FlashcardsScreen from '../screens/words/FlashcardsScreen';
import QuizScreen from '../screens/tests/QuizScreen';
import AlphabetScreen from '../screens/alphabet/AlphabetScreen';
import LetterScreen from '../screens/alphabet/LetterScreen';
import ExamsScreen from '../screens/exams/ExamsScreen';
import ExamScreen from '../screens/exams/ExamScreen';
import FaqScreen from '../screens/faq/FaqScreen';
import FaqDetailScreen from '../screens/faq/FaqDetailScreen';
import SearchScreen from '../screens/search/SearchScreen';
import RamadanScreen from '../screens/ramadan/RamadanScreen';
import ArabicPathScreen from '../screens/path/ArabicPathScreen';
import PathUnitScreen from '../screens/path/PathUnitScreen';
import BackupScreen from '../screens/backup/BackupScreen';
import SunnahScreen from '../screens/sunnah/SunnahScreen';
import SourcesScreen from '../screens/sources/SourcesScreen';
import AsmaScreen from '../screens/asma/AsmaScreen';
import AsmaDetailScreen from '../screens/asma/AsmaDetailScreen';
import GrammarScreen from '../screens/grammar/GrammarScreen';
import GrammarLessonScreen from '../screens/grammar/GrammarLessonScreen';
import EthicsScreen from '../screens/ethics/EthicsScreen';
import EthicsCategoryScreen from '../screens/ethics/EthicsCategoryScreen';
import EthicsArticleScreen from '../screens/ethics/EthicsArticleScreen';
import DuasScreen from '../screens/duas/DuasScreen';
import DuaCategoryScreen from '../screens/duas/DuaCategoryScreen';
import TasbihScreen from '../screens/tasbih/TasbihScreen';
import QiblaScreen from '../screens/qibla/QiblaScreen';
import HijriScreen from '../screens/hijri/HijriScreen';
import SiraScreen from '../screens/sira/SiraScreen';
import SiraChapterScreen from '../screens/sira/SiraChapterScreen';
import ProphetDetailScreen from '../screens/sira/ProphetDetailScreen';
import BookmarksScreen from '../screens/bookmarks/BookmarksScreen';
import ArbainScreen from '../screens/arbain/ArbainScreen';
import ArbainDetailScreen from '../screens/arbain/ArbainDetailScreen';
import AdhkarScreen from '../screens/adhkar/AdhkarScreen';
import AdhkarSectionScreen from '../screens/adhkar/AdhkarSectionScreen';
import SahabaScreen from '../screens/sahaba/SahabaScreen';
import SahabaDetailScreen from '../screens/sahaba/SahabaDetailScreen';
import ZakatScreen from '../screens/zakat/ZakatScreen';
import TajwidScreen from '../screens/tajwid/TajwidScreen';
import TajwidSectionScreen from '../screens/tajwid/TajwidSectionScreen';
import MazhabsScreen from '../screens/mazhabs/MazhabsScreen';
import MazhabDetailScreen from '../screens/mazhabs/MazhabDetailScreen';
import MazhabTopicScreen from '../screens/mazhabs/MazhabTopicScreen';
import PrayerLessonScreen from '../screens/practice/PrayerLessonScreen';
import FastingScreen from '../screens/fasting/FastingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { loaded, state } = useProgress();
  const { colors, isDark } = useTheme();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [isDark, colors]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {!state.onboardingDone ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Module" component={ModuleScreen} />
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen name="Surah" component={SurahScreen} />
            <Stack.Screen name="Hadiths" component={HadithsScreen} />
            <Stack.Screen name="HadithDetail" component={HadithDetailScreen} />
            <Stack.Screen name="Practice" component={PracticeScreen} />
            <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
            <Stack.Screen name="PrayerTimes" component={PrayerTimesScreen} />
            <Stack.Screen name="WordDetail" component={WordDetailScreen} />
            <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="Alphabet" component={AlphabetScreen} />
            <Stack.Screen name="Letter" component={LetterScreen} />
            <Stack.Screen name="Exams" component={ExamsScreen} />
            <Stack.Screen name="Exam" component={ExamScreen} />
            <Stack.Screen name="Faq" component={FaqScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Ramadan" component={RamadanScreen} />
            <Stack.Screen name="ArabicPath" component={ArabicPathScreen} />
            <Stack.Screen name="PathUnit" component={PathUnitScreen} />
            <Stack.Screen name="Backup" component={BackupScreen} />
            <Stack.Screen name="Sunnah" component={SunnahScreen} />
            <Stack.Screen name="Sources" component={SourcesScreen} />
            <Stack.Screen name="FaqDetail" component={FaqDetailScreen} />
            <Stack.Screen name="Asma" component={AsmaScreen} />
            <Stack.Screen name="AsmaDetail" component={AsmaDetailScreen} />
            <Stack.Screen name="Grammar" component={GrammarScreen} />
            <Stack.Screen name="GrammarLesson" component={GrammarLessonScreen} />
            <Stack.Screen name="Ethics" component={EthicsScreen} />
            <Stack.Screen name="EthicsCategory" component={EthicsCategoryScreen} />
            <Stack.Screen name="EthicsArticle" component={EthicsArticleScreen} />
            <Stack.Screen name="Duas" component={DuasScreen} />
            <Stack.Screen name="DuaCategory" component={DuaCategoryScreen} />
            <Stack.Screen name="Tasbih" component={TasbihScreen} />
            <Stack.Screen name="Qibla" component={QiblaScreen} />
            <Stack.Screen name="Hijri" component={HijriScreen} />
            <Stack.Screen name="Sira" component={SiraScreen} />
            <Stack.Screen name="SiraChapter" component={SiraChapterScreen} />
            <Stack.Screen name="ProphetDetail" component={ProphetDetailScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Arbain" component={ArbainScreen} />
            <Stack.Screen name="ArbainDetail" component={ArbainDetailScreen} />
            <Stack.Screen name="Adhkar" component={AdhkarScreen} />
            <Stack.Screen name="AdhkarSection" component={AdhkarSectionScreen} />
            <Stack.Screen name="Sahaba" component={SahabaScreen} />
            <Stack.Screen name="SahabaDetail" component={SahabaDetailScreen} />
            <Stack.Screen name="Zakat" component={ZakatScreen} />
            <Stack.Screen name="Tajwid" component={TajwidScreen} />
            <Stack.Screen name="TajwidSection" component={TajwidSectionScreen} />
            <Stack.Screen name="Mazhabs" component={MazhabsScreen} />
            <Stack.Screen name="MazhabDetail" component={MazhabDetailScreen} />
            <Stack.Screen name="MazhabTopic" component={MazhabTopicScreen} />
            <Stack.Screen name="PrayerLesson" component={PrayerLessonScreen} />
            <Stack.Screen name="Fasting" component={FastingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
