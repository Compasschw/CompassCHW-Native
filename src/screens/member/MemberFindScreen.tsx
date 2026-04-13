/**
 * MemberFindScreen — "Find Your CHW" page.
 *
 * Features:
 * - Search input (filters by name/bio)
 * - Horizontal filter tabs by vertical category
 * - FlatList of CHW cards with avatar, specializations, rating, experience, bio
 * - Schedule request Modal with vertical, urgency, mode, and description
 * - "Map view coming soon" placeholder toggle
 * - Toast confirmation on submit
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle,
  Map,
  Search,
  Star,
  X,
} from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  chwProfiles,
  verticalLabels,
  type CHWProfile,
  type SessionMode,
  type Urgency,
  type Vertical,
} from '../../data/mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | Vertical;

interface ScheduleFormData {
  vertical: Vertical;
  urgency: Urgency;
  mode: SessionMode;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'housing', label: 'Housing' },
  { key: 'food', label: 'Food' },
  { key: 'mental_health', label: 'Mental Health' },
  { key: 'rehab', label: 'Rehab' },
  { key: 'healthcare', label: 'Healthcare' },
];

const VERTICAL_OPTIONS: { key: Vertical; label: string; emoji: string }[] = [
  { key: 'housing', label: 'Housing', emoji: '🏠' },
  { key: 'food', label: 'Food Security', emoji: '🛒' },
  { key: 'mental_health', label: 'Mental Health', emoji: '🧠' },
  { key: 'rehab', label: 'Rehab & Recovery', emoji: '💪' },
  { key: 'healthcare', label: 'Healthcare Access', emoji: '🏥' },
];

const URGENCY_OPTIONS: { key: Urgency; label: string }[] = [
  { key: 'routine', label: 'Routine' },
  { key: 'soon', label: 'Soon' },
  { key: 'urgent', label: 'Urgent' },
];

const MODE_OPTIONS: { key: SessionMode; label: string }[] = [
  { key: 'in_person', label: 'In Person' },
  { key: 'virtual', label: 'Virtual' },
  { key: 'phone', label: 'Phone' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a deterministic background color for CHW avatar initials
 * based on the first character's char code.
 */
function getAvatarBg(initials: string): string {
  const palettes = [
    { bg: `${colors.primary}18`, text: colors.primary },
    { bg: '#EBF5FB', text: '#0077B6' },
    { bg: '#F3E5F5', text: '#7B1FA2' },
    { bg: '#FFF3E0', text: '#E65100' },
    { bg: '#FCE4EC', text: '#C2185B' },
  ];
  const idx = initials.charCodeAt(0) % palettes.length;
  return palettes[idx].bg;
}

function getAvatarTextColor(initials: string): string {
  const palettes = [
    colors.primary,
    '#0077B6',
    '#7B1FA2',
    '#E65100',
    '#C2185B',
  ];
  const idx = initials.charCodeAt(0) % palettes.length;
  return palettes[idx];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ToastBannerProps {
  message: string;
}

function ToastBanner({ message }: ToastBannerProps): React.JSX.Element {
  return (
    <View style={toastStyles.container} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <CheckCircle color="#FFFFFF" size={15} />
      <Text style={toastStyles.text}>{message}</Text>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    left: 16,
    right: 16,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  text: {
    ...typography.bodySm,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
});

interface StarDisplayProps {
  rating: number;
}

function StarDisplay({ rating }: StarDisplayProps): React.JSX.Element {
  const full = Math.floor(rating);
  return (
    <View style={starStyles.row} accessibilityLabel={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          color={i < full ? '#FBBF24' : colors.border}
          fill={i < full ? '#FBBF24' : colors.border}
        />
      ))}
      <Text style={starStyles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
    marginLeft: 3,
  },
});

// ─── Schedule Modal ────────────────────────────────────────────────────────────

interface ScheduleModalProps {
  chw: CHWProfile;
  visible: boolean;
  onClose: () => void;
  onSubmit: (chwFirstName: string, formData: ScheduleFormData) => void;
}

function ScheduleModal({ chw, visible, onClose, onSubmit }: ScheduleModalProps): React.JSX.Element {
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
  const [urgency, setUrgency] = useState<Urgency>('routine');
  const [mode, setMode] = useState<SessionMode>('in_person');
  const [description, setDescription] = useState('');

  const resetForm = useCallback(() => {
    setSelectedVertical(null);
    setUrgency('routine');
    setMode('in_person');
    setDescription('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(() => {
    if (!selectedVertical) return;
    const firstName = chw.name.split(' ')[0];
    onSubmit(firstName, { vertical: selectedVertical, urgency, mode, description });
    resetForm();
  }, [chw.name, description, mode, onSubmit, resetForm, selectedVertical, urgency]);

  const avatarBg = getAvatarBg(chw.avatar);
  const avatarTextColor = getAvatarTextColor(chw.avatar);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <View style={[modalStyles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={[modalStyles.avatarText, { color: avatarTextColor }]}>
                  {chw.avatar}
                </Text>
              </View>
              <View>
                <Text style={modalStyles.headerTitle}>Schedule with {chw.name.split(' ')[0]}</Text>
                <Text style={modalStyles.headerSub}>{chw.name}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={modalStyles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              hitSlop={8}
            >
              <X color={colors.mutedForeground} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} showsVerticalScrollIndicator={false}>
            {/* Vertical selection */}
            <Text style={modalStyles.fieldLabel}>What do you need help with?</Text>
            <View style={modalStyles.verticalList}>
              {VERTICAL_OPTIONS.map((opt) => {
                const isSelected = selectedVertical === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setSelectedVertical(opt.key)}
                    style={[
                      modalStyles.verticalOption,
                      isSelected && modalStyles.verticalOptionSelected,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={opt.label}
                  >
                    <Text style={modalStyles.verticalEmoji}>{opt.emoji}</Text>
                    <Text style={[
                      modalStyles.verticalOptionText,
                      isSelected && { color: colors.primary },
                    ]}>
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <CheckCircle color={colors.primary} size={15} style={modalStyles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Urgency */}
            <Text style={modalStyles.fieldLabel}>Urgency</Text>
            <View style={modalStyles.chipRow}>
              {URGENCY_OPTIONS.map((opt) => {
                const isSelected = urgency === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setUrgency(opt.key)}
                    style={[modalStyles.chip, isSelected && modalStyles.chipSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[
                      modalStyles.chipText,
                      isSelected && { color: colors.primary },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Mode */}
            <Text style={modalStyles.fieldLabel}>Preferred Mode</Text>
            <View style={modalStyles.chipRow}>
              {MODE_OPTIONS.map((opt) => {
                const isSelected = mode === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setMode(opt.key)}
                    style={[modalStyles.chip, isSelected && modalStyles.chipSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[
                      modalStyles.chipText,
                      isSelected && { color: colors.primary },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text style={modalStyles.fieldLabel}>
              Description <Text style={{ fontWeight: '400', color: colors.mutedForeground }}>(optional)</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe what you need help with..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={modalStyles.textArea}
              textAlignVertical="top"
              accessibilityLabel="Description"
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={selectedVertical === null}
              style={[
                modalStyles.submitBtn,
                selectedVertical === null && modalStyles.submitBtnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Submit request"
            >
              <Text style={[
                modalStyles.submitBtnText,
                selectedVertical === null && { color: colors.mutedForeground },
              ]}>
                Submit Request
              </Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
  },
  headerSub: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 18,
  },
  fieldLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 10,
    marginTop: 4,
  },
  verticalList: {
    gap: 8,
    marginBottom: 20,
  },
  verticalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  verticalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },
  verticalEmoji: {
    fontSize: 18,
  },
  verticalOptionText: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.foreground,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto' as any,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },
  chipText: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    ...typography.bodySm,
    color: colors.foreground,
    minHeight: 80,
    marginBottom: 20,
    backgroundColor: colors.background,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: colors.border,
  },
  submitBtnText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

// ─── CHW Card ─────────────────────────────────────────────────────────────────

interface CHWCardProps {
  chw: CHWProfile;
  onSchedule: (chw: CHWProfile) => void;
}

function CHWCard({ chw, onSchedule }: CHWCardProps): React.JSX.Element {
  const avatarBg = getAvatarBg(chw.avatar);
  const avatarTextColor = getAvatarTextColor(chw.avatar);

  return (
    <View style={cardStyles.container} accessibilityRole="none">
      <View style={cardStyles.topRow}>
        {/* Avatar */}
        <View style={[cardStyles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[cardStyles.avatarText, { color: avatarTextColor }]}>{chw.avatar}</Text>
        </View>

        <View style={cardStyles.infoCol}>
          {/* Name + availability */}
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name} numberOfLines={1}>{chw.name}</Text>
            {chw.isAvailable ? (
              <View style={cardStyles.availableBadge}>
                <Text style={cardStyles.availableBadgeText}>Available</Text>
              </View>
            ) : (
              <View style={cardStyles.unavailableBadge}>
                <Text style={cardStyles.unavailableBadgeText}>Unavailable</Text>
              </View>
            )}
          </View>

          {/* Rating + experience */}
          <View style={cardStyles.metaRow}>
            <StarDisplay rating={chw.rating} />
            <Text style={cardStyles.expText}>{chw.yearsExperience} yrs exp</Text>
          </View>

          {/* Specialization pills */}
          <View style={cardStyles.pillRow}>
            {chw.specializations.map((v) => (
              <View key={v} style={cardStyles.pill}>
                <Text style={cardStyles.pillText}>{verticalLabels[v]}</Text>
              </View>
            ))}
          </View>

          {/* Languages */}
          <Text style={cardStyles.languages}>
            <Text style={cardStyles.languagesLabel}>Languages: </Text>
            {chw.languages.join(', ')}
          </Text>

          {/* Bio */}
          <Text style={cardStyles.bio} numberOfLines={2}>{chw.bio}</Text>
        </View>
      </View>

      {/* Schedule button */}
      <TouchableOpacity
        onPress={() => onSchedule(chw)}
        style={[cardStyles.scheduleBtn, !chw.isAvailable && cardStyles.scheduleBtnDisabled]}
        disabled={!chw.isAvailable}
        accessibilityRole="button"
        accessibilityLabel={`Schedule a session with ${chw.name}`}
      >
        <Text style={[cardStyles.scheduleBtnText, !chw.isAvailable && { color: colors.mutedForeground }]}>
          {chw.isAvailable ? 'Schedule Session' : 'Not Available'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
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
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.foreground,
    flex: 1,
  },
  availableBadge: {
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  availableBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.secondary,
  },
  unavailableBadge: {
    backgroundColor: `${colors.mutedForeground}15`,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  unavailableBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expText: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pill: {
    backgroundColor: `${colors.secondary}18`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.secondary,
  },
  languages: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  languagesLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  bio: {
    fontSize: 11,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  scheduleBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  scheduleBtnDisabled: {
    backgroundColor: colors.border,
  },
  scheduleBtnText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MemberFindScreen(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [schedulingChw, setSchedulingChw] = useState<CHWProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredChws = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return chwProfiles.filter((chw) => {
      const matchesFilter =
        activeFilter === 'all' || chw.specializations.includes(activeFilter as Vertical);
      if (!matchesFilter) return false;
      if (!query) return true;
      return (
        chw.name.toLowerCase().includes(query) ||
        chw.bio.toLowerCase().includes(query) ||
        chw.specializations.some((s) => verticalLabels[s].toLowerCase().includes(query))
      );
    });
  }, [searchQuery, activeFilter]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSchedule = useCallback((chw: CHWProfile) => {
    setSchedulingChw(chw);
  }, []);

  const handleModalClose = useCallback(() => {
    setSchedulingChw(null);
  }, []);

  const handleModalSubmit = useCallback(
    (chwFirstName: string, _formData: ScheduleFormData) => {
      setSchedulingChw(null);
      showToast(`Request submitted! ${chwFirstName} will be in touch soon.`);
    },
    [showToast],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Toast */}
      {toastMessage ? <ToastBanner message={toastMessage} /> : null}

      {/* Schedule modal */}
      {schedulingChw ? (
        <ScheduleModal
          chw={schedulingChw}
          visible={schedulingChw !== null}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      ) : null}

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Find Your CHW</Text>
        <Text style={styles.pageSub}>Matched to your needs</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Search color={colors.mutedForeground} size={16} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, specialty..."
          placeholderTextColor={colors.mutedForeground}
          style={styles.searchInput}
          clearButtonMode="while-editing"
          accessibilityLabel="Search CHWs"
          returnKeyType="search"
        />
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsContent}
        style={styles.filterTabs}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count =
            tab.key === 'all'
              ? chwProfiles.length
              : chwProfiles.filter((c) => c.specializations.includes(tab.key as Vertical)).length;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
                {count > 0 ? `  ${count}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Map view placeholder */}
      <View style={styles.mapPlaceholder}>
        <Map color={colors.mutedForeground} size={16} />
        <Text style={styles.mapPlaceholderText}>Map view coming soon</Text>
      </View>

      {/* CHW List */}
      <FlatList
        data={filteredChws}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CHWCard chw={item} onSchedule={handleSchedule} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Search color={colors.mutedForeground} size={28} />
            <Text style={styles.emptyTitle}>No CHWs found</Text>
            <Text style={styles.emptySub}>
              Try a different filter or search term.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  pageTitle: {
    ...typography.displaySm,
    color: colors.foreground,
  },
  pageSub: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.foreground,
    padding: 0,
  },
  filterTabs: {
    maxHeight: 40,
    marginBottom: 10,
  },
  filterTabsContent: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mapPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mapPlaceholderText: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  emptyState: {
    paddingTop: 48,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
  },
  emptySub: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
