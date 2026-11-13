import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AccessibilityInfo, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LIGHT_THEME,
  DARK_THEME,
  type AccessibilityTheme,
} from '../constants/theme';

export type { AccessibilityTheme };

export type AccessibilitySettings = {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderHints: boolean;
  darkMode: boolean;
};

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  setSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  fs: (size: number) => number;
  hint: (text: string) => string | undefined;
  theme: AccessibilityTheme;
  isDark: boolean;
};

const STORAGE_KEY = '@merendaja:accessibility';

const DEFAULTS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  screenReaderHints: true,
  darkMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const systemDark = Appearance.getColorScheme() === 'dark';

        if (raw) {
          const savedSettings = JSON.parse(raw);

          setSettings({
            ...DEFAULTS,
            darkMode: systemDark,
            ...savedSettings,

            highContrast: false,
          });
        } else {
          const systemReduceMotion =
            await AccessibilityInfo.isReduceMotionEnabled();

          setSettings({
            ...DEFAULTS,
            reduceMotion: systemReduceMotion,
            darkMode: systemDark,
          });
        }
      } catch {
        setSettings(DEFAULTS);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...settings,
        highContrast: false,
      })
    ).catch(() => {});
  }, [settings, loaded]);

  const setSetting = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      if (key === 'highContrast') return;

      setSettings((prev) => ({
        ...prev,
        [key]: value,
        highContrast: false,
      }));
    },
    []
  );

  const value = useMemo<AccessibilityContextValue>(() => {
    const scale = settings.largeText ? 1.3 : 1;

    return {
      settings: {
        ...settings,
        highContrast: false,
      },

      setSetting,

      fs: (size) => Math.round(size * scale),

      hint: (text) =>
        settings.screenReaderHints ? text : undefined,

      theme: settings.darkMode ? DARK_THEME : LIGHT_THEME,
      isDark: settings.darkMode,
    };
  }, [settings, setSetting]);

  if (!loaded) return null;

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);

  if (!ctx) {
    throw new Error(
      'useAccessibility deve ser usado dentro de <AccessibilityProvider>'
    );
  }

  return ctx;
}