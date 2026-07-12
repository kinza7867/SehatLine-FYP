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

import DoctorBottomTabNavigator from './DoctorBottomTabNavigator';
import TodayQueueScreen from '../TodayQueueScreen';
import ConsultationScreen from '../ConsultationScreen';
import PatientHistoryScreen from '../PatientHistoryScreen';
import PrescriptionScreen from '../PrescriptionScreen';
import PrescriptionTemplatesScreen from '../PrescriptionTemplatesScreen';
import DoctorScheduleScreen from '../DoctorScheduleScreen';
import CallNextPatientScreen from '../CallNextPatientScreen';
import DoctorProfileScreen from '../DoctorProfileScreen';
import DoctorNotificationsScreen from '../DoctorNotificationsScreen';
import DoctorSettingsScreen from '../DoctorSettingsScreen';
import DoctorReviewsScreen from '../DoctorReviewsScreen';
import DoctorAvailabilityScreen from '../DoctorAvailabilityScreen';
import HelpSupportScreen from '../../settings/HelpSupportScreen';

const Drawer = createDrawerNavigator();

const DoctorDrawerContent = ({ navigation }) => {
  const [doctor, setDoctor] = useState({
    name: 'Dr. Ahmed Hassan',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology Department',
    hospital: 'CDA Hospital Islamabad',
    isOnline: true,
  });

  useEffect(() => {
    loadDoctor();
  }, []);

  const loadDoctor = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const user = JSON.parse(data);
        setDoctor({
          name: user.name || 'Dr. Ahmed Hassan',
          specialty: user.specialty || 'Interventional Cardiologist',
          department: user.department || 'Cardiology Department',
          hospital: user.hospital || 'CDA Hospital Islamabad',
          isOnline: user.isOnline !== undefined ? user.isOnline : true,
        });
      }
    } catch (error) {
      console.log(error);
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

  return (
    <View style={styles.container}>
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

        <Text style={styles.department}>
          {doctor.department}
        </Text>

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

      <DrawerContentScrollView>
        <DrawerItem
          label="Doctor Portal"
          icon={({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('DoctorHome')}
        />

        <DrawerItem
          label="Today's Queue"
          icon={({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('TodayQueue')}
        />

        <DrawerItem
          label="Consultation"
          icon={({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('Consultation')}
        />

        <DrawerItem
          label="Patient History"
          icon={({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('PatientHistory')}
        />

        <DrawerItem
          label="Prescription"
          icon={({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('Prescription')}
        />

        <DrawerItem
          label="Prescription Templates"
          icon={({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('PrescriptionTemplates')}
        />

        <DrawerItem
          label="Schedule"
          icon={({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('DoctorSchedule')}
        />

        <DrawerItem
          label="Profile"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('DoctorProfile')}
        />

        <DrawerItem
          label="Notifications"
          icon={({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('DoctorNotifications')}
        />

        <DrawerItem
          label="Reviews"
          icon={({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('DoctorReviews')}
        />

        <DrawerItem
          label="Availability"
          icon={({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('DoctorAvailability')}
        />

        <DrawerItem
          label="Settings"
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('DoctorSettings')}
        />

        <DrawerItem
          label="Help & Support"
          icon={({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate('HelpSupport')}
        />

        <View style={styles.divider} />

        <DrawerItem
          label="Logout"
          labelStyle={{
            color: COLORS.danger,
            fontWeight: '700'
          }}
          icon={({ size }) => (
            <Ionicons
              name="log-out-outline"
              size={size}
              color={COLORS.danger}
            />
          )}
          onPress={logout}
        />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          SehatLine Doctor Portal
        </Text>
      </View>
    </View>
  );
};

export default function DoctorDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <DoctorDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 300,
          backgroundColor: '#fff',
        },
      }}
    >
      <Drawer.Screen
        name="DoctorHome"
        component={DoctorBottomTabNavigator}
      />

      <Drawer.Screen
        name="TodayQueue"
        component={TodayQueueScreen}
      />

      <Drawer.Screen
        name="Consultation"
        component={ConsultationScreen}
      />

      <Drawer.Screen
        name="PatientHistory"
        component={PatientHistoryScreen}
      />

      <Drawer.Screen
        name="Prescription"
        component={PrescriptionScreen}
      />

      <Drawer.Screen
        name="PrescriptionTemplates"
        component={PrescriptionTemplatesScreen}
      />

      <Drawer.Screen
        name="DoctorSchedule"
        component={DoctorScheduleScreen}
      />

      <Drawer.Screen
        name="DoctorProfile"
        component={DoctorProfileScreen}
      />

      <Drawer.Screen
        name="DoctorNotifications"
        component={DoctorNotificationsScreen}
      />

      <Drawer.Screen
        name="DoctorReviews"
        component={DoctorReviewsScreen}
      />

      <Drawer.Screen
        name="DoctorAvailability"
        component={DoctorAvailabilityScreen}
      />

      <Drawer.Screen
        name="DoctorSettings"
        component={DoctorSettingsScreen}
      />

      <Drawer.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
      />

      {/* Hidden screens for navigation - not shown in drawer */}
      <Drawer.Screen
        name="CallNextPatientScreen"
        component={CallNextPatientScreen}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.95,
    fontWeight: '500',
  },
  department: {
    fontSize: 13,
    color: '#fff',
    marginTop: 2,
    opacity: 0.85,
  },
  hospital: {
    fontSize: 13,
    color: '#eee',
    marginTop: 3,
    opacity: 0.8,
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4444',
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: '#00ff88',
  },
  onlineText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});