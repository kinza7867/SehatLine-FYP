import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, Image, StatusBar, SafeAreaView, Modal,
  Alert, RefreshControl, Platform, TextInput, Animated,
  TouchableWithoutFeedback, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const HospitalHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userName, setUserName] = useState('Guest');
  const [userData, setUserData] = useState(null);
  const [activeToken, setActiveToken] = useState(null);
  const [showTokenDetails, setShowTokenDetails] = useState(false);

  // Today's hospital-wide stats
  const [todayData] = useState({
    operations: {
      appointments: 8,
      tokensIssued: 142,
      patientsServed: 118,
      reportsUploaded: 36,
    },
    queue: { serving: 'CH-051', yourToken: 'CH-057', ahead: 7, waitTime: 18 },
  });

  // Live queue for 3 departments
  const [liveQueue, setLiveQueue] = useState([
    { id: 1, dept: 'Chronic OPD', current: 'A-12', waiting: 8, time: '15 min', color: COLORS.primary, icon: 'medical-outline', screen: 'LiveTokenQueueScreen' },
    { id: 2, dept: 'Pharmacy',    current: 'P-08', waiting: 5, time: '10 min', color: '#F59E0B', icon: 'medkit-outline',     screen: 'LiveTokenQueueScreen' },
    { id: 3, dept: 'Laboratory',  current: 'L-05', waiting: 12, time: '22 min', color: '#10B981', icon: 'flask-outline',     screen: 'LiveTokenQueueScreen' },
  ]);

  // AI Insight state with live updates
  const [aiInsight, setAiInsight] = useState({
    predictedWait: '18 min',
    bestTime: '2:00 PM',
    save: '12 min',
    congestion: 'Moderate',
    tip: 'Visit after 2 PM to reduce wait by ~40%',
    queuePosition: '5',
    totalAhead: '7',
    status: 'Waiting',
  });

  // Quick Actions
  const quickActions = [
    { id: 1, name: 'Generate\nToken',    icon: 'ticket-outline',        color: COLORS.primary, screen: 'GenerateTokenScreen' },
    { id: 2, name: 'Book\nAppointment', icon: 'calendar-outline',       color: '#8B5CF6',      screen: 'BookAppointmentScreen' },
    { id: 3, name: 'Live\nQueue',       icon: 'timer-outline',          color: '#FF6B35',      screen: 'LiveTokenQueueScreen' },
    { id: 4, name: 'Laboratory',        icon: 'flask-outline',          color: '#10B981',      screen: 'LabDashboardScreen' },
    { id: 5, name: 'Pharmacy',          icon: 'medkit-outline',         color: '#F59E0B',      screen: 'PharmacyDashboardScreen' },
    { id: 6, name: 'Chronic\nOPD',     icon: 'medical-outline',        color: '#6366F1',      screen: 'ChronicDashboardScreen' },
    { id: 7, name: 'My\nReports',       icon: 'document-text-outline',  color: '#EF4444',      screen: 'ReportsListScreen' },
  ];

  // My Token Button - Separate from Quick Actions
  const myTokenAction = {
    id: 8,
    name: 'My Token',
    icon: 'qr-code-outline',
    color: '#06B6D4',
  };

  // Hospital Modules
  const hospitalModules = [
    { id: 1, name: 'Chronic OPD', icon: 'medical-outline',  color: '#8B5CF6', screen: 'ChronicDashboardScreen',       desc: 'Chronic Disease Care'  },
    { id: 2, name: 'Laboratory',  icon: 'flask-outline',    color: '#10B981', screen: 'LabDashboardScreen',     desc: 'Tests & Reports'       },
    { id: 3, name: 'Pharmacy',    icon: 'medkit-outline',   color: '#F59E0B', screen: 'PharmacyDashboardScreen', desc: 'Medicine Collection'   },
  ];

  // Search data
  const searchableItems = [
    { id: '1', name: 'Book Appointment',  icon: 'calendar-outline',      screen: 'BookAppointmentScreen' },
    { id: '2', name: 'Chronic OPD',       icon: 'medical-outline',       screen: 'ChronicOPDScreen' },
    { id: '3', name: 'Laboratory',        icon: 'flask-outline',         screen: 'LabDashboardScreen' },
    { id: '4', name: 'Pharmacy',          icon: 'medkit-outline',        screen: 'PharmacyDashboardScreen' },
    { id: '5', name: 'Live Queue',        icon: 'timer-outline',         screen: 'LiveTokenQueueScreen' },
    { id: '6', name: 'Generate Token',    icon: 'ticket-outline',        screen: 'GenerateTokenScreen' },
    { id: '7', name: 'My Reports',        icon: 'document-text-outline', screen: 'ReportsListScreen' },
    { id: '8', name: 'Profile',           icon: 'person-outline',        screen: 'ProfileScreen' },
    { id: '9', name: 'Settings',          icon: 'settings-outline',      screen: 'SettingsScreen' },
    { id: '10', name: 'Appointments',     icon: 'list-outline',          screen: 'AppointmentList' },
  ];

  // Side menu
  const menuItems = [
    { section: 'DASHBOARD', items: [{ name: 'Home', icon: 'home-outline', screen: 'HospitalHome' }] },
    {
      section: 'QUEUE MANAGEMENT', items: [
        { name: 'Generate Token',     icon: 'ticket-outline',   screen: 'GenerateTokenScreen' },
        { name: 'My Token',           icon: 'qr-code-outline',  screen: 'GenerateTokenScreen' },
        { name: 'Live Queue',         icon: 'timer-outline',    screen: 'LiveTokenQueueScreen' },
        { name: 'Book Appointment',   icon: 'calendar-outline', screen: 'BookAppointmentScreen' },
        { name: 'Appointment History',icon: 'list-outline',     screen: 'AppointmentList' },
      ],
    },
    {
      section: 'HOSPITAL MODULES', items: [
        { name: 'Chronic OPD', icon: 'medical-outline', screen: 'ChronicOPDScreen' },
        { name: 'Laboratory',  icon: 'flask-outline',   screen: 'LabDashboardScreen' },
        { name: 'Pharmacy',    icon: 'medkit-outline',  screen: 'PharmacyDashboardScreen' },
      ],
    },
    {
      section: 'PATIENT SERVICES', items: [
        { name: 'My Reports',      icon: 'document-text-outline',  screen: 'ReportsListScreen' },
        { name: 'Notifications',   icon: 'notifications-outline',  screen: 'Notifications' },
      ],
    },
    {
      section: 'ACCOUNT', items: [
        { name: 'Profile',  icon: 'person-outline',    screen: 'ProfileScreen' },
        { name: 'Settings', icon: 'settings-outline',  screen: 'SettingsScreen' },
        { name: 'Help',     icon: 'help-circle-outline', screen: 'HelpSupportScreen' },
        { name: 'Logout',   icon: 'log-out-outline',   screen: 'Logout', isLogout: true },
      ],
    },
  ];

  useEffect(() => {
    getUserData();
    loadAppointmentData();
    updateAIInsight();
  }, []);

  // Auto-update live queue every 30 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveQueue(prev =>
        prev.map(item => ({
          ...item,
          waiting: Math.max(1, item.waiting + (Math.random() > 0.6 ? -1 : 1)),
          time: `${Math.floor(Math.random() * 20) + 5} min`,
        }))
      );
      updateAIInsight();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateAIInsight = () => {
    const waitTimes = ['12 min', '18 min', '22 min', '15 min', '20 min'];
    const tips = [
      'Visit after 2 PM to reduce wait by ~40%',
      'Morning hours are less crowded',
      'Weekends have shorter queues',
      'Avoid peak hours 11 AM - 1 PM',
      'Book appointment online to skip queue'
    ];
    const statuses = ['Waiting', 'Next', 'Almost There'];
    
    setAiInsight({
      predictedWait: waitTimes[Math.floor(Math.random() * waitTimes.length)],
      bestTime: `${Math.floor(Math.random() * 4) + 1}:00 PM`,
      save: `${Math.floor(Math.random() * 15) + 5} min`,
      congestion: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
      tip: tips[Math.floor(Math.random() * tips.length)],
      queuePosition: `${Math.floor(Math.random() * 8) + 2}`,
      totalAhead: `${Math.floor(Math.random() * 15) + 5}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  };

  const getUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setUserData(parsed);
        setUserName(parsed.name || 'Guest');
      }
    } catch (e) { console.log('getUserData error:', e); }
  };

  const loadAppointmentData = async () => {
    try {
      const stored = await AsyncStorage.getItem('appointments');
      if (stored) {
        const appointments = JSON.parse(stored);
        const active = appointments.filter(a =>
          a.status === 'Confirmed' || a.status === 'Pending'
        );
        if (active.length > 0) setActiveToken(active[active.length - 1]);
      }
    } catch (e) { console.log('loadAppointmentData error:', e); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const navigateTo = (screen, params = {}) => {
    if (!screen || !navigation) return;
    try { navigation.navigate(screen, params); }
    catch (e) { Alert.alert('Coming Soon', 'This feature is being updated.'); }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    setSearchResults(searchableItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ));
  };

  const handleSearchItemPress = (item) => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    navigateTo(item.screen);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('userData');
          await AsyncStorage.removeItem('userToken');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointmentData();
    await getUserData();
    updateAIInsight();
    setTimeout(() => setRefreshing(false), 800);
  };

  // ── RENDERS ──────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(true)}>
          <Ionicons name="menu-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.logoText}>Sehat<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Line</Text></Text>
            <Text style={styles.logoSub}>CDA Hospital Islamabad</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearchModal(true)}>
            <Ionicons name="search-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigateTo('SettingsScreen')}>
            <Ionicons name="settings-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingHello}>{greeting()},</Text>
          <Text style={styles.greetingName}>{userName} 👋</Text>
          <Text style={styles.greetingSub}>CDA Hospital Islamabad</Text>
        </View>
      </View>
    </View>
  );

  const renderTodayStats = () => (
    <View style={styles.statsContainer}>
      {[
        { label: 'Appointments', value: todayData.operations.appointments, color: COLORS.primary },
        { label: 'Tokens',       value: todayData.operations.tokensIssued, color: '#8B5CF6' },
        { label: 'Served',       value: todayData.operations.patientsServed, color: '#34D399' },
        { label: 'Reports',      value: todayData.operations.reportsUploaded, color: '#F59E0B' },
      ].map((item) => (
        <View key={item.label} style={styles.statBox}>
          <Text style={[styles.statNumber, { color: item.color }]}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );

  const renderMyToken = () => {
    const hasToken = !!activeToken;
    return (
      <View style={[styles.tokenCard, SHADOWS.medium]}>
        <View style={styles.tokenHeader}>
          <Text style={styles.tokenTitle}>My Active Token</Text>
          <TouchableOpacity onPress={() => navigateTo('GenerateTokenScreen')}>
            <Text style={styles.tokenViewAll}>Manage →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tokenContent}>
          <View style={styles.tokenLeft}>
            <Text style={styles.tokenNumber}>{hasToken ? activeToken.token : '---'}</Text>
            <Text style={[styles.tokenStatus, { color: hasToken ? '#34D399' : '#94A3B8' }]}>
              {hasToken ? '● Active' : 'No Token — Tap to Generate'}
            </Text>
            {hasToken && (
              <View style={styles.tokenInfoRow}>
                <Text style={styles.tokenInfoText}>{activeToken.department}</Text>
                <Text style={styles.tokenInfoText}>•</Text>
                <Text style={styles.tokenInfoText}>{activeToken.time}</Text>
              </View>
            )}
          </View>
          <Ionicons name="qr-code" size={52} color={COLORS.primary} />
        </View>
        {hasToken && (
          <View style={styles.tokenActions}>
            <TouchableOpacity style={[styles.tokenActionBtn, { borderColor: COLORS.primary }]}
              onPress={() => Alert.alert('Download', 'Token PDF downloading...')}>
              <Ionicons name="download-outline" size={15} color={COLORS.primary} />
              <Text style={[styles.tokenActionText, { color: COLORS.primary }]}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tokenActionBtn, { borderColor: COLORS.primary }]}
              onPress={() => Alert.alert('Share', 'Sharing token...')}>
              <Ionicons name="share-outline" size={15} color={COLORS.primary} />
              <Text style={[styles.tokenActionText, { color: COLORS.primary }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tokenActionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigateTo('LiveTokenQueueScreen')}>
              <Ionicons name="timer-outline" size={15} color={COLORS.white} />
              <Text style={[styles.tokenActionText, { color: COLORS.white }]}>Track</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tokenActionBtn, { borderColor: '#EF4444' }]}
              onPress={() => { Alert.alert('Cancel Token', 'Are you sure?', [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', style: 'destructive', onPress: () => setActiveToken(null) },
              ]); }}>
              <Ionicons name="close-outline" size={15} color="#EF4444" />
              <Text style={[styles.tokenActionText, { color: '#EF4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderMyTokenButton = () => {
    const hasToken = !!activeToken;
    return (
      <TouchableOpacity
        style={[styles.myTokenButton, SHADOWS.small]}
        onPress={() => setShowTokenDetails(!showTokenDetails)}
        activeOpacity={0.8}
      >
        <View style={[styles.myTokenIcon, { backgroundColor: myTokenAction.color + '18' }]}>
          <Ionicons name={myTokenAction.icon} size={22} color={myTokenAction.color} />
        </View>
        <View style={styles.myTokenContent}>
          <Text style={styles.myTokenName}>My Token</Text>
          {hasToken ? (
            <Text style={styles.myTokenValue}>{activeToken.token}</Text>
          ) : (
            <Text style={styles.myTokenNoToken}>No Token</Text>
          )}
        </View>
        <Ionicons 
          name={showTokenDetails ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={COLORS.textLight} 
        />
      </TouchableOpacity>
    );
  };

  const renderTokenDetailsPopup = () => {
    if (!showTokenDetails || !activeToken) return null;
    
    return (
      <View style={[styles.tokenDetailsPopup, SHADOWS.medium]}>
        <View style={styles.popupHeader}>
          <Text style={styles.popupTitle}>Token Details</Text>
          <TouchableOpacity onPress={() => setShowTokenDetails(false)}>
            <Ionicons name="close" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        <View style={styles.popupRow}>
          <Text style={styles.popupLabel}>Token Number</Text>
          <Text style={styles.popupValue}>{activeToken.token}</Text>
        </View>
        <View style={styles.popupRow}>
          <Text style={styles.popupLabel}>Department</Text>
          <Text style={styles.popupValue}>{activeToken.department || 'OPD'}</Text>
        </View>
        <View style={styles.popupRow}>
          <Text style={styles.popupLabel}>Time</Text>
          <Text style={styles.popupValue}>{activeToken.time || 'N/A'}</Text>
        </View>
        <View style={styles.popupRow}>
          <Text style={styles.popupLabel}>Status</Text>
          <Text style={[styles.popupValue, { color: '#34D399' }]}>Active</Text>
        </View>
        <TouchableOpacity 
          style={styles.popupAction}
          onPress={() => navigateTo('LiveTokenQueueScreen')}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.popupGradient}>
            <Text style={styles.popupActionText}>View in Queue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        {quickActions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.quickCard, SHADOWS.small]}
            onPress={() => navigateTo(item.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.quickName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
        {/* My Token Button - Integrated in Grid */}
        {renderMyTokenButton()}
      </View>
      {renderTokenDetailsPopup()}
    </View>
  );

  const renderAIInsight = () => (
    <View style={[styles.aiCard, SHADOWS.medium]}>
      <LinearGradient
        colors={[COLORS.primary + '12', COLORS.secondary + '08']}
        style={styles.aiGradient}
      >
        <View style={styles.aiHeader}>
          <View style={styles.aiLeft}>
            <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
            <Text style={styles.aiTitle}>AI Queue Insight</Text>
          </View>
          <View style={styles.aiLiveBadge}>
            <View style={styles.aiLiveDot} />
            <Text style={styles.aiLiveText}>Live</Text>
          </View>
        </View>

        {/* Queue Position */}
        <View style={styles.aiPositionContainer}>
          <View style={styles.aiPositionItem}>
            <Text style={styles.aiPositionLabel}>Your Position</Text>
            <Text style={styles.aiPositionValue}>#{aiInsight.queuePosition}</Text>
          </View>
          <View style={styles.aiPositionDivider} />
          <View style={styles.aiPositionItem}>
            <Text style={styles.aiPositionLabel}>Ahead of You</Text>
            <Text style={styles.aiPositionValue}>{aiInsight.totalAhead}</Text>
          </View>
          <View style={styles.aiPositionDivider} />
          <View style={styles.aiPositionItem}>
            <Text style={styles.aiPositionLabel}>Status</Text>
            <Text style={[styles.aiPositionValue, { 
              color: aiInsight.status === 'Next' ? '#34D399' : 
                     aiInsight.status === 'Almost There' ? '#F59E0B' : COLORS.primary 
            }]}>
              {aiInsight.status}
            </Text>
          </View>
        </View>

        <View style={styles.aiContent}>
          <View style={styles.aiItem}>
            <Text style={styles.aiLabel}>Predicted Wait</Text>
            <Text style={styles.aiValue}>{aiInsight.predictedWait}</Text>
          </View>
          <View style={styles.aiDivider} />
          <View style={styles.aiItem}>
            <Text style={styles.aiLabel}>Best Time</Text>
            <Text style={styles.aiValue}>{aiInsight.bestTime}</Text>
          </View>
          <View style={styles.aiDivider} />
          <View style={styles.aiItem}>
            <Text style={styles.aiLabel}>You Save</Text>
            <Text style={[styles.aiValue, { color: '#34D399' }]}>{aiInsight.save}</Text>
          </View>
          <View style={styles.aiDivider} />
          <View style={styles.aiItem}>
            <Text style={styles.aiLabel}>Congestion</Text>
            <Text style={[styles.aiValue, { 
              color: aiInsight.congestion === 'Low' ? '#34D399' : 
                     aiInsight.congestion === 'Moderate' ? '#F59E0B' : '#EF4444' 
            }]}>
              {aiInsight.congestion}
            </Text>
          </View>
        </View>

        <View style={styles.aiTipRow}>
          <Ionicons name="bulb-outline" size={14} color={COLORS.primary} />
          <Text style={styles.aiTip}>💡 {aiInsight.tip}</Text>
        </View>

        <TouchableOpacity 
          style={styles.aiRefreshBtn}
          onPress={updateAIInsight}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
          <Text style={styles.aiRefreshText}>Update Insight</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderModules = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Hospital Modules</Text>
      <View style={styles.modulesRow}>
        {hospitalModules.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.moduleCard, SHADOWS.medium, { borderColor: item.color + '40' }]}
            onPress={() => navigateTo(item.screen)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[item.color + '18', 'transparent']} style={styles.moduleGradient}>
              <View style={[styles.moduleIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.moduleName}>{item.name}</Text>
              <Text style={styles.moduleDesc}>{item.desc}</Text>
              <Text style={[styles.moduleOpen, { color: item.color }]}>Open →</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLiveQueue = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.liveDot} />
          <Text style={styles.sectionTitle}>Live Queue Status</Text>
        </View>
        <TouchableOpacity onPress={() => navigateTo('LiveTokenQueueScreen', { department: 'all' })}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {liveQueue.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.queueCard, SHADOWS.small, { borderLeftColor: item.color, borderLeftWidth: 4 }]}
          onPress={() => navigateTo('LiveTokenQueueScreen', { 
            department: item.dept,
            departmentId: item.id 
          })}
          activeOpacity={0.85}
        >
          <View style={styles.queueLeft}>
            <View style={[styles.queueIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <View>
              <Text style={styles.queueDept}>{item.dept}</Text>
              <Text style={styles.queueCurrent}>Serving: <Text style={{ color: item.color, fontWeight: '700' }}>{item.current}</Text></Text>
            </View>
          </View>
          <View style={styles.queueRight}>
            <Text style={styles.queueWait}>{item.waiting} ahead</Text>
            <Text style={[styles.queueTime, { color: item.color }]}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAnnouncements = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Announcements</Text>
        <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
      </View>
      {[
        { dot: '#EF4444', title: 'Lab Counter 2 Unavailable', sub: 'Patients shifted to Counter 1' },
        { dot: '#F59E0B', title: 'Pharmacy Queue Delayed',    sub: '15 min extra wait expected' },
        { dot: '#10B981', title: 'Reports Ready',             sub: '3 reports ready at Lab Counter' },
      ].map((item, i) => (
        <View key={i} style={[styles.announceCard, SHADOWS.small]}>
          <View style={[styles.announceDot, { backgroundColor: item.dot }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.announceTitle}>{item.title}</Text>
            <Text style={styles.announceSub}>{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
        </View>
      ))}
    </View>
  );

  // ── MODALS ──────────────────────────────────────────────────────────

  const renderSearchModal = () => (
    <Modal
      visible={showSearchModal}
      transparent
      animationType="fade"
      onRequestClose={() => { setShowSearchModal(false); setSearchQuery(''); setSearchResults([]); }}
    >
      <TouchableWithoutFeedback onPress={() => { setShowSearchModal(false); setSearchQuery(''); setSearchResults([]); }}>
        <View style={styles.searchOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.searchModal, SHADOWS.large]}>
              <View style={styles.searchInputRow}>
                <View style={styles.searchInputWrap}>
                  <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search services..."
                    placeholderTextColor={COLORS.textLight}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                      <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity onPress={() => { setShowSearchModal(false); setSearchQuery(''); setSearchResults([]); }}>
                  <Text style={styles.searchCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>

              {searchResults.length > 0 ? (
                <ScrollView style={styles.searchResultsList} showsVerticalScrollIndicator={false}>
                  {searchResults.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.searchResultItem} onPress={() => handleSearchItemPress(item)}>
                      <View style={[styles.searchResultIcon, { backgroundColor: COLORS.primary + '15' }]}>
                        <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      </View>
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.searchEmpty}>
                  <Ionicons name={searchQuery ? 'search-outline' : 'compass-outline'} size={48} color={COLORS.textLight} />
                  <Text style={styles.searchEmptyText}>{searchQuery ? 'No results found' : 'Search for services'}</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderSideMenu = () => (
    <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
      <View style={styles.menuOverlay}>
        <View style={styles.menuContainer}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.menuHeader}>
            {/* Logo Circle - Fixed */}
            <View style={styles.menuLogoCircle}>
              <Image source={require('../../../assets/logo.png')} style={styles.menuLogo} resizeMode="contain" />
            </View>
            <Text style={styles.menuHospital}>SehatLine</Text>
            <Text style={styles.menuAddress}>CDA Hospital, Islamabad</Text>
            <TouchableOpacity style={styles.closeMenuBtn} onPress={() => setShowMenu(false)}>
              <Ionicons name="close-circle" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.menuScroll}>
            {menuItems.map((section, idx) => (
              <View key={idx} style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>{section.section}</Text>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      if (item.isLogout) { handleLogout(); }
                      else { setTimeout(() => navigateTo(item.screen), 250); }
                    }}
                  >
                    <View style={[styles.menuItemIcon, item.isLogout && { backgroundColor: '#EF444415' }]}>
                      <Ionicons name={item.icon} size={16} color={item.isLogout ? '#EF4444' : COLORS.primary} />
                    </View>
                    <Text style={[styles.menuItemText, item.isLogout && { color: '#EF4444' }]}>{item.name}</Text>
                    {!item.isLogout && <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <View style={{ height: hp(4) }} />
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
      </View>
    </Modal>
  );

  // ── ROOT ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.white} />}
          contentContainerStyle={styles.scrollContent}
        >
          {renderTodayStats()}
          {renderMyToken()}
          {renderQuickActions()}
          {renderAIInsight()}
          {renderModules()}
          {renderLiveQueue()}
          {renderAnnouncements()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine v2.0</Text>
            <Text style={styles.footerSub}>CDA Hospital • Islamabad</Text>
          </View>
        </ScrollView>

        {/* Bottom Tab */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomTab} onPress={() => navigation.navigate('HospitalHome')}>
            <Ionicons name="home" size={22} color={COLORS.primary} />
            <Text style={[styles.bottomLabel, styles.activeLabel]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomTab} onPress={() => navigateTo('BookAppointmentScreen')}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.textSecondary} />
            <Text style={styles.bottomLabel}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomTabCenter} onPress={() => navigateTo('GenerateTokenScreen')}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.bottomCenterBtn}>
              <Ionicons name="ticket-outline" size={24} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomTab} onPress={() => navigateTo('LiveTokenQueueScreen')}>
            <Ionicons name="timer-outline" size={22} color={COLORS.textSecondary} />
            <Text style={styles.bottomLabel}>Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomTab} onPress={() => navigateTo('ProfileScreen')}>
            <Ionicons name="person-outline" size={22} color={COLORS.textSecondary} />
            <Text style={styles.bottomLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {renderSideMenu()}
        {renderSearchModal()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  safeArea:    { flex: 1 },
  scrollContent: { paddingBottom: hp(10), paddingTop: hp(0.5) },

  // Header
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : (StatusBar.currentHeight || 24) + hp(0.5),
    paddingBottom: hp(0.5),
  },
  topHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: wp(4), marginBottom: hp(0.8),
  },
  iconBtn: {
    width: wp(9), height: wp(9), borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoWrapper: { flexDirection: 'row', alignItems: 'center', gap: wp(1.5) },
  logoCircle: {
    width: wp(12), height: wp(12), borderRadius: wp(7),
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  logoImage:  { width: wp(10), height: wp(10), borderRadius: wp(5),overflow: 'hidden', },
  logoText:   { color: COLORS.white, fontSize: wp(4.5), fontWeight: '900', letterSpacing: 0.5 },
  logoSub:    { color: COLORS.white, fontSize: wp(2.2), opacity: 0.85, marginTop: hp(0.05) },
  greetingRow:    { paddingHorizontal: wp(4), marginTop: hp(0.5) },
  greetingHello:  { color: COLORS.white, fontSize: wp(3), fontWeight: '500', opacity: 0.9 },
  greetingName:   { color: COLORS.white, fontSize: wp(4.8), fontWeight: '800' },
  greetingSub:    { color: COLORS.white, fontSize: wp(2.5), opacity: 0.7, marginTop: hp(0.05) },

  // Stats
  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: wp(4), marginBottom: hp(1.2),
  },
  statBox: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 10,
    padding: wp(2.5), alignItems: 'center', marginHorizontal: wp(0.5),
    borderWidth: 1, borderColor: COLORS.border,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }, android: { elevation: 2 } }),
  },
  statNumber: { fontSize: wp(4.5), fontWeight: '800', color: COLORS.text },
  statLabel:  { fontSize: wp(2.3), color: COLORS.textSecondary, marginTop: hp(0.05) },

  // Token Card
  tokenCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: wp(3.5),
    marginHorizontal: wp(4), marginBottom: hp(1.2),
    borderWidth: 1, borderColor: COLORS.border,
  },
  tokenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(0.5) },
  tokenTitle:   { fontSize: wp(4), fontWeight: '700', color: COLORS.text },
  tokenViewAll: { fontSize: wp(3), color: COLORS.primary, fontWeight: '600' },
  tokenContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tokenLeft:    { flex: 1 },
  tokenNumber:  { fontSize: wp(7), fontWeight: '900', color: COLORS.text },
  tokenStatus:  { fontSize: wp(2.8), fontWeight: '600', marginTop: hp(0.05) },
  tokenInfoRow: { flexDirection: 'row', gap: 8, marginTop: hp(0.1) },
  tokenInfoText:{ fontSize: wp(2.5), color: COLORS.textSecondary },
  tokenActions: { flexDirection: 'row', gap: 6, marginTop: hp(0.8), flexWrap: 'wrap' },
  tokenActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: wp(2.5), paddingVertical: hp(0.35),
    borderRadius: 8, borderWidth: 1.5,
  },
  tokenActionText: { fontSize: wp(2.4), fontWeight: '600' },

  // Section
  section:        { paddingHorizontal: wp(4), marginBottom: hp(1.2) },
  sectionTitle:   { fontSize: wp(4), fontWeight: '700', color: COLORS.text, marginBottom: hp(0.6) },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(0.6) },
  sectionTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewAllText:    { color: COLORS.primary, fontSize: wp(3), fontWeight: '600' },
  liveDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },

  // Quick Actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickCard: {
    width: (width - wp(12)) / 4, backgroundColor: COLORS.white, borderRadius: 10,
    padding: wp(1.5), alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: hp(0.6),
  },
  quickIcon: { width: wp(9), height: wp(9), borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickName: { fontSize: wp(2.3), color: COLORS.text, textAlign: 'center', marginTop: hp(0.15), fontWeight: '500' },

  // My Token Button
  myTokenButton: {
    width: (width - wp(12)) / 4, 
    backgroundColor: COLORS.white, 
    borderRadius: 10,
    padding: wp(1.5), 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginBottom: hp(0.6),
    position: 'relative',
  },
  myTokenIcon: { 
    width: wp(9), 
    height: wp(9), 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  myTokenContent: {
    alignItems: 'center',
    marginTop: hp(0.1),
  },
  myTokenName: { 
    fontSize: wp(2.3), 
    color: COLORS.text, 
    fontWeight: '500' 
  },
  myTokenValue: {
    fontSize: wp(3),
    fontWeight: '800',
    color: '#06B6D4',
    marginTop: hp(0.05),
  },
  myTokenNoToken: {
    fontSize: wp(2.3),
    color: COLORS.textLight,
    marginTop: hp(0.05),
  },

  // Token Details Popup
  tokenDetailsPopup: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(3),
    marginTop: hp(0.3),
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
    paddingBottom: hp(0.3),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  popupTitle: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  popupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.2),
  },
  popupLabel: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  popupValue: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
  },
  popupAction: {
    marginTop: hp(0.5),
    borderRadius: 8,
    overflow: 'hidden',
  },
  popupGradient: {
    paddingVertical: hp(0.6),
    alignItems: 'center',
  },
  popupActionText: {
    color: COLORS.white,
    fontSize: wp(3),
    fontWeight: '600',
  },

  // AI Card
  aiCard: {
    marginHorizontal: wp(4), marginBottom: hp(1.2),
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  aiGradient: { padding: wp(3.5) },
  aiHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(0.6) },
  aiLeft:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiTitle:    { fontSize: wp(3.5), fontWeight: '700', color: COLORS.text },
  aiLiveBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#34D39918', paddingHorizontal: wp(2), paddingVertical: hp(0.15), borderRadius: 10 },
  aiLiveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' },
  aiLiveText: { fontSize: wp(2.2), color: '#34D399', fontWeight: '700' },

  // AI Position
  aiPositionContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 10,
    padding: wp(2),
    marginBottom: hp(0.6),
  },
  aiPositionItem: {
    flex: 1,
    alignItems: 'center',
  },
  aiPositionLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
  },
  aiPositionValue: {
    fontSize: wp(3.5),
    fontWeight: '800',
    color: COLORS.text,
    marginTop: hp(0.05),
  },
  aiPositionDivider: {
    width: 1,
    height: hp(3),
    backgroundColor: COLORS.border,
  },

  aiContent:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(0.6) },
  aiItem:     { flex: 1, alignItems: 'center' },
  aiDivider:  { width: 1, height: 28, backgroundColor: COLORS.border },
  aiLabel:    { fontSize: wp(2.2), color: COLORS.textSecondary },
  aiValue:    { fontSize: wp(3.2), fontWeight: '700', color: COLORS.text, marginTop: hp(0.1) },
  aiTipRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: hp(0.5), borderTopWidth: 1, borderTopColor: COLORS.border + '60' },
  aiTip:      { flex: 1, fontSize: wp(2.6), color: COLORS.textSecondary },
  
  aiRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: hp(0.5),
    paddingVertical: hp(0.3),
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
  },
  aiRefreshText: {
    fontSize: wp(2.6),
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Modules
  modulesRow: { flexDirection: 'row', gap: wp(2.5) },
  moduleCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 12,
    overflow: 'hidden', borderWidth: 1.5,
  },
  moduleGradient: { padding: wp(3) },
  moduleIcon:     { width: wp(10), height: wp(10), borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: hp(0.4) },
  moduleName:     { fontSize: wp(3.2), fontWeight: '700', color: COLORS.text },
  moduleDesc:     { fontSize: wp(2.3), color: COLORS.textSecondary, marginTop: hp(0.1) },
  moduleOpen:     { fontSize: wp(2.6), fontWeight: '700', marginTop: hp(0.4) },

  // Live Queue
  queueCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 10, padding: wp(2.5),
    marginBottom: hp(0.6), borderWidth: 1, borderColor: COLORS.border,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 }, android: { elevation: 2 } }),
  },
  queueLeft:  { flexDirection: 'row', alignItems: 'center', gap: wp(2.5) },
  queueIcon:  { width: wp(9), height: wp(9), borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  queueDept:  { fontSize: wp(3.2), fontWeight: '600', color: COLORS.text },
  queueCurrent: { fontSize: wp(2.5), color: COLORS.textSecondary, marginTop: hp(0.1) },
  queueRight: { alignItems: 'flex-end' },
  queueWait:  { fontSize: wp(2.6), color: COLORS.textSecondary, fontWeight: '500' },
  queueTime:  { fontSize: wp(2.8), fontWeight: '700' },

  // Announcements
  announceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: wp(2.5), borderRadius: 10, marginBottom: hp(0.5),
    borderWidth: 1, borderColor: COLORS.border,
  },
  announceDot:  { width: 4, height: 30, borderRadius: 2, marginRight: wp(2.5) },
  announceTitle:{ fontSize: wp(3.2), fontWeight: '600', color: COLORS.text },
  announceSub:  { fontSize: wp(2.5), color: COLORS.textSecondary, marginTop: hp(0.05) },

  // Footer
  footer: {
    alignItems: 'center', paddingVertical: hp(1.5),
    borderTopWidth: 1, borderTopColor: COLORS.border, marginHorizontal: wp(4), marginTop: hp(0.5),
  },
  footerText: { color: COLORS.primary, fontSize: wp(3), fontWeight: '600' },
  footerSub:  { color: COLORS.textSecondary, fontSize: wp(2.3), marginTop: hp(0.1) },

  // Bottom Tab
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    paddingTop: hp(0.6), paddingBottom: Platform.OS === 'ios' ? hp(3) : hp(0.8),
    paddingHorizontal: wp(1), borderTopWidth: 1, borderTopColor: COLORS.border,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 8 } }),
  },
  bottomTab:      { flex: 1, alignItems: 'center', paddingVertical: hp(0.1) },
  bottomTabCenter:{ flex: 1, alignItems: 'center', marginTop: -hp(2.5) },
  bottomCenterBtn:{
    width: wp(13), height: wp(13), borderRadius: wp(6.5),
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.white,
    ...Platform.select({ ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }, android: { elevation: 8 } }),
  },
  bottomLabel:  { color: COLORS.textSecondary, fontSize: wp(2.1), marginTop: hp(0.1), fontWeight: '500' },
  activeLabel:  { color: COLORS.primary, fontWeight: '700' },

  // Side Menu - Logo Circle Fixed
  menuOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', flexDirection: 'row' },
  menuContainer:  { width: width * 0.78, height: '100%', backgroundColor: COLORS.white },
  menuBackdrop:   { flex: 1 },
  menuHeader: {
    paddingTop: Platform.OS === 'ios' ? hp(5) : hp(3),
    paddingBottom: hp(2), alignItems: 'center', position: 'relative',
  },
  menuLogoCircle: {
    width: wp(16), 
    height: wp(16), 
    borderRadius: wp(8), // Circle
    backgroundColor: 'rgba(255,255,255,0.25)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: hp(0.5), 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden', // Ensures image stays in circle
  },
  menuLogo: { 
    width: wp(13), 
    height: wp(13),
    borderRadius: wp(7),
    resizeMode: 'contain',
  },
  menuHospital:   { color: COLORS.white, fontSize: wp(4.2), fontWeight: '800' },
  menuAddress:    { color: COLORS.white, fontSize: wp(2.6), marginTop: hp(0.1), opacity: 0.85 },
  closeMenuBtn:   { position: 'absolute', top: Platform.OS === 'ios' ? hp(5) : hp(3), right: wp(3) },
  menuScroll:     { flex: 1 },
  menuSection:    { marginBottom: hp(0.2) },
  menuSectionTitle:{ fontSize: wp(2.8), fontWeight: '800', color: '#1E293B', paddingHorizontal: wp(4), paddingTop: hp(0.8), paddingBottom: hp(0.1), letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: hp(0.6),
    paddingHorizontal: wp(4), borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: wp(2.5),
  },
  menuItemIcon:   { width: wp(7.5), height: wp(7.5), borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary + '12' },
  menuItemText:   { flex: 1, color: COLORS.text, fontSize: wp(3), fontWeight: '500' },

  // Search Modal
  searchOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-start' },
  searchModal: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(5) : hp(2.5),
    paddingBottom: hp(2), maxHeight: height * 0.82,
  },
  searchInputRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: hp(1) },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary || '#F5F6FA',
    borderRadius: 10, paddingHorizontal: wp(2.5), gap: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput:      { flex: 1, color: COLORS.text, fontSize: wp(3.2), paddingVertical: Platform.OS === 'ios' ? hp(0.7) : hp(0.4) },
  searchCancel:     { color: COLORS.primary, fontSize: wp(3.2), fontWeight: '600' },
  searchResultsList:{ maxHeight: height * 0.58 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(0.9), borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  searchResultIcon: { width: wp(9), height: wp(9), borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  searchResultName: { flex: 1, color: COLORS.text, fontSize: wp(3.2), fontWeight: '600' },
  searchEmpty:      { alignItems: 'center', paddingVertical: hp(4), gap: hp(0.5) },
  searchEmptyText:  { color: COLORS.textSecondary, fontSize: wp(3.5), fontWeight: '600' },
});

export default HospitalHomeScreen;