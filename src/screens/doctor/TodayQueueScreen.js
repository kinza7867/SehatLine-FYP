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
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const QUEUE_KEY = '@sehatline_queue';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const APPOINTMENTS_KEY = '@sehatline_appointments';

const TodayQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, waiting: 0, completed: 0 });
  const [currentDate, setCurrentDate] = useState('');
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    loadData();
    getTodayDate();
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

  const loadData = async () => {
    try {
      // ── Load Appointments ──────────────────────────────────────────
      const appointmentsData = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      let allAppointments = [];
      if (appointmentsData) {
        allAppointments = JSON.parse(appointmentsData);
      }

      // ── Get Today's Date (Tuesday) ─────────────────────────────────
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayStr = today.toDateString();

      // ── Filter Today's Appointments ──────────────────────────────
      const todayApps = allAppointments.filter(app => {
        const appDate = new Date(app.date || app.createdAt || app.appointmentDate);
        appDate.setHours(0, 0, 0, 0);
        return appDate.toDateString() === todayStr;
      });

      // ── Sort by time (morning to evening) ─────────────────────────
      const sortedTodayApps = todayApps.sort((a, b) => {
        const timeA = a.time || a.slot || '09:00';
        const timeB = b.time || b.slot || '09:00';
        return timeA.localeCompare(timeB);
      });

      setTodayAppointments(sortedTodayApps);

      // ── Load Queue ─────────────────────────────────────────────────
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      let queueList = [];
      
      if (queueData) {
        queueList = JSON.parse(queueData);
      }

      // ── Filter Queue for Today ─────────────────────────────────────
      const todayQueue = queueList.filter(item => {
        const itemDate = new Date(item.date || item.createdAt || Date.now());
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.toDateString() === todayStr;
      });

      // ── Add mock patients if queue is empty ──────────────────────
      if (todayQueue.length === 0 && todayApps.length === 0) {
        // Tuesday mock data (2 PM slot)
        const mockTuesdayQueue = [
          { 
            id: '1', 
            name: 'Muhammad Usman', 
            age: 45, 
            token: 3, 
            priority: 'Normal', 
            status: 'Waiting', 
            reason: 'Chest Pain', 
            time: '09:30 AM',
            date: today.toISOString(),
            phone: '0333-1234567'
          },
          { 
            id: '2', 
            name: 'Saima Ahmed', 
            age: 32, 
            token: 2, 
            priority: 'Urgent', 
            status: 'Waiting', 
            reason: 'Palpitations', 
            time: '09:15 AM',
            date: today.toISOString(),
            phone: '0333-7654321'
          },
          { 
            id: '3', 
            name: 'Ali Raza', 
            age: 28, 
            token: 1, 
            priority: 'Emergency', 
            status: 'In Consultation', 
            reason: 'Breathing Issue', 
            time: '09:00 AM',
            date: today.toISOString(),
            phone: '0333-9876543'
          },
          { 
            id: '4', 
            name: 'Fatima Noor', 
            age: 55, 
            token: 4, 
            priority: 'Normal', 
            status: 'Waiting', 
            reason: 'Follow Up', 
            time: '09:45 AM',
            date: today.toISOString(),
            phone: '0333-4567890'
          },
          { 
            id: '5', 
            name: 'Usman Chaudhry', 
            age: 38, 
            token: 5, 
            priority: 'Urgent', 
            status: 'Waiting', 
            reason: 'Diabetes Checkup', 
            time: '10:00 AM',
            date: today.toISOString(),
            phone: '0333-7890123'
          },
          { 
            id: '6', 
            name: 'Ayesha Khan', 
            age: 29, 
            token: 6, 
            priority: 'Normal', 
            status: 'Waiting', 
            reason: 'Palpitations', 
            time: '10:30 AM',
            date: today.toISOString(),
            phone: '0333-2345678'
          },
          { 
            id: '7', 
            name: 'Muhammad Bilal', 
            age: 52, 
            token: 7, 
            priority: 'Normal', 
            status: 'Waiting', 
            reason: 'Hypertension', 
            time: '11:00 AM',
            date: today.toISOString(),
            phone: '0333-3456789'
          },
          { 
            id: '8', 
            name: 'Zainab Ali', 
            age: 41, 
            token: 8, 
            priority: 'Urgent', 
            status: 'Waiting', 
            reason: 'Chest Discomfort', 
            time: '11:30 AM',
            date: today.toISOString(),
            phone: '0333-4567890'
          },
          { 
            id: '9', 
            name: 'Hamza Ahmed', 
            age: 35, 
            token: 9, 
            priority: 'Normal', 
            status: 'Waiting', 
            reason: 'Routine Checkup', 
            time: '12:00 PM',
            date: today.toISOString(),
            phone: '0333-5678901'
          },
          { 
            id: '10', 
            name: 'Sadia Malik', 
            age: 48, 
            token: 10, 
            priority: 'Normal', 
            status: 'Waiting', 
            reason: 'High Cholesterol', 
            time: '12:30 PM',
            date: today.toISOString(),
            phone: '0333-6789012'
          },
          { 
            id: '11', 
            name: 'Rana Shahid', 
            age: 62, 
            token: 11, 
            priority: 'Urgent', 
            status: 'Waiting', 
            reason: 'Heart Failure Follow-up', 
            time: '01:00 PM',
            date: today.toISOString(),
            phone: '0333-7890123'
          },
          { 
            id: '12', 
            name: 'Nadia Tariq', 
            age: 39, 
            token: 12, 
            priority: 'Normal', 
            status: 'Waiting', 
            reason: 'Palpitations', 
            time: '01:30 PM',
            date: today.toISOString(),
            phone: '0333-8901234'
          },
        ];
        
        // Filter to keep only patients up to 2 PM
        const filteredMockQueue = mockTuesdayQueue.filter(item => {
          const timeStr = item.time;
          const hour = parseInt(timeStr.split(':')[0]);
          const minute = parseInt(timeStr.split(':')[1].split(' ')[0]);
          const isPM = timeStr.includes('PM');
          
          // Convert to 24-hour format
          let hour24 = hour;
          if (isPM && hour !== 12) hour24 = hour + 12;
          if (!isPM && hour === 12) hour24 = 0;
          
          // Keep only appointments up to 2 PM (14:00)
          return hour24 < 14 || (hour24 === 14 && minute === 0);
        });

        setQueue(filteredMockQueue);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filteredMockQueue));
        
        // Update stats
        const waiting = filteredMockQueue.filter(q => q.status === 'Waiting' || q.status === 'In Consultation').length;
        const completed = filteredMockQueue.filter(q => q.status === 'Completed').length;
        setStats({
          total: filteredMockQueue.length + completed,
          waiting: waiting,
          completed: completed,
        });
        
        return;
      }

      // ── Use actual queue data ──────────────────────────────────────
      setQueue(todayQueue);

      // ── Load completed patients ────────────────────────────────────
      const completedData = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      const completedList = completedData ? JSON.parse(completedData) : [];
      
      updateStats(todayQueue, completedList);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateStats = (queueList, completedList) => {
    const waiting = queueList.filter(q => q.status === 'Waiting' || q.status === 'In Consultation').length;
    const completed = completedList.length || queueList.filter(q => q.status === 'Completed').length;
    setStats({
      total: queueList.length + completed,
      waiting: waiting,
      completed: completed,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Emergency': return COLORS.danger || '#F44336';
      case 'Urgent': return COLORS.warning || '#FF9800';
      default: return COLORS.success || '#4CAF50';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Consultation': return '#2196F3';
      case 'Completed': return COLORS.success || '#4CAF50';
      default: return COLORS.warning || '#FF9800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'In Consultation': return 'time-outline';
      case 'Completed': return 'checkmark-circle-outline';
      default: return 'hourglass-outline';
    }
  };

  const handlePatientPress = (item) => {
    if (item.status === 'Waiting') {
      Alert.alert(
        'Call Patient',
        `Call ${item.name} (Token #${item.token}) for consultation?`,
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
      Alert.alert('Patient Completed', `${item.name} has already been attended.`);
    }
  };

  const filteredQueue = filter === 'All' 
    ? queue 
    : filter === 'Completed' 
      ? queue.filter(q => q.status === 'Completed')
      : queue.filter(q => q.status === filter || (filter === 'Waiting' && q.status === 'In Consultation'));

  const QueueItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.queueItem, 
        SHADOWS.small,
        item.priority === 'Emergency' && styles.emergencyItem,
        item.status === 'Completed' && styles.completedItem
      ]}
      onPress={() => handlePatientPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.queueItemLeft}>
        <View style={[styles.tokenBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.tokenText}>{item.token}</Text>
        </View>
        <View style={styles.queueItemInfo}>
          <Text style={[styles.queueItemName, item.status === 'Completed' && styles.completedText]}>
            {item.name}
          </Text>
          <Text style={styles.queueItemDetail}>
            {item.age || 'N/A'} yrs • {item.priority}
          </Text>
          {item.reason && (
            <Text style={styles.queueItemReason}>
              <Ionicons name="medical-outline" size={wp(2.5)} color={COLORS.textLight} /> {item.reason}
            </Text>
          )}
          {item.phone && (
            <Text style={styles.queueItemPhone}>
              <Ionicons name="call-outline" size={wp(2)} color={COLORS.textLight} /> {item.phone}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.queueItemRight}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons name={getStatusIcon(item.status)} size={wp(2.5)} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status === 'In Consultation' ? 'In Consult' : item.status}
          </Text>
        </View>
        <Text style={styles.queueItemTime}>{item.time || '--:--'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerLogo} 
              resizeMode="contain" 
            />
            <View>
              <Text style={styles.headerTitle}>Today's Queue</Text>
              <Text style={styles.headerDate}>{currentDate}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── INFO BANNER ────────────────────────────────────────────── */}
        <View style={styles.infoBanner}>
          <Ionicons name="time-outline" size={wp(4)} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Tuesday Clinic • Patients up to 2:00 PM
          </Text>
        </View>

        {/* ─── STATS ───────────────────────────────────────────────────── */}
        <View style={[styles.statsContainer, SHADOWS.small]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{stats.waiting}</Text>
            <Text style={styles.statLabel}>Waiting</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* ─── FILTERS ─────────────────────────────────────────────────── */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['All', 'Waiting', 'In Consultation', 'Completed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, filter === status && styles.filterChipActive]}
                onPress={() => setFilter(status)}
              >
                <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                  {status === 'In Consultation' ? 'In Consult' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── QUEUE LIST ─────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredQueue.length > 0 ? (
            filteredQueue.map((item) => <QueueItem key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={wp(15)} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No patients in queue</Text>
              <Text style={styles.emptySubText}>Queue is empty for this filter</Text>
            </View>
          )}
        </ScrollView>

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SehatLine v2.0.1 • Tuesday Clinic</Text>
        </View>
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
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  headerLogo: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  headerDate: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ── Info Banner ──────────────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: wp(4),
    marginTop: hp(1),
    padding: wp(2.5),
    borderRadius: wp(2),
    gap: wp(1.5),
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  infoText: {
    fontSize: wp(2.8),
    color: COLORS.primary,
    fontWeight: '500',
  },

  // ── Stats ────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  statNumber: {
    fontSize: wp(5),
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  statDivider: {
    width: 1,
    height: hp(4),
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },

  // ── Filters ──────────────────────────────────────────────────────
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  filterScroll: {
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  filterChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(4),
  },

  // ── Queue Item ──────────────────────────────────────────────────
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emergencyItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  completedItem: {
    opacity: 0.7,
    backgroundColor: COLORS.backgroundSecondary,
  },
  queueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenBadge: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2.5),
  },
  tokenText: {
    fontSize: wp(3),
    fontWeight: 'bold',
    color: '#fff',
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemName: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  queueItemDetail: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  queueItemReason: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
  queueItemPhone: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: hp(0.05),
  },
  queueItemRight: {
    alignItems: 'flex-end',
    gap: hp(0.2),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.15),
    borderRadius: wp(2),
    gap: wp(0.8),
  },
  statusText: {
    fontSize: wp(2.2),
    fontWeight: '600',
  },
  queueItemTime: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
  },
  emptyText: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(1),
  },
  emptySubText: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
    marginTop: hp(0.3),
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: wp(4),
  },
  footerText: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },
});

export default TodayQueueScreen;