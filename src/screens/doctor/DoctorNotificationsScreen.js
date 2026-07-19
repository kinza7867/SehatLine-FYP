// src/screens/doctor/DoctorNotificationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  RefreshControl,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ── Storage Keys ──────────────────────────────────────────────────────
const NOTIFICATIONS_KEY = '@sehatline_notifications';
const ADMIN_NOTIFICATIONS_KEY = '@sehatline_admin_notifications';

// ─── SAMPLE NOTIFICATIONS ──────────────────────────────────────────
const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'patient_arrived',
    title: 'Patient Arrived',
    message: 'Muhammad Ali (Token: 17) - Follow Up - Chest Pain',
    timestamp: new Date().toISOString(),
    read: false,
    data: { patientId: 'p_001', token: 17 },
    priority: 'normal',
    icon: 'person-add',
    category: 'Patient',
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
    category: 'Patient',
  },
  {
    id: 'n3',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message: 'Bilal Hussain at 11:30 AM - New Patient - Palpitations',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
    data: { appointmentId: 'appt_001' },
    priority: 'normal',
    icon: 'calendar',
    category: 'Appointment',
  },
  {
    id: 'n4',
    type: 'admin_update',
    title: 'Department Meeting',
    message: 'Cardiology meeting at 2:00 PM, Conference Room B',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: false,
    data: { updateId: 'admin_001' },
    priority: 'normal',
    icon: 'business',
    category: 'Admin',
  },
  {
    id: 'n5',
    type: 'admin_update',
    title: 'EMR System Maintenance',
    message: 'System update tonight 10:00 PM to 2:00 AM',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    read: true,
    data: { updateId: 'admin_002' },
    priority: 'normal',
    icon: 'construct',
    category: 'Admin',
  },
  {
    id: 'n6',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message: 'Zainab Bibi at 12:00 PM - Follow Up - Diabetes',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    read: true,
    data: { appointmentId: 'appt_002' },
    priority: 'normal',
    icon: 'calendar',
    category: 'Appointment',
  },
];

// ─── CATEGORY COLORS ──────────────────────────────────────────────
const CATEGORY_COLORS = {
  Patient: { bg: '#E3F2FD', text: '#1565C0' },
  Appointment: { bg: '#E8F5E9', text: '#2E7D32' },
  Admin: { bg: '#FFF3E0', text: '#E65100' },
  Default: { bg: '#F5F5F5', text: '#616161' },
};

const DoctorNotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filters = ['All', 'Patient', 'Appointment', 'Admin', 'Unread'];

  // ─── SAFE DATE PARSING ──────────────────────────────────────────
  const safeParseDate = (timestamp) => {
    if (!timestamp) return new Date();
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date();
      }
      // Check if date is out of bounds (year > 9999 or < 1)
      const year = date.getFullYear();
      if (year > 9999 || year < 1) {
        return new Date();
      }
      return date;
    } catch (e) {
      return new Date();
    }
  };

  // ─── LOAD NOTIFICATIONS ──────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const [storedDoctor, storedAdmin] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
        AsyncStorage.getItem(ADMIN_NOTIFICATIONS_KEY),
      ]);

      let doctorNotifs = [];
      let adminNotifs = [];

      if (storedDoctor) {
        try {
          const parsed = JSON.parse(storedDoctor);
          if (Array.isArray(parsed)) {
            // Filter out emergency notifications
            doctorNotifs = parsed.filter(n => n.type !== 'emergency');
          }
        } catch (e) {
          doctorNotifs = [];
        }
      }

      if (storedAdmin) {
        try {
          const parsed = JSON.parse(storedAdmin);
          if (Array.isArray(parsed)) {
            adminNotifs = parsed;
          }
        } catch (e) {
          adminNotifs = [];
        }
      }

      // If no stored notifications, use samples
      if (doctorNotifs.length === 0 && adminNotifs.length === 0) {
        const allSamples = SAMPLE_NOTIFICATIONS.map(n => ({
          ...n,
          id: n.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          timestamp: n.timestamp || new Date().toISOString(),
        }));
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allSamples));
        doctorNotifs = allSamples;
      }

      // Merge notifications
      let allNotifications = [];

      doctorNotifs.forEach(n => {
        const validTimestamp = n.timestamp || new Date().toISOString();
        allNotifications.push({
          ...n,
          category: n.category || getCategoryFromType(n.type),
          source: 'doctor',
          timestamp: validTimestamp,
        });
      });

      adminNotifs.forEach(n => {
        let timestamp = n.timestamp || new Date().toISOString();
        // If admin notification has date and time separately
        if (n.date && n.time && !n.timestamp) {
          try {
            const dateStr = n.date + 'T' + n.time;
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              timestamp = parsedDate.toISOString();
            }
          } catch (e) {
            timestamp = new Date().toISOString();
          }
        }
        allNotifications.push({
          ...n,
          category: n.category || 'Admin',
          icon: n.icon || 'business-outline',
          type: 'admin_update',
          read: n.isRead || false,
          timestamp: timestamp,
          source: 'admin',
        });
      });

      // Remove any emergency notifications
      allNotifications = allNotifications.filter(
        n => n.type !== 'emergency' && n.category !== 'Emergency'
      );

      // Sort by timestamp (newest first) - with safe parsing
      allNotifications.sort((a, b) => {
        const dateA = safeParseDate(a.timestamp);
        const dateB = safeParseDate(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });

      setNotifications(allNotifications);
      applyFilters(allNotifications, selectedFilter, searchQuery);

      const unread = allNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to sample data
      const fallbackData = SAMPLE_NOTIFICATIONS.map(n => ({
        ...n,
        id: n.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        category: n.category || getCategoryFromType(n.type),
        source: 'doctor',
        timestamp: n.timestamp || new Date().toISOString(),
      }));
      setNotifications(fallbackData);
      applyFilters(fallbackData, selectedFilter, searchQuery);
      setUnreadCount(fallbackData.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, searchQuery]);

  const getCategoryFromType = (type) => {
    switch (type) {
      case 'patient_arrived': return 'Patient';
      case 'appointment_reminder': return 'Appointment';
      case 'admin_update': return 'Admin';
      default: return 'Default';
    }
  };

  const applyFilters = (notifs, filter, query) => {
    if (!notifs || !Array.isArray(notifs)) {
      setFilteredNotifications([]);
      return;
    }

    let result = [...notifs];

    if (filter !== 'All') {
      if (filter === 'Unread') {
        result = result.filter(n => !n.read);
      } else {
        result = result.filter(n => n.category === filter);
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

  // ─── MARK AS READ ──────────────────────────────────────────────────
  const markAsRead = async (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await saveNotifications(updated);
    applyFilters(updated, selectedFilter, searchQuery);
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const saveNotifications = async (allNotifs) => {
    try {
      const doctorNotifs = allNotifs.filter(n => n.source === 'doctor');
      const adminNotifs = allNotifs.filter(n => n.source === 'admin');

      if (doctorNotifs.length > 0) {
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(doctorNotifs));
      }
      if (adminNotifs.length > 0) {
        await AsyncStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(adminNotifs));
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const markAllRead = async () => {
    Alert.alert('Mark All Read', 'Mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          const updated = notifications.map(n => ({ ...n, read: true }));
          setNotifications(updated);
          await saveNotifications(updated);
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
          await saveNotifications(updated);
          applyFilters(updated, selectedFilter, searchQuery);
          setUnreadCount(updated.filter(n => !n.read).length);
        },
      },
    ]);
  };

  // ─── HANDLE NOTIFICATION PRESS ──────────────────────────────────
  const handleNotificationPress = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    setSelectedNotification(notif);
    setShowDetailModal(true);
  };

  // ─── FORMAT DATE ──────────────────────────────────────────────────
  const formatDateDisplay = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = safeParseDate(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);
      
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 172800) return 'Yesterday';
      return date.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
      });
    } catch (e) {
      return 'Just now';
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  // ─── RENDER NOTIFICATION CARD ──────────────────────────────────
  const renderNotificationCard = ({ item }) => {
    const isUnread = !item.read;
    const categoryColors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Default;
    const iconName = item.icon || 'notifications-outline';

    return (
      <TouchableOpacity
        style={[
          styles.notifCard,
          isUnread && styles.unreadCard,
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: categoryColors.bg }]}>
          <Ionicons name={iconName} size={wp(4.5)} color={categoryColors.text} />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isUnread && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>{formatDateDisplay(item.timestamp)}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <View style={styles.footerRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColors.bg }]}>
              <Text style={[styles.categoryText, { color: categoryColors.text }]}>
                {item.category || 'General'}
              </Text>
            </View>
            {item.source === 'admin' && (
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={wp(3.5)} color={COLORS.textLight} />
        </TouchableOpacity>

        {isUnread && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  // ─── DETAIL MODAL ──────────────────────────────────────────────────
  const NotificationDetailModal = () => {
    if (!selectedNotification) return null;

    const categoryColors = CATEGORY_COLORS[selectedNotification.category] || CATEGORY_COLORS.Default;
    const iconName = selectedNotification.icon || 'notifications-outline';

    return (
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDetailModal(false)}
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={wp(5)} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notification</Text>
              <View style={styles.modalClosePlaceholder} />
            </LinearGradient>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalIconWrapper}>
                <View style={[styles.modalIconCircle, { backgroundColor: categoryColors.bg }]}>
                  <Ionicons name={iconName} size={wp(8)} color={categoryColors.text} />
                </View>
              </View>

              <Text style={styles.modalTitleText}>{selectedNotification.title}</Text>

              <View style={styles.modalMetaRow}>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="time-outline" size={wp(3)} color={COLORS.textLight} />
                  <Text style={styles.modalMetaText}>{formatDateDisplay(selectedNotification.timestamp)}</Text>
                </View>
                {selectedNotification.category && (
                  <>
                    <View style={styles.modalMetaDot} />
                    <View style={[styles.modalMetaItem, { backgroundColor: categoryColors.bg, paddingHorizontal: wp(2), paddingVertical: hp(0.2), borderRadius: wp(2) }]}>
                      <Text style={[styles.modalMetaText, { color: categoryColors.text, fontWeight: '600' }]}>
                        {selectedNotification.category}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>

              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowDetailModal(false)}>
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
        </TouchableOpacity>
      </Modal>
    );
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />

      {/* ─── HEADER ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={25} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.brandWrap}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../../../assets/logoo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <Text style={styles.screenTitle}>
            SEHAT<Text style={styles.brandAccent}>LINE</Text>
          </Text>
          <Text style={styles.tagline}>Notifications</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.iconBtn} onPress={markAllRead} activeOpacity={0.6}>
            <View style={styles.markAllBadge}>
              <Text style={styles.markAllText}>{unreadCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── SEARCH & FILTER ──────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={wp(4)} color={COLORS.textLight} />
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
              <Ionicons name="close-circle" size={wp(4)} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── FILTER CHIPS ────────────────────────────────────────────── */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
              onPress={() => {
                setSelectedFilter(filter);
                applyFilters(notifications, filter, searchQuery);
              }}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ─── NOTIFICATIONS LIST ───────────────────────────────────────── */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationCard}
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
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={wp(12)} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        }
      />

      {/* ─── DETAIL MODAL ────────────────────────────────────────────── */}
      <NotificationDetailModal />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ── Header ──────────────────────────────────────────────────────
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
  screenTitle: {
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
  markAllBadge: {
    backgroundColor: COLORS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Search Bar ────────────────────────────────────────────────────
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F4F7FC',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  // ── Filters ────────────────────────────────────────────────────
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F4F7FC',
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // ── Notification Cards ──────────────────────────────────────────
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEF4',
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: '#F0F7FF',
    borderColor: COLORS.primary + '30',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sourceBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginTop: hp(10),
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },

  // ─── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: width * 0.92,
    maxHeight: height * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalClosePlaceholder: {
    width: 36,
  },
  modalBody: {
    padding: 20,
  },
  modalIconWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textLight,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E8EEF4',
    marginVertical: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalCloseButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalCloseGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});

export default DoctorNotificationScreen;