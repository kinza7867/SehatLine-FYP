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
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const ADMIN_NOTIFICATIONS_KEY = '@sehatline_admin_notifications';

// ─── Mock Data ──────────────────────────────────────────────────────
const MOCK_ADMIN_NOTIFICATIONS = [
  {
    id: 'adm_001',
    title: 'Department Meeting',
    message: 'Cardiology department meeting today at 2:00 PM in Conference Room B. All doctors must attend.',
    date: '2026-07-15',
    time: '2:00 PM',
    isRead: false,
    sender: 'Hospital Administration',
    icon: 'people-outline',
    category: 'Meeting',
  },
  {
    id: 'adm_002',
    title: 'OPD Schedule Change',
    message: 'OPD timings changed to 8:30 AM - 2:00 PM effective from next week.',
    date: '2026-07-14',
    time: '4:15 PM',
    isRead: false,
    sender: 'OPD Management',
    icon: 'time-outline',
    category: 'Circular',
  },
  {
    id: 'adm_003',
    title: 'EMR System Maintenance',
    message: 'System update tonight 10:00 PM to 2:00 AM. Please save your work.',
    date: '2026-07-14',
    time: '2:00 PM',
    isRead: true,
    sender: 'IT Department',
    icon: 'construct-outline',
    category: 'Emergency',
  },
  {
    id: 'adm_004',
    title: 'Duty Roster Update',
    message: 'Weekend duty roster updated. Check new schedule on portal.',
    date: '2026-07-13',
    time: '11:00 AM',
    isRead: true,
    sender: 'HR Department',
    icon: 'briefcase-outline',
    category: 'Duty',
  },
  {
    id: 'adm_005',
    title: 'Hospital Circular',
    message: 'Submit monthly reports by 20th of each month.',
    date: '2026-07-12',
    time: '9:00 AM',
    isRead: true,
    sender: 'Hospital Administration',
    icon: 'document-text-outline',
    category: 'Circular',
  },
];

// ─── Category Colors ──────────────────────────────────────────────
const CATEGORY_COLORS = {
  Meeting: { bg: '#E8F5E9', text: '#2E7D32', icon: 'people-outline' },
  Emergency: { bg: '#FFEBEE', text: '#C62828', icon: 'alert-circle-outline' },
  Circular: { bg: '#E3F2FD', text: '#1565C0', icon: 'document-text-outline' },
  Duty: { bg: '#FFF3E0', text: '#E65100', icon: 'briefcase-outline' },
  Default: { bg: '#F5F5F5', text: '#616161', icon: 'notifications-outline' },
};

// ─── Detail Modal ──────────────────────────────────────────────────
const NotificationDetailModal = ({ visible, notification, onClose }) => {
  if (!notification) return null;

  const categoryColors = CATEGORY_COLORS[notification.category] || CATEGORY_COLORS.Default;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
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
              <View style={[styles.modalIconCircle, { backgroundColor: categoryColors.bg }]}>
                <Ionicons 
                  name={notification.icon || 'notifications-outline'} 
                  size={wp(8)} 
                  color={categoryColors.text} 
                />
              </View>
            </View>

            <Text style={styles.modalTitleText}>{notification.title}</Text>

            <View style={styles.modalMetaRow}>
              <View style={styles.modalMetaItem}>
                <Ionicons name="calendar-outline" size={wp(3)} color={COLORS.textLight} />
                <Text style={styles.modalMetaText}>{notification.date}</Text>
              </View>
              <View style={styles.modalMetaDot} />
              <View style={styles.modalMetaItem}>
                <Ionicons name="time-outline" size={wp(3)} color={COLORS.textLight} />
                <Text style={styles.modalMetaText}>{notification.time}</Text>
              </View>
              <View style={styles.modalMetaDot} />
              <View style={styles.modalMetaItem}>
                <Ionicons name="person-outline" size={wp(3)} color={COLORS.textLight} />
                <Text style={styles.modalMetaText}>{notification.sender}</Text>
              </View>
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
                <Text style={styles.modalCloseButtonText}>Got It</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────
const AdminNotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filters = ['All', 'Meeting', 'Emergency', 'Circular', 'Duty'];

  // ─── Load Notifications ──────────────────────────────────────────
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

  // ─── Mark All Read ─────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const updated = notifications.map(item => ({ ...item, isRead: true }));
    setNotifications(updated);
    await AsyncStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(updated));
  }, [notifications]);

  // ─── Handle Notification Press ──────────────────────────────────
  const handleNotificationPress = (item) => {
    if (!item.isRead) markAsRead(item.id);
    setSelectedNotification(item);
    setShowDetailModal(true);
  };

  // ─── Get Filtered Notifications ──────────────────────────────────
  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    if (selectedFilter !== 'All') {
      filtered = filtered.filter(item => 
        item.category === selectedFilter
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateB - dateA;
    });
  };

  // ─── Format Date Display ──────────────────────────────────────────
  const formatDateDisplay = (dateStr) => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (dateStr === todayStr) return 'Today';
      if (dateStr === yesterdayStr) return 'Yesterday';
      
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return dateStr;
      
      return date.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // ─── Render Notification Card ──────────────────────────────────
  const renderNotificationCard = ({ item }) => {
    const isUnread = !item.isRead;
    const categoryColors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Default;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isUnread && styles.unreadCard,
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.iconCircle, { backgroundColor: categoryColors.bg }]}>
            <Ionicons 
              name={item.icon || 'notifications-outline'} 
              size={wp(4.5)} 
              color={categoryColors.text} 
            />
          </View>
        </View>

        <View style={styles.cardCenter}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, isUnread && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.cardFooter}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColors.bg }]}>
              <Text style={[styles.categoryText, { color: categoryColors.text }]}>
                {item.category || 'General'}
              </Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
            <Text style={styles.dateText}>{formatDateDisplay(item.date)}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Ionicons name="chevron-forward" size={wp(3)} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Loading State ────────────────────────────────────────────────
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ───────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.logoCircle}>
              <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            </View>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          <TouchableOpacity style={styles.markAllBtn} onPress={() => {
            Alert.alert(
              'Mark All Read',
              'Mark all notifications as read?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Mark All', onPress: markAllRead }
              ]
            );
          }}>
            <Ionicons name="checkmark-done-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── FILTER CHIPS ────────────────────────────────────────── */}
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
                {selectedFilter === filter && (
                  <View style={styles.filterActiveDot} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── LIST ─────────────────────────────────────────────────── */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="notifications-outline" size={wp(12)} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>No admin announcements available</Text>
            </View>
          }
        />
      </SafeAreaView>

      {/* ─── DETAIL MODAL ─────────────────────────────────────────── */}
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
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  // ── Header ──────────────────────────────────────────────────────
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
  backBtn: {
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
  markAllBtn: {
    width: wp(8),
    height: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  // ── Filters ────────────────────────────────────────────────────
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: hp(0.8),
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
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
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

  // ─── List ──────────────────────────────────────────────────────
  listContent: {
    padding: wp(3),
    paddingBottom: hp(2),
  },

  // ─── Notification Card ────────────────────────────────────────
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(0.8),
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  unreadCard: {
    backgroundColor: '#F0F7FF',
    borderColor: COLORS.primary + '30',
  },
  cardLeft: {
    marginRight: wp(2.5),
  },
  iconCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: wp(1.8),
    height: wp(1.8),
    borderRadius: wp(0.9),
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
    lineHeight: wp(3.8),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginTop: hp(0.3),
  },
  categoryBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.15),
    borderRadius: wp(2),
  },
  categoryText: {
    fontSize: wp(2.2),
    fontWeight: '600',
  },
  timeText: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
  },
  dateText: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  cardRight: {
    marginLeft: wp(1.5),
  },

  // ─── Empty State ──────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginTop: hp(10),
    paddingHorizontal: wp(4),
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
  emptyTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(0.5),
  },
  emptySub: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
    marginTop: hp(0.2),
    textAlign: 'center',
  },

  // ─── Modal ──────────────────────────────────────────────────────
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
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
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
  modalIconCircle: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    justifyContent: 'center',
    alignItems: 'center',
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
    flexWrap: 'wrap',
    gap: wp(1),
    marginBottom: hp(1.5),
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.8),
  },
  modalMetaText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  modalMetaDot: {
    width: wp(0.8),
    height: wp(0.8),
    borderRadius: wp(0.4),
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