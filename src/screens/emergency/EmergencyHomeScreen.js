import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const EmergencyHomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Emergency Services" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Need Help Right Now?</Text>

        {/* Big SOS Button */}
        <TouchableOpacity 
          style={styles.sosButton}
          onPress={() => navigation.navigate('SOSScreen')}
        >
          <Ionicons name="warning" size={70} color="#fff" />
          <Text style={styles.sosText}>SOS - EMERGENCY</Text>
          <Text style={styles.sosSubtext}>Tap for immediate help</Text>
        </TouchableOpacity>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('NearbyHospitalsScreen')}
          >
            <Ionicons name="location" size={40} color="#00D4FF" />
            <Text style={styles.optionTitle}>Nearby Hospitals</Text>
            <Text style={styles.optionDesc}>Find hospitals near you</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('AmbulanceTrackingScreen')}
          >
            <Ionicons name="car" size={40} color="#00D4FF" />
            <Text style={styles.optionTitle}>Track Ambulance</Text>
            <Text style={styles.optionDesc}>Live ambulance tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('AISymptomCheckerScreen')}
          >
            <Ionicons name="medkit" size={40} color="#00D4FF" />
            <Text style={styles.optionTitle}>AI Triage</Text>
            <Text style={styles.optionDesc}>Quick symptom assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('PriorityTokenAlertScreen')}
          >
            <Ionicons name="alert-circle" size={40} color="#EF4444" />
            <Text style={styles.optionTitle}>Priority Token</Text>
            <Text style={styles.optionDesc}>Get emergency token</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 30, textAlign: 'center' },
  sosButton: {
    backgroundColor: '#EF4444',
    width: '100%',
    height: 180,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
    elevation: 10,
  },
  sosText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 10 },
  sosSubtext: { color: '#fff', fontSize: 16, marginTop: 5, opacity: 0.9 },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
  },
  optionTitle: { fontSize: 17, fontWeight: '600', color: '#1E3A8A', marginTop: 12, textAlign: 'center' },
  optionDesc: { fontSize: 13, color: '#64748B', marginTop: 6, textAlign: 'center' },
});

export default EmergencyHomeScreen;