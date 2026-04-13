export const colors = {
  primary: '#2C3E2D',
  primaryDark: '#1E2E1F',
  secondary: '#6B8F71',
  background: '#FBF7F0',
  card: '#FFFFFF',
  foreground: '#2C3E2D',
  mutedForeground: '#7A7A6E',
  border: 'rgba(44,62,45,0.1)',
  destructive: '#DC2626',
  compassNude: '#E8DFD6',
  compassDark: '#0F2A1A',
  compassGold: '#D4A354',
} as const;

export type ColorToken = keyof typeof colors;
