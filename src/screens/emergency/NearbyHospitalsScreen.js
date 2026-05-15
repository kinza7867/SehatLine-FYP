import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const NearbyHospitalsScreen = ({ navigation }) => {
  const hospitals = [
    { id: '1', name: "PIMS Hospital", distance: "1.2 km", time: "4 min", rating: "4.7" },
    { id: '2', name: "Holy Family Hospital", distance: "2.8 km", time: "9 min", rating: "4.5" },
    { id: '3', name: "Benazir Bhutto Hospital", distance: "4.1 km", time: "12 min", rating: "4.3" },
    { id: '4', name: "Ali Medical Center", distance: "5.6 km", time: "15 min", rating: "4.6" },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Nearby Hospitals" navigation={navigation} />

      <FlatList
        data={hospitals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.hospitalCard}>
            <View style={styles.info}>
              <Text style={styles.hospitalName}>{item.name}</Text>
              <Text style={styles.distance}>{item.distance} • {item.time}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.rating}>★ {item.rating}</Text>
              <TouchableOpacity 
                style={styles.navigateBtn}
                onPress={() => alert(`Navigating to ${item.name}`)}
              >
                <Ionicons name="navigate" size={24} color="#00D4FF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  hospitalCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 4,
  },
  info: { flex: 1 },
  hospitalName: { fontSize: 19, fontWeight: 'bold', color: '#1E3A8A' },
  distance: { fontSize: 15, color: '#64748B', marginTop: 6 },
  right: { alignItems: 'flex-end' },
  rating: { color: '#F59E0B', fontWeight: '600', marginBottom: 10 },
  navigateBtn: { padding: 8 },
});

export default NearbyHospitalsScreen;