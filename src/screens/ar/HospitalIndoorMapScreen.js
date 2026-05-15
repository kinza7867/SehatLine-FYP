import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const HospitalIndoorMapScreen = ({ navigation }) => {
  const departments = [
    { name: "Cardiology", floor: "2nd Floor", color: "#EF4444", distance: "45m" },
    { name: "General Medicine", floor: "Ground Floor", color: "#10B981", distance: "120m" },
    { name: "Pediatrics", floor: "1st Floor", color: "#F59E0B", distance: "80m" },
    { name: "Orthopedics", floor: "3rd Floor", color: "#00D4FF", distance: "200m" },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Hospital Indoor Map" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>PIMS Hospital - Indoor Map</Text>
          
          {/* Simulated Map */}
          <View style={styles.simulatedMap}>
            <View style={styles.mapLegend}>
              <Text style={styles.youAreHere}>You are here (Entrance)</Text>
            </View>
            
            {departments.map((dept, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.departmentPin}
                onPress={() => navigation.navigate('ARHospitalNavigation', { location: dept.name })}
              >
                <View style={[styles.pinDot, { backgroundColor: dept.color }]} />
                <Text style={styles.deptName}>{dept.name}</Text>
                <Text style={styles.floorInfo}>{dept.floor} • {dept.distance}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Navigation</Text>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('QRScannerForAR')}
        >
          <Ionicons name="qr-code" size={28} color="#fff" />
          <Text style={styles.scanButtonText}>Scan QR Code to Start AR Navigation</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 5,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 20,
  },
  simulatedMap: {
    height: 320,
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLegend: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
  },
  youAreHere: { fontSize: 13, color: '#1E3A8A', fontWeight: '600' },
  departmentPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#fff',
  },
  deptName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#1E3A8A',
    marginTop: 4 
  },
  floorInfo: { fontSize: 12, color: '#64748B' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#1E3A8A',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default HospitalIndoorMapScreen;