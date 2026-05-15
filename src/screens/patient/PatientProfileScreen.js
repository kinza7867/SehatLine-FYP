import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const PatientProfileScreen = ({ navigation, route }) => {
  const patient = route.params?.patient || {
    name: 'Fatima Bibi',
    age: 67,
    gender: 'Female',
    phone: '0312-9876543',
    lastVisit: '10 Mar 2026',
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Patient Profile" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={70} color="#1E3A8A" />
          </View>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.details}>
            {patient.age} years • {patient.gender}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={22} color="#64748B" />
            <Text style={styles.infoText}>{patient.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={22} color="#64748B" />
            <Text style={styles.infoText}>Last Visit: {patient.lastVisit}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditPatientScreen', { patient })}
        >
          <Ionicons name="create-outline" size={24} color="#00D4FF" />
          <Text style={styles.actionText}>Edit Patient Information</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('BookAppointmentScreen')}
        >
          <Ionicons name="calendar-outline" size={24} color="#00D4FF" />
          <Text style={styles.actionText}>Book New Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text-outline" size={24} color="#00D4FF" />
          <Text style={styles.actionText}>View Medical History</Text>
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
    width: 110,
    height: 110,
    backgroundColor: '#E0F2FE',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  details: { fontSize: 18, color: '#64748B' },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoText: { marginLeft: 15, fontSize: 16, color: '#334155' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1E3A8A', marginBottom: 15 },
  actionButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  actionText: { marginLeft: 15, fontSize: 17, color: '#1E3A8A', fontWeight: '600' },
});

export default PatientProfileScreen;