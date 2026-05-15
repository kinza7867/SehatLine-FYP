import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock Data for your Defense
const APPOINTMENTS = [
  { id: '1', doctor: 'Dr. Sarah Ahmed', specialty: 'Cardiology', date: 'Oct 24, 2023', time: '10:30 AM', status: 'Confirmed' },
  { id: '2', doctor: 'Dr. John Smith', specialty: 'Neurology', date: 'Oct 26, 2023', time: '02:15 PM', status: 'Pending' },
  { id: '3', doctor: 'Dr. Emily Blunt', specialty: 'Dermatology', date: 'Oct 20, 2023', time: '09:00 AM', status: 'Completed' },
  { id: '4', doctor: 'Dr. Zafar Iqbal', specialty: 'General Physician', date: 'Oct 28, 2023', time: '11:45 AM', status: 'Confirmed' },
];

const AppointmentListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#00EAFF';
      case 'Pending': return '#FFD700';
      case 'Completed': return '#4CAF50';
      default: return '#FFFFFF';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.cardWrapper}
      onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.doctorName}>{item.doctor}</Text>
            <Text style={styles.specialtyText}>{item.specialty}</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#00EAFF" />
            <Text style={styles.footerText}>{item.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#00EAFF" />
            <Text style={styles.footerText}>{item.time}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient to match Welcome/Login */}
      <LinearGradient colors={['#000033', '#000022']} style={StyleSheet.absoluteFill} />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#00EAFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BookAppointment')}>
          <Ionicons name="add-circle" size={32} color="#00EAFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by doctor or specialty..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={APPOINTMENTS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No appointments found.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000033' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 20 
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 234, 255, 0.1)',
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, color: '#FFF', fontSize: 15 },

  listPadding: { paddingHorizontal: 20, paddingBottom: 100 },
  cardWrapper: { marginBottom: 15, borderRadius: 20, overflow: 'hidden' },
  card: { padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  doctorName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  specialtyText: { color: '#00EAFF', fontSize: 13, marginTop: 2, opacity: 0.8 },
  
  statusBadge: { 
    borderWidth: 1, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#FFF', fontSize: 13, marginLeft: 6, opacity: 0.7 },
  
  emptyText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 50 }
});

export default AppointmentListScreen;