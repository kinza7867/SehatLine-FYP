// src/screens/doctor/DoctorScheduleScreen.js
import React, { useState, useEffect } from 'react';
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
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const USER_DATA_KEY = '@sehatline_userData';

const DoctorScheduleScreen = ({ navigation }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        setDoctor(parsed);
      } else {
        // Fallback mock data
        setDoctor({
          name: 'Dr. Ahmed Hassan',
          specialty: 'Consultant Cardiologist',
          department: 'Cardiology Department',
          hospital: 'Capital Hospital CDA',
          room: 'Room 12',
          shift: '08:30 AM – 02:00 PM',
          break: '12:30 PM – 01:00 PM',
          workingDays: 'Monday - Friday',
          patientsPerDay: '45-50',
          isOnline: true,
          avatar: 'AH',
          color: COLORS.primary,
          color2: COLORS.secondary,
        });
      }
    } catch (error) {
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoctorData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.headerTitle}>My Schedule</Text>
          </View>

          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ─── DOCTOR INFO ────────────────────────────────────────────── */}
          <View style={[styles.doctorCard, SHADOWS.medium]}>
            <LinearGradient
              colors={[doctor?.color || COLORS.primary, doctor?.color2 || COLORS.secondary]}
              style={styles.doctorAvatar}
            >
              <Text style={styles.doctorAvatarText}>{doctor?.avatar || 'DR'}</Text>
            </LinearGradient>

            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor?.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor?.specialty}</Text>
              <Text style={styles.doctorDept}>{doctor?.department}</Text>
              <Text style={styles.doctorHospital}>{doctor?.hospital}</Text>
            </View>
          </View>

          {/* ─── WORKING DAYS ───────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Working Days</Text>
            <View style={[styles.infoCard, SHADOWS.small]}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={wp(4.5)} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Days of Attendance</Text>
                  <Text style={styles.infoValue}>{doctor?.workingDays || 'Monday - Friday'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── DUTY HOURS ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duty Hours</Text>
            <View style={[styles.infoCard, SHADOWS.small]}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={wp(4.5)} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Shift</Text>
                  <Text style={styles.infoValue}>{doctor?.shift || '08:30 AM – 02:00 PM'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Ionicons name="cafe-outline" size={wp(4.5)} color={COLORS.warning} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Break</Text>
                  <Text style={styles.infoValue}>{doctor?.break || '12:30 PM – 01:00 PM'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── LOCATION ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={[styles.infoCard, SHADOWS.small]}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={wp(4.5)} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Room</Text>
                  <Text style={styles.infoValue}>{doctor?.room || 'Room 12'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── STATUS ────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={[styles.statusCard, SHADOWS.small]}>
              <View style={[styles.statusBadge, doctor?.isOnline && styles.statusOnline]}>
                <View style={[styles.statusDot, doctor?.isOnline && styles.statusDotOnline]} />
                <Text style={[styles.statusText, doctor?.isOnline && styles.statusTextOnline]}>
                  {doctor?.isOnline ? 'On Duty' : 'Off Duty'}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── FOOTER ────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine v2.0.1</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: hp(1),
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },

  // ── Header ────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '20',
  },
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  headerLogo: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: wp(4.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: wp(9),
  },

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },

  // ── Section ──────────────────────────────────────────────────────
  section: {
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1),
  },

  // ── Doctor Card ──────────────────────────────────────────────────
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    padding: wp(3.5),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  doctorAvatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: '700',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  doctorName: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
  },
  doctorSpecialty: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  doctorDept: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
  doctorHospital: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },

  // ── Info Card ────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.3),
  },
  infoContent: {
    flex: 1,
    marginLeft: wp(3),
  },
  infoLabel: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(0.1),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: hp(0.3),
  },

  // ── Status Card ──────────────────────────────────────────────────
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: wp(4),
    backgroundColor: COLORS.backgroundSecondary,
    gap: wp(1.5),
  },
  statusOnline: {
    backgroundColor: COLORS.success + '15',
  },
  statusDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: COLORS.textLight,
  },
  statusDotOnline: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusTextOnline: {
    color: COLORS.success,
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: hp(3),
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: wp(4),
  },
  footerText: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },
});

export default DoctorScheduleScreen;