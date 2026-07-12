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
const QUEUE_KEY = '@sehatline_queue';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const APPOINTMENTS_KEY = '@sehatline_appointments';

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
    { id: 'patient_arrived', label: 'Patients', icon: 'person-add-outline' },
    { id: 'pharmacy_ready', label: 'Pharmacy', icon: 'medkit-outline' },
    { id: 'appointment_reminder', label: 'Appointments', icon: 'calendar-outline' },
    { id: 'system_alert', label: 'Alerts', icon: 'alert-circle-outline' },
    { id: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
    { id: 'emergency', label: 'Emergency', icon: 'warning-outline' },
    { id: 'unread', label: 'Unread', icon: 'mail-unread-outline' },
  ];

  // Load Notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      let allNotifications = stored ? JSON.parse(stored) : [];

      if (allNotifications.length === 0) {
        allNotifications = await generateSampleNotifications();
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
      }

      allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(allNotifications);
      applyFilters(allNotifications, 'all', '');
      
      const unread = allNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate Sample Notifications
  const generateSampleNotifications = async () => {
    const now = new Date();
    const notifications = [];

    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = queueStr ? JSON.parse(queueStr) : [];

    const completedStr = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
    const completed = completedStr ? JSON.parse(completedStr) : [];

    // Patient Arrivals
    queue.slice(0, 4).forEach((patient, i) => {
      notifications.push({
        id: `notif_${Date.now()}_${i}`,
        type: 'patient_arrived',
        title: 'New Patient Arrived',
        message: `${patient.name} (Token: ${patient.token}) is waiting in queue.`,
        timestamp: new Date(now - i * 900000).toISOString(),
        read: i > 1,
        data: { patientId: patient.id, token: patient.token },
        priority: patient.priority === 'Emergency' ? 'high' : 'normal',
      });
    });

    // Pharmacy & Completed
    if (completed.length > 0) {
      notifications.push({
        id: `notif_pharmacy_${Date.now()}`,
        type: 'pharmacy_ready',
        title: 'Prescription Ready',
        message: `Prescription for ${completed[0].patientName} is ready at pharmacy.`,
        timestamp: new Date(now - 1800000).toISOString(),
        read: false,
        data: {},
      });
    }

    notifications.push({
      id: `notif_alert_${Date.now()}`,
      type: 'system_alert',
      title: 'System Update',
      message: 'New features added. Please update the app.',
      timestamp: new Date(now - 3600000).toISOString(),
      read: true,
      data: {},
    });

    return notifications;
  };

  const applyFilters = (notifs, filter, query) => {
    let result = [...notifs];

    if (filter !== 'all') {
      if (filter === 'unread') {
        result = result.filter(n => !n.read);
      } else {
        result = result.filter(n => n.type === filter);
      }
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
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

  const markAllAsRead = async () => {
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
        navigation.navigate('DoctorQueue');
        break;
      case 'pharmacy_ready':
        navigation.navigate('Pharmacy');
        break;
      case 'appointment_reminder':
        navigation.navigate('Appointments');
        break;
      case 'completed':
        navigation.navigate('CompletedPatients');
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

  // Render Notification Item
  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notifCard,
        !item.read && styles.unreadCard,
        item.priority === 'high' && styles.highPriorityCard,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.iconGradient}
        >
          <Ionicons
            name={
              item.type === 'patient_arrived' ? 'person-add' :
              item.type === 'pharmacy_ready' ? 'medkit' :
              item.type === 'emergency' ? 'warning' : 'notifications'
            }
            size={wp(5)}
            color={COLORS.white}
          />
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
      >
        <Ionicons name="trash-outline" size={wp(4)} color={COLORS.textLight} />
      </TouchableOpacity>

      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const formatTimeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search & Filter */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              applyFilters(notifications, selectedFilter, text);
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={wp(20)} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.modalTitle}>Filter</Text>
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
              >
                <Ionicons name={option.icon} size={24} color={selectedFilter === option.id ? COLORS.primary : COLORS.text} />
                <Text style={styles.filterOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : hp(1),
    paddingBottom: hp(2),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    gap: wp(3),
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(5),
    fontWeight: '700',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: wp(2.8), fontWeight: 'bold' },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    marginRight: wp(3),
  },
  searchInput: {
    flex: 1,
    paddingVertical: hp(1),
    marginLeft: wp(2),
    fontSize: wp(3.4),
    color: COLORS.text,
  },
  filterBtn: {
    padding: wp(2),
  },

  listContainer: {
    padding: wp(4),
    paddingTop: hp(1),
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    marginBottom: hp(1.5),
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  unreadCard: {
    borderLeftColor: COLORS.success,
    backgroundColor: COLORS.primary + '05',
  },
  highPriorityCard: {
    borderLeftColor: COLORS.danger,
  },
  iconContainer: {
    marginRight: wp(3),
  },
  iconGradient: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: wp(3.6),
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  time: {
    fontSize: wp(2.5),
    color: COLORS.textLight,
    marginLeft: wp(2),
  },
  message: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
  },
  deleteBtn: {
    padding: wp(1),
  },
  unreadIndicator: {
    position: 'absolute',
    top: hp(1.5),
    right: wp(3),
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(15),
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
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    padding: wp(4),
    maxHeight: height * 0.6,
  },
  modalTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(2),
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(2.5),
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary + '10',
  },
  filterOptionText: {
    fontSize: wp(3.5),
    marginLeft: wp(3),
    color: COLORS.text,
  },
});

export default NotificationScreen;