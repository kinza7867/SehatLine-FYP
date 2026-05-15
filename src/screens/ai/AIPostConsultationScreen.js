import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const AIPostConsultationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Post Consultation Care" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="heart-outline" size={80} color="#10B981" />

        <Text style={styles.title}>AI Generated Follow-up Plan</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Follow-up</Text>
          <Text style={styles.cardValue}>15 April 2026 (After 15 days)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medicine Reminders</Text>
          <Text style={styles.medicine}>• Tab. Amoxicillin - 1+0+1 (After meal)</Text>
          <Text style={styles.medicine}>• Tab. Panadol - SOS for fever</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diet & Precautions</Text>
          <Text style={styles.tip}>• Avoid oily and spicy food</Text>
          <Text style={styles.tip}>• Take plenty of water</Text>
          <Text style={styles.tip}>• Light walk 30 minutes daily</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => alert("Auto follow-up token generated!")}>
          <Text style={styles.buttonText}>Generate Auto Follow-up Token</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#1E3A8A', marginBottom: 10 },
  cardValue: { fontSize: 18, color: '#10B981', fontWeight: 'bold' },
  medicine: { fontSize: 16, color: '#334155', marginVertical: 4 },
  tip: { fontSize: 16, color: '#334155', marginVertical: 4 },
  button: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AIPostConsultationScreen;