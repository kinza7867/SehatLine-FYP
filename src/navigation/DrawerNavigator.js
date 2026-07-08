// src/navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../theme';

// Custom Drawer Content
import CustomDrawerContent from '../components/CustomDrawerContent';

// Home Screens
import HomeScreen from '../screens/home/HomeScreen';

// Doctor Screens
import DoctorPortalScreen from '../screens/doctor/DoctorPortalScreen';
import TodayQueueScreen from '../screens/doctor/TodayQueueScreen';
import ConsultationScreen from '../screens/doctor/ConsultationScreen';
import PatientHistoryScreen from '../screens/doctor/PatientHistoryScreen';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
import PrescriptionTemplatesScreen from '../screens/doctor/PrescriptionTemplatesScreen';
import DoctorScheduleScreen from '../screens/doctor/DoctorScheduleScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import DoctorSettingsScreen from '../screens/doctor/DoctorSettingsScreen';
import DoctorNotificationsScreen from '../screens/doctor/DoctorNotificationsScreen';
import DoctorAvailabilityScreen from '../screens/doctor/DoctorAvailabilityScreen';

// Patient Screens
import PatientPortal from '../screens/portal/PatientPortal';

// Profile & Settings
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: '#666',
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
        },
        drawerStyle: {
          width: '80%',
        },
      }}
    >
      {/* ─── HOME ─────────────────────────────────────────── */}
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ─── DOCTOR MODULE ────────────────────────────────── */}
      <Drawer.Screen
        name="DoctorPortal"
        component={DoctorPortalScreen}
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="TodayQueue"
        component={TodayQueueScreen}
        options={{
          drawerLabel: "Today's Queue",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Consultation"
        component={ConsultationScreen}
        options={{
          drawerLabel: 'Consultation',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="PatientHistory"
        component={PatientHistoryScreen}
        options={{
          drawerLabel: 'Patient History',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Prescription"
        component={PrescriptionScreen}
        options={{
          drawerLabel: 'Prescription',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="PrescriptionTemplates"
        component={PrescriptionTemplatesScreen}
        options={{
          drawerLabel: 'Templates',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DoctorSchedule"
        component={DoctorScheduleScreen}
        options={{
          drawerLabel: 'Schedule',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DoctorAvailability"
        component={DoctorAvailabilityScreen}
        options={{
          drawerLabel: 'Availability',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DoctorProfile"
        component={DoctorProfileScreen}
        options={{
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DoctorSettings"
        component={DoctorSettingsScreen}
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DoctorNotifications"
        component={DoctorNotificationsScreen}
        options={{
          drawerLabel: 'Notifications',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ─── PATIENT MODULE ────────────────────────────────── */}
      <Drawer.Screen
        name="PatientPortal"
        component={PatientPortal}
        options={{
          drawerLabel: 'Patient Portal',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ─── PROFILE & SETTINGS ───────────────────────────── */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerLabel: 'My Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          drawerLabel: 'Help & Support',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;