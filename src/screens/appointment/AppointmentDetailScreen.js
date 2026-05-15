import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomHeader from '../../components/CustomHeader';

const AppointmentDetailScreen = ({ navigation, route }) => {
  // In a real app, 'route.params' would carry the appointment data
  // For your defense, we will use professional placeholder data
  const appointment = {
    id: "SHL-99281",
    doctorName: "Dr. Sarah Ahmed",
    specialty: "Cardiologist",
    date: "Oct 24, 2023",
    time: "10:30 AM",
    status: "Confirmed",
    hospital: "SehatLine Central Hospital",
    tokenNo: "A-12"
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="APPOINTMENT DETAILS" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 🎫 Digital Token Card */}
        <View style={styles.tokenCard}>
          <View style={styles.tokenHeader}>
            <Text style={styles.tokenTitle}>VIRTUAL TOKEN</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{appointment.status}</Text>
            </View>
          </View>

          <Text style={styles.tokenNumber}>{appointment.tokenNo}</Text>
          <Text style={styles.tokenSubText}>Your Position in Queue</Text>
          
          <View style={styles.divider} />

          {/* QR Area Placeholder */}
          <View style={styles.qrContainer}>
            <Icon name="qrcode-scan" size={120} color="#000033" />
            <Text style={styles.qrDesc}>Scan at hospital desk for check-in</Text>
          </View>
        </View>

        {/* 🏥 Appointment Info */}
        <View style={styles.infoSection}>
          <DetailRow icon="account-tie" label="Doctor" value={appointment.doctorName} />
          <DetailRow icon="stethoscope" label="Specialty" value={appointment.specialty} />
          <DetailRow icon="calendar-clock" label="Date & Time" value={`${appointment.date} | ${appointment.time}`} />
          <DetailRow icon="hospital-building" label="Location" value={appointment.hospital} />
          <DetailRow icon="numeric" label="Appointment ID" value={appointment.id} />
        </View>

        {/* 🔘 Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.rescheduleBtn}
            onPress={() => navigation.navigate('Reschedule')}
          >
            <Text style={styles.rescheduleText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => alert('Cancellation Request Sent')}
          >
            <Text style={styles.cancelText}>Cancel Appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable component for the data rows
const DetailRow = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Icon name={icon} size={24} color="#00EAFF" style={styles.rowIcon} />
    <View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000033' },
  scrollContent: { padding: 20 },
  tokenCard: {
    backgroundColor: '#00EAFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 10,
  },
  tokenHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  tokenTitle: { fontWeight: '900', color: '#000033', letterSpacing: 1 },
  statusBadge: { backgroundColor: '#000033', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#00EAFF', fontSize: 10, fontWeight: 'bold' },
  tokenNumber: { fontSize: 60, fontWeight: '900', color: '#000033', marginTop: 10 },
  tokenSubText: { color: '#000033', opacity: 0.7, fontWeight: 'bold' },
  divider: { height: 1, width: '100%', backgroundColor: '#000033', marginVertical: 20, opacity: 0.2 },
  qrContainer: { alignItems: 'center' },
  qrDesc: { color: '#000033', fontSize: 11, marginTop: 10, fontWeight: '600' },
  infoSection: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rowIcon: { marginRight: 15 },
  rowLabel: { color: '#FFFFFF', opacity: 0.6, fontSize: 12 },
  rowValue: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  buttonContainer: { marginTop: 30 },
  rescheduleBtn: { 
    backgroundColor: '#00EAFF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  rescheduleText: { color: '#000033', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { 
    borderWidth: 1, 
    borderColor: '#FF4444', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  cancelText: { color: '#FF4444', fontWeight: 'bold' },
});

export default AppointmentDetailScreen;