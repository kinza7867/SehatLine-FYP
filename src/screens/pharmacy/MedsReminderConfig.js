import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const MedsReminderConfig = ({ navigation }) => {
  const [reminders, setReminders] = useState([
    { id: '1', medicine: 'Amoxicillin', time: '8:00 AM', dose: '1 tablet' },
    { id: '2', medicine: 'Metformin', time: '9:00 AM & 9:00 PM', dose: '1 tablet' },
  ]);

  const addReminder = () => {
    Alert.alert("New Reminder", "Reminder configuration screen coming soon in full backend version.");
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Medicine Reminders" navigation={navigation} />

      <View style={styles.content}>
        <Text style={styles.title}>Active Medicine Reminders</Text>

        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <Ionicons name="notifications" size={28} color="#00D4FF" />
            <View style={styles.reminderInfo}>
              <Text style={styles.medicine}>{reminder.medicine}</Text>
              <Text style={styles.dose}>{reminder.dose}</Text>
              <Text style={styles.time}>{reminder.time}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addReminder}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 25 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 25 },
  reminderCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 15,
    elevation: 4,
  },
  reminderInfo: { marginLeft: 15, flex: 1 },
  medicine: { fontSize: 18, fontWeight: '600', color: '#1E3A8A' },
  dose: { fontSize: 16, color: '#64748B' },
  time: { fontSize: 16, color: '#00D4FF', marginTop: 6, fontWeight: '600' },
  addButton: {
    backgroundColor: '#00D4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default MedsReminderConfig;