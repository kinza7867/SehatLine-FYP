import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const PredictiveWaitTimeScreen = ({ navigation }) => {
  const predictions = [
    { department: "Cardiology", currentWait: "28 min", predictedWait: "12 min", status: "Improving" },
    { department: "General Medicine", currentWait: "45 min", predictedWait: "38 min", status: "Stable" },
    { department: "Pediatrics", currentWait: "15 min", predictedWait: "8 min", status: "Improving" },
    { department: "Orthopedics", currentWait: "52 min", predictedWait: "41 min", status: "Stable" },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Predictive Wait Times" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AI Predicted Wait Times</Text>
        <Text style={styles.subtitle}>Based on real-time hospital data and AI analysis</Text>

        {predictions.map((item, index) => (
          <View key={index} style={styles.predictionCard}>
            <View style={styles.deptHeader}>
              <Text style={styles.department}>{item.department}</Text>
              <Text style={[
                styles.status, 
                item.status === "Improving" ? styles.improving : styles.stable
              ]}>
                {item.status}
              </Text>
            </View>

            <View style={styles.waitRow}>
              <View style={styles.waitBox}>
                <Text style={styles.waitLabel}>Current Wait</Text>
                <Text style={styles.currentWait}>{item.currentWait}</Text>
              </View>
              <View style={styles.waitBox}>
                <Text style={styles.waitLabel}>Predicted Wait</Text>
                <Text style={styles.predictedWait}>{item.predictedWait}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => Alert.alert("Updated", "Wait time predictions refreshed using latest AI model")}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
          <Text style={styles.refreshText}>Refresh Predictions</Text>
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
  predictionCard: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 5,
  },
  deptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  department: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
  status: { fontSize: 14, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  improving: { backgroundColor: '#D1FAE5', color: '#10B981' },
  stable: { backgroundColor: '#FEF3C7', color: '#D97706' },
  waitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  waitBox: { flex: 1, alignItems: 'center' },
  waitLabel: { fontSize: 14, color: '#64748B', marginBottom: 6 },
  currentWait: { fontSize: 22, color: '#EF4444', fontWeight: 'bold' },
  predictedWait: { fontSize: 26, color: '#10B981', fontWeight: 'bold' },
  refreshButton: {
    backgroundColor: '#1E3A8A',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  refreshText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default PredictiveWaitTimeScreen;