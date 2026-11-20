// Главный экран — только компоновка. Каждый блок — отдельный компонент
// в components/home/, данные секций — в data/homeSections.js.

import React from 'react';
import Screen from '../../components/Screen';
import NextPrayerCard from '../../components/NextPrayerCard';
import ContinueReadingCard from '../../components/ContinueReadingCard';
import HomeGreeting from '../../components/home/HomeGreeting';
import RamadanBanner from '../../components/home/RamadanBanner';
import { AyatOfDay, HadithOfDay } from '../../components/home/DailyCards';
import { PathProgressCard, ContinueLessonCard } from '../../components/home/ContinueCards';
import QuickActions from '../../components/home/QuickActions';
import { useProgress } from '../../store/progressStore';
import { getOrderedSections } from '../../data/homeSections';

export default function HomeScreen({ navigation }) {
  const { state } = useProgress();
  const go = (route, params) => navigation.navigate(route, params);

  return (
    <Screen scroll>
      <HomeGreeting
        name={state.profile.name}
        streak={state.streak.count}
        onSearch={() => go('Search')}
      />

      {/* Следующий намаз + дата хиджры */}
      <NextPrayerCard onPress={() => go('PrayerTimes')} />

      {/* Только в месяц Рамадан */}
      <RamadanBanner onPress={() => go('Ramadan')} />

      <AyatOfDay />
      <HadithOfDay onOpen={(hadithId) => go('HadithDetail', { hadithId })} />

      <PathProgressCard
        completedUnits={state.completedPathUnits || {}}
        goal={state.profile.goal}
        onOpen={(unitId) => go('PathUnit', { unitId })}
      />

      <ContinueReadingCard navigation={navigation} />

      <ContinueLessonCard
        lessonId={state.lastOpenedLesson}
        onOpen={(lessonId) => go('Lesson', { lessonId })}
      />

      {/* Порядок секций зависит от цели в профиле */}
      <QuickActions sections={getOrderedSections(state.profile.goal)} onNavigate={go} />
    </Screen>
  );
}
