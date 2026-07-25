// src/screens/doctor/DoctorNotificationScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const hp = (p) => (height * p) / 100;

// ── Storage Keys ──────────────────────────────────────────────────────
const NOTIFICATIONS_KEY = '@sehatline_notifications';
const USER_DATA_KEY = '@sehatline_userData';
const PROFILE_IMAGE_KEY = '@sehatline_profile_image';

// ── Helper ────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'DR';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ─── GENERATE TODAY'S NOTIFICATIONS ──────────────────────────────────
const generateTodayNotifications = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    // ─── APPOINTMENT NOTIFICATIONS ──────────────────────────────
    {
      id: 'n1_' + Date.now(),
      title: 'Patient Checked In',
      message: 'Muhammad Ali (Token: 17) - Follow Up - Chest Pain',
      timestamp: new Date(today.getTime() + 2 * 60000).toISOString(),
      read: false,
      icon: 'person-add-outline',
      category: 'Appointment',
      type: 'checkin',
    },
    {
      id: 'n2_' + Date.now() + 1,
      title: 'Patient Checked In',
      message: 'Ahmed Khan (Token: 18) - New Patient - Hypertension',
      timestamp: new Date(today.getTime() + 25 * 60000).toISOString(),
      read: true,
      icon: 'person-add-outline',
      category: 'Appointment',
      type: 'checkin',
    },
    {
      id: 'n3_' + Date.now() + 2,
      title: 'Appointment Reminder',
      message: 'Zainab Bibi - Follow Up - Diabetes at 11:30 AM',
      timestamp: new Date(today.getTime() + 5 * 60000).toISOString(),
      read: false,
      icon: 'calendar-outline',
      category: 'Appointment',
      type: 'reminder',
    },
    {
      id: 'n4_' + Date.now() + 3,
      title: 'New Appointment Booked',
      message: 'Muhammad Ali - Follow Up - Chest Pain at 2:00 PM',
      timestamp: new Date(today.getTime() + 40 * 60000).toISOString(),
      read: true,
      icon: 'calendar-outline',
      category: 'Appointment',
      type: 'new',
    },
    {
      id: 'n5_' + Date.now() + 6,
      title: 'Patient Checked In',
      message: 'Aslam Malik (Token: 19) - Follow Up - Post Surgery',
      timestamp: new Date(today.getTime() + 60 * 60000).toISOString(),
      read: true,
      icon: 'person-add-outline',
      category: 'Appointment',
      type: 'checkin',
    },
    {
      id: 'n6_' + Date.now() + 7,
      title: 'Appointment Rescheduled',
      message: 'Ahmed Khan - New time: 3:30 PM',
      timestamp: new Date(today.getTime() + 90 * 60000).toISOString(),
      read: true,
      icon: 'calendar-outline',
      category: 'Appointment',
      type: 'rescheduled',
    },

    // ─── ADMIN NOTIFICATIONS ──────────────────────────────────────
    {
      id: 'n7_' + Date.now() + 4,
      title: 'Department Meeting',
      message: 'Cardiology meeting at 2:00 PM in Conference Room A',
      timestamp: new Date(today.getTime() + 15 * 60000).toISOString(),
      read: false,
      icon: 'business-outline',
      category: 'Admin',
      type: 'meeting',
    },
    {
      id: 'n8_' + Date.now() + 5,
      title: 'System Update',
      message: 'EMR update scheduled for tonight 10:00 PM to 2:00 AM',
      timestamp: new Date(today.getTime() + 50 * 60000).toISOString(),
      read: true,
      icon: 'construct-outline',
      category: 'Admin',
      type: 'system',
    },
  ];
};

// ─── CATEGORY COLORS ──────────────────────────────────────────────
const CATEGORY_COLORS = {
  Appointment: { bg: '#E3F2FD', text: '#1565C0' },
  Admin: { bg: '#FFF3E0', text: '#E65100' },
  Default: { bg: '#F5F5F5', text: '#757575' },
};

// ─── TYPE LABELS ──────────────────────────────────────────────────
const TYPE_LABELS = {
  checkin: 'Checked In',
  reminder: 'Reminder',
  new: 'New Booking',
  rescheduled: 'Rescheduled',
  meeting: 'Meeting',
  system: 'System Update',
};

const DoctorNotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Animation for modal
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Simple logical filters
  const filters = ['All', 'Appointment', 'Admin', 'Unread'];

  // ─── MODAL ANIMATION ──────────────────────────────────────────────
  const animateModalIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedNotification(null);
    });
  };

  // ─── LOAD DOCTOR DATA ──────────────────────────────────────────────
  const loadDoctorData = async () => {
    try {
      const profileImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      let doctorData = {
        name: 'Dr. Ahmed Khan',
        color: COLORS.primary,
        color2: COLORS.secondary,
        profileImage: null,
      };

      if (userData) {
        const parsed = JSON.parse(userData);
        doctorData = { ...doctorData, ...parsed };
      }

      if (profileImage) {
        doctorData.profileImage = profileImage;
      }

      doctorData.avatar = getInitials(doctorData.name);
      return doctorData;
    } catch (error) {
      console.error('Error loading doctor data:', error);
      return null;
    }
  };

  // ─── SAFE DATE PARSING ──────────────────────────────────────────
  const safeParseDate = (timestamp) => {
    if (!timestamp) return new Date();
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return new Date();
      return date;
    } catch (e) {
      return new Date();
    }
  };

  // ─── IS TODAY ────────────────────────────────────────────────────
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // ─── LOAD NOTIFICATIONS ──────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      await loadDoctorData();

      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      let allNotifs = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstNotif = parsed[0];
            if (firstNotif && firstNotif.timestamp) {
              const notifDate = safeParseDate(firstNotif.timestamp);
              if (isToday(notifDate)) {
                allNotifs = parsed;
              }
            }
          }
        } catch (e) {
          allNotifs = [];
        }
      }

      if (allNotifs.length === 0) {
        allNotifs = generateTodayNotifications();
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifs));
      }

      const sorted = [...allNotifs].sort((a, b) => {
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        const dateA = safeParseDate(a.timestamp);
        const dateB = safeParseDate(b.timestamp);
        return dateB - dateA;
      });

      setNotifications(sorted);
      applyFilters(sorted, selectedFilter, searchQuery);

      const unreadCount = sorted.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
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
    const sorted = [...updated].sort((a, b) => {
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      const dateA = safeParseDate(a.timestamp);
      const dateB = safeParseDate(b.timestamp);
      return dateB - dateA;
    });
    
    setNotifications(sorted);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(sorted));
    applyFilters(sorted, selectedFilter, searchQuery);
    setUnreadCount(sorted.filter(n => !n.read).length);
  };

  const markAllRead = async () => {
    Alert.alert('Mark All Read', 'Mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          const updated = notifications.map(n => ({ ...n, read: true }));
          const sorted = [...updated].sort((a, b) => {
            const dateA = safeParseDate(a.timestamp);
            const dateB = safeParseDate(b.timestamp);
            return dateB - dateA;
          });
          setNotifications(sorted);
          await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(sorted));
          applyFilters(sorted, selectedFilter, searchQuery);
          setUnreadCount(0);
        },
      },
    ]);
  };

  // ─── DELETE NOTIFICATION ──────────────────────────────────────────
  const deleteNotification = async (id) => {
    Alert.alert('Delete', 'Delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = notifications.filter(n => n.id !== id);
          const sorted = [...updated].sort((a, b) => {
            if (a.read !== b.read) {
              return a.read ? 1 : -1;
            }
            const dateA = safeParseDate(a.timestamp);
            const dateB = safeParseDate(b.timestamp);
            return dateB - dateA;
          });
          setNotifications(sorted);
          await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(sorted));
          applyFilters(sorted, selectedFilter, searchQuery);
          setUnreadCount(sorted.filter(n => !n.read).length);
        },
      },
    ]);
  };

  // ─── HANDLE NOTIFICATION PRESS ──────────────────────────────────
  const handleNotificationPress = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setSelectedNotification(notif);
    setModalVisible(true);
    animateModalIn();
  };

  // ─── CLOSE MODAL ──────────────────────────────────────────────────
  const closeModal = () => {
    animateModalOut();
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
    const typeLabel = TYPE_LABELS[item.type] || item.category;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.notifCard,
          isUnread && styles.unreadCard,
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: categoryColors.bg }]}>
          <Ionicons name={iconName} size={20} color={categoryColors.text} />
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
                {item.category}
              </Text>
            </View>
            {item.type && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{typeLabel}</Text>
              </View>
            )}
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>New</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // ─── DETAIL MODAL ──────────────────────────────────────────────────
  const NotificationModal = () => {
    if (!selectedNotification) return null;

    const categoryColors = CATEGORY_COLORS[selectedNotification.category] || CATEGORY_COLORS.Default;
    const iconName = selectedNotification.icon || 'notifications-outline';
    const typeLabel = TYPE_LABELS[selectedNotification.type] || selectedNotification.category;

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
              backgroundColor: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)'],
              }),
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* Modal Header */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.tealDark]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {selectedNotification.title}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn} 
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Modal Body */}
            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBodyContent}
            >
              <View style={styles.modalIconWrapper}>
                <View style={[styles.modalIconCircle, { backgroundColor: categoryColors.bg }]}>
                  <Ionicons name={iconName} size={32} color={categoryColors.text} />
                </View>
              </View>

              <Text style={styles.modalTitle}>{selectedNotification.title}</Text>

              <View style={styles.modalMetaRow}>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
                  <Text style={styles.modalMetaText}>{formatDateDisplay(selectedNotification.timestamp)}</Text>
                </View>
                <View style={styles.modalMetaDot} />
                <View style={[styles.modalMetaItem, { backgroundColor: categoryColors.bg, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 }]}>
                  <Text style={[styles.modalMetaText, { color: categoryColors.text, fontWeight: '600' }]}>
                    {selectedNotification.category}
                  </Text>
                </View>
                {selectedNotification.type && (
                  <>
                    <View style={styles.modalMetaDot} />
                    <View style={styles.modalMetaItem}>
                      <Text style={[styles.modalMetaText, { fontWeight: '500', color: COLORS.primary }]}>
                        {typeLabel}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>

              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.tealDark]}
                  style={styles.modalCloseGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  // ─── GET FILTER COUNT ──────────────────────────────────────────────
  const getFilterCount = (filter) => {
    if (filter === 'All') return notifications.length;
    if (filter === 'Unread') return notifications.filter(n => !n.read).length;
    return notifications.filter(n => n.category === filter).length;
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ─── HEADER ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.6}
          >
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
            <Text style={styles.tagline}>Notifications</Text>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={markAllRead} 
                activeOpacity={0.6}
              >
                <View style={styles.markAllBadge}>
                  <Text style={styles.markAllText}>{unreadCount}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── SEARCH BAR ─────────────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color={COLORS.textLight} />
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
                <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── FILTER CHIPS ───────────────────────────────────────────── */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive
                ]}
                onPress={() => {
                  setSelectedFilter(filter);
                  applyFilters(notifications, filter, searchQuery);
                }}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive
                ]}>
                  {filter} ({getFilterCount(filter)})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── NOTIFICATIONS LIST ─────────────────────────────────────── */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationCard}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up!</Text>
            </View>
          }
        />

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ─── MODAL ────────────────────────────────────────────────────── */}
      <NotificationModal />
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
  scrollContent: {
    paddingBottom: 20,
  },

  // ── HEADER ──────────────────────────────────────────────────────────
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    paddingBottom: 8,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8EEF4',
    borderWidth: 1,
    borderColor: '#D0D7E0',
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
    paddingHorizontal: 16,
    paddingTop: 4,
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
    backgroundColor: '#F8FAFF',
    borderColor: COLORS.primary + '30',
  },
  iconContainer: {
    width: 42,
    height: 42,
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
    color: COLORS.text,
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
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
  },
  typeText: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.primary,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginTop: hp(6),
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },

  // ─── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: width * 0.92,
    maxHeight: height * 0.8,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    flex: 1,
    marginRight: 12,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    flexGrow: 0,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 24,
  },
  modalIconWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
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
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
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