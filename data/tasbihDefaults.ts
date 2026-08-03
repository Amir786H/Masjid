import type { BenefitItem, CurrentTask, DailyOverviewStats, SurahTask } from '../types/tasbih';

export const DEFAULT_CURRENT_TASK: CurrentTask = {
  benefit: 'Peace of Mind & Relief',
  surahName: 'Surah Ar-Rahman',
  target: 7,
  description: 'Recite Surah Ar-Rahman 7 times daily',
};

export const DEFAULT_SURAH_TASKS: SurahTask[] = [
  {
    id: 'rahman',
    number: 1,
    name: 'Ar-Rahman',
    arabicName: 'الرحمن',
    meaning: 'The Most Merciful',
    target: 7,
    current: 4,
    benefit: 'Peace of Mind & Relief',
    benefitIcon: 'heart',
  },
  {
    id: 'yasin',
    number: 2,
    name: 'Yasin',
    arabicName: 'يس',
    meaning: 'Heart of the Quran',
    target: 1,
    current: 1,
    benefit: 'Spiritual Strength',
    benefitIcon: 'book',
  },
  {
    id: 'mulk',
    number: 3,
    name: 'Al-Mulk',
    arabicName: 'الملك',
    meaning: 'The Sovereignty',
    target: 1,
    current: 0,
    benefit: 'Protection',
    benefitIcon: 'shield',
  },
  {
    id: 'ikhlas',
    number: 4,
    name: 'Al-Ikhlas',
    arabicName: 'الإخلاص',
    meaning: 'The Sincerity',
    target: 3,
    current: 2,
    benefit: 'Purification',
    benefitIcon: 'star',
  },
];

export const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    id: 'peace',
    title: 'Peace of Mind & Relief',
    surahName: 'Surah Ar-Rahman',
    times: 7,
    icon: 'heart',
  },
  {
    id: 'strength',
    title: 'Spiritual Strength',
    surahName: 'Surah Yasin',
    times: 1,
    icon: 'book',
  },
  {
    id: 'protection',
    title: 'Protection',
    surahName: 'Surah Al-Mulk',
    times: 1,
    icon: 'shield',
  },
  {
    id: 'purification',
    title: 'Purification',
    surahName: 'Surah Al-Ikhlas',
    times: 3,
    icon: 'star',
  },
  {
    id: 'guidance',
    title: 'Divine Guidance',
    surahName: 'Surah Al-Fatiha',
    times: 3,
    icon: 'moon',
  },
];

export const DEFAULT_DAILY_OVERVIEW: DailyOverviewStats = {
  streakDays: 12,
  surahsCompletedToday: 1,
  totalSurahsToday: 5,
  totalRecitationsToday: 16,
  dailyGoalSurahs: 5,
};
