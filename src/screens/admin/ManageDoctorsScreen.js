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

const DoctorPortalScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const showToast = (message, type) => setToast({ visible: true, message, type });

  // ✅ All Doctors - ALL in Cardiology Department with different specialties
  const [doctors, setDoctors] = useState([
    // Cardiologists
    { 
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

    // Cardiovascular Pharmacists
    { 
      id: '6', 
      name: 'Dr. Muhammad Hassan', 
      specialty: 'Cardiovascular Clinical Pharmacist', 
      department: 'Cardiology',
      experience: '12 years',
      patientsHandled: 2980,
      rating: 4.9,
      status: 'available',
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
      bio: 'Clinical pharmacist specializing in cardiovascular medication management and drug interactions.',
    },
    { 
      id: '7', 
      name: 'Dr. Samina Ali', 
      specialty: 'Cardiology Hospital Pharmacist', 
      department: 'Cardiology',
      experience: '9 years',
      patientsHandled: 2134,
      rating: 4.6,
      status: 'available',
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
      bio: 'Hospital pharmacist with expertise in cardiovascular sterile compounding and medication safety.',
    },

    // Cardiovascular Pathologists
    { 
      id: '8', 
      name: 'Dr. Ahmed Khan', 
      specialty: 'Cardiovascular Pathologist', 
      department: 'Cardiology',
      experience: '14 years',
      patientsHandled: 1340,
      rating: 4.8,
      status: 'available',
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
      bio: 'Cardiovascular pathologist leading diagnostic laboratory services for heart conditions.',
    },
    { 
      id: '9', 
      name: 'Dr. Sana Javed', 
      specialty: 'Cardiac Microbiologist', 
      department: 'Cardiology',
      experience: '10 years',
      patientsHandled: 760,
      rating: 4.7,
      status: 'available',
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
      bio: 'Medical microbiologist specializing in cardiac infectious disease diagnosis.',
    },

    // Neuro-Cardiologist
    { 
      id: '10', 
      name: 'Dr. Muhammad Ali', 
      specialty: 'Neuro-Cardiologist', 
      department: 'Cardiology',
      experience: '10 years',
      patientsHandled: 760,
      rating: 4.6,
      status: 'available',
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
      bio: 'Neuro-cardiologist specializing in stroke, epilepsy, and cardiovascular neurology.',
    },

    // Cardiovascular Research Specialist
    { 
      id: '11', 
      name: 'Dr. Ayesha Malik', 
      specialty: 'Cardiovascular Research Specialist', 
      department: 'Cardiology',
      experience: '11 years',
      patientsHandled: 1850,
      rating: 4.9,
      status: 'available',
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
      bio: 'Cardiovascular research specialist focusing on women\'s heart health and clinical trials.',
    },
  ]);

  // ✅ Only Cardiology Department - Filter by Specialty
  const specialties = ['All', 'Interventional Cardiologist', 'Pediatric Cardiologist', 'Cardiothoracic Surgeon', 'Cardiac Electrophysiologist', 'Clinical Cardiologist', 'Cardiovascular Clinical Pharmacist', 'Cardiology Hospital Pharmacist', 'Cardiovascular Pathologist', 'Cardiac Microbiologist', 'Neuro-Cardiologist', 'Cardiovascular Research Specialist'];

  // ✅ Stats
  const stats = {
    totalDoctors: doctors.length,
    activeToday: doctors.filter(d => d.status === 'available').length,
    busy: doctors.filter(d => d.status === 'busy').length,
    onLeave: doctors.filter(d => d.status === 'on-leave').length,
    totalPatientsServed: doctors.reduce((sum, d) => sum + d.patientsHandled, 0),
    avgRating: (doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1),
    emergencyOnCall: doctors.filter(d => d.emergencyOnCall).length,
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
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
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

  // Render Doctor Card
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <ToastNotification visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Ionicons name="arrow-back" size={wp(5)} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoOutline}>
              <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.headerTitle}>SehatLine</Text>
          </View>
          
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={wp(5)} color={COLORS.white} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Cardiology Department</Text>
          <Text style={styles.subtitle}>Complete Cardiology Management System</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >

          {/* Hero Stats */}
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

          {/* Specialty Filters - Only Cardiology Specialties */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptFilterScroll}>
            {specialties.map((specialty) => (
              <TouchableOpacity 
                key={specialty}
                style={[styles.deptFilterChip, selectedSpecialty === specialty && styles.deptFilterChipActive]}
                onPress={() => setSelectedSpecialty(specialty)}
              >
                <Text style={[styles.deptFilterText, selectedSpecialty === specialty && styles.deptFilterTextActive]}>
                  {specialty === 'All' ? 'All' : specialty.split(' ').slice(0, 2).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <View style={[styles.searchBar, styles.cardShadow]}>
              <Ionicons name="search-outline" size={wp(4.5)} color={COLORS.textSecondary} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search doctors by name or specialty..."
                placeholderTextColor={COLORS.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={wp(4.5)} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={[styles.addBtn, styles.cardShadow]} onPress={() => setShowAddDoctorModal(true)}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.addBtnGradient}>
                <Ionicons name="add" size={wp(5.5)} color={COLORS.white} />
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
              <Ionicons name="people-outline" size={wp(15)} color={COLORS.border} />
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
                <Ionicons name="close" size={wp(5.5)} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.addDoctorBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter full name" placeholderTextColor={COLORS.textLight} />
              
              <Text style={styles.inputLabel}>Specialty</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter specialty" placeholderTextColor={COLORS.textLight} />
              
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Cardiology" placeholderTextColor={COLORS.textLight} value="Cardiology" editable={false} />
              
              <Text style={styles.inputLabel}>Qualification</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter qualification" placeholderTextColor={COLORS.textLight} />
              
              <Text style={styles.inputLabel}>Experience (years)</Text>
              <TextInput style={[styles.input, styles.cardShadow]} placeholder="Enter experience" placeholderTextColor={COLORS.textLight} keyboardType="numeric" />
              
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
                  <Ionicons name="arrow-forward" size={wp(4.5)} color={COLORS.white} />
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
  gradientBackground: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(25),
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
  backBtn: {
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

  titleContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  title: {
    color: COLORS.white,
    fontSize: wp(5.5),
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.white,
    fontSize: wp(3.2),
    opacity: 0.8,
    marginTop: hp(0.3),
  },

  scrollContent: { 
    paddingBottom: hp(4),
    paddingTop: hp(1),
  },

  // Hero Stats
  heroStats: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  heroStatsCard: {
    borderRadius: wp(4),
    padding: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border || '#E8ECF0',
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    fontSize: wp(5),
    fontWeight: 'bold',
    color: COLORS.text || '#1A2332',
  },
  heroStatLabel: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary || '#5A6B7A',
    marginTop: hp(0.2),
  },
  heroStatDivider: {
    width: 1,
    height: hp(3.5),
    backgroundColor: COLORS.border || '#E8ECF0',
  },

  // Specialty Filters
  deptFilterScroll: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  deptFilterChip: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.6),
    borderRadius: wp(5),
    backgroundColor: COLORS.white,
    marginRight: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border || '#E8ECF0',
    ...SHADOWS.small,
  },
  deptFilterChipActive: {
    backgroundColor: COLORS.primary || '#00D4FF',
    borderColor: COLORS.primary || '#00D4FF',
  },
  deptFilterText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary || '#5A6B7A',
    fontWeight: '500',
  },
  deptFilterTextActive: {
    color: COLORS.white,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    gap: wp(3),
    marginBottom: hp(1.5),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderWidth: 1,
    borderColor: COLORS.border || '#E8ECF0',
  },
  searchInput: {
    flex: 1,
    color: COLORS.text || '#1A2332',
    fontSize: wp(3.5),
    paddingVertical: hp(0.3),
    marginLeft: wp(2),
  },
  addBtn: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  addBtnGradient: {
    width: wp(11),
    height: wp(11),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Doctors Count
  doctorsCountContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  doctorsCountText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary || '#5A6B7A',
    fontWeight: '500',
  },

  // Doctor Card
  doctorCardWrapper: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  doctorCard: {
    borderRadius: wp(4),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border || '#E8ECF0',
    position: 'relative',
    backgroundColor: COLORS.white,
  },
  cardShadow: { ...SHADOWS.medium },
  
  statusBadge: {
    position: 'absolute',
    top: wp(2.5),
    right: wp(2.5),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(3),
    zIndex: 10,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: wp(2.2),
    fontWeight: '600',
  },

  doctorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: wp(3),
  },
  doctorAvatar: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emergencyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger || '#EF4444',
    width: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(2.25),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  doctorCardInfo: {
    flex: 1,
  },
  doctorCardName: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: COLORS.text || '#1A2332',
  },
  doctorCardSpecialty: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary || '#5A6B7A',
    marginTop: hp(0.1),
  },
  departmentChipWrapper: {
    marginTop: hp(0.2),
  },
  departmentChip: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.1),
    borderRadius: wp(2.5),
    alignSelf: 'flex-start',
  },
  departmentChipText: {
    fontSize: wp(2.4),
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B15',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(3),
    gap: wp(0.8),
  },
  ratingText: {
    fontSize: wp(3.2),
    fontWeight: '700',
    color: COLORS.text || '#1A2332',
  },

  doctorCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: hp(0.6),
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#E8ECF0',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E8ECF0',
    marginBottom: hp(0.8),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.8),
  },
  statItemText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary || '#5A6B7A',
  },
  statDivider: {
    width: 1,
    height: hp(2.5),
    backgroundColor: COLORS.border || '#E8ECF0',
  },

  doctorCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBtn: {
    flex: 1,
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  portalBtn: {
    marginRight: wp(2),
  },
  portalBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.6),
    gap: wp(1.5),
  },
  portalBtnText: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  footerActionBtn: {
    width: wp(8.5),
    height: wp(8.5),
    borderRadius: wp(4.25),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(4),
  },
  emptyText: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: COLORS.text || '#1A2332',
    marginTop: hp(1),
  },
  emptySubText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary || '#5A6B7A',
    marginTop: hp(0.3),
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
    borderRadius: wp(5),
    overflow: 'hidden',
  },
  addDoctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E8ECF0',
  },
  addDoctorTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.text || '#1A2332',
  },
  addDoctorBody: {
    padding: wp(4),
  },
  inputLabel: {
    fontSize: wp(3.2),
    fontWeight: '500',
    color: COLORS.text || '#1A2332',
    marginBottom: hp(0.2),
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary || '#F0F4F8',
    borderRadius: wp(2.5),
    padding: wp(3),
    marginBottom: hp(0.8),
    fontSize: wp(3.5),
    color: COLORS.text || '#1A2332',
    borderWidth: 1,
    borderColor: COLORS.border || '#E8ECF0',
  },
  bioInput: {
    height: hp(12),
    textAlignVertical: 'top',
  },
  submitBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
    marginTop: hp(0.5),
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  submitText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: 'bold',
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