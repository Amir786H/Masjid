import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type TabBarVisibilityContextType = {
  visible: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | null>(null);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const lastOffsetY = useRef(0);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const delta = offsetY - lastOffsetY.current;
    const threshold = 12;

    if (offsetY <= 5) {
      setVisible(true);
      lastOffsetY.current = offsetY;
      return;
    }

    if (Math.abs(delta) < threshold) {
      return;
    }

    if (delta > 0) {
      setVisible((current) => (current ? false : current));
    } else if (delta < 0) {
      setVisible((current) => (current ? current : true));
    }

    lastOffsetY.current = offsetY;
  }, []);

  const value = useMemo(() => ({ visible, onScroll: handleScroll }), [visible, handleScroll]);

  return <TabBarVisibilityContext.Provider value={value}>{children}</TabBarVisibilityContext.Provider>;
}

export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error('useTabBarVisibility must be used within TabBarVisibilityProvider');
  }
  return context.visible;
}

export function useTabBarScroll() {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error('useTabBarScroll must be used within TabBarVisibilityProvider');
  }
  return context.onScroll;
}
