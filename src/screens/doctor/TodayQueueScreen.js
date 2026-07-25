// src/screens/doctor/TodayQueueScreen.js
import React, { useState, useEffect } from 'react';
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
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const QUEUE_KEY = '@sehatline_queue';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const CONSULTATION_QUEUE_KEY = '@sehatline_consultation_queue';

const TodayQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([]);
  const [consultationQueue, setConsultationQueue] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [usingMockData, setUsingMockData] = useState(true);

  // ─── GENERATE MOCK DATA (15 Patients - Clean & Simple) ────────────
  const generateMockPatients = () => {
    const patients = [
      { name: 'Muhammad Ali', age: 58, gender: 'Male', reason: 'Follow Up - Chest Pain', priority: 'Normal' },
      { name: 'Ahmed Khan', age: 45, gender: 'Male', reason: 'New Patient - Hypertension', priority: 'Normal' },
      { name: 'Aslam Malik', age: 52, gender: 'Male', reason: 'Follow Up - Post Surgery', priority: 'Normal' },
      { name: 'Bilal Hussain', age: 38, gender: 'Male', reason: 'New Patient - Palpitations', priority: 'Urgent' },
      { name: 'Zainab Bibi', age: 60, gender: 'Female', reason: 'Follow Up - Diabetes', priority: 'Normal' },
      { name: 'Fatima Ahmed', age: 42, gender: 'Female', reason: 'New Patient - Chest Pain', priority: 'Normal' },
      { name: 'Usman Shah', age: 55, gender: 'Male', reason: 'Follow Up - Heart Failure', priority: 'Normal' },
      { name: 'Sana Mirza', age: 35, gender: 'Female', reason: 'New Patient - Arrhythmia', priority: 'Urgent' },
      { name: 'Hamza Ali', age: 48, gender: 'Male', reason: 'Follow Up - Hypertension', priority: 'Normal' },
      { name: 'Ayesha Khan', age: 29, gender: 'Female', reason: 'New Patient - High Cholesterol', priority: 'Normal' },
      { name: 'Imran Malik', age: 62, gender: 'Male', reason: 'Post-surgery Follow-up', priority: 'Normal' },
      { name: 'Hina Bibi', age: 39, gender: 'Female', reason: 'New Patient - Breathing Issue', priority: 'Normal' },
      { name: 'Raza Hussain', age: 51, gender: 'Male', reason: 'Follow Up - Diabetes', priority: 'Normal' },
      { name: 'Nadia Shah', age: 44, gender: 'Female', reason: 'New Patient - Chest Pain', priority: 'Normal' },
      { name: 'Faisal Ahmed', age: 56, gender: 'Male', reason: 'Follow Up - Heart Failure', priority: 'Normal' },
    ];

    const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', 
                       '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
                       '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

    // ✅ Status distribution: 8 Waiting, 4 In Consultation, 3 Completed
    const statuses = [
      'Waiting', 'Waiting', 'Waiting', 'Waiting', 'Waiting', 'Waiting', 'Waiting', 'Waiting',
      'In Consultation', 'In Consultation', 'In Consultation', 'In Consultation',
      'Completed', 'Completed', 'Completed'
    ];

    return patients.map((patient, index) => ({
      id: `apt_${String(index + 1).padStart(3, '0')}`,
      token: index + 1,
      ...patient,
      status: statuses[index] || 'Waiting',
      time: timeSlots[index] || '--:--',
    }));
  };

  const MOCK_QUEUE = generateMockPatients();

  // ─── LIFECYCLE ──────────────────────────────────────────────────────
  useEffect(() => {
    getCurrentDateTime();
    loadData();
    
    const interval = setInterval(getCurrentDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    const dateStr = now.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setCurrentDate(`${dayName}, ${dateStr}`);
    
    const timeStr = now.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setCurrentTime(timeStr);
  };

  // ─── DATA LOADING ──────────────────────────────────────────────────
  const loadData = async () => {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      let queueList = [];
      
      if (queueData) {
        queueList = JSON.parse(queueData);
      }

      const consultationData = await AsyncStorage.getItem(CONSULTATION_QUEUE_KEY);
      let consultList = [];
      if (consultationData) {
        consultList = JSON.parse(consultationData);
      }
      setConsultationQueue(consultList);

      const completedData = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      let completedList = [];
      if (completedData) {
        completedList = JSON.parse(completedData);
      }
      setCompletedPatients(completedList);

      if (queueList.length === 0) {
        queueList = MOCK_QUEUE;
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queueList));
        setUsingMockData(true);
      } else {
        setUsingMockData(false);
      }

      setQueue(queueList);

    } catch (error) {
      console.error('Error loading data:', error);
      setQueue(MOCK_QUEUE);
    }
  };

  // ─── REFRESH ──────────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ─── HANDLE PATIENT PRESS ──────────────────────────────────────────
  const handlePatientPress = (item) => {
    if (item.status === 'Waiting') {
      Alert.alert(
        'Call Patient',
        `Call ${item.name} (Token #${item.token})?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call Now',
            onPress: () => {
              navigation.navigate('CallNextPatientScreen', { patient: item });
            }
          }
        ]
      );
    } else if (item.status === 'In Consultation') {
      navigation.navigate('CallNextPatientScreen', { patient: item });
    } else {
      Alert.alert('Completed', `${item.name} has already been attended.`);
    }
  };

  // ─── HELPERS ──────────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Consultation': return COLORS.primary;
      case 'Completed': return COLORS.success;
      default: return COLORS.warning;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'In Consultation': return 'time-outline';
      case 'Completed': return 'checkmark-circle-outline';
      default: return 'hourglass-outline';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'In Consultation': return 'In Consult';
      case 'Completed': return 'Done';
      default: return 'Waiting';
    }
  };

  // ─── FILTER ──────────────────────────────────────────────────────
  const filteredQueue = filter === 'All' 
    ? queue 
    : filter === 'Completed' 
      ? queue.filter(q => q.status === 'Completed')
      : filter === 'Waiting'
        ? queue.filter(q => q.status === 'Waiting')
        : queue.filter(q => q.status === 'In Consultation');

  // ─── RENDER QUEUE ITEM (Doctor Portal Style) ──────────────────────
  const QueueItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const isCompleted = item.status === 'Completed';
    const isInConsult = item.status === 'In Consultation';
    const isUrgent = item.priority === 'Urgent';

    return (
      <TouchableOpacity
        style={[
          styles.queueItem,
          isCompleted && styles.completedItem,
          isInConsult && styles.inConsultItem,
          isUrgent && styles.urgentItem,
        ]}
        onPress={() => handlePatientPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.queueItemLeft}>
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenText}>{item.token}</Text>
          </View>
          <View style={styles.queueItemInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.queueItemName, isCompleted && styles.completedText]}>
                {item.name}
              </Text>
              {isUrgent && !isCompleted && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentBadgeText}>Urgent</Text>
                </View>
              )}
            </View>
            <Text style={styles.queueItemDetail}>
              {item.age} yrs | {item.gender}
            </Text>
            <Text style={styles.queueItemReason}>
              {item.reason}
            </Text>
          </View>
        </View>
        <View style={styles.queueItemRight}>
          <Text style={styles.queueItemTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary} 
          />
        }
      >
        {/* ─── HEADER ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={26} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../../assets/logoo.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brand}>
              SEHAT<Text style={styles.brandAccent}>LINE</Text>
            </Text>
            <Text style={styles.tagline}>Today's Queue</Text>
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={onRefresh} activeOpacity={0.6}>
            <Ionicons name="refresh-outline" size={25} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── DATE & TIME ───────────────────────────────────────────── */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeLeft}>
            <Ionicons name="calendar-outline" size={wp(4)} color={COLORS.primary} />
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
          <View style={styles.dateTimeRight}>
            <Ionicons name="time-outline" size={wp(4)} color={COLORS.primary} />
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
          {usingMockData && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>Demo</Text>
            </View>
          )}
        </View>

        {/* ─── FILTERS ─────────────────────────────────────────────────── */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['All', 'Waiting', 'In Consultation', 'Completed'].map((status) => {
              const isActive = filter === status;
              const label = status === 'In Consultation' ? 'In Consult' : status;
              const count = status === 'All' 
                ? queue.length 
                : queue.filter(q => q.status === status).length;
              
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setFilter(status)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── QUEUE LIST ─────────────────────────────────────────────── */}
        <View style={styles.listWrapper}>
          {filteredQueue.length > 0 ? (
            filteredQueue.map((item) => <QueueItem key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={wp(12)} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Patients</Text>
              <Text style={styles.emptySub}>No patients in this filter</Text>
            </View>
          )}
        </View>

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SehatLine v2.0.1</Text>
          <View style={styles.footerDivider} />
          <Text style={styles.footerSub}>Today's Queue</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // ── HEADER ──────────────────────────────────────────────────────────
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
  brand: {
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

  // ── Date & Time ─────────────────────────────────────────────────
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexWrap: 'wrap',
    gap: 6,
  },
  dateTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mockBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mockBadgeText: {
    fontSize: 9,
    color: COLORS.warning,
    fontWeight: '600',
  },

  // ── Filters ──────────────────────────────────────────────────────
  filterContainer: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // ── Queue List ──────────────────────────────────────────────────
  listWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // ── Queue Item (Doctor Portal Style) ───────────────────────────
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  completedItem: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  inConsultItem: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  urgentItem: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  queueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  tokenText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  queueItemInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queueItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  queueItemDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  queueItemReason: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 1,
  },
  urgentBadge: {
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  urgentBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.danger,
  },
  queueItemRight: {
    alignItems: 'flex-end',
  },
  queueItemTime: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  footerDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  footerSub: {
    fontSize: 10,
    color: COLORS.textLight,
  },
});

export default TodayQueueScreen;