import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const EmergencyPriorityScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Emergency Priority" navigation={navigation} />

      <View style={styles.content}>
        <View style={styles.emergencyHeader}>
          <Ionicons name="warning" size={50} color="#fff" />
          <Text style={styles.emergencyTitle}>EMERGENCY PRIORITY MODE</Text>
        </View>

        <Text style={styles.description}>
          This screen is used when a patient requires immediate medical attention. 
          AI has detected critical symptoms.
        </Text>

        <View style={styles.patientCard}>
          <Text style={styles.patientName}>Fatima Bibi</Text>
          <Text style={styles.patientDetail}>Age 67 • Token P-089</Text>
          <Text style={styles.severity}>Severity: CRITICAL</Text>
          <Text style={styles.symptoms}>Symptoms: Severe chest pain, difficulty breathing, dizziness</Text>
        </View>

        <TouchableOpacity 
          style={styles.activateButton}
          onPress={() => {
            Alert.alert(
              "🚨 Priority Activated",
              "Emergency alert sent to all doctors and staff.\nPatient moved to top of queue.",
              [{ text: "OK", onPress: () => navigation.navigate('LiveTokenQueueScreen') }]
            );
          }}
        >
          <Ionicons name="alert-circle" size={28} color="#fff" />
          <Text style={styles.activateText}>ACTIVATE EMERGENCY PRIORITY</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel Priority</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 25, alignItems: 'center' },
  emergencyHeader: {
    backgroundColor: '#EF4444',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  emergencyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  description: { 
    fontSize: 16, 
    color: '#64748B', 
    textAlign: 'center', 
    marginBottom: 35,
    lineHeight: 24 
  },
  patientCard: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 8,
    borderLeftWidth: 10,
    borderLeftColor: '#EF4444',
    marginBottom: 40,
  },
  patientName: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  patientDetail: { fontSize: 17, color: '#64748B', marginVertical: 8 },
  severity: { fontSize: 22, fontWeight: 'bold', color: '#EF4444', marginVertical: 12 },
  symptoms: { fontSize: 16, color: '#334155', textAlign: 'center', lineHeight: 26 },
  activateButton: {
    backgroundColor: '#EF4444',
    width: '100%',
    padding: 20,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  activateText: { color: '#fff', fontSize: 19, fontWeight: 'bold', marginLeft: 12 },
  cancelButton: {
    marginTop: 20,
    padding: 16,
  },
  cancelText: { color: '#64748B', fontSize: 17, fontWeight: '600' },
});

export default EmergencyPriorityScreen;