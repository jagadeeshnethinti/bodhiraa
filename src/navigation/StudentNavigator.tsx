import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentStackParamList } from '../types';
import { Colors } from '../theme';
import { TabIcon } from '../components/common/TabIcon';

import { HomeScreen }          from '../screens/student/HomeScreen';
import { CoursesScreen }       from '../screens/student/CoursesScreen';
import { SubjectListScreen }   from '../screens/student/SubjectListScreen';
import { ChapterListScreen }   from '../screens/student/ChapterListScreen';
import { LessonScreen }        from '../screens/student/LessonScreen';
import { VideoPlayerScreen }   from '../screens/student/VideoPlayerScreen';
import { AITutorScreen }       from '../screens/student/AITutorScreen';
import { QuizScreen }          from '../screens/student/QuizScreen';
import { QuizResultScreen }    from '../screens/student/QuizResultScreen';
import { ProfileScreen }       from '../screens/student/ProfileScreen';
import { ProgressScreen }      from '../screens/student/ProgressScreen';

// ── Student Tab Navigator ─────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor:   Colors.primary,
      tabBarInactiveTintColor: Colors.text3,
      tabBarStyle: tabBarStyle,
      tabBarLabelStyle: tabLabelStyle,
      tabBarItemStyle: { paddingVertical: 2 },
      tabBarIcon: ({ focused, color }) => (
        <TabIcon name={route.name} color={color} size={23} focused={focused} />
      ),
    })}
  >
    <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="Courses"  component={CoursesScreen}  options={{ tabBarLabel: 'Courses' }} />
    <Tab.Screen name="AITutor"  component={AITutorScreen}  options={{ tabBarLabel: 'AI Tutor' }} />
    <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'Progress' }} />
    <Tab.Screen name="Profile"  component={ProfileScreen}  options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

// ── Student Stack Navigator ───────────────────────────────────────────────────
const Stack = createNativeStackNavigator<StudentStackParamList>();

export const StudentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentTabs"   component={StudentTabs} />
    <Stack.Screen name="SubjectList"   component={SubjectListScreen} />
    <Stack.Screen name="ChapterList"   component={ChapterListScreen} />
    <Stack.Screen name="Lesson"        component={LessonScreen} />
    <Stack.Screen
      name="VideoPlayer"
      component={VideoPlayerScreen}
      options={{ animation: 'fade' }}
    />
    <Stack.Screen name="PDFNotes"      component={LessonScreen} />
    <Stack.Screen name="Discussion"    component={LessonScreen} />
    <Stack.Screen name="AIDoubt"       component={AITutorScreen} />
    <Stack.Screen name="AISearch"      component={AITutorScreen} />
    <Stack.Screen name="AIRecommend"   component={AITutorScreen} />
    <Stack.Screen name="QuizActive"    component={QuizScreen} />
    <Stack.Screen name="QuizResult"    component={QuizResultScreen} />
    <Stack.Screen name="Assignment"    component={QuizScreen} />
    <Stack.Screen name="Achievements"  component={ProfileScreen} />
    <Stack.Screen name="WeakAreas"     component={ProgressScreen} />
    <Stack.Screen name="Notifications" component={ProfileScreen} />
    <Stack.Screen name="RecentlyViewed" component={CoursesScreen} />
  </Stack.Navigator>
);

// ── Shared tab bar styles ─────────────────────────────────────────────────────
const tabBarStyle = {
  backgroundColor: Colors.white,
  borderTopWidth: 1,
  borderTopColor: 'rgba(42,14,19,0.07)',
  height: 72,
  paddingBottom: 14,
  paddingTop: 8,
  shadowColor: '#2A0E13',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 10,
} as const;

const tabLabelStyle = {
  fontSize: 10,
  fontWeight: '600' as const,
  marginTop: 2,
};

const styles = StyleSheet.create({});
