/**
 * 🏠 HomeScreen - Écran principal
 * 
 * C'est l'écran qu'on voit en ouvrant l'app.
 * Il affiche toutes les habitudes du jour.
 * 
 * Concepts appris ici :
 * - useState : état local du composant
 * - FlatList : liste performante pour afficher des données
 * - TouchableOpacity : bouton avec effet de tap
 * - Animated : animations natives performantes
 * - StyleSheet : styles CSS-like pour React Native
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';
import { COLORS } from '../utils/colors';
import HabitCard from '../components/HabitCard';

const { width } = Dimensions.get('window');

// 📅 Noms des jours en français
const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function HomeScreen({ navigation }) {
  const { habits, isDoneToday } = useHabits();

  // 🎞️ Valeur d'animation pour l'entrée du header
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée du header
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // 📊 Calcul des statistiques du jour
  const today = new Date();
  const todayStr = `${DAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]}`;
  const doneCount = habits.filter(h => isDoneToday(h)).length;
  const totalCount = habits.length;
  const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // 🎨 Message motivant selon le pourcentage
  const getMotivation = () => {
    if (totalCount === 0) return 'Ajoute ta première habitude ! 🚀';
    if (percentage === 100) return 'Parfait ! Toutes tes habitudes sont faites ! 🔥';
    if (percentage >= 75) return 'Excellent ! Continue comme ça ! 💪';
    if (percentage >= 50) return 'Bien ! Plus que quelques efforts ! ⭐';
    if (percentage > 0) return 'C\'est un bon début, continue ! 👊';
    return 'C\'est l\'heure de commencer ta journée ! ☀️';
  };

  // 🔵 Barre de progression animée
  const ProgressBar = ({ value, total }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pct = total > 0 ? value / total : 0;

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: pct,
        duration: 1000,
        delay: 300,
        useNativeDriver: false, // width ne supporte pas le native driver
      }).start();
    }, [value, total]);

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: percentage === 100 ? COLORS.success : COLORS.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    );
  };

  // 📅 Mini-calendrier des 7 derniers jours
  const WeekCalendar = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dayName: DAYS[d.getDay()],
        dayNum: d.getDate(),
        isToday: i === 0,
        dateStr: d.toISOString().split('T')[0],
      });
    }

    return (
      <View style={styles.weekCalendar}>
        {days.map((day, index) => (
          <View
            key={index}
            style={[styles.dayCell, day.isToday && styles.dayCellToday]}
          >
            <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
              {day.dayName}
            </Text>
            <Text style={[styles.dayNum, day.isToday && styles.dayNumToday]}>
              {day.dayNum}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* 🎨 Header avec gradient */}
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={['#1A1A2E', '#16213E', '#0F0F1A']}
          style={styles.header}
        >
          {/* Titre et date */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Prêt pour aujourd'hui ? 1X fois chétté ! 🚀 N'oublie pas aussi que son concert est le 28 mai heinnnn
                
              </Text>
              <Text style={styles.dateText}>{todayStr}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddHabit')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primaryLight, COLORS.primary]}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={28} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Message de motivation */}
          <Text style={styles.motivation}>{getMotivation()}</Text>

          {/* Stats du jour */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{doneCount}</Text>
              <Text style={styles.statLabel}>Complétées</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalCount - doneCount}</Text>
              <Text style={styles.statLabel}>Restantes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Barre de progression */}
          <ProgressBar value={doneCount} total={totalCount} />

          {/* Mini calendrier */}
          <WeekCalendar />
        </LinearGradient>
      </Animated.View>

      {/* 📋 Liste des habitudes */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            {habits.length === 0 ? '' : `Mes habitudes (${habits.length})`}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Aucune habitude</Text>
            <Text style={styles.emptySubtitle}>
              Appuie sur le bouton + pour créer ta première habitude !
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddHabit')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primaryLight, COLORS.primary]}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>Créer une habitude</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => (
          <HabitCard habit={item} index={index} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivation: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    minWidth: 38,
  },
  dayCellToday: {
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  dayName: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNameToday: {
    color: COLORS.primaryLight,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dayNumToday: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
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
    marginBottom: 28,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
