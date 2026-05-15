import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const AmbulanceTrackingScreen = ({ navigation }) => {
  const [eta, setEta] = useState(7);

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => (prev > 1 ? prev - 1 : 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader title="Ambulance Tracking" navigation={navigation} />

      <View style={styles.mapArea}>
        <View style={styles.mapSimulation}>
          <Ionicons name="car-sport" size={90} color="#EF4444" />
          <Text style={styles.ambulanceText}>Ambulance is on the way</Text>
          <Text style={styles.etaText}>ETA: {eta} minutes</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Ambulance Details</Text>
        <Text style={styles.detail}>Ambulance ID: <Text style={styles.bold}>AMB-7842</Text></Text>
        <Text style={styles.detail}>Driver: <Text style={styles.bold}>Mr. Rashid Khan</Text></Text>
        <Text style={styles.detail}>Contact: <Text style={styles.bold}>0300-9876543</Text></Text>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel Request</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  mapArea: { flex: 1, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center' },
  mapSimulation: { alignItems: 'center' },
  ambulanceText: { color: '#fff', fontSize: 22, marginTop: 20, fontWeight: '600' },
  etaText: { color: '#00D4FF', fontSize: 28, fontWeight: 'bold', marginTop: 10 },
  infoCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 20,
    elevation: 6,
  },
  infoTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 15 },
  detail: { fontSize: 16, color: '#334155', marginVertical: 6 },
  bold: { fontWeight: '600', color: '#1E3A8A' },
  cancelButton: {
    backgroundColor: '#EF4444',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AmbulanceTrackingScreen;