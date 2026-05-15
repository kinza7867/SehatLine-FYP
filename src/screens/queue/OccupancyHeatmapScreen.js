import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const OccupancyHeatmapScreen = ({ navigation }) => {
  const departments = [
    { name: "Cardiology", occupancy: 92, color: "#EF4444", waitTime: "28 min" },
    { name: "General Medicine", occupancy: 65, color: "#F59E0B", waitTime: "12 min" },
    { name: "Pediatrics", occupancy: 45, color: "#10B981", waitTime: "8 min" },
    { name: "Orthopedics", occupancy: 78, color: "#F59E0B", waitTime: "18 min" },
    { name: "ENT", occupancy: 35, color: "#10B981", waitTime: "5 min" },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Live Hospital Occupancy" navigation={navigation} />

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Occupancy Heatmap</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>High (Over 80%)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Medium</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Low</Text>
        </View>
      </View>

      <ScrollView>
        {departments.map((dept, index) => (
          <View key={index} style={styles.deptCard}>
            <View style={styles.deptInfo}>
              <Text style={styles.deptName}>{dept.name}</Text>
              <Text style={styles.waitTime}>Est. Wait: {dept.waitTime}</Text>
            </View>
            
            <View style={styles.occupancyBarContainer}>
              <View 
                style={[
                  styles.occupancyBar, 
                  { width: `${dept.occupancy}%`, backgroundColor: dept.color }
                ]} 
              />
            </View>
            
            <Text style={styles.percentage}>{dept.occupancy}% Full</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.refreshBtn}
        onPress={() => Alert.alert("Updated", "Live occupancy data refreshed")}
      >
        <Text style={styles.refreshText}>Refresh Heatmap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  legend: { backgroundColor: '#fff', padding: 15, margin: 15, borderRadius: 16, elevation: 3 },
  legendTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  legendDot: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  legendText: { fontSize: 15 },
  deptCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  deptInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  deptName: { fontSize: 19, fontWeight: 'bold', color: '#1E3A8A' },
  waitTime: { fontSize: 15, color: '#64748B' },
  occupancyBarContainer: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  occupancyBar: {
    height: '100%',
    borderRadius: 6,
  },
  percentage: { fontSize: 16, fontWeight: '600', color: '#1E3A8A', textAlign: 'right' },
  refreshBtn: {
    backgroundColor: '#1E3A8A',
    margin: 15,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  refreshText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default OccupancyHeatmapScreen;