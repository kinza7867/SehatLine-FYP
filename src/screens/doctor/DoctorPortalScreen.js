// src/screens/doctor/DoctorPortalScreen.js
// ═══════════════════════════════════════════════════════════════════════════
// SEHATLINE — DOCTOR PORTAL
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

const SCHEDULE_STORAGE_KEY = '@sehatline_doctor_schedule';
const USER_DATA_KEY = '@sehatline_userData';
const APPOINTMENTS_KEY = '@sehatline_appointments';
const QUEUE_KEY = '@sehatline_queue';
const ACTIVITIES_KEY = '@sehatline_activities';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const ADMIN_UPDATES_KEY = '@sehatline_admin_updates';

// ─────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────
const MOCK_DOCTOR = {
  id: 'doc_001',
  name: 'Dr. Ahmed Hassan',
  specialty: 'Interventional Cardiologist',
  department: 'Cardiology Department',
  hospital: 'CDA Hospital Islamabad',
  room: 'Room 07',
  shift: 'Morning Shift',
  avatar: 'AH',
  color: COLORS.primary,
  color2: COLORS.secondary,
  isOnline: true,
  doctorId: 'D-2024-001',
  experience: '12 Years',
  qualifications: 'MBBS, FCPS Cardiology',
};

const MOCK_QUEUE = [
  { 
    id: 'p_001', 
    name: 'Muhammad Usman', 
    age: 45, 
    gender: 'Male', 
    token: 3, 
    priority: 'Urgent', 
    waitTime: '8 min', 
    reason: 'Chest Pain', 
    status: 'waiting', 
    allergies: 'None', 
    previousVisits: 5,
    arrivalTime: '09:15 AM',
    department: 'Cardiology',
  },
  { 
    id: 'p_002', 
    name: 'Saima Ahmed', 
    age: 32, 
    gender: 'Female', 
    token: 4, 
    priority: 'Normal', 
    waitTime: '12 min', 
    reason: 'Fever', 
    status: 'waiting', 
    allergies: 'Penicillin', 
    previousVisits: 2,
    arrivalTime: '09:30 AM',
    department: 'Cardiology',
  },
  { 
    id: 'p_003', 
    name: 'Ali Raza', 
    age: 28, 
    gender: 'Male', 
    token: 5, 
    priority: 'Emergency', 
    waitTime: '5 min', 
    reason: 'Breathing Issue', 
    status: 'waiting', 
    allergies: 'None', 
    previousVisits: 8,
    arrivalTime: '09:45 AM',
    department: 'Cardiology',
  },
  { 
    id: 'p_004', 
    name: 'Fatima Noor', 
    age: 55, 
    gender: 'Female', 
    token: 6, 
    priority: 'Normal', 
    waitTime: '20 min', 
    reason: 'Checkup', 
    status: 'waiting', 
    allergies: 'None', 
    previousVisits: 3,
    arrivalTime: '10:00 AM',
    department: 'Cardiology',
  },
  { 
    id: 'p_005', 
    name: 'Usman Chaudhry', 
    age: 38, 
    gender: 'Male', 
    token: 7, 
    priority: 'Urgent', 
    waitTime: '15 min', 
    reason: 'Diabetes', 
    status: 'waiting', 
    allergies: 'Sulfa', 
    previousVisits: 6,
    arrivalTime: '10:15 AM',
    department: 'Cardiology',
  },
];

const MOCK_APPOINTMENTS = [
  { id: 'a_001', time: '09:00 AM', patient: 'Muhammad Usman', token: 'T-01', type: 'Follow-up', status: 'Completed', department: 'Cardiology' },
  { id: 'a_002', time: '09:30 AM', patient: 'Saima Ahmed', token: 'T-02', type: 'Consultation', status: 'Completed', department: 'Cardiology' },
  { id: 'a_003', time: '10:00 AM', patient: 'Ali Raza', token: 'T-05', type: 'Priority', status: 'Current', department: 'Cardiology' },
  { id: 'a_004', time: '10:30 AM', patient: 'Fatima Noor', token: 'T-06', type: 'General Checkup', status: 'Upcoming', department: 'Cardiology' },
  { id: 'a_005', time: '11:00 AM', patient: 'Usman Chaudhry', token: 'T-07', type: 'Consultation', status: 'Upcoming', department: 'Cardiology' },
  { id: 'a_006', time: '11:30 AM', patient: 'Muhammad Hassan', token: 'T-08', type: 'Follow-up', status: 'Upcoming', department: 'Cardiology' },
  { id: 'a_007', time: '12:00 PM', patient: 'Ayesha Khan', token: 'T-09', type: 'Consultation', status: 'Upcoming', department: 'Cardiology' },
];

const MOCK_ACTIVITIES = [
  { id: '1', action: 'Prescription Created', patient: 'Muhammad Usman', time: '5 min ago', icon: 'document-text-outline', color: COLORS.success },
  { id: '2', action: 'Consultation Completed', patient: 'Saima Ahmed', time: '15 min ago', icon: 'checkmark-circle-outline', color: COLORS.primary },
  { id: '3', action: 'Lab Report Reviewed', patient: 'Ali Raza', time: '25 min ago', icon: 'flask-outline', color: '#9C27B0' },
  { id: '4', action: 'Patient Record Updated', patient: 'Fatima Noor', time: '40 min ago', icon: 'create-outline', color: COLORS.warning },
  { id: '5', action: 'Follow-up Scheduled', patient: 'Usman Chaudhry', time: '1 hr ago', icon: 'calendar-outline', color: COLORS.info },
];

const MOCK_ADMIN_UPDATES = [
  { 
    id: 'n1', 
    title: 'Department Meeting', 
    body: 'Cardiology department meeting today at 2:00 PM in Conference Room B. All doctors must attend.', 
    icon: 'people-circle-outline', 
    time: '1 hr ago',
    priority: 'High',
    category: 'Meeting',
  },
  { 
    id: 'n2', 
    title: 'Equipment Maintenance', 
    body: 'ECG Machine 3 will be under maintenance tomorrow morning from 8:00 AM to 10:00 AM.', 
    icon: 'construct-outline', 
    time: '3 hrs ago',
    priority: 'Medium',
    category: 'Maintenance',
  },
  { 
    id: 'n3', 
    title: 'New Circular', 
    body: 'Updated OPD timing circular issued by hospital administration. New timings effective from Monday.', 
    icon: 'document-attach-outline', 
    time: 'Yesterday',
    priority: 'High',
    category: 'Policy',
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
                  placeholder="Search patients, tokens, records..."
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
                <Text style={styles.searchEmptyText}>No results found</Text>
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

// ─────────────────────────────────────────────────────────────────────────
// APPOINTMENT STATUS CHIP
// ─────────────────────────────────────────────────────────────────────────
const AppointmentStatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'Completed': return COLORS.success;
      case 'Current': return COLORS.primary;
      case 'Upcoming': return COLORS.warning;
      default: return COLORS.textLight;
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'Completed': return COLORS.success + '18';
      case 'Current': return COLORS.primary + '18';
      case 'Upcoming': return COLORS.warning + '18';
      default: return COLORS.border;
    }
  };

  return (
    <View style={[styles.apptStatusChip, { backgroundColor: getBgColor() }]}>
      <Text style={[styles.apptStatusChipText, { color: getColor() }]}>{status}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// OVERVIEW CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────
const OverviewCard = ({ icon, value, label, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.overviewCard, SHADOWS.small]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={[color + '15', color + '08']}
      style={styles.overviewIconWrapper}
    >
      <Ionicons name={icon} size={wp(4.5)} color={color} />
    </LinearGradient>
    <Text style={styles.overviewValue}>{value}</Text>
    <Text style={styles.overviewLabel}>{label}</Text>
  </TouchableOpacity>
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

  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [consultStartTime, setConsultStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [queuePatients, setQueuePatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [adminUpdates, setAdminUpdates] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const timerRef = useRef(null);

  // ── LIFECYCLE ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadAllData();
    animateIn();

    const unsubscribe = navigation.addListener('focus', () => {
      loadAllData();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isConsultationActive && consultStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - consultStartTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsedSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isConsultationActive, consultStartTime]);

  // ── DATA LOADING ──────────────────────────────────────────────────────
  const loadAllData = async () => {
    try {
      await Promise.all([
        loadDoctorData(),
        loadTodaySchedule(),
        loadAppointments(),
        loadQueue(),
        loadActivities(),
        loadCompletedPatients(),
        loadAdminUpdates(),
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

  const loadTodaySchedule = async () => {
    try {
      const raw = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (!raw) {
        setTodaySchedule(null);
        return;
      }
      const parsed = JSON.parse(raw);
      const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
      const entry = parsed.find((d) => d.day === todayName);
      if (entry) {
        setTodaySchedule({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: new Date(entry.endTime),
          breakStart: entry.breakStart ? new Date(entry.breakStart) : null,
          breakEnd: entry.breakEnd ? new Date(entry.breakEnd) : null,
        });
      } else {
        setTodaySchedule(null);
      }
    } catch (e) {
      setTodaySchedule(null);
    }
  };

  const loadAppointments = async () => {
    try {
      const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      if (raw) {
        setAppointments(JSON.parse(raw));
      } else {
        setAppointments(MOCK_APPOINTMENTS);
        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(MOCK_APPOINTMENTS));
      }
    } catch (e) {
      setAppointments(MOCK_APPOINTMENTS);
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

  const loadActivities = async () => {
    try {
      const raw = await AsyncStorage.getItem(ACTIVITIES_KEY);
      if (raw) {
        setActivities(JSON.parse(raw));
      } else {
        setActivities(MOCK_ACTIVITIES);
        await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(MOCK_ACTIVITIES));
      }
    } catch (e) {
      setActivities(MOCK_ACTIVITIES);
    }
  };

  const loadCompletedPatients = async () => {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      if (raw) {
        setCompletedPatients(JSON.parse(raw));
      } else {
        setCompletedPatients([]);
      }
    } catch (e) {
      setCompletedPatients([]);
    }
  };

  const loadAdminUpdates = async () => {
    try {
      const raw = await AsyncStorage.getItem(ADMIN_UPDATES_KEY);
      if (raw) {
        setAdminUpdates(JSON.parse(raw));
      } else {
        setAdminUpdates(MOCK_ADMIN_UPDATES);
        await AsyncStorage.setItem(ADMIN_UPDATES_KEY, JSON.stringify(MOCK_ADMIN_UPDATES));
      }
    } catch (e) {
      setAdminUpdates(MOCK_ADMIN_UPDATES);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  // ── NAVIGATION HELPERS ────────────────────────────────────────────────
  const navigateToScreen = (screenName, params = {}) => {
    // Get the parent navigator (Drawer Navigator) and navigate
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screenName, params);
    } else {
      // Fallback: try direct navigation
      navigation.navigate(screenName, params);
    }
  };

  // ── SEARCH ─────────────────────────────────────────────────────────────
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const items = queuePatients.map((p) => ({
      id: p.id, 
      name: p.name, 
      sub: `Token #${p.token} · ${p.priority} · ${p.reason}`, 
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
    if (item.patient) handleCallNextPatient(item.patient);
  };

  // ── CONSULTATION FLOW ─────────────────────────────────────────────────
  const goToConsultation = (patient) => {
    // Navigate to CallNextPatientScreen using the parent navigator
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('CallNextPatientScreen', {
        patient,
        doctor,
        onComplete: handleCompleteConsultation,
      });
    } else {
      // Fallback: try direct navigation
      navigation.navigate('CallNextPatientScreen', {
        patient,
        doctor,
        onComplete: handleCompleteConsultation,
      });
    }
  };

  const handleCallNextPatient = (patientOverride) => {
    const patient = patientOverride || queuePatients[0];
    if (!patient) {
      Alert.alert('Queue Empty', 'There are no patients waiting in the queue.');
      return;
    }
    if (isConsultationActive) {
      Alert.alert('Consultation Active', 'Please finish the current consultation before calling the next patient.');
      return;
    }
    setCurrentPatient(patient);
    setIsConsultationActive(true);
    setConsultStartTime(Date.now());
    setQueuePatients((prev) => prev.filter((p) => p.id !== patient.id));
    goToConsultation(patient);
  };

  const handleCompleteConsultation = (patientData, consultationData) => {
    const completedPatient = currentPatient || patientData;
    const newCompleted = {
      id: completedPatient.id,
      token: completedPatient.token,
      name: completedPatient.name,
      completedAt: new Date(),
      prescriptionGenerated: !!consultationData?.prescription,
      diagnosis: consultationData?.diagnosis || 'Not Specified',
      followUp: consultationData?.followUp || false,
    };
    
    setCompletedPatients((prev) => [newCompleted, ...prev]);
    
    setActivities((prev) => [
      { 
        id: Date.now().toString(), 
        action: 'Consultation Completed', 
        patient: completedPatient?.name || 'Patient', 
        time: 'Just now', 
        icon: 'checkmark-circle-outline', 
        color: COLORS.primary 
      },
      ...prev,
    ]);
    
    setIsConsultationActive(false);
    setCurrentPatient(null);
    setConsultStartTime(null);

    saveUpdatedData(newCompleted);

    Alert.alert(
      'Consultation Complete', 
      `${completedPatient?.name || 'Patient'}'s consultation has been completed. Queue updated.`,
      [
        {
          text: 'Call Next Patient',
          onPress: () => {
            if (queuePatients.length > 0) handleCallNextPatient(queuePatients[0]);
            else Alert.alert('Queue Empty', 'No more patients in queue.');
          },
        },
        { text: 'Stay on Portal', style: 'cancel' },
      ]
    );
  };

  const saveUpdatedData = async (completedPatient) => {
    try {
      const allCompleted = [completedPatient, ...completedPatients];
      await AsyncStorage.setItem(COMPLETED_PATIENTS_KEY, JSON.stringify(allCompleted));
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queuePatients));
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
      
      const updatedAppointments = appointments.map(appt => {
        if (appt.patient === completedPatient.name && appt.status === 'Current') {
          return { ...appt, status: 'Completed' };
        }
        return appt;
      });
      setAppointments(updatedAppointments);
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
    } catch (error) {
      console.error('Error saving updated data:', error);
    }
  };

  const handleToggleStatus = async () => {
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

  const formatElapsed = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    const d = new Date(date);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const todayDateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // ── Derived values ────────────────────────────────────────────────────
  const totalToday = appointments.length;
  const completedTodayCount = completedPatients.length;
  const remainingCount = queuePatients.length;
  const priorityCount = queuePatients.filter((p) => p.priority?.toLowerCase() !== 'normal').length;
  const avgWaitMinutes = queuePatients.length
    ? Math.round(queuePatients.reduce((sum, p) => sum + parseInt(p.waitTime, 10), 0) / queuePatients.length)
    : 0;
  const currentQueuePosition = currentPatient ? 1 : (queuePatients.length > 0 ? 1 : 0);
  const nextToken = queuePatients[0]?.token ?? currentPatient?.token ?? '—';
  const morningConsultations = completedPatients.filter((p) => {
    const hour = new Date(p.completedAt).getHours();
    return hour >= 8 && hour < 12;
  }).length;
  const afternoonConsultations = completedPatients.filter((p) => {
    const hour = new Date(p.completedAt).getHours();
    return hour >= 12 && hour < 17;
  }).length;
  const pendingAppointments = appointments.filter(a => a.status === 'Upcoming').length;

  // ── Quick Access ──────────────────────────────────────────────────────
  const QUICK_ACCESS = [
    { key: 'prescription', label: 'Prescription', icon: 'medkit-outline', route: 'PrescriptionScreen' },
    { key: 'templates', label: 'Rx Templates', icon: 'albums-outline', route: 'PrescriptionTemplatesScreen' },
    { key: 'reviews', label: 'Reviews', icon: 'star-outline', route: 'DoctorReviewsScreen' },
    { key: 'availability', label: 'Availability', icon: 'time-outline', route: 'DoctorAvailabilityScreen' },
  ];

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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.35 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.openDrawer()}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={wp(5.5)} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.headerTitle}>Doctor Portal</Text>
          </View>

          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => setShowSearchModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={wp(5)} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={COLORS.white} 
              colors={[COLORS.primary]} 
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ═══ DOCTOR INFO CARD ═══════════════════════════════════ */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.doctorCard, SHADOWS.medium]}
              onPress={() => navigateToScreen('DoctorProfileScreen')}
            >
              <View style={styles.doctorCardRow}>
                <LinearGradient 
                  colors={[doctor.color || COLORS.primary, doctor.color2 || COLORS.secondary]} 
                  style={styles.doctorAvatar}
                >
                  {doctor.profileImage ? (
                    <Image source={{ uri: doctor.profileImage }} style={styles.doctorAvatarImage} />
                  ) : (
                    <Text style={styles.doctorAvatarText}>{doctor.avatar || 'DR'}</Text>
                  )}
                </LinearGradient>

                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName} numberOfLines={1}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty} numberOfLines={1}>{doctor.specialty}</Text>
                  <Text style={styles.doctorDept} numberOfLines={1}>{doctor.department} · {doctor.room}</Text>
                  <Text style={styles.doctorHospital} numberOfLines={1}>
                    <Ionicons name="business-outline" size={wp(2.6)} color={COLORS.textLight} /> {doctor.hospital}
                  </Text>
                  <Text style={styles.doctorId} numberOfLines={1}>
                    <Ionicons name="id-card-outline" size={wp(2.4)} color={COLORS.textLight} /> ID: {doctor.doctorId || 'D-2024-001'}
                  </Text>
                </View>

                <View style={styles.doctorCardRight}>
                  <TouchableOpacity
                    style={styles.availabilityToggle}
                    onPress={(e) => { e.stopPropagation(); handleToggleStatus(); }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.availabilityDot, doctor.isOnline && styles.availabilityDotActive]} />
                    <Text style={[styles.availabilityText, doctor.isOnline && styles.availabilityTextActive]}>
                      {doctor.isOnline ? 'Available' : 'Offline'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={(e) => { e.stopPropagation(); navigateToScreen('DoctorProfileScreen'); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.profileBtnText}>Profile</Text>
                    <Ionicons name="chevron-forward" size={wp(3.5)} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>

            {/* ═══ TODAY'S WORK OVERVIEW — 8 cards ══════════════════ */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Today's Work Overview</Text>
              <View style={styles.overviewGrid}>
                <OverviewCard
                  icon="calendar-outline"
                  value={totalToday}
                  label="Total Patients"
                  color={COLORS.primary}
                  onPress={() => navigateToScreen('TodayQueueScreen')}
                />
                <OverviewCard
                  icon="checkmark-done-outline"
                  value={completedTodayCount}
                  label="Completed"
                  color={COLORS.success}
                  onPress={() => navigateToScreen('PatientHistoryScreen')}
                />
                <OverviewCard
                  icon="hourglass-outline"
                  value={remainingCount}
                  label="Remaining"
                  color={COLORS.warning}
                  onPress={() => navigateToScreen('TodayQueueScreen')}
                />
                <OverviewCard
                  icon="alert-circle-outline"
                  value={priorityCount}
                  label="Priority"
                  color={COLORS.danger}
                  onPress={() => navigateToScreen('TodayQueueScreen')}
                />
                <OverviewCard
                  icon="time-outline"
                  value={`${avgWaitMinutes}m`}
                  label="Avg Wait"
                  color="#9C27B0"
                  onPress={() => navigateToScreen('TodayQueueScreen')}
                />
                <OverviewCard
                  icon="list-outline"
                  value={currentQueuePosition}
                  label="Queue Pos"
                  color={COLORS.primary}
                  onPress={() => navigateToScreen('TodayQueueScreen')}
                />
                <OverviewCard
                  icon="pricetag-outline"
                  value={nextToken}
                  label="Next Token"
                  color={COLORS.warning}
                  onPress={() => handleCallNextPatient()}
                />
                <OverviewCard
                  icon="radio-button-on-outline"
                  value={doctor.isOnline ? 'Online' : 'Offline'}
                  label="Status"
                  color={doctor.isOnline ? COLORS.success : COLORS.textLight}
                  onPress={() => navigateToScreen('DoctorAvailabilityScreen')}
                />
              </View>
            </View>

            {/* ═══ CALL NEXT PATIENT — Primary Action ══════════════ */}
            <View style={styles.mainActionWrap}>
              {isConsultationActive && currentPatient ? (
                <View style={[styles.activeConsultCard, SHADOWS.medium]}>
                  <View style={styles.activeConsultTop}>
                    <View style={styles.liveTag}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveTagText}>CONSULTATION IN PROGRESS</Text>
                    </View>
                    <View style={styles.timerChip}>
                      <Ionicons name="time-outline" size={wp(3.4)} color={COLORS.primary} />
                      <Text style={styles.timerChipText}>{formatElapsed(elapsedSeconds)}</Text>
                    </View>
                  </View>
                  <Text style={styles.activeConsultPatient}>{currentPatient.name} · Token #{currentPatient.token}</Text>
                  <Text style={styles.activeConsultSub}>{currentPatient.reason} · {currentPatient.priority} Priority</Text>
                  <TouchableOpacity 
                    style={styles.mainActionBtn} 
                    onPress={() => goToConsultation(currentPatient)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.mainActionGradient}>
                      <Ionicons name="medkit-outline" size={wp(5)} color={COLORS.white} />
                      <Text style={styles.mainActionText}>CONTINUE CONSULTATION</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.mainActionBtn} 
                  onPress={() => handleCallNextPatient()} 
                  activeOpacity={0.85}
                >
                  <LinearGradient 
                    colors={[COLORS.white, COLORS.white]} 
                    style={[styles.mainActionGradient, styles.mainActionLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.mainActionIconWrap}>
                      <Ionicons name="call-outline" size={wp(5.5)} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.mainActionText, styles.mainActionTextDark]}>CALL NEXT PATIENT</Text>
                    {queuePatients.length > 0 && (
                      <View style={styles.mainActionBadge}>
                        <Text style={styles.mainActionBadgeText}>{queuePatients.length}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {!isConsultationActive && queuePatients.length === 0 && (
                <Text style={styles.mainActionHint}>Queue is empty — nothing to call right now.</Text>
              )}
            </View>

            {/* ═══ TODAY'S APPOINTMENTS ═════════════════════════════ */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Today's Appointments</Text>
                <TouchableOpacity onPress={() => navigateToScreen('DoctorScheduleScreen')}>
                  <Text style={styles.sectionLink}>View All →</Text>
                </TouchableOpacity>
              </View>
              {appointments.slice(0, 4).map((appt) => (
                <TouchableOpacity
                  key={appt.id}
                  style={[styles.apptRow, SHADOWS.small]}
                  onPress={() => {
                    if (appt.status === 'Current') {
                      navigateToScreen('ConsultationScreen', { appointment: appt });
                    } else if (appt.status === 'Upcoming') {
                      Alert.alert('Appointment', `${appt.patient} at ${appt.time}`);
                    } else {
                      navigateToScreen('PatientHistoryScreen', { patient: appt });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.apptTimeCol}>
                    <Text style={styles.apptTime}>{appt.time}</Text>
                    <Text style={styles.apptToken}>{appt.token}</Text>
                  </View>
                  <View style={styles.apptInfo}>
                    <Text style={styles.apptPatient}>{appt.patient}</Text>
                    <Text style={styles.apptType}>{appt.type}</Text>
                  </View>
                  <AppointmentStatusChip status={appt.status} />
                </TouchableOpacity>
              ))}
              {appointments.length === 0 && (
                <Text style={styles.emptyText}>No appointments scheduled for today.</Text>
              )}
            </View>

            {/* ═══ LIVE QUEUE ════════════════════════════════════════ */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Live Queue</Text>
                <TouchableOpacity onPress={() => navigateToScreen('TodayQueueScreen')}>
                  <Text style={styles.sectionLink}>Open Queue →</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.queueSummaryCard, SHADOWS.small]}>
                <View style={styles.queueSummaryRow}>
                  <View style={styles.queueSummaryItem}>
                    <Text style={styles.queueSummaryValue}>{currentPatient?.token ?? '—'}</Text>
                    <Text style={styles.queueSummaryLabel}>Current</Text>
                  </View>
                  <View style={styles.queueSummaryDivider} />
                  <View style={styles.queueSummaryItem}>
                    <Text style={styles.queueSummaryValue}>{nextToken}</Text>
                    <Text style={styles.queueSummaryLabel}>Next</Text>
                  </View>
                  <View style={styles.queueSummaryDivider} />
                  <View style={styles.queueSummaryItem}>
                    <Text style={styles.queueSummaryValue}>{queuePatients.length}</Text>
                    <Text style={styles.queueSummaryLabel}>In Queue</Text>
                  </View>
                  <View style={styles.queueSummaryDivider} />
                  <View style={styles.queueSummaryItem}>
                    <Text style={styles.queueSummaryValue}>{priorityCount}</Text>
                    <Text style={styles.queueSummaryLabel}>Priority</Text>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${totalToday ? (completedTodayCount / totalToday) * 100 : 0}%` }]} />
                </View>
                <Text style={styles.progressLabel}>{completedTodayCount} of {totalToday} patients seen today</Text>
              </View>

              {queuePatients.slice(0, 3).map((patient, index) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.queueRow, 
                    index === 0 && styles.queueRowNext, 
                    { borderLeftColor: getPriorityColor(patient.priority) }
                  ]}
                  onPress={() => navigateToScreen('TodayQueueScreen')}
                  activeOpacity={0.7}
                >
                  <View style={styles.queueTokenBadge}>
                    <Text style={styles.queueTokenText}>#{patient.token}</Text>
                  </View>
                  <View style={styles.queueRowInfo}>
                    <Text style={styles.queueRowName}>{patient.name}</Text>
                    <Text style={styles.queueRowMeta}>{patient.reason} · {patient.waitTime}</Text>
                  </View>
                  <View style={[styles.priorityChip, { backgroundColor: getPriorityColor(patient.priority) + '18' }]}>
                    <Text style={[styles.priorityChipText, { color: getPriorityColor(patient.priority) }]}>
                      {patient.priority}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {queuePatients.length === 0 && (
                <Text style={styles.emptyText}>Queue is empty. All patients have been attended to.</Text>
              )}
            </View>

            {/* ═══ DOCTOR SCHEDULE (mini) ═══════════════════════════ */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Doctor Schedule</Text>
                <TouchableOpacity onPress={() => navigateToScreen('DoctorScheduleScreen')}>
                  <Text style={styles.sectionLink}>View Full Schedule →</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.scheduleMiniCard, SHADOWS.small]}>
                {todaySchedule ? (
                  todaySchedule.isWorking ? (
                    <>
                      <View style={styles.scheduleMiniRow}>
                        <Ionicons name="time-outline" size={wp(4)} color={COLORS.primary} />
                        <Text style={styles.scheduleMiniText}>
                          {formatTime(todaySchedule.startTime)} – {formatTime(todaySchedule.endTime)}
                        </Text>
                      </View>
                      {todaySchedule.hasBreak && (
                        <View style={styles.scheduleMiniRow}>
                          <Ionicons name="cafe-outline" size={wp(4)} color={COLORS.warning} />
                          <Text style={styles.scheduleMiniText}>
                            Break: {formatTime(todaySchedule.breakStart)} – {formatTime(todaySchedule.breakEnd)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.scheduleMiniRow}>
                        <Ionicons name="people-outline" size={wp(4)} color={COLORS.textSecondary} />
                        <Text style={styles.scheduleMiniText}>
                          {pendingAppointments} remaining · {completedTodayCount} seen
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.scheduleMiniOff}>Not scheduled to work today.</Text>
                  )
                ) : (
                  <Text style={styles.scheduleMiniOff}>No schedule set yet.</Text>
                )}
              </View>
            </View>

            {/* ═══ PATIENT HISTORY SUMMARY ══════════════════════════ */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Patient History</Text>
                <TouchableOpacity onPress={() => navigateToScreen('PatientHistoryScreen')}>
                  <Text style={styles.sectionLink}>View History →</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.historySummaryCard, SHADOWS.small]}>
                <View style={styles.historySummaryItem}>
                  <Text style={styles.historySummaryValue}>{completedTodayCount}</Text>
                  <Text style={styles.historySummaryLabel}>Today</Text>
                </View>
                <View style={styles.historySummaryDivider} />
                <View style={styles.historySummaryItem}>
                  <Text style={styles.historySummaryValue}>{morningConsultations}</Text>
                  <Text style={styles.historySummaryLabel}>Morning</Text>
                </View>
                <View style={styles.historySummaryDivider} />
                <View style={styles.historySummaryItem}>
                  <Text style={styles.historySummaryValue}>{afternoonConsultations}</Text>
                  <Text style={styles.historySummaryLabel}>Afternoon</Text>
                </View>
              </View>
              {completedPatients.slice(0, 2).map((p, index) => (
                <TouchableOpacity
                  key={p.id + String(p.completedAt)}
                  style={[styles.recentPatientRow, SHADOWS.small]}
                  onPress={() => navigateToScreen('PatientHistoryScreen', { patient: p })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.recentPatientDot, { backgroundColor: index === 0 ? COLORS.success : COLORS.primary }]} />
                  <Text style={styles.recentPatientName}>{p.name}</Text>
                  <Text style={styles.recentPatientTime}>{formatTime(p.completedAt)}</Text>
                </TouchableOpacity>
              ))}
              {completedPatients.length === 0 && (
                <Text style={styles.emptyText}>No patients completed today.</Text>
              )}
            </View>

            {/* ═══ CLINICAL ACTIVITY ════════════════════════════════ */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Clinical Activity</Text>
              {activities.slice(0, 3).map((activity) => (
                <View key={activity.id} style={[styles.activityRow, SHADOWS.small]}>
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
              {activities.length === 0 && (
                <Text style={styles.emptyText}>No clinical activities recorded.</Text>
              )}
            </View>

            {/* ═══ ADMIN UPDATES ════════════════════════════════════ */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Admin Updates</Text>
                <TouchableOpacity onPress={() => navigateToScreen('DoctorNotificationsScreen')}>
                  <Text style={styles.sectionLink}>View All →</Text>
                </TouchableOpacity>
              </View>
              {adminUpdates.slice(0, 2).map((update) => (
                <TouchableOpacity
                  key={update.id}
                  style={[styles.adminRow, SHADOWS.small]}
                  onPress={() => navigateToScreen('DoctorNotificationsScreen')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.adminIcon, { backgroundColor: update.priority === 'High' ? COLORS.danger + '18' : COLORS.primary + '15' }]}>
                    <Ionicons name={update.icon} size={wp(4.2)} color={update.priority === 'High' ? COLORS.danger : COLORS.primary} />
                  </View>
                  <View style={styles.adminContent}>
                    <Text style={styles.adminTitle}>{update.title}</Text>
                    <Text style={styles.adminBody} numberOfLines={1}>{update.body}</Text>
                  </View>
                  <Text style={styles.adminTime}>{update.time}</Text>
                </TouchableOpacity>
              ))}
              {adminUpdates.length === 0 && (
                <Text style={styles.emptyText}>No admin updates available.</Text>
              )}
            </View>

            {/* ═══ QUICK ACCESS ══════════════════════════════════════ */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <View style={styles.quickAccessGrid}>
                {QUICK_ACCESS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.quickAccessCard, SHADOWS.small]}
                    onPress={() => navigateToScreen(item.route)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[COLORS.primary + '12', COLORS.secondary + '12']}
                      style={styles.quickAccessIcon}
                    >
                      <Ionicons name={item.icon} size={wp(5)} color={COLORS.primary} />
                    </LinearGradient>
                    <Text style={styles.quickAccessLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ═══ FOOTER ════════════════════════════════════════════ */}
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>SehatLine</Text>
              <Text style={styles.footerSubtitle}>CDA Hospital Management System</Text>
              <Text style={styles.footerMeta}>{todayDateString}</Text>
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

  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: wp(4), 
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : StatusBar.currentHeight + hp(0.5),
    paddingBottom: hp(1.5),
  },
  iconBtn: {
    width: wp(9.5), 
    height: wp(9.5), 
    borderRadius: wp(2.5), 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.22)',
  },
  headerCenter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(2) 
  },
  headerLogo: { 
    width: wp(7.5), 
    height: wp(7.5), 
    borderRadius: wp(3.75) 
  },
  headerTitle: { 
    fontSize: wp(4.3), 
    fontWeight: '700', 
    color: COLORS.white 
  },

  scrollView: { flex: 1 },
  scrollContent: { 
    paddingBottom: hp(12), 
  },

  doctorCard: {
    backgroundColor: COLORS.white, 
    marginHorizontal: wp(4), 
    borderRadius: wp(3.5), 
    padding: wp(3.6),
    borderWidth: 1, 
    borderColor: COLORS.border,
  },
  doctorCardRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  doctorAvatar: { 
    width: wp(15), 
    height: wp(15), 
    borderRadius: wp(7.5), 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden' 
  },
  doctorAvatarImage: { 
    width: '100%', 
    height: '100%' 
  },
  doctorAvatarText: { 
    color: COLORS.white, 
    fontSize: wp(5), 
    fontWeight: 'bold' 
  },
  doctorInfo: { 
    flex: 1, 
    marginLeft: wp(3) 
  },
  doctorName: { 
    fontSize: wp(4.2), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  doctorSpecialty: { 
    fontSize: wp(3), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.1) 
  },
  doctorDept: { 
    fontSize: wp(2.7), 
    color: COLORS.textLight, 
    marginTop: hp(0.1) 
  },
  doctorHospital: { 
    fontSize: wp(2.5), 
    color: COLORS.textLight, 
    marginTop: hp(0.2) 
  },
  doctorId: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
  doctorCardRight: { 
    alignItems: 'flex-end',
    gap: hp(0.8),
  },
  availabilityToggle: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(1.2),
    backgroundColor: COLORS.backgroundSecondary, 
    paddingHorizontal: wp(2.4), 
    paddingVertical: hp(0.5), 
    borderRadius: wp(3),
  },
  availabilityDot: { 
    width: wp(1.8), 
    height: wp(1.8), 
    borderRadius: wp(1), 
    backgroundColor: COLORS.textLight 
  },
  availabilityDotActive: { 
    backgroundColor: COLORS.success 
  },
  availabilityText: { 
    fontSize: wp(2.4), 
    fontWeight: '600', 
    color: COLORS.textSecondary 
  },
  availabilityTextActive: { 
    color: COLORS.success 
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.5),
    paddingVertical: hp(0.3),
  },
  profileBtnText: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.primary,
  },

  sectionBlock: { 
    paddingHorizontal: wp(4), 
    marginTop: hp(2) 
  },
  sectionHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: hp(0.6) 
  },
  sectionTitle: { 
    fontSize: wp(4), 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: hp(0.4) 
  },
  sectionLink: { 
    fontSize: wp(2.8), 
    fontWeight: '600', 
    color: COLORS.primary 
  },

  overviewGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    gap: wp(2.5),
  },
  overviewCard: {
    width: (width - wp(8) - wp(7.5)) / 4, 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3),
    padding: wp(2.4), 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: hp(9.5),
    justifyContent: 'center',
  },
  overviewIconWrapper: {
    width: wp(7.5), 
    height: wp(7.5), 
    borderRadius: wp(2.2), 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: hp(0.5) 
  },
  overviewValue: { 
    fontSize: wp(3.6), 
    fontWeight: '700', 
    color: COLORS.text,
    textAlign: 'center',
  },
  overviewLabel: { 
    fontSize: wp(2), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.1),
    textAlign: 'center',
  },

  mainActionWrap: { 
    paddingHorizontal: wp(4), 
    marginTop: hp(2) 
  },
  mainActionBtn: { 
    borderRadius: wp(3.5), 
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  mainActionGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: wp(2.5), 
    paddingVertical: hp(1.8),
    position: 'relative',
  },
  mainActionLight: {
    backgroundColor: COLORS.white,
    borderWidth: 0,
  },
  mainActionIconWrap: {
    backgroundColor: COLORS.primary + '15',
    padding: wp(1.5),
    borderRadius: wp(2),
  },
  mainActionText: { 
    color: COLORS.white, 
    fontSize: wp(4.2), 
    fontWeight: '800', 
    letterSpacing: 0.5 
  },
  mainActionTextDark: {
    color: COLORS.primary,
  },
  mainActionBadge: {
    position: 'absolute',
    right: wp(4),
    backgroundColor: COLORS.danger,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    minWidth: wp(4.5),
    alignItems: 'center',
  },
  mainActionBadgeText: {
    color: COLORS.white,
    fontSize: wp(2.5),
    fontWeight: '700',
  },
  mainActionHint: { 
    textAlign: 'center', 
    color: COLORS.textSecondary, 
    fontSize: wp(2.8), 
    marginTop: hp(0.8) 
  },

  activeConsultCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3.5), 
    padding: wp(3.6), 
    borderWidth: 2, 
    borderColor: COLORS.primary + '30' 
  },
  activeConsultTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: hp(0.6) 
  },
  liveTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(1.5) 
  },
  liveDot: { 
    width: wp(1.8), 
    height: wp(1.8), 
    borderRadius: wp(1), 
    backgroundColor: COLORS.primary 
  },
  liveTagText: { 
    fontSize: wp(2.4), 
    fontWeight: '700', 
    color: COLORS.primary, 
    letterSpacing: 0.4 
  },
  timerChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(1), 
    backgroundColor: COLORS.primary + '12', 
    paddingHorizontal: wp(2.2), 
    paddingVertical: hp(0.4), 
    borderRadius: wp(2.5) 
  },
  timerChipText: { 
    fontSize: wp(2.8), 
    fontWeight: '700', 
    color: COLORS.primary, 
    fontVariant: ['tabular-nums'] 
  },
  activeConsultPatient: { 
    fontSize: wp(3.8), 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: hp(0.2) 
  },
  activeConsultSub: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginBottom: hp(1),
  },

  apptRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3),
    padding: wp(2.6), 
    marginBottom: hp(0.7), 
    borderWidth: 1, 
    borderColor: '#EEF2F7',
  },
  apptTimeCol: { 
    width: wp(16) 
  },
  apptTime: { 
    fontSize: wp(2.8), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  apptToken: { 
    fontSize: wp(2.3), 
    color: COLORS.textLight, 
    marginTop: hp(0.1) 
  },
  apptInfo: { 
    flex: 1, 
    paddingHorizontal: wp(2) 
  },
  apptPatient: { 
    fontSize: wp(3.2), 
    fontWeight: '600', 
    color: COLORS.text 
  },
  apptType: { 
    fontSize: wp(2.4), 
    color: COLORS.textSecondary 
  },
  apptStatusChip: {
    paddingHorizontal: wp(2.2),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  apptStatusChipText: {
    fontSize: wp(2.2),
    fontWeight: '700',
  },

  queueSummaryCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3.2), 
    padding: wp(3), 
    marginBottom: hp(0.8), 
    borderWidth: 1, 
    borderColor: '#EEF2F7' 
  },
  queueSummaryRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  queueSummaryItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  queueSummaryValue: { 
    fontSize: wp(4), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  queueSummaryLabel: { 
    fontSize: wp(2.2), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.1) 
  },
  queueSummaryDivider: { 
    width: 1, 
    height: hp(3), 
    backgroundColor: COLORS.border 
  },
  progressTrack: { 
    height: hp(0.8), 
    backgroundColor: COLORS.backgroundSecondary, 
    borderRadius: hp(0.4), 
    marginTop: hp(1), 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: COLORS.success, 
    borderRadius: hp(0.4) 
  },
  progressLabel: { 
    fontSize: wp(2.4), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.6), 
    textAlign: 'center' 
  },

  queueRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(2.5), 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3),
    padding: wp(2.6), 
    marginBottom: hp(0.6), 
    borderLeftWidth: wp(1), 
    borderWidth: 1, 
    borderColor: '#EEF2F7',
  },
  queueRowNext: { 
    borderWidth: 1.5, 
    borderColor: COLORS.primary 
  },
  queueTokenBadge: { 
    width: wp(8), 
    height: wp(8), 
    borderRadius: wp(2), 
    backgroundColor: COLORS.backgroundSecondary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  queueTokenText: { 
    fontSize: wp(2.7), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  queueRowInfo: { 
    flex: 1 
  },
  queueRowName: { 
    fontSize: wp(3.2), 
    fontWeight: '600', 
    color: COLORS.text 
  },
  queueRowMeta: { 
    fontSize: wp(2.4), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.1) 
  },
  priorityChip: { 
    paddingHorizontal: wp(2), 
    paddingVertical: hp(0.2), 
    borderRadius: wp(2.5) 
  },
  priorityChipText: { 
    fontSize: wp(2.2), 
    fontWeight: '700' 
  },

  scheduleMiniCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3.2), 
    padding: wp(3), 
    borderWidth: 1, 
    borderColor: '#EEF2F7', 
    gap: hp(0.6) 
  },
  scheduleMiniRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(2) 
  },
  scheduleMiniText: { 
    fontSize: wp(3), 
    color: COLORS.text, 
    fontWeight: '500' 
  },
  scheduleMiniOff: { 
    fontSize: wp(3), 
    color: COLORS.textLight, 
    fontStyle: 'italic' 
  },

  historySummaryCard: {
    flexDirection: 'row', 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3.2), 
    padding: wp(3),
    borderWidth: 1, 
    borderColor: '#EEF2F7', 
    marginBottom: hp(0.6),
  },
  historySummaryItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  historySummaryValue: { 
    fontSize: wp(4.2), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  historySummaryLabel: { 
    fontSize: wp(2.4), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.2), 
    textAlign: 'center' 
  },
  historySummaryDivider: { 
    width: 1, 
    backgroundColor: COLORS.border 
  },
  recentPatientRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(2), 
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5), 
    padding: wp(2.2), 
    marginBottom: hp(0.4), 
    borderWidth: 1, 
    borderColor: '#EEF2F7',
  },
  recentPatientDot: { 
    width: wp(1.8), 
    height: wp(1.8), 
    borderRadius: wp(1), 
    backgroundColor: COLORS.success 
  },
  recentPatientName: { 
    flex: 1, 
    fontSize: wp(3), 
    fontWeight: '500', 
    color: COLORS.text 
  },
  recentPatientTime: { 
    fontSize: wp(2.4), 
    color: COLORS.textLight 
  },

  activityRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    padding: wp(2.4),
    borderRadius: wp(2.8), 
    marginBottom: hp(0.6), 
    borderWidth: 1, 
    borderColor: '#EEF2F7',
  },
  activityIcon: { 
    width: wp(7), 
    height: wp(7), 
    borderRadius: wp(2), 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: wp(2) 
  },
  activityContent: { 
    flex: 1 
  },
  activityAction: { 
    fontSize: wp(3), 
    fontWeight: '600', 
    color: COLORS.text 
  },
  activityPatient: { 
    fontSize: wp(2.5), 
    color: COLORS.textSecondary 
  },
  activityTime: { 
    fontSize: wp(2.3), 
    color: COLORS.textLight 
  },

  adminRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3),
    padding: wp(2.8), 
    marginBottom: hp(0.6), 
    borderWidth: 1, 
    borderColor: '#EEF2F7', 
    gap: wp(2.5),
  },
  adminIcon: { 
    width: wp(7.5), 
    height: wp(7.5), 
    borderRadius: wp(2), 
    backgroundColor: COLORS.primary + '15', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  adminContent: { 
    flex: 1 
  },
  adminTitle: { 
    fontSize: wp(3), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  adminBody: { 
    fontSize: wp(2.5), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.1) 
  },
  adminTime: { 
    fontSize: wp(2.2), 
    color: COLORS.textLight 
  },

  quickAccessGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: wp(2.5) 
  },
  quickAccessCard: {
    width: (width - wp(8) - wp(7.5)) / 4, 
    backgroundColor: COLORS.white, 
    borderRadius: wp(3),
    paddingVertical: hp(1.4), 
    alignItems: 'center', 
    gap: hp(0.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAccessIcon: { 
    width: wp(9), 
    height: wp(9), 
    borderRadius: wp(2.5), 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  quickAccessLabel: { 
    fontSize: wp(2.2), 
    fontWeight: '600', 
    color: COLORS.text, 
    textAlign: 'center' 
  },

  footer: { 
    alignItems: 'center', 
    paddingHorizontal: wp(4), 
    marginTop: hp(2.5), 
    paddingTop: hp(1.8), 
    paddingBottom: hp(1),
    borderTopWidth: 1, 
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    borderRadius: wp(3),
    ...SHADOWS.small,
  },
  footerTitle: { 
    fontSize: wp(3.5), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  footerSubtitle: { 
    fontSize: wp(2.6), 
    color: COLORS.textSecondary, 
    marginTop: hp(0.2) 
  },
  footerMeta: { 
    fontSize: wp(2.3), 
    color: COLORS.textLight, 
    marginTop: hp(0.4) 
  },

  emptyText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: hp(0.8),
    fontStyle: 'italic',
  },

  searchOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.55)', 
    justifyContent: 'flex-start' 
  },
  searchModal: {
    backgroundColor: COLORS.white, 
    borderBottomLeftRadius: wp(5), 
    borderBottomRightRadius: wp(5),
    paddingHorizontal: wp(4), 
    paddingTop: Platform.OS === 'ios' ? hp(5) : hp(2.5), 
    paddingBottom: hp(2),
    maxHeight: height * 0.82,
  },
  searchInputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: wp(2.5), 
    marginBottom: hp(1) 
  },
  searchInputWrap: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F6FA',
    borderRadius: wp(2.5), 
    paddingHorizontal: wp(2.5), 
    gap: wp(1.5), 
    borderWidth: 1, 
    borderColor: '#EEF2F7',
  },
  searchInput: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: wp(3.2), 
    paddingVertical: Platform.OS === 'ios' ? hp(0.7) : hp(0.4) 
  },
  searchCancel: { 
    color: COLORS.primary, 
    fontSize: wp(3.2), 
    fontWeight: '600' 
  },
  searchResultsList: { 
    maxHeight: height * 0.58 
  },
  searchResultItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: hp(0.8), 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#EEF2F7', 
    gap: wp(3) 
  },
  searchResultIcon: { 
    width: wp(9), 
    height: wp(9), 
    borderRadius: wp(2.25), 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  searchResultContent: { 
    flex: 1 
  },
  searchResultName: { 
    color: COLORS.text, 
    fontSize: wp(3.2), 
    fontWeight: '600' 
  },
  searchResultSub: { 
    color: COLORS.textSecondary, 
    fontSize: wp(2.4) 
  },
  searchEmpty: { 
    alignItems: 'center', 
    paddingVertical: hp(4), 
    gap: hp(0.5) 
  },
  searchEmptyText: { 
    color: COLORS.textSecondary, 
    fontSize: wp(3.5), 
    fontWeight: '600' 
  },
});

export default DoctorPortalScreen;