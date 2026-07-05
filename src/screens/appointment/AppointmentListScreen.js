import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  Platform,
  Share,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ─── Department config ────────────────────────────────────────────────────────
const DEPT_CONFIG = {
  'Chronic OPD': { color: '#2E86C1', bg: '#2E86C110', icon: 'medical-outline' },
  'Pharmacy':    { color: '#2ECC71', bg: '#2ECC7110', icon: 'medkit-outline'   },
  'Laboratory':  { color: '#F39C12', bg: '#F39C1210', icon: 'flask-outline'    },
};
const getDeptCfg = (dept) =>
  DEPT_CONFIG[dept] || { color: COLORS.primary, bg: COLORS.primary + '10', icon: 'medical-outline' };

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  'Confirmed':       { color: '#2ECC71', bg: '#2ECC7115', icon: 'checkmark-circle'      },
  'Pending':         { color: '#F39C12', bg: '#F39C1215', icon: 'time-outline'           },
  'Completed':       { color: '#3498DB', bg: '#3498DB15', icon: 'checkmark-done-circle' },
  'Patient Canceled':{ color: '#E74C3C', bg: '#E74C3C15', icon: 'close-circle'          },
  'Canceled':        { color: '#E74C3C', bg: '#E74C3C15', icon: 'close-circle'          },
};
const getStatusCfg = (s) =>
  STATUS_CFG[s] || { color: COLORS.textSecondary, bg: COLORS.border || '#E8EDF2', icon: 'ellipse-outline' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRoomForDept = (d) => ({
  'Chronic OPD': 'Room 204 - OPD Block, 2nd Floor',
  'Pharmacy':    'Pharmacy Wing - Counter 3, Ground Floor',
  'Laboratory':  'Lab 05 - Ground Floor, East Wing',
}[d] || 'Room 204 - OPD Block');

const getWaitTime = (d) => ({
  'Chronic OPD': '15-20 mins',
  'Pharmacy':    '5-10 mins',
  'Laboratory':  '20-30 mins',
}[d] || '10-15 mins');

const getDoctorForDept = (d) => ({
  'Chronic OPD': 'Dr. Sarah Ahmed',
  'Pharmacy':    'Pharmacy Staff',
  'Laboratory':  'Lab Technician',
}[d] || 'Medical Staff');

const rndQueue = () => Math.floor(Math.random() * 5) + 1;
const rndAhead = () => Math.floor(Math.random() * 5);

// ─── Date/Time parser ─────────────────────────────────────────────────────────
// Returns a proper Date object combining appointment date + time
const parseAppointmentDateTime = (item) => {
  // Best case: BookAppointmentScreen ne dateTimeISO save ki ho
  if (item.dateTimeISO) {
    return new Date(item.dateTimeISO);
  }

  // Fallback: date string + time string manually parse karo
  // date format: "Jun 28, 2026"  |  time format: "10:30 AM"
  try {
    const base = new Date(item.date); // "Jun 28, 2026" → browser parse karta hai
    if (!isNaN(base) && item.time) {
      const [timePart, meridiem] = item.time.split(' ');
      let [h, m] = timePart.split(':').map(Number);
      if (meridiem === 'PM' && h !== 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      base.setHours(h, m, 0, 0);
    }
    return base;
  } catch (_) {
    return new Date(0); // parse fail → treat as very old past
  }
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AppointmentListScreen = ({ navigation, route }) => {
  const [activeTab,       setActiveTab]       = useState('upcoming');
  const [appointments,    setAppointments]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);
  const [highlightToken,  setHighlightToken]  = useState(null);
  const [tokenModalApp,   setTokenModalApp]   = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const debugStorage = async () => {
      const raw = await AsyncStorage.getItem('appointments');
      console.log('📦 Stored appointments:', raw);
      console.log('🔍 Route params:', route?.params);
    };
    debugStorage();

    const unsubscribe = navigation.addListener('focus', () => {
      loadAllData();
    });

    if (route?.params?.refresh) {
      loadAllData();
    }

    if (route?.params?.highlightToken) {
      setHighlightToken(route.params.highlightToken);
      setTimeout(() => setHighlightToken(null), 4000);
    }

    return unsubscribe;
  }, [navigation]);

  const animateCards = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadAllData = async () => {
    setLoading(true);
    try {
      await loadAppointmentsFromStorage();
    } catch (e) {
      console.log('loadAllData error:', e);
    }
    setLoading(false);
    animateCards();
  };

  const loadAppointmentsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('appointments');
      console.log('🔄 Loading appointments from storage...');

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('✅ Appointments found:', parsed.length);

        const formatted = parsed.map((app) => ({
          id:           app.id,
          patientName:  app.patientName || 'Patient',
          department:   app.department,
          doctor:       app.departmentData?.doctor || getDoctorForDept(app.department),
          date:         app.date,
          time:         app.time,
          // ✅ dateTimeISO forward karo taake parseAppointmentDateTime use kar sake
          dateTimeISO:  app.dateTimeISO || null,
          tokenNo:      app.token,
          status:       app.status,
          visitPurpose: app.departmentData?.visitType || app.departmentData?.testType || 'Routine',
          room:         getRoomForDept(app.department),
          waitingTime:  getWaitTime(app.department),
          queuePosition:rndQueue(),
          peopleAhead:  rndAhead(),
          bookedAt:     app.bookedAt,
        }));

        console.log('📋 Formatted appointments:', formatted.length);
        setAppointments(formatted);
      } else {
        console.log('ℹ️ No appointments in storage');
        setAppointments([]);
      }
    } catch (e) {
      console.log('❌ loadAppointmentsFromStorage error:', e);
      setAppointments([]);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────────
  // Business rule: an appointment/token is Upcoming until it is explicitly
  // marked Completed (or canceled). It must NOT fall into Past just because
  // its scheduled time/date has technically passed or because it has no
  // dateTimeISO (e.g. freshly generated Pharmacy/Lab/Chronic tokens) —
  // that was causing new bookings and tokens to wrongly land in Past.
  const isUpcoming = useCallback((item) => {
    return !(
      item.status === 'Completed' ||
      item.status === 'Patient Canceled' ||
      item.status === 'Canceled'
    );
  }, []);

  const isPast = useCallback((item) => !isUpcoming(item), [isUpcoming]);

  const filteredAppointments = useMemo(
    () => appointments.filter(activeTab === 'upcoming' ? isUpcoming : isPast),
    [appointments, activeTab, isUpcoming, isPast],
  );

  const upcomingCount = useMemo(() => appointments.filter(isUpcoming).length, [appointments, isUpcoming]);
  const pastCount     = useMemo(() => appointments.filter(isPast).length,     [appointments, isPast]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleCancelAppointment = useCallback((item) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment on ${item.date}?`,
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const updated = appointments.map((a) =>
              a.id === item.id ? { ...a, status: 'Patient Canceled' } : a,
            );
            setAppointments(updated);

            try {
              const stored = await AsyncStorage.getItem('appointments');
              if (stored) {
                const parsed = JSON.parse(stored);
                const updatedRaw = parsed.map((a) =>
                  a.id === item.id ? { ...a, status: 'Patient Canceled' } : a,
                );
                await AsyncStorage.setItem('appointments', JSON.stringify(updatedRaw));
              }
            } catch (e) {
              console.log('Cancel update error:', e);
            }
            Alert.alert('Cancelled', 'Your appointment has been cancelled.');
          },
        },
      ],
    );
  }, [appointments]);

  const handleShare = useCallback(async (item) => {
    try {
      const msg =
        `🏥 CDA HOSPITAL - ${item.department}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Patient: ${item.patientName}\n` +
        `🎫 Token: ${item.tokenNo}\n` +
        `📅 Date: ${item.date}\n` +
        `⏰ Time: ${item.time}\n` +
        `📍 ${item.room}\n` +
        `👨‍⚕️ ${item.doctor}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `CDA Hospital Islamabad`;
      await Share.share({ message: msg, title: 'Appointment Token' });
    } catch (e) {
      Alert.alert('Error', 'Unable to share token');
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // ── Card ──────────────────────────────────────────────────────────────────────
  const renderCard = useCallback(({ item, index }) => {
    const deptCfg   = getDeptCfg(item.department);
    const statusCfg = getStatusCfg(item.status);
    const isNew     = item.tokenNo === highlightToken;
    const upcoming  = isUpcoming(item);

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          isNew && styles.cardWrapperNew,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [24 * (index + 1), 0],
              }),
            }],
          },
        ]}
      >
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}

        <View style={styles.card}>
          {/* ── Header ── */}
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: deptCfg.color }]}>
              <Text style={styles.avatarText}>
                {item.patientName ? item.patientName[0].toUpperCase() : 'P'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              <View style={styles.doctorRow}>
                <Ionicons name="person-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.doctorText}>{item.doctor}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Ionicons name={statusCfg.icon} size={11} color={statusCfg.color} />
              <Text style={[styles.statusText, { color: statusCfg.color }]}>{item.status}</Text>
            </View>
          </View>

          {/* ── Department badge ── */}
          <View style={[styles.deptBadge, { backgroundColor: deptCfg.bg }]}>
            <Ionicons name={deptCfg.icon} size={13} color={deptCfg.color} />
            <Text style={[styles.deptBadgeText, { color: deptCfg.color }]}>{item.department}</Text>
          </View>

          {/* ── Token + queue (upcoming only) ── */}
          {upcoming && (
            <View style={styles.tokenQueueRow}>
              <View style={styles.tokenQueueItem}>
                <Ionicons name="ticket-outline" size={14} color={COLORS.primary} />
                <Text style={styles.tokenQueueText}>Token: {item.tokenNo}</Text>
              </View>
              <View style={styles.tokenQueueItem}>
                <Ionicons name="people-outline" size={14} color={COLORS.primary} />
                <Text style={styles.tokenQueueText}>{item.peopleAhead} people ahead</Text>
              </View>
            </View>
          )}

          {/* ── Date / Time / Room ── */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.primary} />
              <Text style={styles.detailText}>{item.room}</Text>
            </View>
          </View>

          {/* ── Wait + position (upcoming only) ── */}
          {upcoming && (
            <View style={styles.waitRow}>
              <Text style={styles.waitText}>⏳ Wait: {item.waitingTime}</Text>
              <Text style={styles.waitText}>📍 Pos: #{item.queuePosition}</Text>
            </View>
          )}

          {/* ── Visit purpose ── */}
          {!!item.visitPurpose && (
            <View style={styles.purposeRow}>
              <Ionicons name="document-text-outline" size={13} color={COLORS.textSecondary} />
              <Text style={styles.purposeText} numberOfLines={2}>{item.visitPurpose}</Text>
            </View>
          )}

          {/* ── Actions ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => setTokenModalApp(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code-outline" size={14} color={COLORS.primary} />
              <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>View Token</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => handleShare(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={14} color={COLORS.textSecondary} />
              <Text style={[styles.actionBtnText, { color: COLORS.textSecondary }]}>Share</Text>
            </TouchableOpacity>

            {upcoming && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => handleCancelAppointment(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={14} color="#E74C3C" />
                <Text style={[styles.actionBtnText, { color: '#E74C3C' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  }, [highlightToken, isUpcoming, fadeAnim, handleCancelAppointment, handleShare, setTokenModalApp]);

  // ── Empty ─────────────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[COLORS.primary + '20', COLORS.secondary + '20']}
        style={styles.emptyIconWrap}
      >
        <Ionicons name="calendar-outline" size={48} color={COLORS.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {activeTab === 'upcoming' ? 'No Upcoming Appointments' : 'No Past Appointments'}
      </Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'upcoming'
          ? 'You have no scheduled appointments.'
          : 'Your past appointments will appear here.'}
      </Text>
    </View>
  );

  // ── Token Modal ───────────────────────────────────────────────────────────────
  const renderTokenModal = () => {
    if (!tokenModalApp) return null;
    const deptCfg = getDeptCfg(tokenModalApp.department);

    return (
      <Modal
        visible={!!tokenModalApp}
        transparent
        animationType="slide"
        onRequestClose={() => setTokenModalApp(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setTokenModalApp(null)}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <LinearGradient
              colors={[deptCfg.color, deptCfg.color + 'BB']}
              style={styles.modalTokenCard}
            >
              <Text style={styles.modalHospital}>{'CDA HOSPITAL\nISLAMABAD'}</Text>
              <View style={styles.modalDivider} />
              <Text style={styles.modalTokenNumber}>{tokenModalApp.tokenNo}</Text>
              <Text style={styles.modalDeptName}>{tokenModalApp.department}</Text>

              <View style={styles.modalDetailsBox}>
                {[
                  ['Patient', tokenModalApp.patientName],
                  ['Doctor',  tokenModalApp.doctor],
                  ['Date',    tokenModalApp.date],
                  ['Time',    tokenModalApp.time],
                  ['Room',    tokenModalApp.room],
                ].map(([label, value]) => (
                  <View key={label} style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>{label}:</Text>
                    <Text style={styles.modalDetailValue} numberOfLines={1}>{value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.qrBox}>
                <Ionicons name="qr-code-outline" size={60} color="rgba(255,255,255,0.9)" />
                <Text style={styles.qrHint}>Scan at hospital</Text>
              </View>
            </LinearGradient>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { borderColor: COLORS.primary }]}
                onPress={() => { setTokenModalApp(null); handleShare(tokenModalApp); }}
              >
                <Ionicons name="share-outline" size={18} color={COLORS.primary} />
                <Text style={[styles.modalActionText, { color: COLORS.primary }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                onPress={() => setTokenModalApp(null)}
              >
                <Ionicons name="download-outline" size={18} color={COLORS.white} />
                <Text style={[styles.modalActionText, { color: COLORS.white }]}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Root ──────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[COLORS.primary + '08', COLORS.background, COLORS.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline', count: upcomingCount },
          { key: 'past',     label: 'Past',     icon: 'time-outline',     count: pastCount     },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={17}
                color={active ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              <View style={[styles.tabBadge, { backgroundColor: active ? COLORS.primary : COLORS.textSecondary }]}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          filteredAppointments.length > 0 ? (
            <Text style={styles.listCount}>
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
      />

      {renderTokenModal()}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: hp(2), color: COLORS.textSecondary, fontSize: wp(3.5) },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(1) : hp(2.5),
    paddingBottom: hp(1.5),
  },
  headerBtn: {
    width: wp(10), height: wp(10), borderRadius: wp(3),
    backgroundColor: COLORS.backgroundSecondary || '#F5F6FA',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: wp(4.5), fontWeight: '700', color: COLORS.text },
  headerPlaceholder: { width: wp(10) },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: wp(4), marginBottom: hp(1.5),
    backgroundColor: COLORS.backgroundSecondary || '#F5F6FA',
    borderRadius: wp(3.5), padding: wp(0.8),
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: hp(1), borderRadius: wp(3), gap: wp(1.5),
  },
  tabActive: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  tabText: { fontSize: wp(3.5), fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  tabBadge: {
    minWidth: wp(4.5), height: wp(4.5), borderRadius: wp(2.25),
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(1),
  },
  tabBadgeText: { color: COLORS.white, fontSize: wp(2.5), fontWeight: '700' },

  listPadding: { paddingHorizontal: wp(4), paddingBottom: hp(6) },
  listCount: { fontSize: wp(3.2), color: COLORS.textSecondary, fontWeight: '500', marginBottom: hp(1) },

  cardWrapper: { marginBottom: hp(1.8) },
  cardWrapperNew: { borderRadius: wp(4), borderWidth: 2, borderColor: '#2ECC71' },

  newBadge: {
    alignSelf: 'flex-start', backgroundColor: '#2ECC71',
    paddingHorizontal: wp(2.5), paddingVertical: hp(0.25),
    borderTopLeftRadius: wp(4), borderBottomRightRadius: wp(2),
  },
  newBadgeText: { color: COLORS.white, fontSize: wp(2.5), fontWeight: '800', letterSpacing: 1 },

  card: {
    backgroundColor: COLORS.white, borderRadius: wp(4), padding: wp(4),
    borderWidth: 1, borderColor: COLORS.border || '#E8EDF2',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(3), marginBottom: hp(1) },
  avatar: { width: wp(11), height: wp(11), borderRadius: wp(5.5), justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.white, fontSize: wp(4.5), fontWeight: '700' },
  headerInfo: { flex: 1 },
  patientName: { fontSize: wp(4), fontWeight: '700', color: COLORS.text },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: wp(1), marginTop: hp(0.2) },
  doctorText: { fontSize: wp(3), color: COLORS.textSecondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: wp(1), paddingHorizontal: wp(2.5), paddingVertical: hp(0.3), borderRadius: wp(2) },
  statusText: { fontSize: wp(2.4), fontWeight: '600' },

  deptBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: wp(1.5), paddingHorizontal: wp(2.5), paddingVertical: hp(0.4),
    borderRadius: wp(2), marginBottom: hp(1),
  },
  deptBadgeText: { fontSize: wp(3), fontWeight: '600' },

  tokenQueueRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: COLORS.primary + '08', borderRadius: wp(2),
    paddingHorizontal: wp(3), paddingVertical: hp(0.7), marginBottom: hp(1),
  },
  tokenQueueItem: { flexDirection: 'row', alignItems: 'center', gap: wp(1.5) },
  tokenQueueText: { fontSize: wp(3), color: COLORS.primary, fontWeight: '600' },

  detailsBox: { gap: hp(0.5), marginBottom: hp(1) },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  detailText: { fontSize: wp(3.2), color: COLORS.text },

  waitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp(0.8) },
  waitText: { fontSize: wp(3), color: COLORS.textSecondary },

  purposeRow: {
    flexDirection: 'row', alignItems: 'center', gap: wp(1.5),
    backgroundColor: COLORS.backgroundSecondary || '#F5F6FA',
    borderRadius: wp(2), paddingHorizontal: wp(3), paddingVertical: hp(0.5), marginBottom: hp(1),
  },
  purposeText: { fontSize: wp(3), color: COLORS.textSecondary, flex: 1 },

  actionRow: { flexDirection: 'row', gap: wp(2), marginTop: hp(0.5) },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: hp(0.85), borderRadius: wp(2.5), gap: wp(1.2), borderWidth: 1,
  },
  actionBtnPrimary:   { borderColor: COLORS.primary,                 backgroundColor: COLORS.primary + '08'                  },
  actionBtnSecondary: { borderColor: COLORS.border || '#E8EDF2',     backgroundColor: COLORS.backgroundSecondary || '#F5F6FA' },
  actionBtnDanger:    { borderColor: '#E74C3C',                      backgroundColor: '#E74C3C08'                             },
  actionBtnText: { fontSize: wp(2.9), fontWeight: '600' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: hp(10) },
  emptyIconWrap:  { width: wp(22), height: wp(22), borderRadius: wp(11), justifyContent: 'center', alignItems: 'center' },
  emptyTitle:     { fontSize: wp(4.5), fontWeight: '700', color: COLORS.text, marginTop: hp(2) },
  emptySubtext:   { fontSize: wp(3.5), color: COLORS.textSecondary, marginTop: hp(0.5), textAlign: 'center', paddingHorizontal: wp(12) },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(6), borderTopRightRadius: wp(6),
    padding: wp(5), paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(3),
  },
  modalClose: { alignSelf: 'flex-end', marginBottom: hp(1), padding: wp(1) },
  modalTokenCard: { borderRadius: wp(4), padding: wp(5), alignItems: 'center', marginBottom: hp(2) },
  modalHospital: { color: COLORS.white, fontSize: wp(4.5), fontWeight: '800', textAlign: 'center', letterSpacing: 2 },
  modalDivider:  { width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.4)', marginVertical: hp(1.2) },
  modalTokenNumber: { color: COLORS.white, fontSize: wp(12), fontWeight: '900', letterSpacing: 3 },
  modalDeptName:    { color: 'rgba(255,255,255,0.85)', fontSize: wp(3.5), fontWeight: '600', marginBottom: hp(1.5) },
  modalDetailsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: wp(3), padding: wp(3), gap: hp(0.5), marginBottom: hp(1.5),
  },
  modalDetailRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  modalDetailLabel:{ color: 'rgba(255,255,255,0.7)', fontSize: wp(3), fontWeight: '500' },
  modalDetailValue:{ color: COLORS.white, fontSize: wp(3), fontWeight: '600', maxWidth: '65%', textAlign: 'right' },
  qrBox:  { alignItems: 'center', gap: hp(0.5) },
  qrHint: { color: 'rgba(255,255,255,0.7)', fontSize: wp(2.8) },
  modalActions: { flexDirection: 'row', gap: wp(3) },
  modalActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: hp(1.3), borderRadius: wp(3), gap: wp(1.5), borderWidth: 1,
  },
  modalActionText: { fontSize: wp(3.5), fontWeight: '600' },
});

export default AppointmentListScreen;