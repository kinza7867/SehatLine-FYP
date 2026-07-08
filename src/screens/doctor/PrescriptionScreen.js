// src/screens/doctor/PrescriptionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const PrescriptionScreen = ({ navigation }) => {
  const [medicines, setMedicines] = useState([]);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  const addMedicine = () => {
    if (!medicineName || !dosage) {
      Alert.alert('Error', 'Please enter medicine name and dosage');
      return;
    }
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: medicineName, dosage, frequency, duration },
    ]);
    setMedicineName('');
    setDosage('');
    setFrequency('');
    setDuration('');
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const handleSendToPharmacy = () => {
    if (medicines.length === 0) {
      Alert.alert('Error', 'Please add at least one medicine');
      return;
    }
    Alert.alert(
      'Prescription Sent',
      'Prescription has been sent to pharmacy successfully.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary || '#1a73e8', COLORS.secondary || '#0d47a1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescription</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Patient Selector */}
          <View style={[styles.section, SHADOWS?.medium || {}]}>
            <Text style={styles.sectionTitle}>Patient</Text>
            <TouchableOpacity style={styles.selectPatientBtn}>
              <Text style={styles.selectPatientText}>Select Patient</Text>
              <Ionicons name="chevron-down" size={wp(4)} color={COLORS.textSecondary || '#666'} />
            </TouchableOpacity>
          </View>

          {/* Add Medicine */}
          <View style={[styles.section, SHADOWS?.medium || {}]}>
            <Text style={styles.sectionTitle}>Add Medicine</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Medicine Name"
              placeholderTextColor={COLORS.textLight || '#999'}
              value={medicineName}
              onChangeText={setMedicineName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Dosage (e.g., 500mg)"
              placeholderTextColor={COLORS.textLight || '#999'}
              value={dosage}
              onChangeText={setDosage}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Frequency (e.g., Twice daily)"
              placeholderTextColor={COLORS.textLight || '#999'}
              value={frequency}
              onChangeText={setFrequency}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Duration (e.g., 7 days)"
              placeholderTextColor={COLORS.textLight || '#999'}
              value={duration}
              onChangeText={setDuration}
            />

            <TouchableOpacity style={styles.addBtn} onPress={addMedicine}>
              <Ionicons name="add-circle-outline" size={wp(4)} color="#fff" />
              <Text style={styles.addBtnText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>

          {/* Medicine List */}
          {medicines.length > 0 && (
            <View style={[styles.section, SHADOWS?.medium || {}]}>
              <Text style={styles.sectionTitle}>Medicine List</Text>
              {medicines.map((item) => (
                <View key={item.id} style={styles.medicineItem}>
                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{item.name}</Text>
                    <Text style={styles.medicineDetail}>{item.dosage} • {item.frequency || 'Once daily'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMedicine(item.id)}>
                    <Ionicons name="close-circle" size={wp(5)} color={COLORS.danger || '#F44336'} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Instructions */}
          <View style={[styles.section, SHADOWS?.medium || {}]}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Additional instructions for patient..."
              placeholderTextColor={COLORS.textLight || '#999'}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, medicines.length === 0 && styles.sendButtonDisabled]}
            onPress={handleSendToPharmacy}
            disabled={medicines.length === 0}
          >
            <LinearGradient
              colors={medicines.length > 0 ? [COLORS.success || '#4CAF50', '#2E7D32'] : ['#bdbdbd', '#9e9e9e']}
              style={styles.sendGradient}
            >
              <Ionicons name="send-outline" size={wp(4.5)} color="#fff" />
              <Text style={styles.sendButtonText}>Send to Pharmacy</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f7fa',
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: wp(8),
  },
  scrollView: {
    flex: 1,
    padding: wp(4),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.text || '#1a1a1a',
    marginBottom: hp(1),
  },
  selectPatientBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(3),
    backgroundColor: COLORS.background || '#f5f7fa',
    borderRadius: wp(2),
  },
  selectPatientText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary || '#666',
  },
  input: {
    fontSize: wp(3.2),
    color: COLORS.text || '#1a1a1a',
    padding: wp(3),
    backgroundColor: COLORS.background || '#f5f7fa',
    borderRadius: wp(2),
    marginBottom: hp(0.5),
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary || '#1a73e8',
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    gap: wp(2),
  },
  addBtnText: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: '#fff',
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#e0e0e0',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text || '#1a1a1a',
  },
  medicineDetail: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary || '#666',
  },
  instructionsInput: {
    fontSize: wp(3.2),
    color: COLORS.text || '#1a1a1a',
    padding: wp(3),
    backgroundColor: COLORS.background || '#f5f7fa',
    borderRadius: wp(2),
    minHeight: hp(8),
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  sendButtonText: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PrescriptionScreen;