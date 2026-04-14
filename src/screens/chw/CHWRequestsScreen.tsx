/**
 * CHWRequestsScreen — Inbox for incoming community member service requests.
 *
 * Features:
 *  - Horizontal scrollable filter tabs by vertical category
 *  - Request cards with vertical badge, urgency badge, earnings estimate
 *  - Accept / Pass actions (optimistic dismiss)
 *  - Empty state when no requests match the active filter
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle,
  XCircle,
  Inbox,
  Home,
  Utensils,
  Brain,
  RefreshCw,
  Stethoscope,
  Bell,
  ThumbsDown,
} from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  serviceRequests,
  formatCurrency,
  MEDI_CAL_RATE,
  NET_PAYOUT_RATE,
  type ServiceRequest,
  type Vertical,
} from '../../data/mock';

// ─── Constants ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | Vertical;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'housing', label: 'Housing' },
  { key: 'food', label: 'Food' },
  { key: 'mental_health', label: 'Mental Health' },
  { key: 'rehab', label: 'Rehab' },
  { key: 'healthcare', label: 'Healthcare' },
];

const VERTICAL_COLORS: Record<Vertical, string> = {
  housing: '#3B82F6',
  rehab: '#EF4444',
  food: '#F59E0B',
  mental_health: '#8B5CF6',
  healthcare: '#06B6D4',
};

const VERTICAL_LABELS: Record<Vertical, string> = {
  housing: 'Housing',
  rehab: 'Rehab & Recovery',
  food: 'Food Security',
  mental_health: 'Mental Health',
  healthcare: 'Healthcare',
};

const URGENCY_COLORS: Record<string, string> = {
  routine: colors.secondary,
  soon: colors.compassGold,
  urgent: colors.destructive,
};

const URGENCY_LABELS: Record<string, string> = {
  routine: 'Routine',
  soon: 'Soon',
  urgent: 'Urgent',
};

const SESSION_MODE_LABELS: Record<string, string> = {
  in_person: 'In Person',
  virtual: 'Video Call',
  phone: 'Phone',
};

// ─── VerticalIcon helper ──────────────────────────────────────────────────────

function VerticalIconComponent({
  vertical,
  size = 18,
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

// ─── RequestCard sub-component ────────────────────────────────────────────────

interface RequestCardProps {
  request: ServiceRequest;
  onAccept: (id: string) => void;
  onPass: (id: string) => void;
}

function RequestCard({ request, onAccept, onPass }: RequestCardProps): React.JSX.Element {
  const grossEarnings = request.estimatedUnits * MEDI_CAL_RATE;
  const netEarnings = parseFloat((grossEarnings * NET_PAYOUT_RATE).toFixed(2));
  const verticalColor = VERTICAL_COLORS[request.vertical];

  return (
    <View style={cardStyles.card}>
      {/* Header row */}
      <View style={cardStyles.headerRow}>
        <View style={[cardStyles.iconCircle, { backgroundColor: verticalColor + '18' }]}>
          <VerticalIconComponent vertical={request.vertical} size={18} />
        </View>
        <View style={cardStyles.headerContent}>
          <View style={cardStyles.badgeRow}>
            <Text style={cardStyles.memberName}>{request.memberName}</Text>
            <View style={[cardStyles.badge, { backgroundColor: verticalColor + '18' }]}>
              <Text style={[cardStyles.badgeText, { color: verticalColor }]}>
                {VERTICAL_LABELS[request.vertical]}
              </Text>
            </View>
            <View
              style={[
                cardStyles.badge,
                { backgroundColor: URGENCY_COLORS[request.urgency] + '18' },
              ]}
            >
              <Text
                style={[cardStyles.badgeText, { color: URGENCY_COLORS[request.urgency] }]}
              >
                {URGENCY_LABELS[request.urgency]}
              </Text>
            </View>
          </View>
          <Text style={cardStyles.modeLabel}>
            {SESSION_MODE_LABELS[request.preferredMode] ?? request.preferredMode}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text style={cardStyles.description} numberOfLines={3}>
        {request.description}
      </Text>

      {/* Earnings row */}
      <View style={cardStyles.earningsRow}>
        <Text style={cardStyles.earningsUnits}>
          ~{request.estimatedUnits} {request.estimatedUnits === 1 ? 'unit' : 'units'}
        </Text>
        <Text style={cardStyles.dot}> · </Text>
        <Text style={cardStyles.earningsGross}>{formatCurrency(grossEarnings)} gross</Text>
        <Text style={cardStyles.dot}> · </Text>
        <Text style={cardStyles.earningsNet}>{formatCurrency(netEarnings)} net</Text>
      </View>

      {/* Action buttons */}
      <View style={cardStyles.actionRow}>
        <TouchableOpacity
          style={cardStyles.acceptButton}
          onPress={() => onAccept(request.id)}
          accessibilityLabel={`Accept request from ${request.memberName}`}
          accessibilityRole="button"
        >
          <CheckCircle size={15} color="#FFFFFF" />
          <Text style={cardStyles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cardStyles.passButton}
          onPress={() => onPass(request.id)}
          accessibilityLabel={`Pass on request from ${request.memberName}`}
          accessibilityRole="button"
        >
          <XCircle size={15} color={colors.mutedForeground} />
          <Text style={cardStyles.passButtonText}>Pass</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
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
  modeLabel: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  description: {
    ...typography.bodySm,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginBottom: 10,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  earningsUnits: {
    ...typography.label,
    fontWeight: '600',
    color: colors.primary,
  },
  dot: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  earningsGross: {
    ...typography.label,
    color: colors.mutedForeground,
  },
  earningsNet: {
    ...typography.label,
    fontWeight: '700',
    color: colors.foreground,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  acceptButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 12,
  },
  passButtonText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.mutedForeground,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * CHW Requests screen — displays open service requests with filter tabs
 * and a summary stat row showing new / accepted / passed counts.
 */
export function CHWRequestsScreen(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Track accepted vs passed IDs separately for summary stats
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());

  const dismissedIds = useMemo(
    () => new Set([...acceptedIds, ...passedIds]),
    [acceptedIds, passedIds],
  );

  const allOpenRequests = useMemo<ServiceRequest[]>(
    () => serviceRequests.filter((r) => r.status === 'open' && !dismissedIds.has(r.id)),
    [dismissedIds],
  );

  const filteredRequests = useMemo<ServiceRequest[]>(
    () =>
      activeFilter === 'all'
        ? allOpenRequests
        : allOpenRequests.filter((r) => r.vertical === activeFilter),
    [activeFilter, allOpenRequests],
  );

  const handleAccept = useCallback((id: string) => {
    setAcceptedIds((prev) => new Set([...prev, id]));
  }, []);

  const handlePass = useCallback((id: string) => {
    setPassedIds((prev) => new Set([...prev, id]));
  }, []);

  const tabCount = useCallback(
    (key: FilterTab): number => {
      if (key === 'all') return allOpenRequests.length;
      return allOpenRequests.filter((r) => r.vertical === key).length;
    },
    [allOpenRequests],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Page header — fixed above scroll */}
      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Open Requests</Text>
          {allOpenRequests.length > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{allOpenRequests.length}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Summary stat row ── */}
        <View style={styles.statSummaryRow}>
          <View style={[styles.statSummaryCard, { borderColor: colors.compassGold + '50' }]}>
            <View style={[styles.statSummaryIcon, { backgroundColor: colors.compassGold + '18' }]}>
              <Bell size={14} color={colors.compassGold} />
            </View>
            <Text style={styles.statSummaryValue}>{allOpenRequests.length}</Text>
            <Text style={styles.statSummaryLabel}>New</Text>
          </View>
          <View style={[styles.statSummaryCard, { borderColor: colors.secondary + '50' }]}>
            <View style={[styles.statSummaryIcon, { backgroundColor: colors.secondary + '18' }]}>
              <CheckCircle size={14} color={colors.secondary} />
            </View>
            <Text style={styles.statSummaryValue}>{acceptedIds.size}</Text>
            <Text style={styles.statSummaryLabel}>Accepted</Text>
          </View>
          <View style={[styles.statSummaryCard, { borderColor: colors.destructive + '40' }]}>
            <View style={[styles.statSummaryIcon, { backgroundColor: colors.destructive + '18' }]}>
              <ThumbsDown size={14} color={colors.destructive} />
            </View>
            <Text style={styles.statSummaryValue}>{passedIds.size}</Text>
            <Text style={styles.statSummaryLabel}>Passed</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count = tabCount(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveFilter(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                  {count > 0 ? ` ${count}` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Request list */}
      {filteredRequests.length > 0 ? (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard request={item} onAccept={handleAccept} onPass={handlePass} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Text style={styles.footnote}>
              Earnings based on $26.66/unit Medi-Cal rate · 85% CHW net payout.
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Inbox size={24} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>No open requests</Text>
          <Text style={styles.emptySubtext}>
            {activeFilter === 'all'
              ? 'No open requests right now. Check back soon!'
              : 'No open requests in this category. Check back soon!'}
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
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  pageTitle: {
    ...typography.displaySm,
    color: colors.foreground,
  },
  countBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Summary stat row
  statSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statSummaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statSummaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statSummaryValue: {
    ...typography.displaySm,
    fontSize: 20,
    color: colors.foreground,
    lineHeight: 24,
  },
  statSummaryLabel: {
    ...typography.label,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
  },

  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
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
  footnote: {
    ...typography.label,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
    paddingBottom: 8,
  },
});
