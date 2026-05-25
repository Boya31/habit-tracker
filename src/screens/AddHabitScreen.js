/**
 * ➕ AddHabitScreen - Écran d'ajout d'habitude
 * 
 * Formulaire interactif pour créer une nouvelle habitude.
 * 
 * Concepts appris ici :
 * - TextInput : champ de saisie texte
 * - ScrollView : vue scrollable pour les formulaires
 * - KeyboardAvoidingView : évite que le clavier cache le formulaire
 * - useState pour gérer les valeurs du formulaire
 * - Validation des données
 * - Navigation (retour à l'écran précédent)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHabits } from '../context/HabitsContext';
import { COLORS } from '../utils/colors';

// 🎭 Liste d'emojis disponibles
const EMOJIS = [
  '💪', '🏃', '🧘', '📚', '💧', '🥗', '😴', '🎯',
  '✍️', '🎸', '🖥️', '🌿', '🏋️', '🚴', '🧠', '💊',
  '🫁', '🌅', '🎨', '🎻', '📱', '🚶', '🫶', '⭐',
  '🌟', '🔥', '💡', '🎮', '🏊', '🧹', '💰', '🌍',
];

// 🎨 Couleurs disponibles pour les habitudes
const HABIT_COLORS = COLORS.habitColors;

export default function AddHabitScreen({ navigation }) {
  const { addHabit } = useHabits();

  // 📝 État du formulaire
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💪');
  const [selectedColor, setSelectedColor] = useState(COLORS.habitColors[0]);

  // 🎞️ Animation d'entrée
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  // ✅ Soumettre le formulaire
  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Nom requis', 'Entre un nom pour ton habitude !');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Nom trop court', 'Le nom doit avoir au moins 2 caractères.');
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addHabit(name.trim(), selectedEmoji, selectedColor);
    navigation.goBack();
  };

  // 🎨 Prévisualisation de la carte
  const PreviewCard = () => (
    <View style={[styles.previewCard, { borderColor: selectedColor + '80' }]}>
      <View style={[styles.previewColorBar, { backgroundColor: selectedColor }]} />
      <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
      <Text style={styles.previewName} numberOfLines={1}>
        {name || 'Nom de l\'habitude'}
      </Text>
      <View style={styles.previewDots}>
        {[...Array(7)].map((_, i) => (
          <View key={i} style={[styles.previewDot, { backgroundColor: selectedColor + '40' }]} />
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1A']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle habitude</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Prévisualisation */}
          <Text style={styles.sectionLabel}>Aperçu</Text>
          <PreviewCard />

          {/* Nom de l'habitude */}
          <Text style={styles.sectionLabel}>Nom de l'habitude *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="pencil" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Méditer 10 min, Boire de l'eau..."
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={40}
              autoFocus={false}
              returnKeyType="done"
            />
          </View>
          <Text style={styles.charCount}>{name.length}/40</Text>

          {/* Choix de l'emoji */}
          <Text style={styles.sectionLabel}>Emoji représentatif</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && {
                    backgroundColor: selectedColor + '30',
                    borderColor: selectedColor,
                  },
                ]}
                onPress={async () => {
                  setSelectedEmoji(emoji);
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Choix de la couleur */}
          <Text style={styles.sectionLabel}>Couleur</Text>
          <View style={styles.colorGrid}>
            {HABIT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected,
                ]}
                onPress={async () => {
                  setSelectedColor(color);
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Bouton de création */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[selectedColor, selectedColor + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add-circle" size={22} color={COLORS.white} />
              <Text style={styles.createButtonText}>Créer l'habitude</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Conseil */}
          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={16} color={COLORS.warning} />
            <Text style={styles.tipText}>
              💡 <Text style={{ fontWeight: '700' }}>Conseil :</Text> Maintiens l'habitude 21 jours
              de suite pour qu'elle devienne automatique et efficace!
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },
  // Prévisualisation
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    padding: 0,
    gap: 12,
    paddingRight: 14,
  },
  previewColorBar: {
    width: 5,
    height: 64,
  },
  previewEmoji: {
    fontSize: 28,
  },
  previewName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewDots: {
    flexDirection: 'row',
    gap: 4,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  // Emojis
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  // Couleurs
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  // Bouton créer
  createButton: {
    marginTop: 28,
    borderRadius: 18,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  // Conseil
  tipBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
