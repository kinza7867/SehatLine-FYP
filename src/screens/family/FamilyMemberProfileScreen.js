import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const FamilyMemberProfileScreen = ({ navigation, route }) => {
  const member = route.params?.member || {
    name: 'Fatima Bibi',
    relation: 'Mother',
    age: 67,
    status: 'Chronic - Monitored',
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Family Member Profile" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={70} color="#1E3A8A" />
          </View>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.relation}>{member.relation} • {member.age} years old</Text>
        </View>

        <View style={styles.healthStatus}>
          <Text style={styles.statusTitle}>Current Health Status</Text>
          <Text style={[styles.statusValue, 
            member.status.includes('Chronic') ? styles.critical : styles.normal]}>
            {member.status}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityItem}>• Blood Pressure Check - 2 days ago</Text>
          <Text style={styles.activityItem}>• Medicine Reminder Sent - Yesterday</Text>
          <Text style={styles.activityItem}>• AI Health Tips Delivered - 5 days ago</Text>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Full Health History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reminderButton}>
          <Text style={styles.reminderButtonText}>Set Personal Reminders</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 110,
    height: 110,
    backgroundColor: '#E0F2FE',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A' },
  relation: { fontSize: 18, color: '#64748B' },
  healthStatus: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 4,
  },
  statusTitle: { fontSize: 16, color: '#64748B' },
  statusValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  critical: { color: '#EF4444' },
  normal: { color: '#10B981' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1E3A8A', marginBottom: 12 },
  activityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 25,
  },
  activityItem: { paddingVertical: 8, fontSize: 16, color: '#334155' },
  actionButton: {
    backgroundColor: '#00D4FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  reminderButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reminderButtonText: { color: '#1E3A8A', fontSize: 18, fontWeight: '600' },
});

export default FamilyMemberProfileScreen;