/**
 * MemberProfileScreen — Member profile, settings, and account management.
 *
 * Sections:
 * - Avatar with initials + name
 * - Profile info: zip, language, phone, email
 * - Primary need display
 * - Notification settings with Switch toggles
 * - Rewards balance
 * - Sign out button
 *
 * Uses mock data: memberProfiles[0]
 */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Gift,
  Globe,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react-native';

import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  memberProfiles,
  verticalLabels,
} from '../../data/mock';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationSettings {
  sessionReminders: boolean;
  goalUpdates: boolean;
  healthTips: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Mock member — in production this resolves via auth context → API. */
const MOCK_MEMBER = memberProfiles[0];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps): React.JSX.Element {
  return (
    <View style={infoRowStyles.container}>
      <View style={infoRowStyles.iconBox}>{icon}</View>
      <View style={infoRowStyles.textBox}>
        <Text style={infoRowStyles.label}>{label}</Text>
        <Text style={infoRowStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  value: {
    ...typography.bodyMd,
    color: colors.foreground,
    fontWeight: '500',
  },
});

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps): React.JSX.Element {
  return (
    <View style={sectionCardStyles.container}>
      <Text style={sectionCardStyles.title}>{title}</Text>
      <View style={sectionCardStyles.body}>{children}</View>
    </View>
  );
}

const sectionCardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

interface NotificationToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function NotificationToggleRow({
  label,
  description,
  value,
  onChange,
}: NotificationToggleRowProps): React.JSX.Element {
  return (
    <View style={notifRowStyles.container}>
      <View style={notifRowStyles.textBox}>
        <Text style={notifRowStyles.label}>{label}</Text>
        <Text style={notifRowStyles.desc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : '#FFFFFF'}
        accessibilityLabel={label}
      />
    </View>
  );
}

const notifRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  textBox: {
    flex: 1,
  },
  label: {
    ...typography.bodyMd,
    fontWeight: '500',
    color: colors.foreground,
  },
  desc: {
    ...typography.label,
    color: colors.mutedForeground,
    marginTop: 1,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MemberProfileScreen(): React.JSX.Element {
  const { userName, logout } = useAuth();
  const displayName = userName ?? MOCK_MEMBER.name;
  const initials = getInitials(displayName);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    sessionReminders: true,
    goalUpdates: true,
    healthTips: false,
  });

  const handleToggleNotification = useCallback(
    (key: keyof NotificationSettings) => (value: boolean) => {
      setNotifications((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => void logout(),
        },
      ],
    );
  }, [logout]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        </View>

        {/* Rewards balance */}
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsIconBox}>
            <Gift color={colors.compassGold} size={20} />
          </View>
          <View style={styles.rewardsInfo}>
            <Text style={styles.rewardsLabel}>Rewards Balance</Text>
            <Text style={styles.rewardsValue}>{MOCK_MEMBER.rewardsBalance} points</Text>
          </View>
          <View style={styles.rewardsBadge}>
            <Text style={styles.rewardsBadgeText}>Redeem</Text>
          </View>
        </View>

        {/* Profile info */}
        <SectionCard title="Profile Information">
          <InfoRow
            icon={<MapPin color={colors.primary} size={16} />}
            label="ZIP Code"
            value={MOCK_MEMBER.zipCode}
          />
          <View style={styles.divider} />
          <InfoRow
            icon={<Globe color={colors.primary} size={16} />}
            label="Primary Language"
            value={MOCK_MEMBER.primaryLanguage}
          />
          <View style={styles.divider} />
          <InfoRow
            icon={<Phone color={colors.primary} size={16} />}
            label="Phone"
            value="(310) 555-0192"
          />
          <View style={styles.divider} />
          <InfoRow
            icon={<Mail color={colors.primary} size={16} />}
            label="Email"
            value="rosa.delgado@email.com"
          />
        </SectionCard>

        {/* Primary need */}
        <SectionCard title="Health Needs">
          <View style={styles.primaryNeedRow}>
            <Heart color={colors.secondary} size={16} />
            <View style={styles.primaryNeedInfo}>
              <Text style={styles.primaryNeedLabel}>Primary Need</Text>
              <Text style={styles.primaryNeedValue}>
                {verticalLabels[MOCK_MEMBER.primaryNeed]}
              </Text>
            </View>
            <View style={styles.primaryNeedBadge}>
              <Text style={styles.primaryNeedBadgeText}>Active</Text>
            </View>
          </View>
        </SectionCard>

        {/* Notification settings */}
        <SectionCard title="Notifications">
          <NotificationToggleRow
            label="Session Reminders"
            description="Get reminded before upcoming sessions"
            value={notifications.sessionReminders}
            onChange={handleToggleNotification('sessionReminders')}
          />
          <View style={styles.divider} />
          <NotificationToggleRow
            label="Goal Updates"
            description="Progress milestones and check-ins"
            value={notifications.goalUpdates}
            onChange={handleToggleNotification('goalUpdates')}
          />
          <View style={styles.divider} />
          <NotificationToggleRow
            label="Health Tips"
            description="Weekly wellness and resource tips"
            value={notifications.healthTips}
            onChange={handleToggleNotification('healthTips')}
          />
        </SectionCard>

        {/* Account */}
        <SectionCard title="Account">
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutBtn}
            accessibilityRole="button"
            accessibilityLabel="Sign out of your account"
          >
            <LogOut color={colors.destructive} size={18} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* App version */}
        <Text style={styles.versionText}>Compass CHW · v1.0.0</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: `${colors.primary}30`,
  },
  avatarText: {
    ...typography.displaySm,
    color: colors.primary,
    fontWeight: '700',
  },
  displayName: {
    ...typography.displaySm,
    color: colors.foreground,
    fontWeight: '700',
  },
  memberBadge: {
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  memberBadgeText: {
    ...typography.label,
    color: colors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Rewards
  rewardsCard: {
    backgroundColor: `${colors.compassGold}15`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.compassGold}30`,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  rewardsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${colors.compassGold}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsInfo: {
    flex: 1,
  },
  rewardsLabel: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rewardsValue: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
  },
  rewardsBadge: {
    backgroundColor: colors.compassGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rewardsBadgeText: {
    ...typography.label,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Primary need
  primaryNeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  primaryNeedInfo: {
    flex: 1,
  },
  primaryNeedLabel: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  primaryNeedValue: {
    ...typography.bodyMd,
    fontWeight: '500',
    color: colors.foreground,
  },
  primaryNeedBadge: {
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  primaryNeedBadgeText: {
    ...typography.label,
    fontWeight: '600',
    color: colors.secondary,
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  signOutText: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.destructive,
  },

  versionText: {
    ...typography.label,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
});
