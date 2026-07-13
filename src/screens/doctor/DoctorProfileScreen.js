// src/screens/doctor/DoctorProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const USER_DATA_KEY = '@sehatline_userData';

const DoctorProfileScreen = ({ navigation }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctorData();
  }, []);

  // Refresh data when coming back from edit screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDoctorData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDoctorData = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        setDoctor({
          name: parsed.name || 'Dr. Ahmed Hassan',
          designation: parsed.specialty || 'Consultant Cardiologist',
          department: parsed.department || 'Cardiology OPD',
          hospital: parsed.hospital || 'Capital Hospital CDA',
          room: parsed.room || 'Room 204',
          employeeId: parsed.employeeId || 'CDA-2045',
          qualification: parsed.qualification || 'MBBS, FCPS Cardiology',
          experience: parsed.experience || '14 Years',
          pmdcRegistration: parsed.pmdcRegistration || 'PMC-123456',
          workingHours: parsed.shift || '08:30 AM – 02:00 PM',
          isOnline: parsed.isOnline !== undefined ? parsed.isOnline : true,
          avatar: parsed.avatar || 'AH',
          color: parsed.color || COLORS.primary,
          color2: parsed.color2 || COLORS.secondary,
          profileImage: parsed.profileImage || null,
          patientsAssigned: parsed.patientsAssigned || 40,
          patientsCompleted: parsed.patientsCompleted || 18,
          patientsRemaining: parsed.patientsRemaining || 22,
          avgConsultation: parsed.avgConsultation || '12 min',
        });
      } else {
        setDoctor({
          name: 'Dr. Ahmed Hassan',
          designation: 'Consultant Cardiologist',
          department: 'Cardiology OPD',
          hospital: 'Capital Hospital CDA',
          room: 'Room 204',
          employeeId: 'CDA-2045',
          qualification: 'MBBS, FCPS Cardiology',
          experience: '14 Years',
          pmdcRegistration: 'PMC-123456',
          workingHours: '08:30 AM – 02:00 PM',
          isOnline: true,
          avatar: 'AH',
          color: COLORS.primary,
          color2: COLORS.secondary,
          profileImage: null,
          patientsAssigned: 40,
          patientsCompleted: 18,
          patientsRemaining: 22,
          avgConsultation: '12 min',
        });
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No doctor data found</Text>
      </View>
    );
  }

  const handleEditPress = () => {
    navigation.navigate('DoctorEditProfileScreen', { doctor });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.headerTitle}>Doctor Profile</Text>
          </View>

          <TouchableOpacity 
            style={styles.editBtn}
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.editBtnGradient}
            >
              <Ionicons name="create-outline" size={wp(4.5)} color={COLORS.white} />
              <Text style={styles.editBtnText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── 1. DOCTOR IDENTITY CARD ───────────────────────────────── */}
          <View style={[styles.identityCard, SHADOWS.medium]}>
            <LinearGradient
              colors={[doctor.color || COLORS.primary, doctor.color2 || COLORS.secondary]}
              style={styles.avatar}
            >
              {doctor.profileImage ? (
                <Image source={{ uri: doctor.profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{doctor.avatar || 'DR'}</Text>
              )}
            </LinearGradient>

            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorDesignation}>{doctor.designation}</Text>
            <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
            <Text style={styles.doctorId}>Employee ID: {doctor.employeeId}</Text>

            <View style={[styles.statusBadge, doctor.isOnline && styles.statusOnline]}>
              <View style={[styles.statusDot, doctor.isOnline && styles.statusDotOnline]} />
              <Text style={[styles.statusText, doctor.isOnline && styles.statusTextOnline]}>
                {doctor.isOnline ? 'On Duty' : 'Off Duty'}
              </Text>
            </View>
          </View>

          {/* ─── 2. PROFESSIONAL INFORMATION ──────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            <View style={[styles.infoCard, SHADOWS.small]}>
              <InfoItem icon="medkit-outline" label="Designation" value={doctor.designation} />
              <InfoItem icon="school-outline" label="Qualification" value={doctor.qualification} />
              <InfoItem icon="briefcase-outline" label="Experience" value={doctor.experience} />
              <InfoItem icon="id-card-outline" label="PMDC Registration No." value={doctor.pmdcRegistration} />
            </View>
          </View>

          {/* ─── 3. DEPARTMENT & DUTY INFORMATION ────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Department & Duty</Text>
            <View style={[styles.infoCard, SHADOWS.small]}>
              <InfoItem icon="business-outline" label="Hospital" value={doctor.hospital} />
              <InfoItem icon="people-outline" label="Department" value={doctor.department} />
              <InfoItem icon="location-outline" label="Room" value={doctor.room} />
              <InfoItem icon="time-outline" label="Working Hours" value={doctor.workingHours} />
              <InfoItem 
                icon="toggle-outline" 
                label="Current Status" 
                value={doctor.isOnline ? 'On Duty' : 'Off Duty'}
                valueColor={doctor.isOnline ? COLORS.success : COLORS.textLight}
              />
            </View>
          </View>

          {/* ─── 4. TODAY'S PERFORMANCE ───────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Performance</Text>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, SHADOWS.small]}>
                <Text style={styles.statNumber}>{doctor.patientsAssigned}</Text>
                <Text style={styles.statLabel}>Assigned</Text>
              </View>
              <View style={[styles.statCard, SHADOWS.small]}>
                <Text style={[styles.statNumber, { color: COLORS.success }]}>{doctor.patientsCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={[styles.statCard, SHADOWS.small]}>
                <Text style={[styles.statNumber, { color: COLORS.warning }]}>{doctor.patientsRemaining}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
              <View style={[styles.statCard, SHADOWS.small]}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>{doctor.avgConsultation}</Text>
                <Text style={styles.statLabel}>Avg Time</Text>
              </View>
            </View>
          </View>

          {/* ─── FOOTER ────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Capital Hospital CDA</Text>
            <Text style={styles.footerSub}>SehatLine v2.0.1</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ── Info Item Component ──────────────────────────────────────────────
const InfoItem = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={wp(4)} color={COLORS.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
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

  // ── Header ────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '20',
  },
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  headerLogo: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: wp(4.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  editBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  editBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    gap: wp(1),
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },

  // ── Section ──────────────────────────────────────────────────────
  section: {
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1),
  },

  // ─── 1. DOCTOR IDENTITY CARD ─────────────────────────────────────
  identityCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    padding: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  avatar: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
    ...SHADOWS.medium,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp(10),
  },
  avatarText: {
    fontSize: wp(7),
    fontWeight: '700',
    color: '#fff',
  },
  doctorName: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  doctorDesignation: {
    fontSize: wp(3.5),
    color: COLORS.primary,
    marginTop: hp(0.2),
    fontWeight: '500',
  },
  doctorHospital: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  doctorId: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    backgroundColor: COLORS.backgroundSecondary,
    gap: wp(1.5),
    marginTop: hp(1),
  },
  statusOnline: {
    backgroundColor: COLORS.success + '15',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  statusDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: COLORS.textLight,
  },
  statusDotOnline: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusTextOnline: {
    color: COLORS.success,
  },

  // ─── INFO CARD ─────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(0.1),
  },

  // ─── STATS ─────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: wp(2),
  },
  statCard: {
    width: (width - wp(8) - wp(6)) / 4,
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },

  // ─── FOOTER ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: hp(3),
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: wp(4),
  },
  footerText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerSub: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },
});

export default DoctorProfileScreen;