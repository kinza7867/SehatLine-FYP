import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const ChronicPatientMonitorScreen = ({ navigation }) => {
  const chronicConditions = [
    {
      name: "Diabetes",
      status: "Stable",
      lastReading: "142 mg/dL",
      trend: "↓ Stable",
      color: "#10B981",
      icon: "water"
    },
    {
      name: "Hypertension",
      status: "High Risk",
      lastReading: "148/95 mmHg",
      trend: "↑ Elevated",
      color: "#EF4444",
      icon: "heart"
    },
    {
      name: "Heart Condition",
      status: "Monitoring",
      lastReading: "Normal Rhythm",
      trend: "→ Stable",
      color: "#F59E0B",
      icon: "pulse"
    },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Chronic Patient Monitoring" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AI Early Warning System</Text>
        <Text style={styles.subtitle}>Real-time monitoring for chronic conditions</Text>

        {chronicConditions.map((condition, index) => (
          <View key={index} style={styles.conditionCard}>
            <View style={styles.header}>
              <Ionicons name={condition.icon} size={40} color={condition.color} />
              <View style={styles.info}>
                <Text style={styles.conditionName}>{condition.name}</Text>
                <Text style={[styles.status, { color: condition.color }]}>
                  {condition.status}
                </Text>
              </View>
            </View>

            <View style={styles.readingContainer}>
              <Text style={styles.readingLabel}>Latest Reading</Text>
              <Text style={styles.readingValue}>{condition.lastReading}</Text>
              <Text style={styles.trend}>{condition.trend}</Text>
            </View>

            <TouchableOpacity style={styles.alertButton}>
              <Ionicons name="notifications" size={20} color="#fff" />
              <Text style={styles.alertButtonText}>Set Alert</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.fullReportButton}
          onPress={() => Alert.alert("Full Report", "Opening complete chronic health report...")}
        >
          <Text style={styles.fullReportText}>View Full Health Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E3A8A', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 30 },
  conditionCard: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 6,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  info: { marginLeft: 15, flex: 1 },
  conditionName: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
  status: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  readingContainer: { marginBottom: 18 },
  readingLabel: { fontSize: 14, color: '#64748B' },
  readingValue: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 4 },
  trend: { fontSize: 15, fontWeight: '600' },
  alertButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  alertButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  fullReportButton: {
    backgroundColor: '#1E3A8A',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  fullReportText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ChronicPatientMonitorScreen;