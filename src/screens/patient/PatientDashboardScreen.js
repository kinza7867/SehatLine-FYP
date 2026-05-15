import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const { width } = Dimensions.get('window');

const PatientDashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Patient Dashboard" navigation={navigation} showBack={false} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Assalam-o-Alaikum, Kinza 👋</Text>
          <Text style={styles.welcomeText}>Here's your health overview</Text>
        </View>

        {/* Quick Health Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={32} color="#EF4444" />
            <Text style={styles.statValue}>98</Text>
            <Text style={styles.statLabel}>BPM</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="thermometer" size={32} color="#F59E0B" />
            <Text style={styles.statValue}>98.6</Text>
            <Text style={styles.statLabel}>°F</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water" size={32} color="#00D4FF" />
            <Text style={styles.statValue}>120/80</Text>
            <Text style={styles.statLabel}>BP</Text>
          </View>
        </View>

        {/* Next Appointment */}
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <TouchableOpacity 
          style={styles.appointmentCard}
          onPress={() => navigation.navigate('AppointmentDetailScreen')}
        >
          <View style={styles.appointmentLeft}>
            <Text style={styles.time}>11:30 AM</Text>
            <Text style={styles.token}>Token: A-034</Text>
          </View>
          <View style={styles.appointmentRight}>
            <Text style={styles.doctor}>Dr. Sara Malik</Text>
            <Text style={styles.department}>Cardiology • PIMS Hospital</Text>
            <Text style={styles.type}>Follow-up Appointment</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Access Buttons */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={styles.quickCard}
            onPress={() => navigation.navigate('AISymptomCheckerScreen')}
          >
            <Ionicons name="medkit" size={36} color="#00D4FF" />
            <Text style={styles.quickTitle}>AI Symptom Checker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickCard}
            onPress={() => navigation.navigate('VoiceHealthAssistantScreen')}
          >
            <Ionicons name="mic" size={36} color="#EF4444" />
            <Text style={styles.quickTitle}>Voice Assistant</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickCard}
            onPress={() => navigation.navigate('PrescriptionScannerScreen')}
          >
            <Ionicons name="scan" size={36} color="#10B981" />
            <Text style={styles.quickTitle}>Scan Prescription</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickCard}
            onPress={() => navigation.navigate('LiveTokenQueueScreen')}
          >
            <Ionicons name="list" size={36} color="#F59E0B" />
            <Text style={styles.quickTitle}>Live Queue</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Ionicons name="pulse" size={24} color="#00D4FF" />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>AI Symptom Check</Text>
              <Text style={styles.activityDesc}>Chest pain analysis - Medium severity</Text>
            </View>
            <Text style={styles.activityTime}>Today</Text>
          </View>

          <View style={styles.activityItem}>
            <Ionicons name="calendar" size={24} color="#F59E0B" />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Appointment Booked</Text>
              <Text style={styles.activityDesc}>Follow-up with Dr. Sara Malik</Text>
            </View>
            <Text style={styles.activityTime}>Yesterday</Text>
          </View>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('SOSScreen')}
        >
          <Ionicons name="warning" size={28} color="#fff" />
          <Text style={styles.emergencyText}>EMERGENCY SOS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  welcomeSection: { marginBottom: 25 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  welcomeText: { fontSize: 17, color: '#64748B', marginTop: 4 },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 5,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 5,
  },
  statValue: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A', marginTop: 8 },
  statLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },

  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#1E3A8A', 
    marginBottom: 15 
  },

  appointmentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    flexDirection: 'row',
    marginBottom: 30,
    elevation: 5,
  },
  appointmentLeft: { flex: 1 },
  time: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  token: { fontSize: 16, color: '#00D4FF', marginTop: 4 },
  appointmentRight: { alignItems: 'flex-end' },
  doctor: { fontSize: 17, fontWeight: '600', color: '#1E3A8A' },
  department: { fontSize: 14, color: '#64748B', marginTop: 4 },
  type: { fontSize: 14, color: '#10B981', marginTop: 6 },

  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
  },
  quickTitle: { 
    marginTop: 12, 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1E3A8A', 
    textAlign: 'center' 
  },

  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 30,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityInfo: { flex: 1, marginLeft: 15 },
  activityTitle: { fontSize: 16, fontWeight: '600', color: '#1E3A8A' },
  activityDesc: { fontSize: 14, color: '#64748B', marginTop: 4 },
  activityTime: { fontSize: 13, color: '#94A3B8' },

  emergencyButton: {
    backgroundColor: '#EF4444',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  emergencyText: { 
    color: '#fff', 
    fontSize: 19, 
    fontWeight: 'bold', 
    marginLeft: 12 
  },
});

export default PatientDashboardScreen;