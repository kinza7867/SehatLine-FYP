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
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const THEME_KEY = '@sehatline_theme';
const USER_DATA_KEY = '@sehatline_userData';

const DoctorSettingsScreen = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [queueUpdates, setQueueUpdates] = useState(true);
  const [adminMessages, setAdminMessages] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // ─── Password Change State ──────────────────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // ─── PIN Lock State ─────────────────────────────────────────────
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPinStatus();
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

  const checkPinStatus = async () => {
    try {
      const savedPin = await AsyncStorage.getItem('@sehatline_pin');
      setHasPin(savedPin !== null);
    } catch (error) {
      console.error('Error checking PIN:', error);
    }
  };

  // ─── DARK MODE ────────────────────────────────────────────────────
  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem(THEME_KEY, value ? 'dark' : 'light');
      Alert.alert('Theme Updated', `Switched to ${value ? 'Dark' : 'Light'} mode.`);
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

  // ─── VIBRATION ────────────────────────────────────────────────────
  const toggleVibration = async (value) => {
    setVibrationEnabled(value);
    try {
      await AsyncStorage.setItem('@sehatline_vibration', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving vibration preference:', error);
    }
  };

  // ─── CHANGE PASSWORD ─────────────────────────────────────────────
  const handleChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsPasswordLoading(true);
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.password && parsed.password !== currentPassword) {
          Alert.alert('Error', 'Current password is incorrect.');
          setIsPasswordLoading(false);
          return;
        }
      }

      const existingData = userData ? JSON.parse(userData) : {};
      const updatedData = { ...existingData, password: newPassword };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));

      Alert.alert('Success', 'Password changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // ─── PIN LOCK ─────────────────────────────────────────────────────
  const handlePinLock = () => {
    setPinCode('');
    setConfirmPin('');
    setShowPinModal(true);
  };

  const handlePinSubmit = async () => {
    if (!pinCode || !confirmPin) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (pinCode.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits.');
      return;
    }

    if (pinCode !== confirmPin) {
      Alert.alert('Error', 'PINs do not match.');
      return;
    }

    setIsPinLoading(true);
    try {
      await AsyncStorage.setItem('@sehatline_pin', pinCode);
      setHasPin(true);
      Alert.alert('Success', 'PIN set successfully!');
      setShowPinModal(false);
      setPinCode('');
      setConfirmPin('');
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to set PIN.');
    } finally {
      setIsPinLoading(false);
    }
  };

  const handleRemovePin = () => {
    Alert.alert(
      'Remove PIN',
      'Are you sure you want to remove PIN lock?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@sehatline_pin');
              setHasPin(false);
              Alert.alert('Success', 'PIN removed successfully!');
            } catch (error) {
              console.error('Error removing PIN:', error);
              Alert.alert('Error', 'Failed to remove PIN.');
            }
          },
        },
      ]
    );
  };

  // ─── HELP & SUPPORT ──────────────────────────────────────────────
  const handleHelp = () => {
    navigation.navigate('HelpSupport');
  };

  // ─── PRIVACY POLICY ──────────────────────────────────────────────
  const handlePrivacy = () => {
    navigation.navigate('PrivacyScreen');
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

  // ─── Password Modal ──────────────────────────────────────────────
  const renderPasswordModal = () => (
    <Modal visible={showPasswordModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Ionicons name="close" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Current Password</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter current password"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Password</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter new password (min 6 chars)"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSubmitBtn, isPasswordLoading && styles.modalSubmitDisabled]}
              onPress={handlePasswordSubmit}
              disabled={isPasswordLoading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.modalSubmitGradient}
              >
                <Text style={styles.modalSubmitText}>
                  {isPasswordLoading ? 'Updating...' : 'Update Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── PIN Modal ──────────────────────────────────────────────────
  const renderPinModal = () => (
    <Modal visible={showPinModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {hasPin ? 'Update PIN' : 'Set PIN Lock'}
            </Text>
            <TouchableOpacity onPress={() => setShowPinModal(false)}>
              <Ionicons name="close" size={wp(5)} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Enter 4-Digit PIN</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={pinCode}
                onChangeText={setPinCode}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm PIN</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Confirm 4-digit PIN"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={confirmPin}
                onChangeText={setConfirmPin}
              />
            </View>

            {hasPin && (
              <TouchableOpacity
                style={styles.removePinBtn}
                onPress={handleRemovePin}
                activeOpacity={0.7}
              >
                <Text style={styles.removePinText}>Remove PIN</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalSubmitBtn, isPinLoading && styles.modalSubmitDisabled]}
              onPress={handlePinSubmit}
              disabled={isPinLoading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.modalSubmitGradient}
              >
                <Text style={styles.modalSubmitText}>
                  {isPinLoading ? 'Setting...' : hasPin ? 'Update PIN' : 'Set PIN'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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

          {/* ─── SECURITY ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <TouchableOpacity 
                style={styles.row}
                onPress={handleChangePassword}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="lock-closed-outline" size={wp(4)} color={colors.primary} />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Change Password</Text>
                    <Text style={[styles.rowDesc, { color: colors.textLight }]}>Update your account password</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
              </TouchableOpacity>
              <Divider colors={colors} />
              <TouchableOpacity 
                style={styles.row}
                onPress={handlePinLock}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="keypad-outline" size={wp(4)} color={colors.primary} />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>PIN Lock</Text>
                    <Text style={[styles.rowDesc, { color: colors.textLight }]}>
                      {hasPin ? 'PIN is enabled' : 'Secure app with PIN'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── SUPPORT ─────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
            <View style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }, SHADOWS.small]}>
              <TouchableOpacity 
                style={styles.row}
                onPress={handleHelp}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="help-circle-outline" size={wp(4)} color={colors.primary} />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Help & Support</Text>
                    <Text style={[styles.rowDesc, { color: colors.textLight }]}>FAQs and troubleshooting</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={wp(4)} color={colors.textLight} />
              </TouchableOpacity>
              <Divider colors={colors} />
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
      {renderPasswordModal()}
      {renderPinModal()}
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

  // ── Modal ──────────────────────────────────────────────────────
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
  inputGroup: {
    marginBottom: hp(1.5),
  },
  inputLabel: {
    fontSize: wp(3),
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: hp(0.3),
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    fontSize: wp(3.2),
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
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
    paddingVertical: hp(1.4),
    alignItems: 'center',
  },
  modalSubmitText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  removePinBtn: {
    alignItems: 'center',
    paddingVertical: hp(0.5),
  },
  removePinText: {
    color: COLORS.danger,
    fontSize: wp(3.2),
    fontWeight: '600',
  },
});

export default DoctorSettingsScreen;