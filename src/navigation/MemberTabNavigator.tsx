/**
 * Bottom-tab navigator for Member users.
 *
 * Tabs: Home, Find CHW, Sessions, Calendar, Roadmap, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Search,
  ClipboardList,
  CalendarDays,
  Map,
  UserCircle,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import { MemberHomeScreen } from '../screens/member/MemberHomeScreen';
import { MemberFindScreen } from '../screens/member/MemberFindScreen';
import { MemberSessionsScreen } from '../screens/member/MemberSessionsScreen';
import { MemberCalendarScreen } from '../screens/member/MemberCalendarScreen';
import { MemberRoadmapScreen } from '../screens/member/MemberRoadmapScreen';
import { MemberProfileScreen } from '../screens/member/MemberProfileScreen';

// ─── Navigator param list ─────────────────────────────────────────────────────

export type MemberTabParamList = {
  Home: undefined;
  FindCHW: undefined;
  Sessions: undefined;
  Calendar: undefined;
  Roadmap: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MemberTabParamList>();

// ─── Navigator ────────────────────────────────────────────────────────────────

export function MemberTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={MemberHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FindCHW"
        component={MemberFindScreen}
        options={{
          title: 'Find CHW',
          tabBarIcon: ({ color, size }) => (
            <Search color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={MemberSessionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={MemberCalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Roadmap"
        component={MemberRoadmapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Map color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MemberProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserCircle color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
