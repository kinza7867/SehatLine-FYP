// src/screens/doctor/CallNextPatientScreen.js
import React, { useState, useEffect, useRef } from 'react';
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
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const QUEUE_KEY = '@sehatline_queue';
const CONSULTATION_HISTORY_KEY = '@sehatline_consultation_history';

// ─── CARDIOLOGY DIAGNOSIS (A-Z) ──────────────────────────────────────
const CARDIOLOGY_DIAGNOSIS = [
  'Acute Coronary Syndrome',
  'Aortic Regurgitation',
  'Aortic Stenosis',
  'Arrhythmia',
  'Atrial Fibrillation',
  'Atrial Flutter',
  'Bradycardia',
  'Cardiac Arrest',
  'Cardiomyopathy',
  'Congenital Heart Disease',
  'Congestive Heart Failure',
  'Coronary Artery Disease',
  'Dilated Cardiomyopathy',
  'Endocarditis',
  'Heart Block',
  'Heart Failure',
  'Hypertension',
  'Hypertrophic Cardiomyopathy',
  'Ischemic Heart Disease',
  'Mitral Regurgitation',
  'Mitral Stenosis',
  'Mitral Valve Prolapse',
  'Myocardial Infarction (NSTEMI)',
  'Myocardial Infarction (STEMI)',
  'Myocarditis',
  'Pericarditis',
  'Peripheral Artery Disease',
  'Pulmonary Embolism',
  'Pulmonary Hypertension',
  'Rheumatic Heart Disease',
  'Supraventricular Tachycardia',
  'Tachycardia',
  'Valvular Heart Disease',
  'Ventricular Fibrillation',
  'Ventricular Tachycardia',
];

// ─── CARDIOLOGY MEDICINES (A-Z) ──────────────────────────────────────
const CARDIOLOGY_MEDICINES = [
  'Amiodarone 100mg',
  'Amiodarone 200mg',
  'Amlodipine 5mg',
  'Amlodipine 10mg',
  'Apixaban 2.5mg',
  'Apixaban 5mg',
  'Aspirin 75mg',
  'Aspirin 150mg',
  'Atenolol 25mg',
  'Atenolol 50mg',
  'Atenolol 100mg',
  'Atorvastatin 10mg',
  'Atorvastatin 20mg',
  'Atorvastatin 40mg',
  'Atorvastatin 80mg',
  'Bisoprolol 2.5mg',
  'Bisoprolol 5mg',
  'Captopril 25mg',
  'Captopril 50mg',
  'Carvedilol 3.125mg',
  'Carvedilol 6.25mg',
  'Carvedilol 12.5mg',
  'Carvedilol 25mg',
  'Clopidogrel 75mg',
  'Digoxin 0.125mg',
  'Digoxin 0.25mg',
  'Diltiazem 30mg',
  'Diltiazem 60mg',
  'Enalapril 5mg',
  'Enalapril 10mg',
  'Empagliflozin 10mg',
  'Empagliflozin 25mg',
  'Furosemide 20mg',
  'Furosemide 40mg',
  'Hydrochlorothiazide 12.5mg',
  'Hydrochlorothiazide 25mg',
  'Isosorbide Mononitrate 10mg',
  'Isosorbide Mononitrate 20mg',
  'Ivabradine 5mg',
  'Ivabradine 7.5mg',
  'Lisinopril 5mg',
  'Lisinopril 10mg',
  'Losartan 25mg',
  'Losartan 50mg',
  'Losartan 100mg',
  'Metoprolol 25mg',
  'Metoprolol 50mg',
  'Metoprolol 100mg',
  'Nitroglycerin 0.4mg (SL)',
  'Ramipril 2.5mg',
  'Ramipril 5mg',
  'Ramipril 10mg',
  'Rivaroxaban 15mg',
  'Rivaroxaban 20mg',
  'Rosuvastatin 10mg',
  'Rosuvastatin 20mg',
  'Sacubitril/Valsartan 49/51mg',
  'Sacubitril/Valsartan 97/103mg',
  'Spironolactone 25mg',
  'Spironolactone 50mg',
  'Telmisartan 40mg',
  'Telmisartan 80mg',
  'Ticagrelor 90mg',
  'Valsartan 80mg',
  'Valsartan 160mg',
  'Warfarin 2mg',
  'Warfarin 5mg',
];

// ─── CARDIOLOGY LAB TESTS (A-Z) ──────────────────────────────────────
const CARDIOLOGY_LAB_TESTS = [
  '2D Echocardiography',
  'ABG (Arterial Blood Gas)',
  'BNP (Brain Natriuretic Peptide)',
  'CBC (Complete Blood Count)',
  'CK-MB',
  'CRP (C-Reactive Protein)',
  'Cardiac MRI',
  'Chest X-Ray',
  'Coronary Angiography',
  'CT Coronary Angiography',
  'D-Dimer',
  'ECG (12-Lead)',
  'ESR',
  'HbA1c',
  'Holter Monitoring',
  'LFT (Liver Function Test)',
  'Lipid Profile',
  'NT-proBNP',
  'PT/INR',
  'RFT (Renal Function Test)',
  'Serum Creatinine',
  'Serum Electrolytes',
  'Stress Test (Treadmill)',
  'Troponin I',
  'Troponin T',
  'Urine Complete Examination',
];

// ─── ADVICE ──────────────────────────────────────────────────────────
const PATIENT_ADVICE = [
  'Avoid Heavy Exercise',
  'Avoid Smoking',
  'Continue Current Medicines',
  'Follow Previous Advice',
  'Follow-up after 1 Month',
  'Follow-up after 2 Weeks',
  'Low Salt Diet',
  'Monitor BP Daily',
  'Monitor Weight Daily',
  'Review Reports',
  'Stop Smoking',
];

// ─── MEDICINE DURATIONS ──────────────────────────────────────────────
const MEDICINE_DURATIONS = [
  '1 Day',
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
  '21 Days',
  '1 Month',
  '3 Months',
  '6 Months',
  '1 Year',
  'Lifelong',
];

// ─── MEDICINE INSTRUCTIONS ──────────────────────────────────────────
const MEDICINE_INSTRUCTIONS = [
  'Take with food',
  'Take on empty stomach',
  'Take after breakfast',
  'Take after dinner',
  'Before breakfast',
  'Before bedtime',
  'As directed by doctor',
  'Do not crush or chew',
  'Take with plenty of water',
];

const CallNextPatientScreen = ({ navigation, route }) => {
  const patient = route?.params?.patient;
  const doctorData = route?.params?.doctor || {};
  const doctorName = doctorData.name || 'Dr. Doctor';
  const onComplete = route?.params?.onComplete;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [isLastPatient, setIsLastPatient] = useState(false);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ─── SELECTOR STATE ──────────────────────────────────────────────
  const [activeSelector, setActiveSelector] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');

  // ─── NOTIFICATION STATE ──────────────────────────────────────────
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  // ─── DIAGNOSIS ──────────────────────────────────────────────────
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [filteredDiagnosis, setFilteredDiagnosis] = useState(CARDIOLOGY_DIAGNOSIS);

  // ─── MEDICINES ──────────────────────────────────────────────────
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState(CARDIOLOGY_MEDICINES);
  const [currentMedicine, setCurrentMedicine] = useState({
    name: '',
    duration: '7 Days',
    instruction: '',
  });

  // ─── LAB TESTS ──────────────────────────────────────────────────
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState(CARDIOLOGY_LAB_TESTS);

  // ─── ADVICE ─────────────────────────────────────────────────────
  const [selectedAdvice, setSelectedAdvice] = useState([]);
  const [filteredAdvice, setFilteredAdvice] = useState(PATIENT_ADVICE);
  const [customAdvice, setCustomAdvice] = useState('');

  // ─── NOTES ──────────────────────────────────────────────────────
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadQueueData();
  }, []);

  const loadQueueData = async () => {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      if (queueData) {
        const queue = JSON.parse(queueData);
        const waiting = queue.filter(p => p.status === 'Waiting' || p.status === 'Called');
        setQueueCount(waiting.length);
        
        if (patient) {
          const currentIndex = queue.findIndex(p => p.id === patient.id);
          const remaining = queue.filter((p, index) => 
            index > currentIndex && (p.status === 'Waiting' || p.status === 'Called')
          );
          setIsLastPatient(remaining.length === 0 && waiting.length <= 1);
        }
      }
    } catch (error) {
      console.error('Error loading queue data:', error);
    }
  };

  // ─── FILTER FUNCTIONS ────────────────────────────────────────────
  const filterDiagnosis = (search) => {
    const q = search.toLowerCase();
    setFilteredDiagnosis(CARDIOLOGY_DIAGNOSIS.filter(d => d.toLowerCase().includes(q)));
  };

  const filterMedicines = (search) => {
    const q = search.toLowerCase();
    setFilteredMedicines(CARDIOLOGY_MEDICINES.filter(m => m.toLowerCase().includes(q)));
  };

  const filterLabs = (search) => {
    const q = search.toLowerCase();
    setFilteredLabs(CARDIOLOGY_LAB_TESTS.filter(l => l.toLowerCase().includes(q)));
  };

  const filterAdvice = (search) => {
    const q = search.toLowerCase();
    setFilteredAdvice(PATIENT_ADVICE.filter(a => a.toLowerCase().includes(q)));
  };

  // ─── DIAGNOSIS FUNCTIONS ──────────────────────────────────────────
  const toggleDiagnosis = (diagnosis) => {
    if (selectedDiagnoses.includes(diagnosis)) {
      setSelectedDiagnoses(selectedDiagnoses.filter(d => d !== diagnosis));
    } else {
      setSelectedDiagnoses([...selectedDiagnoses, diagnosis]);
    }
  };

  const removeDiagnosis = (diagnosis) => {
    setSelectedDiagnoses(selectedDiagnoses.filter(d => d !== diagnosis));
  };

  // ─── MEDICINE FUNCTIONS ───────────────────────────────────────────
  const selectMedicine = (name) => {
    setCurrentMedicine({ ...currentMedicine, name });
  };

  const addMedicine = () => {
    if (!currentMedicine.name) {
      Alert.alert('Required', 'Please select a medicine.');
      return;
    }
    
    const medicineEntry = {
      id: Date.now().toString(),
      name: currentMedicine.name,
      duration: currentMedicine.duration,
      instruction: currentMedicine.instruction || 'N/A',
    };
    
    setSelectedMedicines([...selectedMedicines, medicineEntry]);
    setCurrentMedicine({
      name: '',
      duration: '7 Days',
      instruction: '',
    });
    setActiveSelector(null);
    setSelectorSearch('');
    setShowSearch(false);
  };

  const removeMedicine = (id) => {
    setSelectedMedicines(selectedMedicines.filter(m => m.id !== id));
  };

  // ─── LAB TEST FUNCTIONS ────────────────────────────────────────────
  const toggleLabTest = (test) => {
    if (selectedLabTests.includes(test)) {
      setSelectedLabTests(selectedLabTests.filter(l => l !== test));
    } else {
      setSelectedLabTests([...selectedLabTests, test]);
    }
  };

  const removeLabTest = (test) => {
    setSelectedLabTests(selectedLabTests.filter(l => l !== test));
  };

  // ─── ADVICE FUNCTIONS ─────────────────────────────────────────────
  const toggleAdvice = (advice) => {
    if (selectedAdvice.includes(advice)) {
      setSelectedAdvice(selectedAdvice.filter(a => a !== advice));
    } else {
      setSelectedAdvice([...selectedAdvice, advice]);
    }
  };

  const removeAdvice = (advice) => {
    setSelectedAdvice(selectedAdvice.filter(a => a !== advice));
  };

  const addCustomAdvice = () => {
    if (customAdvice.trim()) {
      setSelectedAdvice([...selectedAdvice, customAdvice.trim()]);
      setCustomAdvice('');
    }
  };

  // ─── COMPLETE CONSULTATION ──────────────────────────────────────────
  const completeConsultation = async (type) => {
    if (!patient) {
      Alert.alert('Error', 'No patient found.');
      return;
    }

    if (selectedDiagnoses.length === 0) {
      Alert.alert('Required', 'Please select at least one diagnosis.');
      return;
    }

    // Either medicines OR lab tests must be present
    if (selectedMedicines.length === 0 && selectedLabTests.length === 0) {
      Alert.alert('Required', 'Please prescribe at least one medicine or select a lab test.');
      return;
    }

    setIsSubmitting(true);

    try {
      const allAdvice = [...selectedAdvice];
      
      const consultationData = {
        patientId: patient.id,
        patientName: patient.name,
        patientToken: patient.token,
        diagnoses: selectedDiagnoses.join(', '),
        medicines: selectedMedicines.length > 0 ? selectedMedicines.map(m => 
          `${m.name} x ${m.duration} (${m.instruction})`
        ).join('\n') : 'None',
        labTests: selectedLabTests.length > 0 ? selectedLabTests.join(', ') : 'None',
        advice: allAdvice.length > 0 ? allAdvice.join(', ') : 'None',
        notes: notes || 'N/A',
        doctorName: doctorName,
        department: doctorData.department || 'Cardiology',
        hospital: doctorData.hospital || 'Capital Hospital CDA',
        completedAt: new Date().toISOString(),
        type: type,
      };

      const existingCompleted = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      const completedList = existingCompleted ? JSON.parse(existingCompleted) : [];
      completedList.unshift({ ...consultationData, id: patient.id });
      await AsyncStorage.setItem(COMPLETED_PATIENTS_KEY, JSON.stringify(completedList));

      const existingHistory = await AsyncStorage.getItem(CONSULTATION_HISTORY_KEY);
      const historyList = existingHistory ? JSON.parse(existingHistory) : [];
      historyList.unshift({
        ...consultationData,
        id: `hist_${Date.now()}`,
        completedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(CONSULTATION_HISTORY_KEY, JSON.stringify(historyList));

      const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
      let updatedQueue = [];
      let nextPatientData = null;
      
      if (existingQueue) {
        const queueList = JSON.parse(existingQueue);
        updatedQueue = queueList.filter((p) => p.id !== patient.id);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
        
        const waitingPatients = updatedQueue.filter(p => p.status === 'Waiting' || p.status === 'Called');
        nextPatientData = waitingPatients.length > 0 ? waitingPatients[0] : null;
        setQueueCount(waitingPatients.length);
        setIsLastPatient(waitingPatients.length === 0);
      }

      if (onComplete) {
        onComplete(patient, consultationData);
      }

      resetForm();

      // Show beautiful notification
      const isPharmacy = type === 'pharmacy';
      const iconName = isPharmacy ? 'medkit' : 'flask';
      const title = isPharmacy ? 'Sent to Pharmacy' : 'Referred to Lab';
      const message = isPharmacy 
        ? `${patient.name} sent to Pharmacy with ${selectedMedicines.length} medicines`
        : `${patient.name} referred to Lab with ${selectedLabTests.length} tests`;

      showNotificationModal({
        title,
        message,
        iconName,
        patientName: patient.name,
        nextPatient: nextPatientData,
        isPharmacy,
      });

    } catch (error) {
      console.error('Error in completeConsultation:', error);
      Alert.alert('Error', 'Failed to complete consultation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── SHOW NOTIFICATION ─────────────────────────────────────────────
  const showNotificationModal = (data) => {
    setNotificationData(data);
    setShowNotification(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowNotification(false);
      navigation.navigate('DoctorHome');
    });
  };

  // ─── RESET FORM ──────────────────────────────────────────────────
  const resetForm = () => {
    setSelectedDiagnoses([]);
    setSelectedMedicines([]);
    setSelectedLabTests([]);
    setSelectedAdvice([]);
    setCustomAdvice('');
    setNotes('');
    setCurrentMedicine({
      name: '',
      duration: '7 Days',
      instruction: '',
    });
  };

  // ─── OPEN SELECTOR ────────────────────────────────────────────────
  const openSelector = (type) => {
    setActiveSelector(type);
    setShowSearch(false);
    setSelectorSearch('');
    if (type === 'diagnosis') filterDiagnosis('');
    else if (type === 'medicine') filterMedicines('');
    else if (type === 'lab') filterLabs('');
    else if (type === 'advice') filterAdvice('');
  };

  // ─── TOGGLE SEARCH ─────────────────────────────────────────────────
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSelectorSearch('');
      if (activeSelector === 'diagnosis') filterDiagnosis('');
      else if (activeSelector === 'medicine') filterMedicines('');
      else if (activeSelector === 'lab') filterLabs('');
      else if (activeSelector === 'advice') filterAdvice('');
    }
  };

  // ─── RENDER HEADER ──────────────────────────────────────────────────
  const renderHeader = () => (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerGradient}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('DoctorHome')}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>Consultation</Text>
          </View>
          <View style={styles.queueBadge}>
            <Ionicons name="people" size={16} color={COLORS.white} />
            <Text style={styles.queueBadgeText}>{queueCount}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // ─── RENDER PATIENT INFO ────────────────────────────────────────────
  const renderPatientInfo = () => (
    <View style={[styles.patientCard, SHADOWS.medium]}>
      <View style={styles.patientRow}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.patientAvatar}>
          <Text style={styles.patientAvatarText}>{patient?.name?.charAt(0) || 'P'}</Text>
        </LinearGradient>
        <View style={styles.patientInfo}>
          <View style={styles.tokenRow}>
            <Text style={styles.tokenNumber}>Token #{patient?.token || '—'}</Text>
            {patient?.priority && patient.priority !== 'Normal' && (
              <View style={[styles.priorityBadge, { backgroundColor: patient.priority === 'Emergency' ? COLORS.danger : COLORS.warning }]}>
                <Text style={styles.priorityText}>{patient.priority}</Text>
              </View>
            )}
          </View>
          <Text style={styles.patientName}>{patient?.name}</Text>
          <Text style={styles.patientMeta}>
            {patient?.age || 'N/A'} yrs • {patient?.gender || 'N/A'} • {patient?.type || 'General'}
          </Text>
          <Text style={styles.patientReason}>
            <Ionicons name="time-outline" size={wp(2.5)} color={COLORS.textLight} /> 
            {patient?.time || 'Appointment at 10:00 AM'}
          </Text>
        </View>
      </View>

      <View style={styles.queueStatus}>
        <View style={styles.queueStatusItem}>
          <Ionicons name="calendar-outline" size={wp(3.5)} color={COLORS.primary} />
          <Text style={styles.queueStatusText}>{new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.queueStatusDivider} />
        <View style={styles.queueStatusItem}>
          <Ionicons name="people-outline" size={wp(3.5)} color={COLORS.primary} />
          <Text style={styles.queueStatusText}>{queueCount} in queue</Text>
        </View>
        <View style={styles.queueStatusDivider} />
        <View style={styles.queueStatusItem}>
          {isLastPatient ? (
            <>
              <Ionicons name="checkmark-circle" size={wp(3.5)} color={COLORS.success} />
              <Text style={[styles.queueStatusText, { color: COLORS.success, fontWeight: '600' }]}>Last Patient</Text>
            </>
          ) : (
            <>
              <Ionicons name="hourglass-outline" size={wp(3.5)} color={COLORS.warning} />
              <Text style={[styles.queueStatusText, { color: COLORS.warning }]}>In Progress</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );

  // ─── RENDER FORM ────────────────────────────────────────────────────
  const renderForm = () => (
    <View style={[styles.formCard, SHADOWS.small]}>
      <Text style={styles.formTitle}>Consultation</Text>

      {/* Diagnosis - Required */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Diagnosis *</Text>
        <TouchableOpacity style={styles.selectorTrigger} onPress={() => openSelector('diagnosis')}>
          <Text style={[styles.selectorTriggerText, selectedDiagnoses.length === 0 && styles.placeholderText]}>
            {selectedDiagnoses.length > 0 ? `${selectedDiagnoses.length} diagnoses selected` : 'Select diagnosis...'}
          </Text>
          <Ionicons name="chevron-down" size={wp(4)} color={COLORS.textLight} />
        </TouchableOpacity>
        {selectedDiagnoses.length > 0 && (
          <View style={styles.chipContainer}>
            {selectedDiagnoses.map((diagnosis, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{diagnosis}</Text>
                <TouchableOpacity onPress={() => removeDiagnosis(diagnosis)}>
                  <Ionicons name="close-circle" size={wp(3)} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Medicines - Optional */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Medicines</Text>
        <TouchableOpacity style={styles.selectorTrigger} onPress={() => openSelector('medicine')}>
          <Text style={[styles.selectorTriggerText, selectedMedicines.length === 0 && styles.placeholderText]}>
            {selectedMedicines.length > 0 ? `${selectedMedicines.length} medicines prescribed` : 'Select medicine...'}
          </Text>
          <Ionicons name="chevron-down" size={wp(4)} color={COLORS.textLight} />
        </TouchableOpacity>
        {selectedMedicines.length > 0 && (
          <View style={styles.medicineList}>
            {selectedMedicines.map((medicine) => (
              <View key={medicine.id} style={styles.medicineCard}>
                <View style={styles.medicineHeader}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <TouchableOpacity onPress={() => removeMedicine(medicine.id)}>
                    <Ionicons name="close-circle" size={wp(3.5)} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
                <View style={styles.medicineDetails}>
                  <Text style={styles.medicineDetail}>{medicine.duration}</Text>
                </View>
                {medicine.instruction && medicine.instruction !== 'N/A' && (
                  <Text style={styles.medicineInstruction}>Note: {medicine.instruction}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Lab Tests - Optional */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Lab Tests</Text>
        <TouchableOpacity style={styles.selectorTrigger} onPress={() => openSelector('lab')}>
          <Text style={[styles.selectorTriggerText, selectedLabTests.length === 0 && styles.placeholderText]}>
            {selectedLabTests.length > 0 ? `${selectedLabTests.length} tests selected` : 'Select lab tests...'}
          </Text>
          <Ionicons name="chevron-down" size={wp(4)} color={COLORS.textLight} />
        </TouchableOpacity>
        {selectedLabTests.length > 0 && (
          <View style={styles.chipContainer}>
            {selectedLabTests.map((test, idx) => (
              <View key={idx} style={[styles.chip, styles.chipLab]}>
                <Text style={[styles.chipText, styles.chipLabText]}>{test}</Text>
                <TouchableOpacity onPress={() => removeLabTest(test)}>
                  <Ionicons name="close-circle" size={wp(3)} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Advice */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Advice</Text>
        <TouchableOpacity style={styles.selectorTrigger} onPress={() => openSelector('advice')}>
          <Text style={[styles.selectorTriggerText, selectedAdvice.length === 0 && styles.placeholderText]}>
            {selectedAdvice.length > 0 ? `${selectedAdvice.length} advice selected` : 'Select advice...'}
          </Text>
          <Ionicons name="chevron-down" size={wp(4)} color={COLORS.textLight} />
        </TouchableOpacity>
        {selectedAdvice.length > 0 && (
          <View style={styles.chipContainer}>
            {selectedAdvice.map((advice, idx) => (
              <View key={idx} style={[styles.chip, styles.chipAdvice]}>
                <Text style={[styles.chipText, styles.chipAdviceText]}>{advice}</Text>
                <TouchableOpacity onPress={() => removeAdvice(advice)}>
                  <Ionicons name="close-circle" size={wp(3)} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {/* Custom Advice Input */}
        <View style={styles.customAdviceContainer}>
          <TextInput
            style={styles.customAdviceInput}
            placeholder="Add custom advice..."
            placeholderTextColor={COLORS.textLight}
            value={customAdvice}
            onChangeText={setCustomAdvice}
          />
          <TouchableOpacity 
            style={[styles.customAdviceBtn, !customAdvice.trim() && styles.customAdviceBtnDisabled]}
            onPress={addCustomAdvice}
            disabled={!customAdvice.trim()}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.customAdviceGradient}
            >
              <Ionicons name="add" size={wp(4)} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Clinical Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add clinical notes (optional)..."
          placeholderTextColor={COLORS.textLight}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Pharmacy Button - Active only when medicines selected */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.pharmacyBtn, (selectedMedicines.length === 0 || isSubmitting) && styles.actionBtnDisabled]}
          onPress={() => completeConsultation('pharmacy')}
          disabled={selectedMedicines.length === 0 || isSubmitting}
        >
          <LinearGradient
            colors={selectedMedicines.length > 0 ? [COLORS.success, '#059669'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.actionGradient}
          >
            <Ionicons name="medkit" size={wp(4.5)} color={COLORS.white} />
            <Text style={styles.actionBtnText}>Refer to Pharmacy</Text>
            {selectedMedicines.length > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{selectedMedicines.length}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Lab Button - Active only when lab tests selected */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.labBtn, (selectedLabTests.length === 0 || isSubmitting) && styles.actionBtnDisabled]}
          onPress={() => completeConsultation('lab')}
          disabled={selectedLabTests.length === 0 || isSubmitting}
        >
          <LinearGradient
            colors={selectedLabTests.length > 0 ? [COLORS.info, '#2563EB'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.actionGradient}
          >
            <Ionicons name="flask" size={wp(4.5)} color={COLORS.white} />
            <Text style={styles.actionBtnText}>Refer to Laboratory</Text>
            {selectedLabTests.length > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{selectedLabTests.length}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Complete Consultation Button - Active when diagnosis + (medicines OR lab tests) */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.completeBtn, ((selectedDiagnoses.length === 0 || (selectedMedicines.length === 0 && selectedLabTests.length === 0)) || isSubmitting) && styles.actionBtnDisabled]}
          onPress={() => {
            Alert.alert(
              'Complete Consultation',
              `Finish consultation for ${patient?.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Complete',
                  onPress: () => completeConsultation('complete')
                }
              ]
            );
          }}
          disabled={selectedDiagnoses.length === 0 || (selectedMedicines.length === 0 && selectedLabTests.length === 0) || isSubmitting}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.actionGradient}
          >
            <Ionicons name="checkmark-done" size={wp(4.5)} color={COLORS.white} />
            <Text style={styles.actionBtnText}>Complete Consultation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── SELECTOR MODAL ──────────────────────────────────────────────────
  const renderSelector = () => {
    if (!activeSelector) return null;

    const getContent = () => {
      switch (activeSelector) {
        case 'diagnosis':
          return {
            title: 'Select Diagnoses',
            data: filteredDiagnosis,
            selected: selectedDiagnoses,
            toggle: toggleDiagnosis,
            multiSelect: true,
            placeholder: 'Search diagnoses...',
            onSearch: filterDiagnosis,
          };
        case 'medicine':
          return {
            title: 'Select Medicine',
            data: filteredMedicines,
            selected: currentMedicine.name,
            toggle: selectMedicine,
            multiSelect: false,
            placeholder: 'Search medicines...',
            onSearch: filterMedicines,
            isMedicine: true,
          };
        case 'lab':
          return {
            title: 'Select Lab Tests',
            data: filteredLabs,
            selected: selectedLabTests,
            toggle: toggleLabTest,
            multiSelect: true,
            placeholder: 'Search lab tests...',
            onSearch: filterLabs,
          };
        case 'advice':
          return {
            title: 'Select Advice',
            data: filteredAdvice,
            selected: selectedAdvice,
            toggle: toggleAdvice,
            multiSelect: true,
            placeholder: 'Search advice...',
            onSearch: filterAdvice,
          };
        default:
          return null;
      }
    };

    const content = getContent();
    if (!content) return null;

    const isMedicine = activeSelector === 'medicine';

    return (
      <Modal
        visible={true}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setActiveSelector(null);
          setShowSearch(false);
        }}
      >
        <View style={styles.selectorOverlay}>
          <TouchableOpacity 
            style={styles.selectorBackdrop} 
            activeOpacity={1} 
            onPress={() => {
              setActiveSelector(null);
              setShowSearch(false);
            }}
          />
          <View style={[styles.selectorContainer, SHADOWS.large]}>
            {/* Header */}
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>{content.title}</Text>
              <TouchableOpacity onPress={() => {
                setActiveSelector(null);
                setShowSearch(false);
              }}>
                <Ionicons name="close" size={wp(5)} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Search Toggle & Bar */}
            <View style={styles.selectorSearchRow}>
              {showSearch ? (
                <View style={styles.selectorSearchContainer}>
                  <Ionicons name="search" size={wp(4.5)} color={COLORS.textLight} />
                  <TextInput
                    style={styles.selectorSearchInput}
                    placeholder={content.placeholder}
                    placeholderTextColor={COLORS.textLight}
                    value={selectorSearch}
                    onChangeText={(text) => {
                      setSelectorSearch(text);
                      content.onSearch(text);
                    }}
                    autoFocus
                  />
                  <TouchableOpacity onPress={toggleSearch}>
                    <Ionicons name="close" size={wp(4.5)} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectorSearchToggle} onPress={toggleSearch}>
                  <Ionicons name="search" size={wp(4.5)} color={COLORS.primary} />
                  <Text style={styles.selectorSearchToggleText}>Search</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Medicine Extra Fields */}
            {isMedicine && (
              <View style={styles.medicineExtraFields}>
                <View style={styles.medicineExtraRow}>
                  <View style={[styles.medicineExtraField, { flex: 1 }]}>
                    <Text style={styles.medicineExtraLabel}>Duration</Text>
                    <TouchableOpacity 
                      style={styles.medicineExtraPicker}
                      onPress={() => {
                        Alert.alert(
                          'Select Duration',
                          '',
                          MEDICINE_DURATIONS.map(dur => ({
                            text: dur,
                            onPress: () => setCurrentMedicine({ ...currentMedicine, duration: dur })
                          }))
                        );
                      }}
                    >
                      <Text style={styles.medicineExtraPickerText}>{currentMedicine.duration}</Text>
                      <Ionicons name="chevron-down" size={wp(3.5)} color={COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.medicineExtraField, { flex: 1, marginLeft: wp(2) }]}>
                    <Text style={styles.medicineExtraLabel}>Instruction</Text>
                    <TouchableOpacity 
                      style={styles.medicineExtraPicker}
                      onPress={() => {
                        Alert.alert(
                          'Select Instruction',
                          '',
                          MEDICINE_INSTRUCTIONS.map(inst => ({
                            text: inst,
                            onPress: () => setCurrentMedicine({ ...currentMedicine, instruction: inst })
                          }))
                        );
                      }}
                    >
                      <Text style={[styles.medicineExtraPickerText, !currentMedicine.instruction && styles.placeholderText]}>
                        {currentMedicine.instruction || 'Select instruction...'}
                      </Text>
                      <Ionicons name="chevron-down" size={wp(3.5)} color={COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* List */}
            <FlatList
              data={content.data}
              keyExtractor={(item) => item}
              style={styles.selectorList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.selectorListItem,
                    content.multiSelect 
                      ? content.selected.includes(item) && styles.selectorListItemActive
                      : content.selected === item && styles.selectorListItemActive
                  ]}
                  onPress={() => {
                    content.toggle(item);
                    if (!content.multiSelect) {
                      setTimeout(() => {
                        setActiveSelector(null);
                        setShowSearch(false);
                      }, 200);
                    }
                  }}
                >
                  <Text style={[
                    styles.selectorListItemText,
                    content.multiSelect 
                      ? content.selected.includes(item) && styles.selectorListItemTextActive
                      : content.selected === item && styles.selectorListItemTextActive
                  ]}>
                    {item}
                  </Text>
                  {(content.multiSelect 
                    ? content.selected.includes(item)
                    : content.selected === item) && (
                    <Ionicons name="checkmark-circle" size={wp(4)} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              )}
            />

            {/* Action Buttons */}
            <View style={styles.selectorActions}>
              {isMedicine ? (
                <TouchableOpacity
                  style={[styles.selectorActionBtn, !currentMedicine.name && styles.selectorActionBtnDisabled]}
                  onPress={addMedicine}
                  disabled={!currentMedicine.name}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.selectorActionGradient}
                  >
                    <Ionicons name="add" size={wp(4.5)} color={COLORS.white} />
                    <Text style={styles.selectorActionBtnText}>Add Medicine</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.selectorActionBtn} 
                  onPress={() => {
                    setActiveSelector(null);
                    setShowSearch(false);
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.selectorActionGradient}
                  >
                    <Text style={styles.selectorActionBtnText}>
                      Done ({content.multiSelect ? content.selected.length : 0})
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ─── RENDER NOTIFICATION ──────────────────────────────────────────
  const renderNotification = () => {
    if (!showNotification || !notificationData) return null;

    const { title, message, iconName, patientName, nextPatient, isPharmacy } = notificationData;
    const colors = isPharmacy 
      ? [COLORS.success, '#059669'] 
      : [COLORS.info, '#ebde25'];

    return (
      <View style={styles.notificationOverlay}>
        <TouchableWithoutFeedback onPress={closeNotification}>
          <View style={styles.notificationBackdrop} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim }]}>
          <LinearGradient colors={colors} style={styles.notificationHeader}>
            <View style={styles.notificationIconContainer}>
              <Ionicons name={iconName} size={wp(8)} color={COLORS.white} />
            </View>
            <Text style={styles.notificationTitle}>{title}</Text>
            <Text style={styles.notificationSubtitle}>{patientName}</Text>
          </LinearGradient>

          <View style={styles.notificationBody}>
            <Text style={styles.notificationMessage}>{message}</Text>

            <View style={styles.notificationDivider} />

            <View style={styles.notificationQueueInfo}>
              <View style={styles.notificationQueueRow}>
                <Ionicons name="people" size={wp(4)} color={COLORS.primary} />
                <Text style={styles.notificationQueueText}>
                  {queueCount} {queueCount === 1 ? 'patient' : 'patients'} in queue
                </Text>
              </View>
            </View>

            {nextPatient && (
              <View style={styles.notificationNextPatient}>
                <Text style={styles.notificationNextLabel}>Next Patient</Text>
                <View style={styles.notificationNextCard}>
                  <Text style={styles.notificationNextToken}>Token #{nextPatient.token}</Text>
                  <Text style={styles.notificationNextName}>{nextPatient.name}</Text>
                  <Text style={styles.notificationNextMeta}>
                    {nextPatient.age || 'N/A'} yrs • {nextPatient.type || 'General'}
                  </Text>
                </View>
              </View>
            )}

            {!nextPatient && (
              <View style={styles.notificationEmptyQueue}>
                <Ionicons name="checkmark-circle" size={wp(6)} color={COLORS.success} />
                <Text style={styles.notificationEmptyText}>Queue is empty</Text>
                <Text style={styles.notificationEmptySub}>All patients attended</Text>
              </View>
            )}

            <TouchableOpacity style={styles.notificationBtn} onPress={closeNotification}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.notificationBtnGradient}
              >
                <Text style={styles.notificationBtnText}>
                  {nextPatient ? 'Call Next Patient' : 'Go to Portal'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  // ─── EMPTY STATE ──────────────────────────────────────────────────
  if (!patient) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={wp(15)} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Patient Found</Text>
            <Text style={styles.emptySub}>Please go back and select a patient</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('DoctorHome')}>
              <Text style={styles.emptyBtnText}>Go to Portal</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── MAIN RENDER ────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      <LinearGradient 
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 0, y: 0.15 }} 
        style={styles.gradientBackground} 
      />
      
      {renderHeader()}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderPatientInfo()}
            {renderForm()}
            <View style={styles.footer}>
              <Text style={styles.footerText}>SehatLine • {doctorData.hospital || 'Capital Hospital CDA'}</Text>
              <Text style={styles.footerSub}>{doctorData.department || 'Cardiology'} Department</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {renderSelector()}
      {renderNotification()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: hp(20) },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(4), paddingBottom: hp(4) },

  // Header
  headerGradient: { 
    paddingHorizontal: wp(4), 
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : hp(0.8), 
    paddingBottom: hp(1.2), 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    ...SHADOWS.medium 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' 
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white },
  headerTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: 'bold' },
  queueBadge: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: wp(2), paddingVertical: hp(0.3), 
    borderRadius: wp(3), gap: wp(1) 
  },
  queueBadgeText: { color: COLORS.white, fontSize: wp(3), fontWeight: '700' },

  // Patient Card
  patientCard: { 
    backgroundColor: COLORS.white, borderRadius: wp(4), 
    padding: wp(4), marginBottom: hp(1.5), 
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  patientRow: { flexDirection: 'row', alignItems: 'center' },
  patientAvatar: { 
    width: wp(14), height: wp(14), borderRadius: wp(7), 
    alignItems: 'center', justifyContent: 'center', marginRight: wp(3) 
  },
  patientAvatarText: { color: COLORS.white, fontSize: wp(5), fontWeight: 'bold' },
  patientInfo: { flex: 1 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  tokenNumber: { fontSize: wp(4.5), fontWeight: '800', color: COLORS.primary },
  priorityBadge: { paddingHorizontal: wp(2), paddingVertical: hp(0.15), borderRadius: wp(1.5) },
  priorityText: { color: COLORS.white, fontSize: wp(2.2), fontWeight: '700' },
  patientName: { fontSize: wp(5), fontWeight: '700', color: COLORS.text },
  patientMeta: { fontSize: wp(2.8), color: COLORS.textSecondary, marginTop: hp(0.1) },
  patientReason: { fontSize: wp(2.8), color: COLORS.textSecondary, marginTop: hp(0.2) },

  // Queue Status
  queueStatus: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around',
    marginTop: hp(1.5), 
    paddingTop: hp(1), 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border 
  },
  queueStatusItem: { flexDirection: 'row', alignItems: 'center', gap: wp(1) },
  queueStatusText: { fontSize: wp(2.6), color: COLORS.textSecondary },
  queueStatusDivider: { width: 1, height: 20, backgroundColor: COLORS.border },

  // Form
  formCard: { 
    backgroundColor: COLORS.white, borderRadius: wp(4), 
    padding: wp(4), marginBottom: hp(1.5), 
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  formTitle: { fontSize: wp(4), fontWeight: '700', color: COLORS.text, marginBottom: hp(1.5) },
  fieldGroup: { marginBottom: hp(1.2) },
  fieldLabel: { fontSize: wp(2.8), fontWeight: '600', color: COLORS.textSecondary, marginBottom: hp(0.2) },

  // Selector Trigger
  selectorTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    padding: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
  },
  selectorTriggerText: { fontSize: wp(3.2), color: COLORS.text, flex: 1 },
  placeholderText: { color: COLORS.textLight },

  // Chips
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(1.5), marginTop: hp(1) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(2),
    gap: wp(1),
  },
  chipText: { fontSize: wp(2.8), color: COLORS.primary, maxWidth: wp(30) },
  chipLab: { backgroundColor: COLORS.info + '12' },
  chipLabText: { color: COLORS.info },
  chipAdvice: { backgroundColor: COLORS.warning + '12' },
  chipAdviceText: { color: COLORS.warning },

  // Medicine Cards
  medicineList: { marginTop: hp(1), gap: hp(0.8) },
  medicineCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(2.5),
    padding: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  medicineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medicineName: { fontSize: wp(3.5), fontWeight: '600', color: COLORS.text },
  medicineDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2), marginTop: hp(0.3) },
  medicineDetail: { fontSize: wp(2.6), color: COLORS.textSecondary },
  medicineInstruction: { fontSize: wp(2.6), color: COLORS.textSecondary, marginTop: hp(0.2), fontStyle: 'italic' },

  // Custom Advice
  customAdviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
    gap: wp(2),
  },
  customAdviceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    padding: wp(2.5),
    fontSize: wp(3),
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
  },
  customAdviceBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  customAdviceBtnDisabled: {
    opacity: 0.5,
  },
  customAdviceGradient: {
    padding: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Notes
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    padding: wp(3),
    fontSize: wp(3.2),
    color: COLORS.text,
    minHeight: hp(6),
    backgroundColor: COLORS.backgroundSecondary,
    textAlignVertical: 'top',
  },

  // Action Buttons
  actionContainer: { gap: hp(1), marginTop: hp(0.5) },
  actionBtn: { borderRadius: wp(3), overflow: 'hidden' },
  actionBtnDisabled: { opacity: 0.5 },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: hp(1.2), gap: wp(2) },
  actionBtnText: { color: COLORS.white, fontSize: wp(3.2), fontWeight: '600' },
  actionBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: wp(1.5),
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.1),
    marginLeft: wp(0.5),
  },
  actionBadgeText: { color: COLORS.white, fontSize: wp(2.2), fontWeight: '700' },
  pharmacyBtn: {},
  labBtn: {},
  completeBtn: {},

  // Selector Modal
  selectorOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  selectorBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectorContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    maxHeight: hp(80),
    ...SHADOWS.large,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
  },
  selectorTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: 'bold' },

  // Search
  selectorSearchRow: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectorSearchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(2),
    gap: wp(2),
  },
  selectorSearchToggleText: {
    fontSize: wp(3.2),
    color: COLORS.primary,
    fontWeight: '500',
  },
  selectorSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
  },
  selectorSearchInput: { flex: 1, paddingVertical: hp(0.8), fontSize: wp(3.2), color: COLORS.text },

  selectorList: { paddingHorizontal: wp(4), maxHeight: hp(30) },
  selectorListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectorListItemActive: { backgroundColor: COLORS.primary + '08' },
  selectorListItemText: { fontSize: wp(3.2), color: COLORS.text, flex: 1 },
  selectorListItemTextActive: { color: COLORS.primary, fontWeight: '600' },

  // Medicine Extra Fields
  medicineExtraFields: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  medicineExtraRow: {
    flexDirection: 'row',
    marginBottom: hp(0.5),
  },
  medicineExtraField: {
    flex: 1,
  },
  medicineExtraLabel: {
    fontSize: wp(2.5),
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: hp(0.2),
  },
  medicineExtraPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    padding: wp(2),
    backgroundColor: COLORS.backgroundSecondary,
  },
  medicineExtraPickerText: {
    fontSize: wp(3),
    color: COLORS.text,
  },

  // Selector Actions
  selectorActions: {
    padding: wp(4),
    paddingTop: wp(2),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  selectorActionBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  selectorActionBtnDisabled: {
    opacity: 0.5,
  },
  selectorActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    gap: wp(2),
  },
  selectorActionBtnText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // Notification
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 999,
  },
  notificationBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  notificationContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  notificationHeader: {
    padding: wp(4),
    alignItems: 'center',
    paddingTop: wp(6),
    paddingBottom: wp(4),
  },
  notificationIconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1),
  },
  notificationTitle: {
    color: COLORS.white,
    fontSize: wp(5),
    fontWeight: '700',
    marginTop: hp(0.5),
  },
  notificationSubtitle: {
    color: COLORS.white,
    fontSize: wp(3.2),
    opacity: 0.9,
    marginTop: hp(0.2),
  },
  notificationBody: {
    padding: wp(4),
  },
  notificationMessage: {
    fontSize: wp(3.5),
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: hp(2.5),
  },
  notificationDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: hp(1.5),
  },
  notificationQueueInfo: {
    marginBottom: hp(1),
  },
  notificationQueueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  notificationQueueText: {
    fontSize: wp(3.2),
    color: COLORS.text,
  },
  notificationNextPatient: {
    marginBottom: hp(1.5),
  },
  notificationNextLabel: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: hp(0.3),
  },
  notificationNextCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: wp(3),
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationNextToken: {
    fontSize: wp(2.8),
    color: COLORS.primary,
    fontWeight: '600',
  },
  notificationNextName: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: hp(0.1),
  },
  notificationNextMeta: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  notificationEmptyQueue: {
    alignItems: 'center',
    paddingVertical: hp(1),
    gap: hp(0.3),
  },
  notificationEmptyText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.success,
  },
  notificationEmptySub: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  notificationBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
    marginTop: hp(1),
  },
  notificationBtnGradient: {
    paddingVertical: hp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBtnText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // Empty State
  emptyCard: { 
    alignItems: 'center', padding: wp(8), 
    backgroundColor: COLORS.white, borderRadius: wp(4), 
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  emptyTitle: { fontSize: wp(5), fontWeight: '700', color: COLORS.text, marginTop: hp(1) },
  emptySub: { fontSize: wp(3.5), color: COLORS.textSecondary, marginTop: hp(0.2) },
  emptyBtn: { 
    backgroundColor: COLORS.primary, paddingHorizontal: wp(8), 
    paddingVertical: hp(1.2), borderRadius: wp(3), marginTop: hp(2) 
  },
  emptyBtnText: { color: COLORS.white, fontSize: wp(3.5), fontWeight: '600' },

  // Footer
  footer: { 
    alignItems: 'center', marginTop: hp(2), 
    paddingTop: hp(1.5), borderTopWidth: 1, borderTopColor: COLORS.border 
  },
  footerText: { fontSize: wp(3), color: COLORS.textSecondary, fontWeight: '600' },
  footerSub: { fontSize: wp(2.5), color: COLORS.textLight, marginTop: hp(0.1) },
});

export default CallNextPatientScreen;