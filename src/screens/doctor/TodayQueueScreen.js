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

const TodayQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, waiting: 0, completed: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load queue
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      if (queueData) {
        const parsed = JSON.parse(queueData);
        setQueue(parsed);
      } else {
        // Mock data for demo
        const mockQueue = [
          { id: '1', name: 'Muhammad Usman', age: 45, token: 3, priority: 'Normal', status: 'Waiting', reason: 'Chest Pain', time: '09:30 AM' },
          { id: '2', name: 'Saima Ahmed', age: 32, token: 2, priority: 'Urgent', status: 'Waiting', reason: 'Palpitations', time: '09:15 AM' },
          { id: '3', name: 'Ali Raza', age: 28, token: 1, priority: 'Emergency', status: 'In Consultation', reason: 'Breathing Issue', time: '09:00 AM' },
          { id: '4', name: 'Fatima Noor', age: 55, token: 4, priority: 'Normal', status: 'Waiting', reason: 'Follow Up', time: '09:45 AM' },
          { id: '5', name: 'Usman Chaudhry', age: 38, token: 5, priority: 'Urgent', status: 'Completed', reason: 'Diabetes', time: '10:00 AM' },
        ];
        setQueue(mockQueue);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(mockQueue));
      }

      // Load completed count
      const completedData = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      const completedList = completedData ? JSON.parse(completedData) : [];
      
      updateStats(queueData ? JSON.parse(queueData) : queue, completedList);
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
        item.priority === 'Emergency' && styles.emergencyItem
      ]}
      onPress={() => handlePatientPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.queueItemLeft}>
        <View style={[styles.tokenBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.tokenText}>{item.token}</Text>
        </View>
        <View style={styles.queueItemInfo}>
          <Text style={styles.queueItemName}>{item.name}</Text>
          <Text style={styles.queueItemDetail}>
            {item.age || 'N/A'} yrs • {item.priority}
          </Text>
          {item.reason && (
            <Text style={styles.queueItemReason}>
              <Ionicons name="medical-outline" size={wp(2.5)} color={COLORS.textLight} /> {item.reason}
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
            <Text style={styles.headerTitle}>Today's Queue</Text>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
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
          <Text style={styles.footerText}>SehatLine v2.0.1</Text>
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
    fontSize: wp(4.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  refreshBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Stats ────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
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