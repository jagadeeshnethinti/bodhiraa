import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PremiumTabBar } from '../components/common/PremiumTabBar';

import { ParentHomeScreen }       from '../screens/parent/ParentHomeScreen';
import { ParentChildScreen }      from '../screens/parent/ParentChildScreen';
import { ParentAttendanceScreen } from '../screens/parent/ParentAttendanceScreen';
import { ParentReportsScreen }    from '../screens/parent/ParentReportsScreen';
import { ParentProfileScreen }    from '../screens/parent/ParentProfileScreen';
import { ParentEditProfileScreen } from '../screens/parent/ParentEditProfileScreen';
import { ParentNotificationsScreen } from '../screens/parent/ParentNotificationsScreen';
import { ParentFeesScreen }       from '../screens/parent/ParentFeesScreen';
import { ChatListScreen }         from '../screens/student/ChatListScreen';
import { ChatThreadScreen }       from '../screens/student/ChatThreadScreen';
import { LanguageScreen }         from '../screens/student/LanguageScreen';

// ── Parent tabs ───────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

const ParentTabs = () => (
  <Tab.Navigator
    tabBar={props => <PremiumTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="PHome"       component={ParentHomeScreen}       options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="PChild"      component={ParentChildScreen}      options={{ tabBarLabel: 'My Child' }} />
    <Tab.Screen name="PAttendance" component={ParentAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
    <Tab.Screen name="PReports"    component={ParentReportsScreen}    options={{ tabBarLabel: 'Reports' }} />
    <Tab.Screen name="PMessages"   component={ChatListScreen}         options={{ tabBarLabel: 'Messages' }} />
    <Tab.Screen name="PProfile"    component={ParentProfileScreen}    options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

// ── Parent stack (tabs + profile sub-screens) ────────────────────────────────
const Stack = createNativeStackNavigator();

export const ParentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ParentTabs" component={ParentTabs} />
    <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    <Stack.Screen name="ParentEditProfile" component={ParentEditProfileScreen} />
    <Stack.Screen name="ParentNotifications" component={ParentNotificationsScreen} />
    <Stack.Screen name="ParentFees" component={ParentFeesScreen} />
    <Stack.Screen name="Language" component={LanguageScreen} />
  </Stack.Navigator>
);
