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
  ImageBackground,
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

const { width, height } = Dimensions.get('window');

// Responsive functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;
const isTablet = width >= 768;
const isIOS = Platform.OS === 'ios';
const statusBarHeight = getStatusBarHeight();

// Custom Drawer Menu Component - Fixed on Left Side (Doesn't move)
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
    { id: 'dashboard', name: 'Dashboard', icon: 'grid-outline', screen: null, color: '#04e1f5' },
    { id: 'chronic', name: 'Chronic Care Management', icon: 'heart-outline', screen: 'ChronicPortal', color: '#FF4D6D' },
    { id: 'pharmacy', name: 'Pharmacy Management', icon: 'medkit-outline', screen: 'MedicineListScreen', color: '#10B981' },
    { id: 'laboratory', name: 'Laboratory Management', icon: 'flask-outline', screen: 'LabTestsPriceScreen', color: '#8B5CF6' },
    { id: 'doctors', name: 'Doctors Management', icon: 'people-outline', screen: 'ManageDoctorsScreen', color: '#04e1f5' },
    { id: 'patients', name: 'Patients Records', icon: 'person-outline', screen: 'ManageUsersScreen', color: '#F59E0B' },
    { id: 'appointments', name: 'Appointments', icon: 'calendar-outline', screen: 'AppointmentListScreen', color: '#EC4899' },
    { id: 'reports', name: 'Reports & Analytics', icon: 'stats-chart-outline', screen: 'ReportsListScreen', color: '#8B5CF6' },
    { id: 'settings', name: 'Settings', icon: 'settings-outline', screen: 'SettingsScreen', color: '#64748B' },
  ];
  
  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.drawerOverlay}>
        <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.drawerContainer, { backgroundColor: darkMode ? '#0A1520' : '#FFFFFF' }, animatedStyle]}>
          <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.drawerHeader}>
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
                  } else if (item.id === 'dashboard') {
                    // Stay on dashboard
                  } else {
                    Alert.alert(item.name, `Navigate to ${item.name} screen`);
                  }
                }}
              >
                <View style={[styles.drawerIconCircle, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.drawerMenuItemText, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={darkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={[styles.drawerFooter, { borderTopColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            <TouchableOpacity style={styles.drawerFooterItem} onPress={() => navigation.replace('Login')}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.drawerFooterText, { color: '#EF4444' }]}>Logout</Text>
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
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');
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

  // Admin Team Members with complete details - Enhanced Profiles
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

  // Module Distribution
  const moduleDistribution = [
    { name: 'Chronic Care', percentage: 45, patients: 2847, revenue: 145000, color: '#FF4D6D', icon: 'heart', screen: 'ChronicPortal' },
    { name: 'Pharmacy', percentage: 32, patients: 3421, revenue: 89000, color: '#10B981', icon: 'medkit', screen: 'MedicineListScreen' },
    { name: 'Laboratory', percentage: 23, patients: 5678, revenue: 50500, color: '#8B5CF6', icon: 'flask', screen: 'LabTestsPriceScreen' },
  ];

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
        color: '#04e1f5',
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

  // Section Header Component with proper background
  const SectionHeader = ({ title, icon, }) => (
    <View style={styles.sectionHeaderWrapper}>
      <LinearGradient colors={['rgb(224, 224, 17)']} style={styles.sectionHeaderBg}>
        <View style={styles.sectionHeaderLeft}>
          <LinearGradient colors={['#04f504', '#047fbd']} style={styles.sectionHeaderIcon}>
            <Ionicons name={icon} size={20} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.sectionHeaderTitle, { color: darkMode ? '#FFFFFF' : '#02fce7' }]}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#030d18' : '#F0F4F8' }]}>
      <StatusBar 
        barStyle={darkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Drawer Menu - Fixed on Left Side */}
      <DrawerMenu 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
        navigation={navigation}
        darkMode={darkMode}
      />
      
      {/* Background Image */}
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="contain"
      >
        <LinearGradient
          colors={darkMode 
            ? ['rgba(0, 15, 25, 0.96)', 'rgba(0, 10, 20, 0.94)', 'rgba(0, 5, 10, 0.98)']
            : ['rgba(21, 7, 73, 0.02)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.2)']
          }
          style={StyleSheet.absoluteFill}
        />

        {/* Header with Back Button */}
        <Animated.View style={[styles.header, animatedHeaderStyle, { 
          backgroundColor: darkMode ? 'rgba(8, 17, 26, 0.98)' : '#FFFFFF',
          borderBottomColor: darkMode ? '#334155' : '#E2E8F0',
          borderBottomWidth: 1,
        }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {/* Back Button - Navigates to Home */}
              <TouchableOpacity onPress={() => navigation.navigate('MainApp')} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#107bd3" />
              </TouchableOpacity>
              
              <Animated.View style={[styles.logoOutlineContainer, animatedLogoStyle]}>
                <View style={[styles.logoCircle, { borderColor: '#04e1f5c4' }]}>
                  <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
                </View>
              </Animated.View>
              
              <View>
                <Text style={[styles.headerTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>ADMIN PANEL</Text>
                <Text style={[styles.headerSubtitle, { color: darkMode ? '#758bac' : '#64748B' }]}>SehatLine Hospital</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={styles.iconBtn}>
                <Ionicons name="settings-outline" size={24} color="#107bd3" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowNotificationModal(true)} style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={24} color="#107bd3" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuBtn}>
                <Ionicons name="menu" size={28} color="#107bd3" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#04e1f5" colors={['#04e1f5']} />}
        >
          {/* Welcome Card */}
          <FadeInUpView delay={300} style={styles.welcomeWrapper}>
            <LinearGradient
              colors={['#01fafa', '#0d7db4']}
              start={{ x: 1, y: 0 }}
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
              <Ionicons name="shield-checkmark" size={60} color="#FFFFFF" style={styles.welcomeIcon} />
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
              style={[styles.moduleCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#ffffff', borderColor: '#FF4D6D' }]}
              onPress={() => navigation.navigate('ChronicPortal')}
            >
              <LinearGradient colors={['rgba(255, 77, 109, 0.15)', 'transparent']} style={styles.moduleGradient}>
                <View style={[styles.moduleIcon, { backgroundColor: 'rgba(255, 77, 109, 0.2)' }]}>
                  <Ionicons name="heart" size={32} color="#FF4D6D" />
                </View>
                <Text style={[styles.moduleTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Chronic Care</Text>
                <Text style={[styles.moduleValue, { color: '#FF4D6D' }]}>{stats.chronicPatients}</Text>
                <Text style={[styles.moduleLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Active Patients</Text>
                <View style={styles.moduleStats}>
                  <View style={styles.moduleStatItem}>
                    <Text style={[styles.moduleStatValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.activeChronicPlans}</Text>
                    <Text style={[styles.moduleStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Active Plans</Text>
                  </View>
                  <View style={styles.moduleStatDivider} />
                  <View style={styles.moduleStatItem}>
                    <Text style={[styles.moduleStatValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.criticalChronic}</Text>
                    <Text style={[styles.moduleStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Critical</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.moduleBtn, { backgroundColor: '#FF4D6D' }]} onPress={() => navigation.navigate('ChronicPortal')}>
                  <Text style={styles.moduleBtnText}>Manage Chronic Care</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>

            {/* Pharmacy Module */}
            <TouchableOpacity 
              style={[styles.moduleCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: '#10B981' }]}
              onPress={() => navigation.navigate('MedicineListScreen')}
            >
              <LinearGradient colors={['rgba(16, 185, 129, 0.15)', 'transparent']} style={styles.moduleGradient}>
                <View style={[styles.moduleIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Ionicons name="medkit" size={32} color="#10B981" />
                </View>
                <Text style={[styles.moduleTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Pharmacy</Text>
                <Text style={[styles.moduleValue, { color: '#10B981' }]}>{stats.totalOrders}</Text>
                <Text style={[styles.moduleLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Total Orders</Text>
                <View style={styles.moduleStats}>
                  <View style={styles.moduleStatItem}>
                    <Text style={[styles.moduleStatValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.pendingOrders}</Text>
                    <Text style={[styles.moduleStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Pending</Text>
                  </View>
                  <View style={styles.moduleStatDivider} />
                  <View style={styles.moduleStatItem}>
                    <Text style={[styles.moduleStatValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.lowStockMedicines}</Text>
                    <Text style={[styles.moduleStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Low Stock</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.moduleBtn, { backgroundColor: '#10B981' }]} onPress={() => navigation.navigate('MedicineListScreen')}>
                  <Text style={styles.moduleBtnText}>Manage Pharmacy</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>

            {/* Laboratory Module */}
            <TouchableOpacity 
              style={[styles.moduleCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: '#8B5CF6' }]}
              onPress={() => navigation.navigate('LabTestsPriceScreen')}
            >
              <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'transparent']} style={styles.moduleGradient}>
                <View style={[styles.moduleIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Ionicons name="flask" size={32} color="#8B5CF6" />
                </View>
                <Text style={[styles.moduleTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Laboratory</Text>
                <Text style={[styles.moduleValue, { color: '#8B5CF6' }]}>{stats.totalTests}</Text>
                <Text style={[styles.moduleLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Total Tests</Text>
                <View style={styles.moduleStats}>
                  <View style={styles.moduleStatItem}>
                    <Text style={[styles.moduleStatValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.pendingReports}</Text>
                    <Text style={[styles.moduleStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Pending</Text>
                  </View>
                  <View style={styles.moduleStatDivider} />
                  <View style={styles.moduleStatItem}>
                    <Text style={[styles.moduleStatValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.urgentTests}</Text>
                    <Text style={[styles.moduleStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Urgent</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.moduleBtn, { backgroundColor: '#8B5CF6' }]} onPress={() => navigation.navigate('LabTestsPriceScreen')}>
                  <Text style={styles.moduleBtnText}>Manage Laboratory</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
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
            <TouchableOpacity style={[styles.statCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]} onPress={() => navigation.navigate('ManageUsersScreen')}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(4, 225, 245, 0.15)' }]}>
                <Ionicons name="people" size={24} color="#04e1f5" />
              </View>
              <Text style={[styles.statValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.totalPatients.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Total Patients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]} onPress={() => navigation.navigate('ManageDoctorsScreen')}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="medkit" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.activeDoctors}</Text>
              <Text style={[styles.statLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Active Doctors</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.statCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]} onPress={() => navigation.navigate('AppointmentListScreen')}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="calendar" size={24} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{stats.todayAppointments}</Text>
              <Text style={[styles.statLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Today's Appointments</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Team Section - Enhanced Professional Cards */}
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
                  colors={darkMode ? ['rgba(15, 23, 42, 0.95)', 'rgba(15, 23, 42, 0.85)'] : ['#FFFFFF', '#F8FAFC']}
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
                    <View style={[styles.adminStatusBadge, { backgroundColor: admin.status === 'active' ? '#10B981' : '#6ca0e9' }]}>
                      <Text style={styles.adminStatusBadgeText}>{admin.status === 'active' ? 'Active' : 'Away'}</Text>
                    </View>
                  </LinearGradient>
                  
                  {/* Profile Details */}
                  <View style={styles.adminCardBody}>
                    <Text style={[styles.adminNameLarge, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{admin.name}</Text>
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
                      <Text style={[styles.adminRatingText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>({admin.rating})</Text>
                    </View>
                    
                    {/* Info Grid */}
                    <View style={styles.adminInfoGrid}>
                      <View style={styles.adminInfoItem}>
                        <Ionicons name="briefcase-outline" size={14} color={admin.color} />
                        <Text style={[styles.adminInfoText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{admin.experience}</Text>
                      </View>
                      <View style={styles.adminInfoItem}>
                        <Ionicons name="people-outline" size={14} color={admin.color} />
                        <Text style={[styles.adminInfoText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{admin.teamSize} members</Text>
                      </View>
                      <View style={styles.adminInfoItem}>
                        <Ionicons name="location-outline" size={14} color={admin.color} />
                        <Text style={[styles.adminInfoText, { color: darkMode ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>{admin.location.split(',')[0]}</Text>
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
              <View style={[styles.adminDetailModal, { backgroundColor: darkMode ? '#0A1520' : '#FFFFFF' }]}>
                <TouchableOpacity 
                  style={styles.adminDetailClose}
                  onPress={() => setShowAdminDetailModal(false)}
                >
                  <Ionicons name="close" size={24} color={darkMode ? '#FFF' : '#1E293B'} />
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
                      
                      <View style={[styles.adminDetailStatus, { backgroundColor: selectedAdmin.status === 'active' ? '#10B981' : '#94A3B8' }]}>
                        <Text style={styles.adminDetailStatusText}>
                          {selectedAdmin.status === 'active' ? 'Active' : 'Offline'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.adminDetailName, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{selectedAdmin.name}</Text>
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
                      <Text style={[styles.adminDetailRatingText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>({selectedAdmin.rating})</Text>
                    </View>
                    
                    <ScrollView style={styles.adminDetailInfoScroll} showsVerticalScrollIndicator={false}>
                      <View style={[styles.adminDetailBio, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Text style={[styles.adminDetailBioText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.bio}</Text>
                      </View>
                      
                      <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Professional Information</Text>
                      <View style={styles.adminDetailGrid}>
                        <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                          <Ionicons name="business-outline" size={20} color={selectedAdmin.color} />
                          <Text style={[styles.adminDetailCardLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Department</Text>
                          <Text style={[styles.adminDetailCardValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{selectedAdmin.department}</Text>
                        </View>
                        
                        <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                          <Ionicons name="briefcase-outline" size={20} color={selectedAdmin.color} />
                          <Text style={[styles.adminDetailCardLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Experience</Text>
                          <Text style={[styles.adminDetailCardValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{selectedAdmin.experience}</Text>
                        </View>
                        
                        <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                          <Ionicons name="calendar-outline" size={20} color={selectedAdmin.color} />
                          <Text style={[styles.adminDetailCardLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Joined</Text>
                          <Text style={[styles.adminDetailCardValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{selectedAdmin.joined}</Text>
                        </View>
                        
                        <View style={[styles.adminDetailCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                          <Ionicons name="people-outline" size={20} color={selectedAdmin.color} />
                          <Text style={[styles.adminDetailCardLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Team Size</Text>
                          <Text style={[styles.adminDetailCardValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{selectedAdmin.teamSize}</Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Qualifications & Certifications</Text>
                      <View style={[styles.adminDetailInfoRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Ionicons name="school-outline" size={18} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailInfoText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.qualifications}</Text>
                      </View>
                      
                      <View style={[styles.adminDetailInfoRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Ionicons name="ribbon-outline" size={18} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailInfoText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.certifications}</Text>
                      </View>
                      
                      <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Achievements</Text>
                      <View style={[styles.adminDetailInfoRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Ionicons name="trophy-outline" size={18} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailInfoText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.achievements}</Text>
                      </View>
                      
                      <Text style={[styles.adminDetailSectionTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Contact Information</Text>
                      <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Ionicons name="mail-outline" size={18} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailContactText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.email}</Text>
                      </View>
                      
                      <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Ionicons name="call-outline" size={18} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailContactText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.phone}</Text>
                      </View>
                      
                      <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Ionicons name="location-outline" size={18} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailContactText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.location}</Text>
                      </View>
                      
                      <View style={[styles.adminDetailContactItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                        <Ionicons name="language-outline" size={18} color={selectedAdmin.color} />
                        <Text style={[styles.adminDetailContactText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{selectedAdmin.languages}</Text>
                      </View>
                    </ScrollView>
                    
                    <View style={styles.adminDetailActions}>
                      <TouchableOpacity style={[styles.adminDetailActionBtn, { backgroundColor: selectedAdmin.color }]} onPress={() => Alert.alert('Message', `Send message to ${selectedAdmin.name}`)}>
                        <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
                        <Text style={styles.adminDetailActionText}>Message</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.adminDetailActionBtn, { backgroundColor: '#10B981' }]} onPress={() => Alert.alert('Call', `Calling ${selectedAdmin.name}`)}>
                        <Ionicons name="call-outline" size={20} color="#FFF" />
                        <Text style={styles.adminDetailActionText}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.adminDetailActionBtn, { backgroundColor: '#8B5CF6' }]} onPress={() => Alert.alert('Email', `Send email to ${selectedAdmin.email}`)}>
                        <Ionicons name="mail-outline" size={20} color="#FFF" />
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
          
          <View style={[styles.chartCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            <Text style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Chronic Care Patients</Text>
            {renderModuleChart(chartData.chronic, maxChronic, '#FF4D6D')}
          </View>

          <View style={[styles.chartCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            <Text style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Pharmacy Orders</Text>
            {renderModuleChart(chartData.pharmacy, maxPharmacy, '#10B981')}
          </View>

          <View style={[styles.chartCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            <Text style={[styles.chartTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Laboratory Tests</Text>
            {renderModuleChart(chartData.lab, maxLab, '#8B5CF6')}
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
                <Ionicons name="heart" size={28} color="#FFF" />
                <Text style={styles.actionText}>Add Chronic Patient</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MedicineListScreen')}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
                <Ionicons name="medkit" size={28} color="#FFF" />
                <Text style={styles.actionText}>Manage Pharmacy</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('LabTestsPriceScreen')}>
              <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.actionGradient}>
                <Ionicons name="flask" size={28} color="#FFF" />
                <Text style={styles.actionText}>Lab Tests</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowAddDoctorModal(true)}>
              <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.actionGradient}>
                <Ionicons name="person-add" size={28} color="#FFF" />
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
          <View style={[styles.activityContainer, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            {recentActivities.slice(0, 4).map(activity => (
              <View key={activity.id} style={styles.activityRow}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon} size={20} color={activity.color} />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityText, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{activity.text}</Text>
                  <Text style={[styles.activityTime, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{activity.time}</Text>
                </View>
                <View style={[styles.activityBadge, { backgroundColor: activity.color + '20' }]}>
                  <Text style={[styles.activityBadgeText, { color: activity.color }]}>{activity.module}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Modals remain same... */}
      <Modal visible={showPatientModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#0A1520' : '#FFFFFF', width: wp(isTablet ? 60 : 90) }]}>
            <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Patient</Text>
              <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Full Name" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} value={newPatient.name} onChangeText={text => setNewPatient({...newPatient, name: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Age" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="numeric" value={newPatient.age} onChangeText={text => setNewPatient({...newPatient, age: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Phone" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="phone-pad" value={newPatient.phone} onChangeText={text => setNewPatient({...newPatient, phone: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Disease / Condition" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} value={newPatient.disease} onChangeText={text => setNewPatient({...newPatient, disease: text})} />
              <View style={styles.moduleSelector}>
                <Text style={[styles.moduleSelectorLabel, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Select Module:</Text>
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
                <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.modalSubmitGradient}>
                  <Text style={styles.modalSubmitText}>Register Patient</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddDoctorModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#0A1520' : '#FFFFFF', width: wp(isTablet ? 60 : 90) }]}>
            <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Doctor</Text>
              <TouchableOpacity onPress={() => setShowAddDoctorModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView style={styles.modalBody}>
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Full Name" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} value={newDoctor.name} onChangeText={text => setNewDoctor({...newDoctor, name: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Specialty" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} value={newDoctor.specialty} onChangeText={text => setNewDoctor({...newDoctor, specialty: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Qualification" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} value={newDoctor.qualification} onChangeText={text => setNewDoctor({...newDoctor, qualification: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Experience (years)" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="numeric" value={newDoctor.experience} onChangeText={text => setNewDoctor({...newDoctor, experience: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Email" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="email-address" value={newDoctor.email} onChangeText={text => setNewDoctor({...newDoctor, email: text})} />
              <TextInput style={[styles.modalInput, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Phone" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="phone-pad" value={newDoctor.phone} onChangeText={text => setNewDoctor({...newDoctor, phone: text})} />
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={() => {
                Alert.alert('Success', `Dr. ${newDoctor.name} added successfully`);
                setShowAddDoctorModal(false);
                setNewDoctor({ name: '', specialty: '', email: '', phone: '', experience: '', qualification: '', fee: '', shift: 'Morning' });
              }}>
                <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.modalSubmitGradient}>
                  <Text style={styles.modalSubmitText}>Add Doctor</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showSettingsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkMode ? '#0A1520' : '#FFFFFF', width: wp(isTablet ? 50 : 85) }]}>
            <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.modalBody}>
              <View style={[styles.settingRow, { borderBottomColor: darkMode ? '#334155' : '#E2E8F0' }]}>
                <View style={styles.settingLeft}>
                  <Ionicons name="moon" size={22} color="#04e1f5" />
                  <Text style={[styles.settingText, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Dark Mode</Text>
                </View>
                <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#E2E8F0', true: '#04e1f5' }} thumbColor="#FFF" />
              </View>
              <TouchableOpacity style={[styles.settingRow, { borderBottomColor: darkMode ? '#334155' : '#E2E8F0' }]} onPress={() => Alert.alert('Change Password', 'Navigate to change password')}>
                <View style={styles.settingLeft}>
                  <Ionicons name="lock-closed" size={22} color="#04e1f5" />
                  <Text style={[styles.settingText, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={darkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingRow, styles.logoutRow]} onPress={() => navigation.replace('Login')}>
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out" size={22} color="#EF4444" />
                  <Text style={[styles.settingText, { color: '#EF4444' }]}>Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotificationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.notificationModal, { backgroundColor: darkMode ? '#0A1520' : '#FFFFFF', width: wp(isTablet ? 60 : 92) }]}>
            <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
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
                  <Ionicons name="notifications-off" size={50} color={darkMode ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.emptyText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>No notifications</Text>
                </View>
              ) : (
                notifications.map(notification => (
                  <TouchableOpacity key={notification.id} style={[styles.notificationItem, !notification.read && styles.unreadNotification]}>
                    <View style={[styles.notificationIcon, { backgroundColor: notification.type === 'success' ? '#10B98120' : notification.type === 'error' ? '#EF444420' : notification.type === 'warning' ? '#F59E0B20' : '#04e1f520' }]}>
                      <Ionicons name={notification.type === 'success' ? 'checkmark-circle' : notification.type === 'error' ? 'alert-circle' : notification.type === 'warning' ? 'warning' : 'information-circle'} size={22} color={notification.type === 'success' ? '#10B981' : notification.type === 'error' ? '#EF4444' : notification.type === 'warning' ? '#F59E0B' : '#04e1f5'} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationItemTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{notification.title}</Text>
                      <Text style={[styles.notificationItemMessage, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{notification.message}</Text>
                      <Text style={[styles.notificationItemTime, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{notification.time}</Text>
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
  backgroundImage: { flex: 1 },
  scrollContent: { paddingBottom: hp(4) },
  
  // Header
  header: { width: '100%', paddingTop: statusBarHeight },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(4), paddingVertical: hp(1.5) },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  backBtn: { padding: wp(1) },
  menuBtn: { padding: wp(1) },
  
  // Circular Logo
  logoOutlineContainer: { shadowColor: '#04e1f5', shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  logoCircle: { width: wp(9), height: wp(9), borderRadius: wp(4.5), borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  logoImage: { width: wp(7), height: wp(7), borderRadius: wp(3.5), resizeMode: 'contain' },
  headerTitle: { fontSize: wp(4), fontWeight: 'bold', letterSpacing: 1 },
  headerSubtitle: { fontSize: wp(2.5), marginTop: hp(0.2) },
  headerRight: { flexDirection: 'row', gap: wp(4) },
  iconBtn: { padding: wp(1), position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -5, backgroundColor: '#EF4444', borderRadius: wp(2), minWidth: wp(4), height: wp(4), justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(0.5) },
  badgeText: { color: '#FFFFFF', fontSize: wp(2), fontWeight: 'bold' },
  
  // Drawer Menu
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawerBackdrop: { flex: 1 },
  drawerContainer: { width: wp(75), height: '100%', borderTopLeftRadius: wp(2), borderBottomLeftRadius: wp(2), overflow: 'hidden' },
  drawerHeader: { padding: wp(5), alignItems: 'center', borderBottomRightRadius: wp(2), borderBottomLeftRadius: wp(2) },
  drawerLogoOutline: { width: wp(18), height: wp(18), borderRadius: wp(9), borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: hp(1), backgroundColor: 'rgba(255,255,255,0.1)' },
  drawerLogo: { width: wp(14), height: wp(14), borderRadius: wp(7), resizeMode: 'contain' },
  drawerTitle: { color: '#FFFFFF', fontSize: wp(4.5), fontWeight: 'bold' },
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
  welcomeTitle: { color: '#FFF', fontSize: wp(4.5), fontWeight: 'bold' },
  welcomeSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: wp(2.8), marginTop: hp(0.5) },
  statsRow: { flexDirection: 'row', marginTop: hp(2), gap: wp(3) },
  welcomeStat: { flex: 1 },
  welcomeStatValue: { color: '#FFF', fontSize: wp(4.5), fontWeight: 'bold' },
  welcomeStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: wp(2.5), marginTop: hp(0.3) },
  welcomeStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  welcomeIcon: { opacity: 0.8 },
  
  // Section Header
  sectionHeaderWrapper: { marginHorizontal: wp(3), marginTop: wp(4), marginBottom: wp(2.5) },
  sectionHeaderBg: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(2.5), borderRadius: wp(3) },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  sectionHeaderIcon: { width: wp(7), height: wp(7), borderRadius: wp(2), justifyContent: 'center', alignItems: 'center' },
  sectionHeaderTitle: { fontSize: wp(5), fontWeight: 'bold' },
  sectionHeaderButton: { flexDirection: 'row', alignItems: 'center', gap: wp(1), paddingHorizontal: wp(2), paddingVertical: hp(0.5), borderRadius: wp(2), backgroundColor: 'rgba(4, 225, 245, 0.15)' },
  sectionHeaderButtonText: { fontSize: wp(2.8), color: '#04e1f5', fontWeight: '500' },
  
  // Modules Grid
  modulesGrid: { paddingHorizontal: wp(9), gap: wp(3) },
  moduleCard: { borderRadius: wp(4), borderWidth: 1.5, overflow: 'hidden' },
  moduleGradient: { padding: wp(4) },
  moduleIcon: { width: wp(12), height: wp(12), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center', marginBottom: hp(1) },
  moduleTitle: { fontSize: wp(4), fontWeight: 'bold', marginBottom: hp(0.5) },
  moduleValue: { fontSize: wp(6), fontWeight: 'bold' },
  moduleLabel: { fontSize: wp(2.8), marginBottom: hp(1.5) },
  moduleStats: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(2) },
  moduleStatItem: { flex: 1, alignItems: 'center' },
  moduleStatValue: { fontSize: wp(3.5), fontWeight: 'bold' },
  moduleStatLabel: { fontSize: wp(2.2) },
  moduleStatDivider: { width: 1, height: wp(5), backgroundColor: '#8da3c0' },
  moduleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5), paddingVertical: hp(1), borderRadius: wp(2) },
  moduleBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: wp(3) },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(9), gap: wp(3) },
  statCard: { flex: 1, minWidth: (width - wp(14)) / 2, borderRadius: wp(3), padding: wp(3), alignItems: 'center', borderWidth: 1 },
  statIcon: { width: wp(10), height: wp(10), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center', marginBottom: hp(1) },
  statValue: { fontSize: wp(5), fontWeight: 'bold' },
  statLabel: { fontSize: wp(2.8), marginTop: hp(0.3) },
  
  // Admin Team - Enhanced Professional Cards
  adminTeamScroll: { paddingHorizontal: wp(5), marginBottom: wp(2) },
  adminCard: { width: wp(70), borderRadius: wp(4), marginRight: wp(3), overflow: 'hidden', borderWidth: 1.5, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  adminCardHeader: { padding: wp(4), alignItems: 'center', position: 'relative' },
  adminAvatarLarge: { width: wp(20), height: wp(20), borderRadius: wp(10), backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  adminAvatarLargeText: { fontSize: wp(7), fontWeight: 'bold', color: '#FFF' },
  adminStatusBadge: { position: 'absolute', bottom: wp(2), right: wp(3), paddingHorizontal: wp(2), paddingVertical: hp(0.3), borderRadius: wp(2) },
  adminStatusBadgeText: { fontSize: wp(2.2), color: '#FFF', fontWeight: 'bold' },
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
  adminDetailAvatarText: { color: '#FFF', fontSize: wp(10), fontWeight: 'bold' },
  adminDetailStatus: { position: 'absolute', bottom: 0, right: wp(3), paddingHorizontal: wp(2), paddingVertical: hp(0.3), borderRadius: wp(3) },
  adminDetailStatusText: { color: '#FFF', fontSize: wp(2.2), fontWeight: 'bold' },
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
  adminDetailActionText: { color: '#FFF', fontSize: wp(3.2), fontWeight: '600' },
  
  // Period Selector
  periodSelectorWrapper: { flexDirection: 'row', marginHorizontal: wp(4), gap: wp(2), marginBottom: wp(3) },
  periodBtn: { paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(3), backgroundColor: '#E2E8F0' },
  activePeriodBtn: { backgroundColor: '#04e1f5d7' },
  periodBtnText: { fontSize: wp(3), color: '#606f85' },
  activePeriodText: { color: '#FFF', fontWeight: 'bold' },
  
  // Charts
  chartCard: { margin: wp(4), borderRadius: wp(3), padding: wp(4), borderWidth: 1 },
  chartTitle: { fontSize: wp(3.5), fontWeight: 'bold', marginBottom: wp(3) },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: hp(18) },
  chartBarItem: { alignItems: 'center', flex: 1 },
  chartBarWrapper: { alignItems: 'center', height: hp(14), justifyContent: 'flex-end' },
  chartBar: { width: wp(5), borderRadius: wp(2), marginBottom: hp(0.5) },
  chartBarValue: { fontSize: wp(2.5), marginBottom: hp(0.3), color: '#64748B' },
  chartBarLabel: { fontSize: wp(2.2), marginTop: hp(0.5), color: '#64748B', textAlign: 'center' },
  
  // Actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(4), gap: wp(3), marginBottom: wp(4) },
  actionCard: { width: (width - wp(14)) / 2, borderRadius: wp(3), overflow: 'hidden' },
  actionGradient: { padding: wp(3), alignItems: 'center', gap: hp(0.5) },
  actionText: { color: '#FFF', fontWeight: 'bold', fontSize: wp(3) },
  
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
  modalContent: { maxHeight: height * 0.85, borderRadius: wp(4), overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(4) },
  modalTitle: { fontSize: wp(4.5), fontWeight: 'bold', color: '#FFF' },
  modalBody: { padding: wp(4) },
  modalInput: { borderWidth: 1, borderRadius: wp(2.5), padding: wp(3), marginBottom: wp(3), fontSize: wp(3.2) },
  modalSubmitBtn: { borderRadius: wp(2.5), overflow: 'hidden', marginTop: wp(3) },
  modalSubmitGradient: { paddingVertical: hp(1.2), alignItems: 'center' },
  modalSubmitText: { color: '#FFF', fontWeight: 'bold', fontSize: wp(3.5) },
  
  // Module Selector
  moduleSelector: { marginBottom: wp(3) },
  moduleSelectorLabel: { fontSize: wp(3), marginBottom: hp(0.8) },
  moduleSelectorOptions: { flexDirection: 'row', gap: wp(2) },
  moduleSelectorBtn: { flex: 1, paddingVertical: hp(1), borderRadius: wp(2), backgroundColor: '#E2E8F0', alignItems: 'center' },
  activeModuleBtn: { backgroundColor: '#04e1f5' },
  moduleSelectorText: { color: '#64748B', fontSize: wp(2.8) },
  activeModuleText: { color: '#FFF', fontWeight: 'bold' },
  
  // Settings
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hp(1.5), borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  settingText: { fontSize: wp(3.5) },
  logoutRow: { borderBottomWidth: 0, marginTop: hp(1) },
  
  // Notifications
  notificationModal: { maxHeight: height * 0.85, borderRadius: wp(4), overflow: 'hidden' },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(4) },
  notificationTitle: { fontSize: wp(4.5), fontWeight: 'bold', color: '#FFF' },
  notificationActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp(4), paddingVertical: hp(1), borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  markAllText: { color: '#04e1f5', fontSize: wp(3), fontWeight: '500' },
  clearAllText: { color: '#EF4444', fontSize: wp(3), fontWeight: '500' },
  notificationList: { maxHeight: height * 0.65 },
  notificationItem: { flexDirection: 'row', padding: wp(3), borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: wp(3) },
  unreadNotification: { backgroundColor: 'rgba(4, 225, 245, 0.05)' },
  notificationIcon: { width: wp(10), height: wp(10), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center' },
  notificationContent: { flex: 1 },
  notificationItemTitle: { fontSize: wp(3.5), fontWeight: 'bold' },
  notificationItemMessage: { fontSize: wp(2.8), marginTop: hp(0.2) },
  notificationItemTime: { fontSize: wp(2.5), marginTop: hp(0.2) },
  notificationUnreadDot: { width: wp(2), height: wp(2), borderRadius: wp(1), backgroundColor: '#04e1f5', alignSelf: 'center' },
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