import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, Switch, Modal, ScrollView, Animated, Dimensions,
  StatusBar, SafeAreaView, Platform,
  Vibration, RefreshControl, TextInput
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const isTablet = width >= 768;
const responsiveSize = (size) => isTablet ? size * 1.2 : size;
const responsiveFont = (size) => isTablet ? size * 1.1 : size;
const cardPadding = isTablet ? 24 : 16;
const iconSize = isTablet ? 32 : 24;

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    { 
      id: '1', title: 'Priority Token Generated', 
      message: 'Your token P-089 is now active for Cardiology Department. Please proceed to Room 204.',
      time: '5 min ago', type: 'priority', read: false, timestamp: new Date().getTime() - 5*60000,
      actionText: 'View Token', actionLink: 'LiveTokenQueueScreen'
    },
    { 
      id: '2', title: 'Medicine Reminder', 
      message: 'Time to take your blood pressure medicine (Lisinopril 10mg). Take with water after meal.',
      time: '2 hours ago', type: 'reminder', read: false, timestamp: new Date().getTime() - 2*3600000,
      actionText: 'Mark as Taken', actionLink: null
    },
    { 
      id: '3', title: 'Appointment Confirmed', 
      message: 'Your follow-up with Dr. Sara Malik is confirmed for tomorrow at 10:00 AM. Room 305, Cardiology Wing.',
      time: 'Yesterday', type: 'appointment', read: true, timestamp: new Date().getTime() - 24*3600000,
      actionText: 'Add to Calendar', actionLink: 'CalendarScreen'
    },
    { 
      id: '4', title: 'AI Health Insight', 
      message: 'Based on your recent symptoms, we recommend scheduling a checkup with a cardiologist.',
      time: '2 days ago', type: 'tip', read: true, timestamp: new Date().getTime() - 48*3600000,
      actionText: 'Book Now', actionLink: 'BookAppointmentScreen'
    },
    { 
      id: '5', title: 'Queue Update', 
      message: 'Your position in Cardiology OPD queue has been updated. Current token: A-12.',
      time: '30 min ago', type: 'queue', read: false, timestamp: new Date().getTime() - 30*60000,
      actionText: 'View Queue', actionLink: 'LiveTokenQueueScreen'
    },
    { 
      id: '6', title: 'Lab Report Ready', 
      message: 'Your blood test results are now available. Please check your reports section.',
      time: '1 hour ago', type: 'lab', read: false, timestamp: new Date().getTime() - 60*60000,
      actionText: 'View Report', actionLink: 'ReportsListScreen'
    },
  ]);

  const [settings, setSettings] = useState({
    soundEnabled: true,
    priorityAlerts: true,
    muteMode: false,
    previewMessages: true,
    groupNotifications: true,
    queueUpdates: true,
    appointmentReminders: true,
    labReports: true,
    medicineReminders: true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();

    simulateRealTimeNotifications();
  }, []);

  const simulateRealTimeNotifications = () => {
    const interval = setInterval(() => {
      const types = ['queue', 'reminder', 'lab', 'tip'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const newNotification = {
        id: Date.now().toString(),
        title: randomType === 'queue' ? 'Queue Update' : 
               randomType === 'reminder' ? 'Health Reminder' :
               randomType === 'lab' ? 'Lab Report Ready' : 'Health Tip',
        message: randomType === 'queue' ? 'Your queue position has been updated. Current token: A-15.' :
                  randomType === 'reminder' ? 'Don\'t forget to complete your daily health check-in.' :
                  randomType === 'lab' ? 'Your lab results are now available in the reports section.' :
                  'Stay hydrated! Drink 8 glasses of water daily for better health.',
        time: 'Just now',
        type: randomType,
        read: false,
        timestamp: new Date().getTime(),
        actionText: randomType === 'queue' ? 'View Queue' : 
                    randomType === 'lab' ? 'View Report' : 'Dismiss',
        actionLink: randomType === 'queue' ? 'LiveTokenQueueScreen' : 
                    randomType === 'lab' ? 'ReportsListScreen' : null
      };
      setNotifications(prev => [newNotification, ...prev]);
    }, 45000);
    return () => clearInterval(interval);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const markAllAsRead = () => {
    Alert.alert(
      "Mark All as Read",
      "This will mark all notifications as read. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Mark All", 
          onPress: () => {
            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      "Clear All Notifications",
      "This will permanently delete all notifications. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: () => {
            setNotifications([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
      ]
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || notif.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getIcon = (type) => {
    switch(type) {
      case 'priority': return 'alert-circle';
      case 'reminder': return 'notifications';
      case 'appointment': return 'calendar';
      case 'queue': return 'timer';
      case 'lab': return 'flask';
      default: return 'bulb';
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'priority': return COLORS.danger;
      case 'reminder': return COLORS.warning;
      case 'appointment': return COLORS.appointment;
      case 'queue': return COLORS.primary;
      case 'lab': return COLORS.pharmacy;
      default: return COLORS.success;
    }
  };

  const getBackgroundGradient = (type, read) => {
    if (read) return [COLORS.backgroundSecondary, COLORS.background];
    switch(type) {
      case 'priority': return [COLORS.primary + '15', COLORS.primary + '08'];
      default: return [COLORS.primary + '10', COLORS.backgroundSecondary];
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filterOptions = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'priority', label: 'Priority', icon: 'alert-circle' },
    { id: 'reminder', label: 'Reminders', icon: 'notifications' },
    { id: 'appointment', label: 'Appointments', icon: 'calendar' },
    { id: 'queue', label: 'Queue', icon: 'timer' },
    { id: 'lab', label: 'Lab', icon: 'flask' }
  ];

  const renderNotification = ({ item, index }) => {
    const isExpanded = expandedId === item.id;
    const colors = getColor(item.type);
    
    return (
      <Animated.View 
        style={[
          styles.notificationWrapper,
          { 
            opacity: fadeAnim,
            transform: [{ translateX: fadeAnim.interpolate({ 
              inputRange: [0, 1], 
              outputRange: [50 * (index + 1), 0] 
            }) }]
          }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => toggleExpand(item.id)}
          onLongPress={() => markAsRead(item.id)}
          delayLongPress={500}
        >
          <LinearGradient
            colors={getBackgroundGradient(item.type, item.read)}
            style={[styles.notificationCard, styles.cardShadow, !item.read && styles.unreadBorder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {/* Left Section - Icon */}
            <View style={styles.iconSection}>
              <LinearGradient
                colors={[colors + '20', colors + '08']}
                style={[styles.iconCircle, { borderColor: colors + '40' }]}
              >
                <Ionicons name={getIcon(item.type)} size={responsiveSize(iconSize)} color={colors} />
              </LinearGradient>
              {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: colors }]} />}
            </View>

            {/* Middle Section - Content */}
            <View style={styles.contentSection}>
              <View style={styles.titleRow}>
                <Text style={styles.notificationTitle} numberOfLines={isExpanded ? undefined : 1}>
                  {item.title}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: colors + '15' }]}>
                  <Text style={[styles.typeBadgeText, { color: colors }]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text 
                style={styles.notificationMessage} 
                numberOfLines={isExpanded ? undefined : 2}
                lineHeight={responsiveSize(20)}
              >
                {item.message}
              </Text>
              
              <View style={styles.metaRow}>
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={responsiveSize(12)} color={COLORS.textLight} />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                
                {item.actionText && (
                  <TouchableOpacity 
                    style={[styles.actionChip, { borderColor: colors + '40' }]}
                    onPress={() => {
                      if (item.actionLink) {
                        navigation.navigate(item.actionLink);
                      } else {
                        Alert.alert('Action', item.actionText);
                      }
                    }}
                  >
                    <Text style={[styles.actionChipText, { color: colors }]}>{item.actionText}</Text>
                    <Ionicons name="arrow-forward" size={responsiveSize(12)} color={colors} />
                  </TouchableOpacity>
                )}
              </View>
              
              {isExpanded && (
                <Animated.View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Ionicons name="information-circle" size={responsiveSize(14)} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                      Received: {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="notifications" size={responsiveSize(14)} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>
                      Priority Level: {item.type === 'priority' ? 'High' : item.type === 'appointment' ? 'Medium' : 'Normal'}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Right Section - Expand Indicator */}
            <View style={styles.expandSection}>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={responsiveSize(20)} 
                color={COLORS.textSecondary} 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const FilterBar = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.filterChip, filterType === option.id && styles.filterChipActive]}
            onPress={() => setFilterType(option.id)}
          >
            <Ionicons 
              name={option.icon} 
              size={responsiveSize(16)} 
              color={filterType === option.id ? COLORS.white : COLORS.primary} 
            />
            <Text style={[styles.filterText, filterType === option.id && styles.filterTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const SettingsModal = () => (
    <Modal visible={showSettings} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={[styles.modalContainer, { width: isTablet ? width * 0.6 : width * 0.92 }]}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={responsiveSize(28)} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>General Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="musical-notes" size={responsiveSize(24)} color={COLORS.primary} />
                  <Text style={styles.settingLabel}>Notification Sounds</Text>
                </View>
                <Switch 
                  value={settings.soundEnabled} 
                  onValueChange={(val) => setSettings({...settings, soundEnabled: val})}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={settings.soundEnabled ? COLORS.white : COLORS.textLight}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="star" size={responsiveSize(24)} color={COLORS.warning} />
                  <Text style={styles.settingLabel}>Priority Only Mode</Text>
                </View>
                <Switch 
                  value={settings.priorityAlerts} 
                  onValueChange={(val) => setSettings({...settings, priorityAlerts: val})}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={settings.priorityAlerts ? COLORS.white : COLORS.textLight}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="eye" size={responsiveSize(24)} color={COLORS.info} />
                  <Text style={styles.settingLabel}>Show Message Previews</Text>
                </View>
                <Switch 
                  value={settings.previewMessages} 
                  onValueChange={(val) => setSettings({...settings, previewMessages: val})}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={settings.previewMessages ? COLORS.white : COLORS.textLight}
                />
              </View>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Notification Types</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="timer" size={responsiveSize(24)} color={COLORS.primary} />
                  <Text style={styles.settingLabel}>Queue Updates</Text>
                </View>
                <Switch 
                  value={settings.queueUpdates} 
                  onValueChange={(val) => setSettings({...settings, queueUpdates: val})}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={settings.queueUpdates ? COLORS.white : COLORS.textLight}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="calendar" size={responsiveSize(24)} color={COLORS.appointment} />
                  <Text style={styles.settingLabel}>Appointment Reminders</Text>
                </View>
                <Switch 
                  value={settings.appointmentReminders} 
                  onValueChange={(val) => setSettings({...settings, appointmentReminders: val})}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={settings.appointmentReminders ? COLORS.white : COLORS.textLight}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="flask" size={responsiveSize(24)} color={COLORS.pharmacy} />
                  <Text style={styles.settingLabel}>Lab Reports</Text>
                </View>
                <Switch 
                  value={settings.labReports} 
                  onValueChange={(val) => setSettings({...settings, labReports: val})}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={settings.labReports ? COLORS.white : COLORS.textLight}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={responsiveSize(24)} color={COLORS.warning} />
                  <Text style={styles.settingLabel}>Medicine Reminders</Text>
                </View>
                <Switch 
                  value={settings.medicineReminders} 
                  onValueChange={(val) => setSettings({...settings, medicineReminders: val})}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={settings.medicineReminders ? COLORS.white : COLORS.textLight}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.background, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={responsiveSize(24)} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
              <Ionicons name="settings-outline" size={responsiveSize(22)} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Ionicons name="mail-unread" size={responsiveSize(16)} color={COLORS.danger} />
              <Text style={styles.statValue}>{unreadCount}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="notifications" size={responsiveSize(16)} color={COLORS.success} />
              <Text style={styles.statValue}>{notifications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="timer" size={responsiveSize(16)} color={COLORS.primary} />
              <Text style={styles.statValue}>Live</Text>
              <Text style={styles.statLabel}>Queue</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={responsiveSize(20)} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={responsiveSize(18)} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Bar */}
        <FilterBar />

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={[styles.actionButton, styles.cardShadow]} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={responsiveSize(18)} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Mark Read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.cardShadow]} onPress={clearAllNotifications}>
            <Ionicons name="trash" size={responsiveSize(18)} color={COLORS.danger} />
            <Text style={[styles.actionButtonText, { color: COLORS.danger }]}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={item => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={responsiveSize(70)} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up!</Text>
              <Text style={styles.emptyHint}>Pull down to refresh or check back later</Text>
            </View>
          }
        />
      </SafeAreaView>

      <SettingsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  safeArea: { 
    flex: 1 
  },

  // Card Shadow
  cardShadow: { ...SHADOWS.medium },

  // Header
  headerContainer: { 
    paddingBottom: 12,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 12,
  },
  backBtn: {
    width: responsiveSize(40),
    height: responsiveSize(40),
    borderRadius: responsiveSize(12),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  settingsBtn: {
    width: responsiveSize(40),
    height: responsiveSize(40),
    borderRadius: responsiveSize(12),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  headerTitle: { 
    color: COLORS.white, 
    fontSize: responsiveFont(18), 
    fontWeight: '800' 
  },
  unreadBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: responsiveSize(10),
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadBadgeText: { 
    color: COLORS.white, 
    fontSize: responsiveFont(10), 
    fontWeight: 'bold' 
  },

  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.29)',
    borderRadius: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: { 
    alignItems: 'center', 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 6 
  },
  statValue: { 
    color: COLORS.navy, 
    fontSize: responsiveFont(14), 
    fontWeight: 'bold' 
  },
  statLabel: { 
    color: COLORS.navy, 
    fontSize: responsiveFont(11),
    opacity: 0.7,
  },
  statDivider: { 
    width: 1, 
    height: 20, 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    ...SHADOWS.small,
  },
  searchInput: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: responsiveFont(14), 
    paddingVertical: 12 
  },

  filterContainer: { 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  filterScroll: { 
    gap: 10 
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  filterChipActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  filterText: { 
    color: COLORS.primary, 
    fontSize: responsiveFont(12), 
    fontWeight: '600' 
  },
  filterTextActive: { 
    color: COLORS.white 
  },

  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: { 
    color: COLORS.primary, 
    fontSize: responsiveFont(12), 
    fontWeight: '600' 
  },

  listContainer: { 
    padding: 16, 
    paddingBottom: 100, 
    gap: 12 
  },
  
  notificationWrapper: { 
    marginBottom: 0 
  },
  notificationCard: { 
    borderRadius: 20, 
    padding: cardPadding,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  unreadBorder: { 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.primary 
  },

  iconSection: { 
    position: 'relative', 
    marginRight: 14 
  },
  iconCircle: {
    width: responsiveSize(50),
    height: responsiveSize(50),
    borderRadius: responsiveSize(25),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: responsiveSize(12),
    height: responsiveSize(12),
    borderRadius: responsiveSize(6),
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  contentSection: { 
    flex: 1, 
    gap: 6 
  },
  titleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  notificationTitle: { 
    color: COLORS.text, 
    fontSize: responsiveFont(15), 
    fontWeight: 'bold', 
    flex: 1 
  },
  typeBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 12 
  },
  typeBadgeText: { 
    fontSize: responsiveFont(9), 
    fontWeight: 'bold' 
  },
  notificationMessage: { 
    color: COLORS.textSecondary, 
    fontSize: responsiveFont(13), 
    lineHeight: responsiveSize(20) 
  },
  
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginTop: 6 
  },
  timeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5 
  },
  timeText: { 
    color: COLORS.textLight, 
    fontSize: responsiveFont(11) 
  },
  actionChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 15, 
    borderWidth: 1, 
    gap: 5 
  },
  actionChipText: { 
    fontSize: responsiveFont(11), 
    fontWeight: '600' 
  },

  expandSection: { 
    justifyContent: 'center', 
    paddingLeft: 8 
  },
  expandedContent: { 
    marginTop: 12, 
    gap: 8 
  },
  divider: { 
    height: 1, 
    backgroundColor: COLORS.border, 
    marginVertical: 4 
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  detailText: { 
    color: COLORS.textSecondary, 
    fontSize: responsiveFont(11) 
  },

  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60 
  },
  emptyTitle: { 
    color: COLORS.text, 
    fontSize: responsiveFont(18), 
    fontWeight: 'bold', 
    marginTop: 16 
  },
  emptySubtitle: { 
    color: COLORS.textSecondary, 
    fontSize: responsiveFont(14), 
    marginTop: 8 
  },
  emptyHint: { 
    color: COLORS.textLight, 
    fontSize: responsiveFont(12), 
    marginTop: 8 
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    overflow: 'hidden', 
    maxHeight: height * 0.8,
    ...SHADOWS.large,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20 
  },
  modalTitle: { 
    color: COLORS.white, 
    fontSize: responsiveFont(18), 
    fontWeight: 'bold' 
  },
  closeBtn: { 
    padding: 4 
  },
  settingsList: { 
    padding: 20 
  },
  settingSection: { 
    marginBottom: 24 
  },
  settingSectionTitle: { 
    color: COLORS.primary, 
    fontSize: responsiveFont(14), 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  settingItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16, 
    paddingVertical: 4 
  },
  settingInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  settingLabel: { 
    color: COLORS.text, 
    fontSize: responsiveFont(14), 
    fontWeight: '500' 
  },
});

export default NotificationsScreen;