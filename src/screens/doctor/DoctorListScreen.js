import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const DoctorListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [doctors] = useState([
    { id: '1', name: "Dr. Sara Malik", specialty: "Cardiology", rating: "4.8", available: true },
    { id: '2', name: "Dr. Ahmed Khan", specialty: "General Medicine", rating: "4.6", available: true },
    { id: '3', name: "Dr. Fatima Noor", specialty: "Pediatrics", rating: "4.9", available: false },
    { id: '4', name: "Dr. Hassan Raza", specialty: "Orthopedics", rating: "4.7", available: true },
  ]);

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const renderDoctor = ({ item }) => (
    <TouchableOpacity 
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorDetailScreen', { doctor: item })}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={40} color="#1E3A8A" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        <Text style={styles.rating}>★ {item.rating}</Text>
      </View>
      <View style={[styles.availabilityDot, { backgroundColor: item.available ? '#10B981' : '#EF4444' }]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Find Doctors" navigation={navigation} />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or specialty"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredDoctors}
        keyExtractor={item => item.id}
        renderItem={renderDoctor}
        contentContainerStyle={styles.list}
      />
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
  searchInput: { flex: 1, height: 50, marginLeft: 10, fontSize: 16 },
  list: { paddingBottom: 20 },
  doctorCard: {
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
    width: 65,
    height: 65,
    backgroundColor: '#E0F2FE',
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  info: { flex: 1 },
  name: { fontSize: 19, fontWeight: 'bold', color: '#1E3A8A' },
  specialty: { fontSize: 15, color: '#64748B' },
  rating: { fontSize: 16, color: '#F59E0B', marginTop: 4 },
  availabilityDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

export default DoctorListScreen;