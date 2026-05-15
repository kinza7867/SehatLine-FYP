import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const AISeverityResultScreen = ({ navigation, route }) => {
  const { severity, department, recommendation, symptoms } = route.params || {};

  const getSeverityColor = () => {
    if (severity === "Critical") return "#EF4444";
    if (severity === "Medium") return "#F59E0B";
    return "#10B981";
  };

  const getSeverityIcon = () => {
    if (severity === "Critical") return "alert-circle";
    if (severity === "Medium") return "warning";
    return "checkmark-circle";
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="AI Analysis Result" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name={getSeverityIcon()} size={100} color={getSeverityColor()} style={styles.icon} />

        <Text style={styles.resultTitle}>AI Analysis Complete</Text>

        <View style={[styles.severityBox, { borderColor: getSeverityColor() }]}>
          <Text style={[styles.severityText, { color: getSeverityColor() }]}>
            {severity} Severity
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Suggested Department</Text>
          <Text style={styles.value}>{department}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Recommendation</Text>
          <Text style={styles.value}>{recommendation}</Text>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('LiveTokenQueue')}
        >
          <Text style={styles.continueText}>Generate Priority Token</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryText}>Check Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, alignItems: 'center' },
  icon: { marginVertical: 20 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 20 },
  severityBox: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 3,
    marginBottom: 25,
  },
  severityText: { fontSize: 20, fontWeight: 'bold' },
  infoCard: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },
  label: { fontSize: 14, color: '#64748B', marginBottom: 6 },
  value: { fontSize: 18, fontWeight: '600', color: '#1E2937' },
  continueButton: {
    backgroundColor: '#00D4FF',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: {
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryText: { color: '#64748B', fontSize: 16 },
});

export default AISeverityResultScreen;