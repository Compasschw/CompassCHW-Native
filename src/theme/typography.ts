export const typography = {
  displayXl: { fontSize: 48, lineHeight: 52, fontWeight: '700' as const, letterSpacing: -1.5 },
  displayLg: { fontSize: 36, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -1 },
  displayMd: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  displaySm: { fontSize: 24, lineHeight: 30, fontWeight: '600' as const },
  bodyLg: { fontSize: 18, lineHeight: 28 },
  bodyMd: { fontSize: 16, lineHeight: 24 },
  bodySm: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 1 },
} as const;

export type TypographyToken = keyof typeof typography;
