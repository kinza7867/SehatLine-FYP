import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const AddPatientScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleAddPatient = () => {
    if (!name || !age || !phone) {
      Alert.alert("Error", "Name, Age and Phone are required");
      return;
    }

    Alert.alert(
      "Success",
      `${name} has been added successfully as a patient.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Add New Patient" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="person-add-outline" size={80} color="#00D4FF" style={styles.icon} />

        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Age *"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Phone *"
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

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddPatient}>
          <Text style={styles.addButtonText}>Add Patient</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 25, alignItems: 'center' },
  icon: { marginBottom: 20 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: { flexDirection: 'row', width: '100%' },
  label: { alignSelf: 'flex-start', fontSize: 16, color: '#64748B', marginBottom: 10, marginTop: 10 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
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
  addButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
});

export default AddPatientScreen;