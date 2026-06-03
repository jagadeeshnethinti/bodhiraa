import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';

import { SplashScreen }         from '../screens/auth/SplashScreen';
import { OnboardingScreen }     from '../screens/auth/OnboardingScreen';
import { LoginScreen }          from '../screens/auth/LoginScreen';
import { SignUpScreen }         from '../screens/auth/SignUpScreen';
import { OTPScreen }            from '../screens/auth/OTPScreen';
import { RoleSelectionScreen }  from '../screens/auth/RoleSelectionScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash"         component={SplashScreen} />
    <Stack.Screen name="Onboarding"     component={OnboardingScreen} />
    <Stack.Screen name="Login"          component={LoginScreen} />
    <Stack.Screen name="SignUp"         component={SignUpScreen} />
    <Stack.Screen name="OTP"            component={OTPScreen} />
    <Stack.Screen name="RoleSelection"  component={RoleSelectionScreen} />
  </Stack.Navigator>
);
