import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const AIChronicMonitoringScreen = ({ navigation }) => {
  const conditions = [
    { name: "Diabetes", status: "Stable", lastCheck: "2 days ago", icon: "water" },
    { name: "Hypertension", status: "High Risk", lastCheck: "Today", icon: "heart" },
    { name: "Heart Disease", status: "Monitoring", lastCheck: "5 days ago", icon: "pulse" },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Chronic Patient Monitoring" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AI Early Warning System</Text>
        <Text style={styles.subtitle}>Monitoring your chronic conditions</Text>

        {conditions.map((cond, index) => (
          <View key={index} style={styles.conditionCard}>
            <Ionicons name={cond.icon} size={40} color="#00D4FF" />
            <View style={styles.info}>
              <Text style={styles.conditionName}>{cond.name}</Text>
              <Text style={[styles.status, 
                cond.status === "High Risk" && styles.highRisk]}>
                {cond.status}
              </Text>
              <Text style={styles.lastCheck}>Last check: {cond.lastCheck}</Text>
            </View>
            <TouchableOpacity style={styles.alertBtn}>
              <Ionicons name="notifications" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.viewReportBtn}>
          <Text style={styles.viewReportText}>View Full Health Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 25 },
  conditionCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  info: { flex: 1, marginLeft: 15 },
  conditionName: { fontSize: 19, fontWeight: '600', color: '#1E3A8A' },
  status: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  highRisk: { color: '#EF4444' },
  lastCheck: { fontSize: 13, color: '#94A3B8' },
  alertBtn: { padding: 8 },
  viewReportBtn: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  viewReportText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default AIChronicMonitoringScreen;