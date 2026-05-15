import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState("Kinza Ahmed");
  const [email, setEmail] = useState("kinza.ahmed@example.com");
  const [phone, setPhone] = useState("+92 300 1234567");
  const [age, setAge] = useState("24");
  const [bloodGroup, setBloodGroup] = useState("B+");

  const handleSave = () => {
    Alert.alert(
      "Profile Updated",
      "Your profile has been successfully updated.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Edit Profile" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Ionicons name="person-circle" size={110} color="#1E3A8A" />
          <TouchableOpacity style={styles.changePhoto}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
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
            placeholder="Blood Group"
            value={bloodGroup}
            onChangeText={setBloodGroup}
          />
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
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  changePhoto: { marginTop: 10 },
  changePhotoText: { color: '#00D4FF', fontSize: 16, fontWeight: '600' },
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
  saveButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 25,
  },
  saveButtonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
});

export default EditProfileScreen;