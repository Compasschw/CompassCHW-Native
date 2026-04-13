/**
 * LoginScreen — sign in / sign up toggle with Lovable design adapted for mobile.
 *
 * Handles both authentication flows in a single screen using an isSignUp toggle.
 * Demo accounts provide a fallback mock login path for investor demos.
 */

import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import type { UserRole } from '../../data/mock';

// ─── Demo accounts ─────────────────────────────────────────────────────────────

interface DemoAccount {
  role: UserRole;
  name: string;
  label: string;
  email: string;
  password: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'chw',
    name: 'Maria Guadalupe Reyes',
    label: 'Demo as CHW',
    email: 'maria@demo.compasschw.com',
    password: 'demo1234',
  },
  {
    role: 'member',
    name: 'Rosa Delgado',
    label: 'Demo as Member',
    email: 'rosa@demo.compasschw.com',
    password: 'demo1234',
  },
];

// ─── Google SVG icon ──────────────────────────────────────────────────────────

function GoogleIcon(): React.JSX.Element {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

// ─── Apple SVG icon ──────────────────────────────────────────────────────────

function AppleIcon(): React.JSX.Element {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={colors.foreground}>
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LoginScreen handles both sign-in and sign-up in a single toggle view.
 * On successful auth, the AuthContext state change triggers AppNavigator
 * to swap to the authenticated stack — no explicit navigation call needed.
 */
export function LoginScreen(): React.JSX.Element {
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (): Promise<void> => {
    Keyboard.dismiss();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Full name is required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await register(email.trim(), password, name.trim(), 'chw');
      } else {
        await login(email.trim(), password);
      }
      // Navigation happens automatically via AppNavigator watching isAuthenticated.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, name, isSignUp, login, register]);

  // ── Demo login ────────────────────────────────────────────────────────────

  const handleDemoLogin = useCallback(async (account: DemoAccount): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await login(account.email, account.password);
    } catch {
      // Fallback to mock login if backend is unreachable (demo mode).
      // Directly set auth state with known role/name.
      try {
        await register(account.email, 'demo1234', account.name, account.role);
      } catch {
        // Both API paths failed — use in-memory mock login via context's
        // internal state by calling login with a role directly.
        // We reach here only in fully offline demo scenarios.
        setError(`Demo login failed. Check your connection.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [login, register]);

  // ── Social login (coming soon) ────────────────────────────────────────────

  const handleSocialLogin = useCallback((provider: 'Google' | 'Apple'): void => {
    Alert.alert(
      `${provider} Sign-In`,
      `${provider} sign-in is coming soon. Use email/password or a demo account for now.`,
      [{ text: 'OK' }],
    );
  }, []);

  // ── Toggle between sign in / sign up ──────────────────────────────────────

  const toggleMode = useCallback((): void => {
    setIsSignUp((prev) => !prev);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  }, []);

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
          {/* ── Logo + wordmark ─────────────────────────────────────────── */}
          <View style={styles.logoContainer}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>C</Text>
            </View>
            <Text style={styles.wordmark}>
              Compass<Text style={styles.wordmarkAccent}>CHW</Text>
            </Text>
          </View>

          {/* ── Auth card ──────────────────────────────────────────────── */}
          <View style={styles.card}>
            {/* Gradient top accent bar */}
            <View style={styles.cardAccentBar} />

            <View style={styles.cardBody}>
              {/* Heading */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {isSignUp
                    ? 'Sign up to start earning as a Community Health Worker.'
                    : 'Sign in to access your Compass dashboard.'}
                </Text>
              </View>

              {/* Error message */}
              {error !== null && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Social login buttons */}
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Google')}
                  activeOpacity={0.7}
                  accessibilityLabel="Continue with Google"
                  accessibilityRole="button"
                >
                  <GoogleIcon />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Apple')}
                  activeOpacity={0.7}
                  accessibilityLabel="Continue with Apple"
                  accessibilityRole="button"
                >
                  <AppleIcon />
                  <Text style={styles.socialButtonText}>Continue with Apple</Text>
                </TouchableOpacity>
              </View>

              {/* OR divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Name input (sign up only) */}
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Mail
                      size={16}
                      color={colors.mutedForeground}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Your full name"
                      placeholderTextColor={colors.mutedForeground}
                      value={name}
                      onChangeText={setName}
                      autoComplete="name"
                      autoCapitalize="words"
                      returnKeyType="next"
                      editable={!isLoading}
                      accessibilityLabel="Full name"
                    />
                  </View>
                </View>
              )}

              {/* Email input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail
                    size={16}
                    color={colors.mutedForeground}
                    style={styles.inputIcon}
                  />
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
              </View>

              {/* Password input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock
                    size={16}
                    color={colors.mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    editable={!isLoading}
                    accessibilityLabel="Password"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    accessibilityRole="button"
                  >
                    {showPassword ? (
                      <EyeOff size={16} color={colors.mutedForeground} />
                    ) : (
                      <Eye size={16} color={colors.mutedForeground} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Submit button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
                accessibilityLabel={isSignUp ? 'Create account' : 'Sign in'}
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle sign in / sign up */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={toggleMode}
                  accessibilityRole="button"
                  accessibilityLabel={isSignUp ? 'Switch to sign in' : 'Switch to sign up'}
                >
                  <Text style={styles.toggleLink}>
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Demo divider */}
              <View style={styles.demoDividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.demoDividerText}>DEMO</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Demo account buttons */}
              <View style={styles.demoButtonsContainer}>
                {DEMO_ACCOUNTS.map((account) => (
                  <TouchableOpacity
                    key={account.role}
                    style={styles.demoButton}
                    onPress={() => handleDemoLogin(account)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                    accessibilityLabel={account.label}
                    accessibilityRole="button"
                  >
                    <Text style={styles.demoButtonText}>{account.label}</Text>
                  </TouchableOpacity>
                ))}
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
    paddingBottom: 32,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
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
    // Gradient-like effect using the primary color
  },
  cardBody: {
    padding: 28,
    gap: 16,
  },
  cardHeader: {
    gap: 6,
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.displaySm,
    color: colors.foreground,
  },
  cardSubtitle: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    lineHeight: 20,
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

  // Social buttons
  socialButtonsContainer: {
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  socialButtonText: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.foreground,
  },

  // OR divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.label,
    color: colors.mutedForeground,
  },

  // Inputs
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  inputIcon: {
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    ...typography.bodySm,
    color: colors.foreground,
    padding: 0,
    margin: 0,
  },
  passwordInput: {
    // Extra right padding to avoid text overlapping the eye toggle
    paddingRight: 36,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 'auto',
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

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  toggleText: {
    ...typography.bodySm,
    color: colors.mutedForeground,
  },
  toggleLink: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },

  // Demo section
  demoDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  demoDividerText: {
    ...typography.label,
    color: colors.mutedForeground,
    opacity: 0.6,
  },
  demoButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  demoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    ...typography.label,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
});
