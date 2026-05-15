import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const PrivacyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Privacy & Security" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Protection</Text>
          <Text style={styles.description}>
            Your health data is encrypted and stored securely. We never share your personal medical information without your explicit consent.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permission Settings</Text>
          
          <TouchableOpacity style={styles.permissionItem}>
            <Ionicons name="camera" size={24} color="#1E3A8A" />
            <Text style={styles.permissionText}>Camera Access</Text>
            <Text style={styles.status}>Enabled</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.permissionItem}>
            <Ionicons name="mic" size={24} color="#1E3A8A" />
            <Text style={styles.permissionText}>Microphone Access</Text>
            <Text style={styles.status}>Enabled</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.permissionItem}>
            <Ionicons name="location" size={24} color="#1E3A8A" />
            <Text style={styles.permissionText}>Location Access</Text>
            <Text style={styles.status}>Enabled</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Sharing</Text>
          <Text style={styles.description}>
            You control what data is shared with doctors and hospitals. 
            Currently sharing: Basic Profile, Recent Vitals, Appointment History.
          </Text>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageText}>Manage Data Sharing</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
          <Text style={styles.deleteText}>Delete My Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    marginBottom: 12 
  },
  description: { 
    fontSize: 15, 
    lineHeight: 24, 
    color: '#334155' 
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  permissionText: { flex: 1, marginLeft: 15, fontSize: 16 },
  status: { color: '#10B981', fontWeight: '600' },
  manageButton: {
    backgroundColor: '#00D4FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  manageText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    padding: 16,
  },
  deleteText: { 
    color: '#EF4444', 
    fontSize: 17, 
    fontWeight: '600', 
    marginLeft: 10 
  },
});

export default PrivacyScreen;