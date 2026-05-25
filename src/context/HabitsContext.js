/**
 * 🧠 HabitsContext - Le "cerveau" de l'application
 * 
 * Ce fichier utilise le Context API de React pour partager
 * les données des habitudes entre tous les écrans.
 * 
 * Concepts appris ici :
 * - createContext() : crée un "tunnel" de données global
 * - useReducer() : gestion d'état complexe (comme Redux en plus simple)
 * - AsyncStorage : stockage permanent sur l'appareil
 * - Custom Hook : useHabits() pour accéder au contexte facilement
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 📦 Clé de stockage dans AsyncStorage
const STORAGE_KEY = '@HabitTracker_habits';

// 🎯 Actions disponibles (comme des commandes)
const ACTIONS = {
  SET_HABITS: 'SET_HABITS',
  ADD_HABIT: 'ADD_HABIT',
  DELETE_HABIT: 'DELETE_HABIT',
  TOGGLE_TODAY: 'TOGGLE_TODAY',
};

// 📅 Utilitaire : obtenir la date d'aujourd'hui en format YYYY-MM-DD
const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 🔄 Reducer : fonction pure qui gère les changements d'état
// Pattern : (état actuel, action) => nouvel état
const habitsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_HABITS:
      return action.payload;

    case ACTIONS.ADD_HABIT: {
      return [...state, action.payload];
    }

    case ACTIONS.DELETE_HABIT: {
      return state.filter(habit => habit.id !== action.payload);
    }

    case ACTIONS.TOGGLE_TODAY: {
      const today = getTodayKey();
      return state.map(habit => {
        if (habit.id !== action.payload) return habit;
        
        const completedDates = habit.completedDates || [];
        const alreadyDone = completedDates.includes(today);
        
        return {
          ...habit,
          completedDates: alreadyDone
            ? completedDates.filter(d => d !== today) // décocher
            : [...completedDates, today], // cocher
        };
      });
    }

    default:
      return state;
  }
};

// 🌐 Création du contexte
const HabitsContext = createContext(null);

// 🏭 Provider : composant qui enveloppe l'app et fournit les données
export const HabitsProvider = ({ children }) => {
  const [habits, dispatch] = useReducer(habitsReducer, []);

  // 📂 Charger les habitudes depuis le stockage au démarrage
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          dispatch({ type: ACTIONS.SET_HABITS, payload: JSON.parse(stored) });
        }
      } catch (error) {
        console.error('Erreur chargement habitudes:', error);
      }
    };
    loadHabits();
  }, []);

  // 💾 Sauvegarder automatiquement chaque fois que les habitudes changent
  useEffect(() => {
    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
      } catch (error) {
        console.error('Erreur sauvegarde habitudes:', error);
      }
    };
    saveHabits();
  }, [habits]);

  // ➕ Ajouter une nouvelle habitude
  const addHabit = (name, emoji, color) => {
    const newHabit = {
      id: Date.now().toString(),
      name,
      emoji,
      color,
      createdAt: getTodayKey(),
      completedDates: [],
    };
    dispatch({ type: ACTIONS.ADD_HABIT, payload: newHabit });
  };

  // 🗑️ Supprimer une habitude
  const deleteHabit = (id) => {
    dispatch({ type: ACTIONS.DELETE_HABIT, payload: id });
  };

  // ✅ Cocher/décocher une habitude pour aujourd'hui
  const toggleToday = (id) => {
    dispatch({ type: ACTIONS.TOGGLE_TODAY, payload: id });
  };

  // 📊 Calculer le streak (série de jours consécutifs)
  const getStreak = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const sorted = [...habit.completedDates].sort().reverse();
    let streak = 0;
    let current = new Date();
    
    for (const dateStr of sorted) {
      const date = new Date(dateStr);
      const diffDays = Math.floor((current - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        current = date;
      } else {
        break;
      }
    }
    return streak;
  };

  // ✅ Vérifier si une habitude est complétée aujourd'hui
  const isDoneToday = (habit) => {
    const today = getTodayKey();
    return (habit.completedDates || []).includes(today);
  };

  // 📈 Taux de complétion des 7 derniers jours
  const getWeeklyRate = (habit) => {
    const completedDates = habit.completedDates || [];
    let done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (completedDates.includes(d.toISOString().split('T')[0])) done++;
    }
    return Math.round((done / 7) * 100);
  };

  return (
    <HabitsContext.Provider value={{
      habits,
      addHabit,
      deleteHabit,
      toggleToday,
      getStreak,
      isDoneToday,
      getWeeklyRate,
      getTodayKey,
    }}>
      {children}
    </HabitsContext.Provider>
  );
};

// 🪝 Custom Hook : raccourci pour utiliser le contexte
export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits doit être utilisé dans un HabitsProvider');
  }
  return context;
};
