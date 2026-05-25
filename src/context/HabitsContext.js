/**
 * ðŸ§  HabitsContext - Le "cerveau" de l'application
 * 
 * Maintenant connectÃ© Ã  Supabase â˜ï¸
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../../services/supabase';
// ðŸŽ¯ Actions disponibles
const ACTIONS = {
  SET_HABITS: 'SET_HABITS',
  ADD_HABIT: 'ADD_HABIT',
  DELETE_HABIT: 'DELETE_HABIT',
  TOGGLE_TODAY: 'TOGGLE_TODAY',
};

// ðŸ“… Date du jour
const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// ðŸ”„ Reducer
const habitsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_HABITS:
      return action.payload;

    case ACTIONS.ADD_HABIT:
      return [...state, action.payload];

    case ACTIONS.DELETE_HABIT:
      return state.filter(habit => habit.id !== action.payload);

    case ACTIONS.TOGGLE_TODAY: {
      const today = getTodayKey();

      return state.map(habit => {
        if (habit.id !== action.payload) return habit;

        const completedDates = habit.completedDates || [];
        const alreadyDone = completedDates.includes(today);

        return {
          ...habit,
          completedDates: alreadyDone
            ? completedDates.filter(d => d !== today)
            : [...completedDates, today],
        };
      });
    }

    default:
      return state;
  }
};

// ðŸŒ Contexte
const HabitsContext = createContext(null);

// ðŸ­ Provider
export const HabitsProvider = ({ children }) => {
  const [habits, dispatch] = useReducer(habitsReducer, []);

  // ðŸ“‚ Charger les habitudes depuis Supabase
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*');

        if (error) {
          console.error('Erreur Supabase:', error);
        } else {
          dispatch({
            type: ACTIONS.SET_HABITS,
            payload: data,
          });
        }
      } catch (error) {
        console.error('Erreur chargement habitudes:', error);
      }
    };

    loadHabits();
  }, []);

  // âž• Ajouter une habitude
  const addHabit = async (name, emoji = '💪', color = '#7C3AED') => {
    const newHabit = {
      name,
      emoji,
      color,
      createdAt: getTodayKey(),
      completedDates: [],
    };

    const { data, error } = await supabase 
      .from('habits')
      .insert(newHabit)
      .select()
      .single();

    if (error) {
      console.error('Erreur ajout habitude:', error);
      return;
    }

    dispatch({
      type: ACTIONS.ADD_HABIT,
      payload: data,
    });
  };

  // ðŸ—‘ï¸ Supprimer une habitude
  const deleteHabit = async (id) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression:', error);
      return;
    }

    dispatch({
      type: ACTIONS.DELETE_HABIT,
      payload: id,
    });
  };

  // âœ… Cocher / dÃ©cocher aujourdâ€™hui
  const toggleToday = async (id) => {
    const today = getTodayKey();

    const habit = habits.find(h => h.id === id);

    if (!habit) return;

    const completedDates = habit.completedDates || [];
    const alreadyDone = completedDates.includes(today);

    const updatedDates = alreadyDone
      ? completedDates.filter(d => d !== today)
      : [...completedDates, today];

    const { error } = await supabase
      .from('habits')
      .update({
        completedDates: updatedDates,
      })
      .eq('id', id);

    if (error) {
      console.error('Erreur mise Ã  jour:', error);
      return;
    }

    dispatch({
      type: ACTIONS.TOGGLE_TODAY,
      payload: id,
    });
  };

  // ðŸ“Š Calcul du streak
  const getStreak = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) {
      return 0;
    }

    const sorted = [...habit.completedDates].sort().reverse();

    let streak = 0;
    let current = new Date();

    for (const dateStr of sorted) {
      const date = new Date(dateStr);

      const diffDays = Math.floor(
        (current - date) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 1) {
        streak++;
        current = date;
      } else {
        break;
      }
    }

    return streak;
  };

  // âœ… VÃ©rifie si fait aujourdâ€™hui
  const isDoneToday = (habit) => {
    const today = getTodayKey();
    return (habit.completedDates || []).includes(today);
  };

  // ðŸ“ˆ Taux de complÃ©tion sur 7 jours
  const getWeeklyRate = (habit) => {
    const completedDates = habit.completedDates || [];

    let done = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date();

      d.setDate(d.getDate() - i);

      if (
        completedDates.includes(
          d.toISOString().split('T')[0]
        )
      ) {
        done++;
      }
    }

    return Math.round((done / 7) * 100);
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        addHabit,
        deleteHabit,
        toggleToday,
        getStreak,
        isDoneToday,
        getWeeklyRate,
        getTodayKey,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

// ðŸª Hook personnalisÃ©
export const useHabits = () => {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error(
      'useHabits doit Ãªtre utilisÃ© dans un HabitsProvider'
    );
  }

  return context;
};
