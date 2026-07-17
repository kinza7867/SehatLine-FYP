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
import { COLORS } from '../../theme';

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
      const appointmentsData = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      let allAppointments = [];
      if (appointmentsData) {
        allAppointments = JSON.parse(appointmentsData);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toDateString();

      const todayApps = allAppointments.filter(app => {
        const appDate = new Date(app.date || app.createdAt || app.appointmentDate);
        appDate.setHours(0, 0, 0, 0);
        return appDate.toDateString() === todayStr;
      });

      const sortedTodayApps = todayApps.sort((a, b) => {
        const timeA = a.time || a.slot || '09:00';
        const timeB = b.time || b.slot || '09:00';
        return timeA.localeCompare(timeB);
      });

      setTodayAppointments(sortedTodayApps);

      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      let queueList = [];
      
      if (queueData) {
        queueList = JSON.parse(queueData);
      }

      const todayQueue = queueList.filter(item => {
        const itemDate = new Date(item.date || item.createdAt || Date.now());
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.toDateString() === todayStr;
      });

      if (todayQueue.length === 0 && todayApps.length === 0) {
        const mockTuesdayQueue = [
          { id: '1', name: 'Muhammad Usman', age: 45, token: 3, status: 'Waiting', reason: 'Chest Pain', time: '09:30 AM', date: today.toISOString(), phone: '0333-1234567' },
          { id: '2', name: 'Saima Ahmed', age: 32, token: 2, status: 'Waiting', reason: 'Palpitations', time: '09:15 AM', date: today.toISOString(), phone: '0333-7654321' },
          { id: '3', name: 'Ali Raza', age: 28, token: 1, status: 'In Consultation', reason: 'Breathing Issue', time: '09:00 AM', date: today.toISOString(), phone: '0333-9876543' },
          { id: '4', name: 'Fatima Noor', age: 55, token: 4, status: 'Waiting', reason: 'Follow Up', time: '09:45 AM', date: today.toISOString(), phone: '0333-4567890' },
          { id: '5', name: 'Usman Chaudhry', age: 38, token: 5, status: 'Waiting', reason: 'Diabetes Checkup', time: '10:00 AM', date: today.toISOString(), phone: '0333-7890123' },
          { id: '6', name: 'Ayesha Khan', age: 29, token: 6, status: 'Waiting', reason: 'Palpitations', time: '10:30 AM', date: today.toISOString(), phone: '0333-2345678' },
          { id: '7', name: 'Muhammad Bilal', age: 52, token: 7, status: 'Waiting', reason: 'Hypertension', time: '11:00 AM', date: today.toISOString(), phone: '0333-3456789' },
          { id: '8', name: 'Zainab Ali', age: 41, token: 8, status: 'Waiting', reason: 'Chest Discomfort', time: '11:30 AM', date: today.toISOString(), phone: '0333-4567890' },
          { id: '9', name: 'Hamza Ahmed', age: 35, token: 9, status: 'Waiting', reason: 'Routine Checkup', time: '12:00 PM', date: today.toISOString(), phone: '0333-5678901' },
          { id: '10', name: 'Sadia Malik', age: 48, token: 10, status: 'Waiting', reason: 'High Cholesterol', time: '12:30 PM', date: today.toISOString(), phone: '0333-6789012' },
          { id: '11', name: 'Rana Shahid', age: 62, token: 11, status: 'Waiting', reason: 'Heart Failure Follow-up', time: '01:00 PM', date: today.toISOString(), phone: '0333-7890123' },
          { id: '12', name: 'Nadia Tariq', age: 39, token: 12, status: 'Waiting', reason: 'Palpitations', time: '01:30 PM', date: today.toISOString(), phone: '0333-8901234' },
        ];
        
        const filteredMockQueue = mockTuesdayQueue.filter(item => {
          const timeStr = item.time;
          const hour = parseInt(timeStr.split(':')[0]);
          const minute = parseInt(timeStr.split(':')[1].split(' ')[0]);
          const isPM = timeStr.includes('PM');
          let hour24 = hour;
          if (isPM && hour !== 12) hour24 = hour + 12;
          if (!isPM && hour === 12) hour24 = 0;
          return hour24 < 14 || (hour24 === 14 && minute === 0);
        });

        setQueue(filteredMockQueue);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filteredMockQueue));
        
        const waiting = filteredMockQueue.filter(q => q.status === 'Waiting' || q.status === 'In Consultation').length;
        const completed = filteredMockQueue.filter(q => q.status === 'Completed').length;
        setStats({
          total: filteredMockQueue.length + completed,
          waiting: waiting,
          completed: completed,
        });
        
        return;
      }

      setQueue(todayQueue);

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
              {item.age || 'N/A'} yrs • Token #{item.token}
            </Text>
            {item.reason && (
              <Text style={styles.queueItemReason}>
                <Ionicons name="medical-outline" size={wp(2.8)} color={COLORS.textLight} /> {item.reason}
              </Text>
            )}
            {item.phone && (
              <Text style={styles.queueItemPhone}>
                <Ionicons name="call-outline" size={wp(2.4)} color={COLORS.textLight} /> {item.phone}
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../../assets/logo.png')} 
                style={styles.headerLogo} 
                resizeMode="contain" 
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>Today's Queue</Text>
              <Text style={styles.headerDate}>{currentDate}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── STATS ───────────────────────────────────────────────────── */}
        <View style={styles.statsContainer}>
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
            {['All', 'Waiting', 'In Consultation', 'Completed'].map((status) => {
              const isActive = filter === status;
              const label = status === 'In Consultation' ? 'In Consult' : status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setFilter(status)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {label}
                  </Text>
                  {isActive && (
                    <View style={styles.filterActiveDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── QUEUE LIST ─────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredQueue.length > 0 ? (
            filteredQueue.map((item) => <QueueItem key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="people-outline" size={wp(15)} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyText}>No patients in queue</Text>
              <Text style={styles.emptySubText}>Queue is empty for this filter</Text>
            </View>
          )}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine v2.0.1</Text>
            <Text style={styles.footerSub}>Today's Queue • {currentDate}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    paddingVertical: hp(1.2),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuBtn: {
    width: wp(8),
    height: wp(8),
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
  logoCircle: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    borderWidth: 1.6,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerLogo: {
    width: wp(7),
    height: wp(7),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
  },
  headerDate: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
    fontWeight: '400',
    marginTop: hp(0.05),
  },
  refreshBtn: {
    width: wp(8),
    height: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  // ── Stats ────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(1.2),
  },
  statNumber: {
    fontSize: wp(5.5),
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.1),
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: hp(3.5),
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },

  // ── Filters ──────────────────────────────────────────────────────
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: hp(0.8),
    marginTop: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  filterScroll: {
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: wp(1),
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
  filterActiveDot: {
    width: wp(1.2),
    height: wp(1.2),
    borderRadius: wp(0.6),
    backgroundColor: COLORS.white,
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
    borderRadius: wp(3),
    padding: wp(3.5),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
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
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2.5),
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  tokenText: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.primary,
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemName: {
    fontSize: wp(4),
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
    fontSize: wp(2.6),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
  queueItemPhone: {
    fontSize: wp(2.4),
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
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2.5),
    gap: wp(0.8),
  },
  statusText: {
    fontSize: wp(2.4),
    fontWeight: '600',
  },
  queueItemTime: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(10),
  },
  emptyIconWrap: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  emptyText: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(0.5),
  },
  emptySubText: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingTop: hp(2),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: hp(1),
  },
  footerText: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.primary,
  },
  footerSub: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
});

export default TodayQueueScreen;