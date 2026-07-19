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

// ── Helper Functions ─────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'DR';
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

// ── Mock Data ──────────────────────────────────────────────────────────
const MOCK_DOCTOR = {
  id: 'doc_001',
  name: 'Dr. Ahmed Khan',
  specialty: 'Cardiologist',
  department: 'Cardiology Department',
  hospital: 'Capital Hospital CDA',
  room: '12',
  avatar: 'AK',
  color: COLORS.primary,
  color2: COLORS.secondary,
  isOnline: true,
  profileImage: null,
  rating: 4.8,
  totalPatients: 32,
  totalAppointments: 28,
  about1: 'Expert in Interventional Cardiology',
  about2: '15+ Years of Clinical Experience',
};

const MOCK_QUEUE = [
  { id: 'p_001', name: 'Muhammad Ali', token: 17, age: 58, reason: 'Follow Up - Chest Pain', gender: 'Male' },
  { id: 'p_002', name: 'Ahmed Khan', token: 18, age: 45, reason: 'New Patient - Hypertension', gender: 'Male' },
  { id: 'p_003', name: 'Aslam Malik', token: 19, age: 52, reason: 'Follow Up - Post Surgery', gender: 'Male' },
  { id: 'p_004', name: 'Bilal Hussain', token: 20, age: 38, reason: 'New Patient - Palpitations', gender: 'Male' },
  { id: 'p_005', name: 'Zainab Bibi', token: 21, age: 60, reason: 'Follow Up - Diabetes', gender: 'Female' },
];

// ── Performance Stats ─────────────────────────────────────────────────
const PERFORMANCE_STATS = [
  { label: 'Today\'s Patients', value: 32, icon: 'people-outline', color: COLORS.primary },
  { label: 'Patients Waiting', value: 5, icon: 'time-outline', color: COLORS.warning },
  { label: 'Appointments', value: 28, icon: 'calendar-outline', color: COLORS.success },
  { label: 'Patient Rating', value: 4.8, icon: 'star-outline', color: '#FFB800' },
];

// ── Performance Metrics ──────────────────────────────────────────────
const PERFORMANCE_METRICS = [
  { label: 'Consultation Efficiency', value: 85, icon: 'speedometer-outline', color: COLORS.primary },
  { label: 'Patient Satisfaction', value: 92, icon: 'happy-outline', color: COLORS.success },
  { label: 'On-Time Schedule', value: 78, icon: 'alarm-outline', color: COLORS.warning },
  { label: 'Treatment Success', value: 95, icon: 'medal-outline', color: '#9B59B6' },
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
  const [expandedMetric, setExpandedMetric] = useState(null);

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
      const profileImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      let doctorData = { ...MOCK_DOCTOR };
      
      if (userData) {
        const parsed = JSON.parse(userData);
        doctorData = { ...doctorData, ...parsed };
      }
      
      // FORCE set avatar from name
      if (doctorData.name) {
        doctorData.avatar = getInitials(doctorData.name);
      }
      
      // FORCE set specialty
      if (!doctorData.specialty) {
        doctorData.specialty = 'Cardiologist';
      }
      
      // Store profile image but DON'T use it for avatar
      doctorData.profileImage = null; // FORCE null to always show initials
      
      console.log('=== DOCTOR DATA ===');
      console.log('Name:', doctorData.name);
      console.log('Avatar:', doctorData.avatar);
      console.log('Specialty:', doctorData.specialty);
      console.log('===================');
      
      setDoctor(doctorData);
    } catch (e) {
      console.error('Error loading doctor data:', e);
      const fallbackDoctor = { ...MOCK_DOCTOR };
      fallbackDoctor.avatar = getInitials(fallbackDoctor.name);
      fallbackDoctor.profileImage = null;
      setDoctor(fallbackDoctor);
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
        }
      }
    }
  };

  // ─── HANDLERS ──────────────────────────────────────────────────────────
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

  const handleStartSession = async () => {
    setSessionStarted(true);
    await AsyncStorage.setItem(SESSION_STARTED_KEY, 'true');
    setIsCardExpanded(false);
    expandAnim.setValue(0);
    buttonAnim.setValue(0);
  };

  const handleProceedPatient = () => {
    if (queuePatients.length === 0) {
      Alert.alert('Queue Empty', 'No patients waiting.');
      return;
    }
    const patient = queuePatients[0];
    navigation.navigate('CallNextPatientScreen', { patient, doctorData: doctor });
  };

  const toggleMetric = (index) => {
    setExpandedMetric(expandedMetric === index ? null : index);
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
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
      >
        {/* ═══ 1. HEADER - ALWAYS SHOW INITIALS ═══════════════════════ */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigateToScreen('DoctorProfile')} 
            activeOpacity={0.6}
          >
            <LinearGradient 
              colors={[doctor.color || COLORS.primary, doctor.color2 || COLORS.secondary]} 
              style={styles.headerAvatar}
            >
              <Text style={styles.headerAvatarText}>
                {doctor.avatar || 'DR'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../../assets/logoo.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.screenTitle}>
              SEHAT<Text style={styles.brandAccent}>LINE</Text>
            </Text>
            <Text style={styles.tagline}>Doctor Portal</Text>
          </View>

          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigateToScreen('DoctorNotifications')} 
            activeOpacity={0.6}
          >
            <Ionicons name="notifications-outline" size={25} color={COLORS.primary} />
            {unreadNotifications > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
        </Animated.View>

        {/* ═══ 2. DOCTOR INFORMATION CARD ════════════════════════════════ */}
        <Animated.View style={[styles.doctorCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={[COLORS.primary + '06', '#FFFFFF']}
            style={styles.doctorCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.doctorInfoContainer}>
              {/* Doctor Name */}
              <Text style={styles.doctorName}>{doctor.name}</Text>
              
              {/* Doctor Specialty */}
              <View style={styles.specialtyContainer}>
                <Ionicons name="medical-outline" size={16} color={COLORS.primary} />
                <Text style={styles.doctorSpecialty}>{doctor.specialty || 'Cardiologist'}</Text>
              </View>
              
              {/* Doctor About Lines - Replacing Department */}
              <Text style={styles.doctorAbout}>{doctor.about1 || 'Expert in Interventional Cardiology'}</Text>
              <Text style={styles.doctorAbout}>{doctor.about2 || '15+ Years of Clinical Experience'}</Text>
              
              {/* Stats Row */}
              <View style={styles.doctorStatsRow}>
                <View style={styles.doctorStat}>
                  <Text style={styles.doctorStatValue}>{patientsWaiting || 18}</Text>
                  <Text style={styles.doctorStatLabel}>Today's Queue</Text>
                </View>
                <View style={styles.doctorStatDivider} />
                <View style={styles.doctorStat}>
                  <Text style={[styles.doctorStatValue, { color: sessionStarted ? COLORS.success : COLORS.warning }]}>
                    {sessionStarted ? 'Active' : 'Not Started'}
                  </Text>
                  <Text style={styles.doctorStatLabel}>Consultation</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ═══ 3. TODAY'S OVERVIEW ════════════════════════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statStrip}
          >
            {PERFORMANCE_STATS.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { borderTopColor: stat.color, borderTopWidth: 3 }]}>
                <View style={[styles.statIconBox, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>
                  {stat.label === 'Patient Rating' ? stat.value : stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ═══ 4. TODAY'S CONSULTATION ════════════════════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Consultation</Text>
            {sessionStarted && (
              <TouchableOpacity 
                onPress={() => {
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
                        }
                      }
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.resetLink}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {!sessionStarted ? (
            <TouchableOpacity 
              style={[styles.consultationCard, styles.shadow, { backgroundColor: COLORS.primary + '04', borderColor: COLORS.primary + '20', borderWidth: 2 }]}
              onPress={handleCardTap}
              activeOpacity={0.8}
            >
              <Animated.View style={{ height: cardHeight }}>
                <View style={styles.cardContent}>
                  <View style={styles.statusIcon}>
                    <Ionicons name="play-circle-outline" size={wp(6)} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statusLabel}>Session Status</Text>
                  <Text style={[styles.statusValue, { color: COLORS.primary }]}>Not Started</Text>
                  <Text style={styles.statusHint}>Tap to begin today's consultation</Text>
                  
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
                          <Ionicons name="play-circle-outline" size={20} color={COLORS.white} />
                          <Text style={styles.startBtnText}>Start Today's Consultation</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.consultationCardActive, styles.shadow, { backgroundColor: COLORS.success + '04', borderColor: COLORS.success + '30', borderWidth: 2 }]}>
              <View style={styles.sessionHeader}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.sessionHeaderText}>Session Active</Text>
              </View>

              {currentPatient ? (
                <>
                  <Text style={styles.currentToken}>Token #{currentPatient.token}</Text>
                  <Text style={styles.currentName}>{currentPatient.name}</Text>
                  <Text style={styles.currentDetails}>
                    {currentPatient.age} yrs | {currentPatient.gender || 'Male'}
                  </Text>
                  <Text style={styles.currentReason}>{currentPatient.reason}</Text>
                  
                  <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={handleProceedPatient}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.secondary]}
                      style={styles.proceedBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="arrow-forward-outline" size={20} color={COLORS.white} />
                      <Text style={styles.proceedBtnText}>Proceed</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.waitingText}>Waiting for first patient...</Text>
              )}
            </View>
          )}
        </Animated.View>

        {/* ═══ 5. LIVE OPD QUEUE ══════════════════════════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live OPD Queue</Text>
            <TouchableOpacity onPress={() => navigateToScreen('TodayQueue')}>
              <Text style={styles.sectionLink}>View Full Queue →</Text>
            </TouchableOpacity>
          </View>

          {upcomingPatients.length > 0 ? (
            <>
              {upcomingPatients.slice(0, 3).map((patient, index) => (
                <View key={patient.id} style={[
                  styles.queueItem,
                  index % 2 === 0 ? styles.queueItemEven : styles.queueItemOdd,
                  index === 0 && styles.queueItemFirst
                ]}>
                  <View style={styles.queueTokenBox}>
                    <Text style={[styles.queueToken, index === 0 && styles.queueTokenHighlight]}>
                      #{patient.token}
                    </Text>
                    {index === 0 && (
                      <View style={styles.nextIndicator}>
                        <Text style={styles.nextIndicatorText}>NEXT</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.queueInfo}>
                    <Text style={[styles.queueName, index === 0 && styles.queueNameHighlight]}>
                      {patient.name}
                    </Text>
                    <Text style={styles.queueDetails}>
                      {patient.age} yrs | {patient.gender || 'Male'} • {patient.reason}
                    </Text>
                  </View>
                  <View style={styles.queuePosition}>
                    <Text style={styles.queuePositionText}>#{index + 1}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyQueue}>
              <Ionicons name="people-outline" size={wp(7)} color={COLORS.textLight} />
              <Text style={styles.emptyQueueText}>No patients in queue</Text>
            </View>
          )}
        </Animated.View>

        {/* ═══ 6. TODAY'S SCHEDULE ════════════════════════════════════════ */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={[styles.scheduleCard, styles.shadowSmall, { backgroundColor: '#F8FAFE', borderWidth: 2, borderColor: COLORS.primary + '25' }]}>
            <View style={styles.scheduleRow}>
              <Ionicons name="time-outline" size={22} color={COLORS.primary} />
              <View style={styles.scheduleTimeInfo}>
                <Text style={styles.scheduleLabel}>Working Hours</Text>
                <Text style={styles.scheduleValue}>09:00 AM – 01:00 PM</Text>
              </View>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.scheduleRow}>
              <Ionicons name="restaurant-outline" size={22} color={COLORS.primary} />
              <View style={styles.scheduleTimeInfo}>
                <Text style={styles.scheduleLabel}>Break Time</Text>
                <Text style={styles.scheduleValue}>01:00 PM – 02:00 PM</Text>
              </View>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.scheduleRow}>
              <Ionicons name="location-outline" size={22} color={COLORS.primary} />
              <View style={styles.scheduleTimeInfo}>
                <Text style={styles.scheduleLabel}>Consultation Room</Text>
                <Text style={styles.scheduleValue}>Room {doctor?.room || '12'}</Text>
              </View>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.scheduleRow}>
              <Ionicons name="medical-outline" size={22} color={COLORS.primary} />
              <View style={styles.scheduleTimeInfo}>
                <Text style={styles.scheduleLabel}>Department</Text>
                <Text style={styles.scheduleValue}>{doctor?.department || 'Cardiology OPD'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ═══ 7. PERFORMANCE METRICS ════════════════════════════════════ */}
        <Animated.View style={[styles.section, styles.lastSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.performancePeriod}>
              <Text style={styles.performancePeriodText}>This Month</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textLight} />
            </View>
          </View>

          <View style={[styles.performanceCard, { backgroundColor: COLORS.primary + '04' }]}>
            {PERFORMANCE_METRICS.map((metric, index) => (
              <TouchableOpacity
                key={index}
                style={styles.metricItem}
                activeOpacity={0.7}
                onPress={() => toggleMetric(index)}
              >
                <View style={styles.metricHeader}>
                  <View style={styles.metricLeft}>
                    <View style={[styles.metricIconBox, { backgroundColor: metric.color + '15' }]}>
                      <Ionicons name={metric.icon} size={18} color={metric.color} />
                    </View>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </View>
                  <View style={styles.metricRight}>
                    <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}%</Text>
                    <Ionicons 
                      name={expandedMetric === index ? 'chevron-up' : 'chevron-down'} 
                      size={16} 
                      color={COLORS.textLight} 
                    />
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${metric.value}%`, backgroundColor: metric.color }]} />
                </View>
                
                {expandedMetric === index && (
                  <View style={styles.metricDetail}>
                    <View style={styles.metricDetailRow}>
                      <Text style={styles.metricDetailLabel}>Target</Text>
                      <Text style={styles.metricDetailValue}>90%</Text>
                    </View>
                    <View style={styles.metricDetailRow}>
                      <Text style={styles.metricDetailLabel}>Status</Text>
                      <Text style={[
                        styles.metricDetailStatus,
                        metric.value >= 80 ? styles.statusGood : styles.statusNeedsWork
                      ]}>
                        {metric.value >= 80 ? '✅ Good' : '⚠️ Needs Improvement'}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC' },
  scroll: { paddingBottom: 20 },

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

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FC' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 28) + 14,
    paddingBottom: 18,
    backgroundColor: '#F4F7FC',
  },
  iconBtn: {
    width: 30,
    alignItems: 'center',
    paddingTop: 24,
  },
  badge: {
    position: 'absolute',
    top: 20,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: '#F4F7FC',
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
    resizeMode: 'cover',
  },
  headerAvatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  brandWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.6,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  brandAccent: {
    color: COLORS.text,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // ── 2. Doctor Information Card ──────────────────────────────────────
  doctorCard: {
    marginHorizontal: 20,
    marginTop: 4,
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
  doctorInfoContainer: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  doctorAbout: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '400',
    marginBottom: 2,
  },
  doctorStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '04',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  doctorStat: {
    flex: 1,
    alignItems: 'center',
  },
  doctorStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  doctorStatLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 1,
    fontWeight: '500',
  },
  doctorStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  // ── 3. Performance Stats ───────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  lastSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  statStrip: {
    paddingHorizontal: 0,
    gap: 12,
    paddingVertical: 4,
  },
  statCard: {
    width: 100,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 0,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 1,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── 4. Today's Consultation ──────────────────────────────────────
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
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  statusHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },

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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sessionHeaderText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
  },
  currentToken: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  currentName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 2,
  },
  currentDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  currentReason: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
  },

  proceedBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  proceedBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  proceedBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  waitingText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 12,
  },
  resetLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },

  // ── 5. Live OPD Queue ──────────────────────────────────────────────
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  queueItemEven: {
    backgroundColor: COLORS.white,
  },
  queueItemOdd: {
    backgroundColor: '#F8FAFE',
  },
  queueItemFirst: {
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.primary + '04',
  },
  queueTokenBox: {
    minWidth: 55,
    alignItems: 'center',
  },
  queueToken: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  queueTokenHighlight: {
    color: COLORS.primary,
    fontSize: 18,
  },
  queueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queueName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  queueNameHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  queueDetails: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 1,
  },
  queuePosition: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.border + '30',
  },
  queuePositionText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  nextIndicator: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  nextIndicatorText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
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
    fontSize: 14,
    color: COLORS.textLight,
  },

  // ── 6. Today's Schedule ─────────────────────────────────────────────
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
    gap: 14,
  },
  scheduleTimeInfo: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 1,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },

  // ── 7. Performance Metrics ──────────────────────────────────────────
  performancePeriod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  performancePeriodText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  metricItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  metricRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },

  metricDetail: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  metricDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  metricDetailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  metricDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  metricDetailStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusGood: {
    color: COLORS.success,
  },
  statusNeedsWork: {
    color: COLORS.danger,
  },
});

export default DoctorPortalScreen;