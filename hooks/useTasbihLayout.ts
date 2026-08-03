import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390;

export function useTasbihLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const scale = Math.min(Math.max(width / BASE_WIDTH, 0.82), 1.3);
    const rs = (size: number) => Math.round(size * scale);
    const isCompact = width < 360;
    const isWide = width >= 768;
    const horizontalPadding = isWide ? rs(28) : rs(20);
    const contentMaxWidth = isWide ? Math.min(width * 0.55, 520) : width;

    return {
      width,
      height,
      scale,
      rs,
      isCompact,
      isWide,
      horizontalPadding,
      contentMaxWidth,
    };
  }, [width, height]);
}

export function getProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

export function isTaskComplete(current: number, target: number): boolean {
  return current >= target && target > 0;
}
