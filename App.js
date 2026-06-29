import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';

import { AuthProvider } from './src/context/AuthContext';
import { TokenProvider } from './src/context/TokenContext';

export default function App() {
  return (
    <AuthProvider>
      <TokenProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </TokenProvider>
    </AuthProvider>
  );
}