import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Dimensions, Image, Modal, TextInput,
  ImageBackground, Animated, Alert, Share, Platform, StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const VisitorHomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
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
        Alert.alert(
          'Coming Soon',
          `This feature will be available in the next update.`,
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    } else {
      Alert.alert('Info', 'Navigation will be available soon!');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigateTo('DoctorListScreen', { searchQuery });
    } else {
      Alert.alert('Info', 'Please enter what you want to search');
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency Services',
      'Select emergency service:',
      [
        { text: '🚑 Call Ambulance', onPress: () => navigateTo('AmbulanceTrackingScreen') },
        { text: '🆘 SOS Alert', onPress: () => navigateTo('SOS') },
        { text: '🏥 Nearest Hospital', onPress: () => navigateTo('HospitalDirectoryScreen') },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  return (
        <ImageBackground
        source={{ uri: 'https://cdn.vectorstock.com/i/1000v/95/51/dark-blue-light-beam-background-vector-27699551.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
        >

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button - Fixed spacing */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#04e1f5" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerText}>
              SEHAT<Text style={{ color: '#FFF' }}>LINE</Text>
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="information-circle-outline" size={24} color="#04e1f5" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Welcome Section */}
          <View style={styles.heroSection}>
            <Text style={styles.greeting}>Welcome to SehatLine</Text>
            <Text style={styles.headline}>
              Government Hospital{'\n'}
              <Text style={styles.cyanText}>Digital Services</Text>
            </Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
              <TextInput 
                placeholder="Search doctors, departments, services..." 
                placeholderTextColor="#666"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.searchGradient}>
                  <Ionicons name="arrow-forward" size={20} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Emergency SOS Banner */}
          <TouchableOpacity onPress={handleEmergency} style={styles.emergencyButton}>
            <LinearGradient colors={['#FF4D4D', '#CC0000']} style={styles.emergencyGradient}>
              <Ionicons name="alert-circle" size={28} color="#FFF" />
              <Text style={styles.emergencyText}>EMERGENCY SOS</Text>
              <Ionicons name="chevron-forward" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Category Pills */}
          <View style={styles.pillContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScrollContent}>
              <CategoryPill icon="business" label="Hospitals" onPress={() => navigateTo('HospitalDirectoryScreen')} />
              <CategoryPill icon="medkit" label="Pharmacy" onPress={() => navigateTo('MedicineListScreen')} />
              <CategoryPill icon="flask" label="Lab Tests" onPress={() => navigateTo('LabTestsPriceScreen')} />
              <CategoryPill icon="people" label="Doctors" onPress={() => navigateTo('DoctorListScreen')} />
              <CategoryPill icon="calendar" label="Appointments" onPress={() => navigateTo('BookAppointmentScreen')} />
              <CategoryPill icon="document-text" label="Reports" onPress={() => navigateTo('ReportsListScreen')} />
            </ScrollView>
          </View>

          {/* Featured Banner - Digital OPD Pass */}
          <View style={styles.featuredSection}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigateTo('PatientPortal')}>
              <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.featureCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.featureTextContainer}>
                  <View style={styles.featTag}>
                    <Text style={styles.featTagText}>NEW FEATURE</Text>
                  </View>
                  <Text style={styles.featTitle}>Digital OPD Pass</Text>
                  <Text style={styles.featDesc}>Skip long queues with AI-generated tokens for hospital visits.</Text>
                  <View style={styles.featBtn}>
                    <Text style={styles.featBtnText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={14} color="#04e1f5" />
                  </View>
                </View>
                <Ionicons name="qr-code" size={100} color="rgba(255,255,255,0.15)" style={styles.bgIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Hospital Information Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Hospital Information</Text>
            
            <View style={styles.infoCards}>
              <InfoCard 
                icon="time-outline"
                title="Visiting Hours"
                content="Monday - Saturday: 9:00 AM - 5:00 PM"
                onPress={() => navigateTo('HospitalTimingsScreen')}
              />
              <InfoCard 
                icon="location-outline"
                title="Hospital Directory"
                content="Find departments, wards & clinics"
                onPress={() => navigateTo('HospitalDirectoryScreen')}
              />
              <InfoCard 
                icon="call-outline"
                title="Contact & Helpline"
                content="Emergency: 1021 | Support: 042-1234567"
                onPress={() => navigateTo('ContactScreen')}
              />
              <InfoCard 
                icon="navigate-outline"
                title="AR Navigation"
                content="Navigate inside hospital with AR"
                onPress={() => navigateTo('ARNavigation')}
              />
            </View>
          </View>

          {/* Announcements */}
          <View style={styles.announcementSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Announcements</Text>
              <TouchableOpacity onPress={() => navigateTo('Announcements')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.announcementCard} onPress={() => navigateTo('Announcements')}>
              <View style={styles.announcementBadge}>
                <Text style={styles.announcementBadgeText}>NEW</Text>
              </View>
              <Text style={styles.announcementTitle}>Free Medical Camp</Text>
              <Text style={styles.announcementDesc}>Free checkup camp on 15th December at OPD Block</Text>
              <Text style={styles.announcementDate}>Dec 10, 2024</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.announcementCard} onPress={() => navigateTo('Announcements')}>
              <Text style={styles.announcementTitle}>OPD Schedule Update</Text>
              <Text style={styles.announcementDesc}>Winter schedule now active. OPD timings: 9AM - 4PM</Text>
              <Text style={styles.announcementDate}>Dec 5, 2024</Text>
            </TouchableOpacity>
          </View>

          {/* Health Tips */}
          <View style={styles.tipsSection}>
            <LinearGradient colors={['rgba(4,225,245,0.1)', 'rgba(2,132,199,0.1)']} style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb-outline" size={24} color="#04e1f5" />
                <Text style={styles.tipsTitle}>Health Tips</Text>
              </View>
              <Text style={styles.tipsText}>
                🏥 Bring your CNIC and previous medical records for faster registration at the hospital.
              </Text>
              <TouchableOpacity onPress={() => navigateTo('AIHealthTipsScreen')}>
                <Text style={styles.tipsButtonText}>More Tips →</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Stats Section */}
          <View style={styles.miniStats}>
            <StatMini num="150+" label="Hospitals" />
            <StatMini num="500+" label="Doctors" />
            <StatMini num="50k+" label="Patients" />
            <StatMini num="24/7" label="Support" />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigateTo('AboutHospitalScreen')}>
              <Text style={styles.footerLink}>About Hospital</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('PoliciesScreen')}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('PoliciesScreen')}>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.copyright}>© 2024 SehatLine | Government Hospital Services</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Info Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 30 : 50} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalIndicator} />
              
              <View style={styles.modalHeader}>
                <Image source={require('../../../assets/logo.png')} style={styles.modalLogo} />
                <Text style={styles.modalTitle}>SehatLine Portal</Text>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <InfoRow icon="globe-outline" title="Government Hospital Services" text="Digital healthcare services for all citizens of Pakistan." />
                <InfoRow icon="hardware-chip-outline" title="AI-Powered Assistance" text="Smart symptom checking and health recommendations." />
                <InfoRow icon="lock-closed-outline" title="Secure & Private" text="Your health data is encrypted and protected." />
                <InfoRow icon="medkit-outline" title="Free Services" text="Basic healthcare information available for everyone." />
              </ScrollView>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                  <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.closeBtnGradient}>
                    <Text style={styles.closeBtnText}>Start Exploring</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
      </ImageBackground>
  );
};

// Sub-Components
const CategoryPill = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.pill} onPress={onPress}>
    <Ionicons name={icon} size={18} color="#04e1f5" />
    <Text style={styles.pillText}>{label}</Text>
  </TouchableOpacity>
);

const InfoCard = ({ icon, title, content, onPress }) => (
  <TouchableOpacity style={styles.infoCard} onPress={onPress}>
    <View style={styles.infoCardIcon}>
      <Ionicons name={icon} size={24} color="#04e1f5" />
    </View>
    <View style={styles.infoCardContent}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardText} numberOfLines={1}>{content}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const StatMini = ({ num, label }) => (
  <View style={styles.miniStatItem}>
    <Text style={styles.miniStatNum}>{num}</Text>
    <Text style={styles.miniStatLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, title, text }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconCircle}>
      <Ionicons name={icon} size={20} color="#04e1f5" />
    </View>
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={styles.infoRowTitle}>{title}</Text>
      <Text style={styles.infoRowDesc}>{text}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(4,225,245,0.15)',
    borderRadius: 20,
  },
  
  logoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
  },
  
  headerLogo: { 
    width: 30, 
    height: 30, 
    marginRight: 8,
    borderRadius: 15,
  },
  
  headerText: { 
    color: '#04e1f5', 
    fontWeight: '900', 
    fontSize: 18, 
    letterSpacing: 1 
  },
  
  infoButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(4,225,245,0.15)',
    borderRadius: 20,
  },
  
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  
  heroSection: { 
    paddingHorizontal: 20, 
    marginTop: 10, 
    marginBottom: 20 
  },
  
  greeting: { 
    color: '#AAA', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  
  headline: { 
    color: '#FFF', 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginTop: 5, 
    lineHeight: 40 
  },
  
  cyanText: { 
    color: '#04e1f5' 
  },
  
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 15, 
    marginTop: 20, 
    height: 55, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  
  searchIcon: {
    marginLeft: 15,
  },
  
  searchInput: { 
    flex: 1, 
    color: '#FFF', 
    paddingHorizontal: 12, 
    fontSize: 14 
  },
  
  searchBtn: {
    width: 45,
    height: 45,
    marginRight: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  searchGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emergencyButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  
  emergencyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  
  pillContainer: { 
    backgroundColor: 'transparent', 
    paddingVertical: 10,
    marginBottom: 10,
  },
  
  pillScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  
  pill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 29, 61, 0.9)', 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: 'rgba(4,225,245,0.3)' 
  },
  
  pillText: { 
    color: '#FFF', 
    fontSize: 13, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  
  featuredSection: { 
    paddingHorizontal: 20, 
    marginTop: 10,
    marginBottom: 20,
  },
  
  featureCard: { 
    borderRadius: 25, 
    padding: 25, 
    position: 'relative', 
    overflow: 'hidden',
  },
  
  featureTextContainer: { 
    width: '70%' 
  },
  
  featTag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  featTagText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  featTitle: { 
    color: '#000', 
    fontSize: 24, 
    fontWeight: '900', 
    marginTop: 12 
  },
  
  featDesc: { 
    color: '#000', 
    fontSize: 13, 
    marginTop: 8, 
    opacity: 0.8,
    lineHeight: 18,
  },
  
  featBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#000', 
    alignSelf: 'flex-start', 
    marginTop: 15, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  
  featBtnText: { 
    color: '#04e1f5', 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginRight: 6 
  },
  
  bgIcon: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20,
    opacity: 0.3,
  },
  
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  
  infoCards: {
    gap: 12,
  },
  
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  infoCardIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(4,225,245,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  infoCardContent: {
    flex: 1,
  },
  
  infoCardTitle: {
    color: '#04e1f5',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  infoCardText: {
    color: '#CCC',
    fontSize: 11,
  },
  
  announcementSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  viewAll: {
    color: '#04e1f5',
    fontSize: 12,
    fontWeight: '500',
  },
  
  announcementCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  announcementBadge: {
    backgroundColor: '#04e1f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  
  announcementBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
  },
  
  announcementTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  
  announcementDesc: {
    color: '#CCC',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  
  announcementDate: {
    color: '#888',
    fontSize: 10,
  },
  
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  tipsCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(4,225,245,0.3)',
  },
  
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  
  tipsTitle: {
    color: '#04e1f5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  tipsText: {
    color: '#FFF',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  tipsButtonText: {
    color: '#04e1f5',
    fontSize: 12,
    fontWeight: '500',
  },
  
  miniStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 20, 
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    gap: 20,
  },
  
  miniStatItem: { 
    alignItems: 'center',
    minWidth: 70,
  },
  
  miniStatNum: { 
    color: '#04e1f5', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  
  miniStatLabel: { 
    color: '#888', 
    fontSize: 10, 
    marginTop: 4,
    fontWeight: '500',
  },
  
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
  },
  
  footerLink: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  copyright: {
    color: '#666',
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  
  modalBlur: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  
  modalContent: { 
    backgroundColor: '#000', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25, 
    borderWidth: 1, 
    borderColor: 'rgba(4,225,245,0.2)',
    maxHeight: height * 0.9,
  },
  
  modalScroll: {
    maxHeight: height * 0.5,
  },
  
  modalIndicator: { 
    width: 40, 
    height: 5, 
    backgroundColor: '#333', 
    alignSelf: 'center', 
    borderRadius: 10, 
    marginBottom: 20 
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 12,
  },
  
  modalLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  modalTitle: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  
  infoRow: { 
    flexDirection: 'row', 
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  
  infoIconCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(4,225,245,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  infoRowTitle: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  infoRowDesc: { 
    color: '#AAA', 
    fontSize: 12, 
    lineHeight: 16,
  },
  
  modalButtons: {
    gap: 12,
    marginTop: 20,
  },
  
  closeBtn: { 
    borderRadius: 15, 
    overflow: 'hidden',
  },
  
  closeBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  closeBtnText: { 
    color: '#000', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
});

export default VisitorHomeScreen;