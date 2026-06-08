import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentStackParamList, StudentTabParamList } from '../types';
import { Colors } from '../theme';
import { TabIcon } from '../components/common/TabIcon';

import { HomeScreen } from '../screens/student/HomeScreen';
import { CoursesScreen } from '../screens/student/CoursesScreen';
import { SubjectListScreen } from '../screens/student/SubjectListScreen';
import { ChapterListScreen } from '../screens/student/ChapterListScreen';
import { ChapterLessonsScreen } from '../screens/student/ChapterLessonsScreen';
import { LessonDetailScreen } from '../screens/student/LessonDetailScreen';
import { LessonVideoScreen } from '../screens/student/LessonVideoScreen';
import { AITutorScreen } from '../screens/student/AITutorScreen';
import { QuizListScreen } from '../screens/student/QuizListScreen';
import { QuizDetailScreen } from '../screens/student/QuizDetailScreen';
import { QuizScreen } from '../screens/student/QuizScreen';
import { QuizResultScreen } from '../screens/student/QuizResultScreen';
import { LiveClassesScreen } from '../screens/student/LiveClassesScreen';
import { LiveClassDetailScreen } from '../screens/student/LiveClassDetailScreen';
import { NotificationsScreen } from '../screens/student/NotificationsScreen';
import { ProfileScreen } from '../screens/student/ProfileScreen';
import { ProgressScreen } from '../screens/student/ProgressScreen';

// ── Student Tab Navigator ─────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<StudentTabParamList>();

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.text3,
      tabBarStyle,
      tabBarLabelStyle: tabLabelStyle,
      tabBarItemStyle: { paddingVertical: 2 },
      tabBarIcon: ({ focused, color }) => (
        <TabIcon name={route.name} color={color} size={23} focused={focused} />
      ),
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="Courses" component={CoursesScreen} options={{ tabBarLabel: 'Courses' }} />
    <Tab.Screen name="AITutor" component={AITutorScreen} options={{ tabBarLabel: 'AI Tutor' }} />
    <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'Progress' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

// ── Student Stack Navigator ───────────────────────────────────────────────────
const Stack = createNativeStackNavigator<StudentStackParamList>();

export const StudentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentTabs" component={StudentTabs} />
    <Stack.Screen name="SubjectList" component={SubjectListScreen} />
    <Stack.Screen name="ChapterList" component={ChapterListScreen} />
    <Stack.Screen name="ChapterLessons" component={ChapterLessonsScreen} />
    <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
    <Stack.Screen name="LessonVideo" component={LessonVideoScreen} options={{ animation: 'fade' }} />
    <Stack.Screen name="QuizList" component={QuizListScreen} />
    <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
    <Stack.Screen name="QuizActive" component={QuizScreen} />
    <Stack.Screen name="QuizResult" component={QuizResultScreen} />
    <Stack.Screen name="LiveClasses" component={LiveClassesScreen} />
    <Stack.Screen name="LiveClassDetail" component={LiveClassDetailScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
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
