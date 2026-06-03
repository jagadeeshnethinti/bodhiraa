import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator }    from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { ParentNavigator }  from './ParentNavigator';
import { AdminNavigator }   from './AdminNavigator';

export type AppStackParamList = {
  Auth:       undefined;
  Student:    undefined;
  Teacher:    undefined;
  Parent:     undefined;
  Admin:      undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Auth"    component={AuthNavigator} />
      <Stack.Screen name="Student" component={StudentNavigator} />
      <Stack.Screen name="Teacher" component={TeacherNavigator} />
      <Stack.Screen name="Parent"  component={ParentNavigator} />
      <Stack.Screen name="Admin"   component={AdminNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);
