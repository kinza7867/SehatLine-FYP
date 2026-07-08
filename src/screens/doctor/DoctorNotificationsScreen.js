// src/screens/doctor/DoctorNotificationsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const DoctorNotificationsScreen = ({ navigation }) => {
  const [notifications] = useState([
    { id: '1', title: 'New Patient Assigned', message: 'Ali Raza has been assigned to you.', time: '5 mins ago', read: false },
    { id: '2', title: 'Prescription Sent', message: 'Prescription for Muhammad Usman sent to pharmacy.', time: '15 mins ago', read: false },
    { id: '3', title: 'Appointment Reminder', message: 'You have an appointment at 3:00 PM.', time: '1 hour ago', read: true },
    { id: '4', title: 'Lab Report Ready', message: 'Blood test results for Fatima Noor are ready.', time: '2 hours ago', read: true },
  ]);

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity>
            <Text style={styles.markAllText}>Mark All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {notifications.map((item) => (
            <View key={item.id} style={[styles.notificationItem, SHADOWS?.small || {}]}>
              <View style={[styles.notificationDot, { backgroundColor: item.read ? COLORS.border || '#e0e0e0' : COLORS.primary || '#1a73e8' }]} />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

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
  markAllText: {
    fontSize: wp(3),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: wp(4),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3.5),
    marginBottom: hp(0.8),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  notificationDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    marginRight: wp(3),
    marginTop: wp(1),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text || '#1a1a1a',
  },
  notificationMessage: {
    fontSize: wp(3),
    color: COLORS.textSecondary || '#666',
    marginTop: hp(0.1),
  },
  notificationTime: {
    fontSize: wp(2.4),
    color: COLORS.textLight || '#999',
    marginTop: hp(0.1),
  },
});

export default DoctorNotificationsScreen;