export const colors = {
  // Backgrounds
  splashBg: '#ffffff',
  cream: '#fdfcf9',
  creamLight: '#FFFAF0',
  white: '#FFFFFF',
  card: '#FFFFFF',

  // Brand
  primary: '#F99033',
  primaryDark: '#F99033',
  primaryLight: '#F58E5A',
  yellow: '#fcfbf9',
  yellowSoft: '#FFE8A8',

  // Text
  textDark: '#1F1F1F',
  textBody: '#3A3A3A',
  textMuted: '#8B8B8B',
  textLight: '#B5B5B5',

  // Borders / inputs
  border: '#F1E4CE',
  inputBorder: '#F0D9B5',
  inputBg: '#FFFFFF',
  divider: '#F3E7D3',

  // States
  success: '#3EBB6A',
  danger: '#5e3d32',

  // Overlays
  shadow: 'rgba(232, 93, 46, 0.12)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 999,
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export type AccessibilityTheme = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  borderWidth: number;
  header: string; // cabeçalhos das telas (colors.yellow)
  primaryDark: string;
  textMuted: string;
  placeholder: string; // placeholder de inputs (colors.textLight)
  inputBorder: string;
  divider: string;
  onPrimary: string; // texto/ícone sobre botão colorido
  soft: string; // fundos laranja suaves (#FFE0CE, #FFE8DA, #FFF3EB)
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
};

// Tema claro: mantém exatamente as cores que o app já usava.
export const LIGHT_THEME: AccessibilityTheme = {
  background: colors.cream,
  card: colors.card,
  text: colors.textDark,
  textSecondary: '#777777',
  primary: colors.primary,
  border: 'transparent',
  borderWidth: 0,
  header: colors.yellow,
  primaryDark: colors.primaryDark,
  textMuted: colors.textMuted,
  placeholder: colors.textLight,
  inputBorder: colors.inputBorder,
  divider: colors.divider,
  onPrimary: '#FFFFFF',
  soft: '#FFE0CE',
  success: '#2E7D32',
  successBg: '#E8F5E9',
  error: '#B3261E',
  errorBg: '#FDECEA',
  warning: '#B26A00',
  warningBg: '#FFF4D6',
};

// Sombras quase não aparecem no escuro, então os cards ganham uma borda fina.
export const DARK_THEME: AccessibilityTheme = {
  background: '#16130F',
  card: '#26221D',
  text: '#F2EEE8',
  textSecondary: '#B3ABA0',
  primary: colors.primary,
  border: '#3A352E',
  borderWidth: 1,
  header: '#2A2112',
  primaryDark: '#FFB27A',
  textMuted: '#A39B90',
  placeholder: '#8C847A',
  inputBorder: '#4A443B',
  divider: '#3A352E',
  onPrimary: '#FFFFFF',
  soft: '#3A2A20',
  success: '#6FCF8A',
  successBg: '#1F3326',
  error: '#FF8A80',
  errorBg: '#3A1F1D',
  warning: '#F2B84B',
  warningBg: '#3A2E12',
};