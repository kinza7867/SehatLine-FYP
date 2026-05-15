import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const SeverityResultScreen = ({ navigation, route }) => {
  const { severity = "Medium", department = "Cardiology", recommendation = "Priority recommended" } = route.params || {};

  const getColor = () => severity === "Critical" ? "#EF4444" : severity === "Medium" ? "#F59E0B" : "#10B981";

  return (
    <View style={styles.container}>
      <CustomHeader title="AI Severity Result" navigation={navigation} />

      <View style={styles.content}>
        <Ionicons name="pulse" size={100} color={getColor()} />

        <Text style={[styles.severity, { color: getColor() }]}>{severity} Severity</Text>
        <Text style={styles.department}>Suggested: {department}</Text>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendation}>{recommendation}</Text>
        </View>

        <TouchableOpacity 
          style={styles.tokenButton}
          onPress={() => navigation.navigate('PriorityTokenScreen')}
        >
          <Text style={styles.tokenButtonText}>Generate Priority Token</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  severity: { fontSize: 32, fontWeight: 'bold', marginVertical: 15 },
  department: { fontSize: 20, color: '#1E3A8A', marginBottom: 30 },
  recommendationBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    elevation: 5,
    marginBottom: 40,
  },
  recommendation: { fontSize: 17, textAlign: 'center', lineHeight: 26 },
  tokenButton: {
    backgroundColor: '#EF4444',
    padding: 18,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  tokenButtonText: { color: '#fff', fontSize: 19, fontWeight: 'bold' },
});

export default SeverityResultScreen;