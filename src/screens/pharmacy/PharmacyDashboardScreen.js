import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  TextInput,
  Share,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

// ─── COMPLETE MEDICINES LIST ──────────────────────────────────────────────
const getAllMedicines = () => [
  { id: '1', name: 'Metformin', category: 'Diabetes', stock: 45 },
  { id: '2', name: 'Paracetamol', category: 'Pain Relief', stock: 120 },
  { id: '3', name: 'Insulin', category: 'Diabetes', stock: 8 },
  { id: '4', name: 'Vitamin D', category: 'Vitamins', stock: 65 },
  { id: '5', name: 'Losartan', category: 'Blood Pressure', stock: 25 },
  { id: '6', name: 'Atorvastatin', category: 'Cholesterol', stock: 15 },
  { id: '7', name: 'Omeprazole', category: 'Acid Reflux', stock: 3 },
  { id: '8', name: 'Amoxicillin', category: 'Antibiotic', stock: 80 },
];

// ─── STATUS CONFIG ──────────────────────────────────────────────────────────
const getStatusConfig = (status) => {
  const configs = {
    'Confirmed': { 
      label: 'Waiting', 
      color: '#2ECC71', 
      bg: '#2ECC7115',
      icon: 'time-outline'
    },
    'pending': { 
      label: 'Pending', 
      color: '#F59E0B', 
      bg: '#F59E0B15',
      icon: 'time-outline'
    },
    'processing': { 
      label: 'Preparing', 
      color: '#8B5CF6', 
      bg: '#8B5CF615',
      icon: 'flask-outline'
    },
    'dispensed': { 
      label: 'Dispensed', 
      color: '#2ECC71', 
      bg: '#2ECC7115',
      icon: 'checkmark-circle-outline'
    },
    'completed': { 
      label: 'Completed', 
      color: '#2ECC71', 
      bg: '#2ECC7115',
      icon: 'checkmark-done-circle-outline'
    },
    'cancelled': { 
      label: 'Cancelled', 
      color: '#EF4444', 
      bg: '#EF444415',
      icon: 'close-circle-outline'
    },
  };
  return configs[status] || configs['Confirmed'];
};

const PharmacyDashboardScreen = ({ navigation, route }) => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeToken, setActiveToken] = useState(null);
  const [currentServing, setCurrentServing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [pharmacyAppointments, setPharmacyAppointments] = useState([]);
  
  // ─── Statistics ────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    todayDispensed: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    total: 0,
  });
  
  // ─── Medicines ──────────────────────────────────────────────────────────
  const [medicines, setMedicines] = useState([]);
  
  // ─── Prescription History ──────────────────────────────────────────────
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  
  // ─── Repeat Prescriptions ──────────────────────────────────────────────
  const [repeatPrescriptions, setRepeatPrescriptions] = useState([]);
  
  // ─── Notifications ──────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  
  // ─── Modals ──────────────────────────────────────────────────────────────
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // ─── Refs for scrolling ────────────────────────────────────────────────
  const scrollViewRef = useRef(null);
  const medicinesRef = useRef(null);
  const notificationsRef = useRef(null);

  // ─── DEMO TOKEN ──────────────────────────────────────────────────────────
  const DEMO_TOKEN = {
    token: 'P-042',
    patientName: 'Patient',
    status: 'Confirmed',
    bookedAt: new Date().toISOString(),
    department: 'Pharmacy',
    departmentData: { medicines: ['Metformin'], ref: 'RX-1234' }
  };

  // ─── Load Data ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      let data = route?.params?.userData || null;
      if (!data) {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) data = JSON.parse(storedData);
      }
      setUserData(data);

      const stored = await AsyncStorage.getItem('appointments');
      let allAppointments = [];
      if (stored) allAppointments = JSON.parse(stored);

      const pharmacyAppts = allAppointments.filter(
        app => app.department === 'Pharmacy' || 
              (app.department === 'Chronic OPD' && app.departmentData?.needsPharmacy !== false)
      );
      setPharmacyAppointments(pharmacyAppts);

      const sortedAppts = [...pharmacyAppts].sort((a, b) => 
        new Date(b.bookedAt) - new Date(a.bookedAt)
      );

      const latestToken = sortedAppts.length > 0 ? sortedAppts[0] : null;

      if (latestToken) {
        setActiveToken(latestToken);
        const tokenNum = parseInt(latestToken.token.split('-')[1]);
        const servingNum = tokenNum + Math.floor(Math.random() * 5) + 3;
        setCurrentServing({
          token: `P-${String(servingNum).padStart(3, '0')}`,
          position: Math.floor(Math.random() * 4) + 2,
          waitTime: Math.floor(Math.random() * 12) + 8,
        });
      } else {
        const demoToken = { ...DEMO_TOKEN, patientName: data?.name || 'Patient' };
        setActiveToken(demoToken);
        setCurrentServing({
          token: 'P-036',
          position: 4,
          waitTime: 12,
        });
      }

      // ─── Statistics ──────────────────────────────────────────────────
      const today = new Date().toDateString();
      const todayDispensed = pharmacyAppts.filter(
        app => app.dispensed && new Date(app.dispensedAt).toDateString() === today
      );
      
      const pending = pharmacyAppts.filter(
        app => app.status === 'pending' || app.status === 'Confirmed'
      );
      
      const processing = pharmacyAppts.filter(
        app => app.status === 'processing'
      );
      
      const completed = pharmacyAppts.filter(
        app => app.status === 'completed' || app.status === 'dispensed'
      );

      setStats({
        todayDispensed: todayDispensed.length || 5,
        pending: pending.length || 3,
        processing: processing.length || 2,
        completed: completed.length || 4,
        total: pharmacyAppts.length || 0,
      });

      // ─── Medicines ────────────────────────────────────────────────────
      const medsStr = await AsyncStorage.getItem('medicines');
      let meds = [];
      if (medsStr) {
        meds = JSON.parse(medsStr);
      } else {
        meds = getAllMedicines();
        await AsyncStorage.setItem('medicines', JSON.stringify(meds));
      }
      setMedicines(meds);
      setFilteredMedicines(meds);

      // ─── Repeat Prescriptions ──────────────────────────────────────
      const repeats = pharmacyAppts.filter(
        app => app.departmentData?.repeatPrescription === true || 
              (app.departmentData?.medicines && app.departmentData?.medicines.length > 0)
      );
      
      let finalRepeats = repeats;
      if (repeats.length === 0 && latestToken) {
        finalRepeats = [{
          id: 'repeat1',
          patientName: data?.name || 'Patient',
          date: new Date().toISOString(),
          departmentData: { medicines: latestToken.departmentData?.medicines || ['Medicine'], ref: 'RX-1234' },
          token: latestToken.token,
        }];
      } else if (repeats.length === 0) {
        finalRepeats = [
          {
            id: 'repeat1',
            patientName: data?.name || 'Patient',
            date: new Date().toISOString(),
            departmentData: { medicines: ['Metformin'], ref: 'RX-1234' },
            token: 'P-042',
          },
        ];
      }
      setRepeatPrescriptions(finalRepeats);

      // ─── Prescription History ──────────────────────────────────────
      const history = pharmacyAppts
        .filter(app => app.dispensed)
        .slice(0, 5)
        .map(app => ({
          id: app.id,
          medicine: app.departmentData?.medicines?.[0] || 'Medicine',
          quantity: '30 tablets',
          date: app.dispensedAt || app.date,
          doctor: app.departmentData?.doctor || 'Dr. Specialist',
          dispensed: true,
        }));
      
      if (history.length === 0 && latestToken) {
        setPrescriptionHistory([
          { 
            id: 'h1', 
            medicine: latestToken.departmentData?.medicines?.[0] || 'Medicine', 
            quantity: '30 tablets', 
            date: new Date().toISOString(), 
            doctor: 'Dr. Sarah Ahmed' 
          },
        ]);
      } else if (history.length === 0) {
        setPrescriptionHistory([
          { id: 'h1', medicine: 'Metformin', quantity: '30 tablets', date: new Date().toISOString(), doctor: 'Dr. Sarah Ahmed' },
        ]);
      } else {
        setPrescriptionHistory(history);
      }

      // ─── Notifications ──────────────────────────────────────────────
      const tokenMsg = latestToken ? `Your token ${latestToken.token} is in queue` : 'No active token';
      setNotifications([
        { id: '1', type: 'token', message: tokenMsg },
        { id: '2', type: 'ready', message: 'Medicine ready for collection - Counter 3' },
        { id: '3', type: 'repeat', message: 'Repeat prescription due soon' },
      ]);

    } catch (error) {
      console.log('Error loading pharmacy data:', error);
    }
    setLoading(false);
  };

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getStatusColor = (status) => getStatusConfig(status).color;
  const getStatusBgColor = (status) => getStatusConfig(status).bg;
  const getStatusIcon = (status) => getStatusConfig(status).icon;

  // ─── Search Function ──────────────────────────────────────────────────
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  };

  // ─── All Actions ──────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleShareToken = async () => {
    if (!activeToken) return;
    try {
      const msg = 
        `💊 Pharmacy Token\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Token: ${activeToken.token || 'P-042'}\n` +
        `Patient: ${activeToken.patientName || userData?.name || 'Patient'}\n` +
        `Position: ${currentServing?.position || 'N/A'}\n` +
        `Wait Time: ${currentServing?.waitTime || 'N/A'} mins\n` +
        `Medicine: ${activeToken.departmentData?.medicines?.join(', ') || 'N/A'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `CDA Hospital Islamabad\n` +
        `SehatLine - Digital Pharmacy`;
      await Share.share({ message: msg, title: 'Pharmacy Token' });
    } catch (e) {
      Alert.alert('Error', 'Unable to share token');
    }
  };

  const handleDownloadToken = () => {
    Alert.alert('Download Token', 'Token PDF would download here');
  };

  const handleGenerateToken = () => {
    navigation.navigate('GenerateTokenScreen', { 
      userData,
      defaultDepartment: 'Pharmacy Token'
    });
  };

  const handleViewQueue = () => {
    navigation.navigate('LiveTokenQueueScreen', { 
      userData,
      department: 'Pharmacy'
    });
  };

  const handleMedicineHistory = () => {
    setShowHistoryModal(true);
  };

  const handleRepeatPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowRepeatModal(true);
  };

  const handleRequestRefill = (prescription) => {
    Alert.alert('Success', `Refill requested for ${prescription.departmentData?.medicines?.[0] || 'medicine'}`);
    setShowRepeatModal(false);
  };

  const handleNotificationPress = (notification) => {
    Alert.alert('Notification', notification.message);
  };

  // ─── Scroll to sections ──────────────────────────────────────────────
  const scrollToMedicines = () => {
    if (medicinesRef.current) {
      medicinesRef.current.measureLayout(scrollViewRef.current, (x, y) => {
        scrollViewRef.current.scrollTo({ y, animated: true });
      });
    }
  };

  const scrollToNotifications = () => {
    if (notificationsRef.current) {
      notificationsRef.current.measureLayout(scrollViewRef.current, (x, y) => {
        scrollViewRef.current.scrollTo({ y, animated: true });
      });
    }
  };

  // ─── Render Header ────────────────────────────────────────────────────
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>SehatLine</Text>
            <Text style={styles.headerSubtitle}>Pharmacy Dashboard</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => navigation.navigate('ProfileScreen', { userData })}
        >
          <Ionicons name="person-circle-outline" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.hospitalName}>CDA Hospital Islamabad</Text>
    </LinearGradient>
  );

  // ─── Render Current Token ──────────────────────────────────────────────
  const renderCurrentToken = () => {
    const tokenNumber = activeToken?.token || 'P-042';
    const waitTime = currentServing?.waitTime || 'N/A';
    const position = currentServing?.position || 'N/A';

    return (
      <View style={styles.tokenCard}>
        <LinearGradient
          colors={['#2ECC71', '#27AE60']}
          style={styles.tokenCardOutline}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.tokenCardInner}>
            <Text style={styles.tokenCardLabel}>Your Pharmacy Token</Text>
            <Text style={styles.tokenCardNumber}>{tokenNumber}</Text>
            
            <View style={styles.waitTimeContainer}>
              <Ionicons name="time-outline" size={24} color="#2ECC71" />
              <Text style={styles.waitTimeLabel}>Estimated Wait</Text>
              <Text style={[styles.waitTimeValue, { color: '#2ECC71' }]}>{waitTime} mins</Text>
            </View>

            <View style={styles.tokenCardRow}>
              <View style={styles.tokenCardStatus}>
                <Text style={styles.tokenCardStatusLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: '#2ECC71' }]} />
                  <Text style={[styles.tokenCardStatusValue, { color: '#2ECC71' }]}>Waiting</Text>
                </View>
              </View>
              <View style={styles.tokenDivider} />
              <View style={styles.tokenCardStatus}>
                <Text style={styles.tokenCardStatusLabel}>Position</Text>
                <Text style={styles.tokenCardStatusValue}>#{position}</Text>
              </View>
              <View style={styles.tokenDivider} />
              <View style={styles.tokenCardStatus}>
                <Text style={styles.tokenCardStatusLabel}>Serving</Text>
                <Text style={styles.tokenCardStatusValue}>{currentServing?.token || 'P-036'}</Text>
              </View>
            </View>

            <View style={styles.tokenCardActions}>
              <TouchableOpacity style={styles.tokenActionBtn} onPress={handleShareToken}>
                <Ionicons name="share-outline" size={18} color="#2ECC71" />
                <Text style={[styles.tokenActionText, { color: '#2ECC71' }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tokenActionBtn, styles.tokenActionPrimary]} onPress={handleDownloadToken}>
                <Ionicons name="download-outline" size={18} color={COLORS.white} />
                <Text style={[styles.tokenActionText, { color: COLORS.white }]}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tokenActionBtn, styles.tokenActionPrimary]} onPress={handleViewQueue}>
                <Ionicons name="timer-outline" size={18} color={COLORS.white} />
                <Text style={[styles.tokenActionText, { color: COLORS.white }]}>Queue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // ─── Render Queue Status ──────────────────────────────────────────────
  const renderQueueStatus = () => (
    <View style={styles.queueCard}>
      <Text style={styles.cardTitle}>Live Queue Status</Text>
      <View style={styles.queueRow}>
        <View style={styles.queueItem}>
          <Text style={styles.queueLabel}>Currently Serving</Text>
          <Text style={[styles.queueValue, { color: '#2ECC71' }]}>{currentServing?.token || 'P-036'}</Text>
        </View>
        <View style={styles.queueDivider} />
        <View style={styles.queueItem}>
          <Text style={styles.queueLabel}>Your Token</Text>
          <Text style={[styles.queueValue, { color: '#2ECC71' }]}>
            {activeToken?.token || 'P-042'}
          </Text>
        </View>
        <View style={styles.queueDivider} />
        <View style={styles.queueItem}>
          <Text style={styles.queueLabel}>People Before</Text>
          <Text style={styles.queueValue}>{currentServing?.position || '0'}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { 
              width: activeToken ? `${Math.min(100, (1 / (currentServing?.position || 1)) * 100)}%` : '0%' 
            }]} 
          />
        </View>
        <Text style={styles.progressText}>
          {activeToken ? `${Math.min(100, Math.floor((1 / (currentServing?.position || 1)) * 100))}% complete` : 'No active token'}
        </Text>
      </View>
    </View>
  );

  // ─── Render Stats ──────────────────────────────────────────────────────
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.cardTitle}>Dispensing Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { borderColor: '#2ECC71' }]}>
          <Text style={[styles.statNumber, { color: '#2ECC71' }]}>{stats.todayDispensed}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={[styles.statItem, { borderColor: '#F59E0B' }]}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statItem, { borderColor: '#8B5CF6' }]}>
          <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{stats.processing}</Text>
          <Text style={styles.statLabel}>Processing</Text>
        </View>
        <View style={[styles.statItem, { borderColor: '#2ECC71' }]}>
          <Text style={[styles.statNumber, { color: '#2ECC71' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>
    </View>
  );

  // ─── Render Quick Actions ──────────────────────────────────────────────
  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={handleGenerateToken}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="add-circle-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>Generate Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={() => setShowTokenModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="ticket-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>My Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={handleViewQueue}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="timer-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>Queue Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={() => setShowHistoryModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="document-text-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>Medicine History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={() => setShowRepeatModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="repeat-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>Repeat Meds</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={scrollToMedicines}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="medkit-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>Availability</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={scrollToNotifications}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="notifications-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: '#2ECC7140' }]}
          onPress={() => setShowHelpModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="help-circle-outline" size={24} color="#2ECC71" />
          </View>
          <Text style={styles.actionLabel}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render Available Medicines ──────────────────────────────────────────
  const renderAvailableMedicines = () => {
    const displayData = searchQuery.trim() ? filteredMedicines : medicines;
    
    return (
      <View 
        style={styles.medicinesContainer}
        ref={medicinesRef}
        collapsable={false}
      >
        <Text style={styles.cardTitle}>Medicine Availability</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
        {displayData.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.noResultsText}>No medicines found</Text>
          </View>
        ) : (
          displayData.slice(0, 5).map((item) => {
            const status = item.stock > 50 ? 'Available' : item.stock > 10 ? 'Limited' : 'Out of Stock';
            const statusColor = item.stock > 50 ? '#2ECC71' : item.stock > 10 ? '#F59E0B' : '#EF4444';
            const statusBg = item.stock > 50 ? '#2ECC7115' : item.stock > 10 ? '#F59E0B15' : '#EF444415';
            
            return (
              <View key={item.id} style={styles.medicineItem}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{item.name}</Text>
                  <Text style={styles.medicineCategory}>{item.category}</Text>
                </View>
                <View style={[styles.medicineStatus, { backgroundColor: statusBg }]}>
                  <Text style={[styles.medicineStatusText, { color: statusColor }]}>
                    {status}
                  </Text>
                </View>
              </View>
            );
          })
        )}
        <TouchableOpacity style={styles.viewAllBtn} onPress={handleMedicineHistory}>
          <Text style={[styles.viewAllBtnText, { color: '#2ECC71' }]}>View All Medicines</Text>
          <Ionicons name="arrow-forward" size={16} color="#2ECC71" />
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Render Repeat Prescriptions ──────────────────────────────────────
  const renderRepeatPrescriptions = () => (
    <View style={styles.repeatContainer}>
      <Text style={styles.cardTitle}>Repeat Prescriptions</Text>
      {repeatPrescriptions.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="repeat-outline" size={40} color={COLORS.textLight} />
          <Text style={styles.noResultsText}>No repeat prescriptions</Text>
        </View>
      ) : (
        repeatPrescriptions.slice(0, 2).map((item) => (
          <View key={item.id} style={styles.repeatCard}>
            <View style={styles.repeatHeader}>
              <Text style={styles.repeatMedicine}>
                {item.departmentData?.medicines?.[0] || 'Medicine'}
              </Text>
              <View style={[styles.repeatBadge, { backgroundColor: '#2ECC7115' }]}>
                <Text style={[styles.repeatBadgeText, { color: '#2ECC71' }]}>Auto Refill</Text>
              </View>
            </View>
            <View style={styles.repeatDetails}>
              <View style={styles.repeatDetail}>
                <Text style={styles.repeatLabel}>Next Refill</Text>
                <Text style={styles.repeatValue}>
                  {new Date(new Date(item.date).setDate(new Date(item.date).getDate() + 30)).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.repeatDetail}>
                <Text style={styles.repeatLabel}>Remaining Days</Text>
                <Text style={styles.repeatValue}>
                  {Math.max(0, Math.floor((new Date(new Date(item.date).setDate(new Date(item.date).getDate() + 30)) - new Date()) / (1000 * 60 * 60 * 24)))}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.repeatBtn}
              onPress={() => handleRepeatPrescription(item)}
            >
              <LinearGradient
                colors={['#2ECC71', '#27AE60']}
                style={styles.repeatBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="refresh-circle-outline" size={18} color={COLORS.white} />
                <Text style={styles.repeatBtnText}>Request Refill</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  // ─── Render Notifications ──────────────────────────────────────────────
  const renderNotifications = () => (
    <View 
      style={styles.notificationContainer}
      ref={notificationsRef}
      collapsable={false}
    >
      <Text style={styles.cardTitle}>Notifications</Text>
      {notifications.slice(0, 3).map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.notificationItem, { borderLeftColor: '#2ECC71' }]}
          onPress={() => handleNotificationPress(item)}
        >
          <View style={[styles.notificationIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons 
              name={item.type === 'token' ? 'timer-outline' : item.type === 'ready' ? 'checkmark-circle-outline' : 'repeat-outline'} 
              size={20} 
              color="#2ECC71" 
            />
          </View>
          <Text style={styles.notificationMessage}>{item.message}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ─── Render Help ──────────────────────────────────────────────────────
  const renderHelp = () => (
    <View style={styles.helpContainer}>
      <Text style={styles.cardTitle}>Need Help?</Text>
      <View style={styles.helpGrid}>
        <TouchableOpacity
          style={[styles.helpItem, { borderColor: '#2ECC7140' }]}
          onPress={() => Alert.alert('Lost Token', 'Go to "My Token" section to view your current token.')}
        >
          <View style={[styles.helpIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="help-circle-outline" size={22} color="#2ECC71" />
          </View>
          <Text style={styles.helpLabel}>Lost Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.helpItem, { borderColor: '#2ECC7140' }]}
          onPress={() => Alert.alert('Medicine Unavailable', 'Check "Medicine Availability" section for current stock status.')}
        >
          <View style={[styles.helpIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="alert-circle-outline" size={22} color="#2ECC71" />
          </View>
          <Text style={styles.helpLabel}>Med Unavailable</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.helpItem, { borderColor: '#2ECC7140' }]}
          onPress={() => Alert.alert('Contact Pharmacy', 'Visit the pharmacy counter at CDA Hospital or call 051-1234567 during working hours.')}
        >
          <View style={[styles.helpIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="call-outline" size={22} color="#2ECC71" />
          </View>
          <Text style={styles.helpLabel}>Contact Pharmacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.helpItem, { borderColor: '#2ECC7140' }]}
          onPress={() => setShowHelpModal(true)}
        >
          <View style={[styles.helpIcon, { backgroundColor: '#2ECC7110' }]}>
            <Ionicons name="document-text-outline" size={22} color="#2ECC71" />
          </View>
          <Text style={styles.helpLabel}>FAQ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Token Modal ──────────────────────────────────────────────────────
  const renderTokenModal = () => {
    const tokenToShow = activeToken;
    
    return (
      <Modal 
        visible={showTokenModal} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setShowTokenModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Token</Text>
              <TouchableOpacity onPress={() => setShowTokenModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tokenModalContent}>
              <LinearGradient
                colors={['#2ECC71', '#27AE60']}
                style={styles.tokenModalCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.tokenModalLabel}>CDA HOSPITAL</Text>
                <Text style={styles.tokenModalNumber}>{tokenToShow?.token || 'P-042'}</Text>
                
                <View style={styles.tokenModalQR}>
                  <Ionicons name="qr-code" size={80} color={COLORS.white} />
                  <Text style={styles.tokenModalQrText}>Scan at pharmacy</Text>
                </View>
                
                <View style={[styles.tokenModalWaitTime, { borderColor: '#2ECC71' }]}>
                  <Ionicons name="time-outline" size={24} color={COLORS.white} />
                  <Text style={styles.tokenModalWaitLabel}>Wait Time</Text>
                  <Text style={styles.tokenModalWaitValue}>{currentServing?.waitTime || 'N/A'} mins</Text>
                </View>
                
                <View style={styles.tokenModalDetails}>
                  <View style={styles.tokenModalRow}>
                    <Text style={styles.tokenModalLabel}>Patient</Text>
                    <Text style={styles.tokenModalValue}>{tokenToShow?.patientName || userData?.name || 'Patient'}</Text>
                  </View>
                  <View style={styles.tokenModalRow}>
                    <Text style={styles.tokenModalLabel}>Status</Text>
                    <Text style={[styles.tokenModalValue, { color: '#2ECC71' }]}>Waiting</Text>
                  </View>
                  <View style={styles.tokenModalRow}>
                    <Text style={styles.tokenModalLabel}>Position</Text>
                    <Text style={styles.tokenModalValue}>#{currentServing?.position || 'N/A'}</Text>
                  </View>
                  <View style={styles.tokenModalRow}>
                    <Text style={styles.tokenModalLabel}>Medicine</Text>
                    <Text style={styles.tokenModalValue}>
                      {tokenToShow?.departmentData?.medicines?.join(', ') || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.tokenModalRow}>
                    <Text style={styles.tokenModalLabel}>Prescription</Text>
                    <Text style={styles.tokenModalValue}>{tokenToShow?.departmentData?.ref || 'N/A'}</Text>
                  </View>
                </View>
              </LinearGradient>
              
              <View style={styles.tokenModalActions}>
                <TouchableOpacity 
                  style={[styles.tokenModalBtn, { borderColor: '#2ECC71' }]} 
                  onPress={handleShareToken}
                >
                  <Ionicons name="share-outline" size={20} color="#2ECC71" />
                  <Text style={[styles.tokenModalBtnText, { color: '#2ECC71' }]}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tokenModalBtn, { backgroundColor: '#2ECC71', borderColor: '#2ECC71' }]} 
                  onPress={handleDownloadToken}
                >
                  <Ionicons name="download-outline" size={20} color={COLORS.white} />
                  <Text style={[styles.tokenModalBtnText, { color: COLORS.white }]}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ─── History Modal ──────────────────────────────────────────────────────
  const renderHistoryModal = () => (
    <Modal visible={showHistoryModal} transparent animationType="slide" onRequestClose={() => setShowHistoryModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Medicine History</Text>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {prescriptionHistory.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyMedicine}>{item.medicine}</Text>
                  <Text style={styles.historyQuantity}>{item.quantity}</Text>
                </View>
                <Text style={styles.historyDoctor}>👨‍⚕️ {item.doctor}</Text>
                <Text style={styles.historyDate}>📅 {new Date(item.date).toLocaleDateString()}</Text>
                <TouchableOpacity style={styles.historyDownloadBtn}>
                  <Ionicons name="download-outline" size={16} color="#2ECC71" />
                  <Text style={[styles.historyDownloadText, { color: '#2ECC71' }]}>Download Prescription</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Repeat Modal ──────────────────────────────────────────────────────
  const renderRepeatModal = () => (
    <Modal visible={showRepeatModal} transparent animationType="slide" onRequestClose={() => setShowRepeatModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Repeat Prescriptions</Text>
            <TouchableOpacity onPress={() => setShowRepeatModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {repeatPrescriptions.map((item) => (
              <View key={item.id} style={styles.repeatModalCard}>
                <Text style={styles.repeatModalMedicine}>
                  {item.departmentData?.medicines?.[0] || 'Medicine'}
                </Text>
                <View style={styles.repeatModalDetails}>
                  <Text style={styles.repeatModalLabel}>Next Refill: </Text>
                  <Text style={styles.repeatModalValue}>
                    {new Date(new Date(item.date).setDate(new Date(item.date).getDate() + 30)).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.repeatModalBtn}
                  onPress={() => handleRequestRefill(item)}
                >
                  <LinearGradient
                    colors={['#2ECC71', '#27AE60']}
                    style={styles.repeatModalGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.repeatModalBtnText}>Request Refill</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Help Modal ──────────────────────────────────────────────────────
  const renderHelpModal = () => (
    <Modal visible={showHelpModal} transparent animationType="slide" onRequestClose={() => setShowHelpModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>FAQ</Text>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How to get a pharmacy token?</Text>
              <Text style={styles.faqAnswer}>Go to "Generate Token" in Quick Actions.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What if I lost my token?</Text>
              <Text style={styles.faqAnswer}>Go to "My Token" section to view your token.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How to check medicine availability?</Text>
              <Text style={styles.faqAnswer}>Click "Availability" in Quick Actions.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How to request a refill?</Text>
              <Text style={styles.faqAnswer}>Go to "Repeat Prescriptions" section.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How to contact pharmacy?</Text>
              <Text style={styles.faqAnswer}>Visit pharmacy counter or call 051-1234567.</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── ROOT ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text style={styles.loadingText}>Loading pharmacy data...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        
        {renderHeader()}

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#2ECC71']}
              tintColor="#2ECC71"
            />
          }
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentToken()}
          {renderQueueStatus()}
          {renderStats()}
          {renderQuickActions()}
          {renderAvailableMedicines()}
          {renderRepeatPrescriptions()}
          {renderNotifications()}
          {renderHelp()}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>CDA Hospital Islamabad</Text>
            <Text style={styles.footerSubtext}>SehatLine - Pharmacy Management</Text>
          </View>
        </ScrollView>

        {renderTokenModal()}
        {renderHistoryModal()}
        {renderRepeatModal()}
        {renderHelpModal()}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: hp(2),
    color: COLORS.textSecondary,
    fontSize: wp(3.5),
  },

  // ─── Header ────────────────────────────────────────────────────────────
  headerGradient: {
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(1.5) : hp(1),
    paddingBottom: hp(1.5),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  headerTitles: {
    flexDirection: 'column',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: wp(2.8),
  },
  hospitalName: {
    color: COLORS.white + '70',
    fontSize: wp(2.8),
    textAlign: 'center',
    marginTop: hp(0.3),
  },

  // ─── ScrollView ──────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(6),
  },

  cardTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1.2),
  },

  sectionTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1.2),
  },

  // ─── Token Card ──────────────────────────────────────────────────────────
  tokenCard: {
    marginBottom: hp(1.8),
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  tokenCardOutline: {
    padding: 3,
  },
  tokenCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: wp(4.5),
  },
  tokenCardLabel: {
    color: COLORS.textSecondary,
    fontSize: wp(3.2),
    textAlign: 'center',
  },
  tokenCardNumber: {
    color: COLORS.text,
    fontSize: wp(10),
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: hp(0.5),
    letterSpacing: 2,
  },

  waitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC7115',
    borderRadius: 12,
    padding: hp(0.8),
    marginVertical: hp(0.5),
    gap: 8,
    borderWidth: 1,
    borderColor: '#2ECC7140',
  },
  waitTimeLabel: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
  },
  waitTimeValue: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
  },

  tokenCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: hp(0.5),
    paddingVertical: hp(0.5),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tokenCardStatus: {
    alignItems: 'center',
    flex: 1,
  },
  tokenCardStatusLabel: {
    color: COLORS.textSecondary,
    fontSize: wp(2.6),
  },
  tokenCardStatusValue: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tokenDivider: {
    width: 1,
    height: hp(3),
    backgroundColor: COLORS.border,
  },

  tokenCardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: hp(0.8),
  },
  tokenActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.6),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2ECC71',
    backgroundColor: COLORS.white,
  },
  tokenActionPrimary: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  tokenActionText: {
    fontSize: wp(2.8),
    fontWeight: '500',
  },

  // ─── Queue Status ─────────────────────────────────────────────────────
  queueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: '#2ECC7140',
    ...SHADOWS.small,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: hp(0.5),
  },
  queueItem: {
    alignItems: 'center',
    flex: 1,
  },
  queueLabel: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
  },
  queueValue: {
    fontSize: wp(4.2),
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  queueDivider: {
    width: 1,
    height: hp(3),
    backgroundColor: COLORS.border,
  },
  progressContainer: {
    marginTop: hp(0.8),
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2ECC7120',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 3,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
    marginTop: hp(0.3),
    textAlign: 'center',
  },

  // ─── Stats ──────────────────────────────────────────────────────────────
  statsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: '#2ECC7140',
    ...SHADOWS.small,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    flex: 1,
    minWidth: (width - wp(8) - 30) / 2,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: wp(3),
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ─── Quick Actions ──────────────────────────────────────────────────
  actionsContainer: {
    marginBottom: hp(1.8),
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: (width - wp(8) - 30) / 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(2.5),
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.small,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(0.3),
  },
  actionLabel: {
    fontSize: wp(2.6),
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ─── Medicines ──────────────────────────────────────────────────────────
  medicinesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: '#2ECC7140',
    ...SHADOWS.small,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: hp(1),
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: wp(3.5),
    paddingVertical: hp(0.6),
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.6),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: wp(3.6),
    fontWeight: '600',
    color: COLORS.text,
  },
  medicineCategory: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  medicineStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  medicineStatusText: {
    fontSize: wp(2.6),
    fontWeight: '600',
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: hp(0.6),
    marginTop: hp(0.5),
  },
  viewAllBtnText: {
    fontSize: wp(3.2),
    fontWeight: '600',
  },

  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: hp(2),
  },
  noResultsText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
  },

  // ─── Repeat Prescriptions ────────────────────────────────────────────
  repeatContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: '#2ECC7140',
    ...SHADOWS.small,
  },
  repeatCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(1),
  },
  repeatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  repeatMedicine: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.text,
  },
  repeatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  repeatBadgeText: {
    fontSize: wp(2.6),
    fontWeight: '600',
  },
  repeatDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: hp(0.8),
  },
  repeatDetail: {
    flex: 1,
  },
  repeatLabel: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  repeatValue: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  repeatBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  repeatBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.6),
    gap: 8,
  },
  repeatBtnText: {
    color: COLORS.white,
    fontSize: wp(3),
    fontWeight: '600',
  },

  // ─── Notifications ──────────────────────────────────────────────────
  notificationContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: '#2ECC7140',
    ...SHADOWS.small,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: hp(0.6),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationMessage: {
    flex: 1,
    fontSize: wp(3.2),
    color: COLORS.text,
  },

  // ─── Help ─────────────────────────────────────────────────────────────
  helpContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: '#2ECC7140',
    ...SHADOWS.small,
  },
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  helpItem: {
    flex: 1,
    minWidth: (width - wp(8) - 30) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(2.5),
    alignItems: 'center',
    borderWidth: 1,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(0.2),
  },
  helpLabel: {
    fontSize: wp(2.6),
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ─── Footer ─────────────────────────────────────────────────────────
  footer: {
    marginTop: hp(2),
    marginBottom: hp(1),
    alignItems: 'center',
  },
  footerText: {
    fontSize: wp(3.5),
    color: COLORS.textLight,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: 2,
  },

  // ─── Modals ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: wp(4),
    width: width * 0.92,
    maxHeight: height * 0.85,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    maxHeight: height * 0.7,
  },

  // ─── Token Modal ────────────────────────────────────────────────────
  tokenModalContent: { flex: 1 },
  tokenModalCard: {
    borderRadius: 16,
    padding: wp(5),
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  tokenModalLabel: {
    color: COLORS.white + '80',
    fontSize: wp(3),
    fontWeight: '600',
  },
  tokenModalNumber: {
    color: COLORS.white,
    fontSize: wp(10),
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: hp(0.5),
  },
  tokenModalQR: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(1),
  },
  tokenModalQrText: {
    color: COLORS.white + '70',
    fontSize: wp(2.8),
    marginTop: hp(0.2),
  },
  tokenModalWaitTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: hp(0.8),
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    marginBottom: hp(1),
    borderWidth: 1,
  },
  tokenModalWaitLabel: {
    color: COLORS.white,
    fontSize: wp(3),
  },
  tokenModalWaitValue: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  tokenModalDetails: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: wp(3),
  },
  tokenModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tokenModalValue: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  tokenModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  tokenModalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: hp(1),
    borderRadius: 12,
    borderWidth: 1,
  },
  tokenModalBtnText: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // ─── History Modal ──────────────────────────────────────────────────
  historyCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(1),
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.3),
  },
  historyMedicine: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.text,
  },
  historyQuantity: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
  },
  historyDoctor: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginBottom: hp(0.2),
  },
  historyDate: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginBottom: hp(0.5),
  },
  historyDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: hp(0.3),
  },
  historyDownloadText: {
    fontSize: wp(3),
    fontWeight: '500',
  },

  // ─── Repeat Modal ──────────────────────────────────────────────────
  repeatModalCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(1),
  },
  repeatModalMedicine: {
    fontSize: wp(4),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },
  repeatModalDetails: {
    flexDirection: 'row',
    marginBottom: hp(0.8),
  },
  repeatModalLabel: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
  },
  repeatModalValue: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  repeatModalBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  repeatModalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.8),
  },
  repeatModalBtnText: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: '600',
  },

  // ─── Help Modal ────────────────────────────────────────────────────
  faqItem: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(1),
  },
  faqQuestion: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },
  faqAnswer: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default PharmacyDashboardScreen;