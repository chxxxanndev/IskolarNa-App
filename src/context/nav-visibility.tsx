import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Platform, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

/** Rough height before the real bar has been measured. */
const DEFAULT_BAR_HEIGHT = 72;
/** Keep scrolling down this far (in one direction) before the bar hides... */
const HIDE_DISTANCE = 20;
/** ...but bring it back after only a short flick up, so it's easy to reach. */
const SHOW_DISTANCE = 8;
/** Always show the bar this close to the top or bottom of a list. */
const EDGE_DISTANCE = 24;

type NavVisibility = {
  /** 0 = shown, 1 = fully hidden below the screen. Drives the bar's translateY. */
  translate: Animated.Value;
  barHeight: number;
  setBarHeight: (h: number) => void;
  setShown: (shown: boolean) => void;
};

const NavVisibilityContext = createContext<NavVisibility | null>(null);

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const translate = useRef(new Animated.Value(0)).current;
  const shown = useRef(true);
  const [barHeight, setBarHeight] = useState(DEFAULT_BAR_HEIGHT);

  const setShown = useCallback(
    (next: boolean) => {
      if (shown.current === next) return;
      shown.current = next;
      Animated.timing(translate, { toValue: next ? 0 : 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start();
    },
    [translate],
  );

  const value = useMemo(
    () => ({ translate, barHeight, setBarHeight, setShown }),
    [translate, barHeight, setShown],
  );

  return <NavVisibilityContext.Provider value={value}>{children}</NavVisibilityContext.Provider>;
}

export function useNavVisibility(): NavVisibility {
  const ctx = useContext(NavVisibilityContext);
  if (!ctx) throw new Error('useNavVisibility must be used inside <NavVisibilityProvider>');
  return ctx;
}

/**
 * Put this on a screen's main ScrollView / FlatList:
 *
 *   const nav = useNavScroll();
 *   <ScrollView {...nav.scrollProps} contentContainerStyle={{ paddingBottom: nav.bottomPad }} />
 *
 * Scrolling down hides the bottom bar; scrolling up, reaching the top or bottom
 * of the list, or switching tabs brings it back.
 * `bottomPad` keeps the last item clear of the bar, since the bar floats over the content.
 */
export function useNavScroll() {
  const { barHeight, setShown } = useNavVisibility();
  const lastY = useRef(0);
  /** Distance scrolled in the current direction; resets when the direction flips. */
  const run = useRef(0);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const y = contentOffset.y;
      const dy = y - lastY.current;
      lastY.current = y;
      // Add up movement instead of judging each event alone, so slow scrolling still counts.
      run.current = Math.sign(dy) === Math.sign(run.current) ? run.current + dy : dy;

      const nearTop = y <= EDGE_DISTANCE;
      const nearBottom = contentSize.height - layoutMeasurement.height - y <= EDGE_DISTANCE;

      if (nearTop || nearBottom) {
        run.current = 0;
        setShown(true);
      } else if (run.current > HIDE_DISTANCE) setShown(false);
      else if (run.current < -SHOW_DISTANCE) setShown(true);
    },
    [setShown],
  );

  const scrollProps = useMemo(() => ({ onScroll, scrollEventThrottle: 16 }), [onScroll]);

  return { scrollProps, bottomPad: barHeight + 16 };
}
