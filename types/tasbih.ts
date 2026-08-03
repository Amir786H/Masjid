export type BenefitIconName =
  | 'heart'
  | 'book'
  | 'shield'
  | 'star'
  | 'moon'
  | 'hands';

export interface SurahTask {
  id: string;
  number: number;
  name: string;
  arabicName: string;
  meaning: string;
  target: number;
  current: number;
  benefit: string;
  benefitIcon: BenefitIconName;
}

export interface BenefitItem {
  id: string;
  title: string;
  surahName: string;
  times: number;
  icon: BenefitIconName;
}

export interface DailyOverviewStats {
  streakDays: number;
  surahsCompletedToday: number;
  totalSurahsToday: number;
  totalRecitationsToday: number;
  dailyGoalSurahs: number;
}

export interface CurrentTask {
  benefit: string;
  surahName: string;
  target: number;
  description: string;
}
