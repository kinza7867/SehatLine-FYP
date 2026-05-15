import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


const CallNextPatientScreen = ({ navigation }) => {
  const [currentPatient, setCurrentPatient] = useState({
    token: "P-089",
    name: "Fatima Bibi",
    age: 67,
    type: "New Patient",
    priority: true,
    symptoms: "Severe chest pain, shortness of breath"
  });

  const [isCalling, setIsCalling] = useState(false);

  const callPatient = () => {
    setIsCalling(true);
    
    setTimeout(() => {
      Alert.alert(
        "✅ Patient Called",
        `Now calling ${currentPatient.name} (${currentPatient.token})`,
        [
          { 
            text: "Mark as Consulted", 
            onPress: () => {
              setIsCalling(false);
              Alert.alert("Consultation Completed", "Patient moved to post-consultation.");
              navigation.navigate('AIPostConsultationScreen');
            }
          },
          { text: "Cancel Call", onPress: () => setIsCalling(false) }
        ]
      );
    }, 800);
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Call Next Patient" navigation={navigation} />

      <View style={styles.content}>
        <View style={styles.callingCard}>
          <Ionicons name="person" size={90} color="#1E3A8A" />
          
          <Text style={styles.token}>{currentPatient.token}</Text>
          <Text style={styles.patientName}>{currentPatient.name}</Text>
          <Text style={styles.age}>Age: {currentPatient.age} • {currentPatient.type}</Text>

          {currentPatient.priority && (
            <View style={styles.priorityBadge}>
              <Ionicons name="alert-circle" size={20} color="#fff" />
              <Text style={styles.priorityText}>CRITICAL PRIORITY</Text>
            </View>
          )}

          <Text style={styles.symptomsTitle}>Reported Symptoms:</Text>
          <Text style={styles.symptoms}>{currentPatient.symptoms}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.callButton, isCalling && styles.callingActive]}
          onPress={callPatient}
          disabled={isCalling}
        >
          <Ionicons name={isCalling ? "volume-high" : "call"} size={32} color="#fff" />
          <Text style={styles.callButtonText}>
            {isCalling ? "Calling Patient..." : "Call Next Patient"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => navigation.navigate('RealTimeQueueScreen')}
        >
          <Text style={styles.skipText}>Skip & View Full Queue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 25, alignItems: 'center', justifyContent: 'center' },
  callingCard: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    marginBottom: 40,
  },
  token: { 
    fontSize: 48, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    marginTop: 15 
  },
  patientName: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    marginTop: 8 
  },
  age: { 
    fontSize: 17, 
    color: '#64748B', 
    marginTop: 6 
  },
  priorityBadge: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    marginTop: 15,
    alignItems: 'center',
  },
  priorityText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  symptomsTitle: { 
    marginTop: 25, 
    fontSize: 16, 
    color: '#64748B', 
    fontWeight: '600' 
  },
  symptoms: { 
    fontSize: 16, 
    color: '#334155', 
    textAlign: 'center', 
    marginTop: 8, 
    lineHeight: 24 
  },
  callButton: {
    backgroundColor: '#EF4444',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  callingActive: { backgroundColor: '#10B981' },
  callButtonText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 12 
  },
  skipButton: {
    marginTop: 20,
    padding: 15,
  },
  skipText: { 
    color: '#64748B', 
    fontSize: 17, 
    fontWeight: '600' 
  },
});

export default CallNextPatientScreen;