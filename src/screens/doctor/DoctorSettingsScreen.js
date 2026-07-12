// src/screens/doctor/DoctorSettingsScreen.js
import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const DoctorSettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptPatients, setAutoAcceptPatients] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');

  // Handle Language Change
  const handleLanguageChange = () => {
    Alert.alert(
      'Change Language',
      'Select Language',
      [
        { text: 'English', onPress: () => setLanguage('English') },
        { text: 'Urdu', onPress: () => setLanguage('Urdu') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Logout Function
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Add your logout logic here (clear AsyncStorage, etc.)
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header - Same as Notification Screen */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Settings</Text>

            <View style={styles.headerRight}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* General Section */}
        <View style={[styles.section, SHADOWS.medium]}>
          <Text style={styles.sectionTitle}>General</Text>

          <SettingItem
            icon="notifications-outline"
            label="Push Notifications"
            type="switch"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />

          <SettingItem
            icon="people-outline"
            label="Auto Accept Patients"
            type="switch"
            value={autoAcceptPatients}
            onValueChange={setAutoAcceptPatients}
          />

          <SettingItem
            icon="moon-outline"
            label="Dark Mode"
            type="switch"
            value={darkMode}
            onValueChange={setDarkMode}
          />

          <SettingItem
            icon="language-outline"
            label="Language"
            type="arrow"
            value={language}
            onPress={handleLanguageChange}
          />
        </View>

        {/* Account Section */}
        <View style={[styles.section, SHADOWS.medium]}>
          <Text style={styles.sectionTitle}>Account</Text>

          <SettingItem
            icon="lock-closed-outline"
            label="Change Password"
            type="arrow"
            onPress={() => Alert.alert('Change Password', 'This feature is under development.')}
          />

          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            type="arrow"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon.')}
          />

          <SettingItem
            icon="document-text-outline"
            label="Terms & Conditions"
            type="arrow"
            onPress={() => Alert.alert('Terms', 'Terms & Conditions will open here.')}
          />

          <SettingItem
            icon="help-circle-outline"
            label="Help & Support"
            type="arrow"
            onPress={() => Alert.alert('Support', 'Contact support at support@sehatline.com')}
          />
        </View>

        {/* About Section */}
        <View style={[styles.section, SHADOWS.medium]}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="information-circle-outline"
            label="App Version"
            type="text"
            value="1.2.4"
          />
          <SettingItem
            icon="build-outline"
            label="Build Number"
            type="text"
            value="20250712"
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={wp(4.5)} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Reusable Setting Item Component
const SettingItem = ({ icon, label, type, value, onValueChange, onPress }) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={type === 'switch'}
  >
    <View style={styles.settingLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={wp(4.8)} color={COLORS.primary} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>

    {type === 'switch' ? (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
        thumbColor="#fff"
      />
    ) : type === 'arrow' ? (
      <Ionicons name="chevron-forward" size={wp(4)} color={COLORS.textLight} />
    ) : (
      <Text style={styles.settingValue}>{value}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : hp(1),
    paddingBottom: hp(2),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    gap: wp(3),
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(5),
    fontWeight: '700',
    flex: 1,
  },
  headerRight: {
    width: 30,
  },

  scrollView: {
    flex: 1,
    padding: wp(4),
  },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: wp(3.4),
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: hp(1.5),
    letterSpacing: 0.3,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  settingLabel: {
    fontSize: wp(3.4),
    color: COLORS.text,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1),
    paddingVertical: hp(1.8),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    gap: wp(2),
  },
  logoutText: {
    fontSize: wp(3.6),
    fontWeight: '600',
    color: COLORS.danger,
  },
});

export default DoctorSettingsScreen;