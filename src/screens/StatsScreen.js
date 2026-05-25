/**
 * 📊 StatsScreen - Écran des statistiques
 * 
 * Affiche des graphiques et statistiques sur les habitudes.
 * 
 * Concepts appris ici :
 * - useMemo : mémoriser des calculs coûteux
 * - Rendu conditionnel (if/else dans JSX)
 * - Calculs de données / agrégation
 * - Composants purement visuels (graphiques custom)
 */

import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';
import { COLORS } from '../utils/colors';

const { width } = Dimensions.get('window');
const BAR_CHART_HEIGHT = 140;
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function StatsScreen() {
  const { habits, isDoneToday, getStreak, getWeeklyRate } = useHabits();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // 📊 Calcul des données pour les graphiques (mémoïsé = recalculé seulement si habits change)
  const stats = useMemo(() => {
    if (habits.length === 0) return null;

    // Taux de complétion par jour (7 derniers jours)
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const done = habits.filter(h =>
        (h.completedDates || []).includes(dateStr)
      ).length;
      
      weekData.push({
        day: DAYS_FR[d.getDay()],
        done,
        total: habits.length,
        rate: habits.length > 0 ? done / habits.length : 0,
        isToday: i === 0,
      });
    }

    // Total jours complétés (toutes habitudes confondues)
    const allDates = new Set();
    habits.forEach(h => (h.completedDates || []).forEach(d => allDates.add(d)));
    const totalCompletions = habits.reduce(
      (sum, h) => sum + (h.completedDates || []).length, 0
    );

    // Meilleure habitude (streak le plus long)
    const bestHabit = habits.reduce((best, h) => {
      const s = getStreak(h);
      return s > (best ? getStreak(best) : 0) ? h : best;
    }, null);

    // Habitude la plus régulière cette semaine
    const mostConsistent = habits.reduce((best, h) => {
      const r = getWeeklyRate(h);
      return r > (best ? getWeeklyRate(best) : -1) ? h : best;
    }, null);

    return { weekData, totalCompletions, allDates: allDates.size, bestHabit, mostConsistent };
  }, [habits]);

  // 📈 Graphique en barres
  const BarChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.done), 1);
    
    return (
      <View style={styles.barChart}>
        {data.map((day, i) => {
          const barHeight = Math.max((day.done / maxVal) * BAR_CHART_HEIGHT, day.done > 0 ? 8 : 0);
          const barAnim = useRef(new Animated.Value(0)).current;
          
          useEffect(() => {
            Animated.timing(barAnim, {
              toValue: barHeight,
              duration: 600,
              delay: i * 60,
              useNativeDriver: false,
            }).start();
          }, []);

          return (
            <View key={i} style={styles.barGroup}>
              <Text style={styles.barValue}>{day.done > 0 ? day.done : ''}</Text>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      height: barAnim,
                      backgroundColor: day.isToday ? COLORS.primary : COLORS.primaryLight + '80',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, day.isToday && { color: COLORS.primaryLight }]}>
                {day.day}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // 🃏 Carte de stat
  const StatCard = ({ icon, label, value, color, subtitle }) => (
    <View style={[styles.statCard, { borderColor: color + '40' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (habits.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#1A1A2E', '#0F0F1A']} style={styles.header}>
          <Text style={styles.headerTitle}>📊 Statistiques</Text>
        </LinearGradient>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📈</Text>
          <Text style={styles.emptyTitle}>Aucune donnée</Text>
          <Text style={styles.emptySubtitle}>
            Crée des habitudes et commence à les suivre pour voir tes statistiques ici !
          </Text>
        </View>
      </View>
    );
  }

  const todayCount = habits.filter(h => isDoneToday(h)).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0);
  const avgWeeklyRate = Math.round(
    habits.reduce((sum, h) => sum + getWeeklyRate(h), 0) / habits.length
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#1A1A2E', '#0F0F1A']} style={styles.header}>
        <Text style={styles.headerTitle}>📊 Statistiques</Text>
        <Text style={styles.headerSubtitle}>{habits.length} habitude{habits.length > 1 ? 's' : ''} suivie{habits.length > 1 ? 's' : ''}</Text>
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cartes de stats */}
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="today"
            label="Aujourd'hui"
            value={`${todayCount}/${habits.length}`}
            color={COLORS.primary}
            subtitle="complétées"
          />
          <StatCard
            icon="flame"
            label="Meilleur streak"
            value={`${bestStreak}j`}
            color="#F59E0B"
            subtitle="consécutifs"
          />
          <StatCard
            icon="trending-up"
            label="Taux 7 jours"
            value={`${avgWeeklyRate}%`}
            color={COLORS.success}
            subtitle="moyenne"
          />
          <StatCard
            icon="trophy"
            label="Complétions"
            value={stats?.totalCompletions || 0}
            color={COLORS.accent}
            subtitle="au total"
          />
        </View>

        {/* Graphique en barres */}
        <Text style={styles.sectionTitle}>Activité cette semaine</Text>
        <View style={styles.chartCard}>
          <Text style={styles.chartCaption}>Habitudes complétées par jour</Text>
          {stats && <BarChart data={stats.weekData} />}
        </View>

        {/* Classement des habitudes */}
        <Text style={styles.sectionTitle}>Performance par habitude</Text>
        {habits
          .slice()
          .sort((a, b) => getWeeklyRate(b) - getWeeklyRate(a))
          .map((habit, index) => {
            const rate = getWeeklyRate(habit);
            const streak = getStreak(habit);
            
            return (
              <View key={habit.id} style={styles.habitRankCard}>
                <Text style={styles.rankNum}>#{index + 1}</Text>
                <Text style={styles.rankEmoji}>{habit.emoji}</Text>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName} numberOfLines={1}>{habit.name}</Text>
                  <View style={styles.rankBar}>
                    <View
                      style={[
                        styles.rankBarFill,
                        { width: `${rate}%`, backgroundColor: habit.color },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.rankStats}>
                  <Text style={[styles.rankRate, { color: habit.color }]}>{rate}%</Text>
                  {streak > 0 && (
                    <Text style={styles.rankStreak}>🔥 {streak}</Text>
                  )}
                </View>
              </View>
            );
          })}

        {/* Encadré meilleure habitude */}
        {stats?.bestHabit && getStreak(stats.bestHabit) > 0 && (
          <LinearGradient
            colors={[stats.bestHabit.color + '30', stats.bestHabit.color + '10']}
            style={styles.highlightCard}
          >
            <View style={styles.highlightHeader}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.highlightTitle}>Meilleure série en cours</Text>
            </View>
            <Text style={styles.highlightHabit}>
              {stats.bestHabit.emoji} {stats.bestHabit.name}
            </Text>
            <Text style={styles.highlightStat}>
              🔥 {getStreak(stats.bestHabit)} jour{getStreak(stats.bestHabit) > 1 ? 's' : ''} consécutif{getStreak(stats.bestHabit) > 1 ? 's' : ''} !
            </Text>
          </LinearGradient>
        )}

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
  },
  // Grille de stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  // Graphique
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartCaption: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 16,
    textAlign: 'center',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: BAR_CHART_HEIGHT + 40,
  },
  barGroup: {
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    height: 16,
  },
  barTrack: {
    width: 28,
    height: BAR_CHART_HEIGHT,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  // Classement
  habitRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankNum: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
    width: 24,
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  rankBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  rankBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  rankStats: {
    alignItems: 'flex-end',
  },
  rankRate: {
    fontSize: 15,
    fontWeight: '800',
  },
  rankStreak: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Highlight
  highlightCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  highlightTitle: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightHabit: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  highlightStat: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
