// src/screens/doctor/DoctorPortalScreen.js
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

// ─── SEARCH MODAL COMPONENT ──────────────────────────────────────────────────
const SearchModal = ({ visible, onClose, onSearch, searchQuery, setSearchQuery, results, onResultPress }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
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
                  onChangeText={setSearchQuery}
                  onSubmitEditing={() => onSearch(searchQuery)}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
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
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.searchResultItem} 
                    onPress={() => onResultPress(item)}
                  >
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

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

const DoctorPortalScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextPatient, setNextPatient] = useState(null);
  const [queuePatients, setQueuePatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [stats, setStats] = useState({
    currentToken: '--',
    nextPatient: '--',
    waiting: 0,
    todayAppointments: 15,
    completed: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // ─── MOCK DATA ──────────────────────────────────────────────────────────────
  const MOCK_DOCTOR = {
    id: 'doc_001',
    name: 'Dr. Ahmed Hassan',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology Department',
    hospital: 'SehatLine Hospital Islamabad',
    avatar: 'AH',
    color: COLORS.primary,
    color2: COLORS.secondary,
    isOnline: true,
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
      bloodGroup: 'A+',
      medicalHistory: 'Hypertension, Diabetes',
      allergies: 'None',
      previousVisits: 5,
      medications: 'Metformin 500mg',
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
      bloodGroup: 'B+',
      medicalHistory: 'None',
      allergies: 'Penicillin',
      previousVisits: 2,
      medications: 'None',
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
      bloodGroup: 'O-',
      medicalHistory: 'Asthma',
      allergies: 'None',
      previousVisits: 8,
      medications: 'Salbutamol Inhaler',
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
      bloodGroup: 'AB+',
      medicalHistory: 'Thyroid',
      allergies: 'None',
      previousVisits: 3,
      medications: 'Thyroxine 50mcg',
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
      bloodGroup: 'A-',
      medicalHistory: 'Diabetes Type 2',
      allergies: 'Sulfa',
      previousVisits: 6,
      medications: 'Insulin',
    },
  ];

  const MOCK_APPOINTMENTS = [
    { id: 'a_001', time: '09:00 AM', patient: 'Muhammad Usman', type: 'Follow-up', status: 'Completed' },
    { id: 'a_002', time: '09:30 AM', patient: 'Saima Ahmed', type: 'Consultation', status: 'Completed' },
    { id: 'a_003', time: '10:00 AM', patient: 'Ali Raza', type: 'Emergency', status: 'In Progress' },
    { id: 'a_004', time: '10:30 AM', patient: 'Fatima Noor', type: 'General Checkup', status: 'Upcoming' },
    { id: 'a_005', time: '11:00 AM', patient: 'Usman Chaudhry', type: 'Consultation', status: 'Upcoming' },
  ];

  const MOCK_ACTIVITIES = [
    { id: '1', action: 'Prescription Created', patient: 'Muhammad Usman', time: '5 min ago', icon: 'document-text-outline', color: COLORS.success },
    { id: '2', action: 'Consultation Completed', patient: 'Saima Ahmed', time: '15 min ago', icon: 'checkmark-circle-outline', color: COLORS.primary },
    { id: '3', action: 'Lab Report Reviewed', patient: 'Ali Raza', time: '25 min ago', icon: 'flask-outline', color: '#9C27B0' },
  ];

  // ─── SEARCHABLE ITEMS ──────────────────────────────────────────────────────
  const getSearchableItems = () => {
    return queuePatients.map(p => ({
      id: p.id,
      name: p.name,
      sub: `Token #${p.token} • ${p.priority}`,
      icon: 'person-outline',
      patient: p,
    }));
  };

  // ─── LIFECYCLE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadDoctorData();
    loadDashboardData();
    animateIn();

    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return () => unsubscribe();
  }, []);

  // ─── DATA LOADING ───────────────────────────────────────────────────────────
  const loadDoctorData = async () => {
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

  const loadDashboardData = () => {
    // Only reset if no consultation active
    if (!isConsultationActive) {
      setCurrentPatient(null);
      // Keep existing queue if we have one, otherwise use mock
      if (queuePatients.length === 0) {
        setQueuePatients(MOCK_QUEUE);
      }
      const firstPatient = queuePatients.length > 0 ? queuePatients[0] : MOCK_QUEUE[0];
      setNextPatient(firstPatient || null);
    }
    setAppointments(MOCK_APPOINTMENTS);
    setActivities(MOCK_ACTIVITIES);
    setStats({
      currentToken: currentPatient?.token || '--',
      nextPatient: nextPatient?.token || '--',
      waiting: queuePatients.length,
      todayAppointments: 15,
      completed: completedCount,
    });
  };

  // ─── ANIMATIONS ─────────────────────────────────────────────────────────────
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

  // ─── SEARCH FUNCTIONS ──────────────────────────────────────────────────────
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const items = getSearchableItems();
    const results = items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.sub.toLowerCase().includes(query.toLowerCase()) ||
      item.patient.token.toString().includes(query)
    );
    setSearchResults(results);
  };

  const handleSearchResultPress = (item) => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    if (item.patient) {
      handleCallPatient(item.patient);
    }
  };

  // ─── PATIENT CALLING ──────────────────────────────────────────────────────
  const handleCallPatient = (patient) => {
    if (isConsultationActive) {
      Alert.alert(
        'Consultation Active',
        'Please complete current consultation before calling next patient.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Set as current patient
    setCurrentPatient(patient);
    setIsConsultationActive(true);
    
    // Remove from queue
    setQueuePatients(prev => prev.filter(p => p.id !== patient.id));
    const newNext = queuePatients.filter(p => p.id !== patient.id)[0] || null;
    setNextPatient(newNext);

    // Update stats
    setStats(prev => ({
      ...prev,
      currentToken: patient.token,
      nextPatient: newNext?.token || '--',
      waiting: queuePatients.length - 1,
    }));

    // Navigate to CallNextPatientScreen
    navigation.navigate('CallNextPatientScreen', { 
      patient: patient,
      onComplete: handleCompleteConsultation
    });
  };

  // ─── CONSULTATION FUNCTIONS ──────────────────────────────────────────────
  const handleCompleteConsultation = (patientData, consultationData) => {
    // Mark consultation as completed
    const completedPatient = currentPatient || patientData;
    
    // Add to consultation history
    setConsultationHistory(prev => [...prev, {
      ...completedPatient,
      ...consultationData,
      completedAt: new Date().toISOString(),
    }]);

    // Increment completed count
    setCompletedCount(prev => prev + 1);

    // Update stats
    setStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      currentToken: '--',
    }));

    // Reset consultation state
    setIsConsultationActive(false);
    setCurrentPatient(null);

    // Add activity
    setActivities(prev => [{
      id: Date.now().toString(),
      action: 'Consultation Completed',
      patient: completedPatient.name,
      time: 'Just now',
      icon: 'checkmark-circle-outline',
      color: COLORS.primary,
    }, ...prev]);

    // Show success message
    Alert.alert(
      'Consultation Complete',
      `Patient ${completedPatient.name} consultation completed successfully.`,
      [
        { 
          text: 'Call Next Patient', 
          onPress: () => {
            if (queuePatients.length > 0) {
              handleCallPatient(queuePatients[0]);
            } else {
              Alert.alert('Queue Empty', 'No more patients in queue.');
            }
          }
        },
        { text: 'Back to Dashboard', style: 'cancel' }
      ]
    );

    // Load updated data
    loadDashboardData();
  };

  // ─── TOGGLE STATUS ──────────────────────────────────────────────────────────
  const handleToggleStatus = () => {
    setDoctor(prev => ({ ...prev, isOnline: !prev.isOnline }));
  };

  // ─── REFRESH ─────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadDashboardData();
      setRefreshing(false);
    }, 1500);
  }, []);

  // ─── RENDER HELPERS ─────────────────────────────────────────────────────────
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'emergency': return COLORS.danger;
      case 'urgent': return COLORS.warning;
      default: return COLORS.success;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return COLORS.success;
      case 'In Progress': return COLORS.primary;
      default: return COLORS.warning;
    }
  };

  // ─── LOADING STATE ─────────────────────────────────────────────────────────
  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Doctor Portal...</Text>
      </View>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* ─── BACKGROUND GRADIENT ─── */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ────────────────────────────────────────────────────── */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.openDrawer()}>
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

            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearchModal(true)}>
              <Ionicons name="search-outline" size={wp(5)} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── MAIN CONTENT ────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.white} />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* ─── DOCTOR PROFILE ─────────────────────────────────────────── */}
            <View style={[styles.profileCard, SHADOWS.medium]}>
              <View style={styles.profileRow}>
                <LinearGradient
                  colors={[doctor?.color || COLORS.primary, doctor?.color2 || COLORS.secondary]}
                  style={styles.profileAvatar}
                >
                  <Text style={styles.profileAvatarText}>
                    {doctor?.avatar || doctor?.name?.split(' ').map(n => n[0]).join('') || 'DR'}
                  </Text>
                </LinearGradient>

                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{doctor?.name || 'Dr. Ahmed Hassan'}</Text>
                  <Text style={styles.profileSpecialty}>{doctor?.specialty || 'Interventional Cardiologist'}</Text>
                  <Text style={styles.profileDept}>{doctor?.department || 'Cardiology Department'}</Text>
                  <Text style={styles.profileHospital}>
                    <Ionicons name="business-outline" size={wp(2.5)} color={COLORS.textLight} />
                    {' '}{doctor?.hospital || 'SehatLine Hospital Islamabad'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.statusToggle} onPress={handleToggleStatus}>
                  <View style={[styles.statusDot, doctor?.isOnline && styles.statusDotActive]} />
                  <Text style={[styles.statusText, doctor?.isOnline && styles.statusTextActive]}>
                    {doctor?.isOnline ? 'Available' : 'Offline'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ─── WORK OVERVIEW ─────────────────────────────────────────── */}
            <View style={styles.overviewContainer}>
              <Text style={styles.sectionTitle}>Today's Work Overview</Text>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewItem}>
                  <View style={[styles.overviewIcon, { backgroundColor: COLORS.primary + '18' }]}>
                    <Ionicons name="timer-outline" size={wp(4)} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.overviewValue}>{stats.currentToken}</Text>
                    <Text style={styles.overviewLabel}>Current Token</Text>
                  </View>
                </View>

                <View style={styles.overviewItem}>
                  <View style={[styles.overviewIcon, { backgroundColor: COLORS.warning + '18' }]}>
                    <Ionicons name="person-outline" size={wp(4)} color={COLORS.warning} />
                  </View>
                  <View>
                    <Text style={styles.overviewValue}>{stats.nextPatient}</Text>
                    <Text style={styles.overviewLabel}>Next Patient</Text>
                  </View>
                </View>

                <View style={styles.overviewItem}>
                  <View style={[styles.overviewIcon, { backgroundColor: '#FF6B6B18' }]}>
                    <Ionicons name="people-outline" size={wp(4)} color="#FF6B6B" />
                  </View>
                  <View>
                    <Text style={styles.overviewValue}>{stats.waiting}</Text>
                    <Text style={styles.overviewLabel}>Waiting</Text>
                  </View>
                </View>

                <View style={styles.overviewItem}>
                  <View style={[styles.overviewIcon, { backgroundColor: COLORS.success + '18' }]}>
                    <Ionicons name="checkmark-done-outline" size={wp(4)} color={COLORS.success} />
                  </View>
                  <View>
                    <Text style={styles.overviewValue}>{stats.completed}</Text>
                    <Text style={styles.overviewLabel}>Completed</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ─── CURRENT CONSULTATION ───────────────────────────────────── */}
            <View style={[styles.consultationCard, SHADOWS.medium]}>
              <View style={styles.consultationHeader}>
                <View style={styles.consultationTitleRow}>
                  <View style={[styles.consultationDot, isConsultationActive && styles.consultationDotActive]} />
                  <Text style={styles.consultationTitle}>
                    {isConsultationActive ? 'Current Patient' : 'Ready for Patient'}
                  </Text>
                </View>
                {currentPatient?.priority && (
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(currentPatient.priority) }]}>
                    <Text style={styles.priorityText}>{currentPatient.priority}</Text>
                  </View>
                )}
              </View>

              {currentPatient ? (
                <>
                  <View style={styles.patientInfoRow}>
                    <View style={styles.patientAvatar}>
                      <Text style={styles.patientAvatarText}>
                        {currentPatient.name?.split(' ').map(n => n[0]).join('') || 'P'}
                      </Text>
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{currentPatient.name}</Text>
                      <Text style={styles.patientDetails}>
                        {currentPatient.age} yrs • {currentPatient.gender || 'Male'} • Token #{currentPatient.token}
                      </Text>
                      <Text style={styles.patientReason}>
                        {currentPatient.reason || 'General Consultation'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.consultationActions}>
                    <TouchableOpacity 
                      style={[styles.consultationBtn, styles.consultBtn]} 
                      onPress={() => {
                        // Navigate to CallNextPatient with current patient
                        navigation.navigate('CallNextPatient', { 
                          patient: currentPatient,
                          onComplete: handleCompleteConsultation
                        });
                      }}
                    >
                      <Ionicons name="medkit-outline" size={wp(4)} color={COLORS.white} />
                      <Text style={styles.consultationBtnText}>Continue Consultation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.consultationBtn, styles.recordBtn]} 
                      onPress={() => navigation.navigate('PatientHistory', { patient: currentPatient })}
                    >
                      <Ionicons name="folder-outline" size={wp(4)} color={COLORS.primary} />
                      <Text style={[styles.consultationBtnText, { color: COLORS.primary }]}>View Record</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.noPatientContainer}>
                  <Ionicons name="person-outline" size={wp(8)} color={COLORS.textLight} />
                  <Text style={styles.noPatientText}>No patient in consultation</Text>
                  <Text style={styles.noPatientSubText}>
                    {queuePatients.length > 0 ? 'Call next patient from queue' : 'Queue is empty'}
                  </Text>
                  {queuePatients.length > 0 && (
                    <TouchableOpacity 
                      style={styles.callNextBtn}
                      onPress={() => handleCallPatient(queuePatients[0])}
                    >
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.callNextGradient}
                      >
                        <Ionicons name="call-outline" size={wp(4)} color={COLORS.white} />
                        <Text style={styles.callNextText}>Call Next Patient</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* ─── PATIENT QUEUE ─────────────────────────────────────────── */}
            <View style={styles.queueContainer}>
              <View style={styles.queueHeader}>
                <Text style={styles.sectionTitle}>Patient Queue ({queuePatients.length})</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TodayQueue')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {queuePatients.length > 0 ? (
                queuePatients.slice(0, 5).map((patient, index) => (
                  <View key={patient.id} style={[styles.queueItem, index === 0 && styles.queueItemFirst]}>
                    <View style={styles.queueToken}>
                      <Text style={styles.queueTokenText}>#{patient.token}</Text>
                    </View>
                    <View style={styles.queueInfo}>
                      <Text style={styles.queueName}>{patient.name}</Text>
                      <Text style={styles.queueDetails}>
                        {patient.age} yrs • {patient.gender || 'Male'}
                      </Text>
                    </View>
                    <View style={styles.queueMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(patient.priority) }]}>
                        <Text style={styles.priorityText}>{patient.priority}</Text>
                      </View>
                      <Text style={styles.queueWaitTime}>{patient.waitTime}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.queueAction, isConsultationActive && styles.queueActionDisabled]}
                      onPress={() => handleCallPatient(patient)}
                      disabled={isConsultationActive}
                    >
                      <Ionicons 
                        name="call-outline" 
                        size={wp(4)} 
                        color={isConsultationActive ? COLORS.textLight : COLORS.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyQueueContainer}>
                  <Ionicons name="people-outline" size={wp(6)} color={COLORS.textLight} />
                  <Text style={styles.emptyQueueText}>Queue is empty</Text>
                </View>
              )}
            </View>

            {/* ─── TODAY'S SCHEDULE ──────────────────────────────────────── */}
            <View style={styles.scheduleContainer}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.sectionTitle}>Today's Schedule</Text>
                <TouchableOpacity onPress={() => navigation.navigate('DoctorSchedule')}>
                  <Text style={styles.viewAllText}>View Full Schedule</Text>
                </TouchableOpacity>
              </View>

              {appointments.slice(0, 3).map((appointment) => (
                <View key={appointment.id} style={[styles.scheduleItem, SHADOWS.small]}>
                  <View style={styles.scheduleTime}>
                    <Text style={styles.scheduleTimeText}>{appointment.time}</Text>
                  </View>
                  <View style={styles.scheduleContent}>
                    <Text style={styles.schedulePatient}>{appointment.patient}</Text>
                    <Text style={styles.scheduleType}>{appointment.type}</Text>
                  </View>
                  <View style={[
                    styles.scheduleStatus,
                    { backgroundColor: getStatusColor(appointment.status) }
                  ]}>
                    <Text style={styles.scheduleStatusText}>{appointment.status}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ─── RECENT ACTIVITY ───────────────────────────────────────── */}
            <View style={styles.activityContainer}>
              <Text style={styles.sectionTitle}>Recent Clinical Activity</Text>
              {activities.slice(0, 3).map((activity) => (
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
          </Animated.View>
        </ScrollView>

        {/* ─── SEARCH MODAL ────────────────────────────────────────────────── */}
        <SearchModal
          visible={showSearchModal}
          onClose={() => {
            setShowSearchModal(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
          results={searchResults}
          onResultPress={handleSearchResultPress}
        />
      </SafeAreaView>
    </View>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
// ... (keep all existing styles, they remain the same)

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
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : 0,
    paddingBottom: hp(0.5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
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
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    marginTop: hp(0.5),
  },
  scrollContent: {
    paddingTop: hp(1),
    paddingBottom: hp(4),
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(0.8),
  },
  viewAllText: {
    fontSize: wp(2.8),
    fontWeight: '500',
    color: COLORS.primary,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    borderRadius: wp(3),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary + '30',
  },
  profileAvatarText: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  profileName: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
  },
  profileSpecialty: {
    fontSize: wp(3),
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: hp(0.1),
  },
  profileDept: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  profileHospital: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  statusDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: '#bdbdbd',
    marginRight: wp(1),
  },
  statusDotActive: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: wp(2.2),
    color: '#bdbdbd',
    fontWeight: '500',
  },
  statusTextActive: {
    color: COLORS.success,
  },
  overviewContainer: {
    paddingHorizontal: wp(4),
    marginTop: hp(1.5),
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  overviewItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: wp(2.5),
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: '#EEF2F7',
    minWidth: (width - wp(14)) / 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  overviewIcon: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  overviewValue: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  overviewLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    borderRadius: wp(3),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  consultationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consultationDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: '#bdbdbd',
    marginRight: wp(1.5),
  },
  consultationDotActive: {
    backgroundColor: COLORS.success,
  },
  consultationTitle: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  priorityBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  priorityText: {
    fontSize: wp(2),
    fontWeight: '600',
    color: COLORS.white,
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  patientAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientAvatarText: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  patientInfo: {
    flex: 1,
    marginLeft: wp(2.5),
  },
  patientName: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  patientDetails: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  patientReason: {
    fontSize: wp(2.8),
    color: COLORS.text,
    marginTop: hp(0.2),
    fontWeight: '500',
  },
  consultationActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  consultationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    gap: wp(1.5),
  },
  consultBtn: {
    backgroundColor: COLORS.primary,
  },
  recordBtn: {
    backgroundColor: COLORS.primary + '18',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  consultationBtnText: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.white,
  },
  noPatientContainer: {
    alignItems: 'center',
    paddingVertical: hp(1.5),
  },
  noPatientText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
  },
  noPatientSubText: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: hp(0.3),
  },
  callNextBtn: {
    marginTop: hp(1),
    borderRadius: wp(3),
    overflow: 'hidden',
    width: '100%',
  },
  callNextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.8),
    gap: wp(2),
  },
  callNextText: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.white,
  },
  queueContainer: {
    paddingHorizontal: wp(4),
    marginTop: hp(1.5),
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: wp(2.5),
    borderRadius: wp(2.5),
    marginBottom: hp(0.6),
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  queueItemFirst: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  queueToken: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  queueTokenText: {
    fontSize: wp(2.8),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  queueInfo: {
    flex: 1,
  },
  queueName: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  queueDetails: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
  },
  queueMeta: {
    alignItems: 'flex-end',
    marginRight: wp(2),
  },
  queueWaitTime: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },
  queueAction: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(2),
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueActionDisabled: {
    backgroundColor: '#F5F5F5',
  },
  emptyQueueContainer: {
    alignItems: 'center',
    paddingVertical: hp(2),
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  emptyQueueText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
  },
  scheduleContainer: {
    paddingHorizontal: wp(4),
    marginTop: hp(1.5),
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: wp(2.5),
    borderRadius: wp(2.5),
    marginBottom: hp(0.6),
    borderWidth: 1,
    borderColor: '#EEF2F7',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  scheduleTime: {
    width: wp(18),
  },
  scheduleTimeText: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.text,
  },
  scheduleContent: {
    flex: 1,
    paddingHorizontal: wp(2),
  },
  schedulePatient: {
    fontSize: wp(3.2),
    fontWeight: '500',
    color: COLORS.text,
  },
  scheduleType: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
  },
  scheduleStatus: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  scheduleStatusText: {
    fontSize: wp(2),
    fontWeight: '600',
    color: COLORS.white,
  },
  activityContainer: {
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
    borderColor: '#EEF2F7',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
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
  searchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-start',
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
    marginBottom: hp(1),
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
    paddingVertical: Platform.OS === 'ios' ? hp(0.7) : hp(0.4),
  },
  searchCancel: {
    color: COLORS.primary,
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  searchResultsList: {
    maxHeight: height * 0.58,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.8),
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEF2F7',
    gap: wp(3),
  },
  searchResultIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    color: COLORS.text,
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  searchResultSub: {
    color: COLORS.textSecondary,
    fontSize: wp(2.4),
  },
  searchEmpty: {
    alignItems: 'center',
    paddingVertical: hp(4),
    gap: hp(0.5),
  },
  searchEmptyText: {
    color: COLORS.textSecondary,
    fontSize: wp(3.5),
    fontWeight: '600',
  },
});

export default DoctorPortalScreen;