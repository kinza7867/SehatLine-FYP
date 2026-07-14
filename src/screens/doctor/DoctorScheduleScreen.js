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
const APPOINTMENTS_KEY = '@sehatline_appointments';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const QUEUE_KEY = '@sehatline_queue';

const DoctorScheduleScreen = ({ navigation }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [todayWaiting, setTodayWaiting] = useState(0);
  const [todayRemaining, setTodayRemaining] = useState(0);
  const [todayDate, setTodayDate] = useState('');
  const [todayDay, setTodayDay] = useState('');

  useEffect(() => {
    loadDoctorData();
    getTodayInfo();
  }, []);

  const getTodayInfo = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    setTodayDay(dayName);
    setTodayDate(dateStr);
  };

  // ─── Calculate Expected Completed Patients Based on Time ──────────
  const calculateExpectedCompleted = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Shift timing
    const shiftStart = 8 * 60 + 30; // 8:30 AM
    const shiftEnd = 14 * 60; // 2:00 PM
    const breakStart = 12 * 60 + 30; // 12:30 PM
    const breakEnd = 13 * 60; // 1:00 PM
    const breakDuration = breakEnd - breakStart; // 30 minutes
    
    // Total working minutes in shift (excluding break)
    const totalWorkingMinutes = (shiftEnd - shiftStart) - breakDuration;
    
    // Minutes worked so far (excluding break)
    let workedMinutes = 0;
    
    if (totalMinutes <= shiftStart) {
      // Before shift starts
      return 0;
    } else if (totalMinutes <= breakStart) {
      // Before break
      workedMinutes = totalMinutes - shiftStart;
    } else if (totalMinutes <= breakEnd) {
      // During break - no patients
      workedMinutes = breakStart - shiftStart;
    } else if (totalMinutes <= shiftEnd) {
      // After break
      workedMinutes = (breakStart - shiftStart) + (totalMinutes - breakEnd);
    } else {
      // After shift ends
      workedMinutes = totalWorkingMinutes;
    }
    
    // Total patients = 48 (average of 45-50)
    const totalPatients = 48;
    
    // Calculate expected completed based on time progress
    const progress = Math.min(1, workedMinutes / totalWorkingMinutes);
    const expected = Math.round(totalPatients * progress);
    
    return Math.min(expected, totalPatients);
  };

  const loadDoctorData = async () => {
    try {
      // Load doctor data
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      let doctorData = null;
      
      if (userData) {
        doctorData = JSON.parse(userData);
      } else {
        // Fallback mock data
        doctorData = {
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
        };
      }
      
      setDoctor(doctorData);

      // ─── Load Today's Data ────────────────────────────────────────────
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Total Appointments (Use doctor's daily capacity)
      const totalPatients = 48; // Average of 45-50
      setTodayAppointments(totalPatients);

      // 2. Load Completed Patients
      const completedData = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      let completed = [];
      if (completedData) {
        completed = JSON.parse(completedData);
      }

      // Filter today's completed
      const todayCompletedList = completed.filter(item => {
        if (!item.completedAt) return false;
        const itemDate = new Date(item.completedAt);
        if (isNaN(itemDate.getTime())) return false;
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      });

      const completedCount = todayCompletedList.length;
      setTodayCompleted(completedCount);

      // 3. Load Queue (Waiting)
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      let queue = [];
      if (queueData) {
        queue = JSON.parse(queueData);
      }

      // Filter today's waiting
      const todayWaitingList = queue.filter(item => {
        if (!item.date && !item.createdAt) return false;
        const itemDate = new Date(item.date || item.createdAt);
        if (isNaN(itemDate.getTime())) return false;
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      });

      const waitingCount = todayWaitingList.length;
      setTodayWaiting(waitingCount);

      // 4. Calculate Remaining (Expected - Completed - Waiting)
      const expectedCompleted = calculateExpectedCompleted();
      const remainingCount = Math.max(0, totalPatients - completedCount - waitingCount);
      setTodayRemaining(remainingCount);

    } catch (error) {
      console.error('Error loading doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoctorData();
    getTodayInfo();
    setRefreshing(false);
  };

  // ─── Check if doctor is working today ──────────────────────────────
  const isWorkingToday = () => {
    if (!doctor?.workingDays) return true;
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[today.getDay()];
    
    const workingDaysList = doctor.workingDays.split(' - ');
    if (workingDaysList.length === 2) {
      const startDay = workingDaysList[0];
      const endDay = workingDaysList[1];
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const startIndex = daysOfWeek.indexOf(startDay);
      const endIndex = daysOfWeek.indexOf(endDay);
      const todayIndex = daysOfWeek.indexOf(todayName);
      
      if (startIndex <= endIndex) {
        return todayIndex >= startIndex && todayIndex <= endIndex;
      } else {
        return todayIndex >= startIndex || todayIndex <= endIndex;
      }
    }
    return doctor.workingDays.includes(todayName);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Schedule...</Text>
      </View>
    );
  }

  const isWorking = isWorkingToday();
  const expectedCompleted = calculateExpectedCompleted();
  const progressPercentage = todayAppointments > 0 ? Math.round((todayCompleted / todayAppointments) * 100) : 0;

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

          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ─── TODAY'S STATUS BANNER ────────────────────────────────── */}
          <View style={[styles.todayBanner, SHADOWS.medium]}>
            <View style={styles.todayBannerLeft}>
              <Text style={styles.todayBannerDay}>{todayDay}</Text>
              <Text style={styles.todayBannerDate}>{todayDate}</Text>
            </View>
            <View style={styles.todayBannerRight}>
              <View style={[styles.todayStatusBadge, isWorking && styles.todayStatusActive]}>
                <View style={[styles.todayStatusDot, isWorking && styles.todayStatusDotActive]} />
                <Text style={[styles.todayStatusText, isWorking && styles.todayStatusTextActive]}>
                  {isWorking ? 'Working Today' : 'Off Today'}
                </Text>
              </View>
              <Text style={styles.todayProgressText}>
                {todayCompleted} / {todayAppointments} Completed
              </Text>
            </View>
          </View>

          {/* ─── TODAY'S STATS ─────────────────────────────────────────── */}
          <View style={[styles.statsRow, SHADOWS.small]}>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: COLORS.primary }]}>{todayAppointments}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>{todayCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: COLORS.warning }]}>{todayWaiting}</Text>
              <Text style={styles.statLabel}>Waiting</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: COLORS.textLight }]}>{todayRemaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          {/* ─── PROGRESS BAR ──────────────────────────────────────────── */}
          <View style={[styles.progressContainer, SHADOWS.small]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(100, progressPercentage)}%`,
                    backgroundColor: progressPercentage > 70 ? COLORS.success : COLORS.primary
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressSubText}>
              {todayCompleted} out of {todayAppointments} patients completed
            </Text>
            <Text style={styles.progressTimeText}>
              Expected: {expectedCompleted} patients by this time
            </Text>
          </View>

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
            <View style={[styles.infoCard, SHADOWS.medium]}>
              <View style={styles.infoRow}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="calendar-outline" size={wp(4.5)} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Days of Attendance</Text>
                  <Text style={styles.infoValue}>{doctor?.workingDays || 'Monday - Friday'}</Text>
                </View>
              </View>
              {isWorking && (
                <View style={styles.todayHighlight}>
                  <Ionicons name="checkmark-circle" size={wp(3)} color={COLORS.success} />
                  <Text style={styles.todayHighlightText}>Active Today • {todayDay}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ─── DUTY HOURS ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duty Hours</Text>
            <View style={[styles.infoCard, SHADOWS.medium]}>
              <View style={styles.infoRow}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="time-outline" size={wp(4.5)} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Shift</Text>
                  <Text style={styles.infoValue}>{doctor?.shift || '08:30 AM – 02:00 PM'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={[styles.iconWrapper, { backgroundColor: COLORS.warning + '15' }]}>
                  <Ionicons name="cafe-outline" size={wp(4.5)} color={COLORS.warning} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Break</Text>
                  <Text style={styles.infoValue}>{doctor?.break || '12:30 PM – 01:00 PM'}</Text>
                </View>
              </View>

              {isWorking && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <View style={[styles.iconWrapper, { backgroundColor: COLORS.success + '15' }]}>
                      <Ionicons name="people-outline" size={wp(4.5)} color={COLORS.success} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Daily Capacity</Text>
                      <Text style={styles.infoValue}>{doctor?.patientsPerDay || '45-50'}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* ─── LOCATION ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={[styles.infoCard, SHADOWS.medium]}>
              <View style={styles.infoRow}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="location-outline" size={wp(4.5)} color={COLORS.primary} />
                </View>
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
            <View style={[styles.statusCard, SHADOWS.medium]}>
              <View style={[styles.statusBadge, doctor?.isOnline && styles.statusOnline]}>
                <View style={[styles.statusDot, doctor?.isOnline && styles.statusDotOnline]} />
                <Text style={[styles.statusText, doctor?.isOnline && styles.statusTextOnline]}>
                  {doctor?.isOnline ? 'On Duty' : 'Off Duty'}
                </Text>
              </View>
              {doctor?.isOnline && isWorking && (
                <Text style={styles.statusSubText}>Available for consultations</Text>
              )}
              {doctor?.isOnline && !isWorking && (
                <Text style={[styles.statusSubText, { color: COLORS.warning }]}>
                  Not a working day
                </Text>
              )}
              {!doctor?.isOnline && (
                <Text style={[styles.statusSubText, { color: COLORS.textLight }]}>
                  Currently offline
                </Text>
              )}
            </View>
          </View>

          {/* ─── FOOTER ────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine v2.0.1</Text>
            <Text style={styles.footerSub}>Today • {todayDay}, {todayDate}</Text>
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
    ...SHADOWS.small,
  },
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtn: {
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

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },

  // ─── Today Banner ──────────────────────────────────────────────────
  todayBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    padding: wp(3.5),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  todayBannerLeft: {
    flex: 1,
  },
  todayBannerDay: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.text,
  },
  todayBannerDate: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
  todayBannerRight: {
    alignItems: 'flex-end',
  },
  todayStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.3),
    borderRadius: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
    gap: wp(1),
  },
  todayStatusActive: {
    backgroundColor: COLORS.success + '15',
  },
  todayStatusDot: {
    width: wp(1.8),
    height: wp(1.8),
    borderRadius: wp(0.9),
    backgroundColor: COLORS.textLight,
  },
  todayStatusDotActive: {
    backgroundColor: COLORS.success,
  },
  todayStatusText: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  todayStatusTextActive: {
    color: COLORS.success,
  },
  todayProgressText: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },

  // ─── Stats Row ─────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(0.8),
  },
  statNumber: {
    fontSize: wp(4.5),
    fontWeight: '700',
  },
  statLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  statDivider: {
    width: 1,
    height: hp(3.5),
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },

  // ─── Progress Bar ──────────────────────────────────────────────────
  progressContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1),
    padding: wp(3.5),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  progressLabel: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercentage: {
    fontSize: wp(3.2),
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBar: {
    height: hp(0.8),
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(0.5),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: wp(0.5),
  },
  progressSubText: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.3),
    textAlign: 'center',
  },
  progressTimeText: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: hp(0.1),
    textAlign: 'center',
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
  iconWrapper: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
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
  todayHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '20',
    gap: wp(1),
  },
  todayHighlightText: {
    fontSize: wp(2.6),
    color: COLORS.success,
    fontWeight: '500',
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
  statusSubText: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
    marginTop: hp(0.5),
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
  footerSub: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
});

export default DoctorScheduleScreen;