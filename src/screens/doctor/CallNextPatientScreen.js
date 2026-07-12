// src/screens/doctor/CallNextPatientScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const APPOINTMENTS_KEY = '@sehatline_appointments';
const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const QUEUE_KEY = '@sehatline_queue';

const CallNextPatientScreen = ({ navigation, route }) => {
  // ── Get patient from route params ──────────────────────────────────
  const patientFromParams = route?.params?.patient || route?.params?.patientData;
  const doctorData = route?.params?.doctor || route?.params?.doctorData || {};
  const doctorName = doctorData.name || 'Dr. Doctor';
  const onComplete = route?.params?.onComplete;

  // ── State ─────────────────────────────────────────────────────────────
  const [patient, setPatient] = useState(patientFromParams || null);
  const [loading, setLoading] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [customMedicines, setCustomMedicines] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [customAdvice, setCustomAdvice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Prescription Templates ──────────────────────────────────────────
  const prescriptionTemplates = [
    {
      id: '1',
      name: 'Chest Pain / Angina',
      medicines: 'Aspirin 75mg (1x daily), Nitroglycerin 0.4mg (as needed), Atorvastatin 40mg (1x nightly)',
      duration: '30 days',
      advice: 'Rest, avoid exertion. Report if chest pain persists. Follow-up in 2 weeks.'
    },
    {
      id: '2',
      name: 'Hypertension (High BP)',
      medicines: 'Losartan 50mg (1x daily), Amlodipine 5mg (1x daily), Hydrochlorothiazide 12.5mg (1x daily)',
      duration: '30 days',
      advice: 'Monitor BP daily. Low salt diet. Avoid stress.'
    },
    {
      id: '3',
      name: 'Heart Failure',
      medicines: 'Furosemide 40mg (1x daily), Lisinopril 10mg (1x daily), Metoprolol 25mg (2x daily)',
      duration: '30 days',
      advice: 'Monitor weight daily. Report sudden weight gain. Low salt diet.'
    },
    {
      id: '4',
      name: 'Arrhythmia / Palpitations',
      medicines: 'Amiodarone 200mg (1x daily), Bisoprolol 5mg (1x daily), Apixaban 5mg (2x daily)',
      duration: '30 days',
      advice: 'Avoid caffeine. Report palpitations. Follow-up in 1 week.'
    },
    {
      id: '5',
      name: 'Cholesterol Management',
      medicines: 'Atorvastatin 80mg (1x nightly), Ezetimibe 10mg (1x daily), Fenofibrate 145mg (1x daily)',
      duration: '30 days',
      advice: 'Cholesterol-lowering diet. Avoid fatty foods. Follow-up in 4 weeks.'
    },
    {
      id: '6',
      name: 'Custom Prescription',
      medicines: '',
      duration: '',
      advice: '',
      isCustom: true
    },
  ];

  // ── Complete Consultation & Send to Pharmacy ──────────────────────
  const completeConsultation = async () => {
    if (!patient) {
      Alert.alert('Error', 'No patient found.');
      return;
    }

    // Validate required fields
    if (!diagnosis.trim()) {
      Alert.alert('Required', 'Please enter a diagnosis.');
      return;
    }

    if (!selectedPrescription && !customMedicines.trim()) {
      Alert.alert('Required', 'Please select a prescription or enter custom medicines.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build prescription data
      let prescriptionData = {};
      if (selectedPrescription && !selectedPrescription.isCustom) {
        prescriptionData = {
          medicines: selectedPrescription.medicines,
          duration: selectedPrescription.duration,
          advice: selectedPrescription.advice,
          templateName: selectedPrescription.name,
        };
      } else if (selectedPrescription?.isCustom) {
        prescriptionData = {
          medicines: customMedicines || 'Not specified',
          duration: customDuration || 'Not specified',
          advice: customAdvice || 'None',
          templateName: 'Custom Prescription',
        };
      }

      const consultationData = {
        patientId: patient.id,
        patientName: patient.name,
        patientToken: patient.token,
        diagnosis: diagnosis,
        bloodPressure: bloodPressure || 'Not recorded',
        heartRate: heartRate || 'Not recorded',
        temperature: temperature || 'Not recorded',
        weight: weight || 'Not recorded',
        consultationNotes: consultationNotes || 'No additional notes',
        prescription: prescriptionData,
        doctorName: doctorName,
        department: doctorData.department || 'Cardiology',
        completedAt: new Date().toISOString(),
      };

      // Save to completed patients
      const existingCompleted = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      const completedList = existingCompleted ? JSON.parse(existingCompleted) : [];
      completedList.unshift({
        ...consultationData,
        id: patient.id,
      });
      await AsyncStorage.setItem(COMPLETED_PATIENTS_KEY, JSON.stringify(completedList));

      // Update queue - remove this patient
      const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
      if (existingQueue) {
        const queueList = JSON.parse(existingQueue);
        const updatedQueue = queueList.filter((p) => p.id !== patient.id);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
      }

      // Update appointments - mark as completed
      const existingAppointments = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      if (existingAppointments) {
        const apptList = JSON.parse(existingAppointments);
        const updatedAppointments = apptList.map((a) =>
          a.patient === patient.name && a.status === 'Current'
            ? { ...a, status: 'Completed' }
            : a
        );
        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
      }

      // Show success message
      Alert.alert(
        '✅ Patient Sent to Pharmacy',
        `${patient.name} (${patient.token}) has been successfully sent to pharmacy.\n\n` +
        `💊 Prescription: ${prescriptionData.medicines.substring(0, 50)}...`,
        [
          {
            text: 'Back to Portal',
            onPress: () => {
              // Call the onComplete callback if provided
              if (onComplete) {
                onComplete(patient, consultationData);
              }
              // Navigate back to portal
              navigation.navigate('DoctorHome');
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error completing consultation:', error);
      Alert.alert('Error', 'Failed to complete consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Load Next Patient ──────────────────────────────────────────────
  const loadNextPatient = async () => {
    try {
      const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
      if (existingQueue) {
        const queueList = JSON.parse(existingQueue);
        if (queueList.length > 0) {
          const nextPatient = queueList[0];
          navigation.replace('CallNextPatientScreen', {
            patient: nextPatient,
            doctor: doctorData,
            onComplete: onComplete,
          });
        } else {
          Alert.alert(
            '🎉 Queue Empty',
            'All patients have been attended to. Returning to portal.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('DoctorHome'),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error loading next patient:', error);
    }
  };

  // ── Render Header ────────────────────────────────────────────────────
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              Alert.alert(
                'Exit Consultation',
                'Are you sure you want to exit? The patient will be returned to queue.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Exit',
                    style: 'destructive',
                    onPress: () => navigation.navigate('DoctorHome'),
                  },
                ]
              );
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>Consultation</Text>
              <Text style={styles.headerSub}>👨‍⚕️ {doctorName}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // ── Render Patient Info ─────────────────────────────────────────────
  const renderPatientInfo = () => {
    if (!patient) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={wp(15)} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Patient</Text>
          <Text style={styles.emptySub}>No patient data available</Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('DoctorHome')}
          >
            <Text style={styles.emptyBtnText}>Go to Portal</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.patientCard, SHADOWS.medium]}>
        <View style={styles.patientHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {patient.name?.charAt(0) || 'P'}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.patientInfo}>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenNumber}>{patient.token || 'T-00'}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: patient.priority === 'Emergency' ? COLORS.danger : COLORS.success }]}>
                <Text style={styles.priorityText}>{patient.priority || 'Normal'}</Text>
              </View>
            </View>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientMeta}>
              Age: {patient.age || 'N/A'} • {patient.gender || 'N/A'} • {patient.department || 'Cardiology'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="medkit-outline" size={wp(3.5)} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Reason</Text>
            <Text style={styles.detailValue}>{patient.reason || 'Checkup'}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={wp(3.5)} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Wait Time</Text>
            <Text style={styles.detailValue}>{patient.waitTime || '0 min'}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={wp(3.5)} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Visits</Text>
            <Text style={styles.detailValue}>{patient.previousVisits || 0}</Text>
          </View>
        </View>

        {patient.allergies && patient.allergies !== 'None' && (
          <View style={styles.allergyWarning}>
            <Ionicons name="alert-circle" size={wp(3.5)} color={COLORS.danger} />
            <Text style={styles.allergyText}>⚠️ Allergies: {patient.allergies}</Text>
          </View>
        )}
      </View>
    );
  };

  // ── Render Consultation Form ────────────────────────────────────────
  const renderConsultationForm = () => (
    <View style={[styles.formCard, SHADOWS.small]}>
      <Text style={styles.formTitle}>📋 Consultation Details</Text>

      <View style={styles.formRow}>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Blood Pressure</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., 120/80"
            placeholderTextColor={COLORS.textLight}
            value={bloodPressure}
            onChangeText={setBloodPressure}
          />
        </View>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Heart Rate</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., 72 bpm"
            placeholderTextColor={COLORS.textLight}
            value={heartRate}
            onChangeText={setHeartRate}
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Temperature</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., 98.6°F"
            placeholderTextColor={COLORS.textLight}
            value={temperature}
            onChangeText={setTemperature}
          />
        </View>
        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g., 72"
            placeholderTextColor={COLORS.textLight}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Diagnosis *</Text>
        <TextInput
          style={[styles.fieldInput, styles.fieldInputMultiline]}
          placeholder="Enter diagnosis..."
          placeholderTextColor={COLORS.textLight}
          value={diagnosis}
          onChangeText={setDiagnosis}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Consultation Notes</Text>
        <TextInput
          style={[styles.fieldInput, styles.fieldInputMultiline]}
          placeholder="Additional notes..."
          placeholderTextColor={COLORS.textLight}
          value={consultationNotes}
          onChangeText={setConsultationNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={styles.prescriptionBtn}
        onPress={() => setShowPrescriptionModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="medkit-outline" size={wp(4)} color={COLORS.white} />
        <Text style={styles.prescriptionBtnText}>
          {selectedPrescription ? '📝 Change Prescription' : '💊 Select Prescription'}
        </Text>
        {selectedPrescription && (
          <View style={styles.prescriptionSelected}>
            <Text style={styles.prescriptionSelectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>

      {selectedPrescription && (
        <View style={styles.prescriptionPreview}>
          <Text style={styles.previewLabel}>Selected: {selectedPrescription.name}</Text>
          <Text style={styles.previewText} numberOfLines={2}>
            {selectedPrescription.isCustom ? customMedicines : selectedPrescription.medicines}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={completeConsultation}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.success, '#059669']}
          style={styles.submitGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Ionicons name="send-outline" size={wp(4.5)} color={COLORS.white} />
              <Text style={styles.submitText}>Send to Pharmacy</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ── Render Prescription Modal ───────────────────────────────────────
  const renderPrescriptionModal = () => (
    <Modal
      visible={showPrescriptionModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPrescriptionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, SHADOWS.large]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.modalTitle}>💊 Prescription</Text>
            <TouchableOpacity onPress={() => setShowPrescriptionModal(false)}>
              <Ionicons name="close" size={wp(5)} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalPatientName}>{patient?.name}</Text>
            <Text style={styles.modalPatientToken}>Token: {patient?.token}</Text>

            <Text style={styles.modalLabel}>Select Template</Text>
            <View style={styles.templatesGrid}>
              {prescriptionTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    selectedPrescription?.id === template.id && styles.templateCardActive,
                  ]}
                  onPress={() => setSelectedPrescription(template)}
                >
                  <Text style={[
                    styles.templateName,
                    selectedPrescription?.id === template.id && { color: COLORS.primary }
                  ]}>
                    {template.name}
                  </Text>
                  {!template.isCustom && (
                    <Text style={styles.templatePreview} numberOfLines={1}>
                      {template.medicines.substring(0, 25)}...
                    </Text>
                  )}
                  {template.isCustom && (
                    <Ionicons name="create-outline" size={wp(4)} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selectedPrescription?.isCustom && (
              <View style={styles.customFields}>
                <Text style={styles.modalLabel}>Medicines *</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="e.g., Aspirin 75mg (1x daily)"
                  placeholderTextColor={COLORS.textLight}
                  value={customMedicines}
                  onChangeText={setCustomMedicines}
                />
                <Text style={styles.modalLabel}>Duration</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="e.g., 30 days"
                  placeholderTextColor={COLORS.textLight}
                  value={customDuration}
                  onChangeText={setCustomDuration}
                />
                <Text style={styles.modalLabel}>Advice</Text>
                <TextInput
                  style={[styles.customInput, styles.customInputMultiline]}
                  placeholder="Additional advice..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                  value={customAdvice}
                  onChangeText={setCustomAdvice}
                />
              </View>
            )}

            {selectedPrescription && !selectedPrescription.isCustom && (
              <View style={styles.templatePreviewCard}>
                <Text style={styles.previewLabel}>📋 Preview</Text>
                <View style={styles.previewItem}>
                  <Text style={styles.previewItemLabel}>Medicines:</Text>
                  <Text style={styles.previewItemValue}>{selectedPrescription.medicines}</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewItemLabel}>Duration:</Text>
                  <Text style={styles.previewItemValue}>{selectedPrescription.duration}</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewItemLabel}>Advice:</Text>
                  <Text style={styles.previewItemValue}>{selectedPrescription.advice}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.border }]}
                onPress={() => setShowPrescriptionModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.success }]}
                onPress={() => {
                  if (!selectedPrescription) {
                    Alert.alert('Required', 'Please select a prescription template.');
                    return;
                  }
                  if (selectedPrescription.isCustom && !customMedicines.trim()) {
                    Alert.alert('Required', 'Please enter medicine details.');
                    return;
                  }
                  setShowPrescriptionModal(false);
                  Alert.alert('✅ Prescription Selected', 'Prescription has been set.');
                }}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.white }]}>Select</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (!patient) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.2 }}
          style={styles.gradientBackground}
        />
        {renderHeader()}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderPatientInfo()}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.2 }}
        style={styles.gradientBackground}
      />

      {renderHeader()}

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderPatientInfo()}
          {renderConsultationForm()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine • CDA Hospital Islamabad</Text>
            <Text style={styles.footerSub}>Cardiology Department</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderPrescriptionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(25),
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
    paddingTop: hp(0.5),
  },

  // ─── Header ──────────────────────────────────────────────────────────
  headerGradient: {
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : hp(0.8),
    paddingBottom: hp(1.2),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  headerSub: {
    color: COLORS.white + '80',
    fontSize: wp(2.8),
    marginTop: hp(0.05),
  },
  headerRight: {
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
    gap: wp(1),
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff88',
  },
  liveText: {
    color: COLORS.white,
    fontSize: wp(2.2),
    fontWeight: '700',
  },

  // ─── Patient Card ──────────────────────────────────────────────────
  patientCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: wp(3),
  },
  avatarGradient: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  patientInfo: {
    flex: 1,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  tokenNumber: {
    fontSize: wp(4.5),
    fontWeight: '800',
    color: COLORS.primary,
  },
  priorityBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.15),
    borderRadius: wp(1.5),
  },
  priorityText: {
    color: COLORS.white,
    fontSize: wp(2.2),
    fontWeight: '700',
  },
  patientName: {
    fontSize: wp(5),
    fontWeight: '700',
    color: COLORS.text,
  },
  patientMeta: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: hp(1),
  },

  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  detailValue: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(0.05),
  },
  detailDivider: {
    width: 1,
    height: hp(3.5),
    backgroundColor: COLORS.border,
  },

  allergyWarning: {
    flexDirection: 'row',
    backgroundColor: COLORS.danger + '12',
    padding: wp(2),
    borderRadius: wp(2),
    marginTop: hp(0.8),
    alignItems: 'center',
    gap: wp(1.5),
  },
  allergyText: {
    color: COLORS.danger,
    fontSize: wp(2.8),
    fontWeight: '500',
  },

  // ─── Consultation Form ──────────────────────────────────────────────
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1.5),
  },
  formRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(1),
  },
  formField: {
    marginBottom: hp(1),
  },
  fieldLabel: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: hp(0.2),
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    padding: wp(2.5),
    fontSize: wp(3),
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
  },
  fieldInputMultiline: {
    minHeight: hp(5),
    textAlignVertical: 'top',
  },

  prescriptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: wp(3),
    borderRadius: wp(2.5),
    marginBottom: hp(1),
    gap: wp(2),
  },
  prescriptionBtnText: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: '600',
    flex: 1,
  },
  prescriptionSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescriptionSelectedText: {
    color: COLORS.success,
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },

  prescriptionPreview: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: wp(2.5),
    borderRadius: wp(2),
    marginBottom: hp(1),
  },
  previewLabel: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.text,
  },
  previewText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },

  submitBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
    marginTop: hp(0.5),
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.6),
    gap: wp(2),
  },
  submitText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '700',
  },

  // ─── Empty State ──────────────────────────────────────────────────────
  emptyCard: {
    alignItems: 'center',
    padding: wp(8),
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  emptyTitle: {
    fontSize: wp(5),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: hp(1),
  },
  emptySub: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.2),
  },
  emptyBtn: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.2),
    borderRadius: wp(3),
    marginTop: hp(2),
  },
  emptyBtnText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // ─── Footer ──────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: hp(2),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footerSub: {
    fontSize: wp(2.5),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },

  // ─── Modal ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.92,
    maxHeight: height * 0.88,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  modalBody: {
    padding: wp(4),
  },
  modalPatientName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalPatientToken: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginBottom: hp(1),
  },
  modalLabel: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },

  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    marginBottom: hp(1),
  },
  templateCard: {
    width: (width * 0.84 - wp(6)) / 2,
    padding: wp(2.5),
    borderRadius: wp(2.5),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  templateCardActive: {
    backgroundColor: COLORS.primary + '08',
    borderColor: COLORS.primary,
  },
  templateName: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  templatePreview: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },

  customFields: {
    marginTop: hp(0.5),
  },
  customInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    padding: wp(2.5),
    fontSize: wp(3.2),
    color: COLORS.text,
    marginBottom: hp(0.5),
    backgroundColor: COLORS.backgroundSecondary,
  },
  customInputMultiline: {
    minHeight: hp(6),
    textAlignVertical: 'top',
  },

  templatePreviewCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(2.5),
    padding: wp(3),
    marginTop: hp(0.5),
  },
  previewItem: {
    paddingVertical: hp(0.15),
  },
  previewItemLabel: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  previewItemValue: {
    fontSize: wp(2.8),
    color: COLORS.text,
  },

  modalActions: {
    flexDirection: 'row',
    gap: wp(2),
    marginTop: hp(1.5),
  },
  modalBtn: {
    flex: 1,
    paddingVertical: hp(1.2),
    borderRadius: wp(2.5),
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
});

export default CallNextPatientScreen;

/*listen me
is screen mn mtlab is code mn add kro limitation back py hr entry py, means abhi agr hint mn 120/80 likha hwa tw doctor just numbering add kry r / yeh etc khud hi add ho jay
bakioo ka bhi aesy hi han chaieye
doctor ko facilitate kro k wo km time lgayy r queue ko khtam kry wo, so plzz is cheez py focus kro
cardiology ki bhut ziada diseases han r medicines han tw appointment ka ccording filter kr k add kro r bhut sari kro, thori si nahi, doctor medicine ka name search kry mg filter kry r add kr dy prescription mn, isi trah process ho k prescription bny
prescription ka full template bhi hna chaieye like patient ka data r neechy doctor ki info r yeh wo, usy pharmacy py bheja jay

entry k bad yeh process hny k bad buttn pr add ho k send to pharmacy like now, mtlab yeh button khud hi ana chiaye scroll ho k r doctor easily done kry 

pharmacy send krny k bad yeh option mt lgao k back to portal, obviously patient done ho gya hai tw doctor ko portal py hi ajna hai, so usy udr hi bhejo plzz, yeh cheez ghalat lg rhi hai last notifi wali

r han jo bhi add krp notifi/card/ template....everything must be in a theme foloow*/
