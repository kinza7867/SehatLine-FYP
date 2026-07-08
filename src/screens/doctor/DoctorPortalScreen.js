// src/screens/doctor/DoctorPortalScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  BackHandler,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const DoctorPortalScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextPatient, setNextPatient] = useState(null);
  const [queueStats, setQueueStats] = useState({
    waiting: 4,
    inConsultation: 1,
    completed: 12,
    total: 17,
    emergency: 1,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const MOCK_DOCTOR = {
    id: 'doc_001',
    name: 'Dr. Ahmed Hassan',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology',
    hospital: 'SehatLine Hospital, Islamabad',
    avatar: 'AH',
    color: '#FF6B6B',
    color2: '#E63946',
    patientsHandled: 2847,
    rating: 4.9,
    experience: '12 years',
    phone: '+92 321 1234567',
    email: 'dr.ahmed@sehatline.com',
  };

  useEffect(() => {
    const getDoctorData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setDoctor({ ...MOCK_DOCTOR, ...parsed });
        } else {
          setDoctor(MOCK_DOCTOR);
        }
      } catch (e) {
        setDoctor(MOCK_DOCTOR);
      }
    };
    
    getDoctorData();
    loadDashboardData();
    animateIn();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackPress();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    Alert.alert(
      'Logout',
      'Do you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: handleLogout 
        }
      ]
    );
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDashboardData = () => {
    const mockQueue = [
      { id: '1', name: 'Muhammad Usman', age: 45, token: 3, priority: 'Normal', status: 'Waiting' },
      { id: '2', name: 'Saima Ahmed', age: 32, token: 2, priority: 'Urgent', status: 'Waiting' },
      { id: '3', name: 'Ali Raza', age: 28, token: 1, priority: 'Emergency', status: 'InConsultation' },
      { id: '4', name: 'Fatima Noor', age: 55, token: 4, priority: 'Normal', status: 'Waiting' },
      { id: '5', name: 'Usman Chaudhry', age: 38, token: 5, priority: 'Urgent', status: 'Waiting' },
    ];

    const current = mockQueue.find(q => q.status === 'InConsultation');
    const next = mockQueue.find(q => q.status === 'Waiting');

    setCurrentPatient(current);
    setNextPatient(next);
    setQueueStats({
      waiting: mockQueue.filter(q => q.status === 'Waiting').length,
      inConsultation: mockQueue.filter(q => q.status === 'InConsultation').length,
      completed: 12,
      total: mockQueue.length + 12,
      emergency: mockQueue.filter(q => q.priority === 'Emergency').length,
    });

    setRecentActivity([
      { id: '1', action: 'Prescription Sent', patient: 'Muhammad Usman', time: '5 mins ago', icon: 'document-text-outline', color: COLORS.success },
      { id: '2', action: 'Consultation Completed', patient: 'Saima Ahmed', time: '15 mins ago', icon: 'checkmark-circle-outline', color: COLORS.primary },
      { id: '3', action: 'Patient Checked In', patient: 'Ali Raza', time: '25 mins ago', icon: 'person-add-outline', color: COLORS.warning },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadDashboardData();
      setRefreshing(false);
    }, 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCallNextPatient = () => {
    if (queueStats.waiting > 0 && nextPatient) {
      navigation.navigate('ConsultationScreen', { 
        patient: nextPatient,
      });
    } else {
      Alert.alert('Queue Empty', 'No patients waiting in the queue.');
    }
  };

  const handleLogout = async () => {
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
  };

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, '#0a2e6b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ─────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuBtn} 
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu-outline" size={wp(5.5)} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerLogo} 
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>SehatLine</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => navigation.navigate('DoctorNotificationsScreen')}
            >
              <Ionicons name="notifications-outline" size={wp(4.5)} color={COLORS.white} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ─── DOCTOR PROFILE ────────────────────────────── */}
          <Animated.View 
            style={[
              styles.doctorHeader,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.doctorHeaderLeft}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[doctor.color || '#FF6B6B', doctor.color2 || '#E63946']}
                  style={styles.doctorAvatar}
                >
                  <Text style={styles.doctorAvatarText}>
                    {doctor.avatar || doctor.name?.split(' ').map(n => n[0]).join('') || 'DR'}
                  </Text>
                </LinearGradient>
                <View style={styles.onlineStatus} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={styles.doctorMeta}>
                  <Ionicons name="business-outline" size={wp(2.5)} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.doctorMetaText}>{doctor.hospital}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* ─── STATS ──────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '18' }]}>
                <Ionicons name="time-outline" size={wp(5)} color={COLORS.warning} />
              </View>
              <View>
                <Text style={styles.statValue}>{queueStats.waiting}</Text>
                <Text style={styles.statTitle}>Waiting</Text>
              </View>
            </View>

            <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '18' }]}>
                <Ionicons name="medical-outline" size={wp(5)} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.statValue}>{queueStats.inConsultation}</Text>
                <Text style={styles.statTitle}>In Consult</Text>
              </View>
            </View>

            <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '18' }]}>
                <Ionicons name="checkmark-done-outline" size={wp(5)} color={COLORS.success} />
              </View>
              <View>
                <Text style={styles.statValue}>{queueStats.completed}</Text>
                <Text style={styles.statTitle}>Completed</Text>
              </View>
            </View>

            <View style={[styles.statCard, { borderLeftColor: COLORS.danger }]}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.danger + '18' }]}>
                <Ionicons name="alert-circle-outline" size={wp(5)} color={COLORS.danger} />
              </View>
              <View>
                <Text style={styles.statValue}>{queueStats.emergency}</Text>
                <Text style={styles.statTitle}>Emergency</Text>
              </View>
            </View>
          </View>

          {/* ─── CALL NEXT PATIENT ──────────────────────────── */}
          <TouchableOpacity
            style={[
              styles.callNextButton,
              queueStats.waiting === 0 && styles.callNextButtonDisabled,
            ]}
            onPress={handleCallNextPatient}
            disabled={queueStats.waiting === 0}
          >
            <LinearGradient
              colors={queueStats.waiting > 0 ? [COLORS.primary, COLORS.secondary] : ['#bdbdbd', '#9e9e9e']}
              style={styles.callNextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="call-outline" size={wp(5.5)} color={COLORS.white} />
              <Text style={styles.callNextText}>
                {queueStats.waiting > 0 ? 'Call Next Patient' : 'No Patients Waiting'}
              </Text>
              {queueStats.waiting > 0 && (
                <View style={styles.callNextBadge}>
                  <Text style={styles.callNextBadgeText}>{queueStats.waiting}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ─── CURRENT & NEXT PATIENT ─────────────────────── */}
          <View style={[styles.patientCard, SHADOWS.medium]}>
            <View style={styles.patientRow}>
              <View style={[styles.patientBox, styles.currentBox]}>
                <Text style={styles.patientLabel}>🟢 Current Patient</Text>
                {currentPatient ? (
                  <>
                    <Text style={styles.patientName}>{currentPatient.name}</Text>
                    <Text style={styles.patientDetail}>Token #{currentPatient.token} • {currentPatient.age} yrs</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: currentPatient.priority === 'Emergency' ? COLORS.danger : currentPatient.priority === 'Urgent' ? COLORS.warning : COLORS.success }]}>
                      <Text style={styles.priorityText}>{currentPatient.priority}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>No patient</Text>
                )}
              </View>

              <View style={[styles.patientBox, styles.nextBox]}>
                <Text style={styles.patientLabel}>⏳ Next Patient</Text>
                {nextPatient ? (
                  <>
                    <Text style={styles.patientName}>{nextPatient.name}</Text>
                    <Text style={styles.patientDetail}>Token #{nextPatient.token} • {nextPatient.age} yrs</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: nextPatient.priority === 'Emergency' ? COLORS.danger : nextPatient.priority === 'Urgent' ? COLORS.warning : COLORS.success }]}>
                      <Text style={styles.priorityText}>{nextPatient.priority}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>No patients</Text>
                )}
              </View>
            </View>

            <View style={styles.progressWrapper}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(queueStats.completed / queueStats.total) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((queueStats.completed / queueStats.total) * 100)}% Today's Progress
              </Text>
            </View>
          </View>

          {/* ─── QUICK ACTIONS ───────────────────────────────── */}
          <View style={styles.quickSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity style={[styles.quickAction, SHADOWS.small]} onPress={() => navigation.navigate('TodayQueueScreen')}>
                <View style={[styles.quickIcon, { backgroundColor: COLORS.primary + '18' }]}>
                  <Ionicons name="people-outline" size={wp(5.5)} color={COLORS.primary} />
                </View>
                <Text style={styles.quickTitle}>Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickAction, SHADOWS.small]} onPress={() => navigation.navigate('ConsultationScreen')}>
                <View style={[styles.quickIcon, { backgroundColor: COLORS.danger + '18' }]}>
                  <Ionicons name="medkit-outline" size={wp(5.5)} color={COLORS.danger} />
                </View>
                <Text style={styles.quickTitle}>Consult</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickAction, SHADOWS.small]} onPress={() => navigation.navigate('PatientHistoryScreen')}>
                <View style={[styles.quickIcon, { backgroundColor: COLORS.success + '18' }]}>
                  <Ionicons name="folder-outline" size={wp(5.5)} color={COLORS.success} />
                </View>
                <Text style={styles.quickTitle}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickAction, SHADOWS.small]} onPress={() => navigation.navigate('DoctorScheduleScreen')}>
                <View style={[styles.quickIcon, { backgroundColor: '#2196F3' + '18' }]}>
                  <Ionicons name="calendar-outline" size={wp(5.5)} color="#2196F3" />
                </View>
                <Text style={styles.quickTitle}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── RECENT ACTIVITY ─────────────────────────────── */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={[styles.activityItem, SHADOWS.small]}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '18' }]}>
                  <Ionicons name={activity.icon} size={wp(4)} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityPatient}>{activity.patient}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>

          {/* ─── LOGOUT ───────────────────────────────────────── */}
          <TouchableOpacity style={[styles.logoutButton, SHADOWS.medium]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={wp(4.5)} color={COLORS.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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

  // ─── HEADER ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(2) : hp(1),
    paddingBottom: hp(0.5),
  },
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  headerLogo: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: wp(2),
    minWidth: wp(3.5),
    height: wp(3.5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  badgeText: {
    fontSize: wp(2),
    fontWeight: 'bold',
    color: COLORS.white,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },

  // ─── DOCTOR PROFILE ─────────────────────────────────────
  doctorHeader: {
    paddingHorizontal: wp(4),
    paddingTop: hp(0.5),
    paddingBottom: hp(0.5),
  },
  doctorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: wp(3.5),
  },
  doctorAvatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  doctorAvatarText: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  doctorInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: wp(3.2),
    color: 'rgba(255,255,255,0.7)',
    marginBottom: hp(0.1),
  },
  doctorName: {
    fontSize: wp(4.8),
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: hp(0.1),
  },
  doctorSpecialty: {
    fontSize: wp(3.2),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: hp(0.1),
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorMetaText: {
    fontSize: wp(2.6),
    color: 'rgba(255,255,255,0.6)',
    marginLeft: wp(1),
  },

  // ─── STATS ──────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(4),
    gap: wp(2),
    marginTop: hp(0.5),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    padding: wp(2.5),
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: (width - wp(12)) / 2,
    ...SHADOWS.small,
  },
  statIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  statValue: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
  },

  // ─── CALL NEXT ──────────────────────────────────────────
  callNextButton: {
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    borderRadius: wp(3),
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  callNextButtonDisabled: {
    opacity: 0.6,
  },
  callNextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.4),
    gap: wp(2),
  },
  callNextText: {
    fontSize: wp(4.2),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  callNextBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.1),
    borderRadius: wp(2.5),
    minWidth: wp(4),
    alignItems: 'center',
  },
  callNextBadgeText: {
    fontSize: wp(2.8),
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // ─── PATIENT CARD ──────────────────────────────────────
  patientCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    borderRadius: wp(3),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patientRow: {
    flexDirection: 'row',
    gap: wp(2.5),
  },
  patientBox: {
    flex: 1,
    padding: wp(2.5),
    borderRadius: wp(2),
    backgroundColor: COLORS.background,
  },
  currentBox: {
    backgroundColor: '#E3F2FD',
  },
  nextBox: {
    backgroundColor: '#F5F5F5',
  },
  patientLabel: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    marginBottom: hp(0.2),
  },
  patientName: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  patientDetail: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.1),
    borderRadius: wp(2),
    marginTop: hp(0.2),
  },
  priorityText: {
    fontSize: wp(2),
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyText: {
    fontSize: wp(3),
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  progressWrapper: {
    marginTop: hp(1),
    paddingTop: hp(0.8),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressBar: {
    height: hp(0.5),
    backgroundColor: COLORS.border,
    borderRadius: hp(0.25),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: hp(0.25),
  },
  progressText: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp(0.1),
  },

  // ─── QUICK ACTIONS ─────────────────────────────────────
  quickSection: {
    paddingHorizontal: wp(4),
    marginTop: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(0.8),
  },
  quickGrid: {
    flexDirection: 'row',
    gap: wp(2.5),
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(1),
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.2),
  },
  quickTitle: {
    fontSize: wp(2.6),
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ─── RECENT ACTIVITY ───────────────────────────────────
  recentSection: {
    paddingHorizontal: wp(4),
    marginTop: hp(1.5),
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: wp(2.5),
    borderRadius: wp(2.5),
    marginBottom: hp(0.6),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIcon: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: wp(3),
    fontWeight: '500',
    color: COLORS.text,
  },
  activityPatient: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },
  activityTime: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
  },

  // ─── LOGOUT ─────────────────────────────────────────────
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(4),
    marginTop: hp(2),
    paddingVertical: hp(1),
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    gap: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.danger,
  },
});

export default DoctorPortalScreen;