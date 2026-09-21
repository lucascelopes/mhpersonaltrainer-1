export type CleanPalette = {
  surface: string;
  surfaceAlt: string;
  surfaceSoft: string;
  border: string;
  text: string;
  textMuted: string;
  textSoft: string;
  surfaceGradient: [string, string, string];
  surfaceAltGradient: [string, string, string];
};

const lightCleanPalette: CleanPalette = {
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  surfaceSoft: '#EEF3F8',
  border: '#E0E3E7',
  text: '#14181B',
  textMuted: '#57636C',
  textSoft: '#6B7280',
  surfaceGradient: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
  surfaceAltGradient: ['#F8FAFC', '#F8FAFC', '#F8FAFC'],
};

const darkCleanPalette: CleanPalette = {
  surface: '#14181B',
  surfaceAlt: '#1D2428',
  surfaceSoft: '#262D34',
  border: '#2F3941',
  text: '#FFFFFF',
  textMuted: '#B7C1CC',
  textSoft: '#95A1AC',
  surfaceGradient: ['#14181B', '#171D21', '#1D2428'],
  surfaceAltGradient: ['#1D2428', '#202930', '#262D34'],
};

export function getCleanPalette(isDark?: boolean): CleanPalette {
  return isDark ? darkCleanPalette : lightCleanPalette;
}
