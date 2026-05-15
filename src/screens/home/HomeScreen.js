import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, Image, StatusBar, SafeAreaView, Modal,
  Alert, RefreshControl, Platform, TextInput, ImageBackground
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/* ============================ THEME (Dark - Consistent) =============================== */
const C = {
  bg:           '#0A1520',
  card:         'rgba(0, 0, 0, 0.55)',
  cardAlt:      'rgba(0, 0, 0, 0.45)',
  primary:      '#04e1f5',
  primarySoft:  'rgba(4, 225, 245, 0.15)',
  primaryTint:  'rgba(4, 225, 245, 0.1)',
  accent:       '#FFB800',
  accentSoft:   'rgba(255, 184, 0, 0.15)',
  emergency:    '#FF4D4D',
  emergencySoft:'rgba(255, 77, 77, 0.15)',
  text:         '#FFFFFF',
  textSub:      '#B2DFDB',
  textMuted:    '#94A3B8',
  border:       'rgba(4, 225, 245, 0.2)',
  borderSoft:   'rgba(4, 225, 245, 0.15)',
  white:        '#FFFFFF',
};

const HospitalHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState('');

  const [liveQueue, setLiveQueue] = useState([
    { id: 1, dept: 'Cardiology OPD',  current: 'A-12', waiting: 8,  time: '15 min', screen: 'LiveTokenQueueScreen' },
    { id: 2, dept: 'Neurology OPD',   current: 'B-05', waiting: 12, time: '22 min', screen: 'LiveTokenQueueScreen' },
    { id: 3, dept: 'Pediatrics OPD',  current: 'C-08', waiting: 5,  time: '10 min', screen: 'LiveTokenQueueScreen' },
    { id: 4, dept: 'Orthopedics',     current: 'D-03', waiting: 6,  time: '12 min', screen: 'LiveTokenQueueScreen' },
  ]);

  const mainModules = [
    { id: 1, name: 'Chronic Care', icon: 'pulse',                color: '#FF4D6D', screen: 'ChronicPortal',         description: 'Diabetes & Heart' },
    { id: 2, name: 'Doctors',      icon: 'people-circle',        color: '#FF6B35', screen: 'DoctorListScreen',      description: 'Expert Specialists' },
    { id: 3, name: 'Laboratory',   icon: 'flask',                color: '#04e1f5', screen: 'ReportsListScreen',     description: 'Tests & Reports' },
    { id: 4, name: 'Pharmacy',     icon: 'medical',              color: '#10B981', screen: 'MedicineListScreen',    description: 'Order Medicines' },
    { id: 5, name: 'Emergency',    icon: 'alert-circle',         color: '#FF4D4D', screen: 'EmergencyHomeScreen',   description: '24/7 Urgent Care' },
    { id: 6, name: 'Radiology',    icon: 'scan-circle',          color: '#8B5CF6', screen: 'ReportsListScreen',     description: 'X-Ray & MRI' },
  ];

  const quickServices = [
    { id: 1, name: 'Book Appt',  icon: 'calendar-outline',         color: '#4e05f8', screen: 'BookAppointmentScreen' },
    { id: 2, name: 'Token',      icon: 'timer-outline',            color: '#04e1f5', screen: 'LiveTokenQueueScreen' },
    { id: 3, name: 'Reports',    icon: 'document-text-outline',    color: '#04f8a7', screen: 'ReportsListScreen' },
    { id: 4, name: 'Ambulance',  icon: 'car-sport',                color: '#f80505', screen: 'AmbulanceTrackingScreen' },
    { id: 5, name: 'AI Tips',    icon: 'bulb-outline',             color: '#eec705', screen: 'AIHealthTipsScreen' },
    { id: 6, name: 'Symptom',    icon: 'chatbubble-ellipses',      color: '#FF4D6D', screen: 'AISymptomCheckerScreen' },
    { id: 7, name: 'Insurance',  icon: 'shield-checkmark-outline', color: '#00B894', screen: 'InsurancePartnersScreen' },
    { id: 8, name: 'Indoor Map', icon: 'navigate-circle-outline',  color: '#6366F1', screen: 'RoomDirectoryScreen' },
  ];

  const hospitalStats = [
    { label: 'Available Beds',   value: '42',  icon: 'bed-outline',     color: '#10B981', screen: 'OccupancyHeatmapScreen' },
    { label: 'Active Doctors',   value: '28',  icon: 'medkit-outline',  color: '#FFD60A', screen: 'DoctorListScreen' },
    { label: 'In Queue',         value: '23',  icon: 'people-outline',  color: '#FF4D6D', screen: 'LiveTokenQueueScreen' },
    { label: "Today's Patients", value: '156', icon: 'pulse-outline',   color: '#04e1f5', screen: 'AppointmentList' },
  ];

  const departments = [
    { name: 'Cardiology',       icon: 'heart' },
    { name: 'Neurology',        icon: 'pulse' },
    { name: 'Pediatrics',       icon: 'happy' },
    { name: 'Orthopedics',      icon: 'fitness' },
    { name: 'Dermatology',      icon: 'hand-left' },
    { name: 'Psychiatry',       icon: 'cloud' },
    { name: 'ENT',              icon: 'ear' },
    { name: 'Ophthalmology',    icon: 'eye' },
    { name: 'Gynecology',       icon: 'female' },
    { name: 'Urology',          icon: 'water' },
    { name: 'Dental',           icon: 'medkit' },
    { name: 'Physical Therapy', icon: 'walk' },
  ];

  const menuItems = [
    { name: 'Hospital Directory', icon: 'business-outline',       screen: 'HospitalDirectoryScreen' },
    { name: 'Doctor Schedule',    icon: 'calendar-outline',       screen: 'DoctorScheduleScreen' },
    { name: 'Room Directory',     icon: 'location-outline',       screen: 'RoomDirectoryScreen' },
    { name: 'Lab Price List',     icon: 'flask-outline',          screen: 'LabTestsPriceScreen' },
    { name: 'Medicine List',      icon: 'medical-outline',        screen: 'MedicineListScreen' },
    { name: 'Insurance Partners', icon: 'shield-outline',         screen: 'InsurancePartnersScreen' },
    { name: 'Hospital Policies',  icon: 'document-text-outline',  screen: 'PoliciesScreen' },
    { name: 'Contact & Location', icon: 'call-outline',           screen: 'ContactScreen' },
    { name: 'Notifications',      icon: 'notifications-outline',  screen: 'Notifications' },
    { name: 'Settings',           icon: 'settings-outline',       screen: 'SettingsScreen' },
    { name: 'Help & Support',     icon: 'help-circle-outline',    screen: 'HelpSupportScreen' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const navigateToScreen = (screenName, params = {}) => {
    if (screenName && navigation) {
      navigation.navigate(screenName, params);
    } else {
      Alert.alert('Coming Soon', 'This module is being updated.');
    }
  };

  // Live Queue Auto Refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveQueue(prev =>
        prev.map(item => ({
          ...item,
          waiting: Math.max(1, item.waiting + (Math.random() > 0.7 ? 1 : -1)),
          time: `${Math.floor(Math.random() * 30) + 5} min`,
        }))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  /* ============================== RENDERERS =============================== */

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#001D3D', '#000814']}
        style={styles.headerGradient}
      >
        {/* Top Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(true)}>
            <Ionicons name="menu-outline" size={26} color={C.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoWrapper} onPress={() => navigateToScreen('AboutHospitalScreen')}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.logoText}>
                SEHAT<Text style={{ color: C.white }}>LINE</Text>
              </Text>
              <Text style={styles.logoSub}>CDA Healthcare Portal</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => navigateToScreen('Notifications')}>
            <View style={styles.notificationBadge}>
              <Ionicons name="notifications-outline" size={24} color={C.primary} />
              <View style={styles.badgeDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Greeting Strip */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingHello}>{greeting()},</Text>
            <Text style={styles.greetingName}>Welcome back 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.profileChip}
            onPress={() => navigateToScreen('ProfileScreen')}
          >
            <Ionicons name="person" size={16} color={C.primary} />
            <Text style={styles.profileChipText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.searchBar}
          onPress={() => navigateToScreen('DoctorListScreen')}
        >
          <Ionicons name="search" size={18} color={C.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, services, medicines..."
            placeholderTextColor={C.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => navigateToScreen('DoctorListScreen', { query: search })}
          />
          <View style={styles.micBtn}>
            <Ionicons name="mic" size={16} color={C.white} />
          </View>
        </TouchableOpacity>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          {hospitalStats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={() => navigateToScreen(stat.screen)}
            >
              <View style={[styles.statIconWrap, { backgroundColor: stat.color + '1A' }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );

  const renderHeroBanner = () => (
    <View style={styles.heroWrap}>
      <LinearGradient
        colors={['rgba(255, 77, 77, 0.15)', 'rgba(0, 0, 0, 0.55)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconBig}>
            <Ionicons name="medkit" size={26} color={C.white} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.heroTitle}>Emergency Care</Text>
            <Text style={styles.heroSub}>24/7 Available • Immediate Assistance</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={[styles.heroAction, { backgroundColor: C.emergency }]}
            onPress={() => navigateToScreen('EmergencyHomeScreen')}
          >
            <Ionicons name="call" size={16} color={C.white} />
            <Text style={styles.heroActionText}>Call 1122</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroAction, styles.heroActionGhost]}
            onPress={() => navigateToScreen('SOS')}
          >
            <Ionicons name="warning" size={16} color={C.emergency} />
            <Text style={[styles.heroActionText, { color: C.emergency }]}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroAction, styles.heroActionGhost]}
            onPress={() => navigateToScreen('AmbulanceTrackingScreen')}
          >
            <Ionicons name="car-sport" size={16} color={C.emergency} />
            <Text style={[styles.heroActionText, { color: C.emergency }]}>Ambulance</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderMainModules = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hospital Services</Text>
        <TouchableOpacity onPress={() => navigateToScreen('HospitalDirectoryScreen')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.modulesGrid}>
        {mainModules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={styles.moduleCard}
            onPress={() => navigateToScreen(module.screen)}
            activeOpacity={0.85}
          >
            <View style={[styles.moduleStripe, { backgroundColor: module.color }]} />
            <View style={[styles.moduleIcon, { backgroundColor: module.color + '15' }]}>
              <Ionicons name={module.icon} size={26} color={module.color} />
            </View>
            <Text style={styles.moduleName}>{module.name}</Text>
            <Text style={styles.moduleDesc}>{module.description}</Text>
            <View style={styles.moduleArrow}>
              <Ionicons name="arrow-forward" size={14} color={module.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuickServices = () => (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <Ionicons name="flash" size={18} color={C.accent} />
        </View>
        <View style={styles.quickGrid}>
          {quickServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.quickCard}
              onPress={() => navigateToScreen(service.screen)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[service.color, service.color + 'CC']}
                style={styles.quickIconGradient}
              >
                <Ionicons name={service.icon} size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.quickName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );

  const renderHealthTip = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.tipCard}
        onPress={() => navigateToScreen('AIHealthTipsScreen')}
        activeOpacity={0.9}
      >
        <View style={styles.tipIconWrap}>
          <Ionicons name="bulb" size={22} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipLabel}>HEALTH TIP OF THE DAY</Text>
          <Text style={styles.tipText}>
            Drink at least 8 glasses of water daily to stay hydrated and support your immune system.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const renderLiveQueue = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Queue Status</Text>
        <TouchableOpacity onPress={() => navigateToScreen('LiveTokenQueueScreen')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>
      {liveQueue.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.queueCard}
          onPress={() => navigateToScreen(item.screen, { department: item.dept })}
          activeOpacity={0.85}
        >
          <View style={styles.queueLeft}>
            <View style={styles.queueDeptIcon}>
              <Ionicons name="medical" size={18} color={C.primary} />
            </View>
            <View style={styles.queueInfo}>
              <Text style={styles.queueDept}>{item.dept}</Text>
              <Text style={styles.queueCurrent}>
                Now serving:{' '}
                <Text style={{ color: C.primary, fontWeight: '800' }}>{item.current}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.queueStats}>
            <View style={styles.queueChip}>
              <Ionicons name="people" size={10} color={C.textSub} />
              <Text style={styles.waitingText}>{item.waiting}</Text>
            </View>
            <View style={[styles.queueChip, { backgroundColor: C.primaryTint }]}>
              <Ionicons name="time" size={10} color={C.primary} />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDepartments = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <TouchableOpacity onPress={() => navigateToScreen('DoctorListScreen')}>
          <Text style={styles.viewAllText}>See Doctors →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {departments.map((dept, index) => (
          <TouchableOpacity
            key={index}
            style={styles.deptChip}
            onPress={() => navigateToScreen('DoctorListScreen', { specialty: dept.name })}
            activeOpacity={0.85}
          >
            <View style={styles.deptChipIcon}>
              <Ionicons name={dept.icon} size={16} color={C.primary} />
            </View>
            <Text style={styles.deptChipText}>{dept.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAnnouncements = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Announcements</Text>
        <TouchableOpacity onPress={() => navigateToScreen('Announcements')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.announceCard} onPress={() => navigateToScreen('Announcements')}>
        <View style={[styles.announceIcon, { backgroundColor: C.primaryTint }]}>
          <Ionicons name="megaphone" size={18} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.announceTitle}>Free Health Camp</Text>
          <Text style={styles.announceText}>Sunday, 20th April. Register at reception desk.</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.announceCard} onPress={() => navigateToScreen('HospitalTimingsScreen')}>
        <View style={[styles.announceIcon, { backgroundColor: C.accentSoft }]}>
          <Ionicons name="time" size={18} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.announceTitle}>OPD Timings</Text>
          <Text style={styles.announceText}>9:00 AM – 5:00 PM (Mon–Sat) | Emergency: 24/7</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.announceCard} onPress={() => navigateToScreen('DoctorListScreen')}>
        <View style={[styles.announceIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
          <Ionicons name="medkit" size={18} color="#10B981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.announceTitle}>New Cardiology Specialist</Text>
          <Text style={styles.announceText}>Dr. Ahmed Khan joined. Book appointments online.</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
      </TouchableOpacity>
    </View>
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
            {renderHeader()}

            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
              }
              contentContainerStyle={styles.scrollContent}
            >
              {renderHeroBanner()}
              {renderMainModules()}
              {renderQuickServices()}
              {renderHealthTip()}
              {renderLiveQueue()}
              {renderDepartments()}
              {renderAnnouncements()}
              <View style={{ height: 30 }} />
            </ScrollView>

            {/* Bottom Tab Bar */}
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.bottomTab} onPress={() => navigation.navigate('MainApp')}>
                <View style={styles.bottomActiveDot} />
                <Ionicons name="home" size={22} color={C.primary} />
                <Text style={[styles.bottomLabel, styles.activeLabel]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomTab} onPress={() => navigateToScreen('BookAppointmentScreen')}>
                <Ionicons name="calendar-outline" size={22} color={C.textSub} />
                <Text style={styles.bottomLabel}>Book</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomTabCenter} onPress={() => navigateToScreen('AISymptomCheckerScreen')}>
                <LinearGradient
                  colors={[C.primary, '#0284c7']}
                  style={styles.bottomCenterCircle}
                >
                  <Ionicons name="medical" size={24} color={C.white} />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomTab} onPress={() => navigateToScreen('LiveTokenQueueScreen')}>
                <Ionicons name="timer-outline" size={22} color={C.textSub} />
                <Text style={styles.bottomLabel}>Queue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomTab} onPress={() => navigateToScreen('ProfileScreen')}>
                <Ionicons name="person-outline" size={22} color={C.textSub} />
                <Text style={styles.bottomLabel}>Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Side Menu Modal */}
            <Modal visible={showMenu} transparent animationType="slide">
              <View style={styles.menuOverlay}>
                <View style={styles.menuContainer}>
                  <View style={styles.menuGradientFull}>
                    <LinearGradient colors={['#001D3D', '#000814']} style={styles.menuHeader}>
                      <View style={styles.menuLogoCircle}>
                        <Image source={require('../../../assets/logo.png')} style={styles.menuLogo} resizeMode="contain" />
                      </View>
                      <Text style={styles.menuHospital}>SehatLine</Text>
                      <Text style={styles.menuAddress}>CDA Hospital, Islamabad</Text>
                      <TouchableOpacity style={styles.closeMenuBtn} onPress={() => setShowMenu(false)}>
                        <Ionicons name="close-circle" size={28} color={C.primary} />
                      </TouchableOpacity>
                    </LinearGradient>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                      {menuItems.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.menuItem}
                          onPress={() => {
                            setShowMenu(false);
                            setTimeout(() => navigateToScreen(item.screen), 250);
                          }}
                        >
                          <View style={styles.menuItemIconWrap}>
                            <Ionicons name={item.icon} size={18} color={C.primary} />
                          </View>
                          <Text style={styles.menuItemText}>{item.name}</Text>
                          <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View style={styles.menuFooter}>
                      <Text style={styles.menuFooterText}>Version 2.0.0  •  © 2026 SehatLine</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
              </View>
            </Modal>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

/* ================================ STYLES ================================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1 },
  safeArea:  { flex: 1 },

  /* HEADER */
  headerContainer: { marginBottom: 8 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 8,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: 'rgba(0, 29, 61, 0.95)',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.borderSoft,
  },
  logoWrapper: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, overflow: 'hidden',
    borderWidth: 1.5, borderColor: C.primarySoft,
  },
  logoImage: { width: 40, height: 40 },
  logoText: { color: C.primary, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  logoSub: { color: C.textSub, fontSize: 9.5, marginTop: 1 },

  notificationBadge: { position: 'relative' },
  badgeDot: {
    position: 'absolute', top: -2, right: -2,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: C.emergency,
    borderWidth: 1.5, borderColor: C.white,
  },

  /* GREETING */
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  greetingHello: { color: C.textSub, fontSize: 13, fontWeight: '500' },
  greetingName: { color: C.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  profileChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.primaryTint,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 18, gap: 6,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  profileChipText: { color: C.primary, fontSize: 12, fontWeight: '700' },

  /* SEARCH */
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 14, gap: 10,
    borderWidth: 1, borderColor: C.borderSoft,
    marginBottom: 14,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 13, paddingVertical: Platform.OS === 'ios' ? 10 : 6 },
  micBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  /* STATS */
  statsScroll: { paddingHorizontal: 16 },
  statCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10,
    marginRight: 10, gap: 10,
    borderWidth: 1, borderColor: C.borderSoft,
    minWidth: width * 0.36,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { color: C.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: C.textSub, fontSize: 10.5, marginTop: 1 },

  scrollContent: { paddingBottom: 110 },

  /* HERO / EMERGENCY */
  heroWrap: { paddingHorizontal: 16, marginBottom: 18 },
  heroCard: {
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: C.borderSoft,
    backgroundColor: C.card,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heroIconBig: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.emergency,
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { color: C.text, fontSize: 17, fontWeight: '800' },
  heroSub: { color: C.textSub, fontSize: 11.5, marginTop: 3 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.emergencySoft,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.emergency },
  liveText: { color: C.emergency, fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5 },
  heroActions: { flexDirection: 'row', gap: 8 },
  heroAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 12, gap: 6,
  },
  heroActionGhost: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1.5, borderColor: C.emergencySoft,
  },
  heroActionText: { color: C.white, fontSize: 12.5, fontWeight: '700' },

  /* SECTIONS */
  section: { paddingHorizontal: 16, marginBottom: 22 },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: { color: C.primary, fontSize: 12, fontWeight: '700' },

  /* MAIN MODULES */
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moduleCard: {
    width: (width - 44) / 2,
    backgroundColor: C.card,
    borderRadius: 16, padding: 14,
    marginBottom: 12,
    borderWidth: 1, borderColor: C.borderSoft,
    overflow: 'hidden',
  },
  moduleStripe: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
  },
  moduleIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, marginTop: 4,
  },
  moduleName: { color: C.text, fontSize: 14, fontWeight: '800' },
  moduleDesc: { color: C.textSub, fontSize: 11, marginTop: 3 },
  moduleArrow: {
    position: 'absolute', top: 14, right: 12,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.cardAlt,
    justifyContent: 'center', alignItems: 'center',
  },

  /* QUICK SERVICES */
  quickGrid: { 
  flexDirection: 'row', 
  flexWrap: 'wrap', 
  justifyContent: 'space-between',
  marginHorizontal: -4,
},
quickCard: { 
  width: (width - 48) / 4, 
  alignItems: 'center', 
  marginBottom: 16,
  paddingHorizontal: 4,
},
quickIconGradient: {
  width: 65,
  height: 65,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 5,
},
quickName: { 
  color: C.text, 
  fontSize: 12, 
  fontWeight: 'bold', 
  textAlign: 'center',
  letterSpacing: 0.3,
},

  /* HEALTH TIP */
  tipCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14, padding: 14, gap: 12,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  tipIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  tipLabel: { color: C.accent, fontSize: 9.5, fontWeight: '800', letterSpacing: 1 },
  tipText: { color: C.textSub, fontSize: 12.5, marginTop: 3, lineHeight: 17 },

  /* QUEUE */
  queueCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  queueLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  queueDeptIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.primaryTint,
    justifyContent: 'center', alignItems: 'center',
  },
  queueInfo: { flex: 1 },
  queueDept: { color: C.text, fontSize: 13.5, fontWeight: '700' },
  queueCurrent: { color: C.textSub, fontSize: 11, marginTop: 2 },
  queueStats: { alignItems: 'flex-end', gap: 5 },
  queueChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.cardAlt,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  waitingText: { color: C.textSub, fontSize: 10, fontWeight: '600' },
  timeText: { color: C.primary, fontSize: 10.5, fontWeight: '800' },

  /* DEPARTMENTS */
  deptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.card,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, marginRight: 8,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  deptChipIcon: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.primaryTint,
    justifyContent: 'center', alignItems: 'center',
  },
  deptChipText: { color: C.text, fontSize: 12.5, fontWeight: '700' },

  /* ANNOUNCEMENTS */
  announceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card,
    padding: 12, borderRadius: 14, marginBottom: 8,
    gap: 12,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  announceIcon: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  announceTitle: { color: C.text, fontSize: 13, fontWeight: '700' },
  announceText: { color: C.textSub, fontSize: 11.5, marginTop: 2, lineHeight: 16 },

  /* BOTTOM BAR */
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 6,
    borderTopWidth: 1, borderTopColor: C.borderSoft,
  },
  bottomTab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  bottomTabCenter: { flex: 1, alignItems: 'center', marginTop: -22 },
  bottomCenterCircle: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: 'rgba(0, 0, 0, 0.85)',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  bottomActiveDot: {
    position: 'absolute', top: 0,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: C.primary,
  },
  bottomLabel: { color: C.textSub, fontSize: 10, marginTop: 2, fontWeight: '600' },
  activeLabel: { color: C.primary, fontWeight: '800' },

  /* SIDE MENU */
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    flexDirection: 'row',
  },
  menuContainer: { width: width * 0.78, height: '100%' },
  menuBackdrop: { flex: 1, backgroundColor: 'transparent' },
  menuGradientFull: { flex: 1, backgroundColor: '#001D3D' },
  menuHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 22,
    alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: C.borderSoft,
    position: 'relative',
  },
  menuLogoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, overflow: 'hidden',
    borderWidth: 2, borderColor: C.primarySoft,
  },
  menuLogo: { width: 64, height: 64 },
  menuHospital: { color: C.text, fontSize: 17, fontWeight: '800' },
  menuAddress: { color: C.textSub, fontSize: 11.5, marginTop: 3 },
  closeMenuBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, right: 14, padding: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: C.borderSoft,
    gap: 12,
  },
  menuItemIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.primaryTint,
    justifyContent: 'center', alignItems: 'center',
  },
  menuItemText: { flex: 1, color: C.text, fontSize: 13.5, fontWeight: '600' },
  menuFooter: {
    padding: 14, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: C.borderSoft,
  },
  menuFooterText: { color: C.textMuted, fontSize: 10.5 },
});

export default HospitalHomeScreen;