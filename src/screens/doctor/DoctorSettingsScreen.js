// src/screens/doctor/DoctorSettingsScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ── Storage Keys ──────────────────────────────────────────────────────
const THEME_KEY = '@sehatline_theme';
const SETTINGS_KEYS = {
  notifications: '@sehatline_notifications',
  reminders: '@sehatline_appointment_reminders',
  queueUpdates: '@sehatline_queue_updates',
  adminMessages: '@sehatline_admin_messages',
  vibration: '@sehatline_vibration',
  biometric: '@sehatline_biometric',
  duration: '@sehatline_consultation_duration',
  template: '@sehatline_notes_template',
  autoSave: '@sehatline_auto_save_notes',
  available: '@sehatline_doctor_available',
  emergency: '@sehatline_accept_emergency',
};

// ─── Duration Options ──────────────────────────────────────────────
const DURATION_OPTIONS = ['10', '15', '20', '30', '45', '60'];
const TEMPLATE_OPTIONS = ['General Checkup', 'Chronic Care', 'Follow-up', 'Emergency'];

const DoctorSettingsScreen = ({ navigation }) => {
  // ─── State ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [queueUpdates, setQueueUpdates] = useState(true);
  const [adminMessages, setAdminMessages] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState('15');
  const [notesTemplate, setNotesTemplate] = useState('General Checkup');
  const [autoSaveNotes, setAutoSaveNotes] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [acceptEmergency, setAcceptEmergency] = useState(true);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── LOAD ALL SETTINGS ──────────────────────────────────────────────
  const loadAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        theme, notif, reminders, queue, admin, vibration,
        bio, duration, template, autoSave, available, emergency
      ] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(SETTINGS_KEYS.notifications),
        AsyncStorage.getItem(SETTINGS_KEYS.reminders),
        AsyncStorage.getItem(SETTINGS_KEYS.queueUpdates),
        AsyncStorage.getItem(SETTINGS_KEYS.adminMessages),
        AsyncStorage.getItem(SETTINGS_KEYS.vibration),
        AsyncStorage.getItem(SETTINGS_KEYS.biometric),
        AsyncStorage.getItem(SETTINGS_KEYS.duration),
        AsyncStorage.getItem(SETTINGS_KEYS.template),
        AsyncStorage.getItem(SETTINGS_KEYS.autoSave),
        AsyncStorage.getItem(SETTINGS_KEYS.available),
        AsyncStorage.getItem(SETTINGS_KEYS.emergency),
      ]);

      if (theme !== null) setIsDarkMode(theme === 'dark');
      if (notif !== null) setNotificationsEnabled(JSON.parse(notif));
      if (reminders !== null) setAppointmentReminders(JSON.parse(reminders));
      if (queue !== null) setQueueUpdates(JSON.parse(queue));
      if (admin !== null) setAdminMessages(JSON.parse(admin));
      if (vibration !== null) setVibrationEnabled(JSON.parse(vibration));
      if (bio !== null) setBiometricEnabled(bio === 'true');
      if (duration) setConsultationDuration(duration);
      if (template) setNotesTemplate(template);
      if (autoSave !== null) setAutoSaveNotes(JSON.parse(autoSave));
      if (available !== null) setIsAvailable(JSON.parse(available));
      if (emergency !== null) setAcceptEmergency(JSON.parse(emergency));
      
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  // ─── SAVE HELPERS ──────────────────────────────────────────────────
  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // ─── HANDLERS ──────────────────────────────────────────────────────
  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    await saveSetting(THEME_KEY, value);
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    await saveSetting(SETTINGS_KEYS.notifications, value);
  };

  const toggleAppointmentReminders = async (value) => {
    setAppointmentReminders(value);
    await saveSetting(SETTINGS_KEYS.reminders, value);
  };

  const toggleQueueUpdates = async (value) => {
    setQueueUpdates(value);
    await saveSetting(SETTINGS_KEYS.queueUpdates, value);
  };

  const toggleAdminMessages = async (value) => {
    setAdminMessages(value);
    await saveSetting(SETTINGS_KEYS.adminMessages, value);
  };

  const toggleVibration = async (value) => {
    setVibrationEnabled(value);
    await saveSetting(SETTINGS_KEYS.vibration, value);
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
              await saveSetting(SETTINGS_KEYS.biometric, false);
              setBiometricEnabled(false);
              Alert.alert('Success', 'Biometric login disabled.');
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
      await saveSetting(SETTINGS_KEYS.biometric, true);
      setBiometricEnabled(true);
      Alert.alert('Success', 'Biometric login enabled successfully!');
      setShowBiometricModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to enable biometric login.');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // ─── CLINICAL PREFERENCES ──────────────────────────────────────────
  const saveClinicalPreferences = async () => {
    setSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(SETTINGS_KEYS.duration, consultationDuration),
        AsyncStorage.setItem(SETTINGS_KEYS.template, notesTemplate),
        AsyncStorage.setItem(SETTINGS_KEYS.autoSave, JSON.stringify(autoSaveNotes)),
      ]);
      Alert.alert('Success', 'Clinical preferences saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  // ─── AVAILABILITY ──────────────────────────────────────────────────
  const saveAvailability = async () => {
    setSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(SETTINGS_KEYS.available, JSON.stringify(isAvailable)),
        AsyncStorage.setItem(SETTINGS_KEYS.emergency, JSON.stringify(acceptEmergency)),
      ]);
      Alert.alert('Success', 'Availability updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability.');
    } finally {
      setSaving(false);
    }
  };

  // ─── PRIVACY ──────────────────────────────────────────────────────
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
                'user', 'userData', 'isLoggedIn', 'userRole',
                '@sehatline_userData', '@sehatline_token'
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

  // ─── DYNAMIC COLORS ──────────────────────────────────────────────
  const colors = useMemo(() => {
    const isDark = isDarkMode;
    const primaryColor = COLORS.primary; // Your app's primary color
    
    return {
      // Backgrounds
      background: isDark ? '#121212' : '#F4F7FC',
      card: isDark ? '#1E1E1E' : '#FFFFFF',
      
      // Text colors
      text: isDark ? '#FFFFFF' : '#1A1A2E',
      textSecondary: isDark ? '#B0B0B0' : '#4A4A5A',
      textLight: isDark ? '#888888' : '#8A8A9A',
      
      // Borders
      border: isDark ? '#333333' : '#E8EEF4',
      
      // Icon backgrounds
      iconBg: isDark ? '#2A2A3A' : primaryColor + '12',
      
      // Primary color - USE YOUR APP'S PRIMARY COLOR
      primary: primaryColor,
      primaryLight: isDark ? primaryColor + '60' : primaryColor + '30',
      primaryDark: isDark ? primaryColor : primaryColor,
      
      // Danger
      danger: isDark ? '#FF6B6B' : COLORS.danger,
      
      // Switch colors
      switchTrackOn: primaryColor,
      switchTrackOff: isDark ? '#444444' : '#E0E0E0',
      switchThumb: isDark ? '#FFFFFF' : '#FFFFFF',
      switchThumbOn: isDark ? '#FFFFFF' : '#FFFFFF',
      
      // Logo border
      logoBorder: isDark ? primaryColor : primaryColor,
      
      // SehatLine brand
      brandPrimary: isDark ? primaryColor : primaryColor,
      brandAccent: isDark ? '#FFFFFF' : '#1A1A2E',
    };
  }, [isDarkMode]);

  // ─── SETTING ITEM COMPONENT ──────────────────────────────────────
  const SettingItem = useCallback(({ icon, label, description, type, value, onValueChange, disabled = false }) => (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, { backgroundColor: disabled ? colors.border : colors.iconBg }]}>
          <Ionicons 
            name={icon} 
            size={wp(4.5)} 
            color={disabled ? colors.textLight : colors.primary} 
          />
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
          trackColor={{ 
            false: colors.switchTrackOff, 
            true: disabled ? colors.textLight : colors.switchTrackOn 
          }}
          thumbColor={value && !disabled ? colors.switchThumbOn : colors.switchThumb}
          ios_backgroundColor={colors.switchTrackOff}
        />
      )}
    </View>
  ), [colors]);

  const Divider = useCallback(() => (
    <View style={[styles.divider, { backgroundColor: colors.border }]} />
  ), [colors.border]);

  // ─── OPTION PICKER ──────────────────────────────────────────────
  const renderOptionPicker = (visible, options, selected, onSelect, onClose, title) => (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
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
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => { onSelect(option); onClose(); }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  selected === option && styles.pickerOptionTextActive,
                  { color: colors.text }
                ]}>
                  {option}
                </Text>
                {selected === option && (
                  <Ionicons name="checkmark" size={wp(4)} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── BIOMETRIC MODAL ──────────────────────────────────────────────
  const renderBiometricModal = () => (
    <Modal visible={showBiometricModal} transparent animationType="slide">
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowBiometricModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Enable Biometric Login</Text>
            <TouchableOpacity onPress={() => setShowBiometricModal(false)}>
              <Ionicons name="close" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.biometricIconContainer}>
              <View style={[styles.biometricIconCircle, { backgroundColor: colors.iconBg }]}>
                <Ionicons name="finger-print" size={wp(15)} color={colors.primary} />
              </View>
            </View>
            <Text style={[styles.biometricTitle, { color: colors.text }]}>Use Fingerprint to Login</Text>
            <Text style={[styles.biometricDesc, { color: colors.textSecondary }]}>
              Secure your account with biometric authentication.
            </Text>
            <TouchableOpacity
              style={[styles.modalSubmitBtn, isBiometricLoading && styles.modalSubmitDisabled]}
              onPress={handleBiometricSetup}
              disabled={isBiometricLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.modalSubmitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="finger-print" size={wp(4)} color={COLORS.white} />
                <Text style={styles.modalSubmitText}>
                  {isBiometricLoading ? 'Setting up...' : 'Enable Fingerprint Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── LOADING STATE ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Settings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? '#121212' : '#F4F7FC'} 
      />

      {/* ─── HEADER ───────────────────────────────────────────────────── */}
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={25} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.brandWrap}>
          <View style={[styles.logoCircle, { borderColor: colors.logoBorder }]}>
            <Image 
              source={require('../../../assets/logoo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.screenTitle, { color: colors.brandPrimary }]}>
            SEHAT<Text style={[styles.brandAccent, { color: colors.brandAccent }]}>LINE</Text>
          </Text>
          <Text style={[styles.tagline, { color: colors.textLight }]}>Settings</Text>
        </View>

        <View style={styles.iconBtn} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── APPEARANCE ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <View style={[styles.card, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}>
            <SettingItem
              icon={isDarkMode ? "moon" : "sunny"}
              label="Dark Mode"
              description={isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
              type="switch"
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              disabled={false}
            />
          </View>
        </View>

        {/* ─── SECURITY ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
          <View style={[styles.card, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}>
            <SettingItem
              icon="finger-print"
              label="Biometric Login"
              description={biometricEnabled ? "Fingerprint login enabled" : "Enable fingerprint login"}
              type="switch"
              value={biometricEnabled}
              onValueChange={handleBiometric}
              disabled={false}
            />
          </View>
        </View>

        {/* ─── NOTIFICATIONS ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
          <View style={[styles.card, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}>
            <SettingItem
              icon="notifications-outline"
              label="Push Notifications"
              description="Master toggle for all notifications"
              type="switch"
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              disabled={false}
            />
            <Divider />
            <SettingItem
              icon="calendar-outline"
              label="Appointment Reminders"
              description="Get reminders for upcoming appointments"
              type="switch"
              value={appointmentReminders}
              onValueChange={toggleAppointmentReminders}
              disabled={!notificationsEnabled}
            />
            <Divider />
            <SettingItem
              icon="people-outline"
              label="Queue Updates"
              description="Patient arrival and queue status alerts"
              type="switch"
              value={queueUpdates}
              onValueChange={toggleQueueUpdates}
              disabled={!notificationsEnabled}
            />
            <Divider />
            <SettingItem
              icon="mail-outline"
              label="Admin Messages"
              description="Department announcements and circulars"
              type="switch"
              value={adminMessages}
              onValueChange={toggleAdminMessages}
              disabled={!notificationsEnabled}
            />
            <Divider />
            <SettingItem
              icon="phone-portrait-outline"
              label="Vibration"
              description="Vibrate for notifications"
              type="switch"
              value={vibrationEnabled}
              onValueChange={toggleVibration}
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
          }]}>
            
            <TouchableOpacity 
              style={styles.row}
              onPress={() => setShowDurationPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                  <Ionicons name="time-outline" size={wp(4.5)} color={colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Consultation Duration</Text>
                  <Text style={[styles.rowDesc, { color: colors.textLight }]}>{consultationDuration} minutes</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
            </TouchableOpacity>

            <Divider />

            <TouchableOpacity 
              style={styles.row}
              onPress={() => setShowTemplatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                  <Ionicons name="document-text-outline" size={wp(4.5)} color={colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Notes Template</Text>
                  <Text style={[styles.rowDesc, { color: colors.textLight }]}>{notesTemplate}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
            </TouchableOpacity>

            <Divider />

            <SettingItem
              icon="save-outline"
              label="Auto Save Notes"
              description="Automatically save consultation notes"
              type="switch"
              value={autoSaveNotes}
              onValueChange={setAutoSaveNotes}
              disabled={false}
            />

            <Divider />

            <TouchableOpacity 
              style={[styles.saveButton]}
              onPress={saveClinicalPreferences}
              disabled={saving}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary]}
                style={styles.saveGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="save-outline" size={wp(3.5)} color={COLORS.white} />
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Text>
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
          }]}>
            <SettingItem
              icon="checkmark-circle-outline"
              label="Available Today"
              description={isAvailable ? "You are available for consultations" : "You are currently unavailable"}
              type="switch"
              value={isAvailable}
              onValueChange={setIsAvailable}
              disabled={false}
            />
            <Divider />
            <SettingItem
              icon="alert-circle-outline"
              label="Accept Emergency Cases"
              description={acceptEmergency ? "Emergency cases accepted" : "Emergency cases not accepted"}
              type="switch"
              value={acceptEmergency}
              onValueChange={setAcceptEmergency}
              disabled={!isAvailable}
            />
            <Divider />
            <TouchableOpacity 
              style={[styles.saveButton]}
              onPress={saveAvailability}
              disabled={saving}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary]}
                style={styles.saveGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="save-outline" size={wp(3.5)} color={COLORS.white} />
                <Text style={styles.saveButtonText}>
                  {saving ? 'Updating...' : 'Update Status'}
                </Text>
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
          }]}>
            <TouchableOpacity 
              style={styles.row}
              onPress={handlePrivacy}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                  <Ionicons name="shield-outline" size={wp(4.5)} color={colors.primary} />
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
          style={[styles.logoutButton, { 
            backgroundColor: colors.card, 
            borderColor: colors.danger + '30' 
          }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={wp(4.5)} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>SehatLine v2.0.1</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderBiometricModal()}

      {renderOptionPicker(
        showDurationPicker,
        DURATION_OPTIONS,
        consultationDuration,
        setConsultationDuration,
        () => setShowDurationPicker(false),
        'Consultation Duration'
      )}

      {renderOptionPicker(
        showTemplatePicker,
        TEMPLATE_OPTIONS,
        notesTemplate,
        setNotesTemplate,
        () => setShowTemplatePicker(false),
        'Notes Template'
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STYLES - RESPONSIVE
// ═══════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: wp(3.5),
  },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 28) + 14,
    paddingBottom: 18,
    backgroundColor: '#F4F7FC',
  },
  iconBtn: {
    width: 30,
    alignItems: 'center',
    paddingTop: 24,
  },
  brandWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  logoCircle: {
    width: wp(15.5),
    height: wp(15.5),
    borderRadius: wp(7.75),
    borderWidth: 1.6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  screenTitle: {
    fontSize: wp(5),
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  brandAccent: {
    fontWeight: '800',
  },
  tagline: {
    fontSize: wp(2.8),
    marginTop: 2,
  },

  // ── Scroll ──────────────────────────────────────────────────────
  scrollContent: {
    paddingBottom: hp(2),
  },

  // ── Section ────────────────────────────────────────────────────
  section: {
    paddingHorizontal: wp(5),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(3),
    fontWeight: '700',
    marginBottom: hp(1),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: wp(3.5),
    borderWidth: 1,
    overflow: 'hidden',
  },

  // ── Row ────────────────────────────────────────────────────────
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
  },
  rowDesc: {
    fontSize: wp(2.4),
    marginTop: hp(0.1),
  },
  divider: {
    height: 1,
    marginHorizontal: wp(3.5),
  },

  // ── Save Button ────────────────────────────────────────────────
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
    marginHorizontal: wp(5),
    marginTop: hp(3),
    paddingVertical: hp(1.8),
    borderRadius: wp(3),
    borderWidth: 1,
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
    marginHorizontal: wp(5),
  },
  footerText: {
    fontSize: wp(2.8),
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
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
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

  // ─── Biometric ──────────────────────────────────────────────────
  biometricIconContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  biometricIconCircle: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
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

  // ─── Picker Modal ──────────────────────────────────────────────
  pickerModal: {
    width: width * 0.88,
    borderRadius: wp(4),
    overflow: 'hidden',
    maxHeight: height * 0.6,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
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
  },
  pickerOptionActive: {
    backgroundColor: COLORS.primary + '05',
  },
  pickerOptionText: {
    fontSize: wp(3.2),
  },
  pickerOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default DoctorSettingsScreen;