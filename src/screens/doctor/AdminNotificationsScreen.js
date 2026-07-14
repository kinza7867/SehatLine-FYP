// src/screens/doctor/AdminNotificationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const ADMIN_NOTIFICATIONS_KEY = '@sehatline_admin_notifications';

// ─── Mock Data ──────────────────────────────────────────────────────
const MOCK_ADMIN_NOTIFICATIONS = [
  {
    id: 'adm_001',
    title: 'Department Meeting',
    message: 'Cardiology department meeting today at 2:00 PM in Conference Room B.',
    date: '15 Jul 2026',
    time: '2:00 PM',
    isRead: false,
    sender: 'Hospital Administration',
    icon: 'calendar-outline',
  },
  {
    id: 'adm_002',
    title: 'OPD Schedule Change',
    message: 'OPD timings changed to 8:30 AM - 2:00 PM effective from next week.',
    date: '14 Jul 2026',
    time: '4:15 PM',
    isRead: false,
    sender: 'OPD Management',
    icon: 'time-outline',
  },
  {
    id: 'adm_003',
    title: 'EMR System Maintenance',
    message: 'System update tonight 10:00 PM to 2:00 AM. Please save your work.',
    date: '14 Jul 2026',
    time: '2:00 PM',
    isRead: true,
    sender: 'IT Department',
    icon: 'construct-outline',
  },
  {
    id: 'adm_004',
    title: 'Duty Roster Change',
    message: 'Weekend duty roster updated. Check new schedule on portal.',
    date: '13 Jul 2026',
    time: '11:00 AM',
    isRead: true,
    sender: 'HR Department',
    icon: 'people-outline',
  },
  {
    id: 'adm_005',
    title: 'Hospital Circular',
    message: 'Submit monthly reports by 20th of each month.',
    date: '12 Jul 2026',
    time: '9:00 AM',
    isRead: true,
    sender: 'Hospital Administration',
    icon: 'document-text-outline',
  },
];

// ─── Detail Modal ──────────────────────────────────────────────────────
const NotificationDetailModal = ({ visible, notification, onClose }) => {
  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, SHADOWS.large]}>
          {/* Header */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={wp(5)} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notification</Text>
            <View style={styles.modalClosePlaceholder} />
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name={notification.icon || 'notifications-outline'} size={wp(10)} color={COLORS.primary} />
            </View>

            <Text style={styles.modalTitleText}>{notification.title}</Text>

            <View style={styles.modalMetaRow}>
              <Text style={styles.modalMetaText}>{notification.date}</Text>
              <View style={styles.modalMetaDot} />
              <Text style={styles.modalMetaText}>{notification.time}</Text>
              <View style={styles.modalMetaDot} />
              <Text style={styles.modalMetaText}>{notification.sender}</Text>
            </View>

            <View style={styles.modalDivider} />

            <Text style={styles.modalMessage}>{notification.message}</Text>

            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.modalCloseGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────
const AdminNotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filters = ['All', 'Meeting', 'Emergency', 'Circular', 'Duty'];

  // ─── Load Notifications ────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(ADMIN_NOTIFICATIONS_KEY);
      if (data) {
        setNotifications(JSON.parse(data));
      } else {
        setNotifications(MOCK_ADMIN_NOTIFICATIONS);
        await AsyncStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(MOCK_ADMIN_NOTIFICATIONS));
      }
    } catch (error) {
      console.error('Error loading admin notifications:', error);
      setNotifications(MOCK_ADMIN_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  // ─── Mark as Read ──────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    const updated = notifications.map(item =>
      item.id === id ? { ...item, isRead: true } : item
    );
    setNotifications(updated);
    await AsyncStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(updated));
  }, [notifications]);

  // ─── Handle Notification Press ────────────────────────────────────
  const handleNotificationPress = (item) => {
    if (!item.isRead) markAsRead(item.id);
    setSelectedNotification(item);
    setShowDetailModal(true);
  };

  // ─── Get Filtered Notifications ────────────────────────────────────
  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    if (selectedFilter !== 'All') {
      filtered = filtered.filter(item => {
        const category = item.title.toLowerCase();
        return category.includes(selectedFilter.toLowerCase());
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB - dateA;
    });
  };

  // ─── Render Notification Card ──────────────────────────────────────
  const renderNotificationCard = ({ item }) => {
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.iconCircle, isUnread && styles.iconCircleUnread]}>
            <Ionicons name={item.icon || 'notifications-outline'} size={wp(4.5)} color={isUnread ? COLORS.white : COLORS.primary} />
          </View>
        </View>

        <View style={styles.cardCenter}>
          <View style={styles.titleRow}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationSubtitle} numberOfLines={1}>
            {item.message}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Ionicons name="chevron-forward" size={wp(3)} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Loading State ──────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          <TouchableOpacity style={styles.markAllBtn} onPress={() => {
            Alert.alert('Mark All Read', 'Mark all as read?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Mark All',
                onPress: async () => {
                  const updated = notifications.map(item => ({ ...item, isRead: true }));
                  setNotifications(updated);
                  await AsyncStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(updated));
                }
              }
            ]);
          }}>
            <Ionicons name="checkmark-done-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── FILTER CHIPS ──────────────────────────────────────────── */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── LIST ───────────────────────────────────────────────────── */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={wp(12)} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>No admin announcements</Text>
            </View>
          }
        />
      </SafeAreaView>

      {/* ─── DETAIL MODAL ───────────────────────────────────────────── */}
      <NotificationDetailModal
        visible={showDetailModal}
        notification={selectedNotification}
        onClose={() => setShowDetailModal(false)}
      />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════
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
  backBtn: {
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
  markAllBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Filters ──────────────────────────────────────────────────────
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
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // ─── List ─────────────────────────────────────────────────────────
  listContent: {
    padding: wp(3),
    paddingBottom: hp(2),
  },

  // ─── Notification Card ────────────────────────────────────────────
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    marginBottom: hp(1),
    padding: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    backgroundColor: COLORS.primary + '03',
    borderColor: COLORS.primary + '20',
  },
  cardLeft: {
    marginRight: wp(2.5),
  },
  iconCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleUnread: {
    backgroundColor: COLORS.primary,
  },
  cardCenter: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  notificationTitle: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  unreadDot: {
    width: wp(1.8),
    height: wp(1.8),
    borderRadius: wp(0.9),
    backgroundColor: COLORS.primary,
  },
  notificationSubtitle: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: hp(0.2),
  },
  timeText: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
  },

  // ─── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginTop: hp(10),
    paddingHorizontal: wp(4),
  },
  emptyTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: hp(1),
  },
  emptySub: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
    marginTop: hp(0.3),
    textAlign: 'center',
  },

  // ─── Modal ────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
  },
  modalContainer: {
    width: width * 0.92,
    maxHeight: height * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  modalCloseBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.white,
  },
  modalClosePlaceholder: {
    width: wp(9),
  },
  modalBody: {
    padding: wp(4),
  },
  modalIconWrapper: {
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  modalTitleText: {
    fontSize: wp(5),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: hp(0.5),
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(1.5),
    marginBottom: hp(1.5),
  },
  modalMetaText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  modalMetaDot: {
    width: wp(1),
    height: wp(1),
    borderRadius: wp(0.5),
    backgroundColor: COLORS.textLight,
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: hp(1.5),
  },
  modalMessage: {
    fontSize: wp(3.5),
    color: COLORS.text,
    lineHeight: wp(5.5),
    textAlign: 'left',
    marginBottom: hp(2),
  },
  modalCloseButton: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
    marginTop: hp(0.5),
  },
  modalCloseGradient: {
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default AdminNotificationsScreen;