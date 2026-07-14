// src/screens/doctor/DoctorPortalScreen.js
// ═══════════════════════════════════════════════════════════════════════════
// SEHATLINE — DOCTOR PORTAL (Working Desk)
// Government CDA Hospital OPD Queue Management System
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
  SafeAreaView,
  Image,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ── Storage Keys ──────────────────────────────────────────────────────
const USER_DATA_KEY = '@sehatline_userData';
const QUEUE_KEY = '@sehatline_queue';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const APPOINTMENTS_KEY = '@sehatline_appointments';
const ACTIVITIES_KEY = '@sehatline_activities';
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
};

const MOCK_QUEUE = [
  { id: 'p_001', name: 'Muhammad Ali', token: 17, age: 58, priority: 'Normal', waitTime: '12 min', reason: 'Follow Up - Chest Pain', department: 'Cardiology' },
  { id: 'p_002', name: 'Ahmed Khan', token: 18, age: 45, priority: 'Normal', waitTime: '5 min', reason: 'New Patient - Hypertension', department: 'Cardiology' },
  { id: 'p_003', name: 'Aslam Malik', token: 19, age: 52, priority: 'Urgent', waitTime: '8 min', reason: 'Follow Up - Post Surgery', department: 'Cardiology' },
  { id: 'p_004', name: 'Bilal Hussain', token: 20, age: 38, priority: 'Normal', waitTime: '12 min', reason: 'New Patient - Palpitations', department: 'Cardiology' },
  { id: 'p_005', name: 'Zainab Bibi', token: 21, age: 60, priority: 'Normal', waitTime: '15 min', reason: 'Follow Up - Diabetes', department: 'Cardiology' },
];

// ── Fixed Work Log Data ──────────────────────────────────────────────
const MOCK_WORK_LOG = [
  { id: '1', type: 'consultation', patient: 'Muhammad Ali', time: '09:15 AM', details: 'Completed - Prescribed' },
  { id: '2', type: 'prescription', patient: 'Saima Ahmed', time: '09:35 AM', details: 'Generated - 3 medicines' },
  { id: '3', type: 'consultation', patient: 'Aslam Malik', time: '10:00 AM', details: 'Completed - Lab ordered' },
  { id: '4', type: 'followup', patient: 'Fatima Noor', time: '10:20 AM', details: 'Scheduled for next week' },
];

// ─── Admin Notifications Mock Data ────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { 
    id: 'n1', 
    title: 'Department Meeting', 
    body: 'Cardiology department meeting today at 2:00 PM in Conference Room B. All doctors must attend.', 
    time: '1 hr ago', 
    priority: 'High', 
    type: 'meeting' 
  },
  { 
    id: 'n2', 
    title: 'EMR System Maintenance', 
    body: 'EMR system will be updated tonight from 10:00 PM to 2:00 AM. Please save all your work.', 
    time: '3 hrs ago', 
    priority: 'Medium', 
    type: 'system' 
  },
  { 
    id: 'n3', 
    title: 'OPD Schedule Change', 
    body: 'OPD timings for Cardiology have been changed to 8:30 AM - 2:00 PM effective from next week.', 
    time: '5 hrs ago', 
    priority: 'Medium', 
    type: 'schedule' 
  },
  { 
    id: 'n4', 
    title: 'Duty Roster Update', 
    body: 'Weekend duty roster has been updated. Please check the new schedule on the portal.', 
    time: '1 day ago', 
    priority: 'High', 
    type: 'duty' 
  },
  { 
    id: 'n5', 
    title: 'Hospital Circular', 
    body: 'All departments are requested to submit monthly reports by 20th of each month.', 
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
          <View style={[styles.searchModal, SHADOWS.large]}>
            <View style={styles.searchInputRow}>
              <View style={styles.searchInputWrap}>
                <Ionicons name="search-outline" size={wp(5)} color={COLORS.textSecondary} />
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
                    <Ionicons name="close-circle" size={wp(5)} color={COLORS.textLight} />
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
                      <Ionicons name={item.icon} size={wp(5)} color={COLORS.primary} />
                    </View>
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultSub}>{item.sub || 'Patient'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={wp(4)} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : searchQuery.length > 0 ? (
              <View style={styles.searchEmpty}>
                <Ionicons name="search-outline" size={wp(12)} color={COLORS.textLight} />
                <Text style={styles.searchEmptyText}>No patients found</Text>
              </View>
            ) : (
              <View style={styles.searchEmpty}>
                <Ionicons name="people-outline" size={wp(12)} color={COLORS.textLight} />
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
  const [workLog, setWorkLog] = useState([]);
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
        loadWorkLog(),
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

  const loadWorkLog = async () => {
    try {
      const raw = await AsyncStorage.getItem(ACTIVITIES_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const sanitizedData = data.map(item => ({
          ...item,
          type: item.type || 'consultation',
          patient: item.patient || 'Unknown',
          time: item.time || 'Just now',
          details: item.details || 'Completed'
        }));
        setWorkLog(sanitizedData);
      } else {
        setWorkLog(MOCK_WORK_LOG);
        await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(MOCK_WORK_LOG));
      }
    } catch (e) {
      setWorkLog(MOCK_WORK_LOG);
    }
  };

  // ─── LOAD ADMIN NOTIFICATIONS ────────────────────────────────────────
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
    const parent = navigation.getParent();
    
    if (parent) {
      parent.navigate(screenName, params);
    } else {
      try {
        navigation.navigate(screenName, params);
      } catch (error) {
        const root = navigation.getRootState();
        if (root && root.routes.length > 0) {
          const drawerRoute = root.routes.find(r => r.name === 'DoctorDrawerNavigator' || r.name === 'DoctorHome');
          if (drawerRoute) {
            navigation.navigate(drawerRoute.name, {
              screen: screenName,
              params: params,
            });
          }
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

  // ── HELPERS ────────────────────────────────────────────────────────────
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'emergency': return COLORS.danger;
      case 'urgent': return COLORS.warning;
      default: return COLORS.success;
    }
  };

  const getWorkLogIcon = (type) => {
    switch (type) {
      case 'consultation': return 'checkmark-circle';
      case 'prescription': return 'medkit';
      case 'followup': return 'calendar';
      default: return 'time';
    }
  };

  const getWorkLogColor = (type) => {
    switch (type) {
      case 'consultation': return COLORS.success;
      case 'prescription': return COLORS.primary;
      case 'followup': return COLORS.warning;
      default: return COLORS.textLight;
    }
  };

  const getWorkLogLabel = (type) => {
    if (!type) return 'Activity';
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'prescription': return 'Prescription';
      case 'followup': return 'Follow-up';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu-outline" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Doctor Portal</Text>
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearchModal(true)}>
            <Ionicons name="search-outline" size={wp(5)} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ═══ SECTION 1: DOCTOR PROFILE CARD ═══════════════════════ */}
            <TouchableOpacity style={[styles.profileCard, SHADOWS.medium]} onPress={() => navigateToScreen('DoctorProfile')} activeOpacity={0.85}>
              <LinearGradient colors={[doctor.color || COLORS.primary, doctor.color2 || COLORS.secondary]} style={styles.profileAvatar}>
                {doctor.profileImage ? (
                  <Image source={{ uri: doctor.profileImage }} style={styles.profileAvatarImage} />
                ) : (
                  <Text style={styles.profileAvatarText}>{doctor.avatar || 'DR'}</Text>
                )}
              </LinearGradient>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{doctor.name}</Text>
                <Text style={styles.profileSpecialty}>{doctor.specialty}</Text>
                <View style={styles.profileMeta}>
                  <Ionicons name="business-outline" size={wp(2.6)} color={COLORS.textLight} />
                  <Text style={styles.profileMetaText}>{doctor.hospital}</Text>
                </View>
                <View style={styles.profileMeta}>
                  <Ionicons name="location-outline" size={wp(2.6)} color={COLORS.textLight} />
                  <Text style={styles.profileMetaText}>{doctor.room}</Text>
                </View>
              </View>

              <View style={styles.profileRight}>
                <TouchableOpacity style={[styles.profileStatus, doctor.isOnline && styles.profileStatusOnline]} onPress={handleToggleStatus}>
                  <View style={[styles.profileStatusDot, doctor.isOnline && styles.profileStatusDotOnline]} />
                  <Text style={[styles.profileStatusText, doctor.isOnline && styles.profileStatusTextOnline]}>
                    {doctor.isOnline ? 'Available' : 'Offline'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* ═══ SECTION 2: STATISTICS CARDS ══════════════════════════ */}
            <View style={styles.statsSection}>
              <View style={styles.statsGrid}>
                <TouchableOpacity style={[styles.statCard, SHADOWS.small]} onPress={() => navigateToScreen('DoctorSchedule')}>
                  <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
                    <Ionicons name="calendar-outline" size={wp(4.5)} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statValue}>{totalAppointments}</Text>
                  <Text style={styles.statLabel}>Appointments</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.statCard, SHADOWS.small]} onPress={() => navigateToScreen('PatientHistory', { filter: 'today' })}>
                  <View style={[styles.statIcon, { backgroundColor: COLORS.success + '15' }]}>
                    <Ionicons name="checkmark-done-outline" size={wp(4.5)} color={COLORS.success} />
                  </View>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>{completedCount}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.statCard, SHADOWS.small]} onPress={() => navigateToScreen('TodayQueue')}>
                  <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
                    <Ionicons name="hourglass-outline" size={wp(4.5)} color={COLORS.warning} />
                  </View>
                  <Text style={[styles.statValue, { color: COLORS.warning }]}>{queuePatients.length}</Text>
                  <Text style={styles.statLabel}>Waiting</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.statCard, SHADOWS.small]} onPress={() => {
                  if (queuePatients.length > 0) navigateToScreen('PatientHistory', { patient: queuePatients[0] });
                }}>
                  <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
                    <Ionicons name="pricetag-outline" size={wp(4.5)} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>{queuePatients.length > 0 ? queuePatients[0].token : '—'}</Text>
                  <Text style={styles.statLabel}>Current Token</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ═══ SECTION 3: NOW SERVING + CALL BUTTON ════════════════ */}
            <View style={styles.workingSection}>
              <View style={[styles.nowServingCard, SHADOWS.medium]}>
                <View style={styles.nowServingHeader}>
                  <Text style={styles.nowServingLabel}>NOW SERVING</Text>
                  {queuePatients.length > 0 && (
                    <View style={[styles.nowServingPriority, { backgroundColor: getPriorityColor(queuePatients[0].priority) + '20' }]}>
                      <Text style={[styles.nowServingPriorityText, { color: getPriorityColor(queuePatients[0].priority) }]}>
                        {queuePatients[0].priority}
                      </Text>
                    </View>
                  )}
                </View>

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

              {/* ─── CALL BUTTON WITH ZOOM ANIMATION ───────────────────── */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.callButton, queuePatients.length === 0 && styles.callButtonDisabled]}
                  onPress={handleCallNextPatient}
                  disabled={queuePatients.length === 0}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={queuePatients.length === 0 ? [COLORS.border, COLORS.border] : [COLORS.primary, COLORS.secondary]}
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

            {/* ═══ SECTION 4: UPCOMING QUEUE ════════════════════════════ */}
            <View style={styles.queueSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Queue</Text>
                <TouchableOpacity onPress={() => navigateToScreen('TodayQueue')}>
                  <Text style={styles.sectionLink}>View All →</Text>
                </TouchableOpacity>
              </View>

              {queuePatients.slice(1, 5).map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.queueItem, SHADOWS.tiny]}
                  onPress={() => navigateToScreen('PatientHistory', { patient })}
                  activeOpacity={0.7}
                >
                  <View style={styles.queueTokenBadge}>
                    <Text style={styles.queueToken}>#{patient.token}</Text>
                  </View>
                  <View style={styles.queueInfo}>
                    <Text style={styles.queueName}>{patient.name}</Text>
                    <Text style={styles.queueReason}>{patient.reason}</Text>
                  </View>
                  <View style={styles.queueRight}>
                    <Text style={styles.queueWait}>{patient.waitTime}</Text>
                    <View style={[styles.queuePriorityDot, { backgroundColor: getPriorityColor(patient.priority) }]} />
                  </View>
                </TouchableOpacity>
              ))}
              {queuePatients.length <= 1 && (
                <View style={styles.emptyQueue}>
                  <Ionicons name="people-outline" size={wp(8)} color={COLORS.textLight} />
                  <Text style={styles.emptyQueueText}>No upcoming patients</Text>
                </View>
              )}
            </View>

            {/* ═══ SECTION 5: TODAY'S SCHEDULE (Doctor Duty Info) ══════ */}
            <View style={styles.scheduleSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Schedule</Text>
                <TouchableOpacity onPress={() => navigateToScreen('DoctorSchedule')}>
                  <Text style={styles.sectionLink}>Manage →</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.scheduleCard, SHADOWS.small]}>
                <View style={styles.scheduleRow}>
                  <View style={styles.scheduleIconWrap}>
                    <Ionicons name="time-outline" size={wp(4.5)} color={COLORS.primary} />
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleLabel}>OPD Timing</Text>
                    <Text style={styles.scheduleValue}>{doctor.shift}</Text>
                  </View>
                </View>

                <View style={styles.scheduleDivider} />

                <View style={styles.scheduleRow}>
                  <View style={[styles.scheduleIconWrap, { backgroundColor: COLORS.warning + '15' }]}>
                    <Ionicons name="cafe-outline" size={wp(4.5)} color={COLORS.warning} />
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleLabel}>Break</Text>
                    <Text style={styles.scheduleValue}>{doctor.break || '12:30 PM – 1:00 PM'}</Text>
                  </View>
                </View>

                <View style={styles.scheduleDivider} />

                <View style={styles.scheduleRow}>
                  <View style={[styles.scheduleIconWrap, { backgroundColor: COLORS.success + '15' }]}>
                    <Ionicons name="business-outline" size={wp(4.5)} color={COLORS.success} />
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleLabel}>Location</Text>
                    <Text style={styles.scheduleValue}>{doctor.room}</Text>
                  </View>
                </View>

                <View style={styles.scheduleDivider} />

                <View style={styles.scheduleRow}>
                  <View style={[styles.scheduleIconWrap, { backgroundColor: COLORS.info + '15' }]}>
                    <Ionicons name="people-outline" size={wp(4.5)} color={COLORS.info} />
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleLabel}>Daily Patients</Text>
                    <Text style={styles.scheduleValue}>{doctor.patientsPerDay || '45-50'}</Text>
                  </View>
                </View>

                <View style={styles.scheduleStatusRow}>
                  <View style={[styles.scheduleStatusBadge, { backgroundColor: doctor.isOnline ? COLORS.success + '15' : COLORS.textLight + '15' }]}>
                    <View style={[styles.scheduleStatusDot, { backgroundColor: doctor.isOnline ? COLORS.success : COLORS.textLight }]} />
                    <Text style={[styles.scheduleStatusText, { color: doctor.isOnline ? COLORS.success : COLORS.textLight }]}>
                      {doctor.isOnline ? 'Active Duty' : 'Off Duty'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ═══ SECTION 6: WORK LOG (Timeline) ═══════════════════════ */}
            <View style={styles.workLogSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Work Log</Text>
                <TouchableOpacity onPress={() => navigateToScreen('TodayHistory', { filter: 'today' })}>
                  <Text style={styles.sectionLink}>View All →</Text>
                </TouchableOpacity>
              </View>

              {workLog.slice(0, 4).map((log, index) => {
                const logType = log.type || 'consultation';
                const logColor = getWorkLogColor(logType);
                const logIcon = getWorkLogIcon(logType);
                const logLabel = getWorkLogLabel(logType);
                
                return (
                  <View key={log.id} style={styles.workLogItem}>
                    <View style={styles.workLogLeft}>
                      <View style={[styles.workLogDot, { backgroundColor: logColor }]} />
                      {index < workLog.slice(0, 4).length - 1 && <View style={styles.workLogLine} />}
                    </View>
                    <View style={[styles.workLogCard, SHADOWS.tiny]}>
                      <View style={styles.workLogHeader}>
                        <View style={[styles.workLogType, { backgroundColor: logColor + '15' }]}>
                          <Ionicons name={logIcon} size={wp(3.5)} color={logColor} />
                          <Text style={[styles.workLogTypeText, { color: logColor }]}>
                            {logLabel}
                          </Text>
                        </View>
                        <Text style={styles.workLogTime}>{log.time || 'Just now'}</Text>
                      </View>
                      <Text style={styles.workLogPatient}>{log.patient || 'Unknown'}</Text>
                      <Text style={styles.workLogDetails}>{log.details || 'Completed'}</Text>
                    </View>
                  </View>
                );
              })}
              {workLog.length === 0 && (
                <View style={styles.emptyWorkLog}>
                  <Ionicons name="time-outline" size={wp(8)} color={COLORS.textLight} />
                  <Text style={styles.emptyWorkLogText}>No work log for today</Text>
                </View>
              )}
            </View>

            {/* ═══ SECTION 7: ADMIN NOTIFICATIONS ═══════════════════════ */}
            <View style={styles.notificationSection}>
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
                      SHADOWS.small, 
                      notification.priority === 'High' && styles.notificationCardHigh
                    ]}
                    onPress={() => navigateToScreen('AdminNotifications')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.notificationLeft}>
                      <View style={[styles.notificationIcon, { backgroundColor: notifColor + '15' }]}>
                        <Ionicons name={notifIcon} size={wp(4)} color={notifColor} />
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
                <View style={styles.emptyNotifications}>
                  <Ionicons name="notifications-outline" size={wp(8)} color={COLORS.textLight} />
                  <Text style={styles.emptyNotificationsText}>No admin notifications</Text>
                </View>
              )}
            </View>

            {/* ═══ FOOTER ════════════════════════════════════════════════ */}
            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Ionicons name="time-outline" size={wp(2.5)} color={COLORS.textLight} />
                <Text style={styles.footerText}>Last Sync: 10:42 AM</Text>
                <View style={styles.footerDot} />
                <View style={[styles.footerStatusDot, { backgroundColor: doctor.isOnline ? COLORS.success : COLORS.textLight }]} />
                <Text style={[styles.footerText, { color: doctor.isOnline ? COLORS.success : COLORS.textLight }]}>
                  {doctor.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
              <Text style={styles.footerVersion}>SehatLine v2.0.1</Text>
            </View>

          </Animated.View>
        </ScrollView>

        <SearchModal
          visible={showSearchModal}
          onClose={() => { setShowSearchModal(false); setSearchQuery(''); setSearchResults([]); }}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          results={searchResults}
          onResultPress={handleSearchResultPress}
        />
      </SafeAreaView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: hp(1), fontSize: wp(3.5), color: COLORS.textSecondary },

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
  menuBtn: { width: wp(9), height: wp(9), justifyContent: 'center', alignItems: 'center' },
  searchBtn: { width: wp(9), height: wp(9), justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  headerLogo: { width: wp(10), height: wp(10), resizeMode: 'contain' },
  headerTitle: { fontSize: wp(4.8), fontWeight: '700', color: COLORS.text },

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: hp(10) },

  // ── SECTION 1: Profile Card ──────────────────────────────────────
  profileCard: {
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
  profileAvatar: { width: wp(15), height: wp(15), borderRadius: wp(7.5), justifyContent: 'center', alignItems: 'center' },
  profileAvatarImage: { width: '100%', height: '100%', borderRadius: wp(7.5) },
  profileAvatarText: { color: COLORS.white, fontSize: wp(5), fontWeight: '700' },
  profileInfo: { flex: 1, marginLeft: wp(3) },
  profileName: { fontSize: wp(4.2), fontWeight: '700', color: COLORS.text },
  profileSpecialty: { fontSize: wp(3), color: COLORS.textSecondary, marginTop: hp(0.1) },
  profileMeta: { flexDirection: 'row', alignItems: 'center', gap: wp(1), marginTop: hp(0.2) },
  profileMetaText: { fontSize: wp(2.6), color: COLORS.textLight },
  profileRight: { alignItems: 'flex-end', gap: hp(0.5) },
  profileStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(2.5), paddingVertical: hp(0.3), borderRadius: wp(3), backgroundColor: COLORS.backgroundSecondary, gap: wp(1.2) },
  profileStatusOnline: { backgroundColor: COLORS.success + '15' },
  profileStatusDot: { width: wp(1.8), height: wp(1.8), borderRadius: wp(0.9), backgroundColor: COLORS.textLight },
  profileStatusDotOnline: { backgroundColor: COLORS.success },
  profileStatusText: { fontSize: wp(2.4), color: COLORS.textSecondary, fontWeight: '500' },
  profileStatusTextOnline: { color: COLORS.success },

  // ── SECTION 2: Statistics ───────────────────────────────────────
  statsSection: { paddingHorizontal: wp(4), marginTop: hp(1.5) },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: wp(2) },
  statCard: {
    width: (width - wp(8) - wp(6)) / 4,
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(2.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: hp(9.5),
    justifyContent: 'center',
  },
  statIcon: { width: wp(7), height: wp(7), borderRadius: wp(2.5), justifyContent: 'center', alignItems: 'center', marginBottom: hp(0.3) },
  statValue: { fontSize: wp(4), fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: wp(2.2), color: COLORS.textSecondary, marginTop: hp(0.1), textAlign: 'center' },

  // ── SECTION 3: Now Serving ──────────────────────────────────────
  workingSection: { paddingHorizontal: wp(4), marginTop: hp(1.5) },
  nowServingCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nowServingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(0.5) },
  nowServingLabel: { fontSize: wp(2.8), color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1.5 },
  nowServingPriority: { paddingHorizontal: wp(2.5), paddingVertical: hp(0.2), borderRadius: wp(2.5) },
  nowServingPriorityText: { fontSize: wp(2.4), fontWeight: '600' },
  nowServingToken: { fontSize: wp(6), fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  nowServingName: { fontSize: wp(4.5), fontWeight: '600', color: COLORS.text, textAlign: 'center', marginTop: hp(0.2) },
  nowServingReason: { fontSize: wp(3.2), color: COLORS.textSecondary, textAlign: 'center', marginTop: hp(0.1) },
  nowServingMeta: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(2), marginTop: hp(0.5) },
  nowServingMetaItem: { flexDirection: 'row', alignItems: 'center', gap: wp(0.8) },
  nowServingMetaDivider: { width: 1, height: hp(2), backgroundColor: COLORS.border },
  nowServingMetaText: { fontSize: wp(2.8), color: COLORS.textSecondary },
  nowServingEmpty: { fontSize: wp(3.5), color: COLORS.textLight, textAlign: 'center', marginTop: hp(0.5) },

  // ── CALL BUTTON ──────────────────────────────────────────────────
  callButton: { marginTop: hp(1.5), borderRadius: wp(3), overflow: 'hidden' },
  callButtonDisabled: { opacity: 0.6 },
  callButtonGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: hp(1.8), 
    gap: wp(2),
    position: 'relative',
  },
  callButtonText: { color: COLORS.white, fontSize: wp(4.2), fontWeight: '700', letterSpacing: 0.5 },
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
    borderRadius: wp(3),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // ── SECTION 4: Upcoming Queue ──────────────────────────────────
  queueSection: { paddingHorizontal: wp(4), marginTop: hp(2) },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(0.8) },
  sectionTitle: { fontSize: wp(4), fontWeight: '700', color: COLORS.text },
  sectionLink: { fontSize: wp(2.8), fontWeight: '600', color: COLORS.primary },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: wp(2.5),
    borderRadius: wp(2.5),
    marginBottom: hp(0.6),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  queueTokenBadge: { width: wp(9), height: wp(9), borderRadius: wp(2.5), backgroundColor: COLORS.backgroundSecondary, justifyContent: 'center', alignItems: 'center' },
  queueToken: { fontSize: wp(3), fontWeight: '700', color: COLORS.text },
  queueInfo: { flex: 1, marginLeft: wp(2.5) },
  queueName: { fontSize: wp(3.2), fontWeight: '600', color: COLORS.text },
  queueReason: { fontSize: wp(2.6), color: COLORS.textSecondary, marginTop: hp(0.1) },
  queueRight: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  queueWait: { fontSize: wp(2.8), color: COLORS.textSecondary },
  queuePriorityDot: { width: wp(2.5), height: wp(2.5), borderRadius: wp(1.25) },
  emptyQueue: { backgroundColor: COLORS.white, padding: wp(3), borderRadius: wp(2.5), borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', gap: hp(0.5) },
  emptyQueueText: { fontSize: wp(3), color: COLORS.textLight },

  // ── SECTION 5: Schedule (Duty Info) ─────────────────────────────
  scheduleSection: { paddingHorizontal: wp(4), marginTop: hp(2) },
  scheduleCard: { backgroundColor: COLORS.white, borderRadius: wp(3), padding: wp(3.5), borderWidth: 1, borderColor: COLORS.border },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(0.5) },
  scheduleIconWrap: { width: wp(9), height: wp(9), borderRadius: wp(2.5), backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  scheduleInfo: { marginLeft: wp(2.5) },
  scheduleLabel: { fontSize: wp(2.4), color: COLORS.textLight, fontWeight: '500' },
  scheduleValue: { fontSize: wp(3.2), color: COLORS.text, fontWeight: '600' },
  scheduleDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: hp(0.5) },
  scheduleStatusRow: { marginTop: hp(0.5), alignItems: 'center' },
  scheduleStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(3), gap: wp(1.5) },
  scheduleStatusDot: { width: wp(2), height: wp(2), borderRadius: wp(1) },
  scheduleStatusText: { fontSize: wp(2.8), fontWeight: '600' },

  // ── SECTION 6: Work Log ──────────────────────────────────────────
  workLogSection: { paddingHorizontal: wp(4), marginTop: hp(2) },
  workLogItem: { flexDirection: 'row', marginBottom: hp(0.5) },
  workLogLeft: { width: wp(5), alignItems: 'center', marginRight: wp(2) },
  workLogDot: { width: wp(3), height: wp(3), borderRadius: wp(1.5), marginTop: hp(0.5) },
  workLogLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: hp(0.3) },
  workLogCard: { flex: 1, backgroundColor: COLORS.white, padding: wp(2.5), borderRadius: wp(2.5), borderWidth: 1, borderColor: COLORS.border },
  workLogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workLogType: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(2), paddingVertical: hp(0.2), borderRadius: wp(2), gap: wp(0.8) },
  workLogTypeText: { fontSize: wp(2.4), fontWeight: '600' },
  workLogTime: { fontSize: wp(2.4), color: COLORS.textLight },
  workLogPatient: { fontSize: wp(3.2), fontWeight: '600', color: COLORS.text, marginTop: hp(0.2) },
  workLogDetails: { fontSize: wp(2.6), color: COLORS.textSecondary, marginTop: hp(0.1) },
  emptyWorkLog: { backgroundColor: COLORS.white, padding: wp(3), borderRadius: wp(2.5), borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', gap: hp(0.5) },
  emptyWorkLogText: { fontSize: wp(3), color: COLORS.textLight },

  // ── SECTION 7: Admin Notifications ──────────────────────────────
  notificationSection: { paddingHorizontal: wp(4), marginTop: hp(2) },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: wp(2.5),
    borderRadius: wp(2.5),
    marginBottom: hp(0.6),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationCardHigh: { 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.danger,
  },
  notificationLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    gap: wp(2) 
  },
  notificationIcon: { 
    width: wp(8), 
    height: wp(8), 
    borderRadius: wp(2.5), 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  notificationInfo: { 
    flex: 1 
  },
  notificationTitle: { 
    fontSize: wp(3), 
    fontWeight: '600', 
    color: COLORS.text 
  },
  notificationBody: { 
    fontSize: wp(2.6), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.1) 
  },
  notificationRight: { 
    alignItems: 'flex-end', 
    gap: hp(0.2) 
  },
  notificationTime: { 
    fontSize: wp(2.2), 
    color: COLORS.textLight 
  },
  notificationBadge: { 
    paddingHorizontal: wp(1.5), 
    paddingVertical: hp(0.1), 
    borderRadius: wp(1.5) 
  },
  notificationBadgeText: { 
    fontSize: wp(1.8), 
    color: COLORS.white, 
    fontWeight: '600' 
  },
  emptyNotifications: { 
    backgroundColor: COLORS.white, 
    padding: wp(3), 
    borderRadius: wp(2.5), 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    alignItems: 'center', 
    gap: hp(0.5) 
  },
  emptyNotificationsText: { 
    fontSize: wp(3), 
    color: COLORS.textLight 
  },

  // ── Footer ────────────────────────────────────────────────────────
  footer: { alignItems: 'center', marginTop: hp(3), paddingTop: hp(1.5), paddingBottom: hp(1), borderTopWidth: 1, borderTopColor: COLORS.border, marginHorizontal: wp(4) },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  footerText: { fontSize: wp(2.6), color: COLORS.textSecondary },
  footerDot: { width: wp(1), height: wp(1), borderRadius: wp(0.5), backgroundColor: COLORS.border },
  footerStatusDot: { width: wp(1.8), height: wp(1.8), borderRadius: wp(0.9) },
  footerVersion: { fontSize: wp(2.2), color: COLORS.textLight, marginTop: hp(0.2) },

  // ── Search Modal ──────────────────────────────────────────────────
  searchOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-start' },
  searchModal: { backgroundColor: COLORS.white, borderBottomLeftRadius: wp(5), borderBottomRightRadius: wp(5), paddingHorizontal: wp(4), paddingTop: Platform.OS === 'ios' ? hp(5) : hp(2.5), paddingBottom: hp(2), maxHeight: height * 0.82 },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2.5), marginBottom: hp(1) },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F6FA', borderRadius: wp(2.5), paddingHorizontal: wp(2.5), gap: wp(1.5), borderWidth: 1, borderColor: '#EEF2F7' },
  searchInput: { flex: 1, color: COLORS.text, fontSize: wp(3.2), paddingVertical: Platform.OS === 'ios' ? hp(0.7) : hp(0.4) },
  searchCancel: { color: COLORS.primary, fontSize: wp(3.2), fontWeight: '600' },
  searchResultsList: { maxHeight: height * 0.58 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(0.8), borderBottomWidth: 0.5, borderBottomColor: '#EEF2F7', gap: wp(3) },
  searchResultIcon: { width: wp(9), height: wp(9), borderRadius: wp(2.25), justifyContent: 'center', alignItems: 'center' },
  searchResultContent: { flex: 1 },
  searchResultName: { color: COLORS.text, fontSize: wp(3.2), fontWeight: '600' },
  searchResultSub: { color: COLORS.textSecondary, fontSize: wp(2.4) },
  searchEmpty: { alignItems: 'center', paddingVertical: hp(4), gap: hp(0.5) },
  searchEmptyText: { color: COLORS.textSecondary, fontSize: wp(3.5), fontWeight: '600' },
});

export default DoctorPortalScreen;