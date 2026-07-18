// src/screens/doctor/DoctorPortalScreen.js
// ═══════════════════════════════════════════════════════════════════════════
// SEHATLINE — DOCTOR PORTAL (State-Based Professional Workspace)
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;

// ── Storage Keys ──────────────────────────────────────────────────────
const USER_DATA_KEY = '@sehatline_userData';
const QUEUE_KEY = '@sehatline_queue';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const APPOINTMENTS_KEY = '@sehatline_appointments';
const SESSION_STARTED_KEY = '@sehatline_session_started';
const PROFILE_IMAGE_KEY = '@sehatline_profile_image';

// ── Mock Data ──────────────────────────────────────────────────────────
const MOCK_DOCTOR = {
  id: 'doc_001',
  name: 'Dr. Ahmed Hassan',
  specialty: 'Consultant Cardiologist',
  department: 'Cardiology Department',
  hospital: 'Capital Hospital CDA',
  room: 'Room 12, OPD Block',
  avatar: 'AH',
  color: COLORS.primary,
  color2: COLORS.secondary,
  isOnline: true,
  profileImage: null,
};

const MOCK_QUEUE = [
  { id: 'p_001', name: 'Muhammad Ali', token: 17, age: 58, reason: 'Follow Up - Chest Pain' },
  { id: 'p_002', name: 'Ahmed Khan', token: 18, age: 45, reason: 'New Patient - Hypertension' },
  { id: 'p_003', name: 'Aslam Malik', token: 19, age: 52, reason: 'Follow Up - Post Surgery' },
  { id: 'p_004', name: 'Bilal Hussain', token: 20, age: 38, reason: 'New Patient - Palpitations' },
  { id: 'p_005', name: 'Zainab Bibi', token: 21, age: 60, reason: 'Follow Up - Diabetes' },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
const DoctorPortalScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [doctor, setDoctor] = useState(null);
  
  const [queuePatients, setQueuePatients] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [patientsWaiting, setPatientsWaiting] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // ── Animations ──────────────────────────────────────────────────────────
  const expandAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  // ── LIFECYCLE ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadAllData();
    animateIn();

    const unsubscribe = navigation.addListener('focus', () => {
      loadAllData();
    });
    return () => unsubscribe();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  // ── DATA LOADING ──────────────────────────────────────────────────────
  const loadAllData = async () => {
    try {
      await Promise.all([
        loadDoctorData(),
        loadQueue(),
        loadCompletedPatients(),
        loadAppointments(),
        loadSessionStatus(),
        loadUnreadNotifications(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadDoctorData = async () => {
    try {
      // Load profile image from persistent storage
      const profileImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        setDoctor({
          ...MOCK_DOCTOR,
          ...parsed,
          profileImage: profileImage || parsed.profileImage || null,
        });
      } else {
        setDoctor({
          ...MOCK_DOCTOR,
          profileImage: profileImage || null,
        });
      }
    } catch (e) {
      setDoctor({ ...MOCK_DOCTOR });
    }
  };

  const loadQueue = async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setQueuePatients(data);
        setPatientsWaiting(data.length);
      } else {
        setQueuePatients(MOCK_QUEUE);
        setPatientsWaiting(MOCK_QUEUE.length);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(MOCK_QUEUE));
      }
    } catch (e) {
      setQueuePatients(MOCK_QUEUE);
      setPatientsWaiting(MOCK_QUEUE.length);
    }
  };

  const loadCompletedPatients = async () => {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setCompletedCount(data.length);
      } else {
        setCompletedCount(12);
      }
    } catch (e) {
      setCompletedCount(12);
    }
  };

  const loadAppointments = async () => {
    try {
      const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      if (raw) {
        setTotalAppointments(JSON.parse(raw).length);
      } else {
        setTotalAppointments(34);
      }
    } catch (e) {
      setTotalAppointments(34);
    }
  };

  const loadSessionStatus = async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_STARTED_KEY);
      setSessionStarted(raw === 'true');
    } catch (e) {
      setSessionStarted(false);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const raw = await AsyncStorage.getItem('@sehatline_notifications');
      if (raw) {
        const data = JSON.parse(raw);
        const unread = data.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      } else {
        setUnreadNotifications(2);
      }
    } catch (e) {
      setUnreadNotifications(2);
    }
  };

  // ─── NAVIGATION HELPERS ──────────────────────────────────────────────
  const navigateToScreen = (screenName, params = {}) => {
    try {
      navigation.navigate(screenName, params);
    } catch (error) {
      const parent = navigation.getParent();
      if (parent) {
        try {
          parent.navigate(screenName, params);
        } catch (e) {
          console.warn('Navigation failed:', e);
          try {
            const drawerParent = navigation.getParent('DoctorDrawer');
            if (drawerParent) {
              drawerParent.navigate(screenName, params);
            }
          } catch (drawerError) {
            console.warn('Drawer navigation failed:', drawerError);
          }
        }
      }
    }
  };

  // ─── HANDLERS ──────────────────────────────────────────────────────────
  
  // ── Card Tap Handler ──────────────────────────────────────────────────
  const handleCardTap = () => {
    if (sessionStarted) return;
    
    const newExpanded = !isCardExpanded;
    setIsCardExpanded(newExpanded);
    
    Animated.spring(expandAnim, {
      toValue: newExpanded ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    
    if (newExpanded) {
      buttonAnim.setValue(0);
      setTimeout(() => {
        Animated.spring(buttonAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 50,
        }).start();
      }, 200);
    }
  };

  // ── Start Session ────────────────────────────────────────────────────
  const handleStartSession = async () => {
    setSessionStarted(true);
    await AsyncStorage.setItem(SESSION_STARTED_KEY, 'true');
    
    setIsCardExpanded(false);
    expandAnim.setValue(0);
    buttonAnim.setValue(0);
  };

  // ── Call Next Patient ────────────────────────────────────────────────
  const handleCallNextPatient = () => {
    if (queuePatients.length === 0) {
      Alert.alert('Queue Empty', 'No patients waiting.');
      return;
    }
    const patient = queuePatients[0];
    navigateToScreen('CallNextPatientScreen', { patient, doctorData: doctor });
  };

  // ── Reset Session (For Testing) ──────────────────────────────────────
  const handleResetSession = async () => {
    Alert.alert(
      'Reset Session',
      'This will reset the consultation session to "Not Started". Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(SESSION_STARTED_KEY);
            setSessionStarted(false);
            setIsCardExpanded(false);
            expandAnim.setValue(0);
            buttonAnim.setValue(0);
            Alert.alert('Success', 'Session has been reset.');
          }
        }
      ]
    );
  };

  // ── Toggle Status ────────────────────────────────────────────────────
  const handleToggleStatus = async () => {
    if (!doctor) return;
    const newStatus = !doctor.isOnline;
    setDoctor((prev) => ({ ...prev, isOnline: newStatus }));
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.isOnline = newStatus;
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadAllData();
      setRefreshing(false);
    }, 1200);
  }, []);

  const currentPatient = queuePatients.length > 0 ? queuePatients[0] : null;
  const upcomingPatients = queuePatients.slice(1, 6);

  // ─── Animation Values ──────────────────────────────────────────────────
  const cardHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [130, 240],
  });

  const buttonOpacity = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Doctor Portal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
      >
        {/* ═══ 1. HEADER ══════════════════════════════════════════════════ */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            style={styles.iconBtnLeft} 
            onPress={() => navigateToScreen('DoctorProfile')} 
            activeOpacity={0.6}
          >
            <LinearGradient 
              colors={[doctor.color || COLORS.primary, doctor.color2 || COLORS.secondary]} 
              style={styles.headerAvatar}
            >
              {doctor.profileImage ? (
                <Image source={{ uri: doctor.profileImage }} style={styles.headerAvatarImage} />
              ) : (
                <Text style={styles.headerAvatarText}>{doctor.avatar || 'DR'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.screenTitle}>Doctor Portal</Text>
          </View>

          <TouchableOpacity 
            style={styles.iconBtnRight} 
            onPress={() => navigateToScreen('DoctorNotifications')} 
            activeOpacity={0.6}
          >
            <Ionicons name="notifications-outline" size={wp(5.5)} color={COLORS.primary} />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ═══ 2. DOCTOR CARD (Premium) ═══════════════════════════════════ */}
        <Animated.View style={[styles.doctorCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#F0F7FF', '#FFFFFF']}
            style={styles.doctorCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.doctorHeader}>
              <View>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <Text style={styles.doctorDepartment}>{doctor.department}</Text>
                <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
                <Text style={styles.doctorRoom}>{doctor.room}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.statusBadge, doctor.isOnline && styles.statusBadgeOnline]} 
                onPress={handleToggleStatus}
              >
                <View style={[styles.statusDot, doctor.isOnline && styles.statusDotOnline]} />
                <Text style={[styles.statusText, doctor.isOnline && styles.statusTextOnline]}>
                  {doctor.isOnline ? 'Available' : 'Offline'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ═══ 3. TODAY'S OVERVIEW ═══════════════════════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={[styles.overviewGrid, styles.shadowSmall]}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{totalAppointments}</Text>
              <Text style={styles.overviewLabel}>Appointments</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{patientsWaiting}</Text>
              <Text style={styles.overviewLabel}>Waiting</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{completedCount}</Text>
              <Text style={styles.overviewLabel}>Completed</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>
                {queuePatients.length > 0 ? `#${queuePatients[0].token}` : '—'}
              </Text>
              <Text style={styles.overviewLabel}>Current Token</Text>
            </View>
          </View>
        </Animated.View>

        {/* ═══ 4. TODAY'S CONSULTATION (State Card) ════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Consultation</Text>
            {sessionStarted && (
              <TouchableOpacity onPress={handleResetSession}>
                <Text style={styles.resetLink}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {!sessionStarted ? (
            // ── STATE 1: Session Not Started ──
            <TouchableOpacity 
              style={[styles.consultationCard, styles.shadow]}
              onPress={handleCardTap}
              activeOpacity={0.8}
            >
              <Animated.View style={{ height: cardHeight }}>
                <View style={styles.cardContent}>
                  <View style={styles.statusIcon}>
                    <Ionicons name="time-outline" size={wp(5)} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statusLabel}>Session Status</Text>
                  <Text style={[styles.statusValue, { color: COLORS.primary }]}>Not Started</Text>
                  <Text style={styles.statusHint}>Tap to begin today's consultation</Text>
                  
                  {/* ── Start Button (Only visible when expanded) ── */}
                  {isCardExpanded && (
                    <Animated.View 
                      style={[
                        styles.buttonContainer,
                        {
                          opacity: buttonOpacity,
                          transform: [{ translateY: buttonTranslateY }],
                        }
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={handleStartSession}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={[COLORS.primary, COLORS.secondary]}
                          style={styles.startBtnGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Ionicons name="play-circle-outline" size={wp(4)} color={COLORS.white} />
                          <Text style={styles.startBtnText}>Start Today's Consultation</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>
          ) : (
            // ── STATE 2: Session Active ──
            <View style={[styles.consultationCardActive, styles.shadow]}>
              <View style={styles.sessionHeader}>
                <Ionicons name="checkmark-circle" size={wp(3.5)} color={COLORS.success} />
                <Text style={styles.sessionHeaderText}>Session Active</Text>
              </View>

              {currentPatient ? (
                <>
                  <Text style={styles.currentToken}>Token #{currentPatient.token}</Text>
                  <Text style={styles.currentName}>{currentPatient.name}</Text>
                  <Text style={styles.currentReason}>{currentPatient.reason}</Text>
                  
                  <TouchableOpacity
                    style={styles.callNextBtn}
                    onPress={handleCallNextPatient}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.secondary]}
                      style={styles.callNextBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="call-outline" size={wp(4)} color={COLORS.white} />
                      <Text style={styles.callNextBtnText}>Call Next Patient</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.waitingText}>Waiting for first patient...</Text>
              )}
            </View>
          )}
        </Animated.View>

        {/* ═══ 5. LIVE OPD QUEUE ═══════════════════════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live OPD Queue</Text>
            <TouchableOpacity onPress={() => navigateToScreen('TodayQueue')}>
              <Text style={styles.sectionLink}>View All →</Text>
            </TouchableOpacity>
          </View>

          {upcomingPatients.length > 0 ? (
            upcomingPatients.map((patient) => (
              <View key={patient.id} style={styles.queueItem}>
                <View style={styles.queueTokenBox}>
                  <Text style={styles.queueToken}>Token {patient.token}</Text>
                </View>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueName}>{patient.name}</Text>
                  <Text style={styles.queueStatus}>Waiting</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyQueue}>
              <Ionicons name="people-outline" size={wp(7)} color={COLORS.textLight} />
              <Text style={styles.emptyQueueText}>No patients in queue</Text>
            </View>
          )}
        </Animated.View>

        {/* ═══ 6. TODAY'S SCHEDULE ════════════════════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={[styles.scheduleCard, styles.shadowSmall]}>
            <View style={styles.scheduleRow}>
              <Ionicons name="time-outline" size={wp(4.5)} color={COLORS.primary} />
              <Text style={styles.scheduleTime}>08:30 AM - 02:30 PM</Text>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.scheduleRow}>
              <Ionicons name="location-outline" size={wp(4.5)} color={COLORS.primary} />
              <Text style={styles.scheduleLocation}>Room 12, OPD Block</Text>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={[styles.scheduleRow, styles.scheduleDutyRow]}>
              <View style={[styles.dutyBadge, { backgroundColor: COLORS.success + '15' }]}>
                <View style={[styles.dutyDot, { backgroundColor: COLORS.success }]} />
                <Text style={[styles.dutyText, { color: COLORS.success }]}>Active Duty</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingBottom: 20 },

  // ── Shadows ──────────────────────────────────────────────────────
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shadowSmall: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // ── Loading ──────────────────────────────────────────────────
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  loadingText: { marginTop: 12, fontSize: wp(3.5), color: COLORS.textSecondary },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 28) + 14,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBtnLeft: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnRight: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerAvatarText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '700',
  },
  brandWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.6,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  screenTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: wp(1.8),
    fontWeight: '700',
  },

  // ── 2. Doctor Card (Premium) ──────────────────────────────────────
  doctorCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  doctorCardGradient: {
    padding: 20,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorName: {
    fontSize: wp(4.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  doctorSpecialty: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  doctorDepartment: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  doctorHospital: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: 1,
  },
  doctorRoom: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBadgeOnline: {
    backgroundColor: COLORS.success + '08',
    borderColor: COLORS.success + '40',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.textLight,
  },
  statusDotOnline: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusTextOnline: {
    color: COLORS.success,
  },

  // ── 3. Today's Overview ──────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.primary,
  },
  resetLink: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.danger,
  },

  overviewGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: wp(4.2),
    fontWeight: '800',
    color: COLORS.text,
  },
  overviewLabel: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  overviewDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },

  // ── 4. Today's Consultation (State Card) ──────────────────────
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  consultationCardActive: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: wp(4.2),
    fontWeight: '700',
    marginTop: 2,
  },
  statusHint: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: 8,
  },

  // ── Button Container (Animated) ──────────────────────────────────
  buttonContainer: {
    width: '100%',
    marginTop: 12,
  },
  startBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: wp(3.6),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Session Active ──────────────────────────────────────────────
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sessionHeaderText: {
    fontSize: wp(3),
    color: COLORS.success,
    fontWeight: '600',
  },
  currentToken: {
    fontSize: wp(5.5),
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  currentName: {
    fontSize: wp(4.2),
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 2,
  },
  currentReason: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  callNextBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  callNextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  callNextBtnText: {
    color: COLORS.white,
    fontSize: wp(3.6),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  waitingText: {
    fontSize: wp(3.4),
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 12,
  },

  // ── 5. Live OPD Queue ────────────────────────────────────────────
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  queueTokenBox: {
    minWidth: 72,
  },
  queueToken: {
    fontSize: wp(3.2),
    fontWeight: '700',
    color: COLORS.primary,
  },
  queueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queueName: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  queueStatus: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: 1,
  },
  emptyQueue: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 6,
  },
  emptyQueueText: {
    fontSize: wp(3),
    color: COLORS.textLight,
  },

  // ── 6. Today's Schedule ──────────────────────────────────────────
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  scheduleTime: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  scheduleLocation: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  scheduleDutyRow: {
    justifyContent: 'center',
    marginTop: 2,
  },
  dutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dutyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dutyText: {
    fontSize: wp(2.6),
    fontWeight: '600',
  },

  // ── Spacer ──────────────────────────────────────────────────────
  spacer: {
    height: 20,
  },
});

export default DoctorPortalScreen;