import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Responsive functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;
const isTablet = width >= 768;
const isIOS = Platform.OS === 'ios';
const statusBarHeight = getStatusBarHeight();

// Custom Drawer Menu Component
const DrawerMenu = ({ visible, onClose, navigation, darkMode }) => {
  const translateX = useSharedValue(-width);
  
  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateX.value = withSpring(-width);
    }
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'grid-outline', screen: null, color: COLORS.primary },
    { id: 'chronic', name: 'Chronic Care Management', icon: 'heart-outline', screen: 'ChronicPortal', color: '#FF4D6D' },
    { id: 'pharmacy', name: 'Pharmacy Management', icon: 'medkit-outline', screen: 'MedicineListScreen', color: COLORS.success },
    { id: 'laboratory', name: 'Laboratory Management', icon: 'flask-outline', screen: 'LabTestsPriceScreen', color: COLORS.appointment },
    { id: 'doctors', name: 'Doctors Management', icon: 'people-outline', screen: 'ManageDoctorsScreen', color: COLORS.primary },
    { id: 'patients', name: 'Patients Records', icon: 'person-outline', screen: 'ManageUsersScreen', color: COLORS.warning },
    { id: 'appointments', name: 'Appointments', icon: 'calendar-outline', screen: 'AppointmentListScreen', color: '#EC4899' },
    { id: 'reports', name: 'Reports & Analytics', icon: 'stats-chart-outline', screen: 'ReportsListScreen', color: COLORS.appointment },
    { id: 'settings', name: 'Settings', icon: 'settings-outline', screen: 'SettingsScreen', color: COLORS.textSecondary },
  ];
  
  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.drawerOverlay}>
        <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.drawerContainer, { backgroundColor: darkMode ? '#0A1520' : COLORS.white }, animatedStyle]}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.drawerHeader}>
            <View style={styles.drawerLogoOutline}>
              <Image source={require('../../../assets/logo.png')} style={styles.drawerLogo} />
            </View>
            <Text style={styles.drawerTitle}>SehatLine Admin</Text>
            <Text style={styles.drawerSubtitle}>Hospital Management System</Text>
          </LinearGradient>
          
          <ScrollView showsVerticalScrollIndicator={false} style={styles.drawerMenu}>
            {menuItems.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.drawerMenuItem}
                onPress={() => {
                  onClose();
                  if (item.screen) {
                    navigation.navigate(item.screen);
                  }
                }}
              >
                <View style={[styles.drawerIconCircle, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.drawerMenuItemText, { color: darkMode ? COLORS.white : COLORS.text }]}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={darkMode ? COLORS.textSecondary : COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={[styles.drawerFooter, { borderTopColor: darkMode ? '#334155' : COLORS.border }]}>
            <TouchableOpacity style={styles.drawerFooterItem} onPress={() => navigation.replace('Login')}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
              <Text style={[styles.drawerFooterText, { color: COLORS.danger }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const AdminDashboardScreen = ({ navigation }) => {
  // Animation Values
  const contentOpacity = useSharedValue(0);
  const headerSlide = useSharedValue(-30);
  const logoScale = useSharedValue(0.8);
  const logoGlow = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // Modal States
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('weekly');

  // Admin Detail Modal States
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showAdminDetailModal, setShowAdminDetailModal] = useState(false);

  // Chart Data based on period
  const getChartData = () => {
    switch(chartPeriod) {
      case 'daily':
        return {
          chronic: [12, 15, 9, 14, 16, 19, 13, 11, 17, 15, 14, 16, 23, 12],
          pharmacy: [22, 25, 20, 24, 26, 29, 23, 21, 30, 25, 24, 26, 28, 22],
          lab: [16, 19,12, 18, 20, 23, 17, 15, 21, 19, 18, 20, 22, 16],
          labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM']
        };
      case 'weekly':
        return {
          chronic: [45, 52, 48, 61, 58, 65, 72],
          pharmacy: [78, 82, 91, 88, 95, 92, 89],
          lab: [56, 62, 58, 71, 68, 75, 82],
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        };
      case 'monthly':
        return {
          chronic: [180, 220, 195, 210, 230, 245, 260, 275, 290, 310, 325, 340],
          pharmacy: [310, 340, 365, 380, 395, 410, 430, 445, 460, 480, 495, 510],
          lab: [220, 250, 235, 260, 280, 295, 310, 325, 340, 355, 370, 385],
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };
      case 'yearly':
        return {
          chronic: [1850, 2100, 2350, 2580, 2847],
          pharmacy: [2100, 2450, 2780, 3120, 3421],
          lab: [1950, 2280, 2650, 2980, 5678],
          labels: ['2020', '2021', '2022', '2023', '2024']
        };
      default:
        return {
          chronic: [45, 52, 48, 61, 58, 65, 72],
          pharmacy: [78, 82, 91, 88, 95, 92, 89],
          lab: [56, 62, 58, 71, 68, 75, 82],
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        };
    }
  };

  const chartData = getChartData();
  const maxChronic = Math.max(...chartData.chronic);
  const maxPharmacy = Math.max(...chartData.pharmacy);
  const maxLab = Math.max(...chartData.lab);

  // Logo Animation
  useEffect(() => {
    logoScale.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    logoGlow.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    shadowOpacity: interpolate(logoGlow.value, [0, 1], [0.3, 0.8]),
    shadowRadius: interpolate(logoGlow.value, [0, 1], [5, 15]),
  }));

  // Core Module Stats
  const [stats, setStats] = useState({
    chronicPatients: 2847,
    activeChronicPlans: 1892,
    chronicFollowups: 156,
    criticalChronic: 23,
    diabetesPatients: 1245,
    hypertensionPatients: 892,
    asthmaPatients: 456,
    heartDiseasePatients: 254,
    totalOrders: 3421,
    pendingOrders: 89,
    completedOrders: 3210,
    lowStockMedicines: 15,
    totalTests: 5678,
    pendingReports: 67,
    urgentTests: 23,
    totalPatients: 15842,
    newPatientsThisMonth: 1245,
    activeDoctors: 124,
    todayAppointments: 456,
    monthlyRevenue: 284500,
    patientSatisfaction: 94,
  });

  // Admin Team Members
  const [adminTeam, setAdminTeam] = useState([
    { 
      id: 1, 
      name: 'Dr. Ahmed Hassan', 
      role: 'Chief Administrator', 
      department: 'Hospital Management', 
      experience: '15 years', 
      avatar: 'AH', 
      status: 'active', 
      color: '#FF4D6D', 
      color2: '#E63946',
      email: 'ahmed.hassan@sehatline.com',
      phone: '+92 321 1234567',
      location: 'Karachi, Pakistan',
      joined: '2015',
      teamSize: '25',
      bio: 'Leading hospital operations with 15+ years of experience in healthcare management.',
      qualifications: 'MBBS, MPH, MBA',
      certifications: 'Certified Hospital Administrator',
      languages: 'English, Urdu, Arabic',
      schedule: 'Mon-Fri 9AM-5PM',
      achievements: 'Best Hospital Administrator Award 2022',
      patientsHandled: '50,000+',
      rating: 4.9
    },
    { 
      id: 2, 
      name: 'Sarah Khan', 
      role: 'HR Manager', 
      department: 'Human Resources', 
      experience: '10 years', 
      avatar: 'SK', 
      status: 'active', 
      color: '#10B981', 
      color2: '#059669',
      email: 'sarah.khan@sehatline.com',
      phone: '+92 322 2345678',
      location: 'Lahore, Pakistan',
      joined: '2018',
      teamSize: '12',
      bio: 'Expert in talent acquisition and employee relations in healthcare sector.',
      qualifications: 'MBA HR, BBA',
      certifications: 'SHRM Certified',
      languages: 'English, Urdu',
      schedule: 'Mon-Fri 9AM-5PM',
      achievements: 'HR Excellence Award 2023',
      employeesManaged: '500+',
      rating: 4.8
    },
    { 
      id: 3, 
      name: 'Usman Chaudhry', 
      role: 'Finance Director', 
      department: 'Accounts & Finance', 
      experience: '12 years', 
      avatar: 'UC', 
      status: 'active', 
      color: '#F59E0B', 
      color2: '#D97706',
      email: 'usman.chaudhry@sehatline.com',
      phone: '+92 323 3456789',
      location: 'Islamabad, Pakistan',
      joined: '2016',
      teamSize: '18',
      bio: 'Financial strategist managing hospital budgets and revenue streams.',
      qualifications: 'CA, ACCA',
      certifications: 'Certified Financial Analyst',
      languages: 'English, Urdu, Punjabi',
      schedule: 'Mon-Fri 9AM-5PM',
      achievements: 'Best Finance Director Award 2021',
      budgetManaged: '₨500M+',
      rating: 4.9
    },
    { 
      id: 4, 
      name: 'Fatima Ali', 
      role: 'Operations Manager', 
      department: 'Hospital Operations', 
      experience: '8 years', 
      avatar: 'FA', 
      status: 'active', 
      color: '#8B5CF6', 
      color2: '#6D28D9',
      email: 'fatima.ali@sehatline.com',
      phone: '+92 324 4567890',
      location: 'Rawalpindi, Pakistan',
      joined: '2019',
      teamSize: '30',
      bio: 'Streamlining daily operations and patient flow management.',
      qualifications: 'MBA Operations, BSc',
      certifications: 'Lean Six Sigma Black Belt',
      languages: 'English, Urdu',
      schedule: 'Mon-Sat 8AM-4PM',
      achievements: 'Operational Excellence Award 2023',
      patientsFlowManaged: '100,000+',
      rating: 4.9
    },
    { 
      id: 5, 
      name: 'Zainab Malik', 
      role: 'IT Director', 
      department: 'Technology & Innovation', 
      experience: '9 years', 
      avatar: 'ZM', 
      status: 'active', 
      color: '#EC4899', 
      color2: '#BE185D',
      email: 'zainab.malik@sehatline.com',
      phone: '+92 325 5678901',
      location: 'Karachi, Pakistan',
      joined: '2017',
      teamSize: '22',
      bio: 'Leading digital transformation and healthcare technology initiatives.',
      qualifications: 'MS Computer Science, BS Software Engineering',
      certifications: 'AWS Certified, PMP',
      languages: 'English, Urdu',
      schedule: 'Mon-Fri 9AM-5PM',
      achievements: 'Digital Innovation Award 2023',
      projectsCompleted: '45+',
      rating: 4.9
    },
  ]);

  // Form States
  const [newPatient, setNewPatient] = useState({
    name: '', age: '', gender: 'Male', phone: '', address: '', bloodGroup: '', disease: '', doctor: '', module: 'Chronic'
  });
  
  const [newDoctor, setNewDoctor] = useState({
    name: '', specialty: '', email: '', phone: '', experience: '', qualification: '', fee: '', shift: 'Morning'
  });

  // Data Lists
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, text: 'New chronic patient enrolled: Muhammad Ali', time: '5 mins ago', icon: 'heart', color: '#FF4D6D', module: 'Chronic' },
    { id: 2, text: 'Pharmacy order #3421 delivered', time: '12 mins ago', icon: 'medkit', color: '#10B981', module: 'Pharmacy' },
    { id: 3, text: 'Lab reports for 15 patients pending review', time: '34 mins ago', icon: 'flask', color: '#8B5CF6', module: 'Laboratory' },
    { id: 4, text: 'Emergency medication restocked', time: '1 hour ago', icon: 'medkit', color: '#10B981', module: 'Pharmacy' },
    { id: 5, text: 'Critical chronic patient follow-up scheduled', time: '2 hours ago', icon: 'heart', color: '#FF4D6D', module: 'Chronic' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Critical Chronic Patient', message: 'Patient with high BP needs immediate attention', time: '5 mins ago', read: false, type: 'error', module: 'Chronic' },
    { id: 2, title: 'Low Stock Alert', message: 'Insulin supplies running low', time: '12 mins ago', read: false, type: 'warning', module: 'Pharmacy' },
    { id: 3, title: 'Lab Reports Ready', message: '15 lab reports are pending review', time: '34 mins ago', read: false, type: 'info', module: 'Laboratory' },
    { id: 4, title: 'New Chronic Patient', message: 'Patient enrolled in diabetes care program', time: '2 hours ago', read: true, type: 'success', module: 'Chronic' },
  ]);

  const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read).length);

  // Entrance Animation
  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 1000 });
    headerSlide.value = withDelay(200, withSpring(0));
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerSlide.value }],
  }));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setStats(prev => ({ 
        ...prev, 
        totalPatients: prev.totalPatients + Math.floor(Math.random() * 50),
      }));
      setRecentActivities([{
        id: Date.now(),
        text: 'Dashboard data refreshed successfully',
        time: 'Just now',
        icon: 'refresh',
        color: COLORS.primary,
        module: 'System'
      }, ...recentActivities]);
      setRefreshing(false);
      Alert.alert('Refreshed', 'Dashboard data updated successfully');
    }, 1500);
  }, []);

  // Render Bar Chart
  const renderModuleChart = (data, max, color) => (
    <View style={styles.chartContainer}>
      {data.map((value, index) => (
        <View key={index} style={styles.chartBarItem}>
          <View style={styles.chartBarWrapper}>
            <View 
              style={[
                styles.chartBar,
                { 
                  height: (value / max) * (isTablet ? 100 : 80),
                  backgroundColor: color
                }
              ]} 
            />
            <Text style={styles.chartBarValue}>{value}</Text>
          </View>
          <Text style={styles.chartBarLabel}>{chartData.labels[index]}</Text>
        </View>
      ))}
    </View>
  );

  // Section Header Component
  const SectionHeader = ({ title, icon, onPress, buttonText }) => (
    <View style={styles.sectionHeaderWrapper}>
      <View style={styles.sectionHeaderBg}>
        <View style={styles.sectionHeaderLeft}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.sectionHeaderIcon}>
            <Ionicons name={icon} size={20} color={COLORS.white} />
          </LinearGradient>
          <Text style={[styles.sectionHeaderTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>{title}</Text>
        </View>
        {onPress && (
          <TouchableOpacity style={styles.sectionHeaderButton} onPress={onPress}>
            <Text style={styles.sectionHeaderButtonText}>{buttonText || 'View All →'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#0A1520' : COLORS.background }]}>
      <StatusBar 
        barStyle={darkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Drawer Menu */}
      <DrawerMenu 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
        navigation={navigation}
        darkMode={darkMode}
      />
      
      <LinearGradient
        colors={darkMode ? 
          ['#0A1520', '#0A1520', '#0A1520'] :
          [COLORS.primary, COLORS.secondary, COLORS.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: darkMode ? 0.1 : 0.2 }}
        style={styles.gradientBackground}
      />

      {/* Header with Back Button */}
      <Animated.View style={[styles.header, animatedHeaderStyle, { 
        backgroundColor: darkMode ? 'rgba(10, 21, 32, 0.98)' : 'rgba(255,255,255,0.98)',
        borderBottomColor: darkMode ? '#334155' : COLORS.border,
        borderBottomWidth: 1,
      }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {/* Back Button - Navigates to Home */}
            <TouchableOpacity onPress={() => navigation.navigate('MainApp')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Animated.View style={[styles.logoOutlineContainer, animatedLogoStyle]}>
              <View style={[styles.logoCircle, { borderColor: COLORS.primary }]}>
                <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
              </View>
            </Animated.View>
            
            <View>
              <Text style={[styles.headerTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>ADMIN PANEL</Text>
              <Text style={[styles.headerSubtitle, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>SehatLine Hospital</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNotificationModal(true)} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuBtn}>
              <Ionicons name="menu" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      >
        {/* Welcome Card */}
        <FadeInUpView delay={300} style={styles.welcomeWrapper}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeCard}
          >
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeTitle}>Welcome back, Admin</Text>
              <Text style={styles.welcomeSubtitle}>Complete Healthcare Management Dashboard</Text>
              <View style={styles.statsRow}>
                <View style={styles.welcomeStat}>
                  <Text style={styles.welcomeStatValue}>{stats.newPatientsThisMonth}</Text>
                  <Text style={styles.welcomeStatLabel}>New Patients</Text>
                </View>
                <View style={styles.welcomeStatDivider} />
                <View style={styles.welcomeStat}>
                  <Text style={styles.welcomeStatValue}>{stats.patientSatisfaction}%</Text>
                  <Text style={styles.welcomeStatLabel}>Satisfaction</Text>
                </View>
                <View style={styles.welcomeStatDivider} />
                <View style={styles.welcomeStat}>
                  <Text style={styles.welcomeStatValue}>₨{Math.floor(stats.monthlyRevenue/1000)}K</Text>
                  <Text style={styles.welcomeStatLabel}>Revenue</Text>
                </View>
              </View>
            </View>
            <Ionicons name="shield-checkmark" size={60} color={COLORS.white} style={styles.welcomeIcon} />
          </LinearGradient>
        </FadeInUpView>

        {/* Core Modules Section */}
        <SectionHeader 
          title="Core Modules" 
          icon="apps-outline" 
        />
        <View style={styles.modulesGrid}>
          {/* Chronic Care Module */}
          <TouchableOpacity 
            style={[styles.moduleCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: '#FF4D6D' }]}
            onPress={() => navigation.navigate('ChronicPortal')}
          >
            <LinearGradient colors={['rgba(255, 77, 109, 0.15)', 'transparent']} style={styles.moduleGradient}>
              <View style={[styles.moduleIcon, { backgroundColor: 'rgba(255, 77, 109, 0.2)' }]}>
                <Ionicons name="heart" size={32} color="#FF4D6D" />
              </View>
              <Text style={[styles.moduleTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Chronic Care</Text>
              <Text style={[styles.moduleValue, { color: '#FF4D6D' }]}>{stats.chronicPatients}</Text>
              <Text style={[styles.moduleLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Active Patients</Text>
              <View style={styles.moduleStats}>
                <View style={styles.moduleStatItem}>
                  <Text style={[styles.moduleStatValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.activeChronicPlans}</Text>
                  <Text style={[styles.moduleStatLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Active Plans</Text>
                </View>
                <View style={styles.moduleStatDivider} />
                <View style={styles.moduleStatItem}>
                  <Text style={[styles.moduleStatValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.criticalChronic}</Text>
                  <Text style={[styles.moduleStatLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Critical</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.moduleBtn, { backgroundColor: '#FF4D6D' }]} onPress={() => navigation.navigate('ChronicPortal')}>
                <Text style={styles.moduleBtnText}>Manage Chronic Care</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>

          {/* Pharmacy Module */}
          <TouchableOpacity 
            style={[styles.moduleCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: COLORS.success }]}
            onPress={() => navigation.navigate('MedicineListScreen')}
          >
            <LinearGradient colors={['rgba(16, 185, 129, 0.15)', 'transparent']} style={styles.moduleGradient}>
              <View style={[styles.moduleIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="medkit" size={32} color={COLORS.success} />
              </View>
              <Text style={[styles.moduleTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Pharmacy</Text>
              <Text style={[styles.moduleValue, { color: COLORS.success }]}>{stats.totalOrders}</Text>
              <Text style={[styles.moduleLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Total Orders</Text>
              <View style={styles.moduleStats}>
                <View style={styles.moduleStatItem}>
                  <Text style={[styles.moduleStatValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.pendingOrders}</Text>
                  <Text style={[styles.moduleStatLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Pending</Text>
                </View>
                <View style={styles.moduleStatDivider} />
                <View style={styles.moduleStatItem}>
                  <Text style={[styles.moduleStatValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.lowStockMedicines}</Text>
                  <Text style={[styles.moduleStatLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Low Stock</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.moduleBtn, { backgroundColor: COLORS.success }]} onPress={() => navigation.navigate('MedicineListScreen')}>
                <Text style={styles.moduleBtnText}>Manage Pharmacy</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>

          {/* Laboratory Module */}
          <TouchableOpacity 
            style={[styles.moduleCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: COLORS.appointment }]}
            onPress={() => navigation.navigate('LabTestsPriceScreen')}
          >
            <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'transparent']} style={styles.moduleGradient}>
              <View style={[styles.moduleIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Ionicons name="flask" size={32} color={COLORS.appointment} />
              </View>
              <Text style={[styles.moduleTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Laboratory</Text>
              <Text style={[styles.moduleValue, { color: COLORS.appointment }]}>{stats.totalTests}</Text>
              <Text style={[styles.moduleLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Total Tests</Text>
              <View style={styles.moduleStats}>
                <View style={styles.moduleStatItem}>
                  <Text style={[styles.moduleStatValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.pendingReports}</Text>
                  <Text style={[styles.moduleStatLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Pending</Text>
                </View>
                <View style={styles.moduleStatDivider} />
                <View style={styles.moduleStatItem}>
                  <Text style={[styles.moduleStatValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.urgentTests}</Text>
                  <Text style={[styles.moduleStatLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Urgent</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.moduleBtn, { backgroundColor: COLORS.appointment }]} onPress={() => navigation.navigate('LabTestsPriceScreen')}>
                <Text style={styles.moduleBtnText}>Manage Laboratory</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Overview Section */}
        <SectionHeader 
          title="Quick Overview" 
          icon="stats-chart-outline" 
          onPress={() => Alert.alert('All Stats', 'View complete statistics')}
        />
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: darkMode ? '#334155' : COLORS.border }]} onPress={() => navigation.navigate('ManageUsersScreen')}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.statValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.totalPatients.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Total Patients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.statCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: darkMode ? '#334155' : COLORS.border }]} onPress={() => navigation.navigate('ManageDoctorsScreen')}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="medkit" size={24} color={COLORS.success} />
            </View>
            <Text style={[styles.statValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.activeDoctors}</Text>
            <Text style={[styles.statLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Active Doctors</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.statCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: darkMode ? '#334155' : COLORS.border }]} onPress={() => navigation.navigate('AppointmentListScreen')}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="calendar" size={24} color={COLORS.warning} />
            </View>
            <Text style={[styles.statValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{stats.todayAppointments}</Text>
            <Text style={[styles.statLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Today's Appointments</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Team Section */}
        <SectionHeader 
          title="Leadership Team" 
          icon="people-circle-outline" 
          onPress={() => Alert.alert('Leadership Team', 'View all admin team members')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminTeamScroll}>
          {adminTeam.map((admin) => (
            <TouchableOpacity 
              key={admin.id} 
              activeOpacity={0.9}
              onPress={() => {
                setSelectedAdmin(admin);
                setShowAdminDetailModal(true);
              }}
            >
              <LinearGradient
                colors={darkMode ? ['rgba(15, 23, 42, 0.95)', 'rgba(15, 23, 42, 0.85)'] : [COLORS.white, COLORS.backgroundSecondary]}
                style={[styles.adminCard, { borderColor: admin.color }]}
              >
                {/* Profile Header with Gradient */}
                <LinearGradient 
                  colors={[admin.color, admin.color2]} 
                  style={styles.adminCardHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.adminAvatarLarge}>
                    <Text style={styles.adminAvatarLargeText}>{admin.avatar}</Text>
                  </View>
                  <View style={[styles.adminStatusBadge, { backgroundColor: admin.status === 'active' ? COLORS.success : '#94A3B8' }]}>
                    <Text style={styles.adminStatusBadgeText}>{admin.status === 'active' ? 'Active' : 'Away'}</Text>
                  </View>
                </LinearGradient>
                
                {/* Profile Details */}
                <View style={styles.adminCardBody}>
                  <Text style={[styles.adminNameLarge, { color: darkMode ? COLORS.white : COLORS.text }]}>{admin.name}</Text>
                  <Text style={[styles.adminRoleLarge, { color: admin.color }]}>{admin.role}</Text>
                  
                  {/* Rating Stars */}
                  <View style={styles.adminRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons 
                        key={star} 
                        name={star <= Math.floor(admin.rating) ? "star" : star <= admin.rating ? "star-half" : "star-outline"} 
                        size={14} 
                        color="#FFB800" 
                      />
                    ))}
                    <Text style={[styles.adminRatingText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>({admin.rating})</Text>
                  </View>
                  
                  {/* Info Grid */}
                  <View style={styles.adminInfoGrid}>
                    <View style={styles.adminInfoItem}>
                      <Ionicons name="briefcase-outline" size={14} color={admin.color} />
                      <Text style={[styles.adminInfoText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{admin.experience}</Text>
                    </View>
                    <View style={styles.adminInfoItem}>
                      <Ionicons name="people-outline" size={14} color={admin.color} />
                      <Text style={[styles.adminInfoText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{admin.teamSize} members</Text>
                    </View>
                    <View style={styles.adminInfoItem}>
                      <Ionicons name="location-outline" size={14} color={admin.color} />
                      <Text style={[styles.adminInfoText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]} numberOfLines={1}>{admin.location.split(',')[0]}</Text>
                    </View>
                  </View>
                  
                  {/* View Profile Button */}
                  <LinearGradient
                    colors={[`${admin.color}20`, `${admin.color}05`]}
                    style={[styles.adminViewBtn, { borderColor: `${admin.color}30` }]}
                  >
                    <Text style={[styles.adminViewBtnText, { color: admin.color }]}>View Full Profile</Text>
                    <Ionicons name="arrow-forward" size={14} color={admin.color} />
                  </LinearGradient>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Admin Detail Modal */}
        <Modal
          visible={showAdminDetailModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAdminDetailModal(false)}
        >
          <TouchableOpacity 
            style={styles.adminDetailOverlay} 
            activeOpacity={1} 
            onPress={() => setShowAdminDetailModal(false)}
          >
            <View style={[styles.adminDetailModal, { backgroundColor: darkMode ? '#0A1520' : COLORS.white }]}>
              <TouchableOpacity 
                style={styles.adminDetailClose}
                onPress={() => setShowAdminDetailModal(false)}
              >
                <Ionicons name="close" size={24} color={darkMode ? COLORS.white : COLORS.text} />
              </TouchableOpacity>
              
              {selectedAdmin && (
                <>
                  <View style={styles.adminDetailAvatarContainer}>
                    <LinearGradient 
                      colors={[selectedAdmin.color, selectedAdmin.color2]} 
                      style={styles.adminDetailAvatarBorder}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.adminDetailAvatarText}>{selectedAdmin.avatar}</Text>
                    </LinearGradient>
                    
                    <View style={[styles.adminDetailStatus, { backgroundColor: selectedAdmin.status === 'active' ? COLORS.success : COLORS.textSecondary }]}>
                      <Text style={styles.adminDetailStatusText}>
                        {selectedAdmin.status === 'active' ? 'Active' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.adminDetailName, { color: darkMode ? COLORS.white : COLORS.text }]}>{selectedAdmin.name}</Text>
                  <Text style={[styles.adminDetailRole, { color: selectedAdmin.color }]}>{selectedAdmin.role}</Text>
                  
                  {/* Rating */}
                  <View style={styles.adminDetailRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons 
                        key={star} 
                        name={star <= Math.floor(selectedAdmin.rating) ? "star" : star <= selectedAdmin.rating ? "star-half" : "star-outline"} 
                        size={20} 
                        color="#FFB800" 
                      />
                    ))}
                    <Text style={[styles.adminDetailRatingText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>({selectedAdmin.rating})</Text>
                  </View>
                  
                  <ScrollView style={styles.adminDetailInfoScroll} showsVerticalScrollIndicator={false}>
                    <View style={[styles.adminDetailBio, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Text style={[styles.adminDetailBioText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.bio}</Text>
                    </View>
                    
                    <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Professional Information</Text>
                    <View style={styles.adminDetailGrid}>
                      <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                        <Ionicons name="business-outline" size={20} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailCardLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Department</Text>
                        <Text style={[styles.adminDetailCardValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{selectedAdmin.department}</Text>
                      </View>
                      
                      <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                        <Ionicons name="briefcase-outline" size={20} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailCardLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Experience</Text>
                        <Text style={[styles.adminDetailCardValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{selectedAdmin.experience}</Text>
                      </View>
                      
                      <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                        <Ionicons name="calendar-outline" size={20} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailCardLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Joined</Text>
                        <Text style={[styles.adminDetailCardValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{selectedAdmin.joined}</Text>
                      </View>
                      
                      <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                        <Ionicons name="people-outline" size={20} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailCardLabel, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>Team Size</Text>
                        <Text style={[styles.adminDetailCardValue, { color: darkMode ? COLORS.white : COLORS.text }]}>{selectedAdmin.teamSize}</Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Qualifications & Certifications</Text>
                    <View style={[styles.adminDetailInfoRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Ionicons name="school-outline" size={18} color={selectedAdmin.color} />
                      <Text style={[styles.adminDetailInfoText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.qualifications}</Text>
                    </View>
                    
                    <View style={[styles.adminDetailInfoRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Ionicons name="ribbon-outline" size={18} color={selectedAdmin.color} />
                      <Text style={[styles.adminDetailInfoText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.certifications}</Text>
                    </View>
                    
                    <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Achievements</Text>
                    <View style={[styles.adminDetailInfoRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Ionicons name="trophy-outline" size={18} color={selectedAdmin.color} />
                      <Text style={[styles.adminDetailInfoText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.achievements}</Text>
                    </View>
                    
                    <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Contact Information</Text>
                    <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Ionicons name="mail-outline" size={18} color={selectedAdmin.color} />
                      <Text style={[styles.adminDetailContactText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.email}</Text>
                    </View>
                    
                    <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Ionicons name="call-outline" size={18} color={selectedAdmin.color} />
                      <Text style={[styles.adminDetailContactText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.phone}</Text>
                    </View>
                    
                    <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Ionicons name="location-outline" size={18} color={selectedAdmin.color} />
                      <Text style={[styles.adminDetailContactText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.location}</Text>
                    </View>
                    
                    <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.backgroundSecondary }]}>
                      <Ionicons name="language-outline" size={18} color={selectedAdmin.color} />
                      <Text style={[styles.adminDetailContactText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{selectedAdmin.languages}</Text>
                    </View>
                  </ScrollView>
                  
                  <View style={styles.adminDetailActions}>
                    <TouchableOpacity style={[styles.adminDetailActionBtn, { backgroundColor: selectedAdmin.color }]} onPress={() => Alert.alert('Message', `Send message to ${selectedAdmin.name}`)}>
                      <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
                      <Text style={styles.adminDetailActionText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.adminDetailActionBtn, { backgroundColor: COLORS.success }]} onPress={() => Alert.alert('Call', `Calling ${selectedAdmin.name}`)}>
                      <Ionicons name="call-outline" size={20} color={COLORS.white} />
                      <Text style={styles.adminDetailActionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.adminDetailActionBtn, { backgroundColor: COLORS.appointment }]} onPress={() => Alert.alert('Email', `Send email to ${selectedAdmin.email}`)}>
                      <Ionicons name="mail-outline" size={20} color={COLORS.white} />
                      <Text style={styles.adminDetailActionText}>Email</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Analytics Trends Section */}
        <SectionHeader 
          title="Analytics Trends" 
          icon="trending-up-outline" 
          onPress={() => navigation.navigate('ReportsListScreen')}
          buttonText="Full Report"
        />
        <View style={styles.periodSelectorWrapper}>
          {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
            <TouchableOpacity 
              key={period}
              style={[styles.periodBtn, chartPeriod === period && styles.activePeriodBtn]}
              onPress={() => setChartPeriod(period)}
            >
              <Text style={[styles.periodBtnText, chartPeriod === period && styles.activePeriodText]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.chartCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: darkMode ? '#334155' : COLORS.border }]}>
          <Text style={[styles.chartTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Chronic Care Patients</Text>
          {renderModuleChart(chartData.chronic, maxChronic, '#FF4D6D')}
        </View>

        <View style={[styles.chartCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: darkMode ? '#334155' : COLORS.border }]}>
          <Text style={[styles.chartTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Pharmacy Orders</Text>
          {renderModuleChart(chartData.pharmacy, maxPharmacy, COLORS.success)}
        </View>

        <View style={[styles.chartCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: darkMode ? '#334155' : COLORS.border }]}>
          <Text style={[styles.chartTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>Laboratory Tests</Text>
          {renderModuleChart(chartData.lab, maxLab, COLORS.appointment)}
        </View>

        {/* Quick Actions Section */}
        <SectionHeader 
          title="Quick Actions" 
          icon="flash-outline" 
          onPress={() => Alert.alert('Quick Actions', 'All available actions')}
        />
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowPatientModal(true)}>
            <LinearGradient colors={['#FF4D6D', '#E63946']} style={styles.actionGradient}>
              <Ionicons name="heart" size={28} color={COLORS.white} />
              <Text style={styles.actionText}>Add Chronic Patient</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MedicineListScreen')}>
            <LinearGradient colors={[COLORS.success, '#059669']} style={styles.actionGradient}>
              <Ionicons name="medkit" size={28} color={COLORS.white} />
              <Text style={styles.actionText}>Manage Pharmacy</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('LabTestsPriceScreen')}>
            <LinearGradient colors={[COLORS.appointment, '#6D28D9']} style={styles.actionGradient}>
              <Ionicons name="flask" size={28} color={COLORS.white} />
              <Text style={styles.actionText}>Lab Tests</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowAddDoctorModal(true)}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.actionGradient}>
              <Ionicons name="person-add" size={28} color={COLORS.white} />
              <Text style={styles.actionText}>Add Doctor</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Section */}
        <SectionHeader 
          title="Recent Activity" 
          icon="time-outline" 
          onPress={() => Alert.alert('Recent Activity', 'View all activities')}
        />
        <View style={[styles.activityContainer, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : COLORS.white, borderColor: darkMode ? '#334155' : COLORS.border }]}>
          {recentActivities.slice(0, 4).map(activity => (
            <View key={activity.id} style={styles.activityRow}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon} size={20} color={activity.color} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={[styles.activityText, { color: darkMode ? COLORS.white : COLORS.text }]}>{activity.text}</Text>
                <Text style={[styles.activityTime, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{activity.time}</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: activity.color + '20' }]}>
                <Text style={[styles.activityBadgeText, { color: activity.color }]}>{activity.module}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal visible={showPatientModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#0A1520' : COLORS.white, width: wp(isTablet ? 60 : 90) }]}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Patient</Text>
              <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Full Name" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} value={newPatient.name} onChangeText={text => setNewPatient({...newPatient, name: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Age" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} keyboardType="numeric" value={newPatient.age} onChangeText={text => setNewPatient({...newPatient, age: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Phone" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} keyboardType="phone-pad" value={newPatient.phone} onChangeText={text => setNewPatient({...newPatient, phone: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Disease / Condition" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} value={newPatient.disease} onChangeText={text => setNewPatient({...newPatient, disease: text})} />
              <View style={styles.moduleSelector}>
                <Text style={[styles.moduleSelectorLabel, { color: darkMode ? COLORS.white : COLORS.text }]}>Select Module:</Text>
                <View style={styles.moduleSelectorOptions}>
                  {['Chronic', 'Pharmacy', 'Laboratory'].map(module => (
                    <TouchableOpacity key={module} style={[styles.moduleSelectorBtn, newPatient.module === module && styles.activeModuleBtn]} onPress={() => setNewPatient({...newPatient, module: module})}>
                      <Text style={[styles.moduleSelectorText, newPatient.module === module && styles.activeModuleText]}>{module}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={() => {
                Alert.alert('Success', `Patient ${newPatient.name} registered in ${newPatient.module} module`);
                setShowPatientModal(false);
                setNewPatient({ name: '', age: '', gender: 'Male', phone: '', address: '', bloodGroup: '', disease: '', doctor: '', module: 'Chronic' });
              }}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalSubmitGradient}>
                  <Text style={styles.modalSubmitText}>Register Patient</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddDoctorModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#0A1520' : COLORS.white, width: wp(isTablet ? 60 : 90) }]}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Doctor</Text>
              <TouchableOpacity onPress={() => setShowAddDoctorModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Full Name" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} value={newDoctor.name} onChangeText={text => setNewDoctor({...newDoctor, name: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Specialty" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} value={newDoctor.specialty} onChangeText={text => setNewDoctor({...newDoctor, specialty: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Qualification" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} value={newDoctor.qualification} onChangeText={text => setNewDoctor({...newDoctor, qualification: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Experience (years)" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} keyboardType="numeric" value={newDoctor.experience} onChangeText={text => setNewDoctor({...newDoctor, experience: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Email" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} keyboardType="email-address" value={newDoctor.email} onChangeText={text => setNewDoctor({...newDoctor, email: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : COLORS.backgroundSecondary, color: darkMode ? COLORS.white : COLORS.text }]} placeholder="Phone" placeholderTextColor={darkMode ? COLORS.textSecondary : COLORS.textSecondary} keyboardType="phone-pad" value={newDoctor.phone} onChangeText={text => setNewDoctor({...newDoctor, phone: text})} />
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={() => {
                Alert.alert('Success', `Dr. ${newDoctor.name} added successfully`);
                setShowAddDoctorModal(false);
                setNewDoctor({ name: '', specialty: '', email: '', phone: '', experience: '', qualification: '', fee: '', shift: 'Morning' });
              }}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalSubmitGradient}>
                  <Text style={styles.modalSubmitText}>Add Doctor</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showSettingsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#0A1520' : COLORS.white, width: wp(isTablet ? 50 : 85) }]}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.modalBody}>
              <View style={[styles.settingRow, { borderBottomColor: darkMode ? '#334155' : COLORS.border }]}>
                <View style={styles.settingLeft}>
                  <Ionicons name="moon" size={22} color={COLORS.primary} />
                  <Text style={[styles.settingText, { color: darkMode ? COLORS.white : COLORS.text }]}>Dark Mode</Text>
                </View>
                <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} />
              </View>
              <TouchableOpacity style={[styles.settingRow, { borderBottomColor: darkMode ? '#334155' : COLORS.border }]} onPress={() => Alert.alert('Change Password', 'Navigate to change password')}>
                <View style={styles.settingLeft}>
                  <Ionicons name="lock-closed" size={22} color={COLORS.primary} />
                  <Text style={[styles.settingText, { color: darkMode ? COLORS.white : COLORS.text }]}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={darkMode ? COLORS.textSecondary : COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingRow, styles.logoutRow]} onPress={() => navigation.replace('Login')}>
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out" size={22} color={COLORS.danger} />
                  <Text style={[styles.settingText, { color: COLORS.danger }]}>Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotificationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.notificationModal, { backgroundColor: darkMode ? '#0A1520' : COLORS.white, width: wp(isTablet ? 60 : 92) }]}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.notificationActions}>
              <TouchableOpacity onPress={() => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                Alert.alert('Success', 'All notifications marked as read');
              }}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setNotifications([]);
                Alert.alert('Success', 'All notifications cleared');
              }}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.notificationList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifications}>
                  <Ionicons name="notifications-off" size={50} color={darkMode ? COLORS.textSecondary : COLORS.textSecondary} />
                  <Text style={[styles.emptyText, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>No notifications</Text>
                </View>
              ) : (
                notifications.map(notification => (
                  <TouchableOpacity key={notification.id} style={[styles.notificationItem, !notification.read && styles.unreadNotification]}>
                    <View style={[styles.notificationIcon, { backgroundColor: notification.type === 'success' ? COLORS.success + '20' : notification.type === 'error' ? COLORS.danger + '20' : notification.type === 'warning' ? COLORS.warning + '20' : COLORS.primary + '20' }]}>
                      <Ionicons name={notification.type === 'success' ? 'checkmark-circle' : notification.type === 'error' ? 'alert-circle' : notification.type === 'warning' ? 'warning' : 'information-circle'} size={22} color={notification.type === 'success' ? COLORS.success : notification.type === 'error' ? COLORS.danger : notification.type === 'warning' ? COLORS.warning : COLORS.primary} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationItemTitle, { color: darkMode ? COLORS.white : COLORS.text }]}>{notification.title}</Text>
                      <Text style={[styles.notificationItemMessage, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{notification.message}</Text>
                      <Text style={[styles.notificationItemTime, { color: darkMode ? COLORS.textSecondary : COLORS.textSecondary }]}>{notification.time}</Text>
                    </View>
                    {!notification.read && <View style={styles.notificationUnreadDot} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: '100%' },
  scrollContent: { paddingBottom: hp(4) },
  
  // Header
  header: { width: '100%', paddingTop: statusBarHeight },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(4), paddingVertical: hp(1.5) },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  backBtn: { padding: wp(1) },
  menuBtn: { padding: wp(1) },
  
  // Circular Logo
  logoOutlineContainer: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  logoCircle: { width: wp(9), height: wp(9), borderRadius: wp(4.5), borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  logoImage: { width: wp(7), height: wp(7), borderRadius: wp(3.5), resizeMode: 'contain' },
  headerTitle: { fontSize: wp(4), fontWeight: 'bold', letterSpacing: 1 },
  headerSubtitle: { fontSize: wp(2.5), marginTop: hp(0.2) },
  headerRight: { flexDirection: 'row', gap: wp(4) },
  iconBtn: { padding: wp(1), position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -5, backgroundColor: COLORS.danger, borderRadius: wp(2), minWidth: wp(4), height: wp(4), justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(0.5) },
  badgeText: { color: COLORS.white, fontSize: wp(2), fontWeight: 'bold' },
  
  // Drawer Menu
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawerBackdrop: { flex: 1 },
  drawerContainer: { width: wp(75), height: '100%', borderTopLeftRadius: wp(2), borderBottomLeftRadius: wp(2), overflow: 'hidden' },
  drawerHeader: { padding: wp(5), alignItems: 'center', borderBottomRightRadius: wp(2), borderBottomLeftRadius: wp(2) },
  drawerLogoOutline: { width: wp(18), height: wp(18), borderRadius: wp(9), borderWidth: 2, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: hp(1), backgroundColor: 'rgba(255,255,255,0.1)' },
  drawerLogo: { width: wp(14), height: wp(14), borderRadius: wp(7), resizeMode: 'contain' },
  drawerTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: 'bold' },
  drawerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: wp(2.8), marginTop: hp(0.3) },
  drawerMenu: { flex: 1, paddingTop: hp(2) },
  drawerMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(1.2), paddingHorizontal: wp(5), gap: wp(3) },
  drawerIconCircle: { width: wp(9), height: wp(9), borderRadius: wp(2.5), justifyContent: 'center', alignItems: 'center' },
  drawerMenuItemText: { flex: 1, fontSize: wp(3.5), fontWeight: '500' },
  drawerFooter: { padding: wp(4), borderTopWidth: 1 },
  drawerFooterItem: { flexDirection: 'row', alignItems: 'center', gap: wp(3), paddingVertical: hp(1) },
  drawerFooterText: { fontSize: wp(3.5), fontWeight: '500' },
  
  // Welcome Card
  welcomeWrapper: { margin: wp(4), marginTop: wp(2) },
  welcomeCard: { padding: wp(4), borderRadius: wp(4), flexDirection: 'row', justifyContent: 'space-between' },
  welcomeContent: { flex: 1 },
  welcomeTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: 'bold' },
  welcomeSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: wp(2.8), marginTop: hp(0.5) },
  statsRow: { flexDirection: 'row', marginTop: hp(2), gap: wp(3) },
  welcomeStat: { flex: 1 },
  welcomeStatValue: { color: COLORS.white, fontSize: wp(4.5), fontWeight: 'bold' },
  welcomeStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: wp(2.5), marginTop: hp(0.3) },
  welcomeStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  welcomeIcon: { opacity: 0.8 },
  
  // Section Header
  sectionHeaderWrapper: { marginHorizontal: wp(3), marginTop: wp(4), marginBottom: wp(2.5) },
  sectionHeaderBg: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(2.5), borderRadius: wp(3), backgroundColor: 'transparent' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  sectionHeaderIcon: { width: wp(7), height: wp(7), borderRadius: wp(2), justifyContent: 'center', alignItems: 'center' },
  sectionHeaderTitle: { fontSize: wp(4.5), fontWeight: 'bold' },
  sectionHeaderButton: { flexDirection: 'row', alignItems: 'center', gap: wp(1), paddingHorizontal: wp(2), paddingVertical: hp(0.5), borderRadius: wp(2), backgroundColor: COLORS.primary + '15' },
  sectionHeaderButtonText: { fontSize: wp(2.8), color: COLORS.primary, fontWeight: '500' },
  
  // Modules Grid
  modulesGrid: { paddingHorizontal: wp(4), gap: wp(3) },
  moduleCard: { borderRadius: wp(4), borderWidth: 1.5, overflow: 'hidden', ...SHADOWS.medium },
  moduleGradient: { padding: wp(4) },
  moduleIcon: { width: wp(12), height: wp(12), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center', marginBottom: hp(1) },
  moduleTitle: { fontSize: wp(4), fontWeight: 'bold', marginBottom: hp(0.5) },
  moduleValue: { fontSize: wp(6), fontWeight: 'bold' },
  moduleLabel: { fontSize: wp(2.8), marginBottom: hp(1.5) },
  moduleStats: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(2) },
  moduleStatItem: { flex: 1, alignItems: 'center' },
  moduleStatValue: { fontSize: wp(3.5), fontWeight: 'bold' },
  moduleStatLabel: { fontSize: wp(2.2) },
  moduleStatDivider: { width: 1, height: wp(5), backgroundColor: COLORS.border },
  moduleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5), paddingVertical: hp(1), borderRadius: wp(2) },
  moduleBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: wp(3) },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(4), gap: wp(3) },
  statCard: { flex: 1, minWidth: (width - wp(14)) / 2, borderRadius: wp(3), padding: wp(3), alignItems: 'center', borderWidth: 1, ...SHADOWS.small },
  statIcon: { width: wp(10), height: wp(10), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center', marginBottom: hp(1) },
  statValue: { fontSize: wp(5), fontWeight: 'bold' },
  statLabel: { fontSize: wp(2.8), marginTop: hp(0.3) },
  
  // Admin Team
  adminTeamScroll: { paddingHorizontal: wp(4), marginBottom: wp(2) },
  adminCard: { width: wp(70), borderRadius: wp(4), marginRight: wp(3), overflow: 'hidden', borderWidth: 1.5, ...SHADOWS.medium },
  adminCardHeader: { padding: wp(4), alignItems: 'center', position: 'relative' },
  adminAvatarLarge: { width: wp(20), height: wp(20), borderRadius: wp(10), backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  adminAvatarLargeText: { fontSize: wp(7), fontWeight: 'bold', color: COLORS.white },
  adminStatusBadge: { position: 'absolute', bottom: wp(2), right: wp(3), paddingHorizontal: wp(2), paddingVertical: hp(0.3), borderRadius: wp(2) },
  adminStatusBadgeText: { fontSize: wp(2.2), color: COLORS.white, fontWeight: 'bold' },
  adminCardBody: { padding: wp(3.5), alignItems: 'center' },
  adminNameLarge: { fontSize: wp(4.2), fontWeight: 'bold', marginBottom: hp(0.3), textAlign: 'center' },
  adminRoleLarge: { fontSize: wp(3), fontWeight: '600', marginBottom: hp(0.8), textAlign: 'center' },
  adminRating: { flexDirection: 'row', alignItems: 'center', gap: wp(0.5), marginBottom: hp(1) },
  adminRatingText: { fontSize: wp(2.5), marginLeft: wp(1) },
  adminInfoGrid: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: hp(1.5) },
  adminInfoItem: { flexDirection: 'row', alignItems: 'center', gap: wp(1) },
  adminInfoText: { fontSize: wp(2.5) },
  adminViewBtn: { flexDirection: 'row', alignItems: 'center', gap: wp(1), paddingHorizontal: wp(3), paddingVertical: hp(0.6), borderRadius: wp(3), borderWidth: 1 },
  adminViewBtnText: { fontSize: wp(2.6), fontWeight: '500' },
  
  // Admin Detail Modal
  adminDetailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  adminDetailModal: { width: width * 0.92, maxHeight: height * 0.88, borderRadius: wp(5), padding: wp(5), position: 'relative' },
  adminDetailClose: { position: 'absolute', top: wp(3), right: wp(3), zIndex: 10, padding: wp(1) },
  adminDetailAvatarContainer: { alignItems: 'center', marginBottom: hp(2), position: 'relative' },
  adminDetailAvatarBorder: { width: wp(25), height: wp(25), borderRadius: wp(12.5), justifyContent: 'center', alignItems: 'center' },
  adminDetailAvatarText: { color: COLORS.white, fontSize: wp(10), fontWeight: 'bold' },
  adminDetailStatus: { position: 'absolute', bottom: 0, right: wp(3), paddingHorizontal: wp(2), paddingVertical: hp(0.3), borderRadius: wp(3) },
  adminDetailStatusText: { color: COLORS.white, fontSize: wp(2.2), fontWeight: 'bold' },
  adminDetailName: { fontSize: wp(5.5), fontWeight: 'bold', textAlign: 'center', marginBottom: hp(0.5) },
  adminDetailRole: { fontSize: wp(3.5), fontWeight: '600', textAlign: 'center', marginBottom: hp(1) },
  adminDetailRating: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(1), marginBottom: hp(1.5) },
  adminDetailRatingText: { fontSize: wp(3), marginLeft: wp(1) },
  adminDetailInfoScroll: { maxHeight: hp(35) },
  adminDetailBio: { padding: wp(3), borderRadius: wp(3), marginBottom: hp(2) },
  adminDetailBioText: { fontSize: wp(3), lineHeight: wp(4.5), textAlign: 'center' },
  adminDetailSectionTitle: { fontSize: wp(3.5), fontWeight: '600', marginBottom: hp(1), marginTop: hp(1) },
  adminDetailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(3), marginBottom: hp(2) },
  adminDetailCard: { width: (width * 0.92 - wp(10)) / 2, padding: wp(3), borderRadius: wp(3), alignItems: 'center' },
  adminDetailCardLabel: { fontSize: wp(2.5), marginTop: hp(0.5) },
  adminDetailCardValue: { fontSize: wp(3.2), fontWeight: 'bold', marginTop: hp(0.3) },
  adminDetailInfoRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2.5), padding: wp(2.5), borderRadius: wp(2.5), marginBottom: hp(0.8) },
  adminDetailInfoText: { fontSize: wp(3), flex: 1 },
  adminDetailContactItem: { flexDirection: 'row', alignItems: 'center', gap: wp(2.5), padding: wp(2.5), borderRadius: wp(2.5), marginBottom: hp(0.8) },
  adminDetailContactText: { fontSize: wp(3), flex: 1 },
  adminDetailActions: { flexDirection: 'row', gap: wp(3), marginTop: hp(1) },
  adminDetailActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5), paddingVertical: hp(1.2), borderRadius: wp(3) },
  adminDetailActionText: { color: COLORS.white, fontSize: wp(3.2), fontWeight: '600' },
  
  // Period Selector
  periodSelectorWrapper: { flexDirection: 'row', marginHorizontal: wp(4), gap: wp(2), marginBottom: wp(3) },
  periodBtn: { paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(3), backgroundColor: COLORS.border },
  activePeriodBtn: { backgroundColor: COLORS.primary },
  periodBtnText: { fontSize: wp(3), color: COLORS.textSecondary },
  activePeriodText: { color: COLORS.white, fontWeight: 'bold' },
  
  // Charts
  chartCard: { margin: wp(4), borderRadius: wp(3), padding: wp(4), borderWidth: 1, ...SHADOWS.small },
  chartTitle: { fontSize: wp(3.5), fontWeight: 'bold', marginBottom: wp(3) },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: hp(18) },
  chartBarItem: { alignItems: 'center', flex: 1 },
  chartBarWrapper: { alignItems: 'center', height: hp(14), justifyContent: 'flex-end' },
  chartBar: { width: wp(5), borderRadius: wp(2), marginBottom: hp(0.5) },
  chartBarValue: { fontSize: wp(2.5), marginBottom: hp(0.3), color: COLORS.textSecondary },
  chartBarLabel: { fontSize: wp(2.2), marginTop: hp(0.5), color: COLORS.textSecondary, textAlign: 'center' },
  
  // Actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(4), gap: wp(3), marginBottom: wp(4) },
  actionCard: { width: (width - wp(14)) / 2, borderRadius: wp(3), overflow: 'hidden' },
  actionGradient: { padding: wp(3), alignItems: 'center', gap: hp(0.5) },
  actionText: { color: COLORS.white, fontWeight: 'bold', fontSize: wp(3) },
  
  // Activity
  activityContainer: { marginHorizontal: wp(4), borderRadius: wp(3), padding: wp(3), borderWidth: 1, marginBottom: wp(4) },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: wp(3), marginBottom: hp(1.5) },
  activityIcon: { width: wp(9), height: wp(9), borderRadius: wp(2.5), justifyContent: 'center', alignItems: 'center' },
  activityDetails: { flex: 1 },
  activityText: { fontSize: wp(3.2) },
  activityTime: { fontSize: wp(2.5), marginTop: hp(0.2) },
  activityBadge: { paddingHorizontal: wp(2), paddingVertical: hp(0.3), borderRadius: wp(2) },
  activityBadgeText: { fontSize: wp(2.2), fontWeight: '500' },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { maxHeight: height * 0.85, borderRadius: wp(4), overflow: 'hidden', ...SHADOWS.large },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(4) },
  modalTitle: { fontSize: wp(4.5), fontWeight: 'bold', color: COLORS.white },
  modalBody: { padding: wp(4) },
  modalInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: wp(2.5), padding: wp(3), marginBottom: wp(3), fontSize: wp(3.2) },
  modalSubmitBtn: { borderRadius: wp(2.5), overflow: 'hidden', marginTop: wp(3) },
  modalSubmitGradient: { paddingVertical: hp(1.2), alignItems: 'center' },
  modalSubmitText: { color: COLORS.white, fontWeight: 'bold', fontSize: wp(3.5) },
  
  // Module Selector
  moduleSelector: { marginBottom: wp(3) },
  moduleSelectorLabel: { fontSize: wp(3), marginBottom: hp(0.8) },
  moduleSelectorOptions: { flexDirection: 'row', gap: wp(2) },
  moduleSelectorBtn: { flex: 1, paddingVertical: hp(1), borderRadius: wp(2), backgroundColor: COLORS.border, alignItems: 'center' },
  activeModuleBtn: { backgroundColor: COLORS.primary },
  moduleSelectorText: { color: COLORS.textSecondary, fontSize: wp(2.8) },
  activeModuleText: { color: COLORS.white, fontWeight: 'bold' },
  
  // Settings
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hp(1.5), borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  settingText: { fontSize: wp(3.5) },
  logoutRow: { borderBottomWidth: 0, marginTop: hp(1) },
  
  // Notifications
  notificationModal: { maxHeight: height * 0.85, borderRadius: wp(4), overflow: 'hidden', ...SHADOWS.large },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(4) },
  notificationTitle: { fontSize: wp(4.5), fontWeight: 'bold', color: COLORS.white },
  notificationActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp(4), paddingVertical: hp(1), borderBottomWidth: 1, borderBottomColor: COLORS.border },
  markAllText: { color: COLORS.primary, fontSize: wp(3), fontWeight: '500' },
  clearAllText: { color: COLORS.danger, fontSize: wp(3), fontWeight: '500' },
  notificationList: { maxHeight: height * 0.65 },
  notificationItem: { flexDirection: 'row', padding: wp(3), borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: wp(3) },
  unreadNotification: { backgroundColor: COLORS.primary + '05' },
  notificationIcon: { width: wp(10), height: wp(10), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center' },
  notificationContent: { flex: 1 },
  notificationItemTitle: { fontSize: wp(3.5), fontWeight: 'bold' },
  notificationItemMessage: { fontSize: wp(2.8), marginTop: hp(0.2) },
  notificationItemTime: { fontSize: wp(2.5), marginTop: hp(0.2) },
  notificationUnreadDot: { width: wp(2), height: wp(2), borderRadius: wp(1), backgroundColor: COLORS.primary, alignSelf: 'center' },
  emptyNotifications: { alignItems: 'center', padding: wp(8), gap: hp(1.5) },
  emptyText: { fontSize: wp(3.5) },
});

// FadeInUpView Component
const FadeInUpView = ({ children, delay = 0, style }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withSpring(0));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};

export default AdminDashboardScreen;