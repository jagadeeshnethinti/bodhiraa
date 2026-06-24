import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PremiumTabBar } from '../components/common/PremiumTabBar';

import { TeacherHomeScreen }        from '../screens/teacher/TeacherHomeScreen';
import { TeacherStudentsScreen }    from '../screens/teacher/TeacherStudentsScreen';
import { TeacherContentScreen }     from '../screens/teacher/TeacherContentScreen';
import { TeacherReportsScreen }     from '../screens/teacher/TeacherReportsScreen';
import { TeacherProfileScreen }     from '../screens/teacher/TeacherProfileScreen';
import { TeacherEditProfileScreen } from '../screens/teacher/TeacherEditProfileScreen';
import { ChatListScreen }           from '../screens/student/ChatListScreen';
import { ChatThreadScreen }         from '../screens/student/ChatThreadScreen';
import { LanguageScreen }           from '../screens/student/LanguageScreen';

// ── Teacher tabs ──────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

const TeacherTabs = () => (
  <Tab.Navigator
    tabBar={props => <PremiumTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Dashboard"      component={TeacherHomeScreen}     options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="Students"       component={TeacherStudentsScreen} options={{ tabBarLabel: 'Students' }} />
    <Tab.Screen name="Content"        component={TeacherContentScreen}  options={{ tabBarLabel: 'Content' }} />
    <Tab.Screen name="Reports"        component={TeacherReportsScreen}  options={{ tabBarLabel: 'Reports' }} />
    <Tab.Screen name="Messages"       component={ChatListScreen}        options={{ tabBarLabel: 'Messages' }} />
    <Tab.Screen name="TeacherProfile" component={TeacherProfileScreen}  options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

// ── Teacher stack (tabs + profile sub-screens) ───────────────────────────────
const Stack = createNativeStackNavigator();

export const TeacherNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
    <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    <Stack.Screen name="TeacherEditProfile" component={TeacherEditProfileScreen} />
    <Stack.Screen name="Language" component={LanguageScreen} />
  </Stack.Navigator>
);
