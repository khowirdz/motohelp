// src/constants/theme.ts
// ✅ File này bị thiếu — gây lỗi "Cannot find module '../../constants/theme'"

export const COLORS = {
  primary:      '#E53935',
  primaryDark:  '#B71C1C',
  primaryLight: '#FFEBEE',
  primaryMid:   '#EF5350',

  blue:         '#1565C0',
  blueLight:    '#E3F2FD',
  blueMid:      '#1E88E5',

  success:      '#2E7D32',
  successLight: '#E8F5E9',
  warning:      '#E65100',
  warningLight: '#FFF3E0',
  danger:       '#C62828',
  dangerLight:  '#FFEBEE',

  white:        '#FFFFFF',
  black:        '#0D0D0D',
  gray50:       '#FAFAFA',
  gray100:      '#F5F5F5',
  gray200:      '#EEEEEE',
  gray300:      '#E0E0E0',
  gray400:      '#BDBDBD',
  gray500:      '#9E9E9E',
  gray600:      '#757575',
  gray700:      '#616161',
  gray800:      '#424242',
  gray900:      '#212121',

  background:   '#F4F4F6',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F9F9FB',
  overlay:      'rgba(0,0,0,0.45)',

  bubbleMe:     '#1565C0',
  bubbleThem:   '#FFFFFF',
  chatBg:       '#F0F2F5',
};

export const FONT = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  black:    '900' as const,
};

export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
};