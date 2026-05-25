/**
 * 🗺️ Navigation - Configuration de la navigation
 * 
 * Ce fichier configure toute la navigation de l'app.
 * 
 * Concepts appris ici :
 * - Stack Navigator : navigation en pile (écrans superposés)
 * - Bottom Tab Navigator : navigation par onglets en bas
 * - Imbrication de navigateurs (Tab dans Stack)
 * - Personnalisation des onglets (icônes, couleurs)
 * - headerShown : contrôle l'affichage du header natif
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import { COLORS } from '../utils/colors';

// Création des navigateurs
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 📐 Icône de tab avec indicateur actif
const TabIcon = ({ name, focused, color }) => (
  <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={24}
      color={color}
    />
  </View>
);

// 🗂️ Navigation par onglets (Tab Bar)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // On gère notre propre header dans chaque écran
        tabBarStyle: {
          backgroundColor: COLORS.backgroundSecondary,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Habitudes',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="checkmark-circle" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Statistiques',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="bar-chart" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 📚 Navigation principale en Stack
// La TabBar est à la racine, AddHabit s'ouvre par dessus en modal
export default function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* Écran principal avec tabs */}
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Écran d'ajout en mode modal (slide from bottom) */}
      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{
          headerShown: false,
          presentation: 'modal', // 📱 Effet modal natif
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconActive: {
    backgroundColor: COLORS.primaryGlow,
  },
});
