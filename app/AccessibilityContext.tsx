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
  /** Multiplica um tamanho de fonte (1.3x quando "Texto grande" está ativo). */
  fs: (size: number) => number;
  /** Retorna a dica só se "Dicas de leitor de tela" estiver ativo. */
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

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  // Carrega as preferências salvas (e, na primeira vez, respeita o "reduzir movimento" do sistema)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
        } else {
          const systemReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
          setSettings({ ...DEFAULTS, reduceMotion: systemReduceMotion });
        }
      } catch {
        // se falhar, segue com os valores padrão
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Salva sempre que mudar (depois do carregamento inicial)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const setSetting = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const value = useMemo<AccessibilityContextValue>(() => {
    const scale = settings.largeText ? 1.3 : 1;

    const theme: AccessibilityTheme = settings.highContrast
      ? {
          background: '#FFFFFF',
          card: '#FFFFFF',
          text: '#000000',
          textSecondary: '#1A1A1A',
          primary: '#B34700',
          border: '#000000',
          borderWidth: 2,
        }
      : {
          background: colors.cream,
          card: '#FFFFFF',
          text: '#333333',
          textSecondary: '#777777',
          primary: colors.primary,
          border: 'transparent',
          borderWidth: 0,
        };

    return {
      settings,
      setSetting,
      fs: (size) => Math.round(size * scale),
      hint: (text) => (settings.screenReaderHints ? text : undefined),
      theme,
    };
  }, [settings, setSetting]);

  // Evita um "piscar" com o tema errado enquanto carrega
  if (!loaded) return null;

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility deve ser usado dentro de <AccessibilityProvider>');
  }
  return ctx;
}