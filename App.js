/**
 * 📱 App.js - Point d'entrée de l'application
 * 
 * C'est le composant racine qui enveloppe toute l'app.
 * 
 * Concepts appris ici :
 * - NavigationContainer : conteneur obligatoire pour React Navigation
 * - Context Provider : enveloppe l'app pour partager les données globalement
 * - SafeAreaProvider : gère les encoches (notch) et barres système
 * - Ordre des Providers (du plus externe au plus interne)
 */

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { HabitsProvider } from './src/context/HabitsContext';
import AppNavigator from './src/navigation/AppNavigator';

// 🎨 Thème de navigation sombre
const darkNavigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7C3AED',
    background: '#0F0F1A',
    card: '#1A1A2E',
    text: '#F1F5F9',
    border: '#1E293B',
    notification: '#7C3AED',
  },
};

export default function App() {
  return (
    // 1️⃣ SafeAreaProvider : gère les zones sûres de l'écran (notch, etc.)
    <SafeAreaProvider>
      {/* 2️⃣ HabitsProvider : fournit les données des habitudes à toute l'app */}
      <HabitsProvider>
        {/* 3️⃣ NavigationContainer : requis par React Navigation */}
        <NavigationContainer theme={darkNavigationTheme}>
          {/* ⚡ Barre de statut claire sur fond sombre */}
          <StatusBar style="light" />
          {/* 🗺️ Toute la navigation de l'app */}
          <AppNavigator />
        </NavigationContainer>
      </HabitsProvider>
    </SafeAreaProvider>
  );
}
