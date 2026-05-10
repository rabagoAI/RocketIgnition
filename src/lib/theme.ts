export const Colors = {
  background: '#080C14',
  card: '#0D1220',
  cardElevated: '#121929',
  border: '#1E2D45',

  primary: '#FF4D1C',
  accent: '#00C2FF',
  warning: '#FFD600',

  textPrimary: '#F0F4FF',
  textSecondary: '#8899BB',
  textMuted: '#4A5A7A',

  statusGo: '#00E676',
  statusTbd: '#FFD600',
  statusHold: '#8899BB',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Fonts = {
  mono: 'IBMPlexMono_400Regular',
  monoBold: 'IBMPlexMono_700Bold',
  system: undefined,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export const AnimationDuration = {
  fast: 200,
  normal: 300,
  slow: 400,
} as const;

export type LaunchStatus = 'Go' | 'TBD' | 'Hold' | 'Success' | 'Failure';

export function getLaunchStatusColor(status: LaunchStatus): string {
  switch (status) {
    case 'Go': return Colors.statusGo;
    case 'TBD': return Colors.statusTbd;
    case 'Hold': return Colors.statusHold;
    case 'Success': return Colors.statusGo;
    case 'Failure': return Colors.primary;
    default: return Colors.statusHold;
  }
}
