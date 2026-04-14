/**
 * LandingScreen — Full mobile replica of the CompassCHW Lovable web landing page.
 *
 * Sections (top to bottom, matching Lovable exactly on mobile viewport):
 *   1.  Sticky Navbar        — logo left, "Join Waitlist" button right
 *   2.  Hero                 — toggle pill, badge, headline, description, CTA buttons, trust badges
 *   3.  ClientSlider         — "Trusted Partners" heading + horizontally scrolling partner cards
 *   4.  Services             — eyebrow, heading, description, service cards (2-col grid), stats bar
 *   5.  How It Works         — dark green section, 3 steps centered vertically
 *   6.  For CHWs             — CHW image with earnings overlay card, benefits list, CTA
 *   7.  Mobile First         — checklist items, phone mockup UI, "Get the App" button
 *   8.  CTA Section          — neighborhood image with green overlay, heading, two CTA buttons
 *   9.  Footer               — dark green, logo, 3 link columns, social row, copyright
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
  MapPin,
  Smartphone,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radii } from '../theme/spacing';
import type { AuthStackParamList } from '../navigation/AppNavigator';

// ─── Assets ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-var-requires
const compassIcon = require('../../assets/compass-icon.png') as number;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chwMobileImage = require('../../assets/chw-mobile.jpg') as number;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const neighborhoodImage = require('../../assets/neighborhood.jpg') as number;

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'chw' | 'member';

type LandingNavProp = NativeStackNavigationProp<AuthStackParamList>;

// ─── Hero data ────────────────────────────────────────────────────────────────

interface TrustBadge {
  icon: React.FC<{ size: number; color: string }>;
  label: string;
}

interface HeroContent {
  headline: string;
  headlineAccent: string;
  descriptionPre: string;
  descriptionBold1: string;
  descriptionMid: string;
  descriptionBold2: string;
  descriptionPost: string;
  primaryButtonLabel: string;
  primaryButtonRoute: keyof AuthStackParamList;
  secondaryButtonLabel: string;
  badges: TrustBadge[];
}

const CHW_HERO: HeroContent = {
  headline: 'Your CHW career, ',
  headlineAccent: 'on your terms.',
  descriptionPre: 'Compass connects ',
  descriptionBold1: 'Community Health Workers',
  descriptionMid: ' with residents who need help navigating housing, food, recovery, and healthcare — and ',
  descriptionBold2: 'pays you for your service',
  descriptionPost: ' through Medi-Cal.',
  primaryButtonLabel: 'Start Earning as a CHW',
  primaryButtonRoute: 'Login',
  secondaryButtonLabel: 'I Need Help',
  badges: [
    { icon: Shield, label: 'HIPAA Compliant' },
    { icon: CheckCircle, label: 'Medi-Cal Reimbursed' },
    { icon: DollarSign, label: 'Flexible Schedule' },
  ],
};

const MEMBER_HERO: HeroContent = {
  headline: 'Get the help you need, ',
  headlineAccent: 'at no cost.',
  descriptionPre: 'Compass pairs you with a ',
  descriptionBold1: 'trained Community Health Worker',
  descriptionMid: ' who speaks your language and knows your neighborhood — to help with ',
  descriptionBold2: 'housing, food, healthcare,',
  descriptionPost: ' and more.',
  primaryButtonLabel: 'Get Matched with a CHW',
  primaryButtonRoute: 'Waitlist',
  secondaryButtonLabel: 'Learn More',
  badges: [
    { icon: Heart, label: '100% Free' },
    { icon: Users, label: 'Bilingual CHWs' },
    { icon: Clock, label: 'Same-Week Matching' },
  ],
};

// ─── Partner logos data ───────────────────────────────────────────────────────

interface PartnerLogo {
  name: string;
  initials: string;
}

const PARTNER_LOGOS: PartnerLogo[] = [
  { name: 'Kaiser Permanente', initials: 'KP' },
  { name: 'LA County DPSS', initials: 'DPSS' },
  { name: 'Medi-Cal', initials: 'MC' },
  { name: 'Blue Shield CA', initials: 'BS' },
  { name: 'Health Net', initials: 'HN' },
  { name: 'CalOptima', initials: 'CO' },
  { name: 'LA Care', initials: 'LAC' },
  { name: 'Molina Healthcare', initials: 'MH' },
];

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
    description: 'Help members find rental assistance, shelter, and housing stability resources.',
  },
  {
    icon: Pill,
    title: 'Rehab & Recovery',
    description: 'Connect members to substance use recovery, sober living, and peer support.',
  },
  {
    icon: Apple,
    title: 'Food & Pantry',
    description: 'Navigate CalFresh enrollment, food pantries, and nutrition programs.',
  },
  {
    icon: Brain,
    title: 'Mental Health',
    description: 'Refer members to counseling, crisis support, and wellness check-ins.',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare',
    description: 'Assist with Medi-Cal enrollment, appointments, and care coordination.',
  },
];

// ─── Stats data ───────────────────────────────────────────────────────────────

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: '81%', label: 'CHW session completion' },
  { value: '5', label: 'Service verticals' },
  { value: '$32', label: 'Avg. earning / hour' },
  { value: '$0', label: 'Cost to members' },
];

// ─── How-It-Works steps ───────────────────────────────────────────────────────

interface Step {
  icon: React.FC<{ size: number; color: string }>;
  number: string;
  title: string;
  description: string;
}

const HOW_IT_WORKS: Step[] = [
  {
    icon: Briefcase,
    number: '01',
    title: 'Sign up as a CHW',
    description: 'Create your profile, verify your training, and set your availability. It takes under 5 minutes.',
  },
  {
    icon: Users,
    number: '02',
    title: 'Get matched with members',
    description: 'Compass connects you with community members in your neighborhood who need support — housing, food, recovery, or healthcare.',
  },
  {
    icon: DollarSign,
    number: '03',
    title: 'Complete sessions & get paid',
    description: 'Meet with members, log your sessions, and get reimbursed through Medi-Cal. Track your earnings in real time.',
  },
];

// ─── For CHWs benefits data ───────────────────────────────────────────────────

interface Benefit {
  icon: React.FC<{ size: number; color: string }>;
  title: string;
  description: string;
}

const CHW_BENEFITS: Benefit[] = [
  {
    icon: DollarSign,
    title: 'Earn on your schedule',
    description: 'Get reimbursed through Medi-Cal for every session completed.',
  },
  {
    icon: Clock,
    title: 'Flexible hours',
    description: 'Work when it suits you. No minimums, no commitments.',
  },
  {
    icon: MapPin,
    title: 'Stay in your neighborhood',
    description: 'Help people in your own community — no long commutes.',
  },
  {
    icon: Heart,
    title: 'Make real impact',
    description: 'Navigate your neighbors through the services they need most.',
  },
];

// ─── Mobile First checklist items ─────────────────────────────────────────────

const MOBILE_FEATURES: string[] = [
  'Accept member requests in seconds',
  'Log sessions & track your earnings in real time',
  'Secure messaging with members',
  'Access the full resource directory on the go',
];

// ─── Footer link columns ──────────────────────────────────────────────────────

interface FooterColumn {
  heading: string;
  links: string[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'For CHWs',
    links: ['Start Earning', 'How It Works', 'CHW Resources', 'FAQs'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'HIPAA Notice'],
  },
];

// ─── Pulsing dot ──────────────────────────────────────────────────────────────

/**
 * Animated pulsing green dot for the "Launching in Los Angeles" badge.
 * Uses Animated (core RN) to avoid a reanimated dependency.
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

  return <Animated.View style={[pulseDotStyles.dot, { opacity }]} />;
}

const pulseDotStyles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
});

// ─── Checkmark icon (used in Mobile First section) ───────────────────────────

/**
 * Small green circle with a white checkmark, matching the SVG checkmark
 * in the Lovable MobileFirst component.
 */
function CheckmarkCircle(): React.JSX.Element {
  return (
    <View style={checkmarkStyles.circle}>
      <Text style={checkmarkStyles.mark}>✓</Text>
    </View>
  );
}

const checkmarkStyles = StyleSheet.create({
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fonts.bodySemibold,
    lineHeight: 18,
  },
});

// ─── LandingScreen ────────────────────────────────────────────────────────────

/**
 * Full marketing landing screen.
 * Matches the Lovable web landing page section-for-section on a mobile viewport.
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
    if (activeTab === 'chw') {
      navigation.navigate('Waitlist');
    }
  }, [navigation, activeTab]);

  const handleLoginPress = useCallback((): void => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>

      {/* ── Fixed navbar ─────────────────────────────────────────────────── */}
      <View style={s.navbar}>
        <View style={s.navbarLeft}>
          <Image
            source={compassIcon}
            style={s.navLogo}
            accessibilityIgnoresInvertColors
          />
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

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — HERO
        ════════════════════════════════════════════════════════════════ */}

        {/* Toggle pill — centered above hero content */}
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

        {/* Hero content */}
        <View style={s.heroSection}>
          {/* Launch badge */}
          <View style={s.heroBadge}>
            <PulsingDot />
            <Text style={s.heroBadgeText}>Launching in Los Angeles</Text>
          </View>

          {/* Headline — accent word in secondary green */}
          <Text style={s.heroHeadline}>
            {heroContent.headline}
            <Text style={s.heroHeadlineAccent}>{heroContent.headlineAccent}</Text>
          </Text>

          {/* Description — matches Lovable's <strong> bolded words */}
          <Text style={s.heroDescription}>
            {heroContent.descriptionPre}
            <Text style={s.heroDescriptionBold}>{heroContent.descriptionBold1}</Text>
            {heroContent.descriptionMid}
            <Text style={s.heroDescriptionBold}>{heroContent.descriptionBold2}</Text>
            {heroContent.descriptionPost}
          </Text>

          {/* CTA buttons — stacked full-width on mobile (flex-col in Lovable) */}
          <View style={s.heroButtonsCol}>
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

          {/* Trust badges — 3 pills in a row */}
          <View style={s.trustBadgesRow}>
            {heroContent.badges.map((badge) => (
              <View key={badge.label} style={s.trustBadge}>
                <badge.icon size={14} color={colors.primary} />
                <Text style={s.trustBadgeText}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — CLIENT SLIDER
        ════════════════════════════════════════════════════════════════ */}
        <View style={s.clientSliderSection}>
          <Text style={s.clientSliderEyebrow}>Trusted Partners</Text>
          <Text style={s.clientSliderHeading}>Working with leading health organizations</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.clientCardsScroll}
          >
            {PARTNER_LOGOS.map((logo) => (
              <View key={logo.name} style={s.clientCard}>
                <View style={s.clientCardInitialsWrap}>
                  <Text style={s.clientCardInitials}>{logo.initials}</Text>
                </View>
                <Text style={s.clientCardName}>{logo.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — SERVICES
        ════════════════════════════════════════════════════════════════ */}
        <View style={s.servicesSection}>
          <Text style={s.sectionEyebrow}>Service Areas</Text>
          <Text style={s.sectionHeading}>
            Where <Text style={s.sectionHeadingBold}>CHWs make an impact</Text>
          </Text>
          <Text style={s.servicesSubheading}>
            As a Compass CHW, you'll guide members through these critical service areas — and get reimbursed for each session.
          </Text>

          {/* 2-column grid of service cards */}
          <View style={s.serviceCardsGrid}>
            {SERVICE_CARDS.map((card) => (
              <View key={card.title} style={s.serviceCard}>
                <View style={s.serviceCardIconWrap}>
                  <card.icon size={22} color={colors.primary} />
                </View>
                <Text style={s.serviceCardTitle}>{card.title}</Text>
                <Text style={s.serviceCardDescription}>{card.description}</Text>
              </View>
            ))}
          </View>

          {/* Stats bar — 2×2 grid, dark green rounded card */}
          <View style={s.statsBar}>
            {STATS.map((stat, index) => (
              <View
                key={stat.value}
                style={[
                  s.statCell,
                  index % 2 !== 1 && s.statCellBorderRight,
                  index < 2 && s.statCellBorderBottom,
                ]}
              >
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4 — HOW IT WORKS
        ════════════════════════════════════════════════════════════════ */}
        <View style={s.howItWorksSection}>
          <Text style={s.howEyebrow}>How It Works</Text>
          <Text style={s.howHeading}>
            Three steps to <Text style={s.howHeadingBold}>start earning</Text>
          </Text>

          <View style={s.stepsContainer}>
            {HOW_IT_WORKS.map((step) => (
              <View key={step.number} style={s.stepItem}>
                <View style={s.stepIconCircle}>
                  <step.icon size={24} color={colors.primary} />
                </View>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDescription}>{step.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 5 — FOR CHWs
        ════════════════════════════════════════════════════════════════ */}
        <View style={s.forChwsSection}>
          {/* CHW image with earnings overlay — image sits on top on mobile */}
          <View style={s.forChwsImageWrap}>
            <Image
              source={chwMobileImage}
              style={s.forChwsImage}
              accessibilityIgnoresInvertColors
              accessibilityLabel="Community Health Worker using the Compass app on their phone"
            />
            {/* Gradient overlay (simulated with a semi-transparent dark view) */}
            <View style={s.forChwsImageOverlay} />
            {/* Earnings card overlay — pinned to bottom */}
            <View style={s.earningsCard}>
              <Text style={s.earningsCardLabel}>Avg. Earnings</Text>
              <Text style={s.earningsCardValue}>
                $32<Text style={s.earningsCardSuffix}> / hour</Text>
              </Text>
              <Text style={s.earningsCardNote}>Reimbursed via Medi-Cal</Text>
            </View>
          </View>

          {/* Content */}
          <Text style={s.forChwsEyebrow}>Why CHWs Choose Compass</Text>
          <Text style={s.forChwsHeading}>
            Earn money helping{' '}
            <Text style={s.forChwsHeadingAccent}>your neighbors</Text>
          </Text>
          <Text style={s.forChwsBody}>
            Join Compass as a CHW and get reimbursed for every session. Work flexible hours, stay local, and build a career making a real difference in your community.
          </Text>

          {/* Benefits — 2-column grid */}
          <View style={s.benefitsGrid}>
            {CHW_BENEFITS.map((benefit) => (
              <View key={benefit.title} style={s.benefitItem}>
                <View style={s.benefitIconWrap}>
                  <benefit.icon size={20} color={colors.primary} />
                </View>
                <View style={s.benefitTextBlock}>
                  <Text style={s.benefitTitle}>{benefit.title}</Text>
                  <Text style={s.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={s.forChwsCta}
            onPress={handleLoginPress}
            activeOpacity={0.85}
            accessibilityLabel="Start Earning Today"
            accessibilityRole="button"
          >
            <Text style={s.forChwsCtaText}>Start Earning Today</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 6 — MOBILE FIRST
        ════════════════════════════════════════════════════════════════ */}
        <View style={s.mobileFirstSection}>
          <Text style={s.mobileFirstEyebrow}>Mobile-First Platform</Text>
          <Text style={s.mobileFirstHeading}>
            Manage your CHW work{' '}
            <Text style={s.mobileFirstHeadingAccent}>from your pocket</Text>
          </Text>
          <Text style={s.mobileFirstBody}>
            Accept requests, log sessions, track earnings, and communicate with members — all from your phone. Compass is built mobile-first because your work happens in the field, not behind a desk.
          </Text>

          {/* Checklist */}
          <View style={s.mobileFeaturesList}>
            {MOBILE_FEATURES.map((feature) => (
              <View key={feature} style={s.mobileFeatureRow}>
                <CheckmarkCircle />
                <Text style={s.mobileFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Phone mockup UI */}
          <View style={s.phoneMockupOuter}>
            {/* Notch */}
            <View style={s.phoneMockupNotch} />
            <View style={s.phoneMockupInner}>
              {/* Status bar */}
              <View style={s.phoneStatusBar}>
                <Text style={s.phoneStatusTime}>9:41</Text>
                <View style={s.phoneStatusIcons}>
                  <View style={s.phoneStatusIcon} />
                  <View style={s.phoneStatusIcon} />
                  <View style={[s.phoneStatusIcon, s.phoneStatusIconGreen]} />
                </View>
              </View>

              {/* App header */}
              <View style={s.phoneAppHeader}>
                <Smartphone size={18} color={colors.primary} />
                <Text style={s.phoneAppTitle}>Compass</Text>
              </View>

              {/* Welcome line */}
              <Text style={s.phoneWelcome}>Welcome back, Carlos</Text>
              <Text style={s.phoneSubtitle}>You have 2 sessions today</Text>

              {/* Session card */}
              <View style={s.phoneSessionCard}>
                <View style={s.phoneSessionCardTop}>
                  <View>
                    <Text style={s.phoneSessionTitle}>Housing Support</Text>
                    <Text style={s.phoneSessionSub}>w/ Maria G.</Text>
                  </View>
                  <View style={s.phoneSessionTimeBadge}>
                    <Text style={s.phoneSessionTime}>2:00 PM</Text>
                  </View>
                </View>
                <Text style={s.phoneSessionDesc}>Rental assistance application review</Text>
              </View>

              {/* Stats row */}
              <View style={s.phoneStatsRow}>
                <View style={s.phoneStatCard}>
                  <Text style={s.phoneStatValue}>$176</Text>
                  <Text style={s.phoneStatLabel}>This Week</Text>
                </View>
                <View style={s.phoneStatCard}>
                  <Text style={s.phoneStatValue}>24</Text>
                  <Text style={s.phoneStatLabel}>Sessions Done</Text>
                </View>
              </View>
            </View>

            {/* Bottom nav */}
            <View style={s.phoneBottomNav}>
              {['Home', 'Requests', 'Sessions', 'Earnings'].map((item) => (
                <View key={item} style={s.phoneNavItem}>
                  <View style={[s.phoneNavDot, item === 'Home' && s.phoneNavDotActive]} />
                  <Text style={s.phoneNavLabel}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={s.mobileFirstCta}
            onPress={handleWaitlistPress}
            activeOpacity={0.85}
            accessibilityLabel="Get the App"
            accessibilityRole="button"
          >
            <Text style={s.mobileFirstCtaText}>Get the App</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 7 — CTA SECTION
        ════════════════════════════════════════════════════════════════ */}
        {/*
          Layout strategy: Image fills the outer View via StyleSheet.absoluteFill.
          The outer View must have an explicit height so absoluteFill has dimensions
          to stretch into — we give it minHeight and let content push it taller.
          ctaContent sits above the absolute layers via zIndex: 1.
        */}
        <View style={s.ctaSection}>
          <Image
            source={neighborhoodImage}
            style={StyleSheet.absoluteFill}
            accessibilityIgnoresInvertColors
            accessibilityLabel="Los Angeles neighborhood aerial view"
            resizeMode="cover"
          />
          {/* Dark green overlay at 90% opacity */}
          <View style={[StyleSheet.absoluteFill, s.ctaOverlay]} />

          {/* Content */}
          <View style={s.ctaContent}>
            <Text style={s.ctaEyebrow}>Limited Early Access</Text>
            <Text style={s.ctaHeading}>Ready to start earning as a CHW?</Text>
            <Text style={s.ctaBody}>
              We're opening Compass to CHWs in Los Angeles first. Secure your spot, set your availability, and start getting matched with members who need your help.
            </Text>

            <View style={s.ctaButtonsCol}>
              <TouchableOpacity
                style={s.ctaPrimaryButton}
                onPress={handleLoginPress}
                activeOpacity={0.85}
                accessibilityLabel="Join as a CHW"
                accessibilityRole="button"
              >
                <Text style={s.ctaPrimaryButtonText}>Join as a CHW</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={s.ctaSecondaryButton}
                onPress={handleWaitlistPress}
                activeOpacity={0.75}
                accessibilityLabel="I'm a Community Member"
                accessibilityRole="button"
              >
                <Text style={s.ctaSecondaryButtonText}>I'm a Community Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 8 — FOOTER
        ════════════════════════════════════════════════════════════════ */}
        <View style={s.footer}>
          {/* Logo row */}
          <View style={s.footerLogoRow}>
            <Image
              source={compassIcon}
              style={s.footerLogo}
              accessibilityIgnoresInvertColors
            />
            <Text style={s.footerWordmark}>
              Compass<Text style={s.footerWordmarkAccent}>CHW</Text>
            </Text>
          </View>

          <Text style={s.footerTagline}>
            The marketplace connecting Community Health Workers with the neighbors who need them.
          </Text>

          {/* Link columns — 3 columns side by side */}
          <View style={s.footerColumnsRow}>
            {FOOTER_COLUMNS.map((col) => (
              <View key={col.heading} style={s.footerColumn}>
                <Text style={s.footerColumnHeading}>{col.heading}</Text>
                {col.links.map((link) => (
                  <TouchableOpacity
                    key={link}
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

          <View style={s.footerDivider} />

          {/* Copyright + social */}
          <View style={s.footerBottomRow}>
            <Text style={s.footerCopyright}>
              © {new Date().getFullYear()} Compass CHW. All rights reserved.
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const SERVICE_CARD_WIDTH = '48%' as const;

const s = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Navbar ────────────────────────────────────────────────────────────────
  navbar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
    }),
    zIndex: 10,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navLogo: {
    width: 28,
    height: 28,
    borderRadius: 7,
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
    paddingVertical: 10,
  },
  navJoinButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Toggle ────────────────────────────────────────────────────────────────
  toggleContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    // Card-level shadow matching Lovable `shadow-card`
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  toggleTab: {
    paddingHorizontal: spacing.md + 8,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  toggleTabActive: {
    backgroundColor: colors.primary,
    // Elevated shadow on active tab
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
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
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}1A`,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroHeadline: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1,
    color: colors.foreground,
  },
  heroHeadlineAccent: {
    color: colors.secondary,
  },
  heroDescription: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.mutedForeground,
  },
  heroDescriptionBold: {
    fontFamily: fonts.bodyBold,
    color: colors.foreground,
  },
  // Full-width stacked buttons (flex-col on mobile in Lovable)
  heroButtonsCol: {
    gap: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  heroPrimaryButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  heroSecondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSecondaryButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: colors.primary,
  },
  // Trust badges — card style (bg-card + border + shadow-card in Lovable)
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
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  trustBadgeText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.foreground,
  },

  // ── Client Slider ─────────────────────────────────────────────────────────
  clientSliderSection: {
    paddingVertical: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  clientSliderEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  clientSliderHeading: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.foreground,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  clientCardsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  clientCardInitialsWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientCardInitials: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  clientCardName: {
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    color: colors.foreground,
  },

  // ── Services ──────────────────────────────────────────────────────────────
  servicesSection: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  sectionEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  sectionHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  sectionHeadingBold: {
    fontFamily: fonts.display,
    color: colors.foreground,
  },
  servicesSubheading: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  // 2-column grid — matching `grid-cols-2` on mobile in Lovable
  serviceCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  serviceCard: {
    width: SERVICE_CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md + 4,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  serviceCardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  serviceCardDescription: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.mutedForeground,
  },

  // Stats bar — bg-primary rounded-2xl (Lovable uses primary which = compassGreen #3D5A3E)
  statsBar: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  statCell: {
    width: '50%',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statCellBorderRight: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  statCellBorderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 40,
    color: '#FFFFFF',
    letterSpacing: -1,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },

  // ── How It Works ──────────────────────────────────────────────────────────
  howItWorksSection: {
    backgroundColor: colors.compassDark,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  howEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  howHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  howHeadingBold: {
    fontFamily: fonts.display,
    color: '#FFFFFF',
  },
  stepsContainer: {
    gap: spacing.xxl,
  },
  // Each step: centered icon circle, title, description (matching Lovable's text-center layout)
  stepItem: {
    alignItems: 'center',
    gap: spacing.md,
  },
  stepIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Glow shadow matching `shadow-glow` in Lovable
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  stepDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    maxWidth: 280,
  },

  // ── For CHWs ──────────────────────────────────────────────────────────────
  forChwsSection: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  forChwsImageWrap: {
    position: 'relative',
    borderRadius: radii.xxl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    // Elevated shadow matching Lovable `shadow-elevated`
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  forChwsImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  forChwsImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    // Gradient simulation: bg-gradient-to-t from compass-dark/50
    backgroundColor: 'rgba(20,43,26,0.45)',
  },
  earningsCard: {
    position: 'absolute',
    bottom: spacing.md + 4,
    left: spacing.md + 4,
    right: spacing.md + 4,
    backgroundColor: 'rgba(61,90,62,0.95)',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  earningsCardLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
  },
  earningsCardValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  earningsCardSuffix: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  earningsCardNote: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.secondary,
  },
  forChwsEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  forChwsHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  forChwsHeadingAccent: {
    color: colors.secondary,
  },
  forChwsBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.mutedForeground,
  },
  // 2-column grid of benefit items
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  benefitItem: {
    width: '47%',
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  benefitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitTextBlock: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 13,
    color: colors.foreground,
    lineHeight: 18,
  },
  benefitDescription: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mutedForeground,
  },
  forChwsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  forChwsCtaText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  // ── Mobile First ──────────────────────────────────────────────────────────
  mobileFirstSection: {
    backgroundColor: colors.compassNude,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  mobileFirstEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  mobileFirstHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  mobileFirstHeadingAccent: {
    color: colors.secondary,
  },
  mobileFirstBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.mutedForeground,
  },
  mobileFeaturesList: {
    gap: spacing.md,
  },
  mobileFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  mobileFeatureText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.foreground,
    flex: 1,
  },
  // Phone mockup — dark rounded rectangle with inner card content
  phoneMockupOuter: {
    width: 260,
    alignSelf: 'center',
    backgroundColor: colors.compassDark,
    borderRadius: 44,
    padding: 12,
    marginVertical: spacing.xl,
    // shadow-elevated
    ...Platform.select({
      ios: {
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  phoneMockupNotch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -52,
    width: 104,
    height: 28,
    backgroundColor: colors.compassDark,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 2,
  },
  phoneMockupInner: {
    backgroundColor: colors.card,
    borderRadius: 36,
    paddingTop: 40,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  phoneStatusTime: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    gap: 3,
  },
  phoneStatusIcon: {
    width: 14,
    height: 8,
    backgroundColor: `${colors.foreground}40`,
    borderRadius: 2,
  },
  phoneStatusIconGreen: {
    width: 18,
    backgroundColor: colors.primary,
  },
  phoneAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  phoneAppTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  phoneWelcome: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  phoneSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  phoneSessionCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  phoneSessionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phoneSessionTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  phoneSessionSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  phoneSessionTimeBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  phoneSessionTime: {
    fontFamily: fonts.bodySemibold,
    fontSize: 10,
    color: colors.primary,
  },
  phoneSessionDesc: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  phoneStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  phoneStatCard: {
    flex: 1,
    backgroundColor: colors.muted,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    alignItems: 'center',
  },
  phoneStatValue: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.foreground,
    letterSpacing: -0.4,
  },
  phoneStatLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.mutedForeground,
    letterSpacing: 0.3,
  },
  phoneBottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  phoneNavItem: {
    alignItems: 'center',
    gap: 3,
  },
  phoneNavDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.muted,
  },
  phoneNavDotActive: {
    backgroundColor: colors.primary,
  },
  phoneNavLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.mutedForeground,
  },
  mobileFirstCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  mobileFirstCtaText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  // ── CTA Section ───────────────────────────────────────────────────────────
  ctaSection: {
    position: 'relative',
    overflow: 'hidden',
    // Explicit minHeight so StyleSheet.absoluteFill has dimensions to stretch into
    minHeight: 400,
  },
  ctaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // bg-primary/90 = #3D5A3E at 90% opacity
    backgroundColor: 'rgba(61,90,62,0.92)',
  },
  ctaContent: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    zIndex: 1,
  },
  ctaEyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  ctaHeading: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  ctaButtonsCol: {
    gap: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  ctaPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  ctaPrimaryButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  ctaSecondaryButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondaryButtonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: colors.compassDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
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
    lineHeight: 20,
    color: 'rgba(255,255,255,0.55)',
    maxWidth: 280,
    marginTop: -spacing.md,
  },
  footerColumnsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  footerColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  footerColumnHeading: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.55)',
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  footerBottomRow: {
    gap: spacing.sm,
  },
  footerCopyright: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  footerSocialRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  footerSocialLink: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
});
