// src/components/CustomDrawerContent.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme';

const { width } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;

const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const [userName, setUserName] = useState('Dr. Ahmed Hassan');
  const [userRole, setUserRole] = useState('doctor');

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserName(parsed.name || 'Dr. Ahmed Hassan');
        setUserRole(parsed.role || 'doctor');
      }
    } catch (e) {}
  };

  const handleLogout = async () => {
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
              await AsyncStorage.removeItem('userData');
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('userRole');
            } catch (e) {}
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const doctorItems = [
    { label: 'Dashboard', icon: 'home-outline', route: 'DoctorPortal' },
    { label: "Today's Queue", icon: 'people-outline', route: 'TodayQueue' },
    { label: 'Consultation', icon: 'medkit-outline', route: 'Consultation' },
    { label: 'Patient History', icon: 'folder-outline', route: 'PatientHistory' },
    { label: 'Prescription', icon: 'document-text-outline', route: 'Prescription' },
    { label: 'Templates', icon: 'albums-outline', route: 'PrescriptionTemplates' },
    { label: 'Schedule', icon: 'calendar-outline', route: 'DoctorSchedule' },
    { label: 'Availability', icon: 'time-outline', route: 'DoctorAvailability' },
    { label: 'Profile', icon: 'person-outline', route: 'DoctorProfile' },
    { label: 'Settings', icon: 'settings-outline', route: 'DoctorSettings' },
    { label: 'Notifications', icon: 'notifications-outline', route: 'DoctorNotifications' },
  ];

  const patientItems = [
    { label: 'Home', icon: 'home-outline', route: 'Home' },
    { label: 'Patient Portal', icon: 'person-outline', route: 'PatientPortal' },
    { label: 'Profile', icon: 'person-circle-outline', route: 'Profile' },
    { label: 'Settings', icon: 'settings-outline', route: 'Settings' },
  ];

  const drawerItems = userRole === 'doctor' ? doctorItems : patientItems;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.drawerHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.doctorName} numberOfLines={1}>{userName}</Text>
          <Text style={styles.doctorSpecialty}>
            {userRole === 'doctor' ? 'Cardiologist' : 'Patient'}
          </Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </LinearGradient>

      <DrawerContentScrollView style={styles.drawerScroll}>
        {drawerItems.map((item) => (
          <DrawerItem
            key={item.route}
            label={item.label}
            icon={({ color, size }) => (
              <Ionicons name={item.icon} size={size} color={color} />
            )}
            onPress={() => navigation.navigate(item.route)}
            labelStyle={styles.drawerLabel}
            style={styles.drawerItem}
          />
        ))}

        <View style={styles.divider} />

        <DrawerItem
          label="Logout"
          icon={({ size }) => (
            <Ionicons name="log-out-outline" size={size} color={COLORS.danger} />
          )}
          onPress={handleLogout}
          labelStyle={[styles.drawerLabel, styles.logoutLabel]}
          style={styles.drawerItem}
        />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SehatLine v1.0.0</Text>
        <Text style={styles.footerSubtext}>Healthcare Portal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  drawerHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  logoImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
  },
  doctorName: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: wp(3),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: wp(2.6),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  drawerScroll: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    borderRadius: 0,
    marginHorizontal: 0,
  },
  drawerLabel: {
    fontSize: wp(3.5),
    color: COLORS.text,
    fontWeight: '500',
  },
  logoutLabel: {
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
  },
  footerSubtext: {
    fontSize: wp(2.4),
    color: COLORS.border,
    marginTop: 2,
  },
});

export default CustomDrawerContent;