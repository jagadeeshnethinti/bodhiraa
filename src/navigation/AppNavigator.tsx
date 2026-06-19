import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

import { BootScreen } from '../screens/auth/BootScreen';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { ParentNavigator } from './ParentNavigator';
import { AdminNavigator } from './AdminNavigator';

/**
 * Root navigator. There is no shared dashboard — the visible stack is chosen by
 * auth state and role, and it swaps automatically when the session changes
 * (login / logout / token expiry). Screens never imperatively jump between
 * roles; they mutate auth state and this re-renders.
 */
export const AppNavigator: React.FC = () => {
  const { status, role } = useAuth();

  if (status === 'booting') {
    return <BootScreen />;
  }

  return (
    <NavigationContainer>
      {status === 'unauthenticated' || !role ? (
        <AuthNavigator />
      ) : role === 'student' ? (
        <StudentNavigator />
      ) : role === 'teacher' ? (
        <TeacherNavigator />
      ) : role === 'parent' ? (
        <ParentNavigator />
      ) : (
        // admin / super_admin → native dashboard (mobile UI design build).
        <AdminNavigator />
      )}
    </NavigationContainer>
  );
};
