import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ImageBackground,
  StatusBar,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  Platform,
  RefreshControl,
  Switch,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

// Responsive functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;
const isTablet = width >= 768;

// Custom Toast Component
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
      case 'success':
        return { backgroundColor: 'rgba(16, 185, 129, 0.95)', icon: 'checkmark-circle', textColor: '#FFFFFF' };
      case 'error':
        return { backgroundColor: 'rgba(239, 68, 68, 0.95)', icon: 'close-circle', textColor: '#FFFFFF' };
      case 'warning':
        return { backgroundColor: 'rgba(245, 158, 11, 0.95)', icon: 'warning', textColor: '#FFFFFF' };
      default:
        return { backgroundColor: 'rgba(4, 225, 245, 0.95)', icon: 'information-circle', textColor: '#FFFFFF' };
    }
  };
  
  const toastStyle = getToastStyles();
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.toastContainer, { backgroundColor: toastStyle.backgroundColor, transform: [{ translateY }] }]}>
      <View style={styles.toastContent}>
        <Ionicons name={toastStyle.icon} size={22} color={toastStyle.textColor} />
        <Text style={[styles.toastMessage, { color: toastStyle.textColor }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Section Header Component - Same as Admin Dashboard
const SectionHeader = ({ title, icon, onPress, buttonText = "View All", darkMode = false }) => (
  <View style={styles.sectionHeaderOuter}>
    <LinearGradient
      colors={darkMode ? ['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)'] : ['rgba(4, 225, 245, 0.1)', 'rgba(4, 225, 245, 0.02)']}
      style={styles.sectionHeaderContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.sectionHeaderLeft}>
        <LinearGradient 
          colors={['#04e1f5', '#0284c7']} 
          style={styles.sectionHeaderIconWrapper}
        >
          <Ionicons name={icon} size={wp(4.5)} color="#FFFFFF" />
        </LinearGradient>
        <View>
          <Text style={[styles.sectionHeaderTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{title}</Text>
          <View style={styles.sectionHeaderUnderline} />
        </View>
      </View>
      {onPress && (
        <TouchableOpacity style={styles.sectionHeaderButton} onPress={onPress}>
          <Text style={styles.sectionHeaderButtonText}>{buttonText}</Text>
          <Ionicons name="arrow-forward" size={14} color="#04e1f5" />
        </TouchableOpacity>
      )}
    </LinearGradient>
  </View>
);

// Doctor Detail Modal
const DoctorDetailModal = ({ visible, doctor, onClose, darkMode }) => {
  if (!doctor) return null;
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.doctorDetailModal, { backgroundColor: darkMode ? '#0A1520' : '#FFFFFF' }]}>
          <LinearGradient colors={[doctor.color, doctor.color2]} style={styles.doctorModalHeader}>
            <View style={styles.doctorModalAvatar}>
              <Text style={styles.doctorModalAvatarText}>{doctor.avatar}</Text>
            </View>
            <TouchableOpacity style={styles.doctorModalClose} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.doctorModalBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.doctorModalName, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{doctor.name}</Text>
            <Text style={[styles.doctorModalSpecialty, { color: doctor.color }]}>{doctor.specialty}</Text>
            
            <View style={styles.doctorModalRating}>
              {[1,2,3,4,5].map(star => (
                <Ionicons key={star} name={star <= Math.floor(doctor.rating) ? "star" : "star-outline"} size={18} color="#FFB800" />
              ))}
              <Text style={[styles.doctorModalRatingText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>({doctor.rating})</Text>
            </View>

            <View style={styles.doctorModalInfoGrid}>
              <View style={[styles.doctorModalInfoCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                <Ionicons name="briefcase-outline" size={20} color={doctor.color} />
                <Text style={[styles.doctorModalInfoLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Experience</Text>
                <Text style={[styles.doctorModalInfoValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{doctor.experience}</Text>
              </View>
              <View style={[styles.doctorModalInfoCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                <Ionicons name="people-outline" size={20} color={doctor.color} />
                <Text style={[styles.doctorModalInfoLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Patients</Text>
                <Text style={[styles.doctorModalInfoValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{doctor.patientsHandled}</Text>
              </View>
              <View style={[styles.doctorModalInfoCard, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
                <Ionicons name="cash-outline" size={20} color={doctor.color} />
                <Text style={[styles.doctorModalInfoLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Fee</Text>
                <Text style={[styles.doctorModalInfoValue, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>₨ {doctor.consultationFee}</Text>
              </View>
            </View>

            <View style={[styles.doctorModalDetailRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
              <Ionicons name="school-outline" size={18} color={doctor.color} />
              <Text style={[styles.doctorModalDetailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{doctor.qualification}</Text>
            </View>

            <View style={[styles.doctorModalDetailRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
              <Ionicons name="mail-outline" size={18} color={doctor.color} />
              <Text style={[styles.doctorModalDetailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{doctor.email}</Text>
            </View>

            <View style={[styles.doctorModalDetailRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
              <Ionicons name="call-outline" size={18} color={doctor.color} />
              <Text style={[styles.doctorModalDetailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{doctor.phone}</Text>
            </View>

            <View style={[styles.doctorModalDetailRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
              <Ionicons name="location-outline" size={18} color={doctor.color} />
              <Text style={[styles.doctorModalDetailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{doctor.location}</Text>
            </View>

            <View style={[styles.doctorModalDetailRow, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#F8FAFC' }]}>
              <Ionicons name="calendar-outline" size={18} color={doctor.color} />
              <Text style={[styles.doctorModalDetailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{doctor.schedule}</Text>
            </View>
          </ScrollView>

          <View style={styles.doctorModalActions}>
            <TouchableOpacity style={[styles.doctorModalActionBtn, { backgroundColor: doctor.color }]}>
              <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
              <Text style={styles.doctorModalActionText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.doctorModalActionBtn, { backgroundColor: '#10B981' }]}>
              <Ionicons name="calendar-outline" size={20} color="#FFF" />
              <Text style={styles.doctorModalActionText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const ManageDoctorsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message, type) => setToast({ visible: true, message, type });

  // Doctors Data - Enhanced with complete details
  const [doctors, setDoctors] = useState([
    { 
      id: '1', 
      name: 'Dr. Ahmed Hassan', 
      specialty: 'Cardiologist', 
      experience: '12 years',
      patientsHandled: 2847,
      rating: 4.9,
      status: 'available',
      consultationFee: 2500,
      qualification: 'FCPS Cardiology, MBBS',
      email: 'ahmed.hassan@sehatline.com',
      phone: '+92 321 1234567',
      location: 'Karachi, Pakistan',
      avatar: 'AH',
      color: '#FF4D6D',
      color2: '#E63946',
      schedule: 'Mon, Wed, Fri - 9AM to 5PM',
      todayAppointments: 8,
      education: 'King Edward Medical University',
      languages: 'English, Urdu, Arabic'
    },
    { 
      id: '2', 
      name: 'Dr. Sarah Khan', 
      specialty: 'Neurologist', 
      experience: '10 years',
      patientsHandled: 2134,
      rating: 4.8,
      status: 'available',
      consultationFee: 3000,
      qualification: 'FCPS Neurology, MBBS',
      email: 'sarah.khan@sehatline.com',
      phone: '+92 322 2345678',
      location: 'Lahore, Pakistan',
      avatar: 'SK',
      color: '#10B981',
      color2: '#059669',
      schedule: 'Tue, Thu, Sat - 10AM to 6PM',
      todayAppointments: 6,
      education: 'Dow University of Health Sciences',
      languages: 'English, Urdu'
    },
    { 
      id: '3', 
      name: 'Dr. Usman Chaudhry', 
      specialty: 'Pediatrician', 
      experience: '15 years',
      patientsHandled: 3521,
      rating: 4.9,
      status: 'busy',
      consultationFee: 2000,
      qualification: 'FCPS Pediatrics, MBBS',
      email: 'usman.chaudhry@sehatline.com',
      phone: '+92 323 3456789',
      location: 'Islamabad, Pakistan',
      avatar: 'UC',
      color: '#F59E0B',
      color2: '#D97706',
      schedule: 'Mon to Fri - 8AM to 4PM',
      todayAppointments: 10,
      education: 'Rawalpindi Medical University',
      languages: 'English, Urdu, Punjabi'
    },
    { 
      id: '4', 
      name: 'Dr. Fatima Ali', 
      specialty: 'Dermatologist', 
      experience: '8 years',
      patientsHandled: 1876,
      rating: 4.7,
      status: 'available',
      consultationFee: 2200,
      qualification: 'FCPS Dermatology, MBBS',
      email: 'fatima.ali@sehatline.com',
      phone: '+92 324 4567890',
      location: 'Rawalpindi, Pakistan',
      avatar: 'FA',
      color: '#8B5CF6',
      color2: '#6D28D9',
      schedule: 'Mon, Wed, Thu, Sat - 10AM to 7PM',
      todayAppointments: 5,
      education: 'Fatima Jinnah Medical University',
      languages: 'English, Urdu'
    },
    { 
      id: '5', 
      name: 'Dr. Zainab Malik', 
      specialty: 'Gynecologist', 
      experience: '11 years',
      patientsHandled: 2980,
      rating: 4.9,
      status: 'on-leave',
      consultationFee: 2800,
      qualification: 'FCPS Gynecology, MBBS',
      email: 'zainab.malik@sehatline.com',
      phone: '+92 325 5678901',
      location: 'Karachi, Pakistan',
      avatar: 'ZM',
      color: '#EC4899',
      color2: '#BE185D',
      schedule: 'Mon to Sat - 9AM to 5PM',
      todayAppointments: 0,
      education: 'Jinnah Sindh Medical University',
      languages: 'English, Urdu, Sindhi'
    },
  ]);

  // Today's Appointments
  const [todayAppointments, setTodayAppointments] = useState([
    { id: '1', patientName: 'Ali Raza', doctorName: 'Dr. Ahmed Hassan', time: '10:30 AM', type: 'Follow-up', status: 'confirmed' },
    { id: '2', patientName: 'Sana Khan', doctorName: 'Dr. Sarah Khan', time: '11:00 AM', type: 'New Patient', status: 'pending' },
    { id: '3', patientName: 'Usman Ali', doctorName: 'Dr. Usman Chaudhry', time: '02:00 PM', type: 'Consultation', status: 'confirmed' },
    { id: '4', patientName: 'Fatima Bibi', doctorName: 'Dr. Fatima Ali', time: '03:30 PM', type: 'Follow-up', status: 'confirmed' },
    { id: '5', patientName: 'Hassan Ahmed', doctorName: 'Dr. Zainab Malik', time: '05:00 PM', type: 'New Patient', status: 'pending' },
  ]);

  // Recent Activities
  const [recentActivities, setRecentActivities] = useState([
    { id: '1', text: 'Dr. Ahmed Hassan completed 8 appointments today', time: '2 hours ago', icon: 'checkmark-circle', color: '#10B981' },
    { id: '2', text: 'New patient registered for Dr. Sarah Khan', time: '3 hours ago', icon: 'person-add', color: '#04e1f5' },
    { id: '3', text: 'Dr. Usman Chaudhry\'s schedule updated', time: '5 hours ago', icon: 'calendar', color: '#F59E0B' },
    { id: '4', text: 'Monthly performance report generated', time: '1 day ago', icon: 'document-text', color: '#8B5CF6' },
    { id: '5', text: 'Dr. Zainab Malik on leave approved', time: '1 day ago', icon: 'time', color: '#EC4899' },
  ]);

  // Stats
  const [stats, setStats] = useState({
    totalDoctors: 24,
    activeToday: 18,
    onLeave: 3,
    totalAppointments: 156,
    avgRating: 4.8,
    totalPatientsServed: 15842,
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Dashboard refreshed', 'success');
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#10B981';
      case 'busy': return '#EF4444';
      case 'on-leave': return '#F59E0B';
      default: return '#64748B';
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

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDoctorCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => { setSelectedDoctor(item); setShowDoctorModal(true); }}>
      <LinearGradient 
        colors={darkMode ? ['rgba(15, 23, 42, 0.95)', 'rgba(15, 23, 42, 0.85)'] : ['#FFFFFF', '#F8FAFC']} 
        style={[styles.doctorCard, { borderColor: darkMode ? '#334155' : '#E2E8F0' }]}
      >
        <View style={styles.doctorCardHeader}>
          <LinearGradient colors={[item.color, item.color2]} style={styles.doctorAvatar}>
            <Text style={styles.doctorAvatarText}>{item.avatar}</Text>
          </LinearGradient>
          <View style={styles.doctorStatus}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{item.name}</Text>
          <Text style={[styles.doctorSpecialty, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.specialty}</Text>
          
          <View style={styles.doctorDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="briefcase-outline" size={14} color="#04e1f5" />
              <Text style={[styles.detailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.experience}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={14} color="#04e1f5" />
              <Text style={[styles.detailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.patientsHandled} patients</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={[styles.detailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.rating}</Text>
            </View>
          </View>
          
          <View style={styles.doctorFooter}>
            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Fee:</Text>
              <Text style={styles.feeValue}>₨ {item.consultationFee}</Text>
            </View>
            <View style={styles.appointmentCount}>
              <Ionicons name="calendar-outline" size={14} color="#04e1f5" />
              <Text style={[styles.appointmentText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.todayAppointments} today</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.doctorActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#04e1f520' }]}>
            <Ionicons name="create-outline" size={18} color="#04e1f5" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAppointmentItem = ({ item }) => (
    <LinearGradient 
      colors={darkMode ? ['rgba(15, 23, 42, 0.95)', 'rgba(15, 23, 42, 0.85)'] : ['#FFFFFF', '#F8FAFC']} 
      style={[styles.appointmentCard, { borderColor: darkMode ? '#334155' : '#E2E8F0' }]}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentIcon}>
          <Ionicons name="person-circle-outline" size={32} color="#04e1f5" />
        </View>
        <View style={styles.appointmentInfo}>
          <Text style={[styles.appointmentPatient, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{item.patientName}</Text>
          <Text style={[styles.appointmentDoctor, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.doctorName}</Text>
        </View>
        <View style={[styles.appointmentStatus, { backgroundColor: item.status === 'confirmed' ? '#10B98120' : '#F59E0B20' }]}>
          <Text style={[styles.appointmentStatusText, { color: item.status === 'confirmed' ? '#10B981' : '#F59E0B' }]}>
            {item.status === 'confirmed' ? 'Confirmed' : 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.appointmentDetails}>
        <View style={styles.appointmentDetail}>
          <Ionicons name="time-outline" size={16} color="#04e1f5" />
          <Text style={[styles.appointmentDetailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.time}</Text>
        </View>
        <View style={styles.appointmentDetail}>
          <Ionicons name="medkit-outline" size={16} color="#04e1f5" />
          <Text style={[styles.appointmentDetailText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.type}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityText, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{item.text}</Text>
        <Text style={[styles.activityTime, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#0A1520' : '#F4F7FB' }]}>
      <StatusBar 
        barStyle={darkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Background Image - Same as Admin Dashboard */}
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={darkMode 
            ? ['rgba(0, 15, 25, 0.96)', 'rgba(0, 10, 20, 0.94)', 'rgba(0, 5, 10, 0.98)']
            : ['rgba(21, 7, 73, 0.02)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.2)']
          }
          style={StyleSheet.absoluteFill}
        >

        <ToastNotification visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />

        {/* Header - Same as Admin Dashboard */}
        <Animated.View style={[styles.header, { 
          backgroundColor: darkMode ? 'rgba(10, 21, 32, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          borderBottomColor: darkMode ? '#334155' : '#E2E8F0',
          borderBottomWidth: 1,
          shadowColor: darkMode ? '#000' : '#04e1f5',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: darkMode ? 0.3 : 0.05,
          shadowRadius: 4,
          elevation: 2,
        }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
            {/* Back Button - Navigates to Home */}
            <TouchableOpacity onPress={() => navigation.navigate('MainApp')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#107bd3" />
            </TouchableOpacity>
              
              <Animated.View style={styles.logoOutlineContainer}>
                <View style={[styles.logoCircle, { borderColor: '#107bd3' }]}>
                  <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
                </View>
              </Animated.View>
              
              <View>
                <Text style={[styles.headerTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>DOCTORS PANEL</Text>
                <Text style={[styles.headerSubtitle, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Management Dashboard</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={styles.iconBtn}>
                <Ionicons name={darkMode ? "sunny-outline" : "moon-outline"} size={24} color="#107bd3" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={24} color="#107bd3" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#04e1f5']} tintColor="#04e1f5" />}
        >

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.statCard}>
              <Ionicons name="medical-outline" size={28} color="#FFF" />
              <Text style={styles.statNumber}>{stats.totalDoctors}</Text>
              <Text style={styles.statLabel}>Total Doctors</Text>
            </LinearGradient>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.statCard}>
              <Ionicons name="checkbox-outline" size={28} color="#FFF" />
              <Text style={styles.statNumber}>{stats.activeToday}</Text>
              <Text style={styles.statLabel}>Active Today</Text>
            </LinearGradient>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statCard}>
              <Ionicons name="calendar-outline" size={28} color="#FFF" />
              <Text style={styles.statNumber}>{stats.totalAppointments}</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </LinearGradient>
            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.statCard}>
              <Ionicons name="people-outline" size={28} color="#FFF" />
              <Text style={styles.statNumber}>{stats.totalPatientsServed.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Patients Served</Text>
            </LinearGradient>
          </View>

          {/* Search and Add Doctor */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
              <Ionicons name="search-outline" size={20} color="#64748B" />
              <TextInput 
                style={[styles.searchInput, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}
                placeholder="Search doctors by name or specialty..."
                placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddDoctorModal(true)}>
              <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.addBtnGradient}>
                <Ionicons name="add" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabContainer, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            {[
              { id: 'all', name: 'All Doctors', icon: 'people-outline' },
              { id: 'appointments', name: 'Appointments', icon: 'calendar-outline' },
              { id: 'schedule', name: 'Schedule', icon: 'time-outline' },
            ].map((tab) => (
              <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.activeTab]} onPress={() => setActiveTab(tab.id)}>
                <Ionicons name={tab.icon} size={18} color={activeTab === tab.id ? '#04e1f5' : darkMode ? '#94A3B8' : '#64748B'} />
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText, { color: activeTab === tab.id ? '#04e1f5' : darkMode ? '#94A3B8' : '#64748B' }]}>{tab.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* All Doctors Tab */}
          {activeTab === 'all' && (
            <>
              <FlatList
                data={filteredDoctors}
                keyExtractor={item => item.id}
                renderItem={renderDoctorCard}
                scrollEnabled={false}
                contentContainerStyle={styles.doctorsList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={60} color={darkMode ? '#334155' : '#CBD5E1'} />
                    <Text style={[styles.emptyText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>No doctors found</Text>
                  </View>
                }
              />
              
              {/* Recent Activities Section */}
              <SectionHeader 
                title="Recent Activities" 
                icon="time-outline" 
                darkMode={darkMode}
                onPress={() => {}}
              />
              <View style={[styles.activityContainer, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
                {recentActivities.map(item => renderActivityItem({ item }))}
              </View>
            </>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <>
              <View style={styles.appointmentStats}>
                <View style={[styles.appointmentStatItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF' }]}>
                  <Text style={[styles.appointmentStatValue, { color: '#04e1f5' }]}>24</Text>
                  <Text style={[styles.appointmentStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Today</Text>
                </View>
                <View style={[styles.appointmentStatItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF' }]}>
                  <Text style={[styles.appointmentStatValue, { color: '#F59E0B' }]}>8</Text>
                  <Text style={[styles.appointmentStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Pending</Text>
                </View>
                <View style={[styles.appointmentStatItem, { backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : '#FFFFFF' }]}>
                  <Text style={[styles.appointmentStatValue, { color: '#8B5CF6' }]}>156</Text>
                  <Text style={[styles.appointmentStatLabel, { color: darkMode ? '#94A3B8' : '#64748B' }]}>This Week</Text>
                </View>
              </View>
              
              <FlatList
                data={todayAppointments}
                keyExtractor={item => item.id}
                renderItem={renderAppointmentItem}
                scrollEnabled={false}
                contentContainerStyle={styles.appointmentsList}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <View style={styles.scheduleContainer}>
              {/* Day Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <TouchableOpacity key={day} style={[styles.dayBtn, index === 0 && styles.activeDayBtn]}>
                    <Text style={[styles.dayText, index === 0 && styles.activeDayText]}>{day}</Text>
                    <Text style={[styles.dayDate, index === 0 && styles.activeDayDate]}>April {12 + index}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Schedule List */}
              {doctors.slice(0, 4).map((doctor) => (
                <LinearGradient key={doctor.id} colors={darkMode ? ['rgba(15, 23, 42, 0.95)', 'rgba(15, 23, 42, 0.85)'] : ['#FFFFFF', '#F8FAFC']} style={[styles.scheduleCard, { borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
                  <View style={styles.scheduleCardHeader}>
                    <LinearGradient colors={[doctor.color, doctor.color2]} style={styles.scheduleAvatar}>
                      <Text style={styles.scheduleAvatarText}>{doctor.avatar}</Text>
                    </LinearGradient>
                    <View style={styles.scheduleDoctorInfo}>
                      <Text style={[styles.scheduleDoctorName, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>{doctor.name}</Text>
                      <Text style={[styles.scheduleDoctorSpecialty, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{doctor.specialty}</Text>
                    </View>
                  </View>
                  <View style={styles.scheduleTimings}>
                    <View style={styles.timeSlot}>
                      <Ionicons name="time-outline" size={16} color="#04e1f5" />
                      <Text style={[styles.timeSlotText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>{doctor.schedule}</Text>
                    </View>
                    <View style={styles.timeSlot}>
                      <Ionicons name="location-outline" size={16} color="#04e1f5" />
                      <Text style={[styles.timeSlotText, { color: darkMode ? '#94A3B8' : '#64748B' }]}>Room {doctor.id} • OPD Block</Text>
                    </View>
                  </View>
                  <View style={styles.scheduleBreakdown}>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Morning</Text>
                      <Text style={[styles.breakdownTime, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>09:00 - 01:00</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Evening</Text>
                      <Text style={[styles.breakdownTime, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>02:00 - 06:00</Text>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>
          )}
        </ScrollView>
        </LinearGradient>
      </ImageBackground>

      {/* Doctor Detail Modal */}
      <DoctorDetailModal 
        visible={showDoctorModal} 
        doctor={selectedDoctor} 
        onClose={() => setShowDoctorModal(false)} 
        darkMode={darkMode}
      />

      {/* Add Doctor Modal */}
      <Modal visible={showAddDoctorModal} transparent animationType="slide" onRequestClose={() => setShowAddDoctorModal(false)}>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={darkMode ? ['#0A1520', '#0D1F2D'] : ['#FFFFFF', '#F8FAFC']} style={[styles.addDoctorModal, { borderWidth: 1, borderColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            <View style={styles.addDoctorHeader}>
              <Text style={[styles.addDoctorTitle, { color: darkMode ? '#FFFFFF' : '#1E293B' }]}>Add New Doctor</Text>
              <TouchableOpacity onPress={() => setShowAddDoctorModal(false)}>
                <Ionicons name="close" size={24} color={darkMode ? '#FFF' : '#1E293B'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.addDoctorBody}>
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Full Name" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} />
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Specialty" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} />
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Qualification" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} />
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Experience (years)" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="numeric" />
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Consultation Fee" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="numeric" />
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Email" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="email-address" />
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Phone" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} keyboardType="phone-pad" />
              <TextInput style={[styles.input, { backgroundColor: darkMode ? '#1E293B' : '#F8FAFC', color: darkMode ? '#FFFFFF' : '#1E293B' }]} placeholder="Location" placeholderTextColor={darkMode ? '#94A3B8' : '#64748B'} />
              
              <TouchableOpacity style={styles.submitBtn} onPress={() => { showToast('Doctor added successfully', 'success'); setShowAddDoctorModal(false); }}>
                <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.submitGradient}>
                  <Text style={styles.submitText}>Add Doctor</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollContent: { paddingBottom: hp(4) },
  
  // Header - Same as Admin Dashboard
  header: { width: '100%', paddingTop: statusBarHeight },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(4), paddingVertical: hp(1.5) },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  headerRight: { flexDirection: 'row', gap: wp(4), alignItems: 'center' },
  backBtn: { padding: wp(1) },
  iconBtn: { padding: wp(1), position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -5, backgroundColor: '#EF4444', borderRadius: wp(2), minWidth: wp(4), height: wp(4), justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(0.5) },
  badgeText: { color: '#FFFFFF', fontSize: wp(2), fontWeight: 'bold' },
  
  logoOutlineContainer: { shadowColor: '#04e1f5', shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  logoCircle: { width: wp(9), height: wp(9), borderRadius: wp(4.5), borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  logoImage: { width: wp(7), height: wp(7), borderRadius: wp(3.5), resizeMode: 'contain' },
  headerTitle: { fontSize: wp(4), fontWeight: 'bold', letterSpacing: 1 },
  headerSubtitle: { fontSize: wp(2.5), marginTop: hp(0.2) },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(4), gap: wp(3), marginTop: hp(2) },
  statCard: { flex: 1, minWidth: (width - wp(14)) / 2, padding: wp(3), borderRadius: wp(3), alignItems: 'center' },
  statNumber: { fontSize: wp(6), fontWeight: 'bold', color: '#FFF', marginTop: hp(0.5) },
  statLabel: { fontSize: wp(2.8), color: 'rgba(255,255,255,0.9)', marginTop: hp(0.2) },
  
  // Search Container
  searchContainer: { flexDirection: 'row', paddingHorizontal: wp(4), gap: wp(3), marginTop: hp(2), marginBottom: hp(1.5) },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(3), paddingVertical: hp(1), borderRadius: wp(3), borderWidth: 1, gap: wp(2) },
  searchInput: { flex: 1, fontSize: wp(3.2), padding: 0 },
  addBtn: { width: wp(12), height: wp(12), borderRadius: wp(3), overflow: 'hidden' },
  addBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Tab Navigation
  tabContainer: { flexDirection: 'row', marginHorizontal: wp(4), borderRadius: wp(4), padding: wp(1), marginBottom: hp(1.5), borderWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5), paddingVertical: hp(1), borderRadius: wp(3) },
  activeTab: { backgroundColor: 'rgba(4, 225, 245, 0.2)' },
  tabText: { fontSize: wp(3), fontWeight: '500' },
  activeTabText: { color: '#edf2f3', fontWeight: 'bold' },
  
  // Doctor Card
  doctorsList: { paddingHorizontal: wp(4), paddingBottom: hp(2) },
  doctorCard: { flexDirection: 'row', padding: wp(3.5), borderRadius: wp(4), borderWidth: 1, marginBottom: hp(1.5) },
  doctorCardHeader: { alignItems: 'center', marginRight: wp(3) },
  doctorAvatar: { width: wp(14), height: wp(14), borderRadius: wp(7), justifyContent: 'center', alignItems: 'center' },
  doctorAvatarText: { fontSize: wp(4.5), fontWeight: 'bold', color: '#FFF' },
  doctorStatus: { flexDirection: 'row', alignItems: 'center', gap: wp(1), marginTop: hp(0.5) },
  statusDot: { width: wp(2), height: wp(2), borderRadius: wp(1) },
  statusText: { fontSize: wp(2.2), fontWeight: '500' },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: wp(3.8), fontWeight: 'bold' },
  doctorSpecialty: { fontSize: wp(3), marginTop: hp(0.2) },
  doctorDetails: { flexDirection: 'row', gap: wp(2), marginTop: hp(0.5), flexWrap: 'wrap' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: wp(0.8) },
  detailText: { fontSize: wp(2.5) },
  doctorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: hp(1) },
  feeContainer: { flexDirection: 'row', alignItems: 'center', gap: wp(1), backgroundColor: '#04e1f542', paddingHorizontal: wp(1.5), paddingVertical: hp(0.3), borderRadius: wp(2) },
  feeLabel: { fontSize: wp(2.8), color: '#0464f5' },
  feeValue: { fontSize: wp(2.8), fontWeight: 'bold', color: '#0464f5' },
  appointmentCount: { flexDirection: 'row', alignItems: 'center', gap: wp(0.8) },
  appointmentText: { fontSize: wp(2.5) },
  doctorActions: { justifyContent: 'center', gap: wp(1.5) },
  actionBtn: { width: wp(8), height: wp(8), borderRadius: wp(2), justifyContent: 'center', alignItems: 'center' },
  
  // Section Header
  sectionHeaderOuter: { marginHorizontal: wp(4), marginTop: wp(3), marginBottom: wp(2) },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(2.5), borderRadius: wp(3), borderWidth: 1, borderColor: 'rgba(4, 225, 245, 0.97)' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2.5) },
  sectionHeaderIconWrapper: { width: wp(9), height: wp(9), borderRadius: wp(2.5), justifyContent: 'center', alignItems: 'center' },
  sectionHeaderTitle: { fontSize: wp(5), fontWeight: 'bold', letterSpacing: 0.5 },
  sectionHeaderUnderline: { width: wp(5), height: 3, backgroundColor: '#04e1f5', borderRadius: 2, marginTop: hp(0.3) },
  sectionHeaderButton: { flexDirection: 'row', alignItems: 'center', gap: wp(1.5), paddingHorizontal: wp(2.5), paddingVertical: hp(0.6), borderRadius: wp(3), backgroundColor: 'rgba(4, 225, 245, 0.4)', borderWidth: 2, borderColor: 'rgba(4, 225, 245, 0.9)' },
  sectionHeaderButtonText: { fontSize: wp(2.8), color: '#f0f3f3', fontWeight: '600' },
  
  // Activity
  activityContainer: { marginHorizontal: wp(4), borderRadius: wp(3), padding: wp(3), borderWidth: 1, marginBottom: wp(4) },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: wp(3), marginBottom: hp(1.5) },
  activityIcon: { width: wp(9), height: wp(9), borderRadius: wp(2.5), justifyContent: 'center', alignItems: 'center' },
  activityContent: { flex: 1 },
  activityText: { fontSize: wp(3.2) },
  activityTime: { fontSize: wp(2.5), marginTop: hp(0.2) },
  
  // Appointment Tab
  appointmentStats: { flexDirection: 'row', gap: wp(3), paddingHorizontal: wp(4), marginBottom: hp(2) },
  appointmentStatItem: { flex: 1, padding: wp(3), borderRadius: wp(3), alignItems: 'center' },
  appointmentStatValue: { fontSize: wp(5), fontWeight: 'bold' },
  appointmentStatLabel: { fontSize: wp(2.5), marginTop: hp(0.3) },
  appointmentsList: { paddingHorizontal: wp(4), paddingBottom: hp(4) },
  appointmentCard: { padding: wp(3.5), borderRadius: wp(3), borderWidth: 1, marginBottom: hp(1.5) },
  appointmentHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  appointmentIcon: { width: wp(12), height: wp(12), borderRadius: wp(6), backgroundColor: '#04e1f510', justifyContent: 'center', alignItems: 'center' },
  appointmentInfo: { flex: 1 },
  appointmentPatient: { fontSize: wp(3.8), fontWeight: 'bold' },
  appointmentDoctor: { fontSize: wp(3), marginTop: hp(0.2) },
  appointmentStatus: { paddingHorizontal: wp(2), paddingVertical: hp(0.4), borderRadius: wp(2) },
  appointmentStatusText: { fontSize: wp(2.5), fontWeight: '500' },
  appointmentDetails: { flexDirection: 'row', gap: wp(4), marginTop: hp(1.5), paddingTop: hp(1), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  appointmentDetail: { flexDirection: 'row', alignItems: 'center', gap: wp(1.5) },
  appointmentDetailText: { fontSize: wp(2.8) },
  
  // Schedule Tab
  scheduleContainer: { paddingHorizontal: wp(4), paddingBottom: hp(4) },
  daySelector: { flexDirection: 'row', marginBottom: hp(2) },
  dayBtn: { alignItems: 'center', paddingHorizontal: wp(3), paddingVertical: hp(1), borderRadius: wp(3), marginRight: wp(2), backgroundColor: 'rgba(241, 236, 236, 0.8)' },
  activeDayBtn: { backgroundColor: '#0428f5' },
  dayText: { fontSize: wp(3), fontWeight: '500', color: '#000307' },
  activeDayText: { color: '#FFF' },
  dayDate: { fontSize: wp(2.2), color: '#000307', marginTop: hp(0.2) },
  activeDayDate: { color: '#FFF' },
  scheduleCard: { padding: wp(3.5), borderRadius: wp(3), borderWidth: 1, marginBottom: hp(1.5) },
  scheduleCardHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(3), marginBottom: hp(1.5) },
  scheduleAvatar: { width: wp(12), height: wp(12), borderRadius: wp(6), justifyContent: 'center', alignItems: 'center' },
  scheduleAvatarText: { fontSize: wp(4), fontWeight: 'bold', color: '#FFF' },
  scheduleDoctorInfo: { flex: 1 },
  scheduleDoctorName: { fontSize: wp(3.8), fontWeight: 'bold' },
  scheduleDoctorSpecialty: { fontSize: wp(3), marginTop: hp(0.2) },
  scheduleTimings: { marginBottom: hp(1.5) },
  timeSlot: { flexDirection: 'row', alignItems: 'center', gap: wp(2), marginBottom: hp(0.5) },
  timeSlotText: { fontSize: wp(3) },
  scheduleBreakdown: { flexDirection: 'row', paddingTop: hp(1), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  breakdownItem: { flex: 1, alignItems: 'center' },
  breakdownLabel: { fontSize: wp(2.5), color: '#64748B' },
  breakdownTime: { fontSize: wp(3), fontWeight: '500', marginTop: hp(0.3) },
  breakdownDivider: { width: 1, backgroundColor: '#E2E8F0' },
  
  // Toast
  toastContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 20, right: 20, zIndex: 1000, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  toastMessage: { flex: 1, fontSize: 14, fontWeight: '500', color: '#FFF' },
  toastContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  
  // Doctor Detail Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  doctorDetailModal: { width: width * 0.92, maxHeight: height * 0.85, borderRadius: wp(5), overflow: 'hidden' },
  doctorModalHeader: { padding: wp(5), alignItems: 'center', position: 'relative' },
  doctorModalAvatar: { width: wp(20), height: wp(20), borderRadius: wp(10), backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  doctorModalAvatarText: { fontSize: wp(7), fontWeight: 'bold', color: '#FFF' },
  doctorModalClose: { position: 'absolute', top: wp(3), right: wp(3), padding: wp(1) },
  doctorModalBody: { padding: wp(4) },
  doctorModalName: { fontSize: wp(5), fontWeight: 'bold', textAlign: 'center' },
  doctorModalSpecialty: { fontSize: wp(3.5), fontWeight: '500', textAlign: 'center', marginTop: hp(0.3) },
  doctorModalRating: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(0.5), marginTop: hp(1), marginBottom: hp(2) },
  doctorModalRatingText: { fontSize: wp(3), marginLeft: wp(1) },
  doctorModalInfoGrid: { flexDirection: 'row', gap: wp(3), marginBottom: hp(2) },
  doctorModalInfoCard: { flex: 1, alignItems: 'center', padding: wp(2), borderRadius: wp(3) },
  doctorModalInfoLabel: { fontSize: wp(2.5), marginTop: hp(0.5) },
  doctorModalInfoValue: { fontSize: wp(3.5), fontWeight: 'bold', marginTop: hp(0.3) },
  doctorModalDetailRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2.5), padding: wp(2.5), borderRadius: wp(2.5), marginBottom: hp(0.8) },
  doctorModalDetailText: { fontSize: wp(3), flex: 1 },
  doctorModalActions: { flexDirection: 'row', gap: wp(3), padding: wp(4), borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  doctorModalActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5), paddingVertical: hp(1.2), borderRadius: wp(3) },
  doctorModalActionText: { color: '#FFF', fontSize: wp(3.2), fontWeight: '600' },
  
  // Add Doctor Modal
  addDoctorModal: { width: width * 0.92, maxHeight: height * 0.85, borderRadius: wp(5), overflow: 'hidden' },
  addDoctorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp(4), borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  addDoctorTitle: { fontSize: wp(4.5), fontWeight: 'bold' },
  addDoctorBody: { padding: wp(4) },
  input: { borderRadius: wp(2.5), padding: wp(3), marginBottom: wp(3), fontSize: wp(3.2) },
  submitBtn: { borderRadius: wp(2.5), overflow: 'hidden', marginTop: wp(2) },
  submitGradient: { paddingVertical: hp(1.2), alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: wp(3.5) },
  
  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: hp(5), paddingBottom: hp(2) },
  emptyText: { fontSize: wp(4), fontWeight: '500', marginTop: hp(1) },
  emptySubText: { fontSize: wp(3.2), marginTop: hp(0.5) },
});

export default ManageDoctorsScreen;