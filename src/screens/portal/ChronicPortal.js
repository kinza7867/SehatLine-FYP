import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, Modal, Dimensions, StatusBar, SafeAreaView,
  ActivityIndicator, Image, Platform, KeyboardAvoidingView,
  RefreshControl, FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Department-specific dropdown options
const departmentConfig = {
  Cardiology: {
    icon: 'heart-outline',
    color: '#FF6B6B',
    symptoms: [
      { label: 'Chest Pain', value: 'Chest Pain' },
      { label: 'Shortness of Breath', value: 'Shortness of Breath' },
      { label: 'Palpitations', value: 'Palpitations' },
      { label: 'Dizziness', value: 'Dizziness' },
      { label: 'Swelling in Legs', value: 'Swelling in Legs' },
      { label: 'Fatigue', value: 'Fatigue' },
      { label: 'High Blood Pressure', value: 'High Blood Pressure' },
      { label: 'Irregular Heartbeat', value: 'Irregular Heartbeat' },
    ],
    purposes: [
      { label: 'Heart Checkup', value: 'Heart Checkup' },
      { label: 'ECG/EKG', value: 'ECG/EKG' },
      { label: 'Echocardiogram', value: 'Echocardiogram' },
      { label: 'Angiography', value: 'Angiography' },
      { label: 'Blood Pressure Check', value: 'Blood Pressure Check' },
      { label: 'Heart Failure Management', value: 'Heart Failure Management' },
    ]
  },
  Pharmacy: {
    icon: 'medkit-outline',
    color: '#4ECDC4',
    symptoms: [
      { label: 'New Prescription', value: 'New Prescription' },
      { label: 'Prescription Refill', value: 'Prescription Refill' },
      { label: 'Medication Side Effects', value: 'Medication Side Effects' },
      { label: 'Drug Interaction Concern', value: 'Drug Interaction Concern' },
      { label: 'Allergic Reaction', value: 'Allergic Reaction' },
      { label: 'Medication Review', value: 'Medication Review' },
      { label: 'OTC Medicine Advice', value: 'OTC Medicine Advice' },
      { label: 'Chronic Medication Management', value: 'Chronic Medication Management' },
    ],
    purposes: [
      { label: 'New Prescription Pickup', value: 'New Prescription Pickup' },
      { label: 'Prescription Refill', value: 'Prescription Refill' },
      { label: 'Medication Consultation', value: 'Medication Consultation' },
      { label: 'Immunization/Vaccination', value: 'Immunization/Vaccination' },
      { label: 'Health Screening', value: 'Health Screening' },
      { label: 'OTC Medicine Purchase', value: 'OTC Medicine Purchase' },
      { label: 'Medication Review', value: 'Medication Review' },
      { label: 'Emergency Medication', value: 'Emergency Medication' },
    ]
  },
  Laboratory: {
    icon: 'flask-outline',
    color: '#A29BFE',
    symptoms: [
      { label: 'Blood Test Required', value: 'Blood Test Required' },
      { label: 'Urine Test', value: 'Urine Test' },
      { label: 'Hormone Check', value: 'Hormone Check' },
      { label: 'Thyroid Test', value: 'Thyroid Test' },
      { label: 'Diabetes Test', value: 'Diabetes Test' },
      { label: 'Cholesterol Test', value: 'Cholesterol Test' },
      { label: 'Infection Test', value: 'Infection Test' },
      { label: 'Vitamin Deficiency', value: 'Vitamin Deficiency' },
    ],
    purposes: [
      { label: 'Blood Test (CBC)', value: 'Blood Test (CBC)' },
      { label: 'Lipid Profile', value: 'Lipid Profile' },
      { label: 'Thyroid Panel', value: 'Thyroid Panel' },
      { label: 'Diabetes (HbA1c)', value: 'Diabetes (HbA1c)' },
      { label: 'Kidney Function Test', value: 'Kidney Function Test' },
      { label: 'Liver Function Test', value: 'Liver Function Test' },
      { label: 'Urine Analysis', value: 'Urine Analysis' },
      { label: 'Vitamin D Test', value: 'Vitamin D Test' },
    ]
  }
};

// Simulated queue data for different departments
const departmentQueues = {
  Cardiology: { currentToken: 5, totalPatients: 12, avgWaitTime: 25 },
  Pharmacy: { currentToken: 3, totalPatients: 8, avgWaitTime: 15 },
  Laboratory: { currentToken: 7, totalPatients: 15, avgWaitTime: 30 },
};

// Custom Dropdown Component
const CustomDropdown = ({ label, options, selectedValue, onSelect, placeholder, color }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownWrapper, { borderColor: color || COLORS.primary }]}
        onPress={() => setShowDropdown(!showDropdown)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !selectedValue && styles.dropdownPlaceholder]}>
          {selectedValue ? selectedOption?.label || selectedValue : placeholder || 'Select option'}
        </Text>
        <Ionicons 
          name={showDropdown ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={color || COLORS.primary} 
        />
      </TouchableOpacity>
      
      {showDropdown && (
        <View style={[styles.dropdownList, { borderColor: color || COLORS.primary }]}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedValue === item.value && styles.dropdownItemActive,
                  { borderColor: selectedValue === item.value ? (color || COLORS.primary) : 'transparent' }
                ]}
                onPress={() => {
                  onSelect(item.value);
                  setShowDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedValue === item.value && styles.dropdownItemTextActive
                ]}>
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <Ionicons name="checkmark" size={18} color={color || COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
            style={styles.dropdownFlatList}
          />
        </View>
      )}
    </View>
  );
};

// Pharmacy specific logic - Prescription verification
const verifyPrescription = (prescriptionNumber) => {
  const isValid = prescriptionNumber && prescriptionNumber.length >= 6;
  return isValid;
};

// Generate prescription number for pharmacy
const generatePrescriptionNumber = () => {
  const prefix = 'RX';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}${timestamp}${random}`;
};

const EntryPointScreen = ({ navigation, route }) => {
  const [cnic, setCnic] = useState('');
  const [patient, setPatient] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [liveQueueData, setLiveQueueData] = useState(null);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [isPrescriptionValid, setIsPrescriptionValid] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    emergencyContact: '',
    department: 'Cardiology',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      bloodSugar: '',
    }
  });
  const tokenRef = useRef();

  const loggedInUser = route?.params?.userData || null;
  const departments = ['Cardiology', 'Pharmacy', 'Laboratory'];

  // Get current department config
  const currentDeptConfig = departmentConfig[newPatient.department] || departmentConfig.Cardiology;

  // Check if pharmacy department is selected
  const isPharmacy = newPatient.department === 'Pharmacy';

  // Simulate live queue updates
  useEffect(() => {
    if (patient) {
      const interval = setInterval(() => {
        const dept = patient.department || 'Cardiology';
        const queue = departmentQueues[dept] || departmentQueues.Cardiology;
        const update = {
          currentToken: queue.currentToken + Math.floor(Math.random() * 2),
          totalPatients: queue.totalPatients + Math.floor(Math.random() * 3 - 1),
          avgWaitTime: queue.avgWaitTime + Math.floor(Math.random() * 5 - 2),
        };
        setLiveQueueData(update);
        departmentQueues[dept] = update;
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [patient]);

  const formatCNICDisplay = (text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  };

  const formatCNIC = (text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 5) {
      setCnic(cleaned);
    } else if (cleaned.length <= 12) {
      setCnic(`${cleaned.slice(0, 5)}-${cleaned.slice(5)}`);
    } else if (cleaned.length <= 13) {
      setCnic(`${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`);
    } else {
      setCnic(`${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`);
    }
  };

  const validateCNIC = (cnic) => {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    return cnicRegex.test(cnic);
  };

  const validateName = (text) => {
    if (text.length > 0 && text.length < 3) return 'Name must be at least 3 characters';
    if (text.length > 50) return 'Name cannot exceed 50 characters';
    return '';
  };

  const validatePhone = (text) => {
    const clean = text.replace(/-/g, '');
    if (text.length > 0 && clean.length < 10) return 'Phone must be at least 10 digits';
    if (clean.length > 11) return 'Phone cannot exceed 11 digits';
    if (text.length > 0 && !/^03\d{9}$/.test(clean)) return 'Enter valid Pakistani number (03xxxxxxxxx)';
    return '';
  };

  const validateEmergencyContact = (text) => {
    const clean = text.replace(/-/g, '');
    if (text.length > 0 && clean.length < 10) return 'Emergency contact must be at least 10 digits';
    if (clean.length > 11) return 'Emergency contact cannot exceed 11 digits';
    if (text.length > 0 && !/^03\d{9}$/.test(clean)) return 'Enter valid emergency contact (03xxxxxxxxx)';
    return '';
  };

  const handleFieldChange = (field, value) => {
    let error = '';
    if (field === 'name') error = validateName(value);
    else if (field === 'phone') error = validatePhone(value);
    else if (field === 'emergencyContact') error = validateEmergencyContact(value);
    else if (field === 'department') {
      setSelectedSymptom('');
      setSelectedPurpose('');
      setPrescriptionNumber('');
      setIsPrescriptionValid(false);
      setNewPatient({...newPatient, [field]: value});
      return;
    } else if (field.startsWith('vitals.')) {
      const vitalKey = field.split('.')[1];
      setNewPatient({
        ...newPatient, 
        vitals: {...newPatient.vitals, [vitalKey]: value}
      });
      return;
    }
    
    setNewPatient({...newPatient, [field]: value});
    setErrors({...errors, [field]: error});
  };

  // Handle prescription verification for pharmacy
  const handlePrescriptionChange = (text) => {
    setPrescriptionNumber(text);
    if (text.length >= 6) {
      const isValid = verifyPrescription(text);
      setIsPrescriptionValid(isValid);
    } else {
      setIsPrescriptionValid(false);
    }
  };

  const validateRegistrationForm = () => {
    const nameError = validateName(newPatient.name);
    const phoneError = validatePhone(newPatient.phone);
    const emergencyError = validateEmergencyContact(newPatient.emergencyContact);
    
    const newErrors = {
      name: nameError,
      phone: phoneError,
      emergencyContact: emergencyError
    };
    setErrors(newErrors);

    if (!newPatient.name.trim()) {
      Alert.alert('Error', 'Please enter patient name');
      return false;
    }
    if (nameError) {
      Alert.alert('Error', nameError);
      return false;
    }
    if (!newPatient.phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    if (phoneError) {
      Alert.alert('Error', phoneError);
      return false;
    }
    if (!newPatient.emergencyContact.trim()) {
      Alert.alert('Error', 'Please enter emergency contact');
      return false;
    }
    if (emergencyError) {
      Alert.alert('Error', emergencyError);
      return false;
    }
    if (!selectedPurpose) {
      Alert.alert('Error', 'Please select a purpose for your visit');
      return false;
    }
    
    // Pharmacy specific validation
    if (isPharmacy && !prescriptionNumber) {
      Alert.alert('Error', 'Please enter your prescription number');
      return false;
    }
    if (isPharmacy && !isPrescriptionValid) {
      Alert.alert('Error', 'Please enter a valid prescription number (minimum 6 characters)');
      return false;
    }
    
    return true;
  };

  const generateTokenNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    return `${timestamp}${random}`;
  };

  const findPatient = async () => {
    if (!cnic) {
      Alert.alert('Error', 'Please enter your CNIC number');
      return;
    }

    if (!validateCNIC(cnic)) {
      Alert.alert('Invalid CNIC', 'Please enter a valid CNIC number in format: 12345-1234567-1');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowRegistration(true);
    }, 1500);
  };

  const registerNewPatient = () => {
    if (!validateRegistrationForm()) return;
    
    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      const cleanCNIC = cnic.replace(/-/g, '');
      
      // Generate prescription number if pharmacy
      let prescriptionInfo = '';
      if (isPharmacy) {
        const rxNumber = generatePrescriptionNumber();
        prescriptionInfo = `Rx: ${rxNumber} | Verified: Yes`;
      }
      
      const patientData = {
        name: newPatient.name,
        cnic: cnic,
        phone: newPatient.phone,
        bloodGroup: newPatient.bloodGroup || 'Not Specified',
        emergencyContact: newPatient.emergencyContact,
        department: newPatient.department || 'Cardiology',
        symptom: selectedSymptom || 'None reported',
        purpose: selectedPurpose || 'General Consultation',
        vitals: newPatient.vitals,
        prescriptionInfo: prescriptionInfo,
        lastVisit: new Date().toLocaleDateString(),
        condition: 'New Patient - Initial Assessment',
        doctor: 'To be assigned',
        mrn: `MRN-${cleanCNIC.slice(-6)}`,
        isRegistered: true
      };
      setPatient(patientData);
      setShowRegistration(false);
      
      const dept = patientData.department;
      const queue = departmentQueues[dept] || { currentToken: 1, totalPatients: 0, avgWaitTime: 15 };
      const position = queue.totalPatients + 1;
      const wait = Math.floor(10 + position * 2.5);
      setQueuePosition(position);
      setEstimatedWait(wait);
      
      Alert.alert(
        'Registration Successful!',
        `${newPatient.name}, you have been successfully registered.`,
        [{ text: 'Continue' }]
      );
    }, 1500);
  };

  const generateToken = () => {
    if (!patient) return;
    
    const dept = patient.department;
    const queue = departmentQueues[dept] || { currentToken: 1, totalPatients: 0, avgWaitTime: 15 };
    const position = queue.totalPatients + 1;
    const wait = Math.floor(10 + position * 2.5);
    setQueuePosition(position);
    setEstimatedWait(wait);
    
    queue.totalPatients += 1;
    queue.currentToken += 1;
    departmentQueues[dept] = queue;
    
    const newToken = generateTokenNumber();
    setTokenNumber(newToken);
    setShowToken(true);
  };

  const printToken = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: white; }
              .container { border: 2px solid #43E6D4; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; }
              .hospital { color: #1F2937; font-size: 24px; font-weight: bold; }
              .token { font-size: 64px; font-weight: bold; color: #43E6D4; margin: 20px 0; letter-spacing: 4px; }
              .info { text-align: left; margin: 20px 0; padding: 20px; background: #F7F8FA; border-radius: 12px; }
              .row { margin: 10px 0; font-size: 16px; display: flex; justify-content: space-between; }
              .purpose-box { background: #43E6D4; padding: 12px; border-radius: 8px; margin: 15px 0; text-align: center; }
              .purpose-text { color: white; font-size: 18px; font-weight: bold; }
              .wait { background: #FEE2E2; padding: 16px; border-radius: 12px; margin: 20px 0; }
              .wait-large { font-size: 36px; font-weight: bold; color: #EF4444; }
              .footer { margin-top: 20px; font-size: 12px; color: #6B7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="hospital">CDA Hospital Islamabad</div>
              <div style="color: #6B7280; margin: 5px 0;">${patient.department} Department</div>
              <div class="token">#${tokenNumber}</div>
              <div class="purpose-box">
                <div class="purpose-text">${patient.purpose || 'General Consultation'}</div>
              </div>
              <div class="info">
                <div class="row"><strong>Patient:</strong> ${patient.name}</div>
                <div class="row"><strong>CNIC:</strong> ${patient.cnic}</div>
                <div class="row"><strong>MRN:</strong> ${patient.mrn}</div>
                <div class="row"><strong>Department:</strong> ${patient.department}</div>
                <div class="row"><strong>Blood Group:</strong> ${patient.bloodGroup}</div>
                <div class="row"><strong>Symptom:</strong> ${patient.symptom || 'None'}</div>
                ${patient.prescriptionInfo ? `<div class="row"><strong>Prescription:</strong> ${patient.prescriptionInfo}</div>` : ''}
              </div>
              <div class="wait">
                <strong>Estimated Wait Time</strong>
                <div class="wait-large">${estimatedWait} Minutes</div>
                <div style="margin-top: 5px; color: #6B7280;">Queue Position: #${queuePosition}</div>
              </div>
              <div class="footer">Valid for today only • ${new Date().toLocaleString()}</div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Print.printAsync({ uri });
      }
      
      Alert.alert('Success', 'Token printed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Unable to print. Please try again.');
    }
  };

  const captureScreenshot = async () => {
    if (tokenRef.current) {
      try {
        const uri = await tokenRef.current.capture();
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save Token',
        });
        Alert.alert('Success', 'Token saved to gallery!');
      } catch (error) {
        Alert.alert('Error', 'Unable to capture screenshot');
      }
    }
  };

  const completeAndNavigate = () => {
    setShowToken(false);
    setPatient(null);
    setCnic('');
    setShowRegistration(false);
    setSelectedSymptom('');
    setSelectedPurpose('');
    setPrescriptionNumber('');
    setIsPrescriptionValid(false);
    setNewPatient({ 
      name: '', phone: '', bloodGroup: '', 
      emergencyContact: '', department: 'Cardiology',
      vitals: { bloodPressure: '', heartRate: '', temperature: '', bloodSugar: '' }
    });
    setErrors({});
    Alert.alert(
      'Token Generated Successfully!',
      `Your token #${tokenNumber} has been generated. Queue position: #${queuePosition}. Estimated wait: ${estimatedWait} minutes.`,
      [{ text: 'OK', onPress: () => navigation.replace('VisitorHome') }]
    );
  };

  const resetForm = () => {
    setCnic('');
    setPatient(null);
    setShowRegistration(false);
    setSelectedSymptom('');
    setSelectedPurpose('');
    setPrescriptionNumber('');
    setIsPrescriptionValid(false);
    setNewPatient({ 
      name: '', phone: '', bloodGroup: '', 
      emergencyContact: '', department: 'Cardiology',
      vitals: { bloodPressure: '', heartRate: '', temperature: '', bloodSugar: '' }
    });
    setErrors({});
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      if (patient) {
        const dept = patient.department;
        const queue = departmentQueues[dept] || { currentToken: 1, totalPatients: 0, avgWaitTime: 15 };
        const position = Math.floor(1 + Math.random() * 10);
        const wait = Math.floor(10 + position * 2.5);
        setQueuePosition(position);
        setEstimatedWait(wait);
      }
      setRefreshing(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.25 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoOutline}>
              <Image 
                source={require('../../../assets/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.tagline}>Patient Care Management</Text>
        <Text style={styles.subtitle}>Smart Token Generation System</Text>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        >
          <View style={[styles.card, styles.cardShadow]}>
            <Text style={styles.cardTitle}>PATIENT VERIFICATION</Text>
            <Text style={styles.cardSubtitle}>Enter your CNIC to continue</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={22} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="12345-1234567-1"
                placeholderTextColor={COLORS.textLight}
                value={cnic}
                onChangeText={formatCNIC}
                keyboardType="numeric"
                maxLength={15}
                editable={!patient}
              />
              {cnic.length > 0 && !patient && (
                <TouchableOpacity onPress={() => setCnic('')} style={styles.clearIcon}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>
            
            {!patient && (
              <TouchableOpacity style={styles.searchBtn} onPress={findPatient} disabled={loading}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.btnGradient}>
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.btnText}>Verify & Continue</Text>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {showRegistration && !patient && (
            <View style={[styles.registrationCard, styles.cardShadow]}>
              <Text style={styles.registrationTitle}>New Patient Registration</Text>
              <Text style={styles.registrationSubtitle}>Complete your registration</Text>
              
              <View style={styles.regInputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.regInput}
                  placeholder="Full Name (3-50 characters)"
                  placeholderTextColor={COLORS.textLight}
                  value={newPatient.name}
                  onChangeText={(text) => handleFieldChange('name', text)}
                  maxLength={50}
                />
                {newPatient.name.length > 0 && !errors.name && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                )}
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              
              <View style={styles.regInputContainer}>
                <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.regInput}
                  placeholder="Phone Number (03xxxxxxxxx)"
                  placeholderTextColor={COLORS.textLight}
                  value={newPatient.phone}
                  onChangeText={(text) => handleFieldChange('phone', text)}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
                {newPatient.phone.length >= 10 && !errors.phone && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                )}
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              
              <View style={styles.regInputContainer}>
                <Ionicons name="water-outline" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.regInput}
                  placeholder="Blood Group (Optional)"
                  placeholderTextColor={COLORS.textLight}
                  value={newPatient.bloodGroup}
                  onChangeText={(text) => setNewPatient({...newPatient, bloodGroup: text.toUpperCase()})}
                  autoCapitalize="characters"
                  maxLength={5}
                />
              </View>
              
              <View style={styles.regInputContainer}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.regInput}
                  placeholder="Emergency Contact (03xxxxxxxxx)"
                  placeholderTextColor={COLORS.textLight}
                  value={newPatient.emergencyContact}
                  onChangeText={(text) => handleFieldChange('emergencyContact', text)}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
                {newPatient.emergencyContact.length >= 10 && !errors.emergencyContact && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                )}
              </View>
              {errors.emergencyContact && <Text style={styles.errorText}>{errors.emergencyContact}</Text>}

              {/* Department Selection */}
              <View style={styles.regInputContainer}>
                <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {departments.map((dept) => {
                    const config = departmentConfig[dept];
                    return (
                      <TouchableOpacity
                        key={dept}
                        style={[styles.deptChip, newPatient.department === dept && styles.deptChipActive]}
                        onPress={() => handleFieldChange('department', dept)}
                      >
                        <Ionicons name={config.icon} size={14} color={newPatient.department === dept ? COLORS.white : config.color} />
                        <Text style={[styles.deptChipText, newPatient.department === dept && styles.deptChipTextActive]}>
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Symptom Dropdown - Custom */}
              <CustomDropdown
                label="Select Symptom"
                options={currentDeptConfig.symptoms}
                selectedValue={selectedSymptom}
                onSelect={setSelectedSymptom}
                placeholder="-- Select Symptom --"
                color={currentDeptConfig.color}
              />

              {/* Purpose Dropdown - Custom */}
              <CustomDropdown
                label="Select Purpose of Visit"
                options={currentDeptConfig.purposes}
                selectedValue={selectedPurpose}
                onSelect={setSelectedPurpose}
                placeholder="-- Select Purpose --"
                color={currentDeptConfig.color}
              />

              {/* Pharmacy Prescription Input */}
              {isPharmacy && (
                <View style={styles.prescriptionContainer}>
                  <Text style={styles.dropdownLabel}>Prescription Number</Text>
                  <View style={[
                    styles.prescriptionInputWrapper,
                    isPrescriptionValid ? styles.prescriptionValid : styles.prescriptionInvalid,
                    { borderColor: isPrescriptionValid ? COLORS.success : (prescriptionNumber.length > 0 ? COLORS.danger : COLORS.border) }
                  ]}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                    <TextInput
                      style={styles.prescriptionInput}
                      placeholder="Enter prescription no(e.g., RX123456)"
                      placeholderTextColor={COLORS.textLight}
                      value={prescriptionNumber}
                      onChangeText={handlePrescriptionChange}
                      autoCapitalize="characters"
                    />
                    {prescriptionNumber.length > 0 && (
                      <Ionicons 
                        name={isPrescriptionValid ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={isPrescriptionValid ? COLORS.success : COLORS.danger} 
                      />
                    )}
                  </View>
                  {prescriptionNumber.length > 0 && (
                    <Text style={[
                      styles.prescriptionStatus,
                      { color: isPrescriptionValid ? COLORS.success : COLORS.danger }
                    ]}>
                      {isPrescriptionValid ? '✓ Prescription Verified' : '✗ Invalid Prescription Number (min 6 chars)'}
                    </Text>
                  )}
                  <Text style={styles.prescriptionHint}>
                    Enter your prescription number for verification
                  </Text>
                </View>
              )}

              {/* Vitals - Optional */}
              <Text style={styles.vitalsLabel}>Vitals (Optional)</Text>
              <View style={styles.vitalsRow}>
                <View style={styles.vitalInput}>
                  <Text style={styles.vitalLabel}>BP</Text>
                  <TextInput
                    style={styles.vitalField}
                    placeholder="120/80"
                    placeholderTextColor={COLORS.textLight}
                    value={newPatient.vitals.bloodPressure}
                    onChangeText={(text) => handleFieldChange('vitals.bloodPressure', text)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.vitalInput}>
                  <Text style={styles.vitalLabel}>HR</Text>
                  <TextInput
                    style={styles.vitalField}
                    placeholder="72"
                    placeholderTextColor={COLORS.textLight}
                    value={newPatient.vitals.heartRate}
                    onChangeText={(text) => handleFieldChange('vitals.heartRate', text)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.vitalInput}>
                  <Text style={styles.vitalLabel}>Temp</Text>
                  <TextInput
                    style={styles.vitalField}
                    placeholder="98.6"
                    placeholderTextColor={COLORS.textLight}
                    value={newPatient.vitals.temperature}
                    onChangeText={(text) => handleFieldChange('vitals.temperature', text)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.vitalInput}>
                  <Text style={styles.vitalLabel}>Sugar</Text>
                  <TextInput
                    style={styles.vitalField}
                    placeholder="120"
                    placeholderTextColor={COLORS.textLight}
                    value={newPatient.vitals.bloodSugar}
                    onChangeText={(text) => handleFieldChange('vitals.bloodSugar', text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <TouchableOpacity style={styles.registerBtn} onPress={registerNewPatient} disabled={registering}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.btnGradient}>
                  {registering ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.btnText}>Complete Registration</Text>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowRegistration(false)} style={styles.cancelRegBtn}>
                <Text style={styles.cancelRegText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {patient && (
            <View style={[styles.patientCard, styles.cardShadow]}>
              <View style={styles.patientHeader}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person-circle" size={55} color={COLORS.primary} />
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientMrn}>{patient.mrn}</Text>
                </View>
                <TouchableOpacity onPress={resetForm} style={styles.editBtn}>
                  <Ionicons name="refresh-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{patient.phone}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Blood Group</Text>
                  <Text style={styles.detailValue}>{patient.bloodGroup}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="business-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>{patient.department}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="medical-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Purpose</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{patient.purpose || 'General'}</Text>
                </View>
              </View>

              {/* Live Queue Status */}
              <View style={styles.queueStatus}>
                <Text style={styles.queueStatusTitle}>Live Queue Status</Text>
                <View style={styles.queueStatusRow}>
                  <View style={styles.queueStatusItem}>
                    <Text style={styles.queueStatusLabel}>Your Position</Text>
                    <Text style={styles.queueStatusValue}>#{queuePosition || '--'}</Text>
                  </View>
                  <View style={styles.queueStatusDivider} />
                  <View style={styles.queueStatusItem}>
                    <Text style={styles.queueStatusLabel}>Wait Time</Text>
                    <Text style={styles.queueStatusValue}>{estimatedWait || '--'} min</Text>
                  </View>
                  <View style={styles.queueStatusDivider} />
                  <View style={styles.queueStatusItem}>
                    <Text style={styles.queueStatusLabel}>Current Token</Text>
                    <Text style={styles.queueStatusValue}>
                      #{liveQueueData?.currentToken || departmentQueues[patient.department]?.currentToken || '--'}
                    </Text>
                  </View>
                </View>
                <View style={styles.queueProgress}>
                  <View style={[styles.queueProgressBar, { 
                    width: `${Math.min((queuePosition / (liveQueueData?.totalPatients || 20)) * 100, 100)}%` 
                  }]} />
                </View>
                <Text style={styles.queueProgressText}>
                  {liveQueueData?.totalPatients || 0} patients ahead
                </Text>
              </View>

              <TouchableOpacity style={styles.generateBtn} onPress={generateToken}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.generateGradient}>
                  <Ionicons name="qr-code-outline" size={24} color={COLORS.white} />
                  <Text style={styles.generateText}>Generate Token</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Token Modal */}
      <Modal visible={showToken} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.cardShadow]}>
            <ScrollView 
              contentContainerStyle={styles.modalScroll} 
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <ViewShot ref={tokenRef} options={{ format: 'png', quality: 1 }}>
                <View style={styles.tokenContainer}>
                  <View style={styles.tokenHeader}>
                    <View style={styles.tokenLogoCircle}>
                      <Image 
                        source={require('../../../assets/logo.png')} 
                        style={styles.tokenLogo}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.tokenHospital}>CDA Hospital Islamabad</Text>
                    <Text style={styles.tokenSubtitle}>{patient?.department} Department</Text>
                  </View>

                  <View style={styles.divider} />
                  
                  <View style={styles.tokenNumberContainer}>
                    <Text style={styles.tokenLabel}>TOKEN NUMBER</Text>
                    <Text style={styles.tokenNumberDisplay}>#{tokenNumber}</Text>
                  </View>

                  {/* Purpose Badge */}
                  <View style={[styles.purposeBadge, { backgroundColor: departmentConfig[patient?.department]?.color || COLORS.primary }]}>
                    <Text style={styles.purposeBadgeText}>{patient?.purpose || 'General Consultation'}</Text>
                  </View>

                  <View style={styles.tokenInfo}>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>Patient:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.name}</Text>
                    </View>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>CNIC:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.cnic}</Text>
                    </View>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>MRN:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.mrn}</Text>
                    </View>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>Department:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.department}</Text>
                    </View>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>Symptom:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.symptom || 'None'}</Text>
                    </View>
                    {patient?.prescriptionInfo && (
                      <View style={styles.tokenInfoRow}>
                        <Text style={styles.tokenInfoLabel}>Prescription:</Text>
                        <Text style={[styles.tokenInfoValue, { color: COLORS.success }]}>{patient?.prescriptionInfo}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.waitTimeContainer}>
                    <Text style={styles.waitTimeLabel}>QUEUE POSITION</Text>
                    <Text style={styles.waitTimePosition}>#{queuePosition}</Text>
                    <Text style={styles.waitTimeLabel}>Estimated Wait Time</Text>
                    <Text style={styles.waitTimeValue}>{estimatedWait} Minutes</Text>
                  </View>

                  <View style={styles.qrContainer}>
                    <Ionicons name="qr-code" size={80} color={COLORS.text} />
                    <Text style={styles.qrText}>Scan at Patient Desk</Text>
                  </View>

                  <View style={styles.divider} />
                  
                  <Text style={styles.tokenFooter}>Valid for today only • Please keep this token</Text>
                  <Text style={styles.tokenDate}>{new Date().toLocaleString()}</Text>
                </View>
              </ViewShot>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn} onPress={printToken}>
                  <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.border]} style={styles.actionGradient}>
                    <Ionicons name="print-outline" size={20} color={COLORS.primary} />
                    <Text style={[styles.actionText, {color: COLORS.primary}]}>Print</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionBtn} onPress={captureScreenshot}>
                  <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.border]} style={styles.actionGradient}>
                    <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                    <Text style={[styles.actionText, {color: COLORS.primary}]}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionBtn} onPress={completeAndNavigate}>
                  <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.actionGradientConfirm}>
                    <Ionicons name="checkmark-done-outline" size={20} color={COLORS.white} />
                    <Text style={[styles.actionText, {color: COLORS.white}]}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBackground: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.xl, 
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: SIZES.md 
  },
  backButton: { 
    width: 40, height: 40, 
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  refreshButton: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoOutline: { 
    width: 44, height: 44, 
    borderRadius: 22, 
    borderWidth: 2, 
    borderColor: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', 
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  logoImage: { width: 32, height: 32, borderRadius: 16 },
  
  tagline: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginTop: 5 
  },
  subtitle: { 
    color: COLORS.white, 
    fontSize: 13, 
    textAlign: 'center', 
    marginBottom: SIZES.xl,
    opacity: 0.8 
  },
  
  content: { padding: SIZES.xl, paddingBottom: 40 },
  
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: SIZES.xl, 
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardShadow: { ...SHADOWS.medium },
  cardTitle: { 
    color: COLORS.primary, 
    fontSize: SIZES.small, 
    fontWeight: 'bold', 
    letterSpacing: 1, 
    marginBottom: 5 
  },
  cardSubtitle: { 
    color: COLORS.textSecondary, 
    fontSize: SIZES.body, 
    marginBottom: SIZES.xl 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundSecondary, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginBottom: SIZES.xl 
  },
  inputIcon: { padding: SIZES.md },
  input: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: SIZES.body, 
    paddingVertical: 14, 
    paddingRight: 12 
  },
  clearIcon: { padding: SIZES.md },
  searchBtn: { borderRadius: 12, overflow: 'hidden', ...SHADOWS.button },
  btnGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    gap: 10 
  },
  btnText: { color: COLORS.white, fontSize: SIZES.h5, fontWeight: 'bold' },
  
  registrationCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: SIZES.xl, 
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  registrationTitle: { 
    color: COLORS.text, 
    fontSize: SIZES.h4, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 5 
  },
  registrationSubtitle: { 
    color: COLORS.textSecondary, 
    fontSize: SIZES.small, 
    textAlign: 'center', 
    marginBottom: SIZES.xl 
  },
  regInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundSecondary, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginBottom: SIZES.md, 
    paddingHorizontal: SIZES.md 
  },
  regInput: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: SIZES.body, 
    paddingVertical: 12, 
    marginLeft: 10 
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.small,
    marginLeft: 8,
    marginBottom: 8,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  deptChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  deptChipText: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
  },
  deptChipTextActive: {
    color: COLORS.white,
  },
  
  // Custom Dropdown Styles
  dropdownContainer: {
    marginBottom: SIZES.md,
  },
  dropdownLabel: {
    color: COLORS.text,
    fontSize: SIZES.small,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: COLORS.textLight,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
    maxHeight: 180,
    ...SHADOWS.medium,
  },
  dropdownFlatList: {
    borderRadius: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
  },
  dropdownItemText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    flex: 1,
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  prescriptionContainer: {
    marginBottom: SIZES.md,
  },
  prescriptionInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: SIZES.md,
    height: 50,
  },
  prescriptionValid: {
    borderColor: COLORS.success,
  },
  prescriptionInvalid: {
    borderColor: COLORS.danger,
  },
  prescriptionInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.body,
    paddingVertical: 12,
    marginLeft: 10,
  },
  prescriptionStatus: {
    fontSize: SIZES.small,
    marginTop: 4,
    marginLeft: 8,
  },
  prescriptionHint: {
    color: COLORS.textLight,
    fontSize: SIZES.xSmall,
    marginTop: 2,
    marginLeft: 8,
  },
  
  vitalsLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    marginBottom: 8,
    marginLeft: 4,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  vitalInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  vitalLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xSmall,
    marginBottom: 2,
    textAlign: 'center',
  },
  vitalField: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: SIZES.small,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  registerBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  cancelRegBtn: { marginTop: 12, alignItems: 'center' },
  cancelRegText: { color: COLORS.danger, fontSize: SIZES.body },
  
  patientCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patientHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.xl },
  avatarContainer: { marginRight: 15 },
  patientInfo: { flex: 1 },
  patientName: { color: COLORS.text, fontSize: SIZES.h4, fontWeight: 'bold' },
  patientMrn: { color: COLORS.primary, fontSize: SIZES.small, marginTop: 3 },
  editBtn: { padding: 8 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SIZES.xl, gap: 12 },
  detailItem: { 
    flex: 1, 
    minWidth: '45%', 
    backgroundColor: COLORS.backgroundSecondary, 
    padding: 12, 
    borderRadius: 10 
  },
  detailLabel: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4 },
  detailValue: { color: COLORS.text, fontSize: SIZES.small, fontWeight: '500', marginTop: 2 },
  
  queueStatus: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: SIZES.xl,
  },
  queueStatusTitle: {
    color: COLORS.text,
    fontSize: SIZES.small,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  queueStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  queueStatusItem: {
    alignItems: 'center',
    flex: 1,
  },
  queueStatusLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xSmall,
  },
  queueStatusValue: {
    color: COLORS.primary,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginTop: 2,
  },
  queueStatusDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  queueProgress: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  queueProgressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  queueProgressText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xSmall,
    textAlign: 'center',
    marginTop: 6,
  },
  
  generateBtn: { borderRadius: 12, overflow: 'hidden', ...SHADOWS.button },
  generateGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15, 
    gap: 10 
  },
  generateText: { color: COLORS.white, fontSize: SIZES.h5, fontWeight: 'bold' },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: width * 0.95, 
    maxHeight: height * 0.9,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalScroll: { 
    alignItems: 'center',
    paddingVertical: 10,
  },
  tokenContainer: { 
    width: width * 0.9, 
    borderRadius: 24, 
    padding: SIZES.xl, 
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  tokenHeader: { alignItems: 'center', marginBottom: 15 },
  tokenLogoCircle: { 
    width: 45, height: 45, 
    borderRadius: 27.5, 
    backgroundColor: COLORS.primary + '15', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  tokenLogo: { width: 35, height: 35, borderRadius: 22.5 },
  tokenHospital: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  tokenSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  divider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  
  purposeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  purposeBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  tokenNumberContainer: { alignItems: 'center', marginBottom: SIZES.xl },
  tokenLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  tokenNumberDisplay: { 
    color: COLORS.primary, 
    fontSize: 32, 
    fontWeight: '900', 
    marginTop: 5, 
    letterSpacing: 3 
  },
  tokenInfo: { width: '100%', marginBottom: SIZES.xl, gap: 8 },
  tokenInfoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tokenInfoLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  tokenInfoValue: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  waitTimeContainer: { 
    backgroundColor: COLORS.primary + '10', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    width: '100%', 
    marginBottom: 15 
  },
  waitTimeLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  waitTimePosition: { color: COLORS.primary, fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  waitTimeValue: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
  qrContainer: { alignItems: 'center', marginBottom: 15 },
  qrText: { color: COLORS.textSecondary, fontSize: 11, marginTop: 5 },
  tokenFooter: { color: COLORS.textSecondary, fontSize: 10, textAlign: 'center', marginTop: 2 },
  tokenDate: { color: COLORS.textLight, fontSize: 9, marginTop: 5 },
  
  actionButtons: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 10,
    marginBottom: 5,
    width: width * 0.92,
  },
  actionBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  actionGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionGradientConfirm: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    gap: 6 
  },
  actionText: { fontSize: 13, fontWeight: '600' }
});

export default EntryPointScreen;