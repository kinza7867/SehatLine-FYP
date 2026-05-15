import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const VitalsLoggerScreen = ({ navigation }) => {
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    sugarLevel: '',
    weight: '',
    notes: '',
  });

  const updateVital = (key, value) => {
    setVitals(prev => ({ ...prev, [key]: value }));
  };

  const saveVitals = () => {
    if (!vitals.bloodPressure || !vitals.heartRate) {
      Alert.alert("Required", "Blood Pressure and Heart Rate are required");
      return;
    }

    Alert.alert(
      "Vitals Logged Successfully",
      "Your health vitals have been recorded and saved.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Log Vitals" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Record Today's Vitals</Text>

        <View style={styles.vitalInput}>
          <Ionicons name="water" size={28} color="#EF4444" />
          <TextInput
            style={styles.input}
            placeholder="Blood Pressure (e.g. 120/80)"
            value={vitals.bloodPressure}
            onChangeText={(text) => updateVital('bloodPressure', text)}
            keyboardType="default"
          />
        </View>

        <View style={styles.vitalInput}>
          <Ionicons name="heart" size={28} color="#EF4444" />
          <TextInput
            style={styles.input}
            placeholder="Heart Rate (BPM)"
            value={vitals.heartRate}
            onChangeText={(text) => updateVital('heartRate', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.vitalInput}>
          <Ionicons name="thermometer" size={28} color="#F59E0B" />
          <TextInput
            style={styles.input}
            placeholder="Temperature (°F)"
            value={vitals.temperature}
            onChangeText={(text) => updateVital('temperature', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.vitalInput}>
          <Ionicons name="water" size={28} color="#00D4FF" />
          <TextInput
            style={styles.input}
            placeholder="Blood Sugar Level (mg/dL)"
            value={vitals.sugarLevel}
            onChangeText={(text) => updateVital('sugarLevel', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.vitalInput}>
          <Ionicons name="scale" size={28} color="#8B5CF6" />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={vitals.weight}
            onChangeText={(text) => updateVital('weight', text)}
            keyboardType="numeric"
          />
        </View>

        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Additional Notes (optional)"
          value={vitals.notes}
          onChangeText={(text) => updateVital('notes', text)}
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveVitals}>
          <Text style={styles.saveButtonText}>Save Vitals</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 30, textAlign: 'center' },
  vitalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 17,
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
});

export default VitalsLoggerScreen;