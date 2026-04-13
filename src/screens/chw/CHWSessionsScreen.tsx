/**
 * CHWSessionsScreen — Session management for CHW users.
 *
 * Features:
 *  - Tab bar: Active (scheduled + in_progress) vs Completed
 *  - Session cards with vertical icon, member name, status badge, date/time, mode
 *  - Active sessions: Start / Complete action buttons
 *  - Completed sessions: duration, units billed, net earnings
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Play,
  CheckCircle,
  Home,
  RefreshCw,
  Utensils,
  Brain,
  Stethoscope,
  Clock,
  DollarSign,
} from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  sessions,
  formatCurrency,
  sessionModeLabels,
  sessionStatusLabels,
  type Session,
  type SessionStatus,
  type Vertical,
} from '../../data/mock';

// ─── Constants ────────────────────────────────────────────────────────────────

const VERTICAL_COLORS: Record<Vertical, string> = {
  housing: '#3B82F6',
  rehab: '#EF4444',
  food: '#F59E0B',
  mental_health: '#8B5CF6',
  healthcare: '#06B6D4',
};

type BillingStatus = 'pending' | 'submitted' | 'approved';

const BILLING_STATUS_COLORS: Record<BillingStatus, string> = {
  pending: colors.compassGold,
  submitted: colors.secondary,
  approved: colors.primary,
};

const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  approved: 'Approved',
};

const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  scheduled: colors.secondary,
  in_progress: colors.compassGold,
  completed: colors.primary,
  cancelled: colors.mutedForeground,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives a mock billing/payout status from the session ID for demo purposes.
 */
function deriveBillingStatus(sessionId: string): BillingStatus {
  const map: Record<string, BillingStatus> = {
    'sess-002': 'submitted',
    'sess-003': 'approved',
    'sess-004': 'approved',
  };
  return map[sessionId] ?? 'pending';
}

function formatScheduledAt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ─── VerticalIcon helper ──────────────────────────────────────────────────────

function VerticalIconComponent({
  vertical,
  size = 20,
}: {
  vertical: Vertical;
  size?: number;
}): React.JSX.Element {
  const iconColor = VERTICAL_COLORS[vertical];
  switch (vertical) {
    case 'housing':
      return <Home size={size} color={iconColor} />;
    case 'rehab':
      return <RefreshCw size={size} color={iconColor} />;
    case 'food':
      return <Utensils size={size} color={iconColor} />;
    case 'mental_health':
      return <Brain size={size} color={iconColor} />;
    case 'healthcare':
      return <Stethoscope size={size} color={iconColor} />;
  }
}

// ─── SessionCard sub-component ────────────────────────────────────────────────

interface SessionCardProps {
  session: Session;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
}

function SessionCard({ session, onStart, onComplete }: SessionCardProps): React.JSX.Element {
  const verticalColor = VERTICAL_COLORS[session.vertical];
  const statusColor = SESSION_STATUS_COLORS[session.status];
  const billingStatus = deriveBillingStatus(session.id);

  const isActive = session.status === 'scheduled' || session.status === 'in_progress';
  const isCompleted = session.status === 'completed';

  return (
    <View style={cardStyles.card}>
      {/* Header */}
      <View style={cardStyles.headerRow}>
        <View style={[cardStyles.iconCircle, { backgroundColor: verticalColor + '18' }]}>
          <VerticalIconComponent vertical={session.vertical} size={20} />
        </View>
        <View style={cardStyles.headerInfo}>
          <View style={cardStyles.badgeRow}>
            <Text style={cardStyles.memberName}>{session.memberName}</Text>
            <View style={[cardStyles.badge, { backgroundColor: statusColor + '18' }]}>
              <Text style={[cardStyles.badgeText, { color: statusColor }]}>
                {sessionStatusLabels[session.status]}
              </Text>
            </View>
          </View>
          <Text style={cardStyles.meta}>
            {formatScheduledAt(session.scheduledAt)}
            {' · '}
            {sessionModeLabels[session.mode]}
          </Text>
        </View>
      </View>

      {/* Completed stats */}
      {isCompleted ? (
        <View style={cardStyles.statsRow}>
          {session.durationMinutes != null ? (
            <View style={cardStyles.statChip}>
              <Clock size={12} color={colors.mutedForeground} />
              <Text style={cardStyles.statChipText}>{session.durationMinutes} min</Text>
            </View>
          ) : null}
          {session.unitsBilled != null ? (
            <View style={cardStyles.statChip}>
              <Text style={cardStyles.statChipText}>{session.unitsBilled} units</Text>
            </View>
          ) : null}
          {session.netAmount != null ? (
            <View style={cardStyles.statChip}>
              <DollarSign size={12} color={colors.primary} />
              <Text style={[cardStyles.statChipText, { color: colors.primary, fontWeight: '700' }]}>
                {formatCurrency(session.netAmount)} net
              </Text>
            </View>
          ) : null}
          <View
            style={[cardStyles.badge, { backgroundColor: BILLING_STATUS_COLORS[billingStatus] + '18' }]}
          >
            <Text style={[cardStyles.badgeText, { color: BILLING_STATUS_COLORS[billingStatus] }]}>
              {BILLING_STATUS_LABELS[billingStatus]}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Active action buttons */}
      {isActive ? (
        <View style={cardStyles.actionRow}>
          {session.status === 'scheduled' && onStart ? (
            <TouchableOpacity
              style={cardStyles.startButton}
              onPress={() => onStart(session.id)}
              accessibilityLabel={`Start session with ${session.memberName}`}
              accessibilityRole="button"
            >
              <Play size={14} color="#FFFFFF" />
              <Text style={cardStyles.startButtonText}>Start Session</Text>
            </TouchableOpacity>
          ) : null}
          {session.status === 'in_progress' && onComplete ? (
            <TouchableOpacity
              style={cardStyles.completeButton}
              onPress={() => onComplete(session.id)}
              accessibilityLabel={`Complete session with ${session.memberName}`}
              accessibilityRole="button"
            >
              <CheckCircle size={14} color={colors.primary} />
              <Text style={cardStyles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberName: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
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
  meta: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statChipText: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
  },
  startButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
  },
  completeButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.primary,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

type SessionTab = 'active' | 'completed';

/**
 * CHW Sessions screen — lists active and completed sessions with action controls.
 */
export function CHWSessionsScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SessionTab>('active');

  // Optimistic status overrides: sessionId → new status
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, SessionStatus>
  >({});

  const allSessions = useMemo<Session[]>(
    () =>
      sessions.map((s) =>
        statusOverrides[s.id]
          ? { ...s, status: statusOverrides[s.id] }
          : s,
      ),
    [statusOverrides],
  );

  const activeSessions = useMemo<Session[]>(
    () =>
      allSessions.filter(
        (s) => s.status === 'scheduled' || s.status === 'in_progress',
      ),
    [allSessions],
  );

  const completedSessions = useMemo<Session[]>(
    () => allSessions.filter((s) => s.status === 'completed'),
    [allSessions],
  );

  const displayedSessions = activeTab === 'active' ? activeSessions : completedSessions;

  const handleStart = useCallback((id: string) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: 'in_progress' }));
  }, []);

  const handleComplete = useCallback((id: string) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: 'completed' }));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Page header */}
      <View style={styles.headerBlock}>
        <Text style={styles.pageTitle}>Sessions</Text>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {(['active', 'completed'] as SessionTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === 'active' ? activeSessions.length : completedSessions.length;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab === 'active' ? 'Active' : 'Completed'}
                  {count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Session list */}
      {displayedSessions.length > 0 ? (
        <FlatList
          data={displayedSessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onStart={activeTab === 'active' ? handleStart : undefined}
              onComplete={activeTab === 'active' ? handleComplete : undefined}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <CheckCircle size={24} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'active' ? 'No active sessions' : 'No completed sessions yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'active'
              ? 'Accept a request to start a session.'
              : 'Completed sessions will appear here.'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: colors.background,
  },
  pageTitle: {
    ...typography.displaySm,
    color: colors.foreground,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.foreground,
  },
  emptySubtext: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    textAlign: 'center',
    maxWidth: 280,
  },
});
