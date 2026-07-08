// src/screens/doctor/DoctorProfileScreen.js
import React from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const DoctorProfileScreen = ({ navigation }) => {
  const doctor = {
    name: 'Dr. Ahmed Hassan',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology',
    hospital: 'SehatLine Hospital, Islamabad',
    email: 'dr.ahmed@sehatline.com',
    phone: '+92 321 1234567',
    experience: '12 years',
    patientsHandled: 2847,
    rating: 4.9,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary || '#1a73e8', COLORS.secondary || '#0d47a1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={wp(5)} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={['#FF6B6B', '#E63946']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>AH</Text>
            </LinearGradient>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.doctorDepartment}>{doctor.department}</Text>
          </View>

          <View style={[styles.infoCard, SHADOWS?.medium || {}]}>
            <InfoItem icon="business-outline" label="Hospital" value={doctor.hospital} />
            <InfoItem icon="mail-outline" label="Email" value={doctor.email} />
            <InfoItem icon="call-outline" label="Phone" value={doctor.phone} />
            <InfoItem icon="briefcase-outline" label="Experience" value={doctor.experience} />
            <InfoItem icon="people-outline" label="Patients Handled" value={doctor.patientsHandled.toString()} />
            <InfoItem icon="star-outline" label="Rating" value={doctor.rating.toString()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={wp(4.5)} color={COLORS.primary || '#1a73e8'} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f7fa',
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#fff',
  },
  editBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: wp(4),
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  avatar: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  avatarText: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.text || '#1a1a1a',
  },
  doctorSpecialty: {
    fontSize: wp(3.5),
    color: COLORS.primary || '#1a73e8',
    marginTop: hp(0.2),
  },
  doctorDepartment: {
    fontSize: wp(3),
    color: COLORS.textSecondary || '#666',
    marginTop: hp(0.1),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#e0e0e0',
  },
  infoIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15' || '#1a73e815',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: wp(2.6),
    color: COLORS.textLight || '#999',
  },
  infoValue: {
    fontSize: wp(3.2),
    fontWeight: '500',
    color: COLORS.text || '#1a1a1a',
  },
});

export default DoctorProfileScreen;