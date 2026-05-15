import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const RealTimeQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([
    { id: '1', token: 'P-089', name: 'Fatima Bibi', type: 'New', priority: true, status: 'Waiting' },
    { id: '2', token: 'A-045', name: 'Ahmed Khan', type: 'Follow-up', priority: false, status: 'Waiting' },
    { id: '3', token: 'P-090', name: 'Bilal Ahmed', type: 'New', priority: false, status: 'Waiting' },
  ]);

  const callNextPatient = (patient) => {
    Alert.alert(
      "Calling Patient",
      `Calling ${patient.name} (${patient.token})`,
      [{ text: "OK", onPress: () => {
        // Move to called
        setQueue(queue.map(p => p.id === patient.id ? {...p, status: 'Called'} : p));
      }}]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Real-Time Patient Queue" navigation={navigation} />

      <View style={styles.headerInfo}>
        <Text style={styles.department}>Cardiology • PIMS Hospital</Text>
        <Text style={styles.doctorName}>Dr. Sara Malik</Text>
      </View>

      <FlatList
        data={queue}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.queueCard, item.priority && styles.priorityCard]}>
            <View style={styles.tokenSection}>
              <Text style={styles.token}>{item.token}</Text>
              <Text style={styles.patientName}>{item.name}</Text>
            </View>
            
            <View style={styles.rightSection}>
              <Text style={styles.type}>{item.type}</Text>
              {item.priority && <Ionicons name="alert-circle" size={26} color="#EF4444" />}
            </View>

            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => callNextPatient(item)}
            >
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerInfo: { 
    backgroundColor: '#1E3A8A', 
    padding: 20, 
    alignItems: 'center' 
  },
  department: { color: '#fff', fontSize: 18, fontWeight: '600' },
  doctorName: { color: '#00D4FF', fontSize: 16, marginTop: 5 },
  queueCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  priorityCard: { borderLeftWidth: 6, borderLeftColor: '#EF4444' },
  tokenSection: { flex: 1 },
  token: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  patientName: { fontSize: 17, color: '#334155', marginTop: 4 },
  rightSection: { alignItems: 'center', marginRight: 15 },
  type: { fontSize: 15, color: '#10B981', fontWeight: '600' },
  callButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callText: { color: '#fff', fontWeight: 'bold' },
});

export default RealTimeQueueScreen;