import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const DoctorDetailScreen = ({ navigation, route }) => {
  const doctor = route.params?.doctor || {
    name: "Dr. Sara Malik",
    specialty: "Cardiology",
    experience: "12 years",
    rating: "4.8",
    patients: "1240",
    about: "Specialist in interventional cardiology with expertise in heart failure and coronary artery disease.",
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Doctor Profile" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={70} color="#1E3A8A" />
          </View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{doctor.experience}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{doctor.rating} ★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{doctor.patients}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About Doctor</Text>
        <Text style={styles.aboutText}>{doctor.about}</Text>

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookAppointmentScreen')}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.reviewButton}
          onPress={() => navigation.navigate('DoctorReviewsScreen')}
        >
          <Text style={styles.reviewButtonText}>See Patient Reviews</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 120,
    height: 120,
    backgroundColor: '#E0F2FE',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  doctorName: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  specialty: { fontSize: 18, color: '#00D4FF', marginTop: 5 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    elevation: 4,
  },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
  statLabel: { fontSize: 13, color: '#64748B' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1E3A8A', marginBottom: 12 },
  aboutText: { fontSize: 16, lineHeight: 26, color: '#334155', marginBottom: 30 },
  bookButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  bookButtonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
  reviewButton: {
    padding: 16,
    alignItems: 'center',
  },
  reviewButtonText: { color: '#00D4FF', fontSize: 17, fontWeight: '600' },
});

export default DoctorDetailScreen;