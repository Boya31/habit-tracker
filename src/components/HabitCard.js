/**
 * ðŸƒ HabitCard - Carte d'une habitude
 * 
 * Composant rÃ©utilisable qui affiche une habitude.
 * 
 * Concepts appris ici :
 * - Composants rÃ©utilisables (les briques de base de React)
 * - Props : donnÃ©es passÃ©es depuis le parent
 * - Animated.Value : valeur numÃ©rique animable
 * - Spring animation : animation avec effet de ressort
 * - Swipe pour supprimer (via PanResponder simplifiÃ©)
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHabits } from '../context/HabitsContext';
import { COLORS } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function HabitCard({ habit, index }) {
  const { toggleToday, deleteHabit, isDoneToday, getStreak, getWeeklyRate } = useHabits();
  const done = isDoneToday(habit);
  const habitColor = habit.color || COLORS.primary;
  const habitEmoji = habit.emoji || '💪';
  const streak = getStreak(habit);
  const weeklyRate = getWeeklyRate(habit);

  // ðŸŽžï¸ Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;    // EntrÃ©e de la carte
  const checkAnim = useRef(new Animated.Value(done ? 1 : 0)).current; // Coche
  const glowAnim = useRef(new Animated.Value(0)).current;     // Effet lumineux

  // Animation d'entrÃ©e avec dÃ©lai selon l'index (effet cascadÃ©)
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      delay: index * 80, // Chaque carte entre avec 80ms de dÃ©calage
      useNativeDriver: true,
    }).start();
  }, []);

  // Synchroniser l'animation de coche avec l'Ã©tat
  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: done ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (done) {
      // Animation de lueur quand complÃ©tÃ©
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]).start();
    }
  }, [done]);

  // âœ… GÃ©rer le tap sur la carte
  const handleToggle = async () => {
    // ðŸ“³ Vibration tactile (feedback haptique)
    await Haptics.impactAsync(
      done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    );
    toggleToday(habit.id);
  };

  // ðŸ—‘ï¸ Confirmer la suppression
  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette habitude ?',
      `"${habit.name}" sera supprimÃ©e dÃ©finitivement.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteHabit(habit.id),
        },
      ]
    );
  };

  // ðŸ“… Mini-calendrier des 7 derniers jours pour cette habitude
  const MiniWeek = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isCompleted = (habit.completedDates || []).includes(dateStr);
      const isToday = i === 0;
      days.push({ isCompleted, isToday });
    }

    return (
      <View style={styles.miniWeek}>
        {days.map((day, i) => (
          <View
            key={i}
            style={[
              styles.miniDot,
              day.isCompleted && { backgroundColor: habitColor },
              day.isToday && styles.miniDotToday,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          done && styles.cardDone,
        ]}
        onPress={handleToggle}
        onLongPress={handleDelete}
        activeOpacity={0.85}
        delayLongPress={600}
      >
        {/* Trait de couleur Ã  gauche */}
        <View style={[styles.colorBar, { backgroundColor: habitColor }]} />

        {/* Contenu principal */}
        <View style={styles.cardContent}>
          {/* Ligne du haut : emoji + nom + bouton check */}
          <View style={styles.cardTop}>
            <View style={styles.habitInfo}>
              <Text style={styles.habitEmoji}>{habitEmoji}</Text>
              <View style={styles.habitTexts}>
                <Text
                  style={[styles.habitName, done && styles.habitNameDone]}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
                <View style={styles.badgesRow}>
                  {streak > 0 && (
                    <View style={styles.badge}>
                      <Ionicons name="flame" size={11} color="#F59E0B" />
                      <Text style={styles.badgeText}>{streak} jour{streak > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                  <View style={styles.badge}>
                    <Ionicons name="bar-chart" size={11} color={COLORS.accent} />
                    <Text style={[styles.badgeText, { color: COLORS.accent }]}>{weeklyRate}% cette semaine</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bouton de complÃ©tion animÃ© */}
            <Animated.View
              style={[
                styles.checkButton,
                {
                  backgroundColor: checkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(0,0,0,0)', habitColor],
                  }),
                  borderColor: habitColor,
                  transform: [{
                    scale: checkAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.3, 1],
                    }),
                  }],
                },
              ]}
            >
              <Animated.View style={{
                opacity: checkAnim,
                transform: [{
                  scale: checkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                }],
              }}>
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Mini-calendrier semaine */}
          <MiniWeek />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardDone: {
    borderColor: COLORS.borderLight,
    opacity: 0.85,
  },
  colorBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitEmoji: {
    fontSize: 30,
    marginRight: 12,
  },
  habitTexts: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  habitNameDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  badgeText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  miniWeek: {
    flexDirection: 'row',
    gap: 5,
  },
  miniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  miniDotToday: {
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
  },
});

