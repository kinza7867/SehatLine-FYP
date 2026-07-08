// src/screens/doctor/DoctorAvailabilityScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const DoctorAvailabilityScreen = ({ navigation }) => {
  const [availability, setAvailability] = useState([
    { day: 'Monday', start: '09:00', end: '17:00', available: true },
    { day: 'Tuesday', start: '09:00', end: '17:00', available: true },
    { day: 'Wednesday', start: '09:00', end: '17:00', available: true },
    { day: 'Thursday', start: '09:00', end: '17:00', available: true },
    { day: 'Friday', start: '09:00', end: '13:00', available: true },
    { day: 'Saturday', start: '--:--', end: '--:--', available: false },
    { day: 'Sunday', start: '--:--', end: '--:--', available: false },
  ]);

  const toggleAvailability = (index) => {
    const updated = [...availability];
    updated[index].available = !updated[index].available;
    setAvailability(updated);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary || '#1a73e8', COLORS.secondary || '#0d47a1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Availability</Text>
          <TouchableOpacity>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, SHADOWS?.medium || {}]}>
            <Text style={styles.infoText}>
              Set your working hours. Patients can book appointments during available hours.
            </Text>
          </View>

          {availability.map((item, index) => (
            <View key={item.day} style={[styles.availabilityItem, SHADOWS?.small || {}]}>
              <View style={styles.availabilityLeft}>
                <Text style={[styles.dayText, !item.available && styles.dayTextDisabled]}>
                  {item.day}
                </Text>
                {item.available ? (
                  <Text style={styles.timeText}>{item.start} - {item.end}</Text>
                ) : (
                  <Text style={styles.unavailableText}>Unavailable</Text>
                )}
              </View>
              <Switch
                value={item.available}
                onValueChange={() => toggleAvailability(index)}
                trackColor={{ false: COLORS.border || '#e0e0e0', true: COLORS.primary || '#1a73e8' }}
              />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f7fa',
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#fff',
  },
  saveText: {
    fontSize: wp(3),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: wp(4),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  infoText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary || '#666',
    textAlign: 'center',
  },
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3.5),
    marginBottom: hp(0.8),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  availabilityLeft: {
    flex: 1,
  },
  dayText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text || '#1a1a1a',
  },
  dayTextDisabled: {
    color: COLORS.textLight || '#999',
  },
  timeText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary || '#666',
    marginTop: hp(0.1),
  },
  unavailableText: {
    fontSize: wp(2.8),
    color: COLORS.textLight || '#999',
    marginTop: hp(0.1),
    fontStyle: 'italic',
  },
});

export default DoctorAvailabilityScreen;