import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView,
  Dimensions, Platform, StatusBar, ImageBackground, SafeAreaView,
  Modal, Share, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const ContactScreen = ({ navigation }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const openMaps = () => {
    const url = "https://www.google.com/maps/search/?api=1&query=CDA+Hospital+Islamabad";
    Linking.openURL(url);
  };

  const openPhone = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const openEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out SehatLine - CDA Healthcare Portal! Download now from the app store.',
        title: 'Share SehatLine'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this moment');
    }
  };

  const departments = [
    { name: 'Emergency', phone: '1122', timing: '24/7', icon: 'alert-circle' },
    { name: 'Ambulance Service', phone: '1022', timing: '24/7', icon: 'car-sport' },
    { name: 'OPD Registration', phone: '051-111-123-456', timing: '8AM - 8PM', icon: 'clipboard' },
    { name: 'Pharmacy', phone: '051-111-123-457', timing: '24/7', icon: 'medkit' },
    { name: 'Lab Services', phone: '051-111-123-458', timing: '8AM - 10PM', icon: 'flask' },
    { name: 'Radiology', phone: '051-111-123-459', timing: '9AM - 9PM', icon: 'scan' },
    { name: 'Patient Relations', phone: '051-111-123-460', timing: '9AM - 5PM', icon: 'people' },
    { name: 'Billing & Accounts', phone: '051-111-123-461', timing: '9AM - 5PM', icon: 'card' },
    { name: 'Medical Records', phone: '051-111-123-462', timing: '9AM - 4PM', icon: 'folder' },
    { name: 'HR Department', phone: '051-111-123-463', timing: '9AM - 5PM', icon: 'business' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'logo-facebook', url: 'https://facebook.com/sehatline', color: '#4892f3' },
    { name: 'Twitter', icon: 'logo-twitter', url: 'https://twitter.com/sehatline', color: '#129dd4' },
    { name: 'Instagram', icon: 'logo-instagram', url: 'https://instagram.com/sehatline', color: '#E4405F' },
    { name: 'LinkedIn', icon: 'logo-linkedin', url: 'https://linkedin.com/company/sehatline', color: '#c2d1ee' },
    { name: 'WhatsApp', icon: 'logo-whatsapp', url: 'https://wa.me/923001234567', color: '#25D366' },
  ];

  const workingHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 2:00 PM (Emergency 24/7)' },
  ];

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
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header with Hero Section */}
              <LinearGradient
                colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
                style={styles.headerGradient}
              >
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                </TouchableOpacity>
                
                <View style={styles.heroSection}>
                  <View style={styles.heroIcon}>
                    <LinearGradient
                      colors={['#04e1f5', '#0284c7']}
                      style={styles.heroIconGradient}
                    >
                      <Ionicons name="call" size={wp(10)} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.heroTitle}>Contact Us</Text>
                  <Text style={styles.heroSubtitle}>We're here to help 24/7</Text>
                </View>
              </LinearGradient>

              {/* Emergency Contact Banner */}
              <TouchableOpacity 
                style={styles.emergencyBanner}
                onPress={() => openPhone('1122')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#DC2626', '#EF4444']}
                  style={styles.emergencyGradient}
                >
                  <Ionicons name="alert-circle" size={wp(7)} color="#fff" />
                  <View style={styles.emergencyContent}>
                    <Text style={styles.emergencyTitle}>🚨 Emergency Helpline</Text>
                    <Text style={styles.emergencyNumber}>1122</Text>
                    <Text style={styles.emergencySub}>24/7 Ambulance & Emergency Services</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={wp(5)} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Main Contact Cards */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Get in Touch</Text>
                <View style={styles.contactGrid}>
                  <TouchableOpacity style={styles.contactCard} onPress={() => openPhone('051-111-123-456')}>
                    <LinearGradient
                      colors={['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardIcon}>
                        <Ionicons name="call" size={wp(6)} color="#04e1f5" />
                      </View>
                      <Text style={styles.cardTitle}>Call Us</Text>
                      <Text style={styles.cardValue}>051-111-123-456</Text>
                      <Text style={styles.cardSub}>Support Line</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactCard} onPress={() => openEmail('support@sehatline.com')}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardIcon}>
                        <Ionicons name="mail" size={wp(6)} color="#10B981" />
                      </View>
                      <Text style={styles.cardTitle}>Email Us</Text>
                      <Text style={styles.cardValue}>support@sehatline.com</Text>
                      <Text style={styles.cardSub}>24hr Response</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactCard} onPress={openMaps}>
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardIcon}>
                        <Ionicons name="location" size={wp(6)} color="#8B5CF6" />
                      </View>
                      <Text style={styles.cardTitle}>Visit Us</Text>
                      <Text style={styles.cardValue}>CDA Hospital, G-6/2</Text>
                      <Text style={styles.cardSub}>Islamabad, Pakistan</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactCard} onPress={shareApp}>
                    <LinearGradient
                      colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardIcon}>
                        <Ionicons name="share-social" size={wp(6)} color="#F59E0B" />
                      </View>
                      <Text style={styles.cardTitle}>Share App</Text>
                      <Text style={styles.cardValue}>Invite Friends</Text>
                      <Text style={styles.cardSub}>Spread the word</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Department Contacts */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏥 Department Direct Lines</Text>
                {departments.map((dept, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.deptCard}
                    onPress={() => openPhone(dept.phone)}
                  >
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.35)']}
                      style={styles.deptGradient}
                    >
                      <View style={styles.deptIcon}>
                        <Ionicons name={dept.icon} size={wp(5)} color="#04e1f5" />
                      </View>
                      <View style={styles.deptInfo}>
                        <Text style={styles.deptName}>{dept.name}</Text>
                        <Text style={styles.deptTiming}>{dept.timing}</Text>
                      </View>
                      <View style={styles.deptPhone}>
                        <Text style={styles.deptPhoneText}>{dept.phone}</Text>
                        <Ionicons name="call" size={wp(4)} color="#04e1f5" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Working Hours */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏰ Working Hours</Text>
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.35)']}
                  style={styles.hoursCard}
                >
                  {workingHours.map((item, index) => (
                    <View key={index} style={styles.hoursRow}>
                      <Text style={styles.hoursDay}>{item.day}</Text>
                      <Text style={styles.hoursTime}>{item.hours}</Text>
                    </View>
                  ))}
                  <View style={styles.hoursDivider} />
                  <View style={styles.emergencyNote}>
                    <Ionicons name="alert-circle" size={wp(4)} color="#EF4444" />
                    <Text style={styles.emergencyNoteText}>Emergency services available 24/7</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Social Media Links */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📱 Connect With Us</Text>
                <View style={styles.socialGrid}>
                  {socialLinks.map((social, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.socialCard}
                      onPress={() => Linking.openURL(social.url)}
                    >
                      <LinearGradient
                        colors={[social.color + '20', social.color + '']}
                        style={styles.socialGradient}
                      >
                        <Ionicons name={social.icon} size={wp(8)} color={social.color} />
                        <Text style={styles.socialName}>{social.name}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Map Preview */}
              <TouchableOpacity style={styles.mapPreview} onPress={openMaps}>
                <LinearGradient
                  colors={['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)']}
                  style={styles.mapGradient}
                >
                  <Ionicons name="map" size={wp(8)} color="#04e1f5" />
                  <View style={styles.mapContent}>
                    <Text style={styles.mapTitle}>View on Google Maps</Text>
                    <Text style={styles.mapAddress}>CDA Hospital, G-6/2, Islamabad</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={wp(5)} color="#04e1f5" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>SehatLine v2.0.0 | CDA Healthcare Portal</Text>
                <Text style={styles.footerSub}>© 2026 All Rights Reserved</Text>
              </View>

              <View style={{ height: hp(5) }} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(7, 19, 75, 0.56)' },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(3),
    borderBottomLeftRadius: wp(2),
    borderBottomRightRadius: wp(2),
  },
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(5),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  heroIcon: {
    marginBottom: hp(1),
  },
  heroIconGradient: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: '#B2DFDB',
    fontSize: wp(3.2),
    marginTop: hp(0.5),
  },

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  emergencyBanner: {
    marginTop: hp(-3),
    marginBottom: hp(2),
    borderRadius: wp(4),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    gap: wp(3),
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  emergencyNumber: {
    color: '#fff',
    fontSize: wp(6),
    fontWeight: 'bold',
    marginTop: hp(0.2),
  },
  emergencySub: {
    color: '#FEE2E2',
    fontSize: wp(2.5),
    marginTop: hp(0.2),
  },

  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    color: '#fff',
    fontSize: wp(4.2),
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },

  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: wp(2),
  },
  contactCard: {
    width: (wp(92) - wp(6)) / 2,
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  cardGradient: {
    padding: wp(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(5, 63, 68, 0.87)',
    borderRadius: wp(4),
  },
  cardIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    backgroundColor: 'rgba(4, 225, 245, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  cardTitle: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  cardValue: {
    color: '#04e1f5',
    fontSize: wp(3.2),
    fontWeight: '600',
    marginTop: hp(0.3),
    textAlign: 'center',
  },
  cardSub: {
    color: '#e8ecf1',
    fontSize: wp(2.5),
    marginTop: hp(0.2),
  },

  deptCard: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1),
  },
  deptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3),
    gap: wp(3),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.1)',
    borderRadius: wp(3),
  },
  deptIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  deptTiming: {
    color: '#64748B',
    fontSize: wp(2.5),
    marginTop: hp(0.2),
  },
  deptPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  deptPhoneText: {
    color: '#04e1f5',
    fontSize: wp(3),
    fontWeight: '500',
  },

  hoursCard: {
    borderRadius: wp(4),
    padding: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  hoursDay: {
    color: '#fff',
    fontSize: wp(3.2),
  },
  hoursTime: {
    color: '#B2DFDB',
    fontSize: wp(3),
  },
  hoursDivider: {
    height: 1,
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    marginVertical: hp(1),
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  emergencyNoteText: {
    color: '#EF4444',
    fontSize: wp(2.8),
    fontWeight: '500',
  },

  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: wp(2),
  },
  socialCard: {
    width: (wp(92) - wp(8)) / 3,
    borderRadius: wp(3),
    overflow: 'hidden',
  },
  socialGradient: {
    alignItems: 'center',
    padding: wp(3),
    gap: hp(0.5),
    borderWidth: 1,
    borderColor: 'rgba(6, 127, 138, 0.46)',
    borderRadius: wp(3),
  },
  socialName: {
    color: '#fff',
    fontSize: wp(2.5),
    fontWeight: '500',
  },

  mapPreview: {
    borderRadius: wp(4),
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  mapGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    gap: wp(3),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.55)',
    borderRadius: wp(4),
  },
  mapContent: {
    flex: 1,
  },
  mapTitle: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  mapAddress: {
    color: '#afb9c7',
    fontSize: wp(2.8),
    marginTop: hp(0.2),
  },

  footer: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  footerText: {
    color: '#b4bcc7',
    fontSize: wp(2.8),
  },
  footerSub: {
    color: '#b9c1ce',
    fontSize: wp(2.5),
    marginTop: hp(0.5),
  },
});

export default ContactScreen;