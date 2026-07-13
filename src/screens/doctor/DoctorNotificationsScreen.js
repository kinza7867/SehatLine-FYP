// src/screens/doctor/NotificationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const NOTIFICATIONS_KEY = '@sehatline_notifications';

// ─── SAMPLE NOTIFICATIONS ──────────────────────────────────────────
const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'patient_arrived',
    title: 'Patient Arrived',
    message: 'Muhammad Ali (Token: 17) - Follow Up - Chest Pain',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    read: false,
    data: { patientId: 'p_001', token: 17 },
    priority: 'normal',
    icon: 'person-add',
  },
  {
    id: 'n2',
    type: 'patient_arrived',
    title: 'Patient Arrived',
    message: 'Ahmed Khan (Token: 18) - New Patient - Hypertension',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    data: { patientId: 'p_002', token: 18 },
    priority: 'normal',
    icon: 'person-add',
  },
  {
    id: 'n3',
    type: 'patient_arrived',
    title: 'Patient Arrived',
    message: 'Aslam Malik (Token: 19) - Follow Up - Post Surgery',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    read: true,
    data: { patientId: 'p_003', token: 19 },
    priority: 'urgent',
    icon: 'person-add',
  },
  {
    id: 'n4',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message: 'Bilal Hussain at 11:30 AM - New Patient - Palpitations',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
    data: { appointmentId: 'appt_001' },
    priority: 'normal',
    icon: 'calendar',
  },
  {
    id: 'n5',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message: 'Zainab Bibi at 12:00 PM - Follow Up - Diabetes',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    read: true,
    data: { appointmentId: 'appt_002' },
    priority: 'normal',
    icon: 'calendar',
  },
  {
    id: 'n6',
    type: 'admin_update',
    title: 'Department Meeting',
    message: 'Cardiology meeting at 2:00 PM, Conference Room B',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: false,
    data: { updateId: 'admin_001' },
    priority: 'normal',
    icon: 'business',
  },
  {
    id: 'n7',
    type: 'admin_update',
    title: 'System Maintenance',
    message: 'EMR system maintenance tonight 10:00 PM – 2:00 AM',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    read: true,
    data: { updateId: 'admin_002' },
    priority: 'normal',
    icon: 'business',
  },
  {
    id: 'n8',
    type: 'emergency',
    title: 'Emergency Patient',
    message: 'Emergency patient requires immediate attention!',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    read: false,
    data: { patientId: 'p_emergency' },
    priority: 'high',
    icon: 'warning',
  },
];

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filterOptions = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'patient_arrived', label: 'New Patients', icon: 'person-add-outline' },
    { id: 'appointment_reminder', label: 'Appointments', icon: 'calendar-outline' },
    { id: 'admin_update', label: 'Admin Updates', icon: 'business-outline' },
    { id: 'emergency', label: 'Emergency', icon: 'warning-outline' },
    { id: 'unread', label: 'Unread', icon: 'mail-unread-outline' },
  ];

  // ─── LOAD NOTIFICATIONS ──────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      let allNotifications = [];
      
      if (stored) {
        try {
          allNotifications = JSON.parse(stored);
          if (!Array.isArray(allNotifications)) {
            allNotifications = [];
          }
        } catch (e) {
          allNotifications = [];
        }
      }
      
      // If no stored notifications or empty array, use sample data
      if (!allNotifications || allNotifications.length === 0) {
        allNotifications = [...SAMPLE_NOTIFICATIONS];
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
      }
      
      // Ensure sort works - check if allNotifications is an array
      if (Array.isArray(allNotifications) && allNotifications.length > 0) {
        allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else {
        allNotifications = [...SAMPLE_NOTIFICATIONS];
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
        allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      setNotifications(allNotifications);
      applyFilters(allNotifications, selectedFilter, searchQuery);
      
      const unread = allNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to sample data
      const fallbackData = [...SAMPLE_NOTIFICATIONS];
      fallbackData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(fallbackData);
      applyFilters(fallbackData, selectedFilter, searchQuery);
      setUnreadCount(fallbackData.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, searchQuery]);

  const applyFilters = (notifs, filter, query) => {
    if (!notifs || !Array.isArray(notifs)) {
      setFilteredNotifications([]);
      return;
    }
    
    let result = [...notifs];

    if (filter !== 'all') {
      if (filter === 'unread') {
        result = result.filter(n => !n.read);
      } else {
        result = result.filter(n => n.type === filter);
      }
    }

    if (query && query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) || 
        (n.message && n.message.toLowerCase().includes(q))
      );
    }

    setFilteredNotifications(result);
  };

  const markAsRead = async (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    applyFilters(updated, selectedFilter, searchQuery);
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const markAllRead = async () => {
    Alert.alert('Mark All Read', 'Mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          const updated = notifications.map(n => ({ ...n, read: true }));
          setNotifications(updated);
          await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
          applyFilters(updated, selectedFilter, searchQuery);
          setUnreadCount(0);
        },
      },
    ]);
  };

  const deleteNotification = async (id) => {
    Alert.alert('Delete', 'Delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = notifications.filter(n => n.id !== id);
          setNotifications(updated);
          await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
          applyFilters(updated, selectedFilter, searchQuery);
          setUnreadCount(updated.filter(n => !n.read).length);
        },
      },
    ]);
  };

  const handleNotificationPress = (notif) => {
    if (!notif.read) markAsRead(notif.id);

    switch (notif.type) {
      case 'patient_arrived':
      case 'emergency':
        if (notif.data?.patientId) {
          navigation.navigate('TodayQueue');
        }
        break;
      case 'appointment_reminder':
        navigation.navigate('DoctorSchedule');
        break;
      case 'admin_update':
        navigation.navigate('DoctorNotifications');
        break;
      default:
        break;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'patient_arrived': return 'person-add';
      case 'appointment_reminder': return 'calendar';
      case 'admin_update': return 'business';
      case 'emergency': return 'warning';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return COLORS.danger;
    switch (type) {
      case 'patient_arrived': return COLORS.primary;
      case 'appointment_reminder': return COLORS.warning;
      case 'admin_update': return COLORS.info;
      case 'emergency': return COLORS.danger;
      default: return COLORS.primary;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'patient_arrived': return 'Patient';
      case 'appointment_reminder': return 'Appointment';
      case 'admin_update': return 'Admin';
      case 'emergency': return 'Emergency';
      default: return 'General';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const renderNotification = ({ item }) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type, item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.notifCard,
          !item.read && styles.unreadCard,
          item.priority === 'high' && styles.highPriorityCard,
          SHADOWS.small,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={iconName} size={wp(5)} color={iconColor} />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !item.read && styles.unreadTitle]}>
              {item.title || 'Notification'}
            </Text>
            <Text style={styles.time}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message || 'No message'}</Text>
          <View style={styles.footerRow}>
            <View style={[styles.typeBadge, { backgroundColor: iconColor + '15' }]}>
              <Text style={[styles.typeText, { color: iconColor }]}>
                {getTypeLabel(item.type)}
              </Text>
            </View>
            {item.priority === 'high' && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>Urgent</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={wp(4)} color={COLORS.textLight} />
        </TouchableOpacity>

        {!item.read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    loadNotifications();
  }, []);

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
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllBtn}
              onPress={markAllRead}
              activeOpacity={0.7}
            >
              <Text style={styles.markAllText}>Mark All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── SEARCH & FILTER ──────────────────────────────────────────── */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={wp(4.5)} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notifications..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                applyFilters(notifications, selectedFilter, text);
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                applyFilters(notifications, selectedFilter, '');
              }}>
                <Ionicons name="close-circle" size={wp(4.5)} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.filterGradient}
            >
              <Ionicons name="filter" size={wp(4.5)} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── NOTIFICATIONS LIST ───────────────────────────────────────── */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={wp(20)} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up!</Text>
            </View>
          }
        />

        {/* ─── FILTER MODAL ────────────────────────────────────────────── */}
        <Modal visible={showFilterModal} transparent animationType="slide">
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          >
            <View style={styles.filterModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={wp(5)} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.filterOptions}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      selectedFilter === option.id && styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedFilter(option.id);
                      applyFilters(notifications, option.id, searchQuery);
                      setShowFilterModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.filterIconWrap,
                      selectedFilter === option.id && { backgroundColor: COLORS.primary + '15' }
                    ]}>
                      <Ionicons 
                        name={option.icon} 
                        size={wp(4.5)} 
                        color={selectedFilter === option.id ? COLORS.primary : COLORS.textSecondary} 
                      />
                    </View>
                    <Text style={[
                      styles.filterOptionText,
                      selectedFilter === option.id && styles.filterOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                    {selectedFilter === option.id && (
                      <Ionicons name="checkmark" size={wp(4)} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.clearFilterBtn}
                onPress={() => {
                  setSelectedFilter('all');
                  applyFilters(notifications, 'all', searchQuery);
                  setShowFilterModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  safeArea: { 
    flex: 1 
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
    alignItems: 'center' 
  },
  headerCenter: { 
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: wp(2) 
  },
  headerLogo: { 
    width: wp(10), 
    height: wp(10), 
    resizeMode: 'contain' 
  },
  headerTitle: { 
    fontSize: wp(4.8), 
    fontWeight: '700', 
    color: COLORS.text 
  },
  markAllBtn: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: wp(3),
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  // ── Search Bar ────────────────────────────────────────────────────
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    marginRight: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? hp(1) : hp(0.5),
    marginLeft: wp(2),
    fontSize: wp(3.2),
    color: COLORS.text,
  },
  filterBtn: {
    borderRadius: wp(3),
    overflow: 'hidden',
  },
  filterGradient: {
    width: wp(11),
    height: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Notification Cards ──────────────────────────────────────────
  listContainer: {
    padding: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(10),
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    marginBottom: hp(1.2),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: COLORS.primary + '04',
    borderColor: COLORS.primary + '20',
  },
  highPriorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  iconContainer: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  content: { 
    flex: 1 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: wp(3.4),
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginRight: wp(2),
  },
  unreadTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  time: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
  },
  message: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.3),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(0.5),
  },
  typeBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  typeText: {
    fontSize: wp(2.2),
    fontWeight: '600',
  },
  priorityBadge: {
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  priorityText: {
    fontSize: wp(2.2),
    fontWeight: '700',
    color: COLORS.danger,
  },
  deleteBtn: {
    padding: wp(1.5),
    marginLeft: wp(1),
  },
  unreadIndicator: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(15),
    paddingHorizontal: wp(4),
  },
  emptyTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(2),
  },
  emptySubtitle: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
    marginTop: hp(0.5),
    textAlign: 'center',
  },

  // ── Filter Modal ─────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    padding: wp(4),
    paddingBottom: hp(3),
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  filterOptions: {
    marginBottom: hp(2),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    borderRadius: wp(2.5),
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary + '08',
  },
  filterIconWrap: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
  },
  filterOptionText: {
    flex: 1,
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  clearFilterBtn: {
    alignItems: 'center',
    paddingVertical: hp(1.2),
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
  },
  clearFilterText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default NotificationScreen;