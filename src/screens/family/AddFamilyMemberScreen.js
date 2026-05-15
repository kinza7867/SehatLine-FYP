import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const AddFamilyMemberScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');

  const handleAddMember = () => {
    if (!name || !relation || !age) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    Alert.alert(
      "Success",
      `${name} has been added to your family health hub`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Add Family Member" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="person-add" size={80} color="#00D4FF" style={styles.icon} />

        <Text style={styles.title}>Add New Family Member</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Relation (e.g. Son, Mother, Wife)"
          value={relation}
          onChangeText={setRelation}
        />

        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female', 'Other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderButton, gender === g && styles.selectedGender]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderText, gender === g && styles.selectedGenderText]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
          <Text style={styles.addButtonText}>Add to Family Hub</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 25, alignItems: 'center' },
  icon: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 30 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: { alignSelf: 'flex-start', fontSize: 16, color: '#64748B', marginBottom: 10 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  genderButton: {
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

export default AddFamilyMemberScreen;