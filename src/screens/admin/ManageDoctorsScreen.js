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
  Switch,
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

const DoctorPortalScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [filterType, setFilterType] = useState('all');

  const showToast = (message, type) => setToast({ visible: true, message, type });

  // Complete Doctors Database
  const [doctors, setDoctors] = useState([
    // Cardiology Department
    { 
      id: '1', 
      name: 'Dr. Ahmed Hassan', 
      specialty: 'Interventional Cardiologist', 
      department: 'Cardiology',
      experience: '12 years',
      patientsHandled: 2847,
      rating: 4.9,
      status: 'available',
      consultationFee: 2500,
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
      performance: { satisfaction: 98, noShows: 12, avgWait: 8 },
      joinDate: 'Jan 2020',
      certifications: ['FACC', 'FSCAI'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Board-certified interventional cardiologist with expertise in complex coronary interventions.',
    },
    { 
      id: '2', 
      name: 'Dr. Fatima Noor', 
      specialty: 'Pediatric Cardiologist', 
      department: 'Cardiology',
      experience: '10 years',
      patientsHandled: 2134,
      rating: 4.8,
      status: 'available',
      consultationFee: 2200,
      qualification: 'FCPS Pediatrics, MBBS',
      email: 'fatima.noor@sehatline.com',
      phone: '+92 322 2345678',
      avatar: 'FN',
      color: '#4ECDC4',
      color2: '#059669',
      schedule: 'Tue, Thu, Sat - 10AM to 6PM',
      todayAppointments: 6,
      shiftTiming: 'Evening',
      emergencyOnCall: false,
      performance: { satisfaction: 95, noShows: 8, avgWait: 10 },
      joinDate: 'Mar 2021',
      certifications: ['FAAP', 'FSCAI'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Dedicated pediatric cardiologist specializing in congenital heart defects in children.',
    },
    { 
      id: '3', 
      name: 'Dr. Zain Akhtar', 
      specialty: 'Cardiothoracic Surgeon', 
      department: 'Cardiology',
      experience: '18 years',
      patientsHandled: 3521,
      rating: 4.9,
      status: 'busy',
      consultationFee: 3500,
      qualification: 'FCPS Cardiac Surgery, MBBS',
      email: 'zain.akhtar@sehatline.com',
      phone: '+92 323 3456789',
      avatar: 'ZA',
      color: '#F59E0B',
      color2: '#D97706',
      schedule: 'Mon to Fri - 8AM to 4PM',
      todayAppointments: 10,
      shiftTiming: 'Morning',
      emergencyOnCall: true,
      performance: { satisfaction: 97, noShows: 5, avgWait: 15 },
      joinDate: 'Jun 2019',
      certifications: ['FACC', 'FSCAI', 'FACS'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Renowned cardiothoracic surgeon with over 5,000 successful heart surgeries.',
    },
    { 
      id: '4', 
      name: 'Dr. Ayesha Tariq', 
      specialty: 'Cardiac Electrophysiologist', 
      department: 'Cardiology',
      experience: '11 years',
      patientsHandled: 1876,
      rating: 4.7,
      status: 'available',
      consultationFee: 2800,
      qualification: 'FCPS Cardiology, MBBS',
      email: 'ayesha.tariq@sehatline.com',
      phone: '+92 324 4567890',
      avatar: 'AT',
      color: '#A29BFE',
      color2: '#6D28D9',
      schedule: 'Mon, Wed, Thu, Sat - 10AM to 7PM',
      todayAppointments: 5,
      shiftTiming: 'Evening',
      emergencyOnCall: false,
      performance: { satisfaction: 93, noShows: 10, avgWait: 12 },
      joinDate: 'Sep 2022',
      certifications: ['FASE', 'FHRS'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Expert in cardiac rhythm disorders and complex ablations.',
    },
    { 
      id: '5', 
      name: 'Dr. Usman Riaz', 
      specialty: 'Clinical Cardiologist', 
      department: 'Cardiology',
      experience: '15 years',
      patientsHandled: 2156,
      rating: 4.7,
      status: 'available',
      consultationFee: 2300,
      qualification: 'FRCP, MBBS',
      email: 'usman.riaz@sehatline.com',
      phone: '+92 325 5678901',
      avatar: 'UR',
      color: '#60A5FA',
      color2: '#2563EB',
      schedule: 'Mon to Fri - 9AM to 3PM',
      todayAppointments: 7,
      shiftTiming: 'Morning',
      emergencyOnCall: false,
      performance: { satisfaction: 94, noShows: 6, avgWait: 9 },
      joinDate: 'Aug 2018',
      certifications: ['FRCP', 'FACC'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Clinical cardiologist focusing on preventive cardiology and cardiac rehabilitation.',
    },

    // Pharmacy Department
    { 
      id: '6', 
      name: 'Dr. Muhammad Hassan', 
      specialty: 'Clinical Pharmacist', 
      department: 'Pharmacy',
      experience: '12 years',
      patientsHandled: 2980,
      rating: 4.9,
      status: 'available',
      consultationFee: 1500,
      qualification: 'Pharm.D, RPh',
      email: 'muhammad.hassan@sehatline.com',
      phone: '+92 325 5678901',
      avatar: 'MH',
      color: '#10B981',
      color2: '#059669',
      schedule: 'Mon to Sat - 9AM to 5PM',
      todayAppointments: 0,
      shiftTiming: 'Morning',
      emergencyOnCall: false,
      performance: { satisfaction: 96, noShows: 3, avgWait: 5 },
      joinDate: 'Aug 2020',
      certifications: ['BCPS', 'RPh'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Clinical pharmacist specializing in medication management and drug interactions.',
      prescriptionVerified: 45,
      drugInteractions: 3,
      inventoryAlert: false,
    },
    { 
      id: '7', 
      name: 'Dr. Samina Ali', 
      specialty: 'Hospital Pharmacist', 
      department: 'Pharmacy',
      experience: '9 years',
      patientsHandled: 2134,
      rating: 4.6,
      status: 'available',
      consultationFee: 1200,
      qualification: 'Pharm.D, MBA',
      email: 'samina.ali@sehatline.com',
      phone: '+92 326 6789012',
      avatar: 'SA',
      color: '#3B82F6',
      color2: '#1D4ED8',
      schedule: 'Mon to Fri - 10AM to 6PM',
      todayAppointments: 0,
      shiftTiming: 'Evening',
      emergencyOnCall: false,
      performance: { satisfaction: 92, noShows: 2, avgWait: 4 },
      joinDate: 'Jan 2021',
      certifications: ['RPh', 'MBA'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Hospital pharmacist with expertise in sterile compounding and medication safety.',
      prescriptionVerified: 32,
      drugInteractions: 1,
      inventoryAlert: true,
    },

    // Laboratory Department
    { 
      id: '8', 
      name: 'Dr. Ahmed Khan', 
      specialty: 'Clinical Pathologist', 
      department: 'Laboratory',
      experience: '14 years',
      patientsHandled: 1340,
      rating: 4.8,
      status: 'available',
      consultationFee: 1800,
      qualification: 'PhD, MBBS',
      email: 'ahmed.khan@sehatline.com',
      phone: '+92 327 7890123',
      avatar: 'AK',
      color: '#8B5CF6',
      color2: '#6D28D9',
      schedule: 'Mon to Sat - 9AM to 5PM',
      todayAppointments: 0,
      shiftTiming: 'Morning',
      emergencyOnCall: false,
      performance: { satisfaction: 94, noShows: 4, avgWait: 6 },
      joinDate: 'Mar 2019',
      certifications: ['FACP', 'ASCP'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Clinical pathologist leading diagnostic laboratory services.',
      testsProcessed: 156,
    },
    { 
      id: '9', 
      name: 'Dr. Sana Javed', 
      specialty: 'Microbiologist', 
      department: 'Laboratory',
      experience: '10 years',
      patientsHandled: 760,
      rating: 4.7,
      status: 'available',
      consultationFee: 1600,
      qualification: 'MD, MRCPath',
      email: 'sana.javed@sehatline.com',
      phone: '+92 328 8901234',
      avatar: 'SJ',
      color: '#EC4899',
      color2: '#BE185D',
      schedule: 'Mon to Fri - 10AM to 6PM',
      todayAppointments: 0,
      shiftTiming: 'Evening',
      emergencyOnCall: false,
      performance: { satisfaction: 91, noShows: 6, avgWait: 7 },
      joinDate: 'Jun 2022',
      certifications: ['MRCPath', 'FIDSA'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Medical microbiologist specializing in infectious disease diagnosis.',
      testsProcessed: 89,
    },

    // Other Specialists
    { 
      id: '10', 
      name: 'Dr. Muhammad Ali', 
      specialty: 'Neurologist', 
      department: 'Neurology',
      experience: '10 years',
      patientsHandled: 760,
      rating: 4.6,
      status: 'available',
      consultationFee: 2600,
      qualification: 'FACP, MBBS',
      email: 'muhammad.ali@sehatline.com',
      phone: '+92 329 9012345',
      avatar: 'MA',
      color: '#F472B6',
      color2: '#BE185D',
      schedule: 'Mon to Fri - 9AM to 5PM',
      todayAppointments: 4,
      shiftTiming: 'Morning',
      emergencyOnCall: true,
      performance: { satisfaction: 90, noShows: 7, avgWait: 12 },
      joinDate: 'Jul 2020',
      certifications: ['FACP', 'ABPN'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Neurologist specializing in stroke, epilepsy, and Parkinson\'s disease.',
    },
    { 
      id: '11', 
      name: 'Dr. Ayesha Malik', 
      specialty: 'Gynecologist & Obstetrician', 
      department: 'Gynecology',
      experience: '11 years',
      patientsHandled: 1850,
      rating: 4.9,
      status: 'available',
      consultationFee: 2800,
      qualification: 'FACOG, MBBS',
      email: 'ayesha.malik@sehatline.com',
      phone: '+92 332 2345678',
      avatar: 'AM',
      color: '#EC4899',
      color2: '#BE185D',
      schedule: 'Mon to Sat - 9AM to 5PM',
      todayAppointments: 7,
      shiftTiming: 'Morning',
      emergencyOnCall: true,
      performance: { satisfaction: 98, noShows: 2, avgWait: 6 },
      joinDate: 'Feb 2020',
      certifications: ['FACOG', 'FACS'],
      location: 'CDA Hospital, Islamabad',
      bio: 'Comprehensive women\'s health care specialist.',
    },
  ]);

  const departments = ['All', 'Cardiology', 'Pharmacy', 'Laboratory', 'Neurology', 'Gynecology'];

  // Stats
  const stats = {
    totalDoctors: doctors.length,
    activeToday: doctors.filter(d => d.status === 'available').length,
    busy: doctors.filter(d => d.status === 'busy').length,
    onLeave: doctors.filter(d => d.status === 'on-leave').length,
    totalPatientsServed: doctors.reduce((sum, d) => sum + d.patientsHandled, 0),
    avgRating: (doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1),
    emergencyOnCall: doctors.filter(d => d.emergencyOnCall).length,
    cardiologists: doctors.filter(d => d.department === 'Cardiology').length,
    pharmacists: doctors.filter(d => d.department === 'Pharmacy').length,
    labSpecialists: doctors.filter(d => d.department === 'Laboratory').length,
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Portal refreshed', 'success');
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return COLORS.success;
      case 'busy': return COLORS.danger;
      case 'on-leave': return COLORS.warning;
      default: return COLORS.textLight;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Available';
      case 'busy': return 'In Consultation';
      case 'on-leave': return 'On Leave';
      default: return 'Offline';
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || doctor.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleDeleteDoctor = (id) => {
    Alert.alert(
      'Delete Doctor',
      'Are you sure you want to delete this doctor? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setDoctors(doctors.filter(d => d.id !== id));
          showToast('Doctor deleted successfully', 'success');
        }}
      ]
    );
  };

  const handleStatusToggle = (id) => {
    setDoctors(doctors.map(d => {
      if (d.id === id) {
        const statuses = ['available', 'busy', 'on-leave'];
        const currentIndex = statuses.indexOf(d.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...d, status: statuses[nextIndex] };
      }
      return d;
    }));
    showToast('Status updated', 'success');
  };

  const handleEnterPortal = (doctor) => {
    showToast(`Opening ${doctor.name}'s portal...`, 'success');
    setTimeout(() => {
      navigation.navigate('DoctorDashboardScreen', { doctor });
    }, 500);
  };

  // Render Doctor Card - Modern Design
  const renderDoctorCard = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => handleEnterPortal(item)}
      style={styles.doctorCardWrapper}
    >
      <LinearGradient
        colors={[COLORS.white, COLORS.backgroundSecondary]}
        style={[styles.doctorCard, styles.cardShadow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
        </View>

        <View style={styles.doctorCardHeader}>
          <View style={styles.avatarWrapper}>
            <LinearGradient colors={[item.color, item.color2]} style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>{item.avatar}</Text>
            </LinearGradient>
            {item.emergencyOnCall && (
              <View style={styles.emergencyBadge}>
                <Ionicons name="flash" size={10} color={COLORS.white} />
              </View>
            )}
          </View>
          
          <View style={styles.doctorCardInfo}>
            <Text style={styles.doctorCardName}>{item.name}</Text>
            <Text style={styles.doctorCardSpecialty}>{item.specialty}</Text>
            <View style={styles.departmentChipWrapper}>
              <View style={[styles.departmentChip, { backgroundColor: item.color + '15' }]}>
                <Text style={[styles.departmentChipText, { color: item.color }]}>{item.department}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.doctorCardStats}>
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
            <Text style={styles.statItemText}>{item.experience}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color={COLORS.primary} />
            <Text style={styles.statItemText}>{item.patientsHandled}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={14} color={COLORS.primary} />
            <Text style={styles.statItemText}>₨{item.consultationFee}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <Text style={styles.statItemText}>{item.todayAppointments}</Text>
          </View>
        </View>

        <View style={styles.doctorCardFooter}>
          <TouchableOpacity 
            style={[styles.footerBtn, styles.portalBtn]}
            onPress={() => handleEnterPortal(item)}
          >
            <LinearGradient colors={[item.color, item.color2]} style={styles.portalBtnGradient}>
              <Ionicons name="log-in-outline" size={16} color={COLORS.white} />
              <Text style={styles.portalBtnText}>Enter Portal</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.footerActions}>
            <TouchableOpacity 
              style={[styles.footerActionBtn, { backgroundColor: COLORS.primary + '10' }]}
              onPress={() => handleStatusToggle(item.id)}
            >
              <Ionicons name="sync-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.footerActionBtn, { backgroundColor: COLORS.danger + '10' }]}
              onPress={() => handleDeleteDoctor(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
        <ToastNotification visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />

        {/* Header */}
        <View style={styles.header}>
          {/* FIX: Use navigation.replace to go to home screen */}
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => {
              // Use replace to go to home screen - Change 'HomeScreen' to your actual screen name
              navigation.replace('HomeScreen');
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoOutline}>
              <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Doctor Portal</Text>
          <Text style={styles.subtitle}>Complete Doctor Management System</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >

          {/* Hero Stats - Modern Card */}
          <View style={styles.heroStats}>
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.secondary + '10']}
              style={styles.heroStatsCard}
            >
              <View style={styles.heroStatsGrid}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNumber}>{stats.totalDoctors}</Text>
                  <Text style={styles.heroStatLabel}>Total Doctors</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatNumber, { color: COLORS.success }]}>{stats.activeToday}</Text>
                  <Text style={styles.heroStatLabel}>Active Today</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatNumber, { color: COLORS.danger }]}>{stats.emergencyOnCall}</Text>
                  <Text style={styles.heroStatLabel}>On Call</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatNumber, { color: COLORS.warning }]}>{stats.avgRating}</Text>
                  <Text style={styles.heroStatLabel}>Avg Rating</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Department Quick Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptFilterScroll}>
            <TouchableOpacity 
              style={[styles.deptFilterChip, selectedDepartment === 'All' && styles.deptFilterChipActive]}
              onPress={() => setSelectedDepartment('All')}
            >
              <Text style={[styles.deptFilterText, selectedDepartment === 'All' && styles.deptFilterTextActive]}>All</Text>
            </TouchableOpacity>
            {departments.filter(d => d !== 'All').map((dept) => (
              <TouchableOpacity 
                key={dept}
                style={[styles.deptFilterChip, selectedDepartment === dept && styles.deptFilterChipActive]}
                onPress={() => setSelectedDepartment(dept)}
              >
                <Text style={[styles.deptFilterText, selectedDepartment === dept && styles.deptFilterTextActive]}>{dept}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <View style={[styles.searchBar, styles.cardShadow]}>
              <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search doctors by name, specialty..."
                placeholderTextColor={COLORS.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={[styles.addBtn, styles.cardShadow]} onPress={() => setShowAddDoctorModal(true)}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.addBtnGradient}>
                <Ionicons name="add" size={24} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Doctors Count */}
          <View style={styles.doctorsCountContainer}>
            <Text style={styles.doctorsCountText}>{filteredDoctors.length} Doctors Available</Text>
          </View>

          {/* Doctors List */}
          {filteredDoctors.length > 0 ? (
            <FlatList
              data={filteredDoctors}
              keyExtractor={item => item.id}
              renderItem={renderDoctorCard}
              scrollEnabled={false}
              contentContainerStyle={styles.doctorsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>No doctors found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>

      {/* Add Doctor Modal */}
      <Modal visible={showAddDoctorModal} transparent animationType="slide" onRequestClose={() => setShowAddDoctorModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddDoctorModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={[styles.addDoctorModal, styles.cardShadow]}>
            <View style={styles.addDoctorHeader}>
              <Text style={styles.addDoctorTitle}>Add New Doctor</Text>
              <TouchableOpacity onPress={() => setShowAddDoctorModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.addDoctorBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter full name" placeholderTextColor={COLORS.textLight} />
              
              <Text style={styles.inputLabel}>Specialty</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter specialty" placeholderTextColor={COLORS.textLight} />
              
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter department" placeholderTextColor={COLORS.textLight} />
              
              <Text style={styles.inputLabel}>Qualification</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter qualification" placeholderTextColor={COLORS.textLight} />
              
              <Text style={styles.inputLabel}>Experience (years)</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter experience" placeholderTextColor={COLORS.textLight} keyboardType="numeric" />
              
              <Text style={styles.inputLabel}>Consultation Fee (PKR)</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter fee" placeholderTextColor={COLORS.textLight} keyboardType="numeric" />
              
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput 
                style={[styles.input, styles.bioInput, styles.cardShadow]} 
                placeholder="Enter doctor's biography"
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
              />
              
              <TouchableOpacity style={[styles.submitBtn, styles.cardShadow]} onPress={() => { 
                showToast('Doctor added successfully!', 'success'); 
                setShowAddDoctorModal(false); 
              }}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.submitGradient}>
                  <Text style={styles.submitText}>Add Doctor</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBackground: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: SIZES.sm,
  },
  backBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoOutline: {
    width: 44, height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  logoImage: { width: 32, height: 32, borderRadius: 16 },
  notifBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    position: 'relative',
    ...SHADOWS.medium,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: 'bold' },

  titleContainer: {
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  title: {
    color: COLORS.white,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.white,
    fontSize: SIZES.body,
    opacity: 0.8,
    marginTop: 2,
  },

  scrollContent: { paddingBottom: 40 },

  // Hero Stats
  heroStats: {
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  heroStatsCard: {
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatNumber: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  heroStatLabel: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  // Department Filters
  deptFilterScroll: {
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  deptFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  deptFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  deptFilterText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  deptFilterTextActive: {
    color: COLORS.white,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.xl,
    gap: 12,
    marginBottom: SIZES.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.body,
    paddingVertical: 4,
    marginLeft: 10,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  addBtnGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Doctors Count
  doctorsCountContainer: {
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  doctorsCountText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Doctor Card - Modern Design
  doctorCardWrapper: {
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  doctorCard: {
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  cardShadow: { ...SHADOWS.medium },
  
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },

  doctorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emergencyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  doctorCardInfo: {
    flex: 1,
  },
  doctorCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  doctorCardSpecialty: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  departmentChipWrapper: {
    marginTop: 4,
  },
  departmentChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  departmentChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  doctorCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },

  doctorCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBtn: {
    flex: 1,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  portalBtn: {
    marginRight: 10,
  },
  portalBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  portalBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  footerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Add Doctor Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addDoctorModal: {
    width: width * 0.92,
    maxHeight: height * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden',
  },
  addDoctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addDoctorTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addDoctorBody: {
    padding: SIZES.lg,
  },
  inputLabel: {
    fontSize: SIZES.small,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginTop: SIZES.sm,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    ...SHADOWS.medium,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastMessage: {
    flex: 1,
    fontSize: SIZES.body,
    fontWeight: '500',
  },
});

export default DoctorPortalScreen;