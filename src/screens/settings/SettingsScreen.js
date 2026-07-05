import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
  Dimensions, Platform, StatusBar, SafeAreaView,
  Alert, Modal, Image, Animated, ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [userName, setUserName] = useState('Patient');
  const [userEmail, setUserEmail] = useState('patient@sehatline.com');
  const toastAnim = useRef(new Animated.Value(-100)).current;

  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    autoSync: true,
    biometricLogin: false,
    darkMode: false,
  });

  useEffect(() => {
    loadSettings();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setUserName(data.name || 'Patient');
        setUserEmail(data.email || 'patient@sehatline.com');
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const data = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...data }));
        setDarkMode(data.darkMode || false);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const currentSettings = await AsyncStorage.getItem('appSettings');
      const data = currentSettings ? JSON.parse(currentSettings) : {};
      data[key] = value;
      await AsyncStorage.setItem('appSettings', JSON.stringify(data));
      
      if (key === 'darkMode') {
        setDarkMode(value);
      }
      showToast(key, value);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const showToast = (key, value) => {
    const messages = {
      darkMode: value ? '🌙 Dark Mode Enabled' : '☀️ Light Mode Enabled',
      notificationsEnabled: value ? '🔔 Notifications On' : '🔕 Notifications Off',
      autoSync: value ? '🔄 Auto Sync On' : '🔄 Auto Sync Off',
      biometricLogin: value ? '🔒 Biometric Login Enabled' : '🔓 Biometric Login Disabled',
    };
    
    setToastMessage(messages[key] || 'Setting updated');
    setToastVisible(true);
    
    Animated.spring(toastAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 10,
      bounciness: 6,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastVisible(false));
    }, 2000);
  };

  const handleSwitchChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    saveSettings(key, value);
  };

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
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userRole');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  // ─── Theme Colors ──────────────────────────────────────────────────
  const themeColors = darkMode ? {
    background: '#0F1A2E',
    card: '#1A2A44',
    cardBorder: '#2A3A5A',
    text: '#E8EDF5',
    textSecondary: '#8899BB',
    textLight: '#556688',
    shadow: 'rgba(0,0,0,0.3)',
    iconBg: 'rgba(100, 149, 237, 0.15)',
  } : {
    background: '#F0F4F8',
    card: '#FFFFFF',
    cardBorder: '#E8ECF0',
    text: '#1A2332',
    textSecondary: '#5A6B7A',
    textLight: '#A0AEC0',
    shadow: 'rgba(0,0,0,0.08)',
    iconBg: 'rgba(0, 180, 255, 0.12)',
  };

  // ─── Toast Component ──────────────────────────────────────────────
  const Toast = () => {
    if (!toastVisible) return null;
    return (
      <Animated.View 
        style={[
          styles.toastContainer,
          { 
            transform: [{ translateY: toastAnim }],
            backgroundColor: darkMode ? '#1A2A44' : '#FFFFFF',
            borderColor: darkMode ? '#2A3A5A' : '#E8ECF0',
          }
        ]}
      >
        <LinearGradient 
          colors={[COLORS.primary, COLORS.secondary]} 
          style={styles.toastGradient}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  // ─── Setting Item ──────────────────────────────────────────────────
  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, danger }) => (
    <TouchableOpacity 
      style={[
        styles.settingItem,
        { 
          backgroundColor: themeColors.card,
          borderColor: danger ? '#EF444440' : themeColors.cardBorder,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? '#EF444415' : themeColors.iconBg }]}>
        <Ionicons name={icon} size={wp(4.5)} color={danger ? '#EF4444' : COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: danger ? '#EF4444' : themeColors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: themeColors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={wp(4)} color={themeColors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  // ─── Switch Item ──────────────────────────────────────────────────
  const SwitchItem = ({ icon, title, subtitle, settingKey }) => (
    <View style={[
      styles.settingItem,
      { 
        backgroundColor: themeColors.card,
        borderColor: themeColors.cardBorder,
      }
    ]}>
      <View style={[styles.settingIcon, { backgroundColor: themeColors.iconBg }]}>
        <Ionicons name={icon} size={wp(4.5)} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: themeColors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: themeColors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={(val) => handleSwitchChange(settingKey, val)}
        trackColor={{ false: darkMode ? '#2A3A5A' : '#D1D5DB', true: COLORS.primary }}
        thumbColor={settings[settingKey] ? COLORS.white : COLORS.white}
        ios_backgroundColor={darkMode ? '#2A3A5A' : '#D1D5DB'}
      />
    </View>
  );

  // ─── Section Header ──────────────────────────────────────────────
  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
      {title}
    </Text>
  );

  // ─── MAIN RENDER ──────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={darkMode ? 
          ['#0F1A2E', '#0F1A2E', '#0F1A2E'] :
          [COLORS.primary, COLORS.secondary, COLORS.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: darkMode ? 0.1 : 0.25 }}
        style={styles.gradientBackground}
      />

      <Toast />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.topHeader}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Image 
                source={require('../../../assets/logo.png')} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <View style={{ width: wp(10) }} />
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled={true}
        >
          {/* Profile Card */}
          <View style={[styles.profileCard, { 
            backgroundColor: themeColors.card,
            borderColor: themeColors.cardBorder,
          }]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.profileAvatar}
            >
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: themeColors.text }]}>{userName}</Text>
              <Text style={[styles.profileEmail, { color: themeColors.textSecondary }]}>{userEmail}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={styles.editBtn}>
                <Text style={styles.profileEdit}>Edit Profile →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <SectionHeader title="Appearance" />
            <SwitchItem 
              icon="moon-outline" 
              title="Dark Mode"
              subtitle="Switch between light and dark theme"
              settingKey="darkMode"
            />
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <SectionHeader title="Preferences" />
            <SwitchItem 
              icon="notifications-outline" 
              title="Notifications"
              subtitle="Receive updates about appointments"
              settingKey="notificationsEnabled"
            />
            <SwitchItem 
              icon="sync-outline" 
              title="Auto Sync"
              subtitle="Automatically sync your health data"
              settingKey="autoSync"
            />
            <SwitchItem 
              icon="finger-print-outline" 
              title="Biometric Login"
              subtitle="Use fingerprint or face ID for quick access"
              settingKey="biometricLogin"
            />
          </View>

          {/* Account */}
          <View style={styles.section}>
            <SectionHeader title="Account" />
            <SettingItem 
              icon="person-outline" 
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => navigation.navigate('ProfileScreen')}
            />
            <SettingItem 
              icon="shield-checkmark-outline" 
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => navigation.navigate('PoliciesScreen')}
            />
            <SettingItem 
              icon="document-text-outline" 
              title="My Reports"
              subtitle="View all your medical reports"
              onPress={() => navigation.navigate('ReportsListScreen')}
            />
            <SettingItem 
              icon="calendar-outline" 
              title="My Appointments"
              subtitle="View your appointment history"
              onPress={() => navigation.navigate('AppointmentList')}
            />
          </View>

          {/* Hospital */}
          <View style={styles.section}>
            <SectionHeader title="Hospital" />
            <SettingItem 
              icon="business-outline" 
              title="Hospital Timings"
              subtitle="Check hospital working hours"
              onPress={() => navigation.navigate('HospitalTimingsScreen')}
            />
            <SettingItem 
              icon="call-outline" 
              title="Contact Hospital"
              subtitle="Reach out to hospital administration"
              onPress={() => Alert.alert(
                'Contact Hospital',
                '📞 +92-51-1234567\n📍 CDA Hospital, Islamabad\n🕐 Mon-Sat: 7:00 AM - 8:00 PM'
              )}
            />
            <SettingItem 
              icon="medkit-outline" 
              title="About Hospital"
              subtitle="Learn more about CDA Hospital"
              onPress={() => navigation.navigate('AboutHospitalScreen')}
            />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <SectionHeader title="Support" />
            <SettingItem 
              icon="help-circle-outline" 
              title="Help & Support"
              subtitle="FAQs and troubleshooting"
              onPress={() => navigation.navigate('HelpSupportScreen')}
            />
            <SettingItem 
              icon="star-outline" 
              title="Rate Us"
              subtitle="Rate SehatLine on App Store"
              onPress={() => Alert.alert(
                'Rate SehatLine',
                '⭐ ⭐ ⭐ ⭐ ⭐\n\nYour feedback helps us improve!\nThank you for using SehatLine ❤️'
              )}
            />
            <SettingItem 
              icon="share-social-outline" 
              title="Share App"
              subtitle="Invite friends and family"
              onPress={() => Alert.alert(
                'Share SehatLine',
                'Share SehatLine with your loved ones ❤️\n\n"Your Health, Our Priority"'
              )}
            />
          </View>

          {/* About */}
          <View style={styles.section}>
            <SectionHeader title="About" />
            <SettingItem 
              icon="information-circle-outline" 
              title="App Version"
              subtitle="v2.0.0 (Build 104)"
              rightElement={
                <View style={[styles.versionBadge, { backgroundColor: COLORS.primary + '15' }]}>
                  <Text style={styles.versionBadgeText}>v2.0.0</Text>
                </View>
              }
            />
            <SettingItem 
              icon="shield-outline" 
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={() => navigation.navigate('PoliciesScreen')}
            />
            <SettingItem 
              icon="document-text-outline" 
              title="Terms of Service"
              subtitle="Read our terms and conditions"
              onPress={() => navigation.navigate('PoliciesScreen')}
            />
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <SectionHeader title="Account" />
            <SettingItem 
              icon="log-out-outline" 
              title="Logout"
              subtitle="Sign out from your account"
              onPress={handleLogout}
              danger={true}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.textLight }]}>
              SehatLine v2.0.0
            </Text>
            <Text style={[styles.footerSub, { color: themeColors.textLight }]}>
              CDA Hospital • Islamabad
            </Text>
          </View>

          <View style={{ height: hp(3) }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  
  safeArea: { flex: 1 },

  // ─── Header ──────────────────────────────────────────────────────
  headerContainer: { paddingBottom: hp(1) },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
    paddingBottom: hp(1.5),
  },
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  headerLogo: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // ─── Scroll ──────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  // ─── Profile Card ──────────────────────────────────────────────
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: wp(4),
    marginBottom: hp(2.5),
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  profileAvatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    marginLeft: wp(3),
    flex: 1,
  },
  profileName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: wp(3),
    marginTop: hp(0.1),
  },
  editBtn: {
    marginTop: hp(0.2),
  },
  profileEdit: {
    fontSize: wp(3.2),
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ─── Section ──────────────────────────────────────────────────
  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: wp(3.5),
    fontWeight: '700',
    marginBottom: hp(1),
    marginLeft: wp(1),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ─── Setting Item ─────────────────────────────────────────────
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3.5),
    borderRadius: wp(3),
    marginBottom: hp(0.8),
    borderWidth: 1,
    ...SHADOWS.small,
  },
  settingIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: wp(2.5),
    marginTop: hp(0.1),
  },

  // ─── Toast ──────────────────────────────────────────────────
  toastContainer: {
    position: 'absolute',
    top: hp(12),
    left: wp(5),
    right: wp(5),
    zIndex: 1000,
    borderRadius: wp(3),
    overflow: 'hidden',
    ...SHADOWS.large,
    borderWidth: 1,
  },
  toastGradient: {
    padding: wp(3.5),
    alignItems: 'center',
  },
  toastText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
    textAlign: 'center',
  },

  // ─── Version Badge ───────────────────────────────────────────
  versionBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  versionBadgeText: {
    color: COLORS.primary,
    fontSize: wp(2.5),
    fontWeight: '600',
  },

  // ─── Footer ──────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: hp(2),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: wp(3),
    fontWeight: '500',
  },
  footerSub: {
    fontSize: wp(2.5),
    marginTop: hp(0.2),
  },
});

export default SettingsScreen;