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
  const [stats, setStats] = useState({ total: 0, waiting: 0, consulting: 0, completed: 0 });
  const [currentDate, setCurrentDate] = useState('');
  const [usingMockData, setUsingMockData] = useState(true);

  // ─── MOCK DATA ──────────────────────────────────────────────────────
  // 41 patients total: 30 waiting, 5 in consult, 6 completed
  const generateMockPatients = () => {
    const firstNames = ['Muhammad', 'Ahmed', 'Ali', 'Usman', 'Hamza', 'Bilal', 'Raza', 'Imran', 'Faisal', 'Noman',
      'Zainab', 'Fatima', 'Ayesha', 'Sana', 'Hina', 'Nadia', 'Sadia', 'Rabia', 'Mehwish', 'Kiran',
      'Hassan', 'Hussain', 'Zahid', 'Kashif', 'Javed', 'Tariq', 'Saeed', 'Naeem', 'Shahid', 'Aslam',
      'Amna', 'Hira', 'Mahnoor', 'Areeba', 'Eman', 'Iqra', 'Laiba', 'Aliza', 'Sara', 'Minal'];
    const lastNames = ['Khan', 'Ali', 'Malik', 'Hussain', 'Ahmed', 'Bibi', 'Shah', 'Mirza', 'Abbasi', 'Hashmi'];
    const reasons = ['Chest Pain', 'Palpitations', 'Hypertension', 'Diabetes', 'Follow Up', 'Breathing Issue', 
      'High Cholesterol', 'Heart Failure', 'Arrhythmia', 'Routine Checkup', 'Post-surgery Follow-up', 
      'Emergency Admission', 'Medication Review', 'Stress Test', 'ECG Review'];
    
    const patients = [];
    const total = 41;
    
    for (let i = 0; i < total; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const age = 18 + Math.floor(Math.random() * 55);
      
      // ✅ 6 Completed, 5 In Consultation, 30 Waiting
      let status = 'Waiting';
      if (i < 6) status = 'Completed';
      else if (i < 11) status = 'In Consultation';
      
      const reason = reasons[i % reasons.length];
      const hour = 9 + Math.floor(i / 6);
      const minute = (i * 12) % 60;
      
      patients.push({
        id: `apt_${String(i + 1).padStart(3, '0')}`,
        token: i + 1,
        name: `${firstName} ${lastName}`,
        age: age,
        status: status,
        reason: reason,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`,
      });
    }
    
    return patients;
  };

  const MOCK_QUEUE = generateMockPatients();

  // ─── LIFECYCLE ──────────────────────────────────────────────────────
  useEffect(() => {
    getTodayDate();
    loadData();
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setCurrentDate(`${dayName}, ${dateStr}`);
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
      updateStats(queueList, consultList, completedList);

    } catch (error) {
      console.error('Error loading data:', error);
      setQueue(MOCK_QUEUE);
      updateStats(MOCK_QUEUE, [], []);
    }
  };

  const updateStats = (queueList, consultList, completedList) => {
    // ✅ Queue list mein se sirf Waiting wale count karo
    const waiting = queueList.filter(q => q.status === 'Waiting').length;
    
    // ✅ Consultation queue se consult count
    const inConsult = consultList.length || queueList.filter(q => q.status === 'In Consultation').length;
    
    // ✅ Completed patients count
    const completed = completedList.length || queueList.filter(q => q.status === 'Completed').length;
    
    // ✅ Total = Waiting + In Consult + Completed
    const total = waiting + inConsult + completed;
    
    setStats({
      total,
      waiting,
      consulting: inConsult,
      completed,
    });
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

  // ─── RENDER QUEUE ITEM ────────────────────────────────────────────
  const QueueItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const isCompleted = item.status === 'Completed';
    const isInConsult = item.status === 'In Consultation';

    return (
      <TouchableOpacity
        style={[
          styles.queueItem,
          isCompleted && styles.completedItem,
          isInConsult && styles.inConsultItem,
        ]}
        onPress={() => handlePatientPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.queueItemLeft}>
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenText}>{item.token}</Text>
          </View>
          <View style={styles.queueItemInfo}>
            <Text style={[styles.queueItemName, isCompleted && styles.completedText]}>
              {item.name}
            </Text>
            <Text style={styles.queueItemDetail}>
              {item.age || 'N/A'} yrs • #{item.token}
            </Text>
            {item.reason && (
              <Text style={styles.queueItemReason}>
                <Ionicons name="medical-outline" size={wp(2.8)} color={COLORS.textLight} /> {item.reason}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.queueItemRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Ionicons name={getStatusIcon(item.status)} size={wp(2.8)} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          <Text style={styles.queueItemTime}>{item.time || '--:--'}</Text>
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
        {/* ─── HEADER - SCROLLABLE ───────────────────────────────────── */}
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

        {/* ─── DATE ───────────────────────────────────────────────────── */}
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={wp(4)} color={COLORS.primary} />
          <Text style={styles.dateText}>{currentDate}</Text>
          {usingMockData && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>Demo</Text>
            </View>
          )}
        </View>

        {/* ─── STATS ───────────────────────────────────────────────────── */}
        <View style={styles.statsContainer}>
          {[
            { label: 'Total', value: stats.total, color: COLORS.primary, icon: 'people-outline' },
            { label: 'Waiting', value: stats.waiting, color: COLORS.warning, icon: 'time-outline' },
            { label: 'In Consult', value: stats.consulting, color: COLORS.info, icon: 'medical-outline' },
            { label: 'Completed', value: stats.completed, color: COLORS.success, icon: 'checkmark-done-outline' },
          ].map((stat, index) => (
            <View key={stat.label} style={[styles.statItem, index < 3 && styles.statItemBorder]}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={wp(4)} color={stat.color} />
              </View>
              <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
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
          <Text style={styles.footerSub}>{currentDate}</Text>
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

  // ── HEADER - SCROLLABLE ──────────────────────────────────────────
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

  // ── Date ─────────────────────────────────────────────────────────
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
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

  // ── Stats ────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 1,
    fontWeight: '500',
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

  // ── Queue Item ──────────────────────────────────────────────────
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
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
  queueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  queueItemInfo: {
    flex: 1,
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
  queueItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  queueItemTime: {
    fontSize: 10,
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