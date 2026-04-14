/**
 * LandingScreen — React Native replica of the CompassCHW Lovable web landing page.
 *
 * Sections (top to bottom):
 *   1. Sticky Navbar  — logo + "Join Waitlist" CTA
 *   2. CHW/Member toggle pill
 *   3. Hero section   — content swaps based on active tab
 *   4. Services section — horizontal scroll of 5 service cards + 2×2 stats grid
 *   5. How It Works   — 3-step dark green section
 *   6. Footer         — link columns + copyright
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  Shield,
  CheckCircle,
  DollarSign,
  Heart,
  Users,
  Clock,
  Home,
  Pill,
  Apple,
  Brain,
  HeartPulse,
  Briefcase,
  ArrowRight,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radii } from '../theme/spacing';
import type { AuthStackParamList } from '../navigation/AppNavigator';

// ─── Asset ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-var-requires
const compassIcon = require('../../assets/compass-icon.png') as number;

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'chw' | 'member';

type LandingNavProp = NativeStackNavigationProp<AuthStackParamList>;

// ─── Static data ──────────────────────────────────────────────────────────────

interface TrustBadge {
  icon: React.FC<{ size: number; color: string }>;
  label: string;
}

interface HeroContent {
  headline: string;
  headlineAccent: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonRoute: keyof AuthStackParamList;
  secondaryButtonLabel: string;
  badges: TrustBadge[];
}

const CHW_HERO: HeroContent = {
  headline: 'Your CHW career, ',
  headlineAccent: 'on your terms.',
  description:
    'Connect with community members in your area, earn $32+/hour through Medi-Cal reimbursement, and set a schedule that works for your life.',
  primaryButtonLabel: 'Start Earning as a CHW',
  primaryButtonRoute: 'Login',
  secondaryButtonLabel: 'I Need Help',
  badges: [
    { icon: Shield, label: 'HIPAA Compliant' },
    { icon: DollarSign, label: 'Medi-Cal Reimbursed' },
    { icon: Clock, label: 'Flexible Schedule' },
  ],
};

const MEMBER_HERO: HeroContent = {
  headline: 'Get the help you need, ',
  headlineAccent: 'at no cost.',
  description:
    'Get matched with a Community Health Worker in your neighborhood who speaks your language and understands your needs — completely free.',
  primaryButtonLabel: 'Get Matched with a CHW',
  primaryButtonRoute: 'Waitlist',
  secondaryButtonLabel: 'Learn More',
  badges: [
    { icon: CheckCircle, label: '100% Free' },
    { icon: Users, label: 'Bilingual CHWs' },
    { icon: Heart, label: 'Same-Week Matching' },
  ],
};

// ─── Service cards data ───────────────────────────────────────────────────────

interface ServiceCard {
  icon: React.FC<{ size: number; color: string }>;
  title: string;
  description: string;
}

const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: Home,
    title: 'Housing',
    description: 'Connecting residents with stable housing resources and emergency support.',
  },
  {
    icon: Pill,
    title: 'Rehab & Recovery',
    description: 'Supporting those on the path to recovery with compassionate, local guidance.',
  },
  {
    icon: Apple,
    title: 'Food & Pantry',
    description: 'Linking families to food banks, SNAP benefits, and nutrition programs.',
  },
  {
    icon: Brain,
    title: 'Mental Health',
    description: 'Navigating mental health services, crisis support, and therapy referrals.',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare',
    description: 'Helping members access Medi-Cal, preventive care, and specialist visits.',
  },
];

// ─── Stats data ───────────────────────────────────────────────────────────────

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: '81%', label: 'of CHWs report improved member outcomes' },
  { value: '5', label: 'service areas covered across Los Angeles' },
  { value: '$32', label: 'average hourly earnings per CHW' },
  { value: '$0', label: 'cost to community members' },
];

// ─── How-It-Works steps ───────────────────────────────────────────────────────

interface Step {
  icon: React.FC<{ size: number; color: string }>;
  title: string;
  description: string;
}

const HOW_IT_WORKS: Step[] = [
  {
    icon: Briefcase,
    title: 'Sign up',
    description: 'Create your account in minutes. Tell us about your certifications and availability.',
  },
  {
    icon: Users,
    title: 'Get matched',
    description: 'Our platform connects you with community members who need your specific expertise.',
  },
  {
    icon: DollarSign,
    title: 'Get paid',
    description: 'Track your hours and receive Medi-Cal reimbursement payments directly to your account.',
  },
];

// ─── Footer link columns data ─────────────────────────────────────────────────

interface FooterColumn {
  heading: string;
  links: string[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'For CHWs',
    links: ['How It Works', 'Earnings Calculator', 'Training Resources', 'Join Waitlist'],
  },
  {
    heading: 'Company',
    links: ['About Us', 'Blog', 'Careers', 'Contact'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'HIPAA Notice'],
  },
];

// ─── Pulsing dot ──────────────────────────────────────────────────────────────

/**
 * Renders a pulsing green dot to indicate active/live status in the badge.
 * Uses a simple opacity animation since react-native-reanimated may not be
 * needed for this effect and we want zero extra imports.
 */
function PulsingDot(): React.JSX.Element {
  const opacity = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={[pulseDotStyles.dot, { opacity }]} />
  );
}

const pulseDotStyles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Full-page marketing landing screen.
 * Navigation is only used for the CTA buttons; all other interactions are
 * local scroll-based or linking (e.g., footer links).
 */
export function LandingScreen(): React.JSX.Element {
  const navigation = useNavigation<LandingNavProp>();
  const [activeTab, setActiveTab] = useState<ActiveTab>('chw');

  const heroContent = activeTab === 'chw' ? CHW_HERO : MEMBER_HERO;

  const handlePrimaryPress = useCallback((): void => {
    navigation.navigate(heroContent.primaryButtonRoute);
  }, [navigation, heroContent.primaryButtonRoute]);

  const handleWaitlistPress = useCallback((): void => {
    navigation.navigate('Waitlist');
  }, [navigation]);

  const handleSecondaryPress = useCallback((): void => {
    // "I Need Help" routes to waitlist; "Learn More" stays on screen.
    if (activeTab === 'chw') {
      navigation.navigate('Waitlist');
    }
  }, [navigation, activeTab]);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>

      {/* ── Sticky navbar ───────────────────────────────────────────────── */}
      <View style={s.navbar}>
        <View style={s.navbarLeft}>
          <Image source={compassIcon} style={s.navLogo} accessibilityIgnoresInvertColors />
          <Text style={s.navWordmark}>
            Compass<Text style={s.navWordmarkAccent}>CHW</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={s.navJoinButton}
          onPress={handleWaitlistPress}
          activeOpacity={0.82}
          accessibilityLabel="Join waitlist"
          accessibilityRole="button"
        >
          <Text style={s.navJoinButtonText}>Join Waitlist</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── CHW / Member toggle ─────────────────────────────────────────── */}
        <View style={s.toggleContainer}>
          <View style={s.togglePill}>
            <Pressable
              style={[s.toggleTab, activeTab === 'chw' && s.toggleTabActive]}
              onPress={() => setActiveTab('chw')}
              accessibilityRole="button"
              accessibilityLabel="I'm a CHW"
              accessibilityState={{ selected: activeTab === 'chw' }}
            >
              <Text style={[s.toggleTabText, activeTab === 'chw' && s.toggleTabTextActive]}>
                I'm a CHW
              </Text>
            </Pressable>
            <Pressable
              style={[s.toggleTab, activeTab === 'member' && s.toggleTabActive]}
              onPress={() => setActiveTab('member')}
              accessibilityRole="button"
              accessibilityLabel="I'm a Community Member"
              accessibilityState={{ selected: activeTab === 'member' }}
            >
              <Text style={[s.toggleTabText, activeTab === 'member' && s.toggleTabTextActive]}>
                I'm a Community Member
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Hero section ────────────────────────────────────────────────── */}
        <View style={s.heroSection}>

          {/* Launch badge */}
          <View style={s.heroBadge}>
            <PulsingDot />
            <Text style={s.heroBadgeText}>Launching in Los Angeles</Text>
          </View>

          {/* Headline */}
          <Text style={s.heroHeadline}>
            {heroContent.headline}
            <Text style={s.heroHeadlineAccent}>{heroContent.headlineAccent}</Text>
          </Text>

          {/* Description */}
          <Text style={s.heroDescription}>{heroContent.description}</Text>

          {/* CTA buttons */}
          <View style={s.heroButtonsRow}>
            <TouchableOpacity
              style={s.heroPrimaryButton}
              onPress={handlePrimaryPress}
              activeOpacity={0.85}
              accessibilityLabel={heroContent.primaryButtonLabel}
              accessibilityRole="button"
            >
              <Text style={s.heroPrimaryButtonText}>{heroContent.primaryButtonLabel}</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={s.heroSecondaryButton}
              onPress={handleSecondaryPress}
              activeOpacity={0.75}
              accessibilityLabel={heroContent.secondaryButtonLabel}
              accessibilityRole="button"
            >
              <Text style={s.heroSecondaryButtonText}>{heroContent.secondaryButtonLabel}</Text>
            </TouchableOpacity>
          </View>

          {/* Trust badges */}
          <View style={s.trustBadgesRow}>
            {heroContent.badges.map((badge) => (
              <View key={badge.label} style={s.trustBadge}>
                <badge.icon size={13} color={colors.secondary} />
                <Text style={s.trustBadgeText}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Services section ────────────────────────────────────────────── */}
        <View style={s.servicesSection}>
          <Text style={s.sectionEyebrow}>SERVICE AREAS</Text>
          <Text style={s.sectionHeading}>Where CHWs make an impact</Text>

          {/* Horizontal scrolling service cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.serviceCardsScroll}
            decelerationRate="fast"
            snapToInterval={SERVICE_CARD_WIDTH + spacing.md}
            snapToAlignment="start"
          >
            {SERVICE_CARDS.map((card) => (
              <View key={card.title} style={s.serviceCard}>
                <View style={s.serviceCardIconWrap}>
                  <card.icon size={22} color={colors.primary} />
                </View>
                <Text style={s.serviceCardTitle}>{card.title}</Text>
                <Text style={s.serviceCardDescription}>{card.description}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Stats bar — 2×2 grid on mobile */}
          <View style={s.statsGrid}>
            {STATS.map((stat) => (
              <View key={stat.value} style={s.statCell}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── How It Works ────────────────────────────────────────────────── */}
        <View style={s.howItWorksSection}>
          <Text style={s.howItWorksSectionEyebrow}>HOW IT WORKS</Text>
          <Text style={s.howItWorksSectionHeading}>Three steps to start earning</Text>

          <View style={s.stepsContainer}>
            {HOW_IT_WORKS.map((step, index) => (
              <View key={step.title} style={s.stepRow}>
                <View style={s.stepIconCircle}>
                  <step.icon size={20} color={colors.compassDark} />
                </View>
                <View style={s.stepTextBlock}>
                  <View style={s.stepNumberRow}>
                    <Text style={s.stepNumber}>{String(index + 1).padStart(2, '0')}</Text>
                    <Text style={s.stepTitle}>{step.title}</Text>
                  </View>
                  <Text style={s.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <View style={s.footer}>
          {/* Footer logo */}
          <View style={s.footerLogoRow}>
            <Image source={compassIcon} style={s.footerLogo} accessibilityIgnoresInvertColors />
            <Text style={s.footerWordmark}>
              Compass<Text style={s.footerWordmarkAccent}>CHW</Text>
            </Text>
          </View>

          <Text style={s.footerTagline}>
            Empowering Community Health Workers across Los Angeles.
          </Text>

          {/* Link columns */}
          <View style={s.footerColumnsRow}>
            {FOOTER_COLUMNS.map((col) => (
              <View key={col.heading} style={s.footerColumn}>
                <Text style={s.footerColumnHeading}>{col.heading}</Text>
                {col.links.map((link) => (
                  <TouchableOpacity
                    key={link}
                    onPress={() => {/* link not yet implemented */}}
                    accessibilityRole="link"
                    accessibilityLabel={link}
                    hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
                  >
                    <Text style={s.footerLink}>{link}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={s.footerDivider} />

          {/* Copyright + social */}
          <View style={s.footerBottomRow}>
            <Text style={s.footerCopyright}>
              © {new Date().getFullYear()} CompassCHW. All rights reserved.
            </Text>
            <View style={s.footerSocialRow}>
              {['Twitter', 'LinkedIn', 'Instagram'].map((network) => (
                <TouchableOpacity
                  key={network}
                  onPress={() => Linking.openURL('https://compasschw.com').catch(() => null)}
                  accessibilityRole="link"
                  accessibilityLabel={`CompassCHW on ${network}`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.footerSocialLink}>{network}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Fixed width for each service card so the horizontal snap feels intentional. */
const SERVICE_CARD_WIDTH = 220;

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Navbar ────────────────────────────────────────────────────────────────
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    // Elevation for Android shadow; iOS handled below
    elevation: 2,
    // iOS shadow
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    zIndex: 10,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  navWordmark: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.foreground,
    letterSpacing: -0.4,
  },
  navWordmarkAccent: {
    color: colors.secondary,
  },
  navJoinButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  navJoinButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ── Scroll container ─────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // ── Toggle pill ───────────────────────────────────────────────────────────
  toggleContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: colors.muted,
    borderRadius: radii.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    borderRadius: radii.full,
  },
  toggleTabActive: {
    backgroundColor: colors.primary,
  },
  toggleTabText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  toggleTabTextActive: {
    color: '#FFFFFF',
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: `${colors.secondary}18`,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  heroBadgeText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.secondary,
    letterSpacing: 0.2,
  },
  heroHeadline: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.foreground,
  },
  heroHeadlineAccent: {
    color: colors.secondary,
  },
  heroDescription: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.mutedForeground,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    flex: 1,
    minWidth: 160,
  },
  heroPrimaryButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  heroSecondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSecondaryButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.primary,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: `${colors.secondary}12`,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: `${colors.secondary}28`,
  },
  trustBadgeText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    color: colors.secondary,
    letterSpacing: 0.1,
  },

  // ── Services section ──────────────────────────────────────────────────────
  servicesSection: {
    paddingTop: spacing.xxl,
    gap: spacing.lg,
  },
  sectionEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.secondary,
    paddingHorizontal: spacing.lg,
  },
  sectionHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.foreground,
    paddingHorizontal: spacing.lg,
  },
  serviceCardsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  serviceCard: {
    width: SERVICE_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    // Card shadow
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  serviceCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 16,
    color: colors.foreground,
  },
  serviceCardDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.mutedForeground,
  },

  // ── Stats grid ────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.compassDark,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  statCell: {
    width: '50%',
    padding: spacing.lg,
    gap: spacing.xs,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: `${colors.compassNude}22`,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: `${colors.compassNude}BB`,
  },

  // ── How It Works ──────────────────────────────────────────────────────────
  howItWorksSection: {
    marginTop: spacing.xxl,
    backgroundColor: colors.compassDark,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  howItWorksSectionEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.secondary,
  },
  howItWorksSectionHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  stepsContainer: {
    gap: spacing.xl,
    marginTop: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  stepIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  stepNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumber: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  stepDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: `${colors.compassNude}BB`,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: colors.compassDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
    // Separator from How It Works section above
    borderTopWidth: 1,
    borderTopColor: `${colors.compassNude}18`,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerLogo: {
    width: 24,
    height: 24,
    borderRadius: 5,
  },
  footerWordmark: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  footerWordmarkAccent: {
    color: colors.secondary,
  },
  footerTagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: `${colors.compassNude}99`,
    marginTop: -spacing.md,
  },
  footerColumnsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  footerColumn: {
    flex: 1,
    gap: spacing.sm + 2,
  },
  footerColumnHeading: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: `${colors.compassNude}88`,
    lineHeight: 22,
  },
  footerDivider: {
    height: 1,
    backgroundColor: `${colors.compassNude}1A`,
  },
  footerBottomRow: {
    gap: spacing.sm,
  },
  footerCopyright: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: `${colors.compassNude}66`,
  },
  footerSocialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerSocialLink: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: `${colors.compassNude}88`,
  },
});
