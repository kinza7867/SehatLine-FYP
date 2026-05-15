import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const PatientListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  
  const [patients] = useState([
    { id: '1', name: 'Ahmed Khan', age: 34, gender: 'Male', phone: '0300-1234567', lastVisit: '12 Mar 2026' },
    { id: '2', name: 'Fatima Bibi', age: 67, gender: 'Female', phone: '0312-9876543', lastVisit: '10 Mar 2026' },
    { id: '3', name: 'Ayesha Malik', age: 28, gender: 'Female', phone: '0333-5556677', lastVisit: '05 Mar 2026' },
    { id: '4', name: 'Bilal Ahmed', age: 45, gender: 'Male', phone: '0345-1122334', lastVisit: '01 Mar 2026' },
  ]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="My Patients" navigation={navigation} />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients by name..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.patientCard}
            onPress={() => navigation.navigate('PatientProfileScreen', { patient: item })}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color="#1E3A8A" />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.details}>
                {item.age} years • {item.gender}
              </Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.lastVisit}>Last Visit</Text>
              <Text style={styles.date}>{item.lastVisit}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPatientScreen')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Patient</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  patientCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#E0F2FE',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  info: { flex: 1 },
  name: { fontSize: 19, fontWeight: 'bold', color: '#1E3A8A' },
  details: { fontSize: 15, color: '#64748B', marginVertical: 4 },
  phone: { fontSize: 14, color: '#334155' },
  rightSection: { alignItems: 'flex-end' },
  lastVisit: { fontSize: 12, color: '#94A3B8' },
  date: { fontSize: 14, fontWeight: '600', color: '#1E3A8A' },
  addButton: {
    backgroundColor: '#00D4FF',
    margin: 15,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default PatientListScreen;