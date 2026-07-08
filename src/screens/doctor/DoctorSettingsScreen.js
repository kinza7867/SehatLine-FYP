// src/screens/doctor/DoctorSettingsScreen.js
import React from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const DoctorSettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = React.useState(true);
  const [autoAccept, setAutoAccept] = React.useState(false);
  const [language, setLanguage] = React.useState('English');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary || '#1a73e8', COLORS.secondary || '#0d47a1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.section, SHADOWS?.medium || {}]}>
            <Text style={styles.sectionTitle}>General</Text>
            
            <SettingItem
              icon="notifications-outline"
              label="Push Notifications"
              value={notifications}
              onValueChange={setNotifications}
              type="switch"
            />
            <SettingItem
              icon="time-outline"
              label="Auto Accept Patients"
              value={autoAccept}
              onValueChange={setAutoAccept}
              type="switch"
            />
            <SettingItem
              icon="language-outline"
              label="Language"
              value={language}
              type="text"
            />
          </View>

          <View style={[styles.section, SHADOWS?.medium || {}]}>
            <Text style={styles.sectionTitle}>Account</Text>
            <SettingItem icon="lock-closed-outline" label="Change Password" type="arrow" />
            <SettingItem icon="shield-checkmark-outline" label="Privacy Policy" type="arrow" />
            <SettingItem icon="document-text-outline" label="Terms & Conditions" type="arrow" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const SettingItem = ({ icon, label, value, onValueChange, type }) => (
  <TouchableOpacity style={styles.settingItem} disabled={type === 'switch'}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={wp(4.5)} color={COLORS.primary || '#1a73e8'} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    {type === 'switch' ? (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border || '#e0e0e0', true: COLORS.primary || '#1a73e8' }}
      />
    ) : type === 'arrow' ? (
      <Ionicons name="chevron-forward" size={wp(4)} color={COLORS.textLight || '#999'} />
    ) : (
      <Text style={styles.settingValue}>{value}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f7fa',
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: wp(8),
  },
  scrollView: {
    flex: 1,
    padding: wp(4),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  sectionTitle: {
    fontSize: wp(3.2),
    fontWeight: '700',
    color: COLORS.textSecondary || '#666',
    marginBottom: hp(0.5),
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#e0e0e0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15' || '#1a73e815',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  settingLabel: {
    fontSize: wp(3.2),
    color: COLORS.text || '#1a1a1a',
  },
  settingValue: {
    fontSize: wp(3),
    color: COLORS.textSecondary || '#666',
  },
});

export default DoctorSettingsScreen;