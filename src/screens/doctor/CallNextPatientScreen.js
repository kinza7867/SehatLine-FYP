import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  SafeAreaView, StatusBar, Dimensions, Platform, Image, Alert, Modal, TextInput 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const CallNextPatientScreen = ({ navigation, route }) => {
  const doctorData = route?.params?.doctorData || route?.params?.doctor || {};
  const doctorName = doctorData.name || 'Dr. Doctor';
  
  // ✅ Cardiology-Specific Prescription Templates
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
      name: 'Post-MI / Acute Coronary Syndrome', 
      medicines: 'Aspirin 300mg (loading), Clopidogrel 75mg (1x daily), Atorvastatin 80mg (1x nightly)',
      duration: '30 days',
      advice: 'Complete bed rest. Cardiac rehabilitation. Follow-up in 1 week.'
    },
    { 
      id: '7', 
      name: 'Peripheral Artery Disease', 
      medicines: 'Cilostazol 100mg (2x daily), Aspirin 75mg (1x daily), Atorvastatin 40mg (1x nightly)',
      duration: '30 days',
      advice: 'Walking exercise program. Stop smoking. Diabetes control.'
    },
    { 
      id: '8', 
      name: 'Custom Prescription', 
      medicines: '',
      duration: '',
      advice: '',
      isCustom: true
    },
  ];

  // ✅ Patient Queue - More patients (8 patients for demo)
  const [patients, setPatients] = useState([
    {
      id: '1',
      token: "P-089",
      name: "Fatima Bibi",
      age: 67,
      type: "New Patient",
      priority: true,
      symptoms: "Severe chest pain, shortness of breath",
      department: doctorData.department || "Cardiology",
      waitTime: "8 mins",
      bedNumber: "B-12",
      status: 'waiting'
    },
    {
      id: '2',
      token: "P-090",
      name: "Muhammad Ali",
      age: 52,
      type: "Follow-up",
      priority: false,
      symptoms: "Mild chest discomfort, blood pressure check",
      department: doctorData.department || "Cardiology",
      waitTime: "12 mins",
      bedNumber: "B-14",
      status: 'waiting'
    },
    {
      id: '3',
      token: "P-091",
      name: "Ayesha Khan",
      age: 45,
      type: "New Patient",
      priority: false,
      symptoms: "Persistent headache, blurred vision",
      department: doctorData.department || "Cardiology",
      waitTime: "18 mins",
      bedNumber: "B-16",
      status: 'waiting'
    },
    {
      id: '4',
      token: "P-092",
      name: "Rashid Ahmed",
      age: 71,
      type: "Follow-up",
      priority: true,
      symptoms: "Chest tightness, palpitations, dizziness",
      department: doctorData.department || "Cardiology",
      waitTime: "22 mins",
      bedNumber: "B-18",
      status: 'waiting'
    },
    {
      id: '5',
      token: "P-093",
      name: "Sana Tariq",
      age: 38,
      type: "New Patient",
      priority: false,
      symptoms: "Irregular heartbeat, fatigue, shortness of breath",
      department: doctorData.department || "Cardiology",
      waitTime: "25 mins",
      bedNumber: "B-20",
      status: 'waiting'
    },
    {
      id: '6',
      token: "P-094",
      name: "Imran Khan",
      age: 59,
      type: "Follow-up",
      priority: false,
      symptoms: "BP fluctuation, mild chest discomfort",
      department: doctorData.department || "Cardiology",
      waitTime: "30 mins",
      bedNumber: "B-22",
      status: 'waiting'
    },
    {
      id: '7',
      token: "P-095",
      name: "Nadia Hussain",
      age: 44,
      type: "New Patient",
      priority: false,
      symptoms: "Severe headache, high BP, vision problems",
      department: doctorData.department || "Cardiology",
      waitTime: "35 mins",
      bedNumber: "B-24",
      status: 'waiting'
    },
    {
      id: '8',
      token: "P-096",
      name: "Aslam Malik",
      age: 76,
      type: "Follow-up",
      priority: true,
      symptoms: "Post-MI follow-up, chest pain on exertion",
      department: doctorData.department || "Cardiology",
      waitTime: "40 mins",
      bedNumber: "B-26",
      status: 'waiting'
    },
  ]);

  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMedicines, setCustomMedicines] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [customAdvice, setCustomAdvice] = useState('');
  const [completedPatients, setCompletedPatients] = useState([]);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showQueueCount, setShowQueueCount] = useState(false);

  const currentPatient = patients[currentPatientIndex] || null;
  
  // ✅ Calculate waiting patients count (patients not completed yet)
  const waitingPatientsCount = patients.filter(p => p.status !== 'completed').length;

  // ✅ Show waiting patients count
  const showWaitingPatients = () => {
    const waitingList = patients
      .filter(p => p.status !== 'completed')
      .map((p, i) => `${i+1}. ${p.name} (${p.token}) - ${p.status === 'waiting' ? '⏳ Waiting' : p.status === 'called' ? '📞 Called' : '🔄 Consulting'}`)
      .join('\n');
    
    Alert.alert(
      `👥 Patients in Queue (${waitingPatientsCount})`,
      waitingList || 'No patients waiting',
      [{ text: "OK" }]
    );
  };

  // ✅ Call Patient
  const callPatient = () => {
    if (!currentPatient) return;
    
    setIsCalling(true);
    setPatients(prev => prev.map((p, i) => 
      i === currentPatientIndex ? { ...p, status: 'called' } : p
    ));
    
    setTimeout(() => {
      setIsCalling(false);
      setIsConsulting(true);
      setPatients(prev => prev.map((p, i) => 
        i === currentPatientIndex ? { ...p, status: 'consulting' } : p
      ));
      
      Alert.alert(
        "📢 Patient Called",
        `${currentPatient.name} (${currentPatient.token}) is now in consultation.`,
        [{ text: "Start Consultation", onPress: () => {} }]
      );
    }, 800);
  };

  // ✅ Open Prescription Modal
  const openPrescription = () => {
    setSelectedTemplate(null);
    setCustomMedicines('');
    setCustomDuration('');
    setCustomAdvice('');
    setShowPrescriptionModal(true);
  };

  // ✅ Select Template
  const selectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  // ✅ Send to Pharmacy
  const sendToPharmacy = () => {
    let prescriptionText = '';
    
    if (selectedTemplate && !selectedTemplate.isCustom) {
      prescriptionText = 
        `💊 Medicines: ${selectedTemplate.medicines}\n` +
        `📅 Duration: ${selectedTemplate.duration}\n` +
        `💡 Advice: ${selectedTemplate.advice}`;
    } else if (selectedTemplate && selectedTemplate.isCustom) {
      if (!customMedicines.trim()) {
        Alert.alert("⚠️ Required", "Please enter medicine details.");
        return;
      }
      prescriptionText = 
        `💊 Medicines: ${customMedicines}\n` +
        `📅 Duration: ${customDuration || 'Not specified'}\n` +
        `💡 Advice: ${customAdvice || 'None'}`;
    } else {
      Alert.alert("⚠️ Required", "Please select a prescription template.");
      return;
    }

    const patient = currentPatient;
    setShowPrescriptionModal(false);
    
    setPatients(prev => prev.map((p, i) => 
      i === currentPatientIndex ? { ...p, status: 'completed' } : p
    ));
    
    setCompletedPatients(prev => [...prev, { 
      ...patient, 
      prescription: prescriptionText,
      completedAt: new Date().toISOString()
    }]);
    
    setIsConsulting(false);

    Alert.alert(
      "✅ Patient Sent to Pharmacy",
      `${patient.name} has been treated.\n\n💊 Prescription sent.`,
      [
        { 
          text: "📋 View Pharmacy", 
          onPress: () => navigation.navigate('PharmacyDashboardScreen', {
            patientName: patient.name,
            patientToken: patient.token,
            prescription: prescriptionText,
            doctorName: doctorName,
            fromDoctor: true
          })
        },
        { 
          text: "👨‍⚕️ Next Patient", 
          onPress: () => loadNextPatient()
        }
      ]
    );
  };

  // ✅ Load Next Patient
  const loadNextPatient = () => {
    const nextIndex = patients.findIndex((p, i) => i > currentPatientIndex && p.status === 'waiting');
    
    if (nextIndex !== -1) {
      setCurrentPatientIndex(nextIndex);
      Alert.alert("👨‍⚕️ Next Patient", `${patients[nextIndex].name} is ready.`);
    } else {
      const allDone = patients.every(p => p.status === 'completed');
      if (allDone) {
        Alert.alert(
          "🎉 All Patients Done!",
          "All patients have been sent to pharmacy.",
          [
            { 
              text: "Go to Dashboard", 
              onPress: () => navigation.navigate('DoctorDashboardScreen', { doctor: doctorData })
            }
          ]
        );
      } else {
        Alert.alert("⏳ No More Patients", "All waiting patients have been seen.");
      }
    }
  };

  // ✅ Skip Patient
  const skipPatient = () => {
    Alert.alert(
      "Skip Patient",
      `Skip ${currentPatient?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Skip", 
          onPress: () => {
            const patient = patients[currentPatientIndex];
            setPatients(prev => {
              const newPatients = [...prev];
              newPatients.splice(currentPatientIndex, 1);
              newPatients.push({ ...patient, status: 'waiting' });
              return newPatients;
            });
            const nextIndex = patients.findIndex((p, i) => i > currentPatientIndex && p.status === 'waiting');
            if (nextIndex !== -1) setCurrentPatientIndex(nextIndex);
          }
        }
      ]
    );
  };

  // ✅ Show Notifications
  const showNotifications = () => {
    Alert.alert(
      "🔔 Notifications",
      `You have ${notificationCount} new notifications from admin.\n\n` +
      "1. Pharmacy stock update\n" +
      "2. New doctor added to team\n" +
      "3. Hospital policy updated",
      [
        { text: "View All", onPress: () => navigation.navigate('Notifications') },
        { text: "Dismiss", style: "cancel" }
      ]
    );
  };

  // ✅ Render Header
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
            onPress={() => navigation.goBack()}
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
              <Text style={styles.headerTitle}>Patient Queue</Text>
              <Text style={styles.headerSub}>👨‍⚕️ {doctorName}</Text>
            </View>
          </View>

          {/* Notifications Button */}
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={showNotifications}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // ✅ Render Patient Card
  const renderPatientCard = () => {
    if (!currentPatient) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-done-circle" size={wp(15)} color={COLORS.success} />
          <Text style={styles.emptyTitle}>All Patients Done! 🎉</Text>
          <Text style={styles.emptySub}>No more patients in queue</Text>
          <TouchableOpacity 
            style={[styles.emptyBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('DoctorDashboardScreen', { doctor: doctorData })}
          >
            <Text style={styles.emptyBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isCalled = currentPatient.status === 'called' || currentPatient.status === 'consulting';
    const isCompleted = currentPatient.status === 'completed';

    return (
      <View style={[styles.patientCard, SHADOWS.medium]}>
        <LinearGradient
          colors={[COLORS.primary + '12', COLORS.secondary + '08']}
          style={styles.patientCardGradient}
        >
          <View style={styles.statusBadgeContainer}>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: isCompleted ? '#10B981' : 
                                isCalled ? '#8B5CF6' : 
                                currentPatient.priority ? '#EF4444' : '#3B82F6'
              }
            ]}>
              <Text style={styles.statusBadgeText}>
                {isCompleted ? 'Completed' : 
                 isCalled ? 'In Consultation' : 
                 currentPatient.priority ? 'Priority' : 'Waiting'}
              </Text>
            </View>
            <Text style={styles.queueNumber}>#{currentPatientIndex + 1}</Text>
          </View>

          <View style={styles.patientHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={wp(12)} color={COLORS.primary} />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.tokenNumber}>{currentPatient.token}</Text>
              <Text style={styles.patientName}>{currentPatient.name}</Text>
              <Text style={styles.patientMeta}>
                Age: {currentPatient.age} • {currentPatient.type}
              </Text>
            </View>
          </View>

          {currentPatient.priority && !isCompleted && (
            <View style={styles.priorityBadge}>
              <Ionicons name="alert-circle" size={wp(3)} color="#FFFFFF" />
              <Text style={styles.priorityText}>CRITICAL PRIORITY</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.patientDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="medkit-outline" size={wp(4)} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Department</Text>
              <Text style={styles.detailValue}>{currentPatient.department}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={wp(4)} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Wait Time</Text>
              <Text style={styles.detailValue}>{currentPatient.waitTime}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={wp(4)} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Bed</Text>
              <Text style={styles.detailValue}>{currentPatient.bedNumber}</Text>
            </View>
          </View>

          <View style={styles.symptomsContainer}>
            <Text style={styles.symptomsTitle}>📋 Reported Symptoms</Text>
            <Text style={styles.symptomsText}>{currentPatient.symptoms}</Text>
          </View>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={wp(3)} color="#10B981" />
              <Text style={styles.completedBadgeText}>✓ Sent to Pharmacy</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  // ✅ Render Action Buttons
  const renderActionButtons = () => {
    if (!currentPatient) return null;
    
    const isCalled = currentPatient.status === 'called' || currentPatient.status === 'consulting';
    const isCompleted = currentPatient.status === 'completed';

    return (
      <View style={styles.actionContainer}>
        {!isCalled && !isCompleted && (
          <TouchableOpacity 
            style={[styles.callButton, styles.cardShadow]}
            onPress={callPatient}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.callButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="call" size={wp(5)} color={COLORS.white} />
              <Text style={styles.callButtonText}>Call {currentPatient.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isCalled && !isCompleted && (
          <TouchableOpacity 
            style={[styles.callButton, styles.cardShadow]}
            onPress={openPrescription}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.callButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="medkit" size={wp(5)} color={COLORS.white} />
              <Text style={styles.callButtonText}>📝 Prescribe & Send</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <TouchableOpacity 
            style={[styles.callButton, styles.cardShadow]}
            onPress={loadNextPatient}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.callButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="arrow-forward" size={wp(5)} color={COLORS.white} />
              <Text style={styles.callButtonText}>Next Patient →</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.secondaryButtons}>
          {!isCalled && !isCompleted && (
            <TouchableOpacity 
              style={[styles.secondaryBtn, SHADOWS.small]}
              onPress={skipPatient}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={wp(4)} color={COLORS.warning} />
              <Text style={[styles.secondaryBtnText, { color: COLORS.warning }]}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* ✅ Queue Button - Shows count, no navigation */}
          <TouchableOpacity 
            style={[styles.secondaryBtn, styles.queueBtn, SHADOWS.small]}
            onPress={showWaitingPatients}
            activeOpacity={0.7}
          >
            <View style={styles.queueBtnContent}>
              <Ionicons name="people-outline" size={wp(4)} color={COLORS.primary} />
              <Text style={styles.secondaryBtnText}>Queue</Text>
              <View style={styles.queueCountBadge}>
                <Text style={styles.queueCountText}>{waitingPatientsCount}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, SHADOWS.small]}
            onPress={() => navigation.navigate('DoctorDashboardScreen', { doctor: doctorData })}
            activeOpacity={0.7}
          >
            <Ionicons name="grid-outline" size={wp(4)} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {completedPatients.length > 0 && (
          <TouchableOpacity 
            style={styles.completedToggle}
            onPress={() => {
              Alert.alert(
                "✅ Completed Patients",
                completedPatients.map((p, i) => 
                  `${i+1}. ${p.name} (${p.token})`
                ).join('\n')
              );
            }}
          >
            <Text style={styles.completedToggleText}>
              📋 {completedPatients.length} patient{completedPatients.length > 1 ? 's' : ''} completed
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ✅ Render Prescription Modal
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
            <Text style={styles.modalPatientName}>{currentPatient?.name}</Text>
            <Text style={styles.modalPatientToken}>Token: {currentPatient?.token}</Text>

            <Text style={styles.modalLabel}>Cardiology Templates</Text>
            <View style={styles.templatesGrid}>
              {prescriptionTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    selectedTemplate?.id === template.id && styles.templateCardActive,
                    { borderColor: selectedTemplate?.id === template.id ? COLORS.primary : COLORS.border }
                  ]}
                  onPress={() => selectTemplate(template)}
                >
                  <Text style={[
                    styles.templateName,
                    selectedTemplate?.id === template.id && { color: COLORS.primary }
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

            {selectedTemplate?.isCustom && (
              <View style={styles.customFields}>
                <Text style={styles.modalLabel}>Medicines</Text>
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
                  placeholder="Additional advice for patient"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                  value={customAdvice}
                  onChangeText={setCustomAdvice}
                />
              </View>
            )}

            {selectedTemplate && !selectedTemplate.isCustom && (
              <View style={styles.templatePreviewCard}>
                <Text style={styles.previewLabel}>📋 Prescription Preview</Text>
                <View style={styles.previewItem}>
                  <Text style={styles.previewItemLabel}>Medicines:</Text>
                  <Text style={styles.previewItemValue} numberOfLines={2}>
                    {selectedTemplate.medicines}
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewItemLabel}>Duration:</Text>
                  <Text style={styles.previewItemValue}>{selectedTemplate.duration}</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewItemLabel}>Advice:</Text>
                  <Text style={styles.previewItemValue}>{selectedTemplate.advice}</Text>
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
                onPress={sendToPharmacy}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.white }]}>Send to Pharmacy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
          <View style={styles.content}>
            {renderPatientCard()}
            {renderActionButtons()}
          </View>

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

  // ─── Header ────────────────────────────────────────────────────────────
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

  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },

  // ─── Content ──────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingTop: hp(1),
  },

  // ─── Patient Card ────────────────────────────────────────────────────
  patientCard: {
    borderRadius: wp(4),
    overflow: 'hidden',
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patientCardGradient: {
    padding: wp(4),
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: wp(2.5),
    fontWeight: '700',
  },
  queueNumber: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  avatarContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  patientInfo: {
    flex: 1,
  },
  tokenNumber: {
    fontSize: wp(5),
    fontWeight: '800',
    color: COLORS.primary,
  },
  patientName: {
    fontSize: wp(5.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  patientMeta: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },

  priorityBadge: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: wp(3),
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: wp(1),
    marginBottom: hp(0.8),
  },
  priorityText: {
    color: COLORS.white,
    fontSize: wp(2.8),
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: hp(0.8),
  },

  patientDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: hp(0.5),
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
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(0.05),
  },
  detailDivider: {
    width: 1,
    height: hp(4),
    backgroundColor: COLORS.border,
  },

  symptomsContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(2.5),
    padding: wp(3),
    marginTop: hp(0.8),
  },
  symptomsTitle: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.2),
  },
  symptomsText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    lineHeight: hp(2),
  },

  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: wp(3),
    marginTop: hp(0.8),
    gap: wp(1),
    alignSelf: 'center',
  },
  completedBadgeText: {
    color: '#10B981',
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  // ─── Empty State ────────────────────────────────────────────────────
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

  // ─── Action Buttons ──────────────────────────────────────────────────
  actionContainer: {
    marginTop: hp(0.5),
  },
  callButton: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1.5),
    ...SHADOWS.medium,
  },
  callButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.8),
    gap: wp(2),
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: '700',
  },
  cardShadow: { ...SHADOWS.medium },

  secondaryButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: hp(1.2),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: wp(1.5),
  },
  secondaryBtnText: {
    fontSize: wp(3.2),
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ✅ Queue Button with Count
  queueBtn: {
    position: 'relative',
  },
  queueBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  queueCountBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  queueCountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },

  completedToggle: {
    alignItems: 'center',
    marginTop: hp(1),
    paddingVertical: hp(0.5),
  },
  completedToggleText: {
    fontSize: wp(3),
    color: COLORS.primary,
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
  previewLabel: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.3),
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