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
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;

const QUEUE_KEY = '@sehatline_queue';

// ─── Check if Break Time ─────────────────────────────────────────────
const isBreakTime = () => {
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const breakStart = 12 * 60 + 30;
  const breakEnd = 13 * 60;
  return currentMinute >= breakStart && currentMinute < breakEnd;
};

// ─── MOCK QUEUE (10-15 Patients) ──────────────────────────────────
const MOCK_QUEUE = [
  { id: 'p_001', name: 'Muhammad Ali', token: 17, age: 58, gender: 'Male', disease: 'Chest Pain' },
  { id: 'p_002', name: 'Ahmed Khan', token: 18, age: 45, gender: 'Male', disease: 'Hypertension' },
  { id: 'p_003', name: 'Aslam Malik', token: 19, age: 52, gender: 'Male', disease: 'Post Surgery' },
  { id: 'p_004', name: 'Bilal Hussain', token: 20, age: 38, gender: 'Male', disease: 'Palpitations' },
  { id: 'p_005', name: 'Zainab Bibi', token: 21, age: 60, gender: 'Female', disease: 'Diabetes' },
  { id: 'p_006', name: 'Fatima Ahmed', token: 22, age: 42, gender: 'Female', disease: 'Chest Pain' },
  { id: 'p_007', name: 'Usman Shah', token: 23, age: 55, gender: 'Male', disease: 'Heart Failure' },
  { id: 'p_008', name: 'Sana Mirza', token: 24, age: 35, gender: 'Female', disease: 'Arrhythmia' },
  { id: 'p_009', name: 'Hamza Ali', token: 25, age: 48, gender: 'Male', disease: 'Hypertension' },
  { id: 'p_010', name: 'Ayesha Khan', token: 26, age: 29, gender: 'Female', disease: 'High Cholesterol' },
  { id: 'p_011', name: 'Imran Malik', token: 27, age: 62, gender: 'Male', disease: 'Post Surgery' },
  { id: 'p_012', name: 'Hina Bibi', token: 28, age: 39, gender: 'Female', disease: 'Breathing Issue' },
  { id: 'p_013', name: 'Raza Hussain', token: 29, age: 51, gender: 'Male', disease: 'Diabetes' },
  { id: 'p_014', name: 'Nadia Shah', token: 30, age: 44, gender: 'Female', disease: 'Chest Pain' },
  { id: 'p_015', name: 'Faisal Ahmed', token: 31, age: 56, gender: 'Male', disease: 'Heart Failure' },
];

const TodayQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [usingMockData, setUsingMockData] = useState(true);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    getCurrentDate();
    loadData();
    checkBreakStatus();
    
    const interval = setInterval(() => {
      checkBreakStatus();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    const dateStr = now.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setCurrentDate(`${dayName}, ${dateStr}`);
  };

  const checkBreakStatus = () => {
    setIsBreak(isBreakTime());
  };

  const loadData = async () => {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      let queueList = [];
      
      if (queueData) {
        queueList = JSON.parse(queueData);
      }

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    checkBreakStatus();
    setRefreshing(false);
  };

  const handlePatientPress = (item) => {
    if (isBreak) {
      Alert.alert('Break Time', 'Consultation is on break from 12:30 PM to 1:00 PM.');
      return;
    }
    
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
  };

  // ─── RENDER QUEUE ITEM ──────────────────────────────────────────
  const QueueItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.queueItem}
        onPress={() => handlePatientPress(item)}
        activeOpacity={0.7}
        disabled={isBreak}
      >
        <View style={styles.queueItemLeft}>
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenText}>{item.token}</Text>
          </View>
          <View style={styles.queueItemInfo}>
            <Text style={styles.queueItemName}>{item.name}</Text>
            <Text style={styles.queueItemDetail}>
              {item.age} yrs | {item.gender} | {item.disease}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

        {/* ─── DATE ───────────────────────────────────────────── */}
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={wp(4)} color={COLORS.primary} />
          <Text style={styles.dateText}>{currentDate}</Text>
          {usingMockData && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>Demo</Text>
            </View>
          )}
        </View>

        {/* ─── BREAK TIME BANNER ────────────────────────────────────── */}
        {isBreak && (
          <View style={styles.breakBanner}>
            <Ionicons name="restaurant-outline" size={20} color={COLORS.white} />
            <Text style={styles.breakBannerText}>Break Time (12:30 PM - 1:00 PM)</Text>
          </View>
        )}

        {/* ─── QUEUE LIST ─────────────────────────────────────────────── */}
        <View style={styles.listWrapper}>
          {!isBreak && queue.length > 0 ? (
            queue.map((item) => <QueueItem key={item.id} item={item} />)
          ) : isBreak ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={wp(12)} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Break Time</Text>
              <Text style={styles.emptySub}>Consultation will resume at 1:00 PM</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={wp(12)} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Patients</Text>
              <Text style={styles.emptySub}>Queue is empty</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  scrollContent: {
    paddingBottom: 20,
  },

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

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 90,
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
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

  breakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    gap: 10,
  },
  breakBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },

  listWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    marginRight: 12,
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
  queueItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  queueItemDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

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