import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const SharedFamilyRemindersScreen = ({ navigation }) => {
  const reminders = [
    { id: '1', title: 'Mama’s Blood Pressure Medicine', time: '8:00 AM', for: 'Fatima Bibi', active: true },
    { id: '2', title: 'Bilal’s Diabetes Check', time: 'Tomorrow', for: 'Bilal Ahmed', active: true },
    { id: '3', title: 'Ahmed’s Vaccination Due', time: '15 April 2026', for: 'Ahmed Khan', active: false },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Shared Family Reminders" navigation={navigation} />

      <FlatList
        data={reminders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.reminderCard}>
            <View style={styles.left}>
              <Ionicons name="notifications" size={28} color={item.active ? "#00D4FF" : "#94A3B8"} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.for}>For: {item.for}</Text>
              </View>
            </View>
            <View style={styles.right}>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={[styles.status, item.active ? styles.activeStatus : styles.inactiveStatus]}>
                {item.active ? 'Active' : 'Completed'}
              </Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.newReminderButton}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.newReminderText}>Create New Shared Reminder</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  reminderCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  info: { marginLeft: 15 },
  title: { fontSize: 17, fontWeight: '600', color: '#1E3A8A' },
  for: { fontSize: 14, color: '#64748B', marginTop: 4 },
  right: { alignItems: 'flex-end' },
  time: { fontSize: 15, color: '#334155', fontWeight: '500' },
  status: { fontSize: 13, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  activeStatus: { backgroundColor: '#D1FAE5', color: '#10B981' },
  inactiveStatus: { backgroundColor: '#E2E8F0', color: '#64748B' },
  newReminderButton: {
    backgroundColor: '#00D4FF',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newReminderText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default SharedFamilyRemindersScreen;