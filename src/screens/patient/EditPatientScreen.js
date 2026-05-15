import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const EditPatientScreen = ({ navigation, route }) => {
  const patient = route.params?.patient || {};
  
  const [name, setName] = useState(patient.name || '');
  const [age, setAge] = useState(patient.age?.toString() || '');
  const [phone, setPhone] = useState(patient.phone || '');
  const [gender, setGender] = useState(patient.gender || 'Male');

  const handleSave = () => {
    Alert.alert("Success", "Patient information updated successfully", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Edit Patient" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female', 'Other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.selectedGender]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderText, gender === g && styles.selectedGenderText]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 25 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: { flexDirection: 'row' },
  label: { fontSize: 16, color: '#64748B', marginBottom: 10, marginTop: 10 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  genderBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedGender: { backgroundColor: '#00D4FF', borderColor: '#00D4FF' },
  genderText: { fontSize: 16, color: '#64748B' },
  selectedGenderText: { color: '#fff', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
});

export default EditPatientScreen;