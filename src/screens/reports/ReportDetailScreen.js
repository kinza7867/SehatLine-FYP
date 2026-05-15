import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const ReportDetailScreen = ({ navigation, route }) => {
  const report = route.params?.report || {
    title: 'Blood Test Report',
    date: '28 Mar 2026',
    type: 'Lab',
    status: 'Normal',
    doctor: 'Dr. Sara Malik',
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Report Details" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Ionicons 
            name={report.type === 'Lab' ? 'flask' : 'pulse'} 
            size={60} 
            color="#00D4FF" 
          />
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDate}>{report.date}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Report Type</Text>
            <Text style={styles.value}>{report.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Doctor</Text>
            <Text style={styles.value}>{report.doctor}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.status, report.status === 'Normal' ? styles.normal : styles.abnormal]}>
              {report.status}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Key Findings</Text>
        <View style={styles.findingsCard}>
          <Text style={styles.finding}>• Hemoglobin: 13.2 g/dL (Normal)</Text>
          <Text style={styles.finding}>• WBC Count: 7,800 /µL (Normal)</Text>
          <Text style={styles.finding}>• Platelets: 2,45,000 /µL (Normal)</Text>
          <Text style={styles.finding}>• Blood Sugar (Fasting): 92 mg/dL (Normal)</Text>
        </View>

        <Text style={styles.sectionTitle}>Doctor's Notes</Text>
        <View style={styles.notesCard}>
          <Text style={styles.notes}>
            All parameters are within normal range. Continue current medication. 
            Follow-up after 3 months.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => Alert.alert("Downloaded", "Report saved to device")}
        >
          <Ionicons name="download" size={22} color="#fff" />
          <Text style={styles.downloadText}>Download Report (PDF)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  headerCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
  },
  reportTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', marginTop: 15, textAlign: 'center' },
  reportDate: { fontSize: 16, color: '#64748B', marginTop: 5 },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: { fontSize: 16, color: '#64748B' },
  value: { fontSize: 16, fontWeight: '600', color: '#1E3A8A' },
  status: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '600',
  },
  normal: { backgroundColor: '#D1FAE5', color: '#10B981' },
  abnormal: { backgroundColor: '#FEE2E2', color: '#EF4444' },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#1E3A8A', 
    marginBottom: 12,
    marginTop: 10 
  },
  findingsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    elevation: 4,
  },
  finding: { fontSize: 16, color: '#334155', marginVertical: 6 },
  notesCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 4,
  },
  notes: { fontSize: 16, lineHeight: 26, color: '#334155' },
  downloadButton: {
    backgroundColor: '#00D4FF',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
});

export default ReportDetailScreen;