/**
 * Bottom-tab navigator for CHW (Community Health Worker) users.
 *
 * Tabs: Dashboard, Requests, Sessions, Calendar, Earnings, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  ClipboardList,
  DollarSign,
  UserCircle,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import { CHWDashboardScreen } from '../screens/chw/CHWDashboardScreen';
import { CHWRequestsScreen } from '../screens/chw/CHWRequestsScreen';
import { CHWSessionsScreen } from '../screens/chw/CHWSessionsScreen';
import { CHWCalendarScreen } from '../screens/chw/CHWCalendarScreen';
import { CHWEarningsScreen } from '../screens/chw/CHWEarningsScreen';
import { CHWProfileScreen } from '../screens/chw/CHWProfileScreen';

// ─── Navigator param list ─────────────────────────────────────────────────────

export type CHWTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Sessions: undefined;
  Calendar: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CHWTabParamList>();

// ─── Navigator ────────────────────────────────────────────────────────────────

export function CHWTabNavigator(): React.JSX.Element {
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
        name="Dashboard"
        component={CHWDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={CHWRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Inbox color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={CHWSessionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CHWCalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={CHWEarningsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <DollarSign color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CHWProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserCircle color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
