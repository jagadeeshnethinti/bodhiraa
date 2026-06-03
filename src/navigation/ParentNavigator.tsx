import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme';
import { TabIcon } from '../components/common/TabIcon';

import { ParentHomeScreen } from '../screens/parent/ParentHomeScreen';
import { ProgressScreen }   from '../screens/student/ProgressScreen';
import { ProfileScreen }    from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();

export const ParentNavigator = () => (
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
    <Tab.Screen name="PHome"       component={ParentHomeScreen} options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="PChild"      component={ProgressScreen}   options={{ tabBarLabel: 'My Child' }} />
    <Tab.Screen name="PAttendance" component={ProgressScreen}   options={{ tabBarLabel: 'Attendance' }} />
    <Tab.Screen name="PReports"    component={ProgressScreen}   options={{ tabBarLabel: 'Reports' }} />
    <Tab.Screen name="PProfile"    component={ProfileScreen}    options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

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
