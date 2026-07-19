// src/screens/doctor/navigation/DoctorDrawerNavigator.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../../theme';

// ─── COMMENT OUT / REMOVE THIS LINE ─────────────────────────────
// import DoctorBottomTabNavigator from './DoctorBottomTabNavigator';

import TodayQueueScreen from '../TodayQueueScreen';
import ConsultationScreen from '../ConsultationScreen';
import PatientHistoryScreen from '../PatientHistoryScreen';
import TodayHistoryScreen from '../TodayHistoryScreen';
import PrescriptionScreen from '../PrescriptionScreen';
import PrescriptionTemplatesScreen from '../PrescriptionTemplatesScreen';
import DoctorScheduleScreen from '../DoctorScheduleScreen';
import CallNextPatientScreen from '../CallNextPatientScreen';
import DoctorProfileScreen from '../DoctorProfileScreen';
import DoctorEditProfileScreen from '../DoctorEditProfileScreen';
import DoctorNotificationsScreen from '../DoctorNotificationsScreen';
import AdminNotificationsScreen from '../AdminNotificationsScreen';
import DoctorSettingsScreen from '../DoctorSettingsScreen';
import DoctorReviewsScreen from '../DoctorReviewsScreen';
import DoctorAvailabilityScreen from '../DoctorAvailabilityScreen';
import HelpSupportScreen from '../../settings/HelpSupportScreen';
import DoctorDashboardScreen from '../DoctorDashboardScreen';
import RealTimeQueueScreen from '../RealTimeQueueScreen';
import DoctorDetailScreen from '../DoctorDetailScreen';
import DoctorListScreen from '../DoctorListScreen';

// ─── IMPORT DOCTOR PORTAL SCREEN ─────────────────────────────────
import DoctorPortalScreen from '../DoctorPortalScreen';

const Drawer = createDrawerNavigator();

// ── CUSTOM DRAWER CONTENT ──────────────────────────────────────────────
const DoctorDrawerContent = ({ navigation, state }) => {
  const [doctor, setDoctor] = useState({
    name: 'Dr. Ahmed Hassan',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology Department',
    hospital: 'Capital Hospital CDA',
    room: 'Room 12',
    isOnline: true,
  });

  useEffect(() => {
    loadDoctor();
  }, []);

  const loadDoctor = async () => {
    try {
      const data = await AsyncStorage.getItem('@sehatline_userData');
      if (data) {
        const user = JSON.parse(data);
        setDoctor({
          name: user.name || 'Dr. Ahmed Hassan',
          specialty: user.specialty || 'Interventional Cardiologist',
          department: user.department || 'Cardiology Department',
          hospital: user.hospital || 'Capital Hospital CDA',
          room: user.room || 'Room 12',
          isOnline: user.isOnline !== undefined ? user.isOnline : true,
        });
      }
    } catch (error) {
      console.log('Error loading doctor:', error);
    }
  };

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
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
                routes: [{ name: 'Login' }]
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  // Get current route name safely
  const getCurrentRoute = () => {
    if (state && state.routes && state.routes.length > 0) {
      const route = state.routes[state.index];
      return route ? route.name : null;
    }
    return null;
  };

  const currentRoute = getCurrentRoute();

  // ── Drawer Sections ──────────────────────────────────────────────────
  const drawerSections = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', icon: 'home-outline', route: 'DoctorHome' },
        { label: "Today's Queue", icon: 'people-outline', route: 'TodayQueue' },
        { label: 'Call Next Patient', icon: 'call-outline', route: 'CallNextPatientScreen' },
      ]
    },
    {
      title: 'PATIENTS',
      items: [
        { label: 'Patient History', icon: 'document-text-outline', route: 'PatientHistory' },
        { label: 'Prescription Templates', icon: 'albums-outline', route: 'PrescriptionTemplates' },
      ]
    },
    {
      title: 'MANAGE',
      items: [
        { label: 'Schedule', icon: 'calendar-outline', route: 'DoctorSchedule' },
        { label: 'Availability', icon: 'time-outline', route: 'DoctorAvailability' },
        { label: 'Real-Time Queue', icon: 'stats-chart-outline', route: 'RealTimeQueue' },
        { label: 'Reviews', icon: 'star-outline', route: 'DoctorReviews' },
        { label: 'Help & Support', icon: 'help-circle-outline', route: 'HelpSupport' },
      ]
    },
  ];

  return (
    <View style={styles.container}>
      {/* ─── HEADER ───────────────────────────────────────────────────── */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Image
          source={require('../../../../assets/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.name}>
          {doctor.name}
        </Text>

        <Text style={styles.specialty}>
          {doctor.specialty}
        </Text>

        <View style={styles.headerMeta}>
          <Text style={styles.department}>
            {doctor.department}
          </Text>
          <Text style={styles.headerDivider}>·</Text>
          <Text style={styles.department}>
            {doctor.room}
          </Text>
        </View>

        <Text style={styles.hospital}>
          {doctor.hospital}
        </Text>

        <View style={styles.onlineContainer}>
          <View style={[styles.dot, doctor.isOnline && styles.dotActive]} />
          <Text style={styles.onlineText}>
            {doctor.isOnline ? 'Available' : 'Offline'}
          </Text>
        </View>
      </LinearGradient>

      {/* ─── DRAWER ITEMS ─────────────────────────────────────────────── */}
      <DrawerContentScrollView contentContainerStyle={styles.scrollContent}>
        {drawerSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {sectionIndex > 0 && <View style={styles.sectionDivider} />}
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const isFocused = currentRoute === item.route;
              return (
                <DrawerItem
                  key={item.route}
                  label={item.label}
                  labelStyle={[styles.drawerLabel, isFocused && styles.drawerLabelActive]}
                  icon={({ size }) => (
                    <View style={[
                      styles.drawerIcon,
                      isFocused && styles.drawerIconActive,
                    ]}>
                      <Ionicons
                        name={item.icon}
                        size={size}
                        color={isFocused ? COLORS.primary : COLORS.textSecondary}
                      />
                    </View>
                  )}
                  onPress={() => navigation.navigate(item.route)}
                  style={[styles.drawerItem, isFocused && styles.drawerItemActive]}
                />
              );
            })}
          </View>
        ))}

        {/* ─── LOGOUT ──────────────────────────────────────────────────── */}
        <View style={styles.logoutSection}>
          <View style={styles.sectionDivider} />
          <DrawerItem
            label="Logout"
            labelStyle={styles.logoutLabel}
            icon={({ size }) => (
              <Ionicons
                name="log-out-outline"
                size={size}
                color={COLORS.danger}
              />
            )}
            onPress={logout}
            style={styles.logoutItem}
          />
        </View>
      </DrawerContentScrollView>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          SehatLine v2.0.1
        </Text>
        <View style={styles.footerDivider} />
        <Text style={styles.footerSub}>
          Doctor Portal
        </Text>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════
export default function DoctorDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DoctorDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 320,
          backgroundColor: COLORS.white,
        },
        drawerType: 'front',
        swipeEdgeWidth: 50,
      }}
    >
      {/* ─── MAIN SCREENS ────────────────────────────────────────────── */}
      {/* REPLACED DoctorBottomTabNavigator WITH DoctorPortalScreen */}
      <Drawer.Screen
        name="DoctorHome"
        component={DoctorPortalScreen}
        options={{ title: 'Dashboard' }}
      />

      <Drawer.Screen
        name="TodayQueue"
        component={TodayQueueScreen}
        options={{ title: "Today's Queue" }}
      />

      <Drawer.Screen
        name="Consultation"
        component={ConsultationScreen}
        options={{ title: 'Consultation' }}
      />

      <Drawer.Screen
        name="CallNextPatientScreen"
        component={CallNextPatientScreen}
        options={{ 
          title: 'Call Next Patient',
          //drawerItemStyle: { display: 'none' }
        }}
      />

      {/* ─── PATIENT SCREENS ─────────────────────────────────────────── */}
      <Drawer.Screen
        name="PatientHistory"
        component={PatientHistoryScreen}
        options={{ title: 'Patient History' }}
      />

      <Drawer.Screen
        name="TodayHistory"
        component={TodayHistoryScreen}
        options={{ title: "Today's History" }}
      />

      <Drawer.Screen
        name="Prescription"
        component={PrescriptionScreen}
        options={{ title: 'Prescription' }}
      />

      <Drawer.Screen
        name="PrescriptionTemplates"
        component={PrescriptionTemplatesScreen}
        options={{ title: 'Prescription Templates' }}
      />

      {/* ─── MANAGEMENT SCREENS ──────────────────────────────────────── */}
      <Drawer.Screen
        name="DoctorSchedule"
        component={DoctorScheduleScreen}
        options={{ title: 'Schedule' }}
      />

      <Drawer.Screen
        name="DoctorAvailability"
        component={DoctorAvailabilityScreen}
        options={{ title: 'Availability' }}
      />

      <Drawer.Screen
        name="RealTimeQueue"
        component={RealTimeQueueScreen}
        options={{ title: 'Real-Time Queue' }}
      />

      <Drawer.Screen
        name="DoctorReviews"
        component={DoctorReviewsScreen}
        options={{ title: 'Reviews' }}
      />

      <Drawer.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & Support' }}
      />

      {/* ─── ACCOUNT SCREENS ─────────────────────────────────────────── */}
      <Drawer.Screen
        name="DoctorProfile"
        component={DoctorProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
        
      <Drawer.Screen
        name="DoctorEditProfileScreen"
        component={DoctorEditProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="DoctorSettings"
        component={DoctorSettingsScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="DoctorNotifications"
        component={DoctorNotificationsScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
        options={{ 
          title: 'Admin Notifications',
          drawerItemStyle: { display: 'none' }
        }}
      />

      {/* ─── HIDDEN / EXTRA SCREENS ──────────────────────────────────── */}
      <Drawer.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="DoctorDetail"
        component={DoctorDetailScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 22,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 4,
  },
  specialty: {
    fontSize: 13,
    color: COLORS.white,
    marginTop: 2,
    opacity: 0.9,
    fontWeight: '500',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerDivider: {
    color: COLORS.white,
    opacity: 0.6,
    marginHorizontal: 6,
    fontSize: 14,
  },
  department: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.85,
  },
  hospital: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 2,
    opacity: 0.75,
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: '#00ff88',
  },
  onlineText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  drawerItem: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  drawerItemActive: {
    backgroundColor: COLORS.primary + '08',
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: -4,
  },
  drawerLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  drawerIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerIconActive: {
    backgroundColor: COLORS.primary + '12',
  },

  logoutSection: {
    marginTop: 4,
  },
  logoutItem: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: -4,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  footerDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  footerSub: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '400',
  },
});