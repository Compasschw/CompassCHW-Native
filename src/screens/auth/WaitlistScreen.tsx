/**
 * WaitlistScreen — join the CompassCHW waitlist.
 * Styled to match the Lovable /waitlist page.
 *
 * Layout (mobile-first, vertical stack):
 *   1. Logo wordmark
 *   2. Hero heading + subtitle
 *   3. Trust badges (3 pills: HIPAA, Medi-Cal, No Cost)
 *   4. Form card (white, gradient top bar, shadow-elevated)
 *   5. Success state with CheckCircle confirmation
 */

import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shield, CheckCircle, Star } from 'lucide-react-native';

import { submitWaitlist, type WaitlistPayload } from '../../api/waitlist';
import { colors } from '../../theme/colors';
import { typography, fonts } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { radii, spacing } from '../../theme/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Waitlist'>;

type WaitlistRole = 'chw' | 'member' | '';

// ─── Storage key for offline fallback ────────────────────────────────────────

const WAITLIST_STORAGE_KEY = 'compass_waitlist_submission';

// ─── Trust badges ─────────────────────────────────────────────────────────────

interface TrustBadge {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}

const TRUST_BADGES: TrustBadge[] = [
  { icon: Shield, label: 'HIPAA Compliant' },
  { icon: CheckCircle, label: 'Medi-Cal Accepted' },
  { icon: Star, label: 'No Cost to Members' },
];

// ─── Role options ─────────────────────────────────────────────────────────────

interface RoleOption {
  value: WaitlistRole;
  label: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { value: 'chw', label: 'CHW — I want to provide care' },
  { value: 'member', label: 'Member — I need support' },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WaitlistScreen displays the waitlist signup form.
 * On success, transitions to an inline confirmation state.
 * On API failure, persists to AsyncStorage so the lead is not lost.
 */
export function WaitlistScreen({ navigation }: Props): React.JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WaitlistRole>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = useCallback((): string | null => {
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Enter a valid email address.';
    if (!role) return 'Please select your role.';
    return null;
  }, [firstName, lastName, email, role]);

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<void> => {
    Keyboard.dismiss();

    const validationError = validate();
    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: WaitlistPayload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      role: role as string,
    };

    try {
      await submitWaitlist(payload);
      setIsSuccess(true);
    } catch {
      // API failed — persist locally so the lead is not lost.
      try {
        const existingRaw = await AsyncStorage.getItem(WAITLIST_STORAGE_KEY);
        const existing: WaitlistPayload[] = existingRaw
          ? (JSON.parse(existingRaw) as WaitlistPayload[])
          : [];
        existing.push(payload);
        await AsyncStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(existing));
        setIsSuccess(true);
      } catch {
        setError('Unable to submit right now. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [firstName, lastName, email, role, validate]);

  // ── Success state ─────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.successFullScreen}>
          <View style={[s.successCard, shadows.elevated]}>
            {/* Gradient top bar */}
            <View style={s.cardGradientBar}>
              <View style={s.cardGradientLeft} />
              <View style={s.cardGradientRight} />
            </View>

            <View style={s.successCardBody}>
              <View style={s.successIconWrapper}>
                <CheckCircle size={40} color={colors.primary} />
              </View>
              <Text style={s.successTitle}>You're on the list!</Text>
              <Text style={s.successSubtitle}>
                We'll notify you when Compass launches in your area.
              </Text>

              <TouchableOpacity
                style={s.backButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
                accessibilityLabel="Go to sign in"
                accessibilityRole="button"
              >
                <Text style={s.backButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo wordmark ─────────────────────────────────────────────── */}
          <View style={s.logoRow}>
            <View style={s.logoPulse} />
            <Text style={s.wordmark}>
              Compass<Text style={s.wordmarkAccent}>CHW</Text>
            </Text>
          </View>

          {/* ── Hero copy ─────────────────────────────────────────────────── */}
          <View style={s.heroSection}>
            <View style={s.eyebrowRow}>
              <View style={s.eyebrowDot} />
              <Text style={s.eyebrowText}>LAUNCHING SOON IN LOS ANGELES</Text>
            </View>

            <Text style={s.heroTitle}>
              Community health,{' '}
              <Text style={s.heroTitleAccent}>connected.</Text>
            </Text>

            <Text style={s.heroSubtitle}>
              Compass CHW connects Los Angeles residents with trusted{' '}
              <Text style={s.heroSubtitleBold}>Community Health Workers</Text> — neighbors
              trained to help with housing, recovery, food, mental health, and healthcare navigation.
            </Text>
          </View>

          {/* ── Trust badges ──────────────────────────────────────────────── */}
          <View style={s.trustBadgesRow}>
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <View key={label} style={s.trustBadge}>
                <Icon size={14} color={colors.primary} />
                <Text style={s.trustBadgeText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* ── Form card ─────────────────────────────────────────────────── */}
          <View style={[s.card, shadows.elevated]}>
            {/* Gradient top bar: primary → compassNude */}
            <View style={s.cardGradientBar}>
              <View style={s.cardGradientLeft} />
              <View style={s.cardGradientRight} />
            </View>

            <View style={s.cardBody}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Get early access</Text>
                <Text style={s.cardSubtitle}>
                  Be the first to know when Compass launches in your area.
                  Join the waitlist — it takes 10 seconds.
                </Text>
              </View>

              {/* Error */}
              {error !== null && (
                <View style={s.errorContainer}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              {/* First + Last name row */}
              <View style={s.nameRow}>
                <View style={[s.inputGroup, s.inputHalf]}>
                  <Text style={s.inputLabel}>FIRST NAME</Text>
                  <TextInput
                    style={s.textInput}
                    placeholder="Maria"
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    returnKeyType="next"
                    editable={!isLoading}
                    accessibilityLabel="First name"
                  />
                </View>
                <View style={[s.inputGroup, s.inputHalf]}>
                  <Text style={s.inputLabel}>LAST NAME</Text>
                  <TextInput
                    style={s.textInput}
                    placeholder="Garcia"
                    placeholderTextColor={`${colors.mutedForeground}88`}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    autoComplete="family-name"
                    returnKeyType="next"
                    editable={!isLoading}
                    accessibilityLabel="Last name"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="maria@example.com"
                  placeholderTextColor={`${colors.mutedForeground}88`}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  editable={!isLoading}
                  accessibilityLabel="Email address"
                />
              </View>

              {/* Role — segmented selector */}
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>I AM A...</Text>
                <View style={s.roleSelector}>
                  {ROLE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        s.roleOption,
                        role === option.value && s.roleOptionSelected,
                      ]}
                      onPress={() => setRole(option.value)}
                      activeOpacity={0.7}
                      accessibilityLabel={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: role === option.value }}
                    >
                      <Text
                        style={[
                          s.roleOptionText,
                          role === option.value && s.roleOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[s.submitButton, isLoading && s.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
                accessibilityLabel="Join the waitlist"
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={s.submitButtonText}>Join the Waitlist  →</Text>
                )}
              </TouchableOpacity>

              {/* Footer copy */}
              <Text style={s.footerNote}>No spam, ever. Unsubscribe anytime.</Text>

              {/* Social proof */}
              <View style={s.socialProofRow}>
                <View style={s.socialProofDot} />
                <Text style={s.socialProofText}>Join hundreds of CHWs and community members</Text>
              </View>

              {/* Already have account */}
              <View style={s.signInRow}>
                <Text style={s.signInText}>Already have an account?  </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  accessibilityRole="button"
                  accessibilityLabel="Go to sign in"
                >
                  <Text style={s.signInLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoPulse: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.secondary,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  wordmarkAccent: {
    color: colors.secondary,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroSection: {
    gap: spacing.md,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.secondary,
  },
  eyebrowText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.mutedForeground,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    color: colors.foreground,
  },
  heroTitleAccent: {
    color: colors.secondary,
  },
  heroSubtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedForeground,
  },
  heroSubtitleBold: {
    fontFamily: fonts.bodySemibold,
    color: colors.foreground,
  },

  // ── Trust badges ──────────────────────────────────────────────────────────
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  trustBadgeText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.primary,
  },

  // ── Card shared ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardGradientBar: {
    height: 3,
    flexDirection: 'row',
  },
  cardGradientLeft: {
    flex: 3,
    backgroundColor: colors.primary,
  },
  cardGradientRight: {
    flex: 2,
    backgroundColor: colors.compassNude,
  },
  cardBody: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardHeader: {
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    color: colors.foreground,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorContainer: {
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.md,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.destructive,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs - 2,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.mutedForeground,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.foreground,
  },

  // ── Role selector ─────────────────────────────────────────────────────────
  roleSelector: {
    gap: spacing.sm,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },
  roleOptionText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  roleOptionTextSelected: {
    fontFamily: fonts.bodySemibold,
    color: colors.primary,
  },

  // ── Submit button ─────────────────────────────────────────────────────────
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: 52,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerNote: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: `${colors.mutedForeground}99`,
    textAlign: 'center',
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  socialProofDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.secondary,
  },
  socialProofText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  signInLink: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.primary,
  },

  // ── Success card ──────────────────────────────────────────────────────────
  successFullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  successCardBody: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  successTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 24,
    color: colors.foreground,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
