/**
 * MemberHomeScreen — Landing page for community members.
 *
 * Shows:
 * - Personalised greeting using auth userName
 * - Stat cards: Rewards points, Upcoming Sessions, Active Goals
 * - My Goals section with goal cards or empty state
 * - CTA card to find a CHW
 * - Upcoming sessions list
 */

import React, { useCallback } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  CalendarCheck,
  Gift,
  Map,
} from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  goals,
  memberProfiles,
  sessions,
  verticalLabels,
  type Goal,
  type Session,
  type Vertical,
} from '../../data/mock';
import type { MemberTabParamList } from '../../navigation/MemberTabNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberHomeScreenProps {
  navigation: BottomTabNavigationProp<MemberTabParamList, 'Home'>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Mock member context — in production this comes from auth/API. */
const MOCK_MEMBER = memberProfiles[0];

const MOCK_MEMBER_NAME = MOCK_MEMBER.name;

const verticalEmoji: Record<Vertical, string> = {
  housing: '🏠',
  rehab: '💪',
  food: '🛒',
  mental_health: '🧠',
  healthcare: '🏥',
};

const statusColorMap: Record<string, string> = {
  on_track: colors.secondary,
  almost_done: colors.compassGold,
  completed: colors.primary,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatScheduledDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusLabel(status: string): string {
  switch (status) {
    case 'on_track': return 'On track';
    case 'almost_done': return 'Almost done';
    case 'completed': return 'Completed';
    default: return status;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  iconBg: string;
}

function StatCard({ icon, label, value, subtext, iconBg }: StatCardProps): React.JSX.Element {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtext ? (
        <Text style={styles.statSubtext}>{subtext}</Text>
      ) : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface GoalCardProps {
  goal: Goal;
}

function GoalCard({ goal }: GoalCardProps): React.JSX.Element {
  const statusColor = statusColorMap[goal.status] ?? colors.mutedForeground;

  return (
    <View style={styles.goalCard} accessibilityRole="none">
      <View style={styles.goalCardRow}>
        <Text style={styles.goalEmoji} accessibilityElementsHidden>{goal.emoji}</Text>
        <View style={styles.goalCardContent}>
          <View style={styles.goalCardHeader}>
            <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
            <View style={[styles.verticalBadge, { backgroundColor: `${colors.secondary}20` }]}>
              <Text style={[styles.verticalBadgeText, { color: colors.secondary }]}>
                {verticalLabels[goal.category]}
              </Text>
            </View>
          </View>
          <Text style={styles.goalMeta}>
            {goal.sessionsCompleted > 0
              ? `${goal.sessionsCompleted} session${goal.sessionsCompleted !== 1 ? 's' : ''} completed · `
              : 'Just getting started · '}
            <Text style={[styles.goalStatus, { color: statusColor }]}>
              {statusLabel(goal.status)}
            </Text>
          </Text>
          {/* Progress bar */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPct}>{goal.progress}%</Text>
          </View>
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: goal.progress }}
            accessibilityLabel={`${goal.title} progress: ${goal.progress}%`}
          >
            <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

interface UpcomingSessionRowProps {
  session: Session;
}

function UpcomingSessionRow({ session }: UpcomingSessionRowProps): React.JSX.Element {
  const emoji = verticalEmoji[session.vertical];
  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionIconContainer}>
        <Text style={styles.sessionEmoji} accessibilityElementsHidden>{emoji}</Text>
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionChwName} numberOfLines={1}>{session.chwName}</Text>
        <Text style={styles.sessionDate}>{formatScheduledDate(session.scheduledAt)}</Text>
      </View>
      <View style={styles.scheduledBadge}>
        <Text style={styles.scheduledBadgeText}>Scheduled</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MemberHomeScreen({ navigation }: MemberHomeScreenProps): React.JSX.Element {
  const { userName } = useAuth();
  const firstName = (userName ?? MOCK_MEMBER_NAME).split(' ')[0];

  const memberSessions = sessions.filter(
    (s) => s.memberName === MOCK_MEMBER_NAME,
  );
  const upcomingSessions = memberSessions.filter((s) => s.status === 'scheduled');
  const activeGoals = goals;

  const handleFindCHW = useCallback(() => {
    navigation.navigate('FindCHW');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.greetingAccent}>{firstName}</Text>
          </Text>
          <Text style={styles.greetingSub}>
            Let's keep making progress on your health goals today.
          </Text>
        </View>

        {/* Stat cards */}
        <View style={styles.statRow}>
          <StatCard
            icon={<Gift color={colors.primary} size={18} />}
            label="Rewards"
            value={MOCK_MEMBER.rewardsBalance}
            subtext="pts"
            iconBg={`${colors.primary}15`}
          />
          <StatCard
            icon={<CalendarCheck color={colors.secondary} size={18} />}
            label="Upcoming"
            value={upcomingSessions.length}
            subtext="Sessions"
            iconBg={`${colors.secondary}15`}
          />
          <StatCard
            icon={<Map color={colors.primary} size={18} />}
            label="Goals"
            value={activeGoals.length}
            subtext="Active"
            iconBg={`${colors.primary}15`}
          />
        </View>

        {/* My Goals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My Goals</Text>
            <Pressable
              onPress={() => navigation.navigate('Roadmap')}
              accessibilityRole="button"
              accessibilityLabel="View full roadmap"
              hitSlop={8}
            >
              <View style={styles.linkRow}>
                <Text style={styles.linkText}>Full roadmap</Text>
                <ArrowRight color={colors.primary} size={13} />
              </View>
            </Pressable>
          </View>

          {activeGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <Map color={colors.mutedForeground} size={24} />
              <Text style={styles.emptyStateTitle}>No goals yet</Text>
              <Text style={styles.emptyStateSub}>
                Work with a CHW to set personalized health goals.
              </Text>
            </View>
          ) : (
            <View style={styles.goalList}>
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </View>
          )}
        </View>

        {/* CTA to find CHW */}
        <Pressable
          onPress={handleFindCHW}
          style={({ pressed }) => [styles.ctaCard, pressed && styles.ctaCardPressed]}
          accessibilityRole="button"
          accessibilityLabel="Find a Community Health Worker"
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Need help with a new goal?</Text>
            <Text style={styles.ctaSub}>Find a Community Health Worker near you.</Text>
          </View>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Find CHW</Text>
            <ArrowRight color={colors.primary} size={13} />
          </View>
        </Pressable>

        {/* Upcoming sessions */}
        {upcomingSessions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Upcoming Sessions</Text>
            </View>
            {upcomingSessions.map((session, idx) => (
              <React.Fragment key={session.id}>
                <UpcomingSessionRow session={session} />
                {idx < upcomingSessions.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
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
    paddingTop: 20,
  },

  // Greeting
  greetingSection: {
    marginBottom: 20,
  },
  greeting: {
    ...typography.displaySm,
    color: colors.foreground,
  },
  greetingAccent: {
    color: colors.secondary,
  },
  greetingSub: {
    ...typography.bodyMd,
    color: colors.mutedForeground,
    marginTop: 4,
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    ...typography.displaySm,
    color: colors.foreground,
    lineHeight: 28,
  },
  statSubtext: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
  },
  statLabel: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
  },

  // Card
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    ...typography.bodyLg,
    fontWeight: '700',
    color: colors.foreground,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  linkText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },

  // Goals
  goalList: {
    padding: 12,
    gap: 10,
  },
  goalCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalCardRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  goalEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  goalCardContent: {
    flex: 1,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  goalTitle: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.foreground,
    flex: 1,
  },
  verticalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  verticalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  goalMeta: {
    ...typography.label,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  goalStatus: {
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.foreground,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  // Empty state
  emptyState: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
  },
  emptyStateSub: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    textAlign: 'center',
  },

  // CTA card
  ctaCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  ctaCardPressed: {
    opacity: 0.9,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaSub: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ctaButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },

  // Sessions
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  sessionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionEmoji: {
    fontSize: 18,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionChwName: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.foreground,
  },
  sessionDate: {
    ...typography.label,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  scheduledBadge: {
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  scheduledBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },

  bottomPadding: {
    height: 24,
  },
});
