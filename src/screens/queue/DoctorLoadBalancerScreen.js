import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const DoctorLoadBalancerScreen = ({ navigation }) => {
  const [doctors] = useState([
    { id: '1', name: 'Dr. Sara Malik', specialty: 'Cardiology', load: 85, patients: 12, status: 'Overloaded' },
    { id: '2', name: 'Dr. Ahmed Khan', specialty: 'Cardiology', load: 45, patients: 6, status: 'Available' },
    { id: '3', name: 'Dr. Fatima Noor', specialty: 'Cardiology', load: 65, patients: 9, status: 'Moderate' },
  ]);

  const rebalance = (doctorId) => {
    Alert.alert(
      "AI Load Balancing",
      "Patient has been automatically reassigned to a less loaded doctor.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="AI Doctor Load Balancer" navigation={navigation} />

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Current Department Load</Text>
        <Text style={styles.infoSubtitle}>Cardiology • 27 patients waiting</Text>
      </View>

      <ScrollView>
        {doctors.map((doctor) => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorInfo}>
              <Ionicons name="person" size={40} color="#1E3A8A" />
              <View style={styles.details}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.specialty}>{doctor.specialty}</Text>
                <Text style={styles.patients}>{doctor.patients} patients today</Text>
              </View>
            </View>

            <View style={styles.loadSection}>
              <Text style={styles.loadLabel}>Load</Text>
              <Text style={[styles.loadValue, 
                doctor.load > 80 ? styles.highLoad : 
                doctor.load > 60 ? styles.mediumLoad : styles.lowLoad]}>
                {doctor.load}%
              </Text>
              <Text style={styles.status}>{doctor.status}</Text>
            </View>

            {doctor.load > 70 && (
              <TouchableOpacity 
                style={styles.rebalanceButton}
                onPress={() => rebalance(doctor.id)}
              >
                <Text style={styles.rebalanceText}>Rebalance Patients</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  infoBox: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    alignItems: 'center',
  },
  infoTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  infoSubtitle: { color: '#00D4FF', marginTop: 5 },
  doctorCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  doctorInfo: { flexDirection: 'row', marginBottom: 15 },
  details: { marginLeft: 15, flex: 1 },
  doctorName: { fontSize: 19, fontWeight: 'bold', color: '#1E3A8A' },
  specialty: { fontSize: 15, color: '#64748B' },
  patients: { fontSize: 14, color: '#10B981', marginTop: 4 },
  loadSection: { alignItems: 'center' },
  loadLabel: { fontSize: 14, color: '#64748B' },
  loadValue: { fontSize: 32, fontWeight: 'bold' },
  highLoad: { color: '#EF4444' },
  mediumLoad: { color: '#F59E0B' },
  lowLoad: { color: '#10B981' },
  status: { fontSize: 15, fontWeight: '600', marginTop: 5 },
  rebalanceButton: {
    backgroundColor: '#00D4FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  rebalanceText: { color: '#fff', fontWeight: 'bold' },
});

export default DoctorLoadBalancerScreen;