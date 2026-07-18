// src/screens/doctor/DoctorSettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const THEME_KEY = '@sehatline_theme';

// ─── Mock Reviews Data (Realistic - 18 reviews) ──────────────────────
const generateMockReviews = () => {
  const comments = [
    'Excellent doctor! Very professional and caring.',
    'Great experience, explained everything clearly.',
    'Best cardiologist in the city. Highly recommended.',
    'Very thorough examination. Great doctor.',
    'Professional and knowledgeable. Will visit again.',
    'Amazing doctor! Treated my father with great care.',
    'Very satisfied with the consultation.',
    'Good doctor but waiting time was long.',
    'Excellent service and diagnosis.',
    'Very polite and understanding doctor.',
    'Highly skilled professional. Trustworthy.',
    'Great doctor! My health improved significantly.',
    'Professional approach. Clear communication.',
    'Very experienced doctor. Highly recommended.',
    'Good consultation. Satisfied with treatment.',
    'Excellent doctor! Saved my life.',
    'Very caring and compassionate.',
    'Best doctor ever! Truly professional.',
    'Great experience. Will recommend to family.',
    'Very knowledgeable and helpful.',
    'Excellent care and treatment.',
    'Professional and friendly doctor.',
  ];

  const ratings = [5, 5, 5, 4, 5, 5, 4, 3, 5, 5, 4, 5, 4, 5, 4, 5, 5, 5];
  const dates = [
    'Today', 'Yesterday', '2 days ago', '3 days ago', '4 days ago',
    '5 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago',
    '2 months ago', '3 months ago', '4 months ago', '5 months ago', '6 months ago',
    '7 months ago', '8 months ago', '9 months ago'
  ];

  return comments.slice(0, 18).map((comment, index) => ({
    id: (index + 1).toString(),
    rating: ratings[index % ratings.length],
    comment: comment,
    date: dates[index % dates.length],
  }));
};

const MOCK_REVIEWS = generateMockReviews();

const DoctorSettingsScreen = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [queueUpdates, setQueueUpdates] = useState(true);
  const [adminMessages, setAdminMessages] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // ─── Biometric State ─────────────────────────────────────────────
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // ─── Reviews State ───────────────────────────────────────────────
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });
  const [totalReviews, setTotalReviews] = useState(0);

  // ─── Clinical Preferences ──────────────────────────────────────────
  const [consultationDuration, setConsultationDuration] = useState('15');
  const [notesTemplate, setNotesTemplate] = useState('General Checkup');
  const [autoSaveNotes, setAutoSaveNotes] = useState(true);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // ─── Doctor Availability ────────────────────────────────────────────
  const [isAvailable, setIsAvailable] = useState(true);
  const [acceptEmergency, setAcceptEmergency] = useState(true);

  useEffect(() => {
    loadSettings();
    loadBiometricStatus();
    loadClinicalPreferences();
    loadAvailability();
    calculateReviewStats();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
      
      const notif = await AsyncStorage.getItem('@sehatline_notifications');
      if (notif !== null) {
        setNotificationsEnabled(JSON.parse(notif));
      }
      
      const reminders = await AsyncStorage.getItem('@sehatline_appointment_reminders');
      if (reminders !== null) {
        setAppointmentReminders(JSON.parse(reminders));
      }
      
      const queue = await AsyncStorage.getItem('@sehatline_queue_updates');
      if (queue !== null) {
        setQueueUpdates(JSON.parse(queue));
      }
      
      const admin = await AsyncStorage.getItem('@sehatline_admin_messages');
      if (admin !== null) {
        setAdminMessages(JSON.parse(admin));
      }
      
      const vibration = await AsyncStorage.getItem('@sehatline_vibration');
      if (vibration !== null) {
        setVibrationEnabled(JSON.parse(vibration));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadClinicalPreferences = async () => {
    try {
      const duration = await AsyncStorage.getItem('@sehatline_consultation_duration');
      if (duration) setConsultationDuration(duration);
      
      const template = await AsyncStorage.getItem('@sehatline_notes_template');
      if (template) setNotesTemplate(template);
      
      const autoSave = await AsyncStorage.getItem('@sehatline_auto_save_notes');
      if (autoSave !== null) setAutoSaveNotes(JSON.parse(autoSave));
    } catch (error) {
      console.error('Error loading clinical preferences:', error);
    }
  };

  const loadAvailability = async () => {
    try {
      const available = await AsyncStorage.getItem('@sehatline_doctor_available');
      if (available !== null) setIsAvailable(JSON.parse(available));
      
      const emergency = await AsyncStorage.getItem('@sehatline_accept_emergency');
      if (emergency !== null) setAcceptEmergency(JSON.parse(emergency));
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const loadBiometricStatus = async () => {
    try {
      const bio = await AsyncStorage.getItem('@sehatline_biometric');
      setBiometricEnabled(bio === 'true');
    } catch (error) {
      console.error('Error loading biometric status:', error);
    }
  };

  const calculateReviewStats = () => {
    if (reviews.length === 0) {
      setAverageRating(0);
      setTotalReviews(0);
      return;
    }

    // Calculate average
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating(parseFloat((total / reviews.length).toFixed(1)));
    setTotalReviews(reviews.length);

    // Calculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (distribution[review.rating] !== undefined) {
        distribution[review.rating]++;
      }
    });
    setRatingDistribution(distribution);
  };

  // ─── DARK MODE ────────────────────────────────────────────────────
  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem(THEME_KEY, value ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // ─── NOTIFICATIONS ────────────────────────────────────────────────
  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('@sehatline_notifications', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  const toggleAppointmentReminders = async (value) => {
    setAppointmentReminders(value);
    try {
      await AsyncStorage.setItem('@sehatline_appointment_reminders', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving appointment reminders:', error);
    }
  };

  const toggleQueueUpdates = async (value) => {
    setQueueUpdates(value);
    try {
      await AsyncStorage.setItem('@sehatline_queue_updates', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving queue updates:', error);
    }
  };

  const toggleAdminMessages = async (value) => {
    setAdminMessages(value);
    try {
      await AsyncStorage.setItem('@sehatline_admin_messages', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving admin messages:', error);
    }
  };

  const toggleVibration = async (value) => {
    setVibrationEnabled(value);
    try {
      await AsyncStorage.setItem('@sehatline_vibration', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving vibration preference:', error);
    }
  };

  // ─── BIOMETRIC ─────────────────────────────────────────────────────
  const handleBiometric = () => {
    if (biometricEnabled) {
      Alert.alert(
        'Disable Biometric',
        'Are you sure you want to disable biometric login?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.setItem('@sehatline_biometric', 'false');
                setBiometricEnabled(false);
                Alert.alert('Success', 'Biometric login disabled.');
              } catch (error) {
                console.error('Error disabling biometric:', error);
              }
            },
          },
        ]
      );
    } else {
      setShowBiometricModal(true);
    }
  };

  const handleBiometricSetup = async () => {
    setIsBiometricLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await AsyncStorage.setItem('@sehatline_biometric', 'true');
      setBiometricEnabled(true);
      Alert.alert('Success', 'Biometric login enabled successfully!');
      setShowBiometricModal(false);
    } catch (error) {
      console.error('Error setting up biometric:', error);
      Alert.alert('Error', 'Failed to enable biometric login.');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // ─── CLINICAL PREFERENCES ──────────────────────────────────────────
  const saveClinicalPreferences = async () => {
    try {
      await AsyncStorage.setItem('@sehatline_consultation_duration', consultationDuration);
      await AsyncStorage.setItem('@sehatline_notes_template', notesTemplate);
      await AsyncStorage.setItem('@sehatline_auto_save_notes', JSON.stringify(autoSaveNotes));
      Alert.alert('Success', 'Clinical preferences saved!');
    } catch (error) {
      console.error('Error saving clinical preferences:', error);
      Alert.alert('Error', 'Failed to save preferences.');
    }
  };

  // ─── AVAILABILITY ──────────────────────────────────────────────────
  const saveAvailability = async () => {
    try {
      await AsyncStorage.setItem('@sehatline_doctor_available', JSON.stringify(isAvailable));
      await AsyncStorage.setItem('@sehatline_accept_emergency', JSON.stringify(acceptEmergency));
      Alert.alert('Success', 'Availability updated!');
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to update availability.');
    }
  };

  // ─── PRIVACY POLICY ──────────────────────────────────────────────
  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'SehatLine is committed to protecting your privacy.\n\n' +
      '• Your data is stored securely\n' +
      '• Only authorized hospital staff can access patient records\n' +
      '• All communications are encrypted\n' +
      '• Data is used only for healthcare purposes\n\n' +
      'For more information, contact Hospital Administration.',
      [{ text: 'OK' }]
    );
  };

  // ─── LOGOUT ──────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'user',
                'userData',
                'isLoggedIn',
                'userRole',
                '@sehatline_userData',
                '@sehatline_token',
              ]);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  // ─── Render Stars ──────────────────────────────────────────────────
  const renderStars = (rating, size = 3.5) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={wp(size)}
            color={star <= rating ? '#FFB800' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  // ─── Render Rating Bar ─────────────────────────────────────────────
  const renderRatingBar = (rating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View style={styles.ratingBarRow}>
        <Text style={styles.ratingBarLabel}>{rating} ★</Text>
        <View style={styles.ratingBarTrack}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  // Dynamic colors based on theme
  const colors = {
    background: isDarkMode ? '#1a1a1a' : COLORS.background,
    card: isDarkMode ? '#2d2d2d' : COLORS.white,
    text: isDarkMode ? '#ffffff' : COLORS.text,
    textSecondary: isDarkMode ? '#aaaaaa' : COLORS.textSecondary,
    textLight: isDarkMode ? '#777777' : COLORS.textLight,
    border: isDarkMode ? '#3d3d3d' : COLORS.border,
    iconBg: isDarkMode ? '#3d3d3d' : COLORS.primary + '15',
    primary: COLORS.primary,
  };

  // ─── Option Picker Modal ──────────────────────────────────────────
  const renderOptionPicker = (visible, options, selected, onSelect, onClose, title) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.pickerOption,
                  selected === option && styles.pickerOptionActive,
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  selected === option && styles.pickerOptionTextActive,
                ]}>
                  {option}
                </Text>
                {selected === option && (
                  <Ionicons name="checkmark" size={wp(4)} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Biometric Modal ──────────────────────────────────────────────
  const renderBiometricModal = () => (
    <Modal visible={showBiometricModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Enable Biometric Login</Text>
            <TouchableOpacity onPress={() => setShowBiometricModal(false)}>
              <Ionicons name="close" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.biometricIconContainer}>
              <View style={styles.biometricIconCircle}>
                <Ionicons name="finger-print" size={wp(15)} color={COLORS.primary} />
              </View>
            </View>

            <Text style={[styles.biometricTitle, { color: colors.text }]}>
              Use Fingerprint to Login
            </Text>
            <Text style={[styles.biometricDesc, { color: colors.textSecondary }]}>
              Secure your account with biometric authentication. 
              You will be able to login using your fingerprint.
            </Text>

            <View style={styles.biometricFeatures}>
              <View style={styles.biometricFeatureItem}>
                <Ionicons name="checkmark-circle" size={wp(4)} color={COLORS.success} />
                <Text style={[styles.biometricFeatureText, { color: colors.textSecondary }]}>
                  Quick and secure login
                </Text>
              </View>
              <View style={styles.biometricFeatureItem}>
                <Ionicons name="checkmark-circle" size={wp(4)} color={COLORS.success} />
                <Text style={[styles.biometricFeatureText, { color: colors.textSecondary }]}>
                  No need to remember passwords
                </Text>
              </View>
              <View style={styles.biometricFeatureItem}>
                <Ionicons name="checkmark-circle" size={wp(4)} color={COLORS.success} />
                <Text style={[styles.biometricFeatureText, { color: colors.textSecondary }]}>
                  Device-level security
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalSubmitBtn, isBiometricLoading && styles.modalSubmitDisabled]}
              onPress={handleBiometricSetup}
              disabled={isBiometricLoading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.modalSubmitGradient}
              >
                <Ionicons name="finger-print" size={wp(4)} color={COLORS.white} />
                <Text style={styles.modalSubmitText}>
                  {isBiometricLoading ? 'Setting up...' : 'Enable Fingerprint Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── Reviews Modal ──────────────────────────────────────────────────
  const renderReviewsModal = () => (
    <Modal visible={showReviewsModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.reviewsModal, { backgroundColor: colors.card }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Patient Reviews</Text>
            <TouchableOpacity onPress={() => setShowReviewsModal(false)}>
              <Ionicons name="close" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Rating Summary */}
          <View style={styles.reviewsSummary}>
            <View style={styles.averageRatingContainer}>
              <Text style={[styles.averageRatingNumber, { color: colors.text }]}>{averageRating}</Text>
              <View style={styles.averageStars}>
                {renderStars(Math.round(averageRating), 3.5)}
              </View>
              <Text style={[styles.totalReviews, { color: colors.textLight }]}>
                Based on {totalReviews} reviews
              </Text>
            </View>

            {/* Rating Distribution */}
            <View style={styles.ratingDistribution}>
              {[5, 4, 3, 2, 1].map((rating) => (
                renderRatingBar(rating, ratingDistribution[rating] || 0, totalReviews)
              ))}
            </View>
          </View>

          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.reviewsList}
            renderItem={({ item }) => (
              <View style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  {renderStars(item.rating, 3)}
                  <Text style={[styles.reviewDate, { color: colors.textLight }]}>{item.date}</Text>
                </View>
                <Text style={[styles.reviewComment, { color: colors.text }]}>{item.comment}</Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubbles-outline" size={wp(10)} color={colors.textLight} />
                <Text style={[styles.emptyReviewsText, { color: colors.textLight }]}>No reviews yet</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? '#1a1a1a' : COLORS.background} 
      />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ───────────────────────────────────────────────────── */}
        <View style={[styles.header, { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }]}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={[styles.headerLogo, { borderRadius: wp(5) }]} 
              resizeMode="contain" 
            />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          </View>

          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ─── APPEARANCE ───────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <SettingItem
                icon={isDarkMode ? "moon" : "sunny"}
                label="Dark Mode"
                description={isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
                type="switch"
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                colors={colors}
              />
            </View>
          </View>

          {/* ─── SECURITY ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <SettingItem
                icon="finger-print"
                label="Biometric Login"
                description={biometricEnabled ? "Fingerprint login enabled" : "Enable fingerprint login"}
                type="switch"
                value={biometricEnabled}
                onValueChange={handleBiometric}
                colors={colors}
              />
            </View>
          </View>

          {/* ─── REVIEWS ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Feedback</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <TouchableOpacity 
                style={styles.row}
                onPress={() => setShowReviewsModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="star-outline" size={wp(4)} color={colors.primary} />
                  </View>
                  <View style={styles.rowContent}>
                    <View style={styles.reviewRowHeader}>
                      <Text style={[styles.rowLabel, { color: colors.text }]}>Patient Reviews</Text>
                      <View style={styles.reviewRowStars}>
                        {renderStars(Math.round(averageRating), 3)}
                      </View>
                    </View>
                    <Text style={[styles.rowDesc, { color: colors.textLight }]}>
                      {totalReviews} reviews • {averageRating} average rating
                    </Text>
                    {/* Performance Indicator */}
                    <View style={styles.performanceIndicator}>
                      <View style={[
                        styles.performanceBar,
                        { 
                          width: `${(averageRating / 5) * 100}%`,
                          backgroundColor: averageRating >= 4 ? COLORS.success : 
                                         averageRating >= 3 ? COLORS.warning : COLORS.danger
                        }
                      ]} />
                      <Text style={[styles.performanceText, { color: colors.textLight }]}>
                        {averageRating >= 4.5 ? 'Excellent' :
                         averageRating >= 4 ? 'Very Good' :
                         averageRating >= 3.5 ? 'Good' :
                         averageRating >= 3 ? 'Average' : 'Needs Improvement'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── NOTIFICATIONS ────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <SettingItem
                icon="notifications-outline"
                label="Push Notifications"
                description="Master toggle for all notifications"
                type="switch"
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                colors={colors}
              />
              <Divider colors={colors} />
              <SettingItem
                icon="calendar-outline"
                label="Appointment Reminders"
                description="Get reminders for upcoming appointments"
                type="switch"
                value={appointmentReminders}
                onValueChange={toggleAppointmentReminders}
                colors={colors}
                disabled={!notificationsEnabled}
              />
              <Divider colors={colors} />
              <SettingItem
                icon="people-outline"
                label="Queue Updates"
                description="Patient arrival and queue status alerts"
                type="switch"
                value={queueUpdates}
                onValueChange={toggleQueueUpdates}
                colors={colors}
                disabled={!notificationsEnabled}
              />
              <Divider colors={colors} />
              <SettingItem
                icon="mail-outline"
                label="Admin Messages"
                description="Department announcements and circulars"
                type="switch"
                value={adminMessages}
                onValueChange={toggleAdminMessages}
                colors={colors}
                disabled={!notificationsEnabled}
              />
              <Divider colors={colors} />
              <SettingItem
                icon="phone-portrait-outline"
                label="Vibration"
                description="Vibrate for notifications"
                type="switch"
                value={vibrationEnabled}
                onValueChange={toggleVibration}
                colors={colors}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>

          {/* ─── CLINICAL PREFERENCES ────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Clinical Preferences</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              
              <TouchableOpacity 
                style={styles.row}
                onPress={() => setShowDurationPicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="time-outline" size={wp(4)} color={colors.primary} />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Consultation Duration</Text>
                    <Text style={[styles.rowDesc, { color: colors.textLight }]}>{consultationDuration} minutes</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
              </TouchableOpacity>

              <Divider colors={colors} />

              <TouchableOpacity 
                style={styles.row}
                onPress={() => setShowTemplatePicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="document-text-outline" size={wp(4)} color={colors.primary} />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Notes Template</Text>
                    <Text style={[styles.rowDesc, { color: colors.textLight }]}>{notesTemplate}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
              </TouchableOpacity>

              <Divider colors={colors} />

              <SettingItem
                icon="save-outline"
                label="Auto Save Notes"
                description="Automatically save consultation notes"
                type="switch"
                value={autoSaveNotes}
                onValueChange={setAutoSaveNotes}
                colors={colors}
              />

              <Divider colors={colors} />

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveClinicalPreferences}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.saveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="save-outline" size={wp(3.5)} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save Preferences</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── AVAILABILITY ────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Doctor Availability</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <SettingItem
                icon="checkmark-circle-outline"
                label="Available Today"
                description={isAvailable ? "You are available for consultations" : "You are currently unavailable"}
                type="switch"
                value={isAvailable}
                onValueChange={setIsAvailable}
                colors={colors}
              />
              <Divider colors={colors} />
              <SettingItem
                icon="alert-circle-outline"
                label="Accept Emergency Cases"
                description={acceptEmergency ? "Emergency cases accepted" : "Emergency cases not accepted"}
                type="switch"
                value={acceptEmergency}
                onValueChange={setAcceptEmergency}
                colors={colors}
                disabled={!isAvailable}
              />
              <Divider colors={colors} />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveAvailability}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.saveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="save-outline" size={wp(3.5)} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Update Status</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── LEGAL ────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Legal</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <TouchableOpacity 
                style={styles.row}
                onPress={handlePrivacy}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="shield-outline" size={wp(4)} color={colors.primary} />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Privacy Policy</Text>
                    <Text style={[styles.rowDesc, { color: colors.textLight }]}>How we protect your data</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── LOGOUT ────────────────────────────────────────────────── */}
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: COLORS.danger + '30' }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={wp(4.5)} color={COLORS.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* ─── FOOTER ────────────────────────────────────────────────── */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerText, { color: colors.textLight }]}>SehatLine v2.0.1</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      {renderBiometricModal()}
      {renderReviewsModal()}

      {/* Option Pickers */}
      {renderOptionPicker(
        showDurationPicker,
        ['10', '15', '20', '30', '45', '60'],
        consultationDuration,
        setConsultationDuration,
        () => setShowDurationPicker(false),
        'Consultation Duration'
      )}

      {renderOptionPicker(
        showTemplatePicker,
        ['General Checkup', 'Chronic Care', 'Follow-up', 'Emergency'],
        notesTemplate,
        setNotesTemplate,
        () => setShowTemplatePicker(false),
        'Notes Template'
      )}
    </View>
  );
};

// ── Setting Item ──────────────────────────────────────────────────────
const SettingItem = ({ icon, label, description, type, value, onValueChange, colors, disabled = false }) => (
  <View style={[styles.row, disabled && styles.rowDisabled]}>
    <View style={styles.rowLeft}>
      <View style={[styles.rowIcon, { backgroundColor: disabled ? colors.border : colors.iconBg }]}>
        <Ionicons name={icon} size={wp(4)} color={disabled ? colors.textLight : colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: disabled ? colors.textLight : colors.text }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.textLight }]}>{description}</Text>
      </View>
    </View>
    {type === 'switch' && (
      <Switch
        value={value && !disabled}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: disabled ? colors.textLight : colors.primary }}
        thumbColor={value && !disabled ? colors.card : colors.card}
        style={styles.switch}
        disabled={disabled}
      />
    )}
  </View>
);

// ── Divider ────────────────────────────────────────────────────────────
const Divider = ({ colors }) => (
  <View style={[styles.divider, { backgroundColor: colors?.border || COLORS.border }]} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '20',
  },
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  headerLogo: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
    borderRadius: wp(5),
  },
  headerTitle: {
    fontSize: wp(4.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: wp(9),
  },

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },

  // ── Section ──────────────────────────────────────────────────────
  section: {
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(3.4),
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: hp(1),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  // ── Row ──────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3.5),
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  rowDesc: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: wp(3.5),
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },

  // ── Reviews ──────────────────────────────────────────────────────
  reviewRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  reviewRowStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  performanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(0.2),
  },
  performanceBar: {
    height: hp(0.4),
    borderRadius: 2,
    width: wp(15),
    backgroundColor: COLORS.success,
  },
  performanceText: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // ─── Rating Distribution ──────────────────────────────────────────
  ratingDistribution: {
    marginTop: hp(1.5),
    width: '100%',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(0.15),
    gap: wp(1.5),
  },
  ratingBarLabel: {
    fontSize: wp(2.4),
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: wp(6),
  },
  ratingBarTrack: {
    flex: 1,
    height: hp(0.8),
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  ratingBarCount: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    width: wp(4),
    textAlign: 'right',
  },

  // ── Save Button ──────────────────────────────────────────────────
  saveButton: {
    marginHorizontal: wp(3.5),
    marginVertical: hp(0.8),
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.8),
    gap: wp(1.5),
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: wp(3),
    fontWeight: '600',
  },

  // ── Logout ──────────────────────────────────────────────────────
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(4),
    marginTop: hp(2.5),
    paddingVertical: hp(1.8),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    backgroundColor: COLORS.white,
    gap: wp(2),
  },
  logoutText: {
    fontSize: wp(3.6),
    fontWeight: '600',
    color: COLORS.danger,
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: hp(3),
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: wp(4),
  },
  footerText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ─── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.92,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: wp(4),
  },
  modalSubmitBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
    marginTop: hp(1),
  },
  modalSubmitDisabled: {
    opacity: 0.6,
  },
  modalSubmitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.4),
    gap: wp(2),
  },
  modalSubmitText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // ─── Biometric Modal ──────────────────────────────────────────────
  biometricIconContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  biometricIconCircle: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: hp(0.5),
  },
  biometricDesc: {
    fontSize: wp(3),
    textAlign: 'center',
    lineHeight: wp(4.5),
    marginBottom: hp(2),
  },
  biometricFeatures: {
    gap: hp(0.8),
    marginBottom: hp(2),
  },
  biometricFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  biometricFeatureText: {
    fontSize: wp(3),
  },

  // ─── Reviews Modal ────────────────────────────────────────────────
  reviewsModal: {
    width: width * 0.92,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
    ...SHADOWS.large,
    maxHeight: height * 0.8,
  },
  reviewsSummary: {
    padding: wp(4),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  averageRatingContainer: {
    alignItems: 'center',
  },
  averageRatingNumber: {
    fontSize: wp(8),
    fontWeight: '800',
    color: COLORS.text,
  },
  averageStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: hp(0.3),
  },
  totalReviews: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },
  reviewsList: {
    padding: wp(3),
    paddingBottom: hp(2),
  },
  reviewItem: {
    paddingVertical: hp(1.2),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(0.3),
  },
  reviewDate: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
  },
  reviewComment: {
    fontSize: wp(3.2),
    color: COLORS.text,
    lineHeight: wp(4.2),
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: hp(4),
    gap: hp(0.5),
  },
  emptyReviewsText: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
  },

  // ─── Picker Modal ──────────────────────────────────────────────────
  pickerModal: {
    width: width * 0.88,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
    ...SHADOWS.large,
    maxHeight: height * 0.6,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  pickerOptions: {
    paddingVertical: hp(0.5),
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  pickerOptionActive: {
    backgroundColor: COLORS.primary + '05',
  },
  pickerOptionText: {
    fontSize: wp(3.2),
    color: COLORS.text,
  },
  pickerOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default DoctorSettingsScreen;