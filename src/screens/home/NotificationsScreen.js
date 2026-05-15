import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, Switch, Modal, ScrollView, Animated, Dimensions,
  ImageBackground, StatusBar, SafeAreaView, Platform,
  Vibration, RefreshControl, TextInput
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

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
      id: '5', title: 'Location Alert', 
      message: 'Dr. Ahmed Khan is on the way to your location for home care service. ETA: 15 minutes.',
      time: '30 min ago', type: 'location', read: false, timestamp: new Date().getTime() - 30*60000,
      actionText: 'Track Location', actionLink: 'LiveTrackingScreen'
    },
    { 
      id: '6', title: 'Emergency Alert', 
      message: 'Emergency services have been dispatched to your location. Stay calm. Help is on the way.',
      time: '1 hour ago', type: 'emergency', read: false, timestamp: new Date().getTime() - 60*60000,
      actionText: 'View Status', actionLink: 'EmergencyStatusScreen'
    },
  ]);

  const [settings, setSettings] = useState({
    emergencySounds: true,
    emergencyVibration: true,
    smartWatchAlerts: true,
    locationTracking: true,
    soundEnabled: true,
    priorityAlerts: true,
    muteMode: false,
    previewMessages: true,
    groupNotifications: true
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();
    
    // Pulsing animation for emergency button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    simulateRealTimeNotifications();
    simulateLocationTracking();
  }, []);

  const simulateRealTimeNotifications = () => {
    const interval = setInterval(() => {
      const types = ['priority', 'reminder', 'location', 'tip'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const newNotification = {
        id: Date.now().toString(),
        title: randomType === 'priority' ? 'New Priority Token' : 
               randomType === 'reminder' ? 'Health Reminder' :
               randomType === 'location' ? 'Location Update' : 'Health Tip',
        message: randomType === 'priority' ? 'Your priority token P-092 has been generated. Please proceed to the counter.' :
                  randomType === 'reminder' ? 'Don\'t forget to complete your daily health check-in.' :
                  randomType === 'location' ? 'Your current location is being monitored for safety.' :
                  'Stay hydrated! Drink 8 glasses of water daily for better health.',
        time: 'Just now',
        type: randomType,
        read: false,
        timestamp: new Date().getTime(),
        actionText: randomType === 'priority' ? 'View Token' : 'Dismiss',
        actionLink: randomType === 'priority' ? 'LiveTokenQueueScreen' : null
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      if (settings.emergencyVibration) {
        Vibration.vibrate(300);
      }
    }, 45000);
    return () => clearInterval(interval);
  };

  const simulateLocationTracking = () => {
    const interval = setInterval(() => {
      if (settings.locationTracking) {
        setLiveLocation({
          lat: 33.6844 + (Math.random() - 0.5) * 0.005,
          lng: 73.0479 + (Math.random() - 0.5) * 0.005,
          timestamp: new Date().toLocaleTimeString(),
          accuracy: 'High'
        });
      }
    }, 15000);
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

  const triggerEmergency = () => {
    setShowEmergency(true);
    if (settings.emergencyVibration) {
      Vibration.vibrate([1000, 500, 1000, 500, 2000, 1000]);
    }
    
    const emergencyNotif = {
      id: Date.now().toString(),
      title: 'EMERGENCY ALERT TRIGGERED',
      message: 'Emergency services have been notified. Your live location is being shared with responders.',
      time: 'Just now',
      type: 'emergency',
      read: false,
      timestamp: new Date().getTime(),
      actionText: 'View Status',
      actionLink: 'EmergencyStatusScreen'
    };
    setNotifications(prev => [emergencyNotif, ...prev]);
    
    setTimeout(() => {
      setShowEmergency(false);
    }, 6000);
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
      case 'location': return 'location';
      case 'emergency': return 'alert-circle';
      default: return 'bulb';
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'priority': return '#EF4444';
      case 'reminder': return '#F59E0B';
      case 'appointment': return '#04e1f5';
      case 'location': return '#3B82F6';
      case 'emergency': return '#DC2626';
      default: return '#10B981';
    }
  };

  const getBackgroundGradient = (type, read) => {
    if (read) return ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.35)'];
    switch(type) {
      case 'emergency': return ['#DC262620', '#EF444410'];
      case 'priority': return ['#EF444415', '#F59E0B10'];
      default: return ['rgba(4, 225, 245, 0.1)', 'rgba(4, 225, 245, 0.05)'];
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filterOptions = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'priority', label: 'Priority', icon: 'alert-circle' },
    { id: 'reminder', label: 'Reminders', icon: 'notifications' },
    { id: 'appointment', label: 'Appointments', icon: 'calendar' },
    { id: 'emergency', label: 'Emergency', icon: 'alert-circle' }
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
            style={[styles.notificationCard, !item.read && styles.unreadBorder]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {/* Left Section - Icon */}
            <View style={styles.iconSection}>
              <LinearGradient
                colors={[colors + '30', colors + '10']}
                style={[styles.iconCircle, { borderColor: colors + '50' }]}
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
                <View style={[styles.typeBadge, { backgroundColor: colors + '20' }]}>
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
                  <Ionicons name="time-outline" size={responsiveSize(12)} color="#94A3B8" />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                
                {item.actionText && (
                  <TouchableOpacity 
                    style={[styles.actionChip, { borderColor: colors + '50' }]}
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
                    <Ionicons name="information-circle" size={responsiveSize(14)} color="#64748B" />
                    <Text style={styles.detailText}>
                      Received: {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="notifications" size={responsiveSize(14)} color="#64748B" />
                    <Text style={styles.detailText}>
                      Priority Level: {item.type === 'emergency' ? 'High' : item.type === 'priority' ? 'Medium' : 'Normal'}
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
                color="#64748B" 
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
              color={filterType === option.id ? '#fff' : '#04e1f5'} 
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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { width: isTablet ? width * 0.6 : width * 0.9 }]}>
          <LinearGradient colors={['#001D3D', '#000814']} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={responsiveSize(28)} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Emergency Alerts</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="megaphone" size={responsiveSize(24)} color="#EF4444" />
                  <Text style={styles.settingLabel}>Emergency Alert Sounds</Text>
                </View>
                <Switch 
                  value={settings.emergencySounds} 
                  onValueChange={(val) => setSettings({...settings, emergencySounds: val})}
                  trackColor={{ false: '#374151', true: '#EF4444' }}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="vibrate" size={responsiveSize(24)} color="#F59E0B" />
                  <Text style={styles.settingLabel}>Emergency Vibration</Text>
                </View>
                <Switch 
                  value={settings.emergencyVibration} 
                  onValueChange={(val) => setSettings({...settings, emergencyVibration: val})}
                  trackColor={{ false: '#374151', true: '#F59E0B' }}
                />
              </View>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>General Settings</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="watch" size={responsiveSize(24)} color="#10B981" />
                  <Text style={styles.settingLabel}>Smartwatch Alerts</Text>
                </View>
                <Switch value={settings.smartWatchAlerts} onValueChange={(val) => setSettings({...settings, smartWatchAlerts: val})} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="location" size={responsiveSize(24)} color="#3B82F6" />
                  <Text style={styles.settingLabel}>Real-time Location Tracking</Text>
                </View>
                <Switch value={settings.locationTracking} onValueChange={(val) => setSettings({...settings, locationTracking: val})} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="musical-notes" size={responsiveSize(24)} color="#8B5CF6" />
                  <Text style={styles.settingLabel}>Notification Sounds</Text>
                </View>
                <Switch value={settings.soundEnabled} onValueChange={(val) => setSettings({...settings, soundEnabled: val})} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="star" size={responsiveSize(24)} color="#F59E0B" />
                  <Text style={styles.settingLabel}>Priority Only Mode</Text>
                </View>
                <Switch value={settings.priorityAlerts} onValueChange={(val) => setSettings({...settings, priorityAlerts: val})} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="eye" size={responsiveSize(24)} color="#06B6D4" />
                  <Text style={styles.settingLabel}>Show Message Previews</Text>
                </View>
                <Switch value={settings.previewMessages} onValueChange={(val) => setSettings({...settings, previewMessages: val})} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const EmergencyModal = () => (
    <Modal visible={showEmergency} transparent animationType="fade">
      <View style={styles.emergencyOverlay}>
        <Animated.View style={[styles.emergencyContainer, { transform: [{ scale: scaleAnim }], width: isTablet ? width * 0.5 : width * 0.85 }]}>
          <LinearGradient colors={['#DC2626', '#EF4444']} style={styles.emergencyHeader}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="alert-circle" size={responsiveSize(60)} color="#fff" />
            </Animated.View>
            <Text style={styles.emergencyTitle}>EMERGENCY ALERT</Text>
            <Text style={styles.emergencySubtitle}>Help is on the way</Text>
          </LinearGradient>
          
          <View style={styles.emergencyBody}>
            <View style={styles.emergencyStatusCard}>
              <Ionicons name="checkmark-circle" size={responsiveSize(24)} color="#10B981" />
              <View>
                <Text style={styles.emergencyStatusText}>Emergency Services Notified</Text>
                <Text style={styles.emergencyStatusSub}>Response time: 5-7 minutes</Text>
              </View>
            </View>
            
            <Text style={styles.emergencySectionTitle}>Contacts Being Notified:</Text>
            <View style={styles.emergencyContacts}>
              <View style={styles.emergencyContactChip}>
                <Ionicons name="medkit" size={responsiveSize(16)} color="#fff" />
                <Text style={styles.emergencyContactText}>Ambulance Service</Text>
              </View>
              <View style={styles.emergencyContactChip}>
                <Ionicons name="business" size={responsiveSize(16)} color="#fff" />
                <Text style={styles.emergencyContactText}>CDA Hospital</Text>
              </View>
              <View style={styles.emergencyContactChip}>
                <Ionicons name="person" size={responsiveSize(16)} color="#fff" />
                <Text style={styles.emergencyContactText}>Emergency Contact</Text>
              </View>
            </View>
            
            {liveLocation && (
              <View style={styles.locationBox}>
                <Ionicons name="location" size={responsiveSize(20)} color="#10B981" />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>Your Live Location</Text>
                  <Text style={styles.locationValue}>
                    {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
                  </Text>
                  <Text style={styles.locationAccuracy}>Accuracy: {liveLocation.accuracy}</Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity style={styles.cancelEmergencyBtn} onPress={() => setShowEmergency(false)}>
              <Text style={styles.cancelEmergencyText}>Cancel Alert (If Mistaken)</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <LinearGradient
              colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
              style={styles.headerGradient}
            >
              <View style={styles.topHeader}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={responsiveSize(24)} color="#04e1f5" />
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                  <Text style={styles.headerTitle}>Notifications</Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)}>
                  <Ionicons name="settings-outline" size={responsiveSize(22)} color="#04e1f5" />
                </TouchableOpacity>
              </View>
              
              {/* Stats Bar */}
              <View style={styles.statsBar}>
                <View style={styles.statItem}>
                  <Ionicons name="mail-unread" size={responsiveSize(16)} color="#EF4444" />
                  <Text style={styles.statValue}>{unreadCount}</Text>
                  <Text style={styles.statLabel}>Unread</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="notifications" size={responsiveSize(16)} color="#10B981" />
                  <Text style={styles.statValue}>{notifications.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="location" size={responsiveSize(16)} color="#3B82F6" />
                  <Text style={styles.statValue}>{liveLocation ? 'Live' : 'Off'}</Text>
                  <Text style={styles.statLabel}>Tracking</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={responsiveSize(20)} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search notifications..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={responsiveSize(18)} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Bar */}
            <FilterBar />

            {/* Action Buttons */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
                <Ionicons name="checkmark-done" size={responsiveSize(18)} color="#04e1f5" />
                <Text style={styles.actionButtonText}>Mark Read</Text>
              </TouchableOpacity>
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={[styles.actionButton, styles.emergencyActionBtn]} onPress={triggerEmergency}>
                  <Ionicons name="alert-circle" size={responsiveSize(18)} color="#fff" />
                  <Text style={[styles.actionButtonText, { color: '#fff' }]}>SOS Emergency</Text>
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity style={styles.actionButton} onPress={clearAllNotifications}>
                <Ionicons name="trash" size={responsiveSize(18)} color="#EF4444" />
                <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Clear All</Text>
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
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#04e1f5" />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off" size={responsiveSize(70)} color="#4f5b6d" />
                  <Text style={styles.emptyTitle}>No Notifications</Text>
                  <Text style={styles.emptySubtitle}>You're all caught up!</Text>
                  <Text style={styles.emptyHint}>Pull down to refresh or check back later</Text>
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </ImageBackground>

      <SettingsModal />
      <EmergencyModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(8, 20, 71, 0.48)'},
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: responsiveSize(40),
    height: responsiveSize(40),
    borderRadius: responsiveSize(12),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#fff', fontSize: responsiveFont(18), fontWeight: '800' },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: responsiveSize(10),
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadBadgeText: { color: '#fff', fontSize: responsiveFont(10), fontWeight: 'bold' },

  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.43)',
    borderRadius: 20,
    paddingVertical: 10,
  },
  statItem: { alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  statValue: { color: '#fff', fontSize: responsiveFont(14), fontWeight: 'bold' },
  statLabel: { color: '#B2DFDB', fontSize: responsiveFont(11) },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
    gap: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: responsiveFont(14), paddingVertical: 12 },

  filterContainer: { paddingHorizontal: 16, marginBottom: 12 },
  filterScroll: { gap: 10 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  filterChipActive: { backgroundColor: '#04e1f5', borderColor: '#04e1f5' },
  filterText: { color: '#04e1f5', fontSize: responsiveFont(12), fontWeight: '600' },
  filterTextActive: { color: '#fff' },

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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  emergencyActionBtn: { backgroundColor: '#DC2626', borderColor: '#EF4444' },
  actionButtonText: { color: '#04e1f5', fontSize: responsiveFont(12), fontWeight: '600' },

  listContainer: { padding: 16, paddingBottom: 100, gap: 12 },
  
  notificationWrapper: { marginBottom: 0 },
  notificationCard: { 
    borderRadius: 20, 
    padding: cardPadding,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.29)',
  },
  unreadBorder: { borderLeftWidth: 4, borderLeftColor: '#04e1f5' },

  iconSection: { position: 'relative', marginRight: 14 },
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
    borderColor: '#fff',
  },

  contentSection: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  notificationTitle: { color: '#fff', fontSize: responsiveFont(15), fontWeight: 'bold', flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  typeBadgeText: { fontSize: responsiveFont(9), fontWeight: 'bold' },
  notificationMessage: { color: '#B2DFDB', fontSize: responsiveFont(13), lineHeight: responsiveSize(20) },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { color: '#e4e9f0', fontSize: responsiveFont(11) },
  actionChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15, borderWidth: 1, gap: 5 },
  actionChipText: { fontSize: responsiveFont(11), fontWeight: '600' },

  expandSection: { justifyContent: 'center', paddingLeft: 8 },
  expandedContent: { marginTop: 12, gap: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.99)', marginVertical: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { color: '#cdd5df', fontSize: responsiveFont(11) },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#fff', fontSize: responsiveFont(18), fontWeight: 'bold', marginTop: 16 },
  emptySubtitle: { color: '#B2DFDB', fontSize: responsiveFont(14), marginTop: 8 },
  emptyHint: { color: '#29394e', fontSize: responsiveFont(12), marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#193652', borderRadius: 24, overflow: 'hidden', maxHeight: height * 0.8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  modalTitle: { color: '#fff', fontSize: responsiveFont(18), fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  settingsList: { padding: 20 },
  settingSection: { marginBottom: 24 },
  settingSectionTitle: { color: '#04e1f5', fontSize: responsiveFont(14), fontWeight: 'bold', marginBottom: 12 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingVertical: 4 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { color: '#fff', fontSize: responsiveFont(14), fontWeight: '500' },

  emergencyOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center' },
  emergencyContainer: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden' },
  emergencyHeader: { alignItems: 'center', padding: 30, gap: 10 },
  emergencyTitle: { color: '#fff', fontSize: responsiveFont(22), fontWeight: 'bold' },
  emergencySubtitle: { color: '#FEE2E2', fontSize: responsiveFont(14) },
  emergencyBody: { padding: 20, gap: 16 },
  emergencyStatusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', padding: 14, borderRadius: 16, gap: 12 },
  emergencyStatusText: { color: '#065F46', fontSize: responsiveFont(14), fontWeight: 'bold' },
  emergencyStatusSub: { color: '#047857', fontSize: responsiveFont(12) },
  emergencySectionTitle: { color: '#1F2937', fontSize: responsiveFont(14), fontWeight: '600' },
  emergencyContacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emergencyContactChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  emergencyContactText: { color: '#fff', fontSize: responsiveFont(12), fontWeight: '600' },
  locationBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 14, borderRadius: 16, gap: 12 },
  locationTextContainer: { flex: 1 },
  locationLabel: { color: '#065F46', fontSize: responsiveFont(12), fontWeight: '600' },
  locationValue: { color: '#047857', fontSize: responsiveFont(13), fontWeight: '500', marginTop: 2 },
  locationAccuracy: { color: '#10B981', fontSize: responsiveFont(10), marginTop: 2 },
  cancelEmergencyBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  cancelEmergencyText: { color: '#6B7280', fontSize: responsiveFont(14) },
});

export default NotificationsScreen;