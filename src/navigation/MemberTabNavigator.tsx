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
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

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

// ─── Screen factories ─────────────────────────────────────────────────────────

const HomeScreen = (): React.JSX.Element => <PlaceholderScreen name="Member Home" />;
const FindCHWScreen = (): React.JSX.Element => <PlaceholderScreen name="Find a CHW" />;
const SessionsScreen = (): React.JSX.Element => <PlaceholderScreen name="My Sessions" />;
const CalendarScreen = (): React.JSX.Element => <PlaceholderScreen name="Calendar" />;
const RoadmapScreen = (): React.JSX.Element => <PlaceholderScreen name="My Roadmap" />;
const ProfileScreen = (): React.JSX.Element => <PlaceholderScreen name="Profile" />;

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
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FindCHW"
        component={FindCHWScreen}
        options={{
          title: 'Find CHW',
          tabBarIcon: ({ color, size }) => (
            <Search color={color} size={size} />
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
        name="Roadmap"
        component={RoadmapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Map color={color} size={size} />
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
