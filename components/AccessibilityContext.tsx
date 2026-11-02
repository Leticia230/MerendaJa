
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/theme';

export type AccessibilitySettings = {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderHints: boolean;
};

type AccessibilityTheme = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  borderWidth: number;
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
};

const STORAGE_KEY = '@merendaja:accessibility';

const DEFAULTS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  screenReaderHints: true,
};

// Tema padrão do aplicativo.
// As cores não serão mais modificadas pelas opções de acessibilidade.
const DEFAULT_THEME: AccessibilityTheme = {
  background: colors.cream,
  card: '#FFFFFF',
  text: '#333333',
  textSecondary: '#777777',
  primary: colors.primary,
  border: 'transparent',
  borderWidth: 0,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  // Carrega as preferências salvas.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (raw) {
          const savedSettings = JSON.parse(raw);

          setSettings({
            ...DEFAULTS,
            ...savedSettings,

            // Impede que uma configuração antiga reative o alto contraste.
            highContrast: false,
          });
        } else {
          const systemReduceMotion =
            await AccessibilityInfo.isReduceMotionEnabled();

          setSettings({
            ...DEFAULTS,
            reduceMotion: systemReduceMotion,
          });
        }
      } catch {
        setSettings(DEFAULTS);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Salva as preferências depois do carregamento inicial.
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
      // Impede a ativação do alto contraste.
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
    // Aumenta a fonte em 30% quando a opção está ativada.
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

      // O tema permanece sempre com as cores originais.
      theme: DEFAULT_THEME,
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
