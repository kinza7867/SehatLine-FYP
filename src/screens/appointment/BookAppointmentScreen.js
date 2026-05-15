import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, SafeAreaView, Platform, Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const BookAppointmentScreen = ({ navigation }) => {
  const [specialty, setSpecialty] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState('');

  const specialties = ['Cardiology', 'Neurology', 'Dermatology', 'General Physician'];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleBooking = () => {
    if (!specialty || !doctor) {
      Alert.alert("Missing Info", "Please select a specialty and doctor.");
      return;
    }
    // Success Logic
    Alert.alert("Success!", "Your appointment request has been sent.", [
      { text: "View List", onPress: () => navigation.navigate('Appointments') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#000033', '#000022']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={30} color="#00EAFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Appointment</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* 1. Select Specialty */}
        <Text style={styles.label}>Select Specialty</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
          {specialties.map((item) => (
            <TouchableOpacity 
              key={item} 
              style={[styles.chip, specialty === item && styles.chipActive]}
              onPress={() => setSpecialty(item)}
            >
              <Text style={[styles.chipText, specialty === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 2. Form Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Doctor Name</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={20} color="#00EAFF" />
            <TextInput 
              style={styles.input} 
              placeholder="Start typing doctor name..." 
              placeholderTextColor="#666"
              value={doctor}
              onChangeText={setDoctor}
            />
          </View>

          <Text style={styles.label}>Date & Time</Text>
          <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#00EAFF" />
            <Text style={styles.dateValue}>{date.toDateString()} at {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Reason (Optional)</Text>
          <TextInput 
            style={[styles.inputBox, styles.textArea]} 
            placeholder="Describe your symptoms..." 
            placeholderTextColor="#666"
            multiline
            value={reason}
            onChangeText={setReason}
          />
        </View>

        {/* 3. Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleBooking}>
          <LinearGradient colors={['#00EAFF', '#0099AA']} style={styles.btnGradient}>
            <Text style={styles.btnText}>CONFIRM BOOKING</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000033' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  label: { color: '#00EAFF', fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 20 },
  specialtyScroll: { flexDirection: 'row', marginBottom: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(0, 234, 255, 0.2)' },
  chipActive: { backgroundColor: '#00EAFF', borderColor: '#00EAFF' },
  chipText: { color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' },
  chipTextActive: { color: '#000' },

  form: { marginTop: 10 },
  inputBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: 'rgba(0, 234, 255, 0.1)' 
  },
  input: { flex: 1, color: '#FFF', marginLeft: 10 },
  dateValue: { color: '#FFF', marginLeft: 10 },
  textArea: { height: 100, alignItems: 'flex-start', paddingTop: 15 },

  confirmBtn: { marginTop: 40, borderRadius: 15, overflow: 'hidden', elevation: 10 },
  btnGradient: { height: 60, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 }
});

export default BookAppointmentScreen;