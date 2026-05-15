import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../components/CustomHeader';

const RealTimeQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([
    { id: '1', token: 'P-089', name: 'Fatima Bibi', type: 'New', priority: true, status: 'Waiting' },
    { id: '2', token: 'A-045', name: 'Ahmed Khan', type: 'Follow-up', priority: false, status: 'Waiting' },
    { id: '3', token: 'P-090', name: 'Bilal Ahmed', type: 'New', priority: false, status: 'Waiting' },
  ]);

  const callPatient = (patient) => {
    Alert.alert(
      "Calling Patient",
      `Calling ${patient.name} (${patient.token})`,
      [
        { 
          text: "Mark as Done", 
          onPress: () => {
            setQueue(prev => prev.filter(p => p.id !== patient.id));
          }
        },
        { text: "Cancel" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Real-Time Queue" navigation={navigation} />

      <View style={styles.header}>
        <Text style={styles.department}>Cardiology • PIMS Hospital</Text>
        <Text style={styles.doctor}>Dr. Sara Malik</Text>
      </View>

      <FlatList
        data={queue}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.queueItem, item.priority && styles.priorityItem]}>
            <View style={styles.left}>
              <Text style={styles.token}>{item.token}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{item.type}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.callBtn}
              onPress={() => callPatient(item)}
            >
              <Ionicons name="call" size={24} color="#fff" />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1E3A8A', padding: 20, alignItems: 'center' },
  department: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  doctor: { color: '#00D4FF', marginTop: 6 },
  queueItem: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  priorityItem: { borderLeftWidth: 6, borderLeftColor: '#EF4444' },
  left: { flex: 1 },
  token: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  name: { fontSize: 18, color: '#334155', marginVertical: 4 },
  type: { fontSize: 15, color: '#64748B' },
  callBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
});

export default RealTimeQueueScreen;