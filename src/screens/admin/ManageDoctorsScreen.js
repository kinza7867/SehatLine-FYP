// src/screens/DoctorPortalScreen.js - MODIFIED VERSION
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  StatusBar,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  Platform,
  RefreshControl,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Responsive functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

// Toast Component
const ToastNotification = ({ visible, message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();
      
      setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3000);
    }
  }, [visible]);
  
  const getToastStyles = () => {
    switch(type) {
      case 'success': return { backgroundColor: COLORS.success, icon: 'checkmark-circle' };
      case 'error': return { backgroundColor: COLORS.danger, icon: 'close-circle' };
      case 'warning': return { backgroundColor: COLORS.warning, icon: 'warning' };
      default: return { backgroundColor: COLORS.primary, icon: 'information-circle' };
    }
  };
  
  const toastStyle = getToastStyles();
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.toastContainer, { backgroundColor: toastStyle.backgroundColor, transform: [{ translateY }] }]}>
      <View style={styles.toastContent}>
        <Ionicons name={toastStyle.icon} size={22} color={COLORS.white} />
        <Text style={[styles.toastMessage, { color: COLORS.white }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const DoctorPortalScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextPatient, setNextPatient] = useState(null);
  const [queueStats, setQueueStats] = useState({
    waiting: 5,
    inConsultation: 1,
    completed: 12,
    total: 18,
    emergency: 2,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // ✅ Get the logged-in doctor from route params or use mock data
  const [loggedInDoctor, setLoggedInDoctor] = useState(null);

  // Mock doctor data (only ONE doctor - the logged-in one)
  const MOCK_DOCTOR = {
    id: '1',
    name: 'Dr. Ahmed Hassan',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology',
    experience: '12 years',
    patientsHandled: 2847,
    rating: 4.9,
    status: 'available',
    qualification: 'FCPS Cardiology, MBBS',
    email: 'ahmed.hassan@sehatline.com',
    phone: '+92 321 1234567',
    avatar: 'AH',
    color: '#FF6B6B',
    color2: '#E63946',
    schedule: 'Mon, Wed, Fri - 9AM to 5PM',
    todayAppointments: 8,
    shiftTiming: 'Morning',
    emergencyOnCall: true,
    hospital: 'CDA Hospital, Islamabad',
    bio: 'Board-certified interventional cardiologist with expertise in complex coronary interventions.',
  };

  useEffect(() => {
    // Get doctor from route params or use mock
    const doctor = route?.params?.doctor || MOCK_DOCTOR;
    setLoggedInDoctor(doctor);
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Mock queue data
    const mockQueue = [
      { id: '1', name: 'Muhammad Usman', age: 45, token: 3, priority: 'Normal', status: 'Waiting' },
      { id: '2', name: 'Saima Ahmed', age: 32, token: 2, priority: 'Urgent', status: 'Waiting' },
      { id: '3', name: 'Ali Raza', age: 28, token: 1, priority: 'Emergency', status: 'InConsultation' },
      { id: '4', name: 'Fatima Noor', age: 55, token: 4, priority: 'Normal', status: 'Waiting' },
      { id: '5', name: 'Usman Chaudhry', age: 38, token: 5, priority: 'Urgent', status: 'Waiting' },
    ];

    const current = mockQueue.find(q => q.status === 'InConsultation');
    const next = mockQueue.find(q => q.status === 'Waiting');

    setCurrentPatient(current);
    setNextPatient(next);
    setQueueStats({
      waiting: mockQueue.filter(q => q.status === 'Waiting').length,
      inConsultation: mockQueue.filter(q => q.status === 'InConsultation').length,
      completed: 12,
      total: mockQueue.length + 12,
      emergency: mockQueue.filter(q => q.priority === 'Emergency').length,
    });

    // Recent activity
    setRecentActivity([
      {
        id: '1',
        action: 'Prescription Sent',
        patient: 'Muhammad Usman',
        time: '5 mins ago',
        icon: 'document-text-outline',
        color: '#4CAF50',
      },
      {
        id: '2',
        action: 'Consultation Completed',
        patient: 'Saima Ahmed',
        time: '15 mins ago',
        icon: 'checkmark-circle-outline',
        color: '#2196F3',
      },
      {
        id: '3',
        action: 'Patient Checked In',
        patient: 'Ali Raza',
        time: '25 mins ago',
        icon: 'person-add-outline',
        color: '#FF9800',
      },
      {
        id: '4',
        action: 'Report Reviewed',
        patient: 'Fatima Noor',
        time: '45 mins ago',
        icon: 'analytics-outline',
        color: '#9C27B0',
      },
    ]);
  };

  const showToast = (message, type) => setToast({ visible: true, message, type });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadDashboardData();
      setRefreshing(false);
      showToast('Dashboard refreshed', 'success');
    }, 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCallNextPatient = () => {
    if (queueStats.waiting > 0) {
      showToast('Calling next patient...', 'success');
      // Navigate to consultation
      navigation.navigate('ConsultationScreen', { patient: nextPatient });
    } else {
      showToast('No patients in queue', 'warning');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          showToast('Logged out successfully', 'success');
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DoctorLogin' }],
            });
          }, 500);
        }}
      ]
    );
  };

  // Render Stat Card
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={wp(5.5)} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  // Render Quick Action
  const QuickAction = ({ title, icon, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={wp(6)} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  // Render Activity Item
  const ActivityItem = ({ activity }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
        <Ionicons name={activity.icon} size={wp(4.5)} color={activity.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{activity.action}</Text>
        <Text style={styles.activityPatient}>{activity.patient}</Text>
      </View>
      <Text style={styles.activityTime}>{activity.time}</Text>
    </View>
  );

  if (!loggedInDoctor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading doctor portal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <ToastNotification visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />

        {/* Header with Drawer Menu Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuBtn} 
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu-outline" size={wp(5.5)} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoOutline}>
              <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.headerTitle}>SehatLine</Text>
          </View>
          
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={wp(5)} color={COLORS.white} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >

          {/* Doctor Identity Section - ONLY LOGGED IN DOCTOR */}
          <View style={styles.doctorIdentity}>
            <View style={styles.doctorHeader}>
              <View style={styles.avatarWrapper}>
                <LinearGradient colors={[loggedInDoctor.color, loggedInDoctor.color2]} style={styles.doctorAvatar}>
                  <Text style={styles.doctorAvatarText}>{loggedInDoctor.avatar}</Text>
                </LinearGradient>
                <View style={[styles.onlineStatus, { backgroundColor: COLORS.success }]} />
              </View>
              
              <View style={styles.doctorInfo}>
                <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                <Text style={styles.doctorName}>{loggedInDoctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{loggedInDoctor.specialty}</Text>
                <View style={styles.doctorMeta}>
                  <Ionicons name="business-outline" size={wp(3)} color={COLORS.textLight} />
                  <Text style={styles.doctorMetaText}>{loggedInDoctor.department}</Text>
                  <Ionicons name="location-outline" size={wp(3)} color={COLORS.textLight} style={styles.metaIcon} />
                  <Text style={styles.doctorMetaText}>{loggedInDoctor.hospital}</Text>
                </View>
                <View style={styles.onlineStatusChip}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.statusText}>Online</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Waiting"
              value={queueStats.waiting}
              icon="time-outline"
              color="#FF9800"
            />
            <StatCard
              title="In Consultation"
              value={queueStats.inConsultation}
              icon="medical-outline"
              color="#2196F3"
            />
            <StatCard
              title="Completed"
              value={queueStats.completed}
              icon="checkmark-done-outline"
              color="#4CAF50"
            />
            <StatCard
              title="Emergency"
              value={queueStats.emergency}
              icon="alert-circle-outline"
              color="#F44336"
              subtitle="Critical cases"
            />
          </View>

          {/* Call Next Patient Button - PRIMARY ACTION */}
          <TouchableOpacity
            style={[styles.callNextButton, queueStats.waiting === 0 && styles.callNextButtonDisabled]}
            onPress={handleCallNextPatient}
            disabled={queueStats.waiting === 0}
          >
            <LinearGradient
              colors={queueStats.waiting > 0 ? ['#1a73e8', '#0d47a1'] : ['#ccc', '#999']}
              style={styles.callNextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="call-outline" size={wp(5)} color="#fff" />
              <Text style={styles.callNextText}>
                {queueStats.waiting > 0 ? 'Call Next Patient' : 'No Patients Waiting'}
              </Text>
              {queueStats.waiting > 0 && (
                <View style={styles.callNextBadge}>
                  <Text style={styles.callNextBadgeText}>{queueStats.waiting}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Live Queue Status */}
          <View style={styles.liveActivityPanel}>
            <View style={styles.liveActivityHeader}>
              <View style={styles.liveIndicator}>
                <View style={styles.pulsingDot} />
                <Text style={styles.liveActivityTitle}>Live Queue Status</Text>
              </View>
              <Text style={styles.liveUpdateTime}>Updated now</Text>
            </View>

            <View style={styles.liveActivityGrid}>
              <View style={styles.liveActivityItem}>
                <Text style={styles.liveActivityLabel}>Current Token</Text>
                <Text style={styles.liveActivityValue}>
                  {currentPatient?.token || '—'}
                </Text>
              </View>
              <View style={styles.liveActivityDivider} />
              <View style={styles.liveActivityItem}>
                <Text style={styles.liveActivityLabel}>Current Patient</Text>
                <Text style={styles.liveActivityValue} numberOfLines={1}>
                  {currentPatient?.name || 'None'}
                </Text>
              </View>
              <View style={styles.liveActivityDivider} />
              <View style={styles.liveActivityItem}>
                <Text style={styles.liveActivityLabel}>Next Patient</Text>
                <Text style={styles.liveActivityValue} numberOfLines={1}>
                  {nextPatient?.name || 'None'}
                </Text>
              </View>
              <View style={styles.liveActivityDivider} />
              <View style={styles.liveActivityItem}>
                <Text style={styles.liveActivityLabel}>Est. Wait Time</Text>
                <Text style={styles.liveActivityValue}>8 min</Text>
              </View>
              <View style={styles.liveActivityDivider} />
              <View style={styles.liveActivityItem}>
                <Text style={styles.liveActivityLabel}>Today's Progress</Text>
                <Text style={styles.liveActivityValue}>
                  {queueStats.completed}/{queueStats.total}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(queueStats.completed / queueStats.total) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((queueStats.completed / queueStats.total) * 100)}% Complete
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <QuickAction
                title="Queue"
                icon="people-outline"
                color="#1a73e8"
                onPress={() => navigation.navigate('TodayQueue')}
              />
              <QuickAction
                title="Consultation"
                icon="medkit-outline"
                color="#F44336"
                onPress={() => navigation.navigate('ConsultationScreen')}
              />
              <QuickAction
                title="Patient History"
                icon="folder-outline"
                color="#4CAF50"
                onPress={() => navigation.navigate('PatientRecords')}
              />
              <QuickAction
                title="Prescription"
                icon="document-text-outline"
                color="#9C27B0"
                onPress={() => navigation.navigate('PrescriptionTemplates')}
              />
              <QuickAction
                title="Availability"
                icon="time-outline"
                color="#FF9800"
                onPress={() => navigation.navigate('Availability')}
              />
              <QuickAction
                title="Schedule"
                icon="calendar-outline"
                color="#2196F3"
                onPress={() => navigation.navigate('Schedule')}
              />
              <QuickAction
                title="Reports"
                icon="bar-chart-outline"
                color="#795548"
                onPress={() => navigation.navigate('Reports')}
              />
              <QuickAction
                title="Profile"
                icon="person-outline"
                color="#1a73e8"
                onPress={() => navigation.navigate('Profile')}
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentActivitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={wp(4.5)} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: hp(1),
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },
  gradientBackground: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(28),
  },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
    paddingBottom: hp(1),
  },
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: wp(4.5),
    ...SHADOWS.medium,
  },
  logoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: wp(2),
  },
  logoOutline: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  logoImage: { width: wp(7), height: wp(7), borderRadius: wp(3.5) },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  notifBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: wp(4.5),
    position: 'relative',
    ...SHADOWS.medium,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger || '#EF4444',
    borderRadius: wp(2),
    minWidth: wp(4),
    height: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  badgeText: { color: COLORS.white, fontSize: wp(2), fontWeight: 'bold' },

  scrollContent: { 
    paddingBottom: hp(4),
    paddingTop: hp(1),
  },

  // Doctor Identity
  doctorIdentity: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: wp(3),
  },
  doctorAvatar: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  doctorAvatarText: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(3.5),
    height: wp(3.5),
    borderRadius: wp(1.75),
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  doctorInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: wp(3.5),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: hp(0.2),
  },
  doctorName: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: hp(0.2),
  },
  doctorSpecialty: {
    fontSize: wp(3.5),
    color: 'rgba(255,255,255,0.9)',
    marginBottom: hp(0.2),
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: hp(0.2),
  },
  doctorMetaText: {
    fontSize: wp(2.8),
    color: 'rgba(255,255,255,0.7)',
    marginLeft: wp(0.8),
  },
  metaIcon: {
    marginLeft: wp(2),
  },
  onlineStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(3),
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: wp(1.8),
    height: wp(1.8),
    borderRadius: wp(0.9),
    marginRight: wp(1),
  },
  statusText: {
    fontSize: wp(2.8),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(4),
    gap: wp(2.5),
    marginTop: hp(1),
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(3.5),
    width: (width - wp(10.5)) / 2,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2.5),
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  statSubtitle: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },

  // Call Next Button
  callNextButton: {
    marginHorizontal: wp(5),
    marginTop: hp(1.5),
    borderRadius: wp(3),
    overflow: 'hidden',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  callNextButtonDisabled: {
    opacity: 0.6,
  },
  callNextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  callNextText: {
    fontSize: wp(4.2),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  callNextBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.1),
    borderRadius: wp(2.5),
    minWidth: wp(4),
    alignItems: 'center',
  },
  callNextBadgeText: {
    fontSize: wp(2.8),
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Live Activity
  liveActivityPanel: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp(5),
    marginTop: hp(1.5),
    borderRadius: wp(3),
    padding: wp(4),
    ...SHADOWS.medium,
  },
  liveActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  pulsingDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: '#4CAF50',
  },
  liveActivityTitle: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.text,
  },
  liveUpdateTime: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },
  liveActivityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: hp(0.5),
  },
  liveActivityItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: hp(0.3),
  },
  liveActivityLabel: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginBottom: hp(0.2),
  },
  liveActivityValue: {
    fontSize: wp(4),
    fontWeight: '600',
    color: COLORS.text,
  },
  liveActivityDivider: {
    width: 1,
    height: hp(3),
    backgroundColor: COLORS.border,
  },
  progressContainer: {
    marginTop: hp(1),
  },
  progressBar: {
    height: hp(0.6),
    backgroundColor: '#e0e0e0',
    borderRadius: hp(0.3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: hp(0.3),
  },
  progressText: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp(0.3),
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: wp(5),
    marginTop: hp(1.5),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: wp(3.2),
    color: COLORS.primary,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2.5),
  },
  quickAction: {
    width: (width - wp(12.5)) / 4,
    alignItems: 'center',
    paddingVertical: hp(1.2),
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    ...SHADOWS.small,
  },
  quickActionIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.3),
  },
  quickActionTitle: {
    fontSize: wp(2.6),
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Recent Activity
  recentActivitySection: {
    paddingHorizontal: wp(5),
    marginTop: hp(1.5),
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: wp(3),
    borderRadius: wp(2.5),
    marginBottom: hp(0.8),
    ...SHADOWS.small,
  },
  activityIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2.5),
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: wp(3.2),
    fontWeight: '500',
    color: COLORS.text,
  },
  activityPatient: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  activityTime: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(5),
    marginTop: hp(2),
    paddingVertical: hp(1.2),
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    gap: wp(2),
    ...SHADOWS.medium,
  },
  logoutText: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#F44336',
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(5) : hp(3),
    left: wp(5),
    right: wp(5),
    zIndex: 1000,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    ...SHADOWS.medium,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  toastMessage: {
    flex: 1,
    fontSize: wp(3.5),
    fontWeight: '500',
  },
});

export default DoctorPortalScreen;