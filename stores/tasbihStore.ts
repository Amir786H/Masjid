import { create } from 'zustand';

import {
  DEFAULT_BENEFITS,
  DEFAULT_CURRENT_TASK,
  DEFAULT_DAILY_OVERVIEW,
  DEFAULT_SURAH_TASKS,
} from '../data/tasbihDefaults';
import type { BenefitItem, CurrentTask, DailyOverviewStats, SurahTask } from '../types/tasbih';

interface TasbihState {
  currentTask: CurrentTask;
  surahTasks: SurahTask[];
  benefits: BenefitItem[];
  dailyOverview: DailyOverviewStats;
  activeSurahId: string;
  setActiveSurah: (id: string) => void;
  incrementProgress: (id?: string) => void;
  decrementProgress: (id?: string) => void;
  resetProgress: (id?: string) => void;
  setSurahTasks: (tasks: SurahTask[]) => void;
  setCurrentTask: (task: CurrentTask) => void;
  setDailyOverview: (stats: DailyOverviewStats) => void;
}

export const useTasbihStore = create<TasbihState>((set, get) => ({
  currentTask: DEFAULT_CURRENT_TASK,
  surahTasks: DEFAULT_SURAH_TASKS,
  benefits: DEFAULT_BENEFITS,
  dailyOverview: DEFAULT_DAILY_OVERVIEW,
  activeSurahId: DEFAULT_SURAH_TASKS[0].id,

  setActiveSurah: (id) => {
    const task = get().surahTasks.find((item) => item.id === id);
    if (!task) return;

    set({
      activeSurahId: id,
      currentTask: {
        benefit: task.benefit,
        surahName: `Surah ${task.name}`,
        target: task.target,
        description: `Recite Surah ${task.name} ${task.target} time${task.target > 1 ? 's' : ''} daily`,
      },
    });
  },

  incrementProgress: (id) => {
    const surahId = id ?? get().activeSurahId;
    set((state) => ({
      surahTasks: state.surahTasks.map((task) =>
        task.id === surahId
          ? { ...task, current: Math.min(task.current + 1, task.target) }
          : task
      ),
    }));
  },

  decrementProgress: (id) => {
    const surahId = id ?? get().activeSurahId;
    set((state) => ({
      surahTasks: state.surahTasks.map((task) =>
        task.id === surahId ? { ...task, current: Math.max(task.current - 1, 0) } : task
      ),
    }));
  },

  resetProgress: (id) => {
    const surahId = id ?? get().activeSurahId;
    set((state) => ({
      surahTasks: state.surahTasks.map((task) =>
        task.id === surahId ? { ...task, current: 0 } : task
      ),
    }));
  },

  setSurahTasks: (tasks) => set({ surahTasks: tasks }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setDailyOverview: (stats) => set({ dailyOverview: stats }),
}));
