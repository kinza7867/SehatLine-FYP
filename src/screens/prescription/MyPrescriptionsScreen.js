import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, SafeAreaView, Dimensions, Alert, TextInput,
  Modal, TouchableWithoutFeedback, Keyboard, Platform,
  ActivityIndicator, FlatList, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const MyPrescriptionsScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user data
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }

      // Load prescriptions
      const storedPrescriptions = await AsyncStorage.getItem('prescriptions');
      if (storedPrescriptions) {
        const parsed = JSON.parse(storedPrescriptions);
        setPrescriptions(parsed);
      } else {
        // Add sample data if no prescriptions exist
        const samplePrescriptions = getSamplePrescriptions();
        setPrescriptions(samplePrescriptions);
        await AsyncStorage.setItem('prescriptions', JSON.stringify(samplePrescriptions));
      }
    } catch (error) {
      console.log('Error loading prescriptions:', error);
    }
    setLoading(false);
  };

  const getSamplePrescriptions = () => {
    return [
      {
        id: '1',
        prescriptionId: 'RX-2024-001',
        doctorName: 'Dr. Sarah Ahmed',
        department: 'Chronic OPD',
        date: '2024-12-15',
        dateFormatted: '15 Dec 2024',
        status: 'Active',
        diagnosis: 'Hypertension (High Blood Pressure)',
        notes: 'Monitor BP daily. Reduce salt intake.',
        medicines: [
          {
            id: 'm1',
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            timing: 'Morning after breakfast',
            duration: '30 days',
            quantity: '30 tablets',
            instructions: 'Take with food',
            refill: 'Yes'
          },
          {
            id: 'm2',
            name: 'Losartan',
            dosage: '50mg',
            frequency: 'Once daily',
            timing: 'Evening after dinner',
            duration: '30 days',
            quantity: '30 tablets',
            instructions: 'Take at same time daily',
            refill: 'Yes'
          }
        ]
      },
      {
        id: '2',
        prescriptionId: 'RX-2024-002',
        doctorName: 'Dr. Usman Malik',
        department: 'Pharmacy',
        date: '2025-05-10',
        dateFormatted: '10 Jun 2025',
        status: 'Completed',
        diagnosis: 'Type 2 Diabetes',
        notes: 'Monitor blood sugar regularly. Follow diet plan.',
        medicines: [
          {
            id: 'm3',
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            timing: 'Morning & Evening with meals',
            duration: '15 days',
            quantity: '30 tablets',
            instructions: 'Take with meals to avoid stomach upset',
            refill: 'No'
          },
          {
            id: 'm4',
            name: 'Gliclazide',
            dosage: '80mg',
            frequency: 'Once daily',
            timing: 'Morning before breakfast',
            duration: '15 days',
            quantity: '15 tablets',
            instructions: 'Take on empty stomach',
            refill: 'No'
          }
        ]
      },
      {
        id: '3',
        prescriptionId: 'RX-2024-003',
        doctorName: 'Dr. Ayesha Khan',
        department: 'Laboratory',
        date: '2025-2-05',
        dateFormatted: '05 Feb 2025',
        status: 'Active',
        diagnosis: 'Iron Deficiency Anemia',
        notes: 'Increase iron-rich foods. Follow-up in 2 weeks.',
        medicines: [
          {
            id: 'm5',
            name: 'Ferrous Sulfate',
            dosage: '325mg',
            frequency: 'Once daily',
            timing: 'Morning on empty stomach',
            duration: '60 days',
            quantity: '60 tablets',
            instructions: 'Take with Vitamin C for better absorption',
            refill: 'Yes'
          },
          {
            id: 'm6',
            name: 'Folic Acid',
            dosage: '1mg',
            frequency: 'Once daily',
            timing: 'Morning with breakfast',
            duration: '60 days',
            quantity: '60 tablets',
            instructions: 'Take regularly for best results',
            refill: 'Yes'
          }
        ]
      }
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return '#34D399';
      case 'Completed': return '#3B82F6';
      case 'Expired': return '#EF4444';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Active': return 'checkmark-circle';
      case 'Completed': return 'checkmark-done-circle';
      case 'Expired': return 'alert-circle';
      default: return 'time-outline';
    }
  };

  const renderPrescriptionCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={[styles.prescriptionCard, styles.cardShadow]}
        onPress={() => {
          setSelectedPrescription(item);
          setDetailModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Ionicons name={getStatusIcon(item.status)} size={14} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
            <Text style={styles.prescriptionId}>{item.prescriptionId}</Text>
          </View>
          <Text style={styles.cardDate}>{item.dateFormatted}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.departmentName}>{item.department}</Text>
          <Text style={styles.diagnosis}>📋 {item.diagnosis}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.medicinesCount}>
            <Ionicons name="medkit-outline" size={16} color={COLORS.primary} />
            <Text style={styles.medicinesCountText}>
              {item.medicines.length} Medicine{item.medicines.length > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedPrescription) return null;

    return (
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Prescription Details</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Prescription Info */}
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailPrescriptionId}>
                      {selectedPrescription.prescriptionId}
                    </Text>
                    <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedPrescription.status) + '15' }]}>
                      <Text style={[styles.detailStatusText, { color: getStatusColor(selectedPrescription.status) }]}>
                        {selectedPrescription.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailInfo}>
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.detailLabel}>Doctor:</Text>
                      <Text style={styles.detailValue}>{selectedPrescription.doctorName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="medical-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.detailLabel}>Department:</Text>
                      <Text style={styles.detailValue}>{selectedPrescription.department}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>{selectedPrescription.dateFormatted}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="clipboard-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.detailLabel}>Diagnosis:</Text>
                      <Text style={styles.detailValue}>{selectedPrescription.diagnosis}</Text>
                    </View>
                  </View>

                  {selectedPrescription.notes && (
                    <View style={styles.detailNotes}>
                      <Text style={styles.detailNotesLabel}>📝 Notes</Text>
                      <Text style={styles.detailNotesText}>{selectedPrescription.notes}</Text>
                    </View>
                  )}
                </View>

                {/* Medicines List */}
                <View style={styles.medicinesSection}>
                  <Text style={styles.medicinesSectionTitle}>💊 Prescribed Medicines</Text>
                  {selectedPrescription.medicines.map((medicine, index) => (
                    <View key={medicine.id} style={[styles.medicineCard, styles.cardShadow]}>
                      <View style={styles.medicineHeader}>
                        <Text style={styles.medicineName}>{medicine.name}</Text>
                        <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
                      </View>
                      
                      <View style={styles.medicineDetails}>
                        <View style={styles.medicineRow}>
                          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.medicineLabel}>Frequency:</Text>
                          <Text style={styles.medicineValue}>{medicine.frequency}</Text>
                        </View>
                        <View style={styles.medicineRow}>
                          <Ionicons name="sunny-outline" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.medicineLabel}>Timing:</Text>
                          <Text style={styles.medicineValue}>{medicine.timing}</Text>
                        </View>
                        <View style={styles.medicineRow}>
                          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.medicineLabel}>Duration:</Text>
                          <Text style={styles.medicineValue}>{medicine.duration}</Text>
                        </View>
                        <View style={styles.medicineRow}>
                          <Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.medicineLabel}>Quantity:</Text>
                          <Text style={styles.medicineValue}>{medicine.quantity}</Text>
                        </View>
                        <View style={styles.medicineRow}>
                          <Ionicons name="document-text-outline" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.medicineLabel}>Instructions:</Text>
                          <Text style={styles.medicineValue}>{medicine.instructions}</Text>
                        </View>
                        {medicine.refill && (
                          <View style={styles.medicineRow}>
                            <Ionicons name="refresh-outline" size={16} color={COLORS.success} />
                            <Text style={[styles.medicineLabel, { color: COLORS.success }]}>Refill:</Text>
                            <Text style={[styles.medicineValue, { color: COLORS.success }]}>{medicine.refill}</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity style={styles.medicineAction}>
                        <LinearGradient colors={[COLORS.primary + '15', COLORS.secondary + '05']} style={styles.medicineActionGradient}>
                          <Ionicons name="checkbox-outline" size={16} color={COLORS.primary} />
                          <Text style={styles.medicineActionText}>Mark as Taken</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.downloadBtn}>
                  <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.downloadGradient}>
                    <Ionicons name="download-outline" size={20} color={COLORS.white} />
                    <Text style={styles.downloadBtnText}>Download Prescription (PDF)</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: hp(2) }} />
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[COLORS.primary + '08', COLORS.background, COLORS.background]}
        style={styles.gradientBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Prescriptions</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{prescriptions.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#34D399' }]}>
            {prescriptions.filter(p => p.status === 'Active').length}
          </Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#3B82F6' }]}>
            {prescriptions.filter(p => p.status === 'Completed').length}
          </Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      {/* Prescriptions List */}
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderPrescriptionCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Prescriptions</Text>
            <Text style={styles.emptyText}>Your prescriptions will appear here</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
    paddingBottom: hp(1.5),
    gap: wp(3),
  },
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  filterBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(2.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  summaryNumber: {
    fontSize: wp(5),
    fontWeight: '800',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: wp(2.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.2),
  },

  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
    gap: hp(1.2),
  },

  prescriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardShadow: {
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
    gap: wp(0.5),
  },
  statusText: {
    fontSize: wp(2.5),
    fontWeight: '600',
  },
  prescriptionId: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  cardDate: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
  },
  cardBody: {
    marginBottom: hp(0.5),
  },
  doctorName: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  departmentName: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  diagnosis: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: hp(0.3),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  medicinesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  medicinesCountText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.5),
  },
  viewDetailsText: {
    fontSize: wp(2.8),
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: hp(5),
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },

  detailSection: {
    paddingVertical: hp(1.5),
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  detailPrescriptionId: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  detailStatusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  detailStatusText: {
    fontSize: wp(2.8),
    fontWeight: '600',
  },
  detailInfo: {
    gap: hp(0.3),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  detailLabel: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '500',
    width: wp(18),
  },
  detailValue: {
    fontSize: wp(3),
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  detailNotes: {
    marginTop: hp(1),
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(2.5),
    padding: wp(3),
  },
  detailNotesLabel: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },
  detailNotesText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    lineHeight: hp(2.2),
  },

  medicinesSection: {
    marginTop: hp(0.5),
    marginBottom: hp(1.5),
  },
  medicinesSectionTitle: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1),
  },
  medicineCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: hp(1),
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  medicineName: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  medicineDosage: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.primary,
  },
  medicineDetails: {
    gap: hp(0.2),
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  medicineLabel: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '500',
    width: wp(16),
  },
  medicineValue: {
    fontSize: wp(2.8),
    color: COLORS.text,
    flex: 1,
  },
  medicineAction: {
    marginTop: hp(0.8),
    borderRadius: wp(2),
    overflow: 'hidden',
  },
  medicineActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp(0.6),
    gap: wp(1),
  },
  medicineActionText: {
    fontSize: wp(2.8),
    color: COLORS.primary,
    fontWeight: '600',
  },

  downloadBtn: {
    borderRadius: wp(3.5),
    overflow: 'hidden',
    marginBottom: hp(1.5),
  },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp(1.5),
    gap: wp(2),
  },
  downloadBtnText: {
    color: COLORS.white,
    fontSize: wp(3.8),
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp(8),
    gap: hp(1),
  },
  emptyTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },
});

export default MyPrescriptionsScreen;