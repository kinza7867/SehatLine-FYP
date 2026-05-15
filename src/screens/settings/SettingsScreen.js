import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
  Dimensions, Platform, StatusBar, ImageBackground, SafeAreaView,
  Alert, Modal, TextInput
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const SettingsScreen = ({ navigation }) => {
  // Settings States
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [cacheSize, setCacheSize] = useState('128 MB');
  const [isClearing, setIsClearing] = useState(false);

  const languages = ['English', 'Urdu', 'Arabic', 'Chinese', 'French'];

  const clearCache = () => {
    setIsClearing(true);
    setTimeout(() => {
      setCacheSize('0 MB');
      setIsClearing(false);
      Alert.alert('Success', 'Cache cleared successfully');
    }, 1500);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from SehatLine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => navigation.replace('Login')
        }
      ]
    );
  };

  const LanguageModal = () => (
    <Modal visible={showLanguageModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#001D3D', '#000814']} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Ionicons name="close" size={wp(6)} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.languageOption, language === lang && styles.languageOptionActive]}
              onPress={() => {
                setLanguage(lang);
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.languageText, language === lang && styles.languageTextActive]}>
                {lang}
              </Text>
              {language === lang && (
                <Ionicons name="checkmark" size={wp(5)} color="#04e1f5" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, danger }) => (
    <TouchableOpacity 
      style={[styles.settingItem, danger && styles.dangerItem]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={danger ? ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)'] : ['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.35)']}
        style={styles.settingGradient}
      >
        <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
          <Ionicons name={icon} size={wp(5.5)} color={danger ? '#EF4444' : '#04e1f5'} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement ? rightElement : (
          <Ionicons name="chevron-forward" size={wp(5)} color="#64748B" />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const SwitchItem = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.35)']}
        style={styles.settingGradient}
      >
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={wp(5.5)} color="#04e1f5" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#374151', true: '#04e1f5' }}
          thumbColor={value ? '#fff' : '#fff'}
        />
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <LinearGradient
              colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
              style={styles.headerGradient}
            >
              <View style={styles.topHeader}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: wp(10) }} />
              </View>
            </LinearGradient>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >

              {/* Account Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <SettingItem 
                  icon="person" 
                  title="Edit Profile"
                  subtitle="Update your personal information"
                  onPress={() => navigation.navigate('EditProfileScreen')}
                />
                <SettingItem 
                  icon="shield-checkmark" 
                  title="Privacy & Security"
                  subtitle="Manage your privacy settings"
                  onPress={() => navigation.navigate('PrivacyScreen')}
                />
                <SettingItem 
                  icon="card" 
                  title="Payment Methods"
                  subtitle="Add or remove payment options"
                  onPress={() => navigation.navigate('PaymentMethodsScreen')}
                />
              </View>

              {/* Preferences Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <SwitchItem 
                  icon="notifications" 
                  title="Push Notifications"
                  subtitle="Receive updates about appointments"
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
                <SwitchItem 
                  icon="moon" 
                  title="Dark Mode"
                  subtitle="Switch to dark theme"
                  value={darkMode}
                  onValueChange={setDarkMode}
                />
                <SwitchItem 
                  icon="sync" 
                  title="Auto Sync Data"
                  subtitle="Automatically sync your health data"
                  value={autoSync}
                  onValueChange={setAutoSync}
                />
                <SwitchItem 
                  icon="finger-print" 
                  title="Biometric Login"
                  subtitle="Use fingerprint or face ID"
                  value={biometricLogin}
                  onValueChange={setBiometricLogin}
                />
                <SwitchItem 
                  icon="save" 
                  title="Data Saver Mode"
                  subtitle="Reduce data usage"
                  value={dataSaver}
                  onValueChange={setDataSaver}
                />
                <SettingItem 
                  icon="language" 
                  title="Language"
                  subtitle={language}
                  onPress={() => setShowLanguageModal(true)}
                />
              </View>

              {/* Data Management Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Management</Text>
                <SettingItem 
                  icon="cloud-download" 
                  title="Download My Data"
                  subtitle="Export your medical records"
                  onPress={() => Alert.alert('Coming Soon', 'Data export feature will be available soon')}
                />
                <SettingItem 
                  icon="trash" 
                  title="Clear Cache"
                  subtitle={`Current cache: ${cacheSize}`}
                  onPress={clearCache}
                />
                <SettingItem 
                  icon="refresh" 
                  title="Reset All Settings"
                  subtitle="Restore default settings"
                  onPress={() => Alert.alert('Reset Settings', 'This will reset all app settings to default')}
                />
              </View>

              {/* Support Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <SettingItem 
                  icon="help-circle" 
                  title="Help & Support"
                  subtitle="FAQs and troubleshooting"
                  onPress={() => navigation.navigate('HelpSupportScreen')}
                />
                <SettingItem 
                  icon="chatbubble" 
                  title="Contact Us"
                  subtitle="Talk to our support team"
                  onPress={() => navigation.navigate('ContactScreen')}
                />
                <SettingItem 
                  icon="star" 
                  title="Rate Us"
                  subtitle="Rate SehatLine on App Store"
                  onPress={() => Alert.alert('Rate Us', 'Thank you for your feedback!')}
                />
                <SettingItem 
                  icon="share-social" 
                  title="Share App"
                  subtitle="Invite friends and family"
                  onPress={() => Alert.alert('Share', 'Share SehatLine with others')}
                />
              </View>

              {/* About Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <SettingItem 
                  icon="information-circle" 
                  title="App Version"
                  subtitle="v2.0.0 (Build 104)"
                />
                <SettingItem 
                  icon="document-text" 
                  title="Terms of Service"
                  subtitle="Read our terms and conditions"
                  onPress={() => navigation.navigate('PoliciesScreen')}
                />
                <SettingItem 
                  icon="shield" 
                  title="Privacy Policy"
                  subtitle="How we protect your data"
                  onPress={() => navigation.navigate('PoliciesScreen')}
                />
                <SettingItem 
                  icon="medkit" 
                  title="About SehatLine"
                  subtitle="Learn more about us"
                  onPress={() => navigation.navigate('AboutHospitalScreen')}
                />
              </View>

              {/* Danger Zone */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
                <SettingItem 
                  icon="log-out" 
                  title="Logout"
                  subtitle="Sign out from your account"
                  onPress={handleLogout}
                  danger={true}
                />
                <SettingItem 
                  icon="trash" 
                  title="Delete Account"
                  subtitle="Permanently delete your account"
                  onPress={() => Alert.alert(
                    'Delete Account',
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
                <Text style={styles.footerText}>SehatLine v2.0.0 | CDA Healthcare Portal</Text>
                <Text style={styles.footerSub}>© 2026 All Rights Reserved</Text>
              </View>

              <View style={{ height: hp(5) }} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <LanguageModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(16, 8, 63, 0.1)' },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(2),
    borderBottomLeftRadius: wp(6),
    borderBottomRightRadius: wp(6),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  iconBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: wp(5), 
    fontWeight: 'bold',
  },

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    color: '#04f5f5',
    fontSize: wp(3.8),
    fontWeight: 'bold',
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  dangerTitle: {
    color: '#EF4444',
  },

  settingItem: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1),
  },
  settingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3.5),
    gap: wp(3),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.1)',
    borderRadius: wp(3),
  },
  settingIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  settingSubtitle: {
    color: '#e8ecf1',
    fontSize: wp(2.5),
    marginTop: hp(0.2),
  },

  dangerItem: {
    borderColor: 'rgba(239, 68, 68, 0.36)',
  },
  dangerIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  dangerText: {
    color: '#EF4444',
  },

  footer: {
    alignItems: 'center',
    marginTop: hp(3),
  },
  footerText: {
    color: '#64748B',
    fontSize: wp(2.8),
  },
  footerSub: {
    color: '#4B5563',
    fontSize: wp(2.5),
    marginTop: hp(0.5),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#0A1520',
    borderRadius: wp(5),
    width: wp(80),
    maxHeight: hp(60),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4, 225, 245, 0.2)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(3.5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4, 225, 245, 0.1)',
  },
  languageOptionActive: {
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
  },
  languageText: {
    color: '#d3e6e4',
    fontSize: wp(3.5),
  },
  languageTextActive: {
    color: '#04e1f5',
    fontWeight: '600',
  },
});

export default SettingsScreen;