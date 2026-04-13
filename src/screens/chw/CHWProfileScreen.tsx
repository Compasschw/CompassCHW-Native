/**
 * CHWProfileScreen — Profile management for the authenticated CHW.
 *
 * Sections:
 *  - Avatar circle with initials
 *  - Profile info cards (name, email placeholder, phone placeholder, zip, bio)
 *  - Specializations as pill badges
 *  - Languages as pill badges
 *  - Credentials section with status badges
 *  - Availability toggle
 *  - Sign out button
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  UserCheck,
  BookOpen,
  LogOut,
  Star,
  Briefcase,
} from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import {
  chwProfiles,
  mockCredentials,
  type Vertical,
  type Credential,
  type CredentialStatus,
} from '../../data/mock';

// ─── Constants ────────────────────────────────────────────────────────────────

const VERTICAL_LABELS: Record<Vertical, string> = {
  housing: 'Housing',
  rehab: 'Rehab & Recovery',
  food: 'Food Security',
  mental_health: 'Mental Health',
  healthcare: 'Healthcare Access',
};

const VERTICAL_COLORS: Record<Vertical, string> = {
  housing: '#3B82F6',
  rehab: '#EF4444',
  food: '#F59E0B',
  mental_health: '#8B5CF6',
  healthcare: '#06B6D4',
};

const CREDENTIAL_STATUS_COLORS: Record<CredentialStatus, string> = {
  verified: '#16A34A',
  pending: colors.compassGold,
  expired: colors.destructive,
};

const CREDENTIAL_STATUS_LABELS: Record<CredentialStatus, string> = {
  verified: 'Verified',
  pending: 'Pending Review',
  expired: 'Expired',
};

// ─── CredentialIcon helper ────────────────────────────────────────────────────

function CredentialIconComponent({
  type,
}: {
  type: Credential['type'];
}): React.JSX.Element {
  switch (type) {
    case 'chw_certification':
      return <Shield size={16} color={colors.primary} />;
    case 'hipaa_training':
      return <Lock size={16} color="#0077B6" />;
    case 'background_check':
      return <UserCheck size={16} color="#D97706" />;
    case 'continuing_education':
      return <BookOpen size={16} color="#7C3AED" />;
  }
}

const CREDENTIAL_ICON_BG: Record<Credential['type'], string> = {
  chw_certification: colors.primary + '18',
  hipaa_training: '#0077B618',
  background_check: '#D9770618',
  continuing_education: '#7C3AED18',
};

function formatCredentialDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── InfoRow sub-component ────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps): React.JSX.Element {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconCircle}>{icon}</View>
      <View style={infoStyles.textBlock}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    ...typography.bodyMd,
    color: colors.foreground,
    marginTop: 1,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * CHW Profile screen — shows profile info, credentials, and account actions.
 */
export function CHWProfileScreen(): React.JSX.Element {
  const { logout } = useAuth();

  // Use first CHW profile as the authenticated user's profile in mock mode
  const profile = chwProfiles[0];

  const [isAvailable, setIsAvailable] = useState(profile.isAvailable);

  const handleToggleAvailability = useCallback((value: boolean) => {
    setIsAvailable(value);
  }, []);

  const handleSignOut = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar + name header ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{profile.avatar}</Text>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Star size={12} color={colors.compassGold} />
              <Text style={styles.statPillText}>{profile.rating.toFixed(1)} rating</Text>
            </View>
            <View style={styles.statPill}>
              <Briefcase size={12} color={colors.secondary} />
              <Text style={styles.statPillText}>{profile.yearsExperience} yrs exp</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>{profile.totalSessions} sessions</Text>
            </View>
          </View>
        </View>

        {/* ── Personal info ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.divider} />
          <InfoRow
            icon={<Mail size={16} color={colors.primary} />}
            label="Email"
            value="maria.reyes@compasschw.org"
          />
          <View style={styles.divider} />
          <InfoRow
            icon={<Phone size={16} color={colors.primary} />}
            label="Phone"
            value="(213) 555-0192"
          />
          <View style={styles.divider} />
          <InfoRow
            icon={<MapPin size={16} color={colors.primary} />}
            label="Zip Code"
            value={profile.zipCode}
          />
        </View>

        {/* ── Bio ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* ── Specializations ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.pillRow}>
            {profile.specializations.map((spec) => (
              <View
                key={spec}
                style={[
                  styles.pill,
                  { backgroundColor: VERTICAL_COLORS[spec] + '18' },
                ]}
              >
                <Text style={[styles.pillText, { color: VERTICAL_COLORS[spec] }]}>
                  {VERTICAL_LABELS[spec]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Languages ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.pillRow}>
            {profile.languages.map((lang) => (
              <View key={lang} style={[styles.pill, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.pillText, { color: colors.primary }]}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Credentials ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Credentials</Text>
          {mockCredentials.map((cred, index) => {
            const statusColor = CREDENTIAL_STATUS_COLORS[cred.status];
            return (
              <View key={cred.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.credRow}>
                  <View
                    style={[
                      styles.credIconCircle,
                      { backgroundColor: CREDENTIAL_ICON_BG[cred.type] },
                    ]}
                  >
                    <CredentialIconComponent type={cred.type} />
                  </View>
                  <View style={styles.credInfo}>
                    <View style={styles.credTitleRow}>
                      <Text style={styles.credLabel}>{cred.label}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor + '18' }]}>
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                          {CREDENTIAL_STATUS_LABELS[cred.status]}
                        </Text>
                      </View>
                    </View>
                    {cred.expirationDate ? (
                      <Text style={styles.credMeta}>
                        Expires {formatCredentialDate(cred.expirationDate)}
                      </Text>
                    ) : cred.uploadDate ? (
                      <Text style={styles.credMeta}>
                        Uploaded {formatCredentialDate(cred.uploadDate)}
                      </Text>
                    ) : null}
                    {cred.type === 'continuing_education' &&
                    cred.creditHours != null &&
                    cred.requiredHours != null ? (
                      <Text style={styles.credMeta}>
                        {cred.creditHours}/{cred.requiredHours} credit hours
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Availability toggle ── */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Available for Requests</Text>
            <Text style={styles.toggleSubtext}>
              {isAvailable
                ? 'You are visible to members seeking support.'
                : 'You are hidden from new requests.'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Toggle availability"
          />
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <LogOut size={18} color={colors.destructive} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    ...typography.displaySm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileName: {
    ...typography.displaySm,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statPillText: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.bodyLg,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  bioText: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  credIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  credInfo: {
    flex: 1,
    gap: 3,
  },
  credTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  credLabel: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
  },
  credMeta: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  toggleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
  },
  toggleSubtext: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.destructive + '40',
    paddingVertical: 16,
  },
  signOutText: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.destructive,
  },
});
