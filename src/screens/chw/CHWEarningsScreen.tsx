/**
 * CHWEarningsScreen — Money dashboard for CHW users.
 *
 * Sections:
 *  1. Three stat cards: This Week, This Month, All Time
 *  2. View-based weekly bar chart (no charting library dependency)
 *  3. Recent payouts list with payout status badges
 *  4. Medi-Cal rate / payout schedule note
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Banknote,
  Home,
  RefreshCw,
  Utensils,
  Brain,
  Stethoscope,
} from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  earningsSummary,
  sessions,
  formatCurrency,
  sessionModeLabels,
  type Session,
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

type PayoutStatus = 'pending' | 'submitted' | 'approved';

const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  pending: colors.compassGold,
  submitted: colors.secondary,
  approved: colors.primary,
};

const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  approved: 'Approved',
};

/**
 * Mock weekly bar chart data derived from completed sessions.
 */
const WEEKLY_DATA = [
  { day: 'Mon', amount: 90.64 },
  { day: 'Tue', amount: 0 },
  { day: 'Wed', amount: 45.32 },
  { day: 'Thu', amount: 67.98 },
  { day: 'Fri', amount: 0 },
  { day: 'Sat', amount: 0 },
  { day: 'Sun', amount: 0 },
];

/**
 * Derives a mock payout status from session ID for demo purposes.
 */
function derivePayoutStatus(sessionId: string): PayoutStatus {
  const map: Record<string, PayoutStatus> = {
    'sess-002': 'submitted',
    'sess-003': 'approved',
    'sess-004': 'approved',
  };
  return map[sessionId] ?? 'pending';
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ─── VerticalIcon helper ──────────────────────────────────────────────────────

function VerticalIconComponent({
  vertical,
  size = 16,
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

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * CHW Earnings screen — tracks Medi-Cal reimbursements and payout history.
 */
export function CHWEarningsScreen(): React.JSX.Element {
  const completedSessions = useMemo<Session[]>(
    () => sessions.filter((s) => s.status === 'completed'),
    [],
  );

  const maxBarAmount = useMemo(
    () => Math.max(...WEEKLY_DATA.map((d) => d.amount), 1),
    [],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Earnings & Payouts</Text>
          <Text style={styles.pageSubtitle}>
            Track your Medi-Cal reimbursements and payout history.
          </Text>
        </View>

        {/* ── Stat cards ── */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.primary + '18' }]}>
              <DollarSign size={18} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(earningsSummary.thisWeek)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statSubtext}>
              {earningsSummary.sessionsThisWeek} sessions
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.secondary + '18' }]}>
              <TrendingUp size={18} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(earningsSummary.thisMonth)}</Text>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statSubtext}>+8% vs last month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.compassGold + '18' }]}>
              <CalendarCheck size={18} color={colors.compassGold} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(earningsSummary.allTime)}</Text>
            <Text style={styles.statLabel}>All Time</Text>
            <Text style={styles.statSubtext}>
              {earningsSummary.avgRating.toFixed(1)} avg rating
            </Text>
          </View>
        </View>

        {/* ── Weekly bar chart ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
          <View style={styles.barChartContainer}>
            {WEEKLY_DATA.map((d) => {
              const heightPct = d.amount > 0 ? Math.max((d.amount / maxBarAmount) * 100, 6) : 6;
              const hasAmount = d.amount > 0;
              return (
                <View key={d.day} style={styles.barColumn}>
                  <Text style={styles.barAmountLabel}>
                    {hasAmount ? formatCurrency(d.amount) : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%` as `${number}%`,
                          backgroundColor: hasAmount ? colors.primary : colors.primary + '28',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barDayLabel}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Recent payouts ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Payouts</Text>
          {completedSessions.length === 0 ? (
            <View style={styles.emptyPayouts}>
              <DollarSign size={22} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No payouts yet</Text>
              <Text style={styles.emptySubtext}>Complete sessions to start earning.</Text>
            </View>
          ) : (
            completedSessions.map((session, index) => {
              const payoutStatus = derivePayoutStatus(session.id);
              const statusColor = PAYOUT_STATUS_COLORS[payoutStatus];
              return (
                <View key={session.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <View style={styles.payoutRow}>
                    <View
                      style={[
                        styles.payoutIconCircle,
                        { backgroundColor: VERTICAL_COLORS[session.vertical] + '18' },
                      ]}
                    >
                      <VerticalIconComponent vertical={session.vertical} size={16} />
                    </View>
                    <View style={styles.payoutInfo}>
                      <Text style={styles.payoutMemberName} numberOfLines={1}>
                        {session.memberName}
                      </Text>
                      <Text style={styles.payoutMeta}>
                        {formatShortDate(session.scheduledAt)}
                        {session.unitsBilled != null
                          ? ` · ${session.unitsBilled} ${session.unitsBilled === 1 ? 'unit' : 'units'}`
                          : ''}
                        {' · '}
                        {sessionModeLabels[session.mode]}
                      </Text>
                    </View>
                    <View style={styles.payoutRight}>
                      <Text style={styles.payoutAmount}>
                        {formatCurrency(session.netAmount ?? 0)}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: statusColor + '18' }]}>
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                          {PAYOUT_STATUS_LABELS[payoutStatus]}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── Payout schedule note ── */}
        <View style={styles.noteCard}>
          <View style={[styles.noteIconCircle, { backgroundColor: colors.primary + '18' }]}>
            <Banknote size={18} color={colors.primary} />
          </View>
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>Payout schedule: </Text>
            Payouts are processed weekly via direct deposit, every Friday for the prior week's
            approved sessions.
          </Text>
        </View>

        {/* Medi-Cal rate footnote */}
        <Text style={styles.footnote}>
          Rate: $26.66/unit (15 min) · 85% CHW net payout after platform fees.
        </Text>
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
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    ...typography.displaySm,
    color: colors.foreground,
  },
  pageSubtitle: {
    ...typography.bodyMd,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    ...typography.displaySm,
    color: colors.foreground,
    fontSize: 18,
  },
  statLabel: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  statSubtext: {
    ...typography.label,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.bodyLg,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 16,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 6,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barAmountLabel: {
    fontSize: 8,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 12,
    minHeight: 12,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    minHeight: 6,
  },
  barDayLabel: {
    fontSize: 10,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payoutIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  payoutInfo: {
    flex: 1,
    gap: 2,
  },
  payoutMemberName: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.foreground,
  },
  payoutMeta: {
    ...typography.bodySm,
    color: colors.mutedForeground,
  },
  payoutRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  payoutAmount: {
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
  emptyPayouts: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
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
  },
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  noteIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noteText: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    flex: 1,
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '700',
    color: colors.foreground,
  },
  footnote: {
    ...typography.label,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
