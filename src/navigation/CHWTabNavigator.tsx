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
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

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

// ─── Screen factories ─────────────────────────────────────────────────────────

const DashboardScreen = (): React.JSX.Element => <PlaceholderScreen name="CHW Dashboard" />;
const RequestsScreen = (): React.JSX.Element => <PlaceholderScreen name="Requests" />;
const SessionsScreen = (): React.JSX.Element => <PlaceholderScreen name="Sessions" />;
const CalendarScreen = (): React.JSX.Element => <PlaceholderScreen name="Calendar" />;
const EarningsScreen = (): React.JSX.Element => <PlaceholderScreen name="Earnings" />;
const ProfileScreen = (): React.JSX.Element => <PlaceholderScreen name="Profile" />;

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
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Inbox color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <DollarSign color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserCircle color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
