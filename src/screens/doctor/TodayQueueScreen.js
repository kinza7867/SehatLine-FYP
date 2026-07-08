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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const TodayQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    const mockQueue = [
      { id: '1', name: 'Muhammad Usman', age: 45, token: 3, priority: 'Normal', status: 'Waiting', time: '09:30 AM' },
      { id: '2', name: 'Saima Ahmed', age: 32, token: 2, priority: 'Urgent', status: 'Waiting', time: '09:15 AM' },
      { id: '3', name: 'Ali Raza', age: 28, token: 1, priority: 'Emergency', status: 'InConsultation', time: '09:00 AM' },
      { id: '4', name: 'Fatima Noor', age: 55, token: 4, priority: 'Normal', status: 'Waiting', time: '09:45 AM' },
      { id: '5', name: 'Usman Chaudhry', age: 38, token: 5, priority: 'Urgent', status: 'Completed', time: '10:00 AM' },
    ];
    setQueue(mockQueue);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadQueue();
      setRefreshing(false);
    }, 1500);
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
      case 'InConsultation': return '#2196F3';
      case 'Completed': return COLORS.success || '#4CAF50';
      default: return COLORS.warning || '#FF9800';
    }
  };

  const filteredQueue = filter === 'All' ? queue : queue.filter(q => q.status === filter);

  const QueueItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.queueItem, SHADOWS?.small || {}]}
      onPress={() => {
        if (item.status === 'Waiting' || item.status === 'InConsultation') {
          navigation.navigate('Consultation', { patient: item });
        }
      }}
    >
      <View style={styles.queueItemLeft}>
        <View style={[styles.tokenBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.tokenText}>{item.token}</Text>
        </View>
        <View style={styles.queueItemInfo}>
          <Text style={styles.queueItemName}>{item.name}</Text>
          <Text style={styles.queueItemDetail}>
            {item.age} yrs • {item.priority} • {item.time}
          </Text>
        </View>
      </View>
      <View style={styles.queueItemRight}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'InConsultation' ? 'In Consult' : item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary || '#1a73e8', COLORS.secondary || '#0d47a1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5)} color={COLORS.white || '#fff'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today's Queue</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.filterContainer}>
          {['All', 'Waiting', 'InConsultation', 'Completed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filter === status && styles.filterChipActive]}
              onPress={() => setFilter(status)}
            >
              <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                {status === 'InConsultation' ? 'In Consult' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary || '#1a73e8']} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredQueue.length > 0 ? (
            filteredQueue.map((item) => <QueueItem key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={wp(15)} color={COLORS.border || '#e0e0e0'} />
              <Text style={styles.emptyText}>No patients in queue</Text>
              <Text style={styles.emptySubText}>Queue is empty for this filter</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f7fa',
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: wp(8),
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    gap: wp(2),
    marginTop: hp(0.5),
    marginBottom: hp(0.5),
  },
  filterChip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary || '#1a73e8',
    borderColor: COLORS.primary || '#1a73e8',
  },
  filterText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary || '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: wp(8),
  },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3.5),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
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
    marginRight: wp(3),
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
    color: COLORS.text || '#1a1a1a',
  },
  queueItemDetail: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary || '#666',
    marginTop: hp(0.1),
  },
  queueItemRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.1),
    borderRadius: wp(2),
  },
  statusText: {
    fontSize: wp(2.2),
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(4),
  },
  emptyText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: COLORS.text || '#1a1a1a',
    marginTop: hp(1),
  },
  emptySubText: {
    fontSize: wp(3),
    color: COLORS.textLight || '#999',
    marginTop: hp(0.3),
  },
});

export default TodayQueueScreen;