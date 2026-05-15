import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const ReportsListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const [reports] = useState([
    { 
      id: '1', 
      title: 'Blood Test Report', 
      date: '28 Mar 2026', 
      type: 'Lab', 
      status: 'Normal',
      doctor: 'Dr. Sara Malik' 
    },
    { 
      id: '2', 
      title: 'ECG Report', 
      date: '25 Mar 2026', 
      type: 'Cardiology', 
      status: 'Abnormal',
      doctor: 'Dr. Ahmed Khan' 
    },
    { 
      id: '3', 
      title: 'Ultrasound Abdomen', 
      date: '20 Mar 2026', 
      type: 'Radiology', 
      status: 'Normal',
      doctor: 'Dr. Fatima Noor' 
    },
    { 
      id: '4', 
      title: 'CBC Report', 
      date: '15 Mar 2026', 
      type: 'Lab', 
      status: 'Normal',
      doctor: 'Dr. Sara Malik' 
    },
  ]);

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(search.toLowerCase()) ||
    report.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Medical Reports" navigation={navigation} />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.reportCard}
            onPress={() => navigation.navigate('ReportDetailScreen', { report: item })}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={item.type === 'Lab' ? 'flask' : item.type === 'Cardiology' ? 'pulse' : 'image'} 
                size={40} 
                color="#00D4FF" 
              />
            </View>
            
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportMeta}>
                {item.date} • {item.type}
              </Text>
              <Text style={styles.doctor}>By: {item.doctor}</Text>
            </View>

            <View style={styles.statusContainer}>
              <Text style={[
                styles.status, 
                item.status === 'Abnormal' ? styles.abnormal : styles.normal
              ]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={() => navigation.navigate('UploadReportScreen')}
      >
        <Ionicons name="cloud-upload" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload New Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  reportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
  reportMeta: { fontSize: 14, color: '#64748B', marginTop: 4 },
  doctor: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  statusContainer: { alignItems: 'flex-end' },
  status: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: '600',
  },
  normal: { backgroundColor: '#D1FAE5', color: '#10B981' },
  abnormal: { backgroundColor: '#FEE2E2', color: '#EF4444' },
  uploadButton: {
    backgroundColor: '#00D4FF',
    margin: 15,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default ReportsListScreen;