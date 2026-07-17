// src/screens/doctor/DoctorPortalScreen.js
// ═══════════════════════════════════════════════════════════════════════════
// SEHATLINE — DOCTOR PORTAL (HomeScreen Design Pattern)
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Image,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ── Storage Keys ──────────────────────────────────────────────────────
const USER_DATA_KEY = '@sehatline_userData';
const QUEUE_KEY = '@sehatline_queue';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const APPOINTMENTS_KEY = '@sehatline_appointments';
const ADMIN_UPDATES_KEY = '@sehatline_admin_updates';

// ── Mock Data ──────────────────────────────────────────────────────────
const MOCK_DOCTOR = {
  id: 'doc_001',
  name: 'Dr. Ahmed Hassan',
  specialty: 'Consultant Cardiologist',
  department: 'Cardiology Department',
  hospital: 'Capital Hospital CDA',
  room: 'Room 12, OPD Block',
  shift: '8:30 AM – 2:30 PM',
  break: '12:30 PM – 1:00 PM',
  avatar: 'AH',
  color: COLORS.primary,
  color2: COLORS.secondary,
  isOnline: true,
  dutyStatus: 'Active',
  patientsPerDay: '45-50',
  experience: '15+ Years',
  education: 'MBBS, FCPS (Cardiology)',
};

const MOCK_QUEUE = [
  { id: 'p_001', name: 'Muhammad Ali', token: 17, age: 58, waitTime: '12 min', reason: 'Follow Up - Chest Pain' },
  { id: 'p_002', name: 'Ahmed Khan', token: 18, age: 45, waitTime: '5 min', reason: 'New Patient - Hypertension' },
  { id: 'p_003', name: 'Aslam Malik', token: 19, age: 52, waitTime: '8 min', reason: 'Follow Up - Post Surgery' },
  { id: 'p_004', name: 'Bilal Hussain', token: 20, age: 38, waitTime: '12 min', reason: 'New Patient - Palpitations' },
  { id: 'p_005', name: 'Zainab Bibi', token: 21, age: 60, waitTime: '15 min', reason: 'Follow Up - Diabetes' },
];

// ─── Admin Notifications Mock Data ────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { 
    id: 'n1', 
    title: 'Department Meeting', 
    body: 'Cardiology department meeting today at 2:00 PM in Conference Room B.', 
    time: '1 hr ago', 
    priority: 'High', 
    type: 'meeting' 
  },
  { 
    id: 'n2', 
    title: 'EMR System Maintenance', 
    body: 'EMR system will be updated tonight from 10:00 PM to 2:00 AM.', 
    time: '3 hrs ago', 
    priority: 'Medium', 
    type: 'system' 
  },
  { 
    id: 'n3', 
    title: 'OPD Schedule Change', 
    body: 'OPD timings for Cardiology have been changed to 8:30 AM - 2:00 PM.', 
    time: '5 hrs ago', 
    priority: 'Medium', 
    type: 'schedule' 
  },
  { 
    id: 'n4', 
    title: 'Duty Roster Update', 
    body: 'Weekend duty roster has been updated. Please check the new schedule.', 
    time: '1 day ago', 
    priority: 'High', 
    type: 'duty' 
  },
  { 
    id: 'n5', 
    title: 'Hospital Circular', 
    body: 'All departments are requested to submit monthly reports by 20th.', 
    time: '2 days ago', 
    priority: 'Normal', 
    type: 'circular' 
  },
];

// ─────────────────────────────────────────────────────────────────────────
// SEARCH MODAL
// ─────────────────────────────────────────────────────────────────────────
const SearchModal = ({ visible, onClose, onSearch, searchQuery, results, onResultPress }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.searchOverlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.searchModal}>
            <View style={styles.searchInputRow}>
              <View style={styles.searchInputWrap}>
                <Ionicons name="search-outline" size={wp(4.5)} color={COLORS.primary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search patients..."
                  placeholderTextColor={COLORS.textLight}
                  value={searchQuery}
                  onChangeText={onSearch}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => onSearch('')}>
                    <Ionicons name="close-circle" size={wp(4.5)} color={COLORS.textLight} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.searchCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {results.length > 0 ? (
              <ScrollView style={styles.searchResultsList} showsVerticalScrollIndicator={false}>
                {results.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.searchResultItem} onPress={() => onResultPress(item)}>
                    <View style={[styles.searchResultIcon, { backgroundColor: COLORS.primary + '15' }]}>
                      <Ionicons name={item.icon} size={wp(4.5)} color={COLORS.primary} />
                    </View>
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultSub}>{item.sub || 'Patient'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={wp(3.5)} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : searchQuery.length > 0 ? (
              <View style={styles.searchEmpty}>
                <Ionicons name="search-outline" size={wp(10)} color={COLORS.textLight} />
                <Text style={styles.searchEmptyText}>No patients found</Text>
              </View>
            ) : (
              <View style={styles.searchEmpty}>
                <Ionicons name="people-outline" size={wp(10)} color={COLORS.textLight} />
                <Text style={styles.searchEmptyText}>Search for patients</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
const DoctorPortalScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [queuePatients, setQueuePatients] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  // ─── CALL BUTTON ANIMATION ──────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);

  // ── LIFECYCLE ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadAllData();
    animateIn();
    startCallButtonAnimation();

    const unsubscribe = navigation.addListener('focus', () => {
      loadAllData();
    });
    return () => {
      unsubscribe();
      stopCallButtonAnimation();
    };
  }, []);

  // ── CALL BUTTON ANIMATION ────────────────────────────────────────────
  const startCallButtonAnimation = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const animate = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isAnimating.current) {
          animate();
        }
      });
    };

    animate();
  };

  const stopCallButtonAnimation = () => {
    isAnimating.current = false;
    scaleAnim.setValue(1);
  };

  // ── DATA LOADING ──────────────────────────────────────────────────────
  const loadAllData = async () => {
    try {
      await Promise.all([
        loadDoctorData(),
        loadQueue(),
        loadCompletedPatients(),
        loadAppointments(),
        loadNotifications(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadDoctorData = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        setDoctor((prev) => ({ ...MOCK_DOCTOR, ...prev, ...parsed }));
      } else {
        setDoctor((prev) => prev || MOCK_DOCTOR);
      }
    } catch (e) {
      setDoctor((prev) => prev || MOCK_DOCTOR);
    }
  };

  const loadQueue = async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (raw) {
        setQueuePatients(JSON.parse(raw));
      } else {
        setQueuePatients(MOCK_QUEUE);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(MOCK_QUEUE));
      }
    } catch (e) {
      setQueuePatients(MOCK_QUEUE);
    }
  };

  const loadCompletedPatients = async () => {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setCompletedCount(data.length);
      } else {
        setCompletedCount(0);
      }
    } catch (e) {
      setCompletedCount(0);
    }
  };

  const loadAppointments = async () => {
    try {
      const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      if (raw) {
        setTotalAppointments(JSON.parse(raw).length);
      } else {
        setTotalAppointments(38);
      }
    } catch (e) {
      setTotalAppointments(38);
    }
  };

  const loadNotifications = async () => {
    try {
      const raw = await AsyncStorage.getItem(ADMIN_UPDATES_KEY);
      if (raw) {
        setNotifications(JSON.parse(raw));
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
        await AsyncStorage.setItem(ADMIN_UPDATES_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
      }
    } catch (e) {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
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

  // ─── SEARCH ─────────────────────────────────────────────────────────────
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const items = queuePatients.map((p) => ({
      id: p.id, 
      name: p.name, 
      sub: `Token #${p.token} · ${p.reason}`, 
      icon: 'person-outline', 
      patient: p,
    }));
    setSearchResults(
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.sub.toLowerCase().includes(query.toLowerCase()) ||
          item.patient.token.toString().includes(query)
      )
    );
  };

  const handleSearchResultPress = (item) => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    if (item.patient) {
      navigateToScreen('PatientHistory', { patient: item.patient });
    }
  };

  // ─── HANDLERS ──────────────────────────────────────────────────────────
  const handleCallNextPatient = () => {
    if (queuePatients.length === 0) {
      Alert.alert('Queue Empty', 'No patients waiting.');
      return;
    }
    const patient = queuePatients[0];
    navigateToScreen('CallNextPatientScreen', { patient, doctorData: doctor });
  };

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

  // ─── NOTIFICATION HELPERS ─────────────────────────────────────────────
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meeting': return 'people-outline';
      case 'schedule': return 'calendar-outline';
      case 'system': return 'construct-outline';
      case 'duty': return 'briefcase-outline';
      case 'circular': return 'document-text-outline';
      default: return 'notifications-outline';
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'High': return COLORS.danger;
      case 'Medium': return COLORS.warning;
      default: return COLORS.primary;
    }
  };

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
        {/* ═══ HEADER: Profile | Logo + Screen Name | Actions ═══════════ */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconBtnLeft} 
            onPress={() => navigateToScreen('DoctorProfile')} 
            activeOpacity={0.6}
          >
            <LinearGradient 
              colors={[doctor.color || COLORS.primary, doctor.color2 || COLORS.secondary]} 
              style={styles.headerAvatar}
            >
              <Text style={styles.headerAvatarText}>{doctor.avatar || 'DR'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.screenTitle}>Doctor Portal</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => setShowSearchModal(true)} activeOpacity={0.6}>
              <Ionicons name="search-outline" size={wp(5)} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => navigateToScreen('DoctorSettings')} activeOpacity={0.6}>
              <Ionicons name="settings-outline" size={wp(5)} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ DOCTOR QUICK STATS CARD (Portal Specific) ════════════════ */}
        <View style={[styles.quickStatsCard, styles.shadow]}>
          <View style={styles.quickStatsHeader}>
            <View>
              <Text style={styles.quickStatsName}>{doctor.name}</Text>
              <Text style={styles.quickStatsSpecialty}>{doctor.specialty}</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.quickStatsStatus, 
                doctor.isOnline && styles.quickStatsStatusOnline
              ]} 
              onPress={handleToggleStatus}
            >
              <View style={[styles.quickStatsStatusDot, doctor.isOnline && styles.quickStatsStatusDotOnline]} />
              <Text style={[styles.quickStatsStatusText, doctor.isOnline && styles.quickStatsStatusTextOnline]}>
                {doctor.isOnline ? 'Available' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatsItem}>
              <View style={[styles.quickStatsIcon, { backgroundColor: COLORS.primary + '10' }]}>
                <Ionicons name="people-outline" size={wp(4)} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.quickStatsValue}>{queuePatients.length}</Text>
                <Text style={styles.quickStatsLabel}>Waiting</Text>
              </View>
            </View>
            <View style={styles.quickStatsItem}>
              <View style={[styles.quickStatsIcon, { backgroundColor: COLORS.success + '10' }]}>
                <Ionicons name="checkmark-done-outline" size={wp(4)} color={COLORS.success} />
              </View>
              <View>
                <Text style={[styles.quickStatsValue, { color: COLORS.success }]}>{completedCount}</Text>
                <Text style={styles.quickStatsLabel}>Completed</Text>
              </View>
            </View>
            <View style={styles.quickStatsItem}>
              <View style={[styles.quickStatsIcon, { backgroundColor: COLORS.warning + '10' }]}>
                <Ionicons name="time-outline" size={wp(4)} color={COLORS.warning} />
              </View>
              <View>
                <Text style={[styles.quickStatsValue, { color: COLORS.warning }]}>{totalAppointments}</Text>
                <Text style={styles.quickStatsLabel}>Appointments</Text>
              </View>
            </View>
            <View style={styles.quickStatsItem}>
              <View style={[styles.quickStatsIcon, { backgroundColor: COLORS.primary + '10' }]}>
                <Ionicons name="hourglass-outline" size={wp(4)} color={COLORS.primary} />
              </View>
              <View>
                <Text style={[styles.quickStatsValue, { color: COLORS.primary }]}>
                  {queuePatients.length > 0 ? queuePatients[0].token : '—'}
                </Text>
                <Text style={styles.quickStatsLabel}>Current Token</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickStatsFooter}>
            <View style={styles.quickStatsBadge}>
              <Ionicons name="calendar-outline" size={wp(2.8)} color={COLORS.primary} />
              <Text style={styles.quickStatsBadgeText}>{doctor.shift}</Text>
            </View>
            <View style={styles.quickStatsBadge}>
              <Ionicons name="business-outline" size={wp(2.8)} color={COLORS.primary} />
              <Text style={styles.quickStatsBadgeText}>{doctor.room}</Text>
            </View>
            <View style={styles.quickStatsBadge}>
              <Ionicons name="people-outline" size={wp(2.8)} color={COLORS.primary} />
              <Text style={styles.quickStatsBadgeText}>{doctor.patientsPerDay} / day</Text>
            </View>
          </View>
        </View>

        {/* ═══ NOW SERVING + CALL BUTTON ════════════════════════════ */}
        <View style={styles.nowServingWrap}>
          <View style={[styles.nowServingCard, styles.shadow]}>
            <Text style={styles.nowServingLabel}>NOW SERVING</Text>

            {queuePatients.length > 0 ? (
              <>
                <Text style={styles.nowServingToken}>Token {queuePatients[0].token}</Text>
                <Text style={styles.nowServingName}>{queuePatients[0].name}</Text>
                <Text style={styles.nowServingReason}>{queuePatients[0].reason}</Text>
                <View style={styles.nowServingMeta}>
                  <View style={styles.nowServingMetaItem}>
                    <Ionicons name="person-outline" size={wp(3)} color={COLORS.textLight} />
                    <Text style={styles.nowServingMetaText}>Age {queuePatients[0].age}</Text>
                  </View>
                  <View style={styles.nowServingMetaDivider} />
                  <View style={styles.nowServingMetaItem}>
                    <Ionicons name="time-outline" size={wp(3)} color={COLORS.textLight} />
                    <Text style={styles.nowServingMetaText}>Waiting {queuePatients[0].waitTime}</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.nowServingEmpty}>No patients waiting</Text>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.callButton, queuePatients.length === 0 && styles.callButtonDisabled, styles.shadow]}
              onPress={handleCallNextPatient}
              disabled={queuePatients.length === 0}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={queuePatients.length === 0 ? ['#E8ECF0', '#E8ECF0'] : [COLORS.primary, COLORS.secondary]}
                style={styles.callButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {queuePatients.length > 0 && (
                  <View style={styles.callPulseContainer}>
                    <View style={styles.callPulse} />
                  </View>
                )}
                <Ionicons name="call-outline" size={wp(5.5)} color={COLORS.white} />
                <Text style={styles.callButtonText}>
                  {queuePatients.length > 0 ? 'CALL NEXT PATIENT' : 'QUEUE EMPTY'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ═══ UPCOMING QUEUE ════════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Queue</Text>
            <TouchableOpacity onPress={() => navigateToScreen('TodayQueue')}>
              <Text style={styles.sectionLink}>View All →</Text>
            </TouchableOpacity>
          </View>

          {queuePatients.slice(1, 5).map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={[styles.queueItem, styles.shadowSmall]}
              onPress={() => navigateToScreen('PatientHistory', { patient })}
              activeOpacity={0.7}
            >
              <View style={[styles.queueTokenBadge]}>
                <Text style={styles.queueToken}>#{patient.token}</Text>
              </View>
              <View style={styles.queueInfo}>
                <Text style={styles.queueName}>{patient.name}</Text>
                <Text style={styles.queueReason}>{patient.reason}</Text>
              </View>
              <Text style={styles.queueWait}>{patient.waitTime}</Text>
            </TouchableOpacity>
          ))}
          {queuePatients.length <= 1 && (
            <View style={[styles.emptyQueue, styles.shadowSmall]}>
              <Ionicons name="people-outline" size={wp(7)} color={COLORS.textLight} />
              <Text style={styles.emptyQueueText}>No upcoming patients</Text>
            </View>
          )}
        </View>

        {/* ═══ TODAY'S SCHEDULE ══════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigateToScreen('DoctorSchedule')}>
              <Text style={styles.sectionLink}>Manage →</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.scheduleCard, styles.shadow]}>
            <View style={styles.scheduleRow}>
              <View style={[styles.scheduleIconWrap]}>
                <Ionicons name="time-outline" size={wp(4.5)} color={COLORS.primary} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>OPD Timing</Text>
                <Text style={styles.scheduleValue}>{doctor.shift}</Text>
              </View>
            </View>

            <View style={styles.scheduleDivider} />

            <View style={styles.scheduleRow}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: COLORS.warning + '10' }]}>
                <Ionicons name="cafe-outline" size={wp(4.5)} color={COLORS.warning} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Break</Text>
                <Text style={styles.scheduleValue}>{doctor.break || '12:30 PM – 1:00 PM'}</Text>
              </View>
            </View>

            <View style={styles.scheduleDivider} />

            <View style={styles.scheduleRow}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: COLORS.success + '10' }]}>
                <Ionicons name="business-outline" size={wp(4.5)} color={COLORS.success} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Location</Text>
                <Text style={styles.scheduleValue}>{doctor.room}</Text>
              </View>
            </View>

            <View style={styles.scheduleStatusRow}>
              <View style={[styles.scheduleStatusBadge, { backgroundColor: doctor.isOnline ? COLORS.success + '10' : COLORS.textLight + '10' }]}>
                <View style={[styles.scheduleStatusDot, { backgroundColor: doctor.isOnline ? COLORS.success : COLORS.textLight }]} />
                <Text style={[styles.scheduleStatusText, { color: doctor.isOnline ? COLORS.success : COLORS.textLight }]}>
                  {doctor.isOnline ? 'Active Duty' : 'Off Duty'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══ ADMIN NOTIFICATIONS ════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Admin Notifications</Text>
            <TouchableOpacity onPress={() => navigateToScreen('AdminNotifications')}>
              <Text style={styles.sectionLink}>View All →</Text>
            </TouchableOpacity>
          </View>

          {notifications.slice(0, 2).map((notification) => {
            const notifColor = getNotificationColor(notification.priority);
            const notifIcon = getNotificationIcon(notification.type);
            
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard, 
                  notification.priority === 'High' && styles.notificationCardHigh,
                  styles.shadowSmall
                ]}
                onPress={() => navigateToScreen('AdminNotifications')}
                activeOpacity={0.7}
              >
                <View style={styles.notificationLeft}>
                  <View style={[styles.notificationIcon, { backgroundColor: notifColor + '10' }]}>
                    <Ionicons name={notifIcon} size={wp(4.5)} color={notifColor} />
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationBody} numberOfLines={1}>{notification.body}</Text>
                  </View>
                </View>
                <View style={styles.notificationRight}>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                  {notification.priority === 'High' && (
                    <View style={[styles.notificationBadge, { backgroundColor: COLORS.danger }]}>
                      <Text style={styles.notificationBadgeText}>Urgent</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          {notifications.length === 0 && (
            <View style={[styles.emptyNotifications, styles.shadowSmall]}>
              <Ionicons name="notifications-outline" size={wp(7)} color={COLORS.textLight} />
              <Text style={styles.emptyNotificationsText}>No admin notifications</Text>
            </View>
          )}
        </View>

        {/* ═══ FOOTER ════════════════════════════════════════════════ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SehatLine v2.0.1</Text>
          <Text style={styles.footerSub}>Doctor Portal • CDA Hospital</Text>
        </View>

      </ScrollView>

      <SearchModal
        visible={showSearchModal}
        onClose={() => { setShowSearchModal(false); setSearchQuery(''); setSearchResults([]); }}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        results={searchResults}
        onResultPress={handleSearchResultPress}
      />
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

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 28) + 10,
    paddingBottom: 12,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginBottom: 2,
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

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  loadingText: { marginTop: hp(1), fontSize: wp(3.5), color: COLORS.textSecondary },

  // ── Quick Stats Card (Portal Specific) ──────────────────────────
  quickStatsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  quickStatsName: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
  },
  quickStatsSpecialty: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  quickStatsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickStatsStatusOnline: {
    backgroundColor: COLORS.success + '08',
    borderColor: COLORS.success + '40',
  },
  quickStatsStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.textLight,
  },
  quickStatsStatusDotOnline: {
    backgroundColor: COLORS.success,
  },
  quickStatsStatusText: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  quickStatsStatusTextOnline: {
    color: COLORS.success,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickStatsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  quickStatsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsValue: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  quickStatsLabel: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  quickStatsFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickStatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '06',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '15',
  },
  quickStatsBadgeText: {
    fontSize: wp(2.4),
    color: COLORS.primary,
    fontWeight: '500',
  },

  // ── Now Serving ──────────────────────────────────────────────
  nowServingWrap: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  nowServingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nowServingLabel: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  nowServingToken: {
    fontSize: wp(5.5),
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  nowServingName: {
    fontSize: wp(4.2),
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 2,
  },
  nowServingReason: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  nowServingMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  nowServingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nowServingMetaDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
  },
  nowServingMetaText: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },
  nowServingEmpty: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 6,
  },

  // ── Call Button ──────────────────────────────────────────────
  callButton: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  callButtonDisabled: {
    opacity: 0.5,
  },
  callButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
    position: 'relative',
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: wp(3.8),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  callPulseContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callPulse: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // ── Section ──────────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionLink: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── Queue Item ──────────────────────────────────────────────
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  queueTokenBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  queueToken: {
    fontSize: wp(2.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  queueInfo: {
    flex: 1,
    marginLeft: 10,
  },
  queueName: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
  },
  queueReason: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  queueWait: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },
  emptyQueue: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
  },
  emptyQueueText: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
  },

  // ── Schedule ─────────────────────────────────────────────────
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scheduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleInfo: {
    marginLeft: 10,
  },
  scheduleLabel: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  scheduleValue: {
    fontSize: wp(3),
    color: COLORS.text,
    fontWeight: '600',
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  scheduleStatusRow: {
    marginTop: 6,
    alignItems: 'center',
  },
  scheduleStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  scheduleStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  scheduleStatusText: {
    fontSize: wp(2.6),
    fontWeight: '600',
  },

  // ── Notifications ────────────────────────────────────────────
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationCardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.text,
  },
  notificationBody: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  notificationRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  notificationTime: {
    fontSize: wp(2),
    color: COLORS.textLight,
  },
  notificationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  notificationBadgeText: {
    fontSize: wp(1.6),
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyNotifications: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
  },
  emptyNotificationsText: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: 16,
    marginTop: 18,
  },
  footerText: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.primary,
  },
  footerSub: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: 2,
  },

  // ── Search Modal ──────────────────────────────────────────────
  searchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.50)',
    justifyContent: 'flex-start',
  },
  searchModal: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 14,
    maxHeight: height * 0.82,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: wp(3),
    paddingVertical: Platform.OS === 'ios' ? 8 : 5,
  },
  searchCancel: {
    color: COLORS.primary,
    fontSize: wp(3),
    fontWeight: '600',
  },
  searchResultsList: {
    maxHeight: height * 0.58,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    color: COLORS.text,
    fontSize: wp(3),
    fontWeight: '600',
  },
  searchResultSub: {
    color: COLORS.textSecondary,
    fontSize: wp(2.2),
  },
  searchEmpty: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 4,
  },
  searchEmptyText: {
    color: COLORS.textSecondary,
    fontSize: wp(3.2),
    fontWeight: '500',
  },
});

export default DoctorPortalScreen;