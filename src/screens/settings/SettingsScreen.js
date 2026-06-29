import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
  Dimensions, Platform, StatusBar, SafeAreaView,
  Alert, Modal, Image, Animated,ActivityIndicator
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

  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    autoSync: true,
    biometricLogin: false,
    dataSaver: false,
    offlineMode: false,
    autoBackup: true,
    appLock: false,
    locationServices: true,
    analyticsEnabled: true,
    twoFactorAuth: false,
    language: 'English',
  });

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [cacheSize, setCacheSize] = useState('128 MB');
  const [isClearing, setIsClearing] = useState(false);
  const [switchAnim] = useState(new Animated.Value(0));
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const toastScale = useRef(new Animated.Value(0.5)).current;

  // Language translations
  const translations = {
    English: {
      settings: 'Settings',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      darkModeSub: 'Switch between light and dark theme',
      account: 'Account',
      editProfile: 'Edit Profile',
      editProfileSub: 'Update your personal information',
      privacySecurity: 'Privacy & Security',
      privacySecuritySub: 'Manage your privacy settings',
      preferences: 'Preferences',
      pushNotifications: 'Push Notifications',
      pushNotificationsSub: 'Receive updates about appointments',
      autoSync: 'Auto Sync Data',
      autoSyncSub: 'Automatically sync your health data',
      biometricLogin: 'Biometric Login',
      biometricLoginSub: 'Use fingerprint or face ID',
      dataSaver: 'Data Saver Mode',
      dataSaverSub: 'Reduce data usage',
      offlineMode: 'Offline Mode',
      offlineModeSub: 'Access content without internet',
      language: 'Language',
      security: 'Security',
      appLock: 'App Lock',
      appLockSub: 'Lock app with PIN or biometric',
      locationServices: 'Location Services',
      locationServicesSub: 'Enable location for better services',
      twoFactorAuth: 'Two-Factor Authentication',
      twoFactorAuthSub: 'Extra security layer for your account',
      dataManagement: 'Data Management',
      autoBackup: 'Auto Backup',
      autoBackupSub: 'Automatically backup your data',
      analytics: 'Analytics',
      analyticsSub: 'Help us improve the app',
      downloadData: 'Download My Data',
      downloadDataSub: 'Export your medical records',
      clearCache: 'Clear Cache',
      clearCacheSub: 'Current cache: {size}',
      resetSettings: 'Reset All Settings',
      resetSettingsSub: 'Restore default settings',
      support: 'Support',
      helpSupport: 'Help & Support',
      helpSupportSub: 'FAQs and troubleshooting',
      contactUs: 'Contact Us',
      contactUsSub: 'Talk to our support team',
      rateUs: 'Rate Us',
      rateUsSub: 'Rate SehatLine on App Store',
      shareApp: 'Share App',
      shareAppSub: 'Invite friends and family',
      about: 'About',
      appVersion: 'App Version',
      appVersionSub: 'v2.0.0 (Build 104)',
      terms: 'Terms of Service',
      termsSub: 'Read our terms and conditions',
      privacyPolicy: 'Privacy Policy',
      privacyPolicySub: 'How we protect your data',
      aboutSehatLine: 'About SehatLine',
      aboutSehatLineSub: 'Learn more about us',
      doctorPortal: 'Doctor Portal',
      doctorDashboard: 'Doctor Dashboard',
      doctorDashboardSub: 'Manage your practice',
      manageDoctors: 'Manage Doctors',
      manageDoctorsSub: 'Add, edit, remove doctors',
      realTimeQueue: 'Real Time Queue',
      realTimeQueueSub: 'View live patient queue',
      callNextPatient: 'Call Next Patient',
      callNextPatientSub: 'Manage patient flow',
      adminPortal: 'Admin Portal',
      adminDashboard: 'Admin Dashboard',
      adminDashboardSub: 'Complete system overview',
      manageUsers: 'Manage Users',
      manageUsersSub: 'User management',
      dangerZone: 'Danger Zone',
      logout: 'Logout',
      logoutSub: 'Sign out from your account',
      deleteAccount: 'Delete Account',
      deleteAccountSub: 'Permanently delete your account',
      languageChanged: 'Language changed to {lang}',
      cacheCleared: 'Cache cleared successfully',
      settingsReset: 'Settings reset to default',
      darkModeEnabled: 'Dark Mode enabled',
      lightModeEnabled: 'Light Mode enabled',
      notificationsOn: 'Notifications on',
      notificationsOff: 'Notifications off',
      autoSyncOn: 'Auto sync on',
      autoSyncOff: 'Auto sync off',
      biometricOn: 'Biometric login on',
      biometricOff: 'Biometric login off',
      dataSaverOn: 'Data saver on',
      dataSaverOff: 'Data saver off',
      offlineOn: 'Offline mode on',
      offlineOff: 'Offline mode off',
      backupOn: 'Auto backup on',
      backupOff: 'Auto backup off',
      appLockOn: 'App lock on',
      appLockOff: 'App lock off',
      locationOn: 'Location on',
      locationOff: 'Location off',
      analyticsOn: 'Analytics on',
      analyticsOff: 'Analytics off',
      twoFAOn: '2FA enabled',
      twoFAOff: '2FA disabled',
    },
    Urdu: {
      settings: 'ترتیبات',
      appearance: 'ظاہریت',
      darkMode: 'ڈارک موڈ',
      darkModeSub: 'روشنی اور تاریک تھیم کے درمیان سوئچ کریں',
      account: 'اکاؤنٹ',
      editProfile: 'پروفائل میں ترمیم کریں',
      editProfileSub: 'اپنی ذاتی معلومات کو اپ ڈیٹ کریں',
      privacySecurity: 'رازداری اور سیکورٹی',
      privacySecuritySub: 'اپنی رازداری کی ترتیبات کا نظم کریں',
      preferences: 'ترجیحات',
      pushNotifications: 'پش نوٹیفیکیشنز',
      pushNotificationsSub: 'اپوائنٹمنٹس کے بارے میں اطلاعات حاصل کریں',
      autoSync: 'آٹو سنک ڈیٹا',
      autoSyncSub: 'اپنے ہیلتھ ڈیٹا کو خودکار طور پر سنک کریں',
      biometricLogin: 'بائیو میٹرک لاگ ان',
      biometricLoginSub: 'فنگر پرنٹ یا چہرہ شناخت استعمال کریں',
      dataSaver: 'ڈیٹا سیور موڈ',
      dataSaverSub: 'ڈیٹا کا استعمال کم کریں',
      offlineMode: 'آف لائن موڈ',
      offlineModeSub: 'انٹرنیٹ کے بغیر مواد تک رسائی حاصل کریں',
      language: 'زبان',
      security: 'سیکورٹی',
      appLock: 'ایپ لاک',
      appLockSub: 'PIN یا بائیو میٹرک سے ایپ لاک کریں',
      locationServices: 'لوکیشن سروسز',
      locationServicesSub: 'بہتر خدمات کے لیے لوکیشن کو فعال کریں',
      twoFactorAuth: 'دو عنصر تصدیق',
      twoFactorAuthSub: 'آپ کے اکاؤنٹ کے لیے اضافی سیکورٹی پرت',
      dataManagement: 'ڈیٹا مینجمنٹ',
      autoBackup: 'آٹو بیک اپ',
      autoBackupSub: 'اپنے ڈیٹا کا خودکار بیک اپ لیں',
      analytics: 'تجزیات',
      analyticsSub: 'ایپ کو بہتر بنانے میں ہماری مدد کریں',
      downloadData: 'اپنا ڈیٹا ڈاؤن لوڈ کریں',
      downloadDataSub: 'اپنے میڈیکل ریکارڈز ایکسپورٹ کریں',
      clearCache: 'کیچ صاف کریں',
      clearCacheSub: 'موجودہ کیچ: {size}',
      resetSettings: 'تمام ترتیبات ری سیٹ کریں',
      resetSettingsSub: 'پہلے سے طے شدہ ترتیبات کو بحال کریں',
      support: 'سپورٹ',
      helpSupport: 'مدد اور سپورٹ',
      helpSupportSub: 'اکثر پوچھے گئے سوالات اور مسائل کا حل',
      contactUs: 'ہم سے رابطہ کریں',
      contactUsSub: 'ہماری سپورٹ ٹیم سے بات کریں',
      rateUs: 'ہمیں ریٹ کریں',
      rateUsSub: 'ایپ اسٹور پر سیہت لائن کو ریٹ کریں',
      shareApp: 'ایپ شیئر کریں',
      shareAppSub: 'دوستوں اور خاندان کو مدعو کریں',
      about: 'تعارف',
      appVersion: 'ایپ ورژن',
      appVersionSub: 'v2.0.0 (بلڈ 104)',
      terms: 'سروس کی شرائط',
      termsSub: 'ہماری شرائط و ضوابط پڑھیں',
      privacyPolicy: 'رازداری کی پالیسی',
      privacyPolicySub: 'ہم آپ کے ڈیٹا کی حفاظت کیسے کرتے ہیں',
      aboutSehatLine: 'سیہت لائن کے بارے میں',
      aboutSehatLineSub: 'ہمارے بارے میں مزید جانیں',
      doctorPortal: 'ڈاکٹر پورٹل',
      doctorDashboard: 'ڈاکٹر ڈیش بورڈ',
      doctorDashboardSub: 'اپنی پریکٹس کا نظم کریں',
      manageDoctors: 'ڈاکٹرز کا نظم کریں',
      manageDoctorsSub: 'ڈاکٹرز شامل کریں، ترمیم کریں، ہٹائیں',
      realTimeQueue: 'ریئل ٹائم قطار',
      realTimeQueueSub: 'براہ راست مریض قطار دیکھیں',
      callNextPatient: 'اگلے مریض کو بلائیں',
      callNextPatientSub: 'مریض کے بہاؤ کا نظم کریں',
      adminPortal: 'ایڈمن پورٹل',
      adminDashboard: 'ایڈمن ڈیش بورڈ',
      adminDashboardSub: 'مکمل نظام کا جائزہ',
      manageUsers: 'صارفین کا نظم کریں',
      manageUsersSub: 'صارفین کا نظم',
      dangerZone: 'خطرناک زون',
      logout: 'لاگ آؤٹ',
      logoutSub: 'اپنے اکاؤنٹ سے سائن آؤٹ کریں',
      deleteAccount: 'اکاؤنٹ حذف کریں',
      deleteAccountSub: 'اپنے اکاؤنٹ کو مستقل طور پر حذف کریں',
      languageChanged: 'زبان تبدیل کر دی گئی {lang}',
      cacheCleared: 'کیچ کامیابی سے صاف ہو گیا',
      settingsReset: 'ترتیبات پہلے سے طے شدہ پر ری سیٹ ہو گئیں',
      darkModeEnabled: 'ڈارک موڈ فعال',
      lightModeEnabled: 'لائٹ موڈ فعال',
      notificationsOn: 'اطلاعات آن',
      notificationsOff: 'اطلاعات آف',
      autoSyncOn: 'آٹو سنک آن',
      autoSyncOff: 'آٹو سنک آف',
      biometricOn: 'بائیو میٹرک لاگ ان آن',
      biometricOff: 'بائیو میٹرک لاگ ان آف',
      dataSaverOn: 'ڈیٹا سیور آن',
      dataSaverOff: 'ڈیٹا سیور آف',
      offlineOn: 'آف لائن موڈ آن',
      offlineOff: 'آف لائن موڈ آف',
      backupOn: 'آٹو بیک اپ آن',
      backupOff: 'آٹو بیک اپ آف',
      appLockOn: 'ایپ لاک آن',
      appLockOff: 'ایپ لاک آف',
      locationOn: 'لوکیشن آن',
      locationOff: 'لوکیشن آف',
      analyticsOn: 'تجزیات آن',
      analyticsOff: 'تجزیات آف',
      twoFAOn: '2FA فعال',
      twoFAOff: '2FA غیر فعال',
    }
  };

  const t = translations[settings.language] || translations.English;

  useEffect(() => {
    loadSettings();
  }, []);

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
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    
    Animated.parallel([
      Animated.spring(toastAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 10,
        bounciness: 6,
      }),
      Animated.spring(toastScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastScale, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToastVisible(false));
    }, 2500);
  };

  const handleSwitchChange = (key, value) => {
    Animated.sequence([
      Animated.timing(switchAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(switchAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setSettings(prev => ({ ...prev, [key]: value }));
    saveSettings(key, value);

    const messages = {
      darkMode: value ? t.darkModeEnabled : t.lightModeEnabled,
      notificationsEnabled: value ? t.notificationsOn : t.notificationsOff,
      autoSync: value ? t.autoSyncOn : t.autoSyncOff,
      biometricLogin: value ? t.biometricOn : t.biometricOff,
      dataSaver: value ? t.dataSaverOn : t.dataSaverOff,
      offlineMode: value ? t.offlineOn : t.offlineOff,
      autoBackup: value ? t.backupOn : t.backupOff,
      appLock: value ? t.appLockOn : t.appLockOff,
      locationServices: value ? t.locationOn : t.locationOff,
      analyticsEnabled: value ? t.analyticsOn : t.analyticsOff,
      twoFactorAuth: value ? t.twoFAOn : t.twoFAOff,
    };
    
    if (messages[key]) {
      showToast(messages[key]);
    }
  };

  const clearCache = () => {
    setIsClearing(true);
    setTimeout(() => {
      setCacheSize('0 MB');
      setIsClearing(false);
      showToast(t.cacheCleared);
    }, 1500);
  };

  const handleLanguageChange = (lang) => {
    setSettings(prev => ({ ...prev, language: lang }));
    saveSettings('language', lang);
    setShowLanguageModal(false);
    showToast(t.languageChanged.replace('{lang}', lang));
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      'Are you sure you want to logout from SehatLine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: t.logout, 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const languages = ['English', 'Urdu'];

  const LanguageModal = () => (
    <Modal 
      visible={showLanguageModal} 
      transparent={true} 
      animationType="fade"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowLanguageModal(false)}
      >
        <View style={[styles.modalContainer, styles.cardShadow]}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.language}</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Ionicons name="close" size={wp(6)} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.languageOption, settings.language === lang && styles.languageOptionActive]}
              onPress={() => handleLanguageChange(lang)}
            >
              <Text style={[styles.languageText, settings.language === lang && styles.languageTextActive]}>
                {lang}
              </Text>
              {settings.language === lang && (
                <Ionicons name="checkmark" size={wp(5)} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, danger }) => {
    const displaySubtitle = typeof subtitle === 'string' && subtitle.includes('{size}') 
      ? subtitle.replace('{size}', cacheSize) 
      : subtitle;
      
    return (
      <TouchableOpacity 
        style={[styles.settingItem, danger && styles.dangerItem, styles.cardShadow]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingGradient}>
          <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
            <Ionicons name={icon} size={wp(5)} color={danger ? COLORS.danger : COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, danger && styles.dangerText, { color: darkMode ? COLORS.white : COLORS.text }]}>
              {title}
            </Text>
            {displaySubtitle && (
              <Text style={[styles.settingSubtitle, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>
                {displaySubtitle}
              </Text>
            )}
          </View>
          {rightElement ? rightElement : (
            <Ionicons name="chevron-forward" size={wp(4.5)} color={darkMode ? COLORS.textSecondary : COLORS.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const SwitchItem = ({ icon, title, subtitle, settingKey }) => (
    <View style={[styles.settingItem, styles.cardShadow, { backgroundColor: darkMode ? '#1A2A3A' : COLORS.white }]}>
      <View style={styles.settingGradient}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={wp(5)} color={COLORS.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{subtitle}</Text>}
        </View>
        <Animated.View style={{ transform: [{ scale: switchAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05]
        }) }] }}>
          <Switch
            value={settings[settingKey]}
            onValueChange={(val) => handleSwitchChange(settingKey, val)}
            trackColor={{ false: darkMode ? '#334155' : COLORS.border, true: COLORS.primary }}
            thumbColor={settings[settingKey] ? COLORS.white : COLORS.white}
            ios_backgroundColor={darkMode ? '#334155' : COLORS.border}
          />
        </Animated.View>
      </View>
    </View>
  );

  const themeColors = darkMode ? {
    background: '#0A1520',
    card: '#1A2A3A',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    border: '#334155',
  } : {
    background: COLORS.background,
    card: COLORS.white,
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    border: COLORS.border,
  };

  // Toast Component - Center
  const Toast = () => {
    if (!toastVisible) return null;
    return (
      <Animated.View 
        style={[
          styles.toastContainer, 
          { 
            transform: [
              { translateY: toastAnim },
              { scale: toastScale }
            ] 
          }
        ]}
      >
        <LinearGradient 
          colors={toastType === 'success' ? [COLORS.primary, COLORS.secondary] : ['#EF4444', '#DC2626']} 
          style={styles.toastGradient}
        >
          <Ionicons 
            name={toastType === 'success' ? 'checkmark-circle' : 'alert-circle'} 
            size={wp(5)} 
            color={COLORS.white} 
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={darkMode ? 
          ['#0A1520', '#0A1520', '#0A1520'] :
          [COLORS.primary, COLORS.secondary, COLORS.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: darkMode ? 0.1 : 0.25 }}
        style={styles.gradientBackground}
      />

      <Toast />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Logo */}
        <View style={styles.headerContainer}>
          <View style={styles.topHeader}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)' }]} 
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
              <Text style={[styles.headerTitle, { color: COLORS.white }]}>{t.settings}</Text>
            </View>
            <View style={{ width: wp(10) }} />
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.appearance}</Text>
            <SwitchItem 
              icon="moon-outline" 
              title={t.darkMode}
              subtitle={t.darkModeSub}
              settingKey="darkMode"
            />
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.account}</Text>
            <SettingItem 
              icon="person-outline" 
              title={t.editProfile}
              subtitle={t.editProfileSub}
              onPress={() => navigation.navigate('ProfileScreen')}
            />
            <SettingItem 
              icon="shield-checkmark-outline" 
              title={t.privacySecurity}
              subtitle={t.privacySecuritySub}
              onPress={() => navigation.navigate('PoliciesScreen')}
            />
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.preferences}</Text>
            <SwitchItem 
              icon="notifications-outline" 
              title={t.pushNotifications}
              subtitle={t.pushNotificationsSub}
              settingKey="notificationsEnabled"
            />
            <SwitchItem 
              icon="sync-outline" 
              title={t.autoSync}
              subtitle={t.autoSyncSub}
              settingKey="autoSync"
            />
            <SwitchItem 
              icon="finger-print-outline" 
              title={t.biometricLogin}
              subtitle={t.biometricLoginSub}
              settingKey="biometricLogin"
            />
            <SwitchItem 
              icon="save-outline" 
              title={t.dataSaver}
              subtitle={t.dataSaverSub}
              settingKey="dataSaver"
            />
            <SwitchItem 
              icon="wifi-outline" 
              title={t.offlineMode}
              subtitle={t.offlineModeSub}
              settingKey="offlineMode"
            />
            <SettingItem 
              icon="language-outline" 
              title={t.language}
              subtitle={settings.language}
              onPress={() => setShowLanguageModal(true)}
            />
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.security}</Text>
            <SwitchItem 
              icon="lock-closed-outline" 
              title={t.appLock}
              subtitle={t.appLockSub}
              settingKey="appLock"
            />
            <SwitchItem 
              icon="location-outline" 
              title={t.locationServices}
              subtitle={t.locationServicesSub}
              settingKey="locationServices"
            />
            <SwitchItem 
              icon="shield-outline" 
              title={t.twoFactorAuth}
              subtitle={t.twoFactorAuthSub}
              settingKey="twoFactorAuth"
            />
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.dataManagement}</Text>
            <SwitchItem 
              icon="cloud-upload-outline" 
              title={t.autoBackup}
              subtitle={t.autoBackupSub}
              settingKey="autoBackup"
            />
            <SwitchItem 
              icon="stats-chart-outline" 
              title={t.analytics}
              subtitle={t.analyticsSub}
              settingKey="analyticsEnabled"
            />
            <SettingItem 
              icon="cloud-download-outline" 
              title={t.downloadData}
              subtitle={t.downloadDataSub}
              onPress={() => navigation.navigate('ReportsListScreen')}
            />
            <SettingItem 
              icon="trash-outline" 
              title={t.clearCache}
              subtitle={t.clearCacheSub}
              onPress={clearCache}
              rightElement={
                isClearing ? 
                  <ActivityIndicator size="small" color={COLORS.primary} /> :
                  <Ionicons name="chevron-forward" size={wp(4.5)} color={darkMode ? COLORS.textSecondary : COLORS.textSecondary} />
              }
            />
            <SettingItem 
              icon="refresh-outline" 
              title={t.resetSettings}
              subtitle={t.resetSettingsSub}
              onPress={() => Alert.alert(
                t.resetSettings,
                'This will reset all app settings to default. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: () => {
                    setSettings({
                      notificationsEnabled: true,
                      autoSync: true,
                      biometricLogin: false,
                      dataSaver: false,
                      offlineMode: false,
                      autoBackup: true,
                      appLock: false,
                      locationServices: true,
                      analyticsEnabled: true,
                      twoFactorAuth: false,
                      language: 'English',
                    });
                    saveSettings('reset', true);
                    showToast(t.settingsReset);
                  }}
                ]
              )}
            />
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.support}</Text>
            <SettingItem 
              icon="help-circle-outline" 
              title={t.helpSupport}
              subtitle={t.helpSupportSub}
              onPress={() => navigation.navigate('HelpSupportScreen')}
            />
            <SettingItem 
              icon="chatbubble-outline" 
              title={t.contactUs}
              subtitle={t.contactUsSub}
              onPress={() => Alert.alert(t.contactUs, 'Email: support@sehatline.com\nPhone: +92-51-1234567')}
            />
            <SettingItem 
              icon="star-outline" 
              title={t.rateUs}
              subtitle={t.rateUsSub}
              onPress={() => Alert.alert(t.rateUs, 'Thank you for your feedback! ⭐⭐⭐⭐⭐')}
            />
            <SettingItem 
              icon="share-social-outline" 
              title={t.shareApp}
              subtitle={t.shareAppSub}
              onPress={() => Alert.alert(t.shareApp, 'Share SehatLine with your friends and family ❤️')}
            />
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.about}</Text>
            <SettingItem 
              icon="information-circle-outline" 
              title={t.appVersion}
              subtitle={t.appVersionSub}
              rightElement={
                <View style={styles.versionBadge}>
                  <Text style={styles.versionBadgeText}>v2.0.0</Text>
                </View>
              }
            />
            <SettingItem 
              icon="document-text-outline" 
              title={t.terms}
              subtitle={t.termsSub}
              onPress={() => navigation.navigate('PoliciesScreen')}
            />
            <SettingItem 
              icon="shield-outline" 
              title={t.privacyPolicy}
              subtitle={t.privacyPolicySub}
              onPress={() => navigation.navigate('PoliciesScreen')}
            />
            <SettingItem 
              icon="medkit-outline" 
              title={t.aboutSehatLine}
              subtitle={t.aboutSehatLineSub}
              onPress={() => navigation.navigate('AboutHospitalScreen')}
            />
          </View>

          {/* Doctor Portal Access */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.doctorPortal}</Text>
            <SettingItem 
              icon="medical-outline" 
              title={t.doctorDashboard}
              subtitle={t.doctorDashboardSub}
              onPress={() => navigation.navigate('DoctorDashboardScreen')}
            />
            <SettingItem 
              icon="people-outline" 
              title={t.manageDoctors}
              subtitle={t.manageDoctorsSub}
              onPress={() => navigation.navigate('ManageDoctorsScreen')}
            />
            <SettingItem 
              icon="timer-outline" 
              title={t.realTimeQueue}
              subtitle={t.realTimeQueueSub}
              onPress={() => navigation.navigate('RealTimeQueueScreen')}
            />
            <SettingItem 
              icon="call-outline" 
              title={t.callNextPatient}
              subtitle={t.callNextPatientSub}
              onPress={() => navigation.navigate('CallNextPatientScreen')}
            />
          </View>

          {/* Admin Portal Access */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.adminPortal}</Text>
            <SettingItem 
              icon="shield-outline" 
              title={t.adminDashboard}
              subtitle={t.adminDashboardSub}
              onPress={() => navigation.navigate('AdminDashboardScreen')}
            />
            <SettingItem 
              icon="people-outline" 
              title={t.manageUsers}
              subtitle={t.manageUsersSub}
              onPress={() => navigation.navigate('ManageUsersScreen')}
            />
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerTitle, { color: COLORS.danger }]}>{t.dangerZone}</Text>
            <SettingItem 
              icon="log-out-outline" 
              title={t.logout}
              subtitle={t.logoutSub}
              onPress={handleLogout}
              danger={true}
            />
            <SettingItem 
              icon="trash-outline" 
              title={t.deleteAccount}
              subtitle={t.deleteAccountSub}
              onPress={() => Alert.alert(
                t.deleteAccount,
                'This action cannot be undone. All your data will be permanently deleted.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive' }
                ]
              )}
              danger={true}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>
              SehatLine v2.0.0 | CDA Healthcare Portal
            </Text>
            <Text style={[styles.footerSub, { color: darkMode ? COLORS.textLight : COLORS.textLight }]}>
              © 2026 All Rights Reserved
            </Text>
          </View>

          <View style={{ height: hp(3) }} />
        </ScrollView>
      </SafeAreaView>

      <LanguageModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  safeArea: { 
    flex: 1 
  },

  cardShadow: { ...SHADOWS.medium },

  // Header
  headerContainer: { 
    paddingBottom: hp(1) 
  },
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

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  dangerTitle: {
    color: COLORS.danger,
  },

  settingItem: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3.5),
    gap: wp(3),
  },
  settingIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: hp(0.2),
  },

  dangerItem: {
    borderColor: COLORS.danger + '40',
  },
  dangerIcon: {
    backgroundColor: COLORS.danger + '20',
  },
  dangerText: {
    color: COLORS.danger,
  },

  // Toast - Center
  toastContainer: {
    position: 'absolute',
    top: '45%',
    left: wp(10),
    right: wp(10),
    zIndex: 1000,
    borderRadius: wp(3),
    overflow: 'hidden',
    ...SHADOWS.large,
    backgroundColor: COLORS.white,
  },
  toastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3.5),
    gap: wp(2.5),
  },
  toastText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },

  versionBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  versionBadgeText: {
    color: COLORS.primary,
    fontSize: wp(2.5),
    fontWeight: '600',
  },

  footer: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  footerText: {
    fontSize: wp(2.8),
  },
  footerSub: {
    fontSize: wp(2.5),
    marginTop: hp(0.3),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: wp(5),
    width: wp(80),
    maxHeight: hp(60),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(3.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  languageOptionActive: {
    backgroundColor: COLORS.primary + '10',
  },
  languageText: {
    fontSize: wp(3.5),
    color: COLORS.text,
  },
  languageTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SettingsScreen;