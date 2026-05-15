import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HospitalTimingsScreen = ({ navigation }) => {
  const timings = [
    { dept: 'Emergency & Trauma', time: '24 Hours / 7 Days', status: 'Open Now', color: '#FF3B30' },
    { dept: 'OPD Services', time: '08:00 AM - 04:00 PM', status: 'Closed', color: '#00EAFF' },
    { dept: 'Pharmacy', time: '24 Hours / 7 Days', status: 'Open Now', color: '#10B981' },
    { dept: 'Radiology (X-Ray/MRI)', time: '08:00 AM - 10:00 PM', status: 'Closing Soon', color: '#F59E0B' },
    { dept: 'Laboratory', time: '07:00 AM - 11:00 PM', status: 'Open Now', color: '#00EAFF' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#00EAFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Timings</Text>
      </View>

      <ScrollView style={{ padding: 20 }}>
        {timings.map((t, index) => (
          <View key={index} style={styles.timeRow}>
            <View style={styles.deptWrap}>
              <Text style={styles.deptName}>{t.dept}</Text>
              <Text style={styles.timeVal}>{t.time}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: t.color }]}>
              <Text style={[styles.statusText, { color: t.color }]}>{t.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#011027' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#112233' },
  deptName: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  timeVal: { color: '#888', fontSize: 13, marginTop: 4 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  statusText: { fontSize: 10, fontWeight: 'bold' }
});

export default HospitalTimingsScreen;