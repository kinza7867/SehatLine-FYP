// src/screens/doctor/CallNextPatientScreen.js
// ═══════════════════════════════════════════════════════════════════════════
// SEHATLINE — Call Next Patient Screen (One Click Workflow - Auto Complete)
// ═══════════════════════════════════════════════════════════════════════════
// 
// WORKFLOW:
// 1. Doctor fills consultation form
// 2. Clicks "Proceed" button (ONE CLICK)
// 3. System automatically: Saves Prescription → Sends to Pharmacy → 
//    Completes Patient → Removes from Queue → Calls Next Patient
// 4. Shows Success Modal with next patient preview
// 5. Auto-navigates to next patient in 3 seconds
// 6. Form resets automatically for next patient
// 7. Patient data is removed from screen after completion
// ═══════════════════════════════════════════════════════════════════════════

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
  FlatList,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';
const QUEUE_KEY = '@sehatline_queue';
const CONSULTATION_HISTORY_KEY = '@sehatline_consultation_history';
const PHARMACY_QUEUE_KEY = '@sehatline_pharmacy_queue';

// ─── CARDIOLOGY DIAGNOSIS ────────────────────────────────────────────
const CARDIOLOGY_DIAGNOSIS = [
  'Acute Coronary Syndrome', 'Aortic Regurgitation', 'Aortic Stenosis',
  'Arrhythmia', 'Atrial Fibrillation', 'Atrial Flutter', 'Bradycardia',
  'Cardiac Arrest', 'Cardiomyopathy', 'Congenital Heart Disease',
  'Congestive Heart Failure', 'Coronary Artery Disease', 'Dilated Cardiomyopathy',
  'Endocarditis', 'Heart Block', 'Heart Failure', 'Hypertension',
  'Hypertrophic Cardiomyopathy', 'Ischemic Heart Disease', 'Mitral Regurgitation',
  'Mitral Stenosis', 'Mitral Valve Prolapse', 'Myocardial Infarction (NSTEMI)',
  'Myocardial Infarction (STEMI)', 'Myocarditis', 'Pericarditis',
  'Peripheral Artery Disease', 'Pulmonary Embolism', 'Pulmonary Hypertension',
  'Rheumatic Heart Disease', 'Supraventricular Tachycardia', 'Tachycardia',
  'Valvular Heart Disease', 'Ventricular Fibrillation', 'Ventricular Tachycardia',
];

// ─── CARDIOLOGY MEDICINES ────────────────────────────────────────────
const CARDIOLOGY_MEDICINES = [
  'Amiodarone 100mg', 'Amiodarone 200mg', 'Amlodipine 5mg', 'Amlodipine 10mg',
  'Apixaban 2.5mg', 'Apixaban 5mg', 'Aspirin 75mg', 'Aspirin 150mg',
  'Atenolol 25mg', 'Atenolol 50mg', 'Atenolol 100mg', 'Atorvastatin 10mg',
  'Atorvastatin 20mg', 'Atorvastatin 40mg', 'Atorvastatin 80mg',
  'Bisoprolol 2.5mg', 'Bisoprolol 5mg', 'Captopril 25mg', 'Captopril 50mg',
  'Carvedilol 3.125mg', 'Carvedilol 6.25mg', 'Carvedilol 12.5mg', 'Carvedilol 25mg',
  'Clopidogrel 75mg', 'Digoxin 0.125mg', 'Digoxin 0.25mg', 'Diltiazem 30mg',
  'Diltiazem 60mg', 'Enalapril 5mg', 'Enalapril 10mg', 'Empagliflozin 10mg',
  'Empagliflozin 25mg', 'Furosemide 20mg', 'Furosemide 40mg',
  'Hydrochlorothiazide 12.5mg', 'Hydrochlorothiazide 25mg',
  'Isosorbide Mononitrate 10mg', 'Isosorbide Mononitrate 20mg',
  'Ivabradine 5mg', 'Ivabradine 7.5mg', 'Lisinopril 5mg', 'Lisinopril 10mg',
  'Losartan 25mg', 'Losartan 50mg', 'Losartan 100mg', 'Metoprolol 25mg',
  'Metoprolol 50mg', 'Metoprolol 100mg', 'Nitroglycerin 0.4mg (SL)',
  'Ramipril 2.5mg', 'Ramipril 5mg', 'Ramipril 10mg', 'Rivaroxaban 15mg',
  'Rivaroxaban 20mg', 'Rosuvastatin 10mg', 'Rosuvastatin 20mg',
  'Sacubitril/Valsartan 49/51mg', 'Sacubitril/Valsartan 97/103mg',
  'Spironolactone 25mg', 'Spironolactone 50mg', 'Telmisartan 40mg',
  'Telmisartan 80mg', 'Ticagrelor 90mg', 'Valsartan 80mg', 'Valsartan 160mg',
  'Warfarin 2mg', 'Warfarin 5mg',
];

// ─── CARDIOLOGY LAB TESTS ────────────────────────────────────────────
const CARDIOLOGY_LAB_TESTS = [
  '2D Echocardiography', 'ABG (Arterial Blood Gas)',
  'BNP (Brain Natriuretic Peptide)', 'CBC (Complete Blood Count)',
  'CK-MB', 'CRP (C-Reactive Protein)', 'Cardiac MRI', 'Chest X-Ray',
  'Coronary Angiography', 'CT Coronary Angiography', 'D-Dimer',
  'ECG (12-Lead)', 'ESR', 'HbA1c', 'Holter Monitoring',
  'LFT (Liver Function Test)', 'Lipid Profile', 'NT-proBNP',
  'PT/INR', 'RFT (Renal Function Test)', 'Serum Creatinine',
  'Serum Electrolytes', 'Stress Test (Treadmill)', 'Troponin I',
  'Troponin T', 'Urine Complete Examination',
];

// ─── ADVICE ──────────────────────────────────────────────────────────
const PATIENT_ADVICE = [
  'Avoid Heavy Exercise', 'Avoid Smoking', 'Continue Current Medicines',
  'Follow Previous Advice', 'Follow-up after 1 Month', 'Follow-up after 2 Weeks',
  'Low Salt Diet', 'Monitor BP Daily', 'Monitor Weight Daily',
  'Review Reports', 'Stop Smoking',
];

// ─── MEDICINE DURATIONS ──────────────────────────────────────────────
const MEDICINE_DURATIONS = [
  '1 Day', '3 Days', '5 Days', '7 Days', '10 Days', '14 Days',
  '21 Days', '1 Month', '3 Months', '6 Months', '1 Year', 'Lifelong',
];

// ─── MEDICINE INSTRUCTIONS ──────────────────────────────────────────
const MEDICINE_INSTRUCTIONS = [
  'Take with food', 'Take on empty stomach', 'Take after breakfast',
  'Take after dinner', 'Before breakfast', 'Before bedtime',
  'As directed by doctor', 'Do not crush or chew', 'Take with plenty of water',
];

const CallNextPatientScreen = ({ navigation, route }) => {
  const patient = route?.params?.patient;
  const doctorData = route?.params?.doctor || {};
  const doctorName = doctorData.name || 'Dr. Doctor';
  const onComplete = route?.params?.onComplete;
  const isNextPatient = route?.params?.isNextPatient || false;

  // ─── Workflow State ──────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(-1);
  const [workflowComplete, setWorkflowComplete] = useState(false);
  const [nextPatient, setNextPatient] = useState(null);
  const [queueCount, setQueueCount] = useState(0);
  const [isLastPatient, setIsLastPatient] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [autoNavigateTimer, setAutoNavigateTimer] = useState(null);

  // ─── Success Modal State ──────────────────────────────────────────
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // ─── SELECTOR STATE ──────────────────────────────────────────────
  const [activeSelector, setActiveSelector] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');

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

  // ─── ANIMATIONS ──────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  // ─── WORKFLOW STEPS ─────────────────────────────────────────────
  const WORKFLOW_STEPS = [
    { id: 0, label: 'Saving Prescription...', icon: 'document-text-outline' },
    { id: 1, label: 'Sending to Pharmacy...', icon: 'medkit-outline' },
    { id: 2, label: 'Completing Patient Record...', icon: 'checkmark-circle-outline' },
    { id: 3, label: 'Removing from Queue & Calling Next...', icon: 'call-outline' },
    { id: 4, label: 'Ready!', icon: 'checkmark-done-circle-outline' },
  ];

  // ─── LIFECYCLE ──────────────────────────────────────────────────────
  useEffect(() => {
    loadQueueData();
    loadPatientHistory();
    animateIn();

    // Reset form if this is a new patient (not first load)
    if (isNextPatient) {
      resetForm();
    }

    return () => {
      if (autoNavigateTimer) {
        clearTimeout(autoNavigateTimer);
      }
    };
  }, []);

  // ─── Auto-navigate when success modal is shown ────────────────────
  useEffect(() => {
    if (showSuccessModal && successData?.nextPatient) {
      if (autoNavigateTimer) {
        clearTimeout(autoNavigateTimer);
      }
      
      const timer = setTimeout(() => {
        handleNavigateToNext();
      }, 3000);
      
      setAutoNavigateTimer(timer);
    }
    
    return () => {
      if (autoNavigateTimer) {
        clearTimeout(autoNavigateTimer);
      }
    };
  }, [showSuccessModal, successData]);

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const animateModalIn = () => {
    Animated.timing(modalFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // ─── RESET FORM (For Next Patient - Clears ALL previous patient data) ──
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
    setWorkflowStep(-1);
    setWorkflowComplete(false);
    setShowSuccessModal(false);
    setSuccessData(null);
    setIsProcessing(false);
    setNextPatient(null);
  };

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

  const loadPatientHistory = async () => {
    try {
      if (!patient) return;
      
      const historyData = await AsyncStorage.getItem(CONSULTATION_HISTORY_KEY);
      if (historyData) {
        const allHistory = JSON.parse(historyData);
        const patientHistoryData = allHistory
          .filter(item => item.patientId === patient.id || item.patientName === patient.name)
          .slice(0, 5);
        setPatientHistory(patientHistoryData);
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
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

  // ─── QUICK ADD FROM HISTORY ────────────────────────────────────────
  const quickAddFromHistory = (item) => {
    if (item.diagnoses) {
      const diagList = item.diagnoses.split(', ').filter(d => d && d !== 'None' && d !== 'N/A');
      if (diagList.length > 0) {
        setSelectedDiagnoses(prev => [...new Set([...prev, ...diagList])]);
      }
    }
    
    if (item.medicines && item.medicines !== 'None') {
      const medLines = item.medicines.split('\n');
      medLines.forEach(line => {
        if (line.trim()) {
          const medName = line.split(' x ')[0]?.trim();
          if (medName && !selectedMedicines.find(m => m.name === medName)) {
            setSelectedMedicines(prev => [...prev, {
              id: Date.now().toString() + Math.random(),
              name: medName,
              duration: '7 Days',
              instruction: 'As prescribed',
            }]);
          }
        }
      });
    }
    
    if (item.labTests && item.labTests !== 'None') {
      const testList = item.labTests.split(', ').filter(t => t && t !== 'None' && t !== 'N/A');
      setSelectedLabTests(prev => [...new Set([...prev, ...testList])]);
    }
    
    if (item.advice && item.advice !== 'None') {
      const adviceList = item.advice.split(', ').filter(a => a && a !== 'None' && a !== 'N/A');
      setSelectedAdvice(prev => [...new Set([...prev, ...adviceList])]);
    }
    
    setShowHistory(false);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ─── MAIN WORKFLOW: ONE CLICK PROCEED ──────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════

  const handleProceed = async () => {
    if (isProcessing || !patient) return;
    
    if (selectedDiagnoses.length === 0) {
      Alert.alert('Required', 'Please select at least one diagnosis.');
      return;
    }

    if (selectedMedicines.length === 0 && selectedLabTests.length === 0) {
      Alert.alert('Required', 'Please prescribe at least one medicine or select a lab test.');
      return;
    }

    setIsProcessing(true);
    setWorkflowStep(0);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();

    try {
      // ── Step 1: Save Prescription ────────────────────────────────
      await updateWorkflowStep(0);
      const prescriptionData = buildPrescriptionData();
      await savePrescription(prescriptionData);

      // ── Step 2: Send to Pharmacy ──────────────────────────────────
      await updateWorkflowStep(1);
      await sendToPharmacy(prescriptionData);

      // ── Step 3: Complete Patient Record ──────────────────────────
      await updateWorkflowStep(2);
      await completePatientRecord(prescriptionData);

      // ── Step 4: Remove from Queue & Call Next ────────────────────
      await updateWorkflowStep(3);
      const nextPatientData = await fetchAndCallNextPatient();

      // ── Step 5: Ready ─────────────────────────────────────────────
      setWorkflowStep(4);
      setWorkflowComplete(true);
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      await loadQueueData();

      // ─── Show Success Modal ──────────────────────────────────────
      setSuccessData({
        patientName: patient.name,
        nextPatient: nextPatientData,
        medicineCount: selectedMedicines.length,
        labCount: selectedLabTests.length,
        queueCount: queueCount,
      });
      setShowSuccessModal(true);
      animateModalIn();

    } catch (error) {
      console.error('Workflow error:', error);
      setIsProcessing(false);
      setWorkflowStep(-1);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const updateWorkflowStep = (step) => {
    return new Promise((resolve) => {
      setWorkflowStep(step);
      Animated.timing(progressAnim, {
        toValue: (step + 1) / WORKFLOW_STEPS.length,
        duration: 400,
        useNativeDriver: false,
      }).start();
      setTimeout(resolve, 500);
    });
  };

  const buildPrescriptionData = () => {
    const allAdvice = [...selectedAdvice];
    
    return {
      patientId: patient.id,
      patientName: patient.name,
      patientToken: patient.token,
      patientAge: patient.age || 'N/A',
      patientGender: patient.gender || 'N/A',
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
      status: 'completed',
    };
  };

  const savePrescription = async (data) => {
    const existingHistory = await AsyncStorage.getItem(CONSULTATION_HISTORY_KEY);
    const historyList = existingHistory ? JSON.parse(existingHistory) : [];
    historyList.unshift({
      ...data,
      id: `hist_${Date.now()}`,
    });
    await AsyncStorage.setItem(CONSULTATION_HISTORY_KEY, JSON.stringify(historyList));
    return true;
  };

  const sendToPharmacy = async (data) => {
    if (data.medicines === 'None') return true;

    const pharmacyData = {
      ...data,
      prescribedAt: new Date().toISOString(),
      status: 'pending',
    };

    const existingPharmacy = await AsyncStorage.getItem(PHARMACY_QUEUE_KEY);
    const pharmacyList = existingPharmacy ? JSON.parse(existingPharmacy) : [];
    pharmacyList.unshift(pharmacyData);
    await AsyncStorage.setItem(PHARMACY_QUEUE_KEY, JSON.stringify(pharmacyList));
    return true;
  };

  const completePatientRecord = async (data) => {
    const existingCompleted = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
    const completedList = existingCompleted ? JSON.parse(existingCompleted) : [];
    completedList.unshift({ ...data, id: patient.id });
    await AsyncStorage.setItem(COMPLETED_PATIENTS_KEY, JSON.stringify(completedList));

    // ✅ Remove patient from queue
    const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
    if (existingQueue) {
      const queueList = JSON.parse(existingQueue);
      const updatedQueue = queueList.filter(p => p.id !== patient.id);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
      console.log(`✅ Patient ${patient.name} removed from queue`);
    }

    if (onComplete) {
      onComplete(patient, data);
    }
    return true;
  };

  const fetchAndCallNextPatient = async () => {
    const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
    if (existingQueue) {
      const queueList = JSON.parse(existingQueue);
      const waitingPatients = queueList.filter(p => p.status === 'Waiting' || p.status === 'Called');
      
      if (waitingPatients.length > 0) {
        const next = waitingPatients[0];
        setNextPatient(next);
        
        // Update status to "Called"
        const updatedQueue = queueList.map(p => {
          if (p.id === next.id) {
            return { ...p, status: 'Called' };
          }
          return p;
        });
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
        console.log(`✅ Next patient called: ${next.name} (Token #${next.token})`);
        return next;
      }
    }
    setNextPatient(null);
    console.log('✅ Queue is empty');
    return null;
  };

  // ─── NAVIGATE TO NEXT PATIENT ──────────────────────────────────────
  const handleNavigateToNext = () => {
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      setAutoNavigateTimer(null);
    }
    
    setShowSuccessModal(false);
    
    if (nextPatient) {
      // Reset form before navigating
      resetForm();
      
      // Navigate with fresh params - this will load new patient
      navigation.navigate('CallNextPatientScreen', { 
        patient: nextPatient,
        doctor: doctorData,
        isNextPatient: true,
      });
    } else {
      navigation.navigate('DoctorHome');
    }
  };

  // ─── RENDER WORKFLOW STEPS ─────────────────────────────────────────
  const renderWorkflowSteps = () => {
    if (workflowStep < 0) return null;

    return (
      <View style={styles.workflowContainer}>
        <Text style={styles.workflowTitle}>Processing...</Text>
        <View style={styles.workflowProgressTrack}>
          <Animated.View style={[
            styles.workflowProgressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              })
            }
          ]} />
        </View>
        <View style={styles.workflowStepList}>
          {WORKFLOW_STEPS.map((step, index) => (
            <View key={step.id} style={styles.workflowStepItem}>
              <View style={[
                styles.workflowStepDot,
                index < workflowStep && styles.workflowStepDotCompleted,
                index === workflowStep && styles.workflowStepDotActive,
                index > workflowStep && styles.workflowStepDotPending,
              ]}>
                {index < workflowStep ? (
                  <Ionicons name="checkmark" size={wp(2.5)} color={COLORS.white} />
                ) : index === workflowStep ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons name={step.icon} size={wp(2.5)} color={COLORS.textLight} />
                )}
              </View>
              <Text style={[
                styles.workflowStepLabel,
                index < workflowStep && styles.workflowStepLabelCompleted,
                index === workflowStep && styles.workflowStepLabelActive,
                index > workflowStep && styles.workflowStepLabelPending,
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ─── RENDER SUCCESS MODAL ─────────────────────────────────────────
  const renderSuccessModal = () => {
    if (!showSuccessModal || !successData) return null;

    const { patientName, nextPatient, medicineCount, labCount, queueCount } = successData;

    return (
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.successModalOverlay}>
          <Animated.View style={[styles.successModalContainer, { opacity: modalFadeAnim }]}>
            {/* Header */}
            <LinearGradient
              colors={[COLORS.success, '#059669']}
              style={styles.successModalHeader}
            >
              <View style={styles.successModalIcon}>
                <Ionicons name="checkmark-circle" size={wp(10)} color={COLORS.white} />
              </View>
              <Text style={styles.successModalTitle}>Consultation Completed!</Text>
              <Text style={styles.successModalSubtitle}>{patientName}</Text>
            </LinearGradient>

            {/* Body */}
            <View style={styles.successModalBody}>
              {/* Pharmacy Status */}
              <View style={styles.successModalRow}>
                <View style={styles.successModalIconSmall}>
                  <Ionicons name="medkit" size={wp(4)} color={COLORS.success} />
                </View>
                <View style={styles.successModalRowContent}>
                  <Text style={styles.successModalRowLabel}>Sent to Pharmacy</Text>
                  <Text style={styles.successModalRowValue}>
                    {medicineCount > 0 ? `${medicineCount} medicine${medicineCount > 1 ? 's' : ''} prescribed` : 'No medicines'}
                  </Text>
                </View>
              </View>

              {/* Lab Status */}
              <View style={styles.successModalRow}>
                <View style={styles.successModalIconSmall}>
                  <Ionicons name="flask" size={wp(4)} color={COLORS.info} />
                </View>
                <View style={styles.successModalRowContent}>
                  <Text style={styles.successModalRowLabel}>Lab Tests Referred</Text>
                  <Text style={styles.successModalRowValue}>
                    {labCount > 0 ? `${labCount} test${labCount > 1 ? 's' : ''} selected` : 'No tests'}
                  </Text>
                </View>
              </View>

              {/* Queue Status */}
              <View style={styles.successModalRow}>
                <View style={styles.successModalIconSmall}>
                  <Ionicons name="people" size={wp(4)} color={COLORS.primary} />
                </View>
                <View style={styles.successModalRowContent}>
                  <Text style={styles.successModalRowLabel}>Queue Status</Text>
                  <Text style={styles.successModalRowValue}>
                    {queueCount > 0 ? `${queueCount} patient${queueCount > 1 ? 's' : ''} waiting` : 'Queue is empty'}
                  </Text>
                </View>
              </View>

              {/* Next Patient Preview */}
              {nextPatient && (
                <View style={styles.successModalNextPatient}>
                  <View style={styles.successModalNextHeader}>
                    <Ionicons name="arrow-forward-circle" size={wp(3.5)} color={COLORS.primary} />
                    <Text style={styles.successModalNextTitle}>Next Patient Ready</Text>
                  </View>
                  <View style={styles.successModalNextCard}>
                    <Text style={styles.successModalNextToken}>Token #{nextPatient.token}</Text>
                    <Text style={styles.successModalNextName}>{nextPatient.name}</Text>
                    <Text style={styles.successModalNextMeta}>
                      {nextPatient.age || 'N/A'} yrs • {nextPatient.gender || 'N/A'}
                    </Text>
                  </View>
                </View>
              )}

              {!nextPatient && (
                <View style={styles.successModalEmptyQueue}>
                  <Ionicons name="checkmark-done-circle" size={wp(6)} color={COLORS.success} />
                  <Text style={styles.successModalEmptyText}>Queue Complete</Text>
                  <Text style={styles.successModalEmptySub}>All patients have been attended</Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.successModalFooter}>
              <TouchableOpacity
                style={styles.successModalBtn}
                onPress={handleNavigateToNext}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.successModalBtnGradient}
                >
                  <Text style={styles.successModalBtnText}>
                    {nextPatient ? 'Continue to Next Patient →' : 'Return to Portal'}
                  </Text>
                  {nextPatient && (
                    <Ionicons name="arrow-forward" size={wp(3.5)} color={COLORS.white} />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {nextPatient && (
                <Text style={styles.successModalAutoText}>
                  Auto-loading next patient in 3 seconds...
                </Text>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // ─── OPEN SELECTOR ──────────────────────────────────────────────────
  const openSelector = (type) => {
    setActiveSelector(type);
    setShowSearch(false);
    setSelectorSearch('');
    if (type === 'diagnosis') filterDiagnosis('');
    else if (type === 'medicine') filterMedicines('');
    else if (type === 'lab') filterLabs('');
    else if (type === 'advice') filterAdvice('');
  };

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
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            resetForm();
            navigation.navigate('DoctorHome');
          }}>
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
    <Animated.View style={[styles.patientCard, { opacity: fadeAnim }]}>
      <View style={styles.patientRow}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.patientAvatar}>
          <Text style={styles.patientAvatarText}>{patient?.name?.charAt(0) || 'P'}</Text>
        </LinearGradient>
        <View style={styles.patientInfo}>
          <View style={styles.tokenRow}>
            <Text style={styles.tokenNumber}>Token #{patient?.token || '—'}</Text>
            {workflowComplete && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={wp(2.5)} color={COLORS.success} />
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.patientName}>{patient?.name}</Text>
          <Text style={styles.patientMeta}>
            {patient?.age || 'N/A'} yrs • {patient?.gender || 'N/A'} • {patient?.type || 'General'}
          </Text>
          <Text style={styles.patientReason}>
            <Ionicons name="time-outline" size={wp(2.8)} color={COLORS.textLight} /> 
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

      {/* Patient History Toggle */}
      <TouchableOpacity 
        style={styles.historyToggle}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Ionicons name="time-outline" size={wp(3.5)} color={COLORS.primary} />
        <Text style={styles.historyToggleText}>
          {showHistory ? 'Hide' : 'View'} Previous Visits {patientHistory.length > 0 ? `(${patientHistory.length})` : ''}
        </Text>
        <Ionicons 
          name={showHistory ? 'chevron-up' : 'chevron-down'} 
          size={wp(3.5)} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>

      {showHistory && (
        <View style={styles.historyContainer}>
          {patientHistory.length > 0 ? (
            patientHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'N/A'}
                  </Text>
                  <Text style={styles.historyDoctor}>Dr. {item.doctorName || 'Unknown'}</Text>
                </View>
                {item.diagnoses && item.diagnoses !== 'None' && (
                  <View style={styles.historyDiagnoses}>
                    <Ionicons name="medical-outline" size={wp(2.8)} color={COLORS.primary} />
                    <Text style={styles.historyDiagnosesText}>{item.diagnoses}</Text>
                  </View>
                )}
                {item.medicines && item.medicines !== 'None' && (
                  <View style={styles.historyMedicines}>
                    <Ionicons name="medkit-outline" size={wp(2.8)} color={COLORS.success} />
                    <Text style={styles.historyMedicinesText} numberOfLines={2}>{item.medicines}</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.historyUseBtn}
                  onPress={() => quickAddFromHistory(item)}
                >
                  <Text style={styles.historyUseBtnText}>Use This</Text>
                  <Ionicons name="arrow-forward" size={wp(2.8)} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.noHistoryContainer}>
              <Ionicons name="document-text-outline" size={wp(8)} color={COLORS.textLight} />
              <Text style={styles.noHistoryText}>No previous visits found</Text>
              <Text style={styles.noHistorySub}>This appears to be a new patient</Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );

  // ─── RENDER FORM ────────────────────────────────────────────────────
  const renderForm = () => (
    <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
      <Text style={styles.formTitle}>Consultation</Text>

      {/* Diagnosis */}
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

      {/* Medicines */}
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

      {/* Lab Tests */}
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

      {/* Workflow Steps */}
      {isProcessing && renderWorkflowSteps()}

      {/* Proceed Button */}
      {!isProcessing && !workflowComplete && (
        <TouchableOpacity
          style={[styles.proceedBtn, (
            selectedDiagnoses.length === 0 || 
            (selectedMedicines.length === 0 && selectedLabTests.length === 0)
          ) && styles.proceedBtnDisabled]}
          onPress={handleProceed}
          disabled={
            selectedDiagnoses.length === 0 || 
            (selectedMedicines.length === 0 && selectedLabTests.length === 0) ||
            isProcessing
          }
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.proceedGradient}
          >
            <Ionicons name="arrow-forward-circle" size={wp(4.5)} color={COLORS.white} />
            <Text style={styles.proceedBtnText}>Proceed</Text>
            <View style={styles.proceedBadge}>
              <Text style={styles.proceedBadgeText}>
                {queueCount > 0 ? `${queueCount} left` : 'Last'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Animated.View>
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
          <View style={styles.selectorContainer}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>{content.title}</Text>
              <TouchableOpacity onPress={() => {
                setActiveSelector(null);
                setShowSearch(false);
              }}>
                <Ionicons name="close" size={wp(5)} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>

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
            <TouchableOpacity style={styles.emptyBtn} onPress={() => {
              navigation.navigate('DoctorHome');
            }}>
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
      {renderSuccessModal()}
    </View>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────
// (Styles remain exactly as they were - no changes needed)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: hp(20) },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(4), paddingBottom: hp(4) },

  headerGradient: { 
    paddingHorizontal: wp(4), 
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : hp(0.8), 
    paddingBottom: hp(1.2), 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
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
  headerTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: '700' },
  queueBadge: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: wp(2), paddingVertical: hp(0.3), 
    borderRadius: wp(3), gap: wp(1) 
  },
  queueBadgeText: { color: COLORS.white, fontSize: wp(3), fontWeight: '700' },

  patientCard: { 
    backgroundColor: COLORS.white, borderRadius: wp(4), 
    padding: wp(4), marginBottom: hp(1.5), 
    borderWidth: 1, borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  patientRow: { flexDirection: 'row', alignItems: 'center' },
  patientAvatar: { 
    width: wp(14), height: wp(14), borderRadius: wp(7), 
    alignItems: 'center', justifyContent: 'center', marginRight: wp(3) 
  },
  patientAvatarText: { color: COLORS.white, fontSize: wp(5), fontWeight: '700' },
  patientInfo: { flex: 1 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  tokenNumber: { fontSize: wp(4.5), fontWeight: '800', color: COLORS.primary },
  completedBadge: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: COLORS.success + '15', 
    paddingHorizontal: wp(1.5), paddingVertical: hp(0.1), 
    borderRadius: wp(2), gap: wp(0.5) 
  },
  completedBadgeText: { fontSize: wp(2.2), color: COLORS.success, fontWeight: '600' },
  patientName: { fontSize: wp(5), fontWeight: '700', color: COLORS.text },
  patientMeta: { fontSize: wp(2.8), color: COLORS.textSecondary, marginTop: hp(0.1) },
  patientReason: { fontSize: wp(2.8), color: COLORS.textSecondary, marginTop: hp(0.2) },

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

  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1.2),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: wp(1.5),
  },
  historyToggleText: {
    fontSize: wp(3),
    color: COLORS.primary,
    fontWeight: '600',
  },
  historyContainer: {
    marginTop: hp(1),
    gap: hp(0.8),
  },
  historyItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: wp(2.5),
    padding: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  historyDate: {
    fontSize: wp(2.6),
    fontWeight: '600',
    color: COLORS.primary,
  },
  historyDoctor: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
  },
  historyDiagnoses: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(1.5),
    marginTop: hp(0.2),
  },
  historyDiagnosesText: {
    flex: 1,
    fontSize: wp(2.8),
    color: COLORS.text,
  },
  historyMedicines: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(1.5),
    marginTop: hp(0.2),
  },
  historyMedicinesText: {
    flex: 1,
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },
  historyUseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(0.5),
    paddingVertical: hp(0.4),
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    gap: wp(1.5),
  },
  historyUseBtnText: {
    fontSize: wp(2.6),
    color: COLORS.white,
    fontWeight: '600',
  },
  noHistoryContainer: {
    alignItems: 'center',
    paddingVertical: hp(1.5),
    gap: hp(0.3),
  },
  noHistoryText: {
    fontSize: wp(3.2),
    color: COLORS.text,
    fontWeight: '600',
  },
  noHistorySub: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },

  formCard: { 
    backgroundColor: COLORS.white, borderRadius: wp(4), 
    padding: wp(4), marginBottom: hp(1.5), 
    borderWidth: 1, borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  formTitle: { fontSize: wp(4.5), fontWeight: '700', color: COLORS.text, marginBottom: hp(1.5) },
  fieldGroup: { marginBottom: hp(1.2) },
  fieldLabel: { fontSize: wp(3), fontWeight: '600', color: COLORS.textSecondary, marginBottom: hp(0.2) },

  selectorTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    padding: wp(3),
    backgroundColor: '#F8FAFC',
  },
  selectorTriggerText: { fontSize: wp(3.5), color: COLORS.text, flex: 1 },
  placeholderText: { color: COLORS.textLight },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(1.5), marginTop: hp(1) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    gap: wp(1),
  },
  chipText: { fontSize: wp(2.8), color: COLORS.primary, maxWidth: wp(30), fontWeight: '500' },
  chipLab: { backgroundColor: COLORS.info + '12' },
  chipLabText: { color: COLORS.info },
  chipAdvice: { backgroundColor: COLORS.warning + '12' },
  chipAdviceText: { color: COLORS.warning },

  medicineList: { marginTop: hp(1), gap: hp(0.8) },
  medicineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: wp(2.5),
    padding: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  medicineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medicineName: { fontSize: wp(3.5), fontWeight: '600', color: COLORS.text },
  medicineDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2), marginTop: hp(0.3) },
  medicineDetail: { fontSize: wp(2.8), color: COLORS.textSecondary },
  medicineInstruction: { fontSize: wp(2.6), color: COLORS.textSecondary, marginTop: hp(0.2), fontStyle: 'italic' },

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
    backgroundColor: '#F8FAFC',
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

  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    padding: wp(3),
    fontSize: wp(3.2),
    color: COLORS.text,
    minHeight: hp(6),
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
  },

  workflowContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: wp(3),
    padding: wp(3),
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workflowTitle: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: hp(0.5),
  },
  workflowProgressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: hp(0.8),
  },
  workflowProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  workflowStepList: {
    gap: hp(0.3),
  },
  workflowStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  workflowStepDot: {
    width: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(2.25),
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowStepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  workflowStepDotActive: {
    backgroundColor: COLORS.primary,
  },
  workflowStepDotPending: {
    backgroundColor: '#E5E7EB',
  },
  workflowStepLabel: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
  },
  workflowStepLabelCompleted: {
    color: COLORS.success,
    fontWeight: '600',
  },
  workflowStepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  workflowStepLabelPending: {
    color: COLORS.textLight,
  },

  proceedBtn: {
    marginTop: hp(1.5),
    borderRadius: wp(3),
    overflow: 'hidden',
  },
  proceedBtnDisabled: {
    opacity: 0.5,
  },
  proceedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.4),
    gap: wp(2),
  },
  proceedBtnText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '700',
  },
  proceedBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.1),
    borderRadius: wp(2),
  },
  proceedBadgeText: {
    color: COLORS.white,
    fontSize: wp(2.4),
    fontWeight: '600',
  },

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
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
  },
  selectorTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: '700' },

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
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#F8FAFC',
  },
  medicineExtraPickerText: {
    fontSize: wp(3),
    color: COLORS.text,
  },

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

  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    width: width * 0.92,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
    maxHeight: height * 0.85,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  successModalHeader: {
    padding: wp(4),
    alignItems: 'center',
    paddingTop: wp(6),
    paddingBottom: wp(4),
  },
  successModalIcon: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(0.5),
  },
  successModalTitle: {
    color: COLORS.white,
    fontSize: wp(5),
    fontWeight: '700',
  },
  successModalSubtitle: {
    color: COLORS.white,
    fontSize: wp(3.2),
    opacity: 0.9,
    marginTop: hp(0.1),
  },
  successModalBody: {
    padding: wp(4),
  },
  successModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  successModalIconSmall: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  successModalRowContent: {
    flex: 1,
  },
  successModalRowLabel: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
    fontWeight: '500',
  },
  successModalRowValue: {
    fontSize: wp(3),
    color: COLORS.text,
    fontWeight: '600',
  },
  successModalNextPatient: {
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  successModalNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginBottom: hp(0.3),
  },
  successModalNextTitle: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.primary,
  },
  successModalNextCard: {
    backgroundColor: '#F8FAFC',
    padding: wp(3),
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successModalNextToken: {
    fontSize: wp(2.6),
    color: COLORS.primary,
    fontWeight: '600',
  },
  successModalNextName: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: hp(0.1),
  },
  successModalNextMeta: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },
  successModalEmptyQueue: {
    alignItems: 'center',
    paddingVertical: hp(1.5),
    gap: hp(0.2),
  },
  successModalEmptyText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: COLORS.success,
  },
  successModalEmptySub: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  successModalFooter: {
    padding: wp(4),
    paddingTop: wp(2),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  successModalBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  successModalBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  successModalBtnText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  successModalAutoText: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: hp(0.3),
  },

  emptyCard: { 
    alignItems: 'center', padding: wp(8), 
    backgroundColor: COLORS.white, borderRadius: wp(4), 
    borderWidth: 1, borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: wp(5), fontWeight: '700', color: COLORS.text, marginTop: hp(1) },
  emptySub: { fontSize: wp(3.5), color: COLORS.textSecondary, marginTop: hp(0.2) },
  emptyBtn: { 
    backgroundColor: COLORS.primary, paddingHorizontal: wp(8), 
    paddingVertical: hp(1.2), borderRadius: wp(3), marginTop: hp(2) 
  },
  emptyBtnText: { color: COLORS.white, fontSize: wp(3.5), fontWeight: '600' },

  footer: { 
    alignItems: 'center', marginTop: hp(2), 
    paddingTop: hp(1.5), borderTopWidth: 1, borderTopColor: COLORS.border 
  },
  footerText: { fontSize: wp(3), color: COLORS.textSecondary, fontWeight: '600' },
  footerSub: { fontSize: wp(2.5), color: COLORS.textLight, marginTop: hp(0.1) },
});

export default CallNextPatientScreen;