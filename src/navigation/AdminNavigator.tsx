import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PremiumTabBar } from '../components/common/PremiumTabBar';

import { AdminHomeScreen }        from '../screens/admin/AdminHomeScreen';
import { AdminUsersScreen }       from '../screens/admin/AdminUsersScreen';
import { AdminClassesScreen }     from '../screens/admin/AdminClassesScreen';
import { AdminAnalyticsScreen }   from '../screens/admin/AdminAnalyticsScreen';
import { AdminProfileScreen }     from '../screens/admin/AdminProfileScreen';
import { AdminEditProfileScreen } from '../screens/admin/AdminEditProfileScreen';
import { LanguageScreen }         from '../screens/student/LanguageScreen';

// ── Admin tabs ────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

const AdminTabs = () => (
  <Tab.Navigator
    tabBar={props => <PremiumTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="ADash"      component={AdminHomeScreen}      options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="AUsers"     component={AdminUsersScreen}     options={{ tabBarLabel: 'Users' }} />
    <Tab.Screen name="AClasses"   component={AdminClassesScreen}   options={{ tabBarLabel: 'Classes' }} />
    <Tab.Screen name="AAnalytics" component={AdminAnalyticsScreen} options={{ tabBarLabel: 'Analytics' }} />
    <Tab.Screen name="AProfile"   component={AdminProfileScreen}   options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

// ── Admin stack (tabs + profile sub-screens) ─────────────────────────────────
const Stack = createNativeStackNavigator();

export const AdminNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="AdminEditProfile" component={AdminEditProfileScreen} />
    <Stack.Screen name="Language" component={LanguageScreen} />
  </Stack.Navigator>
);
