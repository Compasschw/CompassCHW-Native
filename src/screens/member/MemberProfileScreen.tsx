/**
 * MemberProfileScreen — Member profile, settings, preferences, rewards, and account management.
 *
 * Sections:
 * - Avatar with initials + name (editable in edit mode)
 * - Profile info: name, zip, phone, email, primary language, primary need, insurance (editable)
 * - CHW preferences: gender preference, language preference (multi-select), session mode preference
 * - Notification settings with Switch toggles
 * - Rewards balance + history (FlatList of mockRewardHistory)
 * - Redemption catalog (cards with "Redeem" CTA)
 * - Sign out button
 *
 * Edit mode: draft state pattern — edits modify draft; Save commits, Cancel reverts.
 */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Check,
  Edit2,
  Gift,
  Globe,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  User,
  X,
} from 'lucide-react-native';

import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  memberProfiles,
  mockRewardHistory,
  redemptionCatalog,
  verticalLabels,
  type RewardHistoryEntry,
  type RedemptionItem,
  type Vertical,
} from '../../data/mock';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationSettings {
  sessionReminders: boolean;
  goalUpdates: boolean;
  healthTips: boolean;
}

type GenderPreference = 'any' | 'male' | 'female';
type SessionModePreference = 'in_person' | 'virtual' | 'phone';

interface CHWPreferences {
  genderPreference: GenderPreference;
  languagePreferences: string[];
  sessionModePreference: SessionModePreference;
}

interface ProfileDraft {
  firstName: string;
  lastName: string;
  zipCode: string;
  phone: string;
  email: string;
  primaryLanguage: string;
  primaryNeed: Vertical;
  insuranceProvider: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_MEMBER = memberProfiles[0];

const MOCK_PHONE = '(310) 555-0192';
const MOCK_EMAIL = 'rosa.delgado@email.com';
const MOCK_INSURANCE = 'Medi-Cal (L.A. Care)';

const ALL_LANGUAGES: string[] = [
  'English',
  'Spanish',
  'Vietnamese',
  'Arabic',
  'Cantonese',
  'Mandarin',
  'Tagalog',
  'Korean',
];

const ALL_VERTICALS: Vertical[] = [
  'housing',
  'rehab',
  'food',
  'mental_health',
  'healthcare',
];

const GENDER_OPTIONS: { key: GenderPreference; label: string }[] = [
  { key: 'any', label: 'Any' },
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
];

const SESSION_MODE_OPTIONS: { key: SessionModePreference; label: string }[] = [
  { key: 'in_person', label: 'In Person' },
  { key: 'virtual', label: 'Virtual' },
  { key: 'phone', label: 'Phone' },
];

const REWARD_ACTION_ICONS: Record<string, string> = {
  session_completed: '✅',
  follow_through: '⭐',
  redeemed: '🎁',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();
}

function formatRewardDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function buildDraft(name: string, profile: typeof MOCK_MEMBER): ProfileDraft {
  const parts = name.split(' ');
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    zipCode: profile.zipCode,
    phone: MOCK_PHONE,
    email: MOCK_EMAIL,
    primaryLanguage: profile.primaryLanguage,
    primaryNeed: profile.primaryNeed,
    insuranceProvider: MOCK_INSURANCE,
  };
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
  textBox: { flex: 1 },
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

interface EditFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
}

function EditField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: EditFieldProps): React.JSX.Element {
  return (
    <View style={editFieldStyles.container}>
      <Text style={editFieldStyles.label}>{label}</Text>
      <TextInput
        style={editFieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        accessibilityLabel={label}
      />
    </View>
  );
}

const editFieldStyles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    ...typography.bodyMd,
    color: colors.foreground,
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
      android: { elevation: 2 },
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
  textBox: { flex: 1 },
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

// ─── Reward history row ───────────────────────────────────────────────────────

function RewardRow({ item }: { item: RewardHistoryEntry }): React.JSX.Element {
  const isPositive = item.points > 0;
  return (
    <View style={rewardRowStyles.container}>
      <View style={rewardRowStyles.iconBox}>
        <Text style={rewardRowStyles.icon}>
          {REWARD_ACTION_ICONS[item.action] ?? '•'}
        </Text>
      </View>
      <View style={rewardRowStyles.info}>
        <Text style={rewardRowStyles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={rewardRowStyles.date}>{formatRewardDate(item.date)}</Text>
      </View>
      <Text
        style={[
          rewardRowStyles.points,
          { color: isPositive ? colors.secondary : colors.destructive },
        ]}
      >
        {isPositive ? '+' : ''}{item.points} pts
      </Text>
    </View>
  );
}

const rewardRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.compassGold}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    ...typography.bodySm,
    color: colors.foreground,
    fontWeight: '500',
  },
  date: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  points: {
    ...typography.bodyMd,
    fontWeight: '700',
  },
});

// ─── Redemption card ──────────────────────────────────────────────────────────

interface RedemptionCardProps {
  item: RedemptionItem;
  onRedeem: (item: RedemptionItem) => void;
  balance: number;
}

function RedemptionCard({ item, onRedeem, balance }: RedemptionCardProps): React.JSX.Element {
  const canAfford = balance >= item.pointsCost;
  return (
    <View style={redemptionCardStyles.card}>
      <Text style={redemptionCardStyles.emoji}>{item.emoji}</Text>
      <View style={redemptionCardStyles.info}>
        <Text style={redemptionCardStyles.name}>{item.name}</Text>
        <Text style={redemptionCardStyles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={redemptionCardStyles.cost}>{item.pointsCost} pts</Text>
      </View>
      <TouchableOpacity
        style={[
          redemptionCardStyles.redeemBtn,
          !canAfford && redemptionCardStyles.redeemBtnDisabled,
        ]}
        onPress={() => onRedeem(item)}
        disabled={!canAfford}
        accessibilityRole="button"
        accessibilityLabel={`Redeem ${item.name} for ${item.pointsCost} points`}
        accessibilityState={{ disabled: !canAfford }}
      >
        <Text
          style={[
            redemptionCardStyles.redeemBtnText,
            !canAfford && redemptionCardStyles.redeemBtnTextDisabled,
          ]}
        >
          Redeem
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const redemptionCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 28,
    width: 44,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
  },
  description: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  cost: {
    ...typography.label,
    color: colors.compassGold,
    marginTop: 2,
  },
  redeemBtn: {
    backgroundColor: colors.compassGold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  redeemBtnDisabled: {
    backgroundColor: colors.border,
  },
  redeemBtnText: {
    ...typography.label,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  redeemBtnTextDisabled: {
    color: colors.mutedForeground,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MemberProfileScreen(): React.JSX.Element {
  const { userName, logout } = useAuth();
  const displayName = userName ?? MOCK_MEMBER.name;

  // Committed name state
  const [name, setName] = useState(displayName);
  const [rewardsBalance, setRewardsBalance] = useState(MOCK_MEMBER.rewardsBalance);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => buildDraft(displayName, MOCK_MEMBER));

  const [notifications, setNotifications] = useState<NotificationSettings>({
    sessionReminders: true,
    goalUpdates: true,
    healthTips: false,
  });

  const [chwPreferences, setChwPreferences] = useState<CHWPreferences>({
    genderPreference: 'any',
    languagePreferences: [MOCK_MEMBER.primaryLanguage],
    sessionModePreference: 'in_person',
  });

  const handleEditPress = useCallback(() => {
    setDraft(buildDraft(name, MOCK_MEMBER));
    setIsEditing(true);
  }, [name]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    const updatedName = [draft.firstName.trim(), draft.lastName.trim()]
      .filter(Boolean)
      .join(' ');
    if (updatedName) {
      setName(updatedName);
    }
    setIsEditing(false);
  }, [draft]);

  const handleToggleLanguagePref = useCallback((lang: string) => {
    setChwPreferences((prev) => {
      const isSelected = prev.languagePreferences.includes(lang);
      return {
        ...prev,
        languagePreferences: isSelected
          ? prev.languagePreferences.filter((l) => l !== lang)
          : [...prev.languagePreferences, lang],
      };
    });
  }, []);

  const handleToggleNotification = useCallback(
    (key: keyof NotificationSettings) => (value: boolean) => {
      setNotifications((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleRedeem = useCallback(
    (item: RedemptionItem) => {
      if (rewardsBalance < item.pointsCost) {
        Alert.alert(
          'Insufficient Points',
          `You need ${item.pointsCost - rewardsBalance} more points to redeem ${item.name}.`,
        );
        return;
      }
      Alert.alert(
        `Redeem ${item.name}?`,
        `This will use ${item.pointsCost} points from your balance.\n\nCurrent balance: ${rewardsBalance} pts`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              setRewardsBalance((prev) => prev - item.pointsCost);
              Alert.alert('Redemption Submitted', `Your ${item.name} request has been submitted.`);
            },
          },
        ],
      );
    },
    [rewardsBalance],
  );

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => void logout() },
      ],
    );
  }, [logout]);

  const initials = getInitials(name);

  const committedDraft = buildDraft(name, MOCK_MEMBER);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header with Edit/Save/Cancel ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        {isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerCancelBtn}
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <X size={16} color={colors.mutedForeground} />
              <Text style={styles.headerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerSaveBtn}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.headerSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.headerEditBtn}
            onPress={handleEditPress}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Edit2 size={15} color={colors.primary} />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {isEditing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={[styles.nameInput, { flex: 1 }]}
                value={draft.firstName}
                onChangeText={(text) => setDraft((prev) => ({ ...prev, firstName: text }))}
                placeholder="First name"
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel="First name"
              />
              <TextInput
                style={[styles.nameInput, { flex: 1 }]}
                value={draft.lastName}
                onChangeText={(text) => setDraft((prev) => ({ ...prev, lastName: text }))}
                placeholder="Last name"
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel="Last name"
              />
            </View>
          ) : (
            <Text style={styles.displayName}>{name}</Text>
          )}
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
            <Text style={styles.rewardsValue}>{rewardsBalance} points</Text>
          </View>
          <View style={styles.rewardsBadge}>
            <Text style={styles.rewardsBadgeText}>Active</Text>
          </View>
        </View>

        {/* Profile info */}
        {isEditing ? (
          <View style={styles.editCard}>
            <Text style={styles.editCardTitle}>Profile Information</Text>
            <EditField
              label="ZIP Code"
              value={draft.zipCode}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, zipCode: text }))}
              keyboardType="numeric"
              placeholder="90031"
            />
            <EditField
              label="Phone"
              value={draft.phone}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
              placeholder="(310) 555-0000"
            />
            <EditField
              label="Email"
              value={draft.email}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, email: text }))}
              keyboardType="email-address"
              placeholder="your@email.com"
            />
            <Text style={editFieldStyles.label}>Primary Language</Text>
            <View style={styles.pillRow}>
              {ALL_LANGUAGES.map((lang) => {
                const isSelected = draft.primaryLanguage === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.pill,
                      isSelected
                        ? { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => setDraft((prev) => ({ ...prev, primaryLanguage: lang }))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={lang}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? colors.primary : colors.mutedForeground },
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ height: 12 }} />
            <Text style={editFieldStyles.label}>Primary Need</Text>
            <View style={styles.pillRow}>
              {ALL_VERTICALS.map((v) => {
                const isSelected = draft.primaryNeed === v;
                return (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.pill,
                      isSelected
                        ? { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => setDraft((prev) => ({ ...prev, primaryNeed: v }))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={verticalLabels[v]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? colors.primary : colors.mutedForeground },
                      ]}
                    >
                      {verticalLabels[v]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ height: 12 }} />
            <EditField
              label="Insurance Provider"
              value={draft.insuranceProvider}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, insuranceProvider: text }))}
              placeholder="Medi-Cal, Kaiser, etc."
            />
          </View>
        ) : (
          <SectionCard title="Profile Information">
            <InfoRow
              icon={<MapPin color={colors.primary} size={16} />}
              label="ZIP Code"
              value={committedDraft.zipCode}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={<Globe color={colors.primary} size={16} />}
              label="Primary Language"
              value={committedDraft.primaryLanguage}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={<Phone color={colors.primary} size={16} />}
              label="Phone"
              value={MOCK_PHONE}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={<Mail color={colors.primary} size={16} />}
              label="Email"
              value={MOCK_EMAIL}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={<Heart color={colors.primary} size={16} />}
              label="Primary Need"
              value={verticalLabels[committedDraft.primaryNeed]}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={<User color={colors.primary} size={16} />}
              label="Insurance"
              value={MOCK_INSURANCE}
            />
          </SectionCard>
        )}

        {/* CHW Preferences */}
        <SectionCard title="CHW Preferences">
          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>Gender Preference</Text>
            <View style={styles.segmentRow}>
              {GENDER_OPTIONS.map((opt) => {
                const isSelected = chwPreferences.genderPreference === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.segmentBtn,
                      isSelected && styles.segmentBtnActive,
                    ]}
                    onPress={() =>
                      setChwPreferences((prev) => ({
                        ...prev,
                        genderPreference: opt.key,
                      }))
                    }
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        isSelected && styles.segmentBtnTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>Language Preference</Text>
            <Text style={styles.prefHint}>Select all languages you are comfortable with</Text>
            <View style={styles.pillRow}>
              {ALL_LANGUAGES.map((lang) => {
                const isSelected = chwPreferences.languagePreferences.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.pill,
                      isSelected
                        ? { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => handleToggleLanguagePref(lang)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={lang}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? colors.primary : colors.mutedForeground },
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.prefSection}>
            <Text style={styles.prefLabel}>Session Mode Preference</Text>
            <View style={styles.segmentRow}>
              {SESSION_MODE_OPTIONS.map((opt) => {
                const isSelected = chwPreferences.sessionModePreference === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.segmentBtn,
                      isSelected && styles.segmentBtnActive,
                    ]}
                    onPress={() =>
                      setChwPreferences((prev) => ({
                        ...prev,
                        sessionModePreference: opt.key,
                      }))
                    }
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        isSelected && styles.segmentBtnTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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

        {/* Rewards history */}
        <View style={styles.rewardsHistoryCard}>
          <View style={styles.rewardsHistoryHeader}>
            <Bell size={16} color={colors.compassGold} />
            <Text style={styles.rewardsHistoryTitle}>Rewards History</Text>
          </View>
          <FlatList
            data={mockRewardHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <>
                {index > 0 ? <View style={styles.divider} /> : null}
                <RewardRow item={item} />
              </>
            )}
            scrollEnabled={false}
            accessibilityLabel="Rewards history list"
          />
        </View>

        {/* Redemption catalog */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeader}>
            <ShoppingBag size={16} color={colors.primary} />
            <Text style={styles.catalogTitle}>Redemption Catalog</Text>
          </View>
          <Text style={styles.catalogBalance}>
            Your balance: <Text style={styles.catalogBalanceBold}>{rewardsBalance} pts</Text>
          </Text>
          {redemptionCatalog.map((item) => (
            <RedemptionCard
              key={item.id}
              item={item}
              onRedeem={handleRedeem}
              balance={rewardsBalance}
            />
          ))}
        </View>

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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.bodyLg,
    fontWeight: '700',
    color: colors.foreground,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '10',
  },
  headerEditText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },
  headerSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  headerSaveText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  headerCancelText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.mutedForeground,
  },

  scroll: { flex: 1 },
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
  nameEditRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    ...typography.bodyMd,
    color: colors.foreground,
    textAlign: 'center',
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

  // Rewards summary card
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
  rewardsInfo: { flex: 1 },
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
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rewardsBadgeText: {
    ...typography.label,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Inline edit card
  editCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  editCardTitle: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Pill toggles
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  // CHW preferences
  prefSection: {
    paddingVertical: 12,
  },
  prefLabel: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  prefHint: {
    ...typography.label,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    minWidth: 80,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  segmentBtnText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  segmentBtnTextActive: {
    color: colors.primary,
  },

  // Rewards history
  rewardsHistoryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  rewardsHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rewardsHistoryTitle: {
    ...typography.bodyLg,
    fontWeight: '700',
    color: colors.foreground,
  },

  // Redemption catalog
  catalogSection: {
    marginBottom: 16,
  },
  catalogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  catalogTitle: {
    ...typography.bodyLg,
    fontWeight: '700',
    color: colors.foreground,
  },
  catalogBalance: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    marginBottom: 12,
  },
  catalogBalanceBold: {
    fontWeight: '700',
    color: colors.compassGold,
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
