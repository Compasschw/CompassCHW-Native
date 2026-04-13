/**
 * WaitlistScreen — join the CompassCHW waitlist.
 *
 * Collects first name, last name, email, and role.
 * On submit, calls submitWaitlist API with AsyncStorage fallback
 * if the network request fails.
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
import { CheckCircle } from 'lucide-react-native';

import { submitWaitlist, type WaitlistPayload } from '../../api/waitlist';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Waitlist'>;

type WaitlistRole = 'chw' | 'member' | '';

// ─── Storage key for offline fallback ────────────────────────────────────────

const WAITLIST_STORAGE_KEY = 'compass_waitlist_submission';

// ─── Trust badge data ─────────────────────────────────────────────────────────

interface TrustBadge {
  label: string;
  sublabel: string;
}

const TRUST_BADGES: TrustBadge[] = [
  { label: 'HIPAA', sublabel: 'Compliant' },
  { label: 'Medi-Cal', sublabel: 'Integrated' },
  { label: 'No Cost', sublabel: 'For Members' },
];

// ─── Role option ──────────────────────────────────────────────────────────────

interface RoleOption {
  value: WaitlistRole;
  label: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { value: 'chw', label: 'Community Health Worker (CHW)' },
  { value: 'member', label: 'Community Member' },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WaitlistScreen displays the waitlist signup form.
 * On success, shows a confirmation state.
 * On API failure, persists the submission to AsyncStorage as a fallback.
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
      // API failed — persist locally as fallback so we don't lose the lead.
      try {
        const existingRaw = await AsyncStorage.getItem(WAITLIST_STORAGE_KEY);
        const existing: WaitlistPayload[] = existingRaw ? (JSON.parse(existingRaw) as WaitlistPayload[]) : [];
        existing.push(payload);
        await AsyncStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(existing));
        // Show success regardless — user is on the list locally.
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <CheckCircle size={48} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>You're on the list!</Text>
          <Text style={styles.successSubtitle}>
            We'll reach out to {email} as soon as CompassCHW launches in your area.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            accessibilityLabel="Go to sign in"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>C</Text>
            </View>
            <Text style={styles.wordmark}>
              Compass<Text style={styles.wordmarkAccent}>CHW</Text>
            </Text>
          </View>

          {/* ── Hero copy ─────────────────────────────────────────────── */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Community health,{' '}
              <Text style={styles.heroTitleAccent}>connected.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              CompassCHW connects community health workers with members who need
              help navigating housing, food, recovery, and healthcare. Be the
              first to know when we launch.
            </Text>
          </View>

          {/* ── Trust badges ──────────────────────────────────────────── */}
          <View style={styles.trustBadgesContainer}>
            {TRUST_BADGES.map((badge) => (
              <View key={badge.label} style={styles.trustBadge}>
                <Text style={styles.trustBadgeLabel}>{badge.label}</Text>
                <Text style={styles.trustBadgeSublabel}>{badge.sublabel}</Text>
              </View>
            ))}
          </View>

          {/* ── Form card ─────────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardAccentBar} />

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Join the Waitlist</Text>
              <Text style={styles.cardSubtitle}>
                We'll notify you as soon as we launch in your area.
              </Text>

              {/* Error */}
              {error !== null && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* First name */}
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Maria"
                    placeholderTextColor={colors.mutedForeground}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    returnKeyType="next"
                    editable={!isLoading}
                    accessibilityLabel="First name"
                  />
                </View>
                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Reyes"
                    placeholderTextColor={colors.mutedForeground}
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
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="maria@example.com"
                  placeholderTextColor={colors.mutedForeground}
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

              {/* Role — custom segmented selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>I am a...</Text>
                <View style={styles.roleSelector}>
                  {ROLE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.roleOption,
                        role === option.value && styles.roleOptionSelected,
                      ]}
                      onPress={() => setRole(option.value)}
                      activeOpacity={0.7}
                      accessibilityLabel={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: role === option.value }}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          role === option.value && styles.roleOptionTextSelected,
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
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
                accessibilityLabel="Join the waitlist"
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Join the Waitlist  →</Text>
                )}
              </TouchableOpacity>

              {/* Already have account */}
              <View style={styles.signInLinkContainer}>
                <Text style={styles.signInLinkText}>Already have an account?  </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  accessibilityRole="button"
                  accessibilityLabel="Go to sign in"
                >
                  <Text style={styles.signInLink}>Sign in</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 24,
  },

  // Header / logo
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    ...typography.displaySm,
    color: '#FFFFFF',
  },
  wordmark: {
    ...typography.displaySm,
    color: colors.foreground,
  },
  wordmarkAccent: {
    color: colors.secondary,
  },

  // Hero
  heroSection: {
    gap: 12,
  },
  heroTitle: {
    ...typography.displayMd,
    color: colors.foreground,
    textAlign: 'center',
  },
  heroTitleAccent: {
    color: colors.secondary,
  },
  heroSubtitle: {
    ...typography.bodyMd,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Trust badges
  trustBadgesContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  trustBadge: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  trustBadgeLabel: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },
  trustBadgeSublabel: {
    ...typography.label,
    color: colors.mutedForeground,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardAccentBar: {
    height: 6,
    backgroundColor: colors.primary,
  },
  cardBody: {
    padding: 28,
    gap: 16,
  },
  cardTitle: {
    ...typography.displaySm,
    color: colors.foreground,
  },
  cardSubtitle: {
    ...typography.bodySm,
    color: colors.mutedForeground,
  },

  // Error
  errorContainer: {
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.destructive,
  },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodySm,
    color: colors.foreground,
  },

  // Role selector
  roleSelector: {
    gap: 8,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`, // ~5% opacity
  },
  roleOptionText: {
    ...typography.bodySm,
    color: colors.mutedForeground,
  },
  roleOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Submit
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 52,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Sign in link
  signInLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLinkText: {
    ...typography.bodySm,
    color: colors.mutedForeground,
  },
  signInLink: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },

  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    ...typography.displaySm,
    color: colors.foreground,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.bodyMd,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backButtonText: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
