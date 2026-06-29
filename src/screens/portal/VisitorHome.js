import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, Image, Modal, TextInput,
  Animated, Alert, Platform, StatusBar, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Hospital Information - Only relevant departments
const HOSPITAL_INFO = {
  name: "CDA Hospital Islamabad",
  address: "Sector G-10/4, Islamabad, Pakistan",
  phone: "+92-51-1234567",
  emergency: "1021",
  email: "info@cdahospital.gov.pk",
  established: "1976",
  beds: "850+",
  doctors: "200+",
  departments: ["Cardiology", "Pharmacy", "Laboratory"],
  visitingHours: "Monday - Saturday: 9:00 AM - 5:00 PM",
  emergencyServices: "24/7 Emergency & Trauma Center",
  description: "CDA Hospital is a premier government healthcare facility in Islamabad, providing quality medical services since 1976.",
};

const VisitorHomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [symptomResult, setSymptomResult] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const symptoms = [
    { id: 1, name: 'Fever', icon: 'thermometer-outline', color: '#FF6B6B' },
    { id: 2, name: 'Headache', icon: 'body-outline', color: '#FFB800' },
    { id: 3, name: 'Chest Pain', icon: 'heart-outline', color: '#FF4D4D' },
    { id: 4, name: 'Breathing Issue', icon: 'lungs-outline', color: '#4ECDC4' },
    { id: 5, name: 'Cough', icon: 'medical-outline', color: '#A29BFE' },
    { id: 6, name: 'Fatigue', icon: 'battery-dead-outline', color: '#F59E0B' },
  ];

  const symptomAdvice = {
    'Fever': '🤒 Rest and stay hydrated. Take paracetamol if needed. Consult doctor if fever exceeds 102°F.',
    'Headache': '🤕 Rest in a quiet dark room. Apply cold compress. Consult doctor if severe or persistent.',
    'Chest Pain': '⚠️ This could be serious. Please call 1021 immediately or visit the emergency room.',
    'Breathing Issue': '🫁 Sit upright and try to breathe slowly. Seek immediate medical attention.',
    'Cough': '💊 Stay hydrated and rest. Use honey for throat. Consult doctor if persists over 3 days.',
    'Fatigue': '😴 Get adequate rest and nutrition. If persistent, consult doctor for blood work.',
  };

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, []);

  const navigateTo = (screenName, params = {}) => {
    if (navigation && screenName) {
      try {
        navigation.navigate(screenName, params);
      } catch (error) {
        Alert.alert('Coming Soon', 'This feature will be available in the next update.');
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigateTo('DoctorListScreen', { searchQuery });
    } else {
      Alert.alert('Info', 'Please enter what you want to search');
    }
  };

  const handleSymptomCheck = (symptom) => {
    setSelectedSymptom(symptom);
    setSymptomResult(symptomAdvice[symptom] || 'Consult doctor for proper diagnosis.');
    setShowSymptomModal(true);
  };

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency',
      'Quick access to emergency services:',
      [
        { text: '🚑 Call 1021', onPress: () => Linking.openURL('tel:1021') },
        { text: '📍 Nearest Hospital', onPress: () => {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOSPITAL_INFO.address)}`;
            Linking.openURL(url);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleGetToken = () => {
    navigateTo('PatientPortal');
  };

  const handleViewQueue = () => {
    navigateTo('LiveTokenQueueScreen');
  };

  const handleAppointment = () => {
    navigateTo('BookAppointmentScreen');
  };

  const handleCallHospital = () => {
    Linking.openURL(`tel:${HOSPITAL_INFO.phone}`);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOSPITAL_INFO.address)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.background, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header - Only Logo with Outline */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.logoWrapper}>
              <View style={styles.logoOutline}>
                <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
              </View>
            </View>

            <TouchableOpacity style={styles.infoButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.greeting}>Welcome to SehatLine</Text>
              <Text style={styles.headline}>
                <Text style={styles.cyanText}>Smart Healthcare Services</Text>
                {'\n'}
                <Text style={styles.hospitalName}>{HOSPITAL_INFO.name}</Text>
              </Text>

              <View style={styles.locationBadge}>
                <Ionicons name="location-outline" size={15} color={COLORS.danger} />
                <Text style={styles.locationText}>1.2 km away • Islamabad</Text>
              </View>

              <View style={[styles.searchContainer, styles.cardShadow]}>
                <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                  placeholder="Search doctors, departments, services..."
                  placeholderTextColor={COLORS.textLight}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                  <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.searchGradient}>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Action Cards - Queue System Integrated */}
            <View style={styles.actionCardsRow}>
              <TouchableOpacity style={[styles.actionCard, styles.actionCardPrimary, styles.cardShadow]} onPress={handleGetToken}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.actionCardGradient}>
                  <View style={styles.actionCardIcon}>
                    <Ionicons name="ticket-outline" size={28} color={COLORS.white} />
                  </View>
                  <Text style={styles.actionCardTitle}>Get Token</Text>
                  <Text style={styles.actionCardDesc}>Skip the queue</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionCard, styles.actionCardWhite, styles.cardShadow]} onPress={handleViewQueue}>
                <View style={styles.actionCardWhiteContent}>
                  <View style={[styles.actionCardIconWhite, { backgroundColor: COLORS.primary + '15' }]}>
                    <Ionicons name="list-outline" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.actionCardTitleWhite}>Queue Status</Text>
                  <Text style={styles.actionCardDescWhite}>Check your position</Text>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>Live</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.actionCardsRow}>
              <TouchableOpacity style={[styles.actionCard, styles.actionCardWhite, styles.cardShadow]} onPress={handleAppointment}>
                <View style={styles.actionCardWhiteContent}>
                  <View style={[styles.actionCardIconWhite, { backgroundColor: COLORS.appointment + '15' }]}>
                    <Ionicons name="calendar-outline" size={28} color={COLORS.appointment} />
                  </View>
                  <Text style={styles.actionCardTitleWhite}>Book Appointment</Text>
                  <Text style={styles.actionCardDescWhite}>With specialist</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionCard, styles.actionCardWhite, styles.cardShadow]} onPress={() => navigateTo('DoctorListScreen')}>
                <View style={styles.actionCardWhiteContent}>
                  <View style={[styles.actionCardIconWhite, { backgroundColor: COLORS.ai + '15' }]}>
                    <Ionicons name="people-outline" size={28} color={COLORS.ai} />
                  </View>
                  <Text style={styles.actionCardTitleWhite}>Find Doctors</Text>
                  <Text style={styles.actionCardDescWhite}>Search & book</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Departments - Only relevant ones with outline */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Our Services</Text>
              <View style={styles.serviceCards}>
                <TouchableOpacity style={[styles.serviceCard, styles.cardShadow]} onPress={() => navigateTo('DoctorListScreen')}>
                  <View style={[styles.serviceIcon, { backgroundColor: COLORS.primary + '15' }]}>
                    <Ionicons name="heart-outline" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.serviceName}>Cardiology</Text>
                  <Text style={styles.serviceDesc}>Heart care specialists</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serviceCard, styles.cardShadow]} onPress={() => navigateTo('MedicineListScreen')}>
                  <View style={[styles.serviceIcon, { backgroundColor: COLORS.pharmacy + '15' }]}>
                    <Ionicons name="medkit-outline" size={28} color={COLORS.pharmacy} />
                  </View>
                  <Text style={styles.serviceName}>Pharmacy</Text>
                  <Text style={styles.serviceDesc}>Medication & supplies</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serviceCard, styles.cardShadow]} onPress={() => navigateTo('LabTestsPriceScreen')}>
                  <View style={[styles.serviceIcon, { backgroundColor: COLORS.appointment + '15' }]}>
                    <Ionicons name="flask-outline" size={28} color={COLORS.appointment} />
                  </View>
                  <Text style={styles.serviceName}>Laboratory</Text>
                  <Text style={styles.serviceDesc}>Diagnostic tests</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Symptom Checker */}
            <View style={styles.symptomSection}>
              <View style={styles.symptomHeader}>
                <Text style={styles.sectionTitle}>Symptom Checker</Text>
                <Text style={styles.symptomSubtitle}>Select your symptom for quick advice</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symptomScroll}>
                {symptoms.map((symptom) => (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[styles.symptomChip, styles.cardShadow, { borderColor: symptom.color }]}
                    onPress={() => handleSymptomCheck(symptom.name)}
                  >
                    <Ionicons name={symptom.icon} size={20} color={symptom.color} />
                    <Text style={[styles.symptomChipText, { color: symptom.color }]}>{symptom.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Emergency - Subtle with outline */}
            <TouchableOpacity style={[styles.emergencyRow, styles.cardShadow]} onPress={handleEmergency}>
              <LinearGradient colors={[COLORS.danger, '#CC0000']} style={styles.emergencyGradient}>
                <Ionicons name="alert-circle" size={20} color={COLORS.white} />
                <Text style={styles.emergencyText}>Emergency</Text>
                <Text style={styles.emergencyNumber}>1021</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Info Row */}
            <View style={[styles.quickInfoRow, styles.cardShadow]}>
              <TouchableOpacity style={styles.quickInfoItem} onPress={handleCallHospital}>
                <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                <Text style={styles.quickInfoText}>Call</Text>
              </TouchableOpacity>
              <View style={styles.quickInfoDivider} />
              <TouchableOpacity style={styles.quickInfoItem} onPress={handleDirections}>
                <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
                <Text style={styles.quickInfoText}>Directions</Text>
              </TouchableOpacity>
              <View style={styles.quickInfoDivider} />
              <TouchableOpacity style={styles.quickInfoItem} onPress={() => setModalVisible(true)}>
                <Ionicons name="information-outline" size={20} color={COLORS.primary} />
                <Text style={styles.quickInfoText}>About</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={[styles.statsRow, styles.cardShadow]}>
              <StatMini num={HOSPITAL_INFO.beds} label="Beds" />
              <StatMini num={HOSPITAL_INFO.doctors} label="Doctors" />
              <StatMini num="50k+" label="Patients" />
              <StatMini num="24/7" label="Support" />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerHospital}>{HOSPITAL_INFO.name}</Text>
              <Text style={styles.footerAddress}>{HOSPITAL_INFO.address}</Text>
              <Text style={styles.footerPhone}>📞 {HOSPITAL_INFO.phone}</Text>
              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={() => navigateTo('AboutHospitalScreen')}>
                  <Text style={styles.footerLink}>About</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}>•</Text>
                <TouchableOpacity onPress={() => navigateTo('PoliciesScreen')}>
                  <Text style={styles.footerLink}>Privacy</Text>
                </TouchableOpacity>
                <Text style={styles.footerDot}>•</Text>
                <TouchableOpacity onPress={() => navigateTo('PoliciesScreen')}>
                  <Text style={styles.footerLink}>Terms</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.copyright}>© 2024 SehatLine • Smart Queue System</Text>
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Symptom Result Modal */}
        <Modal visible={showSymptomModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.symptomModalContent, styles.cardShadow]}>
              <View style={styles.symptomModalHeader}>
                <View style={[styles.symptomModalIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <Ionicons name="medical-outline" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.symptomModalTitle}>Symptom Advice</Text>
                <TouchableOpacity onPress={() => setShowSymptomModal(false)} style={styles.symptomModalClose}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.symptomModalBody}>
                <Text style={styles.symptomModalLabel}>Selected Symptom</Text>
                <Text style={styles.symptomModalSymptom}>{selectedSymptom}</Text>
                <View style={styles.symptomModalDivider} />
                <Text style={styles.symptomModalLabel}>Recommendation</Text>
                <Text style={styles.symptomModalText}>{symptomResult}</Text>
              </View>
              <View style={styles.symptomModalActions}>
                <TouchableOpacity style={styles.symptomModalBtn} onPress={() => setShowSymptomModal(false)}>
                  <Text style={styles.symptomModalBtnText}>Got it</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.symptomModalBtn, styles.symptomModalBtnPrimary]} onPress={() => {
                  setShowSymptomModal(false);
                  navigateTo('BookAppointmentScreen');
                }}>
                  <Text style={styles.symptomModalBtnTextPrimary}>Book Appointment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Hospital Info Modal */}
        <Modal transparent visible={modalVisible} animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={[styles.modalContent, styles.cardShadow]}>
              <View style={styles.modalIndicator} />
              <View style={styles.modalHeader}>
                <Image source={require('../../../assets/logo.png')} style={styles.modalLogo} />
                <Text style={styles.modalTitle}>{HOSPITAL_INFO.name}</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <View style={styles.modalInfoSection}>
                  <Text style={styles.modalInfoText}>{HOSPITAL_INFO.description}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.modalInfoLabel}>Established: {HOSPITAL_INFO.established}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.modalInfoLabel}>{HOSPITAL_INFO.address}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.modalInfoLabel}>Emergency: {HOSPITAL_INFO.emergency}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.modalInfoLabel}>Visiting Hours: {HOSPITAL_INFO.visitingHours}</Text>
                </View>
                <View style={styles.modalDepartments}>
                  <Text style={styles.modalDeptTitle}>Departments</Text>
                  <View style={styles.modalDeptList}>
                    {HOSPITAL_INFO.departments.map((dept, index) => (
                      <View key={index} style={styles.modalDeptTag}>
                        <Text style={styles.modalDeptText}>{dept}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity style={[styles.closeBtn, styles.cardShadow]} onPress={() => setModalVisible(false)}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.closeBtnGradient}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </View>
  );
};

// Sub-Components
const StatMini = ({ num, label }) => (
  <View style={styles.miniStatItem}>
    <Text style={styles.miniStatNum}>{num}</Text>
    <Text style={styles.miniStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },

  // Header - Logo only with outline
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: SIZES.md,
  },
  backButton: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    ...SHADOWS.medium,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.navy,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  headerLogo: { width: 40, height: 40, borderRadius: 20 },
  infoButton: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    ...SHADOWS.medium,
  },

  scrollContent: { paddingBottom: Platform.OS === 'ios' ? 100 : 80 },

  // Hero Section
  heroSection: { paddingHorizontal: SIZES.xl, marginTop: 10, marginBottom: SIZES.md },
  greeting: { color: COLORS.navy, fontSize: SIZES.body, fontWeight: '500', opacity: 0.9 },
  headline: { marginTop: 5 },
  hospitalName: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
  cyanText: { color: COLORS.white, fontSize: 24, fontWeight: '600' },

  locationBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(73, 71, 71, 0.38)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 8,
    alignSelf: 'flex-start',
    ...SHADOWS.small,
  },
  locationText: { fontSize: SIZES.small, color: COLORS.white, fontWeight: '500', marginLeft: 6 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 15, marginTop: SIZES.md,
    height: 52,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  searchIcon: { marginLeft: 15 },
  searchInput: { flex: 1, color: COLORS.text, paddingHorizontal: SIZES.md, fontSize: SIZES.body },
  searchBtn: { width: 42, height: 42, marginRight: 5, borderRadius: 12, overflow: 'hidden' },
  searchGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Action Cards
  actionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  actionCard: {
    width: width / 2 - 28,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionCardPrimary: { ...SHADOWS.medium },
  actionCardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  actionCardIcon: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  actionCardTitle: { color: COLORS.white, fontSize: SIZES.h4, fontWeight: 'bold' },
  actionCardDesc: { color: COLORS.white, fontSize: SIZES.small, opacity: 0.8 },

  actionCardWhite: {
    backgroundColor: COLORS.white,
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  actionCardWhiteContent: { alignItems: 'center' },
  actionCardIconWhite: {
    width: 48, height: 48,
    borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  actionCardTitleWhite: { color: COLORS.text, fontSize: SIZES.h4, fontWeight: 'bold' },
  actionCardDescWhite: { color: COLORS.textSecondary, fontSize: SIZES.small },

  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, marginTop: 4,
  },
  liveDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  liveBadgeText: { color: COLORS.success, fontSize: 8, fontWeight: 'bold' },

  // Services (Only 3)
  infoSection: { paddingHorizontal: SIZES.xl, marginBottom: SIZES.xl },
  sectionTitle: { color: COLORS.text, fontSize: SIZES.h3, fontWeight: 'bold', marginBottom: SIZES.md },
  serviceCards: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceCard: {
    width: width / 3 - 24,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  serviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  serviceName: { color: COLORS.text, fontSize: SIZES.small, fontWeight: 'bold' },
  serviceDesc: { color: COLORS.textSecondary, fontSize: SIZES.xSmall, textAlign: 'center', marginTop: 2 },

  // Symptom Checker
  symptomSection: { paddingHorizontal: SIZES.xl, marginBottom: SIZES.xl },
  symptomHeader: { marginBottom: SIZES.md },
  symptomSubtitle: { color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: 2 },
  symptomScroll: { paddingVertical: 4 },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginRight: 10,
    borderWidth: 1.5,
    ...SHADOWS.medium,
  },
  symptomChipText: { fontSize: SIZES.small, fontWeight: '500', marginLeft: 6 },

  // Emergency Row
  emergencyRow: { marginHorizontal: SIZES.xl, marginBottom: SIZES.md, borderRadius: 12, overflow: 'hidden', ...SHADOWS.medium },
  emergencyGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, gap: 12,
  },
  emergencyText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '600' },
  emergencyNumber: { color: COLORS.white, fontSize: SIZES.body, fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8 },

  // Quick Info
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.xl,
    paddingVertical: SIZES.sm,
    borderRadius: 15,
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  quickInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  quickInfoDivider: { width: 1, height: 20, backgroundColor: COLORS.border },
  quickInfoText: { fontSize: SIZES.small, color: COLORS.text, fontWeight: '500' },

  // Stats
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  miniStatItem: { alignItems: 'center', minWidth: 65 },
  miniStatNum: { color: COLORS.primary, fontSize: SIZES.h3, fontWeight: 'bold' },
  miniStatLabel: { color: COLORS.textSecondary, fontSize: SIZES.xSmall, marginTop: 4, fontWeight: '500' },

  // Card Shadow Utility
  cardShadow: { ...SHADOWS.medium },

  // Footer
  footer: {
    paddingHorizontal: SIZES.xl,
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerHospital: { fontSize: SIZES.h5, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  footerAddress: { fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: 4 },
  footerPhone: { fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: 12 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  footerLink: { color: COLORS.primary, fontSize: SIZES.small, fontWeight: '500' },
  footerDot: { color: COLORS.textLight, fontSize: SIZES.body },
  copyright: { color: COLORS.textLight, fontSize: SIZES.xSmall, textAlign: 'center' },

  // Symptom Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  symptomModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: width * 0.9,
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  symptomModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  symptomModalIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  symptomModalTitle: { flex: 1, fontSize: SIZES.h4, fontWeight: 'bold', color: COLORS.text },
  symptomModalClose: { padding: 4 },
  symptomModalBody: { marginBottom: 16 },
  symptomModalLabel: { fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: 4 },
  symptomModalSymptom: { fontSize: SIZES.h4, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  symptomModalDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  symptomModalText: { fontSize: SIZES.body, color: COLORS.textSecondary, lineHeight: 22 },
  symptomModalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  symptomModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  symptomModalBtnText: { color: COLORS.text, fontWeight: '600' },
  symptomModalBtnPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  symptomModalBtnTextPrimary: { color: COLORS.white, fontWeight: '600' },

  // Hospital Info Modal
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 25,
    maxHeight: height * 0.9,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  modalScroll: { maxHeight: height * 0.5 },
  modalIndicator: { width: 40, height: 5, backgroundColor: COLORS.border, alignSelf: 'center', borderRadius: 10, marginBottom: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 12 },
  modalLogo: { width: 40, height: 40, borderRadius: 20 },
  modalTitle: { color: COLORS.text, fontSize: SIZES.h3, fontWeight: 'bold', textAlign: 'center' },
  modalInfoSection: { marginBottom: 16 },
  modalInfoText: { fontSize: SIZES.body, color: COLORS.textSecondary, lineHeight: 20, textAlign: 'center' },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalInfoLabel: { fontSize: SIZES.body, color: COLORS.text, flex: 1 },
  modalDepartments: { marginTop: 12 },
  modalDeptTitle: { fontSize: SIZES.body, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  modalDeptList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  modalDeptTag: { backgroundColor: COLORS.primary + '10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary + '30' },
  modalDeptText: { fontSize: SIZES.xSmall, color: COLORS.primary, fontWeight: '500' },
  closeBtn: { borderRadius: 15, overflow: 'hidden', marginTop: SIZES.xl, ...SHADOWS.button },
  closeBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  closeBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: SIZES.h5 },
});

export default VisitorHomeScreen;