import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, Modal, Dimensions, StatusBar, 
  ActivityIndicator, Image, Share, Platform, KeyboardAvoidingView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

const { width, height } = Dimensions.get('window');

const EntryPointScreen = ({ navigation, route }) => {
  const [cnic, setCnic] = useState('');
  const [patient, setPatient] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    emergencyContact: ''
  });
  const tokenRef = useRef();

  const loggedInUser = route?.params?.userData || null;

  useEffect(() => {
    if (loggedInUser?.cnic) {
      setCnic(formatCNICDisplay(loggedInUser.cnic));
    }
  }, [loggedInUser]);

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

  const validateRegistrationForm = () => {
    if (!newPatient.name.trim()) {
      Alert.alert('Error', 'Please enter patient name');
      return false;
    }
    if (newPatient.name.trim().length < 3) {
      Alert.alert('Error', 'Name must be at least 3 characters');
      return false;
    }
    if (!newPatient.phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(newPatient.phone.replace(/-/g, ''))) {
      Alert.alert('Error', 'Please enter valid Pakistani phone number (03xxxxxxxxx)');
      return false;
    }
    if (!newPatient.emergencyContact.trim()) {
      Alert.alert('Error', 'Please enter emergency contact');
      return false;
    }
    if (!phoneRegex.test(newPatient.emergencyContact.replace(/-/g, ''))) {
      Alert.alert('Error', 'Please enter valid emergency contact number');
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
      const cleanCNIC = cnic.replace(/-/g, '');
      setShowRegistration(true);
    }, 1500);
  };

  const registerNewPatient = () => {
    if (!validateRegistrationForm()) return;
    
    setRegistering(true);
    
    setTimeout(() => {
      setRegistering(false);
      const cleanCNIC = cnic.replace(/-/g, '');
      const patientData = {
        name: newPatient.name,
        cnic: cnic,
        phone: newPatient.phone,
        bloodGroup: newPatient.bloodGroup || 'Not Specified',
        emergencyContact: newPatient.emergencyContact,
        lastVisit: new Date().toLocaleDateString(),
        condition: 'New Patient - Initial Assessment',
        doctor: 'To be assigned',
        mrn: `MRN-${cleanCNIC.slice(-6)}`,
        isRegistered: true
      };
      setPatient(patientData);
      setShowRegistration(false);
      Alert.alert(
        'Registration Successful!',
        `${newPatient.name}, you have been successfully registered.`,
        [{ text: 'Continue' }]
      );
    }, 1500);
  };

  const generateToken = () => {
    if (!patient) return;
    
    const newToken = generateTokenNumber();
    setTokenNumber(newToken);
    setShowToken(true);
  };

  const printToken = async () => {
    try {
      const waitTime = Math.floor(15 + Math.random() * 45);
      const htmlContent = `
        <html>
          <head>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                padding: 40px; 
                text-align: center;
                background: white;
              }
              .token-container {
                border: 3px solid #001D3D;
                padding: 40px;
                border-radius: 20px;
                max-width: 700px;
                margin: 0 auto;
                background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
              }
              .hospital-name {
                color: #001D3D;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .token-number {
                font-size: 72px;
                font-weight: bold;
                color: #00EAFF;
                margin: 30px 0;
                letter-spacing: 8px;
              }
              .patient-info {
                text-align: left;
                margin: 30px 0;
                padding: 25px;
                background: #f5f5f5;
                border-radius: 15px;
              }
              .info-row {
                margin: 15px 0;
                font-size: 18px;
                display: flex;
                justify-content: space-between;
              }
              .wait-time {
                background: #FFE5E5;
                padding: 20px;
                border-radius: 15px;
                margin: 30px 0;
                text-align: center;
              }
              .wait-time-large {
                font-size: 42px;
                font-weight: bold;
                color: #FF4D6D;
              }
              .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="token-container">
              <div class="hospital-name">GOVT CARDIAC CENTER</div>
              <div>Patient Care Token</div>
              <div class="token-number">#${tokenNumber}</div>
              
              <div class="patient-info">
                <div class="info-row"><strong>Patient Name:</strong> ${patient.name}</div>
                <div class="info-row"><strong>CNIC:</strong> ${patient.cnic}</div>
                <div class="info-row"><strong>MRN:</strong> ${patient.mrn}</div>
                <div class="info-row"><strong>Phone:</strong> ${patient.phone}</div>
                <div class="info-row"><strong>Blood Group:</strong> ${patient.bloodGroup}</div>
                <div class="info-row"><strong>Doctor:</strong> ${patient.doctor}</div>
              </div>
              
              <div class="wait-time">
                <strong>Estimated Wait Time</strong>
                <div class="wait-time-large">${waitTime} Minutes</div>
              </div>
              
              <div class="footer">
                Please keep this token for your visit • Valid for today only
              </div>
              <div class="footer">
                Generated on: ${new Date().toLocaleString()}
              </div>
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
      
      Alert.alert('Success', 'Token sent to printer successfully!');
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
    setNewPatient({ name: '', phone: '', bloodGroup: '', emergencyContact: '' });
    Alert.alert(
      'Token Generated Successfully!',
      'Your token has been generated.',
      [{ text: 'OK', onPress: () => navigation.replace('VisitorHome') }]
    );
  };

  const resetForm = () => {
    setCnic('');
    setPatient(null);
    setShowRegistration(false);
    setNewPatient({ name: '', phone: '', bloodGroup: '', emergencyContact: '' });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000814" />
      
      <LinearGradient colors={['#000814', '#001D3D', '#000B18']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00EAFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>SEHAT<Text style={{color: '#00EAFF'}}>LINE</Text></Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.tagline}>Patient Care Management</Text>
      <Text style={styles.subtitle}>Digital Token Generation</Text>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={['rgba(0, 29, 61, 0.9)', 'rgba(0, 11, 24, 0.9)']} style={styles.card}>
          <Text style={styles.cardTitle}>PATIENT VERIFICATION</Text>
          <Text style={styles.cardSubtitle}>Enter your CNIC to continue</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={22} color="#00EAFF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input}
              placeholder="12345-1234567-1"
              placeholderTextColor="#666"
              value={cnic}
              onChangeText={formatCNIC}
              keyboardType="numeric"
              maxLength={15}
              editable={!patient}
            />
            {cnic.length > 0 && !patient && (
              <TouchableOpacity onPress={() => setCnic('')} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          
          {!patient && (
            <TouchableOpacity style={styles.searchBtn} onPress={findPatient}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <LinearGradient colors={['#00EAFF', '#0077B6']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>Verify & Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="#000" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          )}
        </LinearGradient>

        {showRegistration && !patient && (
          <LinearGradient colors={['rgba(0, 234, 255, 0.1)', 'rgba(0, 119, 182, 0.1)']} style={styles.registrationCard}>
            <Text style={styles.registrationTitle}>New Patient Registration</Text>
            <Text style={styles.registrationSubtitle}>Complete your registration</Text>
            
            <View style={styles.regInputContainer}>
              <Ionicons name="person-outline" size={20} color="#00EAFF" />
              <TextInput
                style={styles.regInput}
                placeholder="Full Name"
                placeholderTextColor="#666"
                value={newPatient.name}
                onChangeText={(text) => setNewPatient({...newPatient, name: text})}
              />
            </View>
            
            <View style={styles.regInputContainer}>
              <Ionicons name="call-outline" size={20} color="#00EAFF" />
              <TextInput
                style={styles.regInput}
                placeholder="Phone Number (03xxxxxxxxx)"
                placeholderTextColor="#666"
                value={newPatient.phone}
                onChangeText={(text) => setNewPatient({...newPatient, phone: text})}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.regInputContainer}>
              <Ionicons name="water-outline" size={20} color="#00EAFF" />
              <TextInput
                style={styles.regInput}
                placeholder="Blood Group (Optional)"
                placeholderTextColor="#666"
                value={newPatient.bloodGroup}
                onChangeText={(text) => setNewPatient({...newPatient, bloodGroup: text.toUpperCase()})}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.regInputContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#00EAFF" />
              <TextInput
                style={styles.regInput}
                placeholder="Emergency Contact"
                placeholderTextColor="#666"
                value={newPatient.emergencyContact}
                onChangeText={(text) => setNewPatient({...newPatient, emergencyContact: text})}
                keyboardType="phone-pad"
              />
            </View>
            
            <TouchableOpacity style={styles.registerBtn} onPress={registerNewPatient}>
              {registering ? (
                <ActivityIndicator color="#000" />
              ) : (
                <LinearGradient colors={['#00EAFF', '#0077B6']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>Complete Registration</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#000" />
                </LinearGradient>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowRegistration(false)} style={styles.cancelRegBtn}>
              <Text style={styles.cancelRegText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {patient && (
          <LinearGradient colors={['rgba(0, 234, 255, 0.08)', 'rgba(0, 119, 182, 0.08)']} style={styles.patientCard}>
            <View style={styles.patientHeader}>
              <Ionicons name="person-circle" size={55} color="#00EAFF" />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientMrn}>{patient.mrn}</Text>
              </View>
              <TouchableOpacity onPress={resetForm} style={styles.editBtn}>
                <Ionicons name="refresh-outline" size={22} color="#00EAFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={16} color="#00EAFF" />
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{patient.phone}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={16} color="#00EAFF" />
                <Text style={styles.detailLabel}>Blood Group</Text>
                <Text style={styles.detailValue}>{patient.bloodGroup}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="medical-outline" size={16} color="#00EAFF" />
                <Text style={styles.detailLabel}>Doctor</Text>
                <Text style={styles.detailValue}>{patient.doctor}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#00EAFF" />
                <Text style={styles.detailLabel}>Last Visit</Text>
                <Text style={styles.detailValue}>{patient.lastVisit}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.generateBtn} onPress={generateToken}>
              <LinearGradient colors={['#00EAFF', '#0077B6']} style={styles.generateGradient}>
                <Ionicons name="qr-code-outline" size={24} color="#000" />
                <Text style={styles.generateText}>Generate Token</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>

      {/* TOKEN MODAL - OPTIMIZED FOR SINGLE SCREEN VIEW */}
      <Modal visible={showToken} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView 
              contentContainerStyle={styles.modalScroll} 
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <ViewShot ref={tokenRef} options={{ format: 'png', quality: 1 }}>
                <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.tokenContainer}>
                  <View style={styles.tokenHeader}>
                    <View style={styles.tokenLogoCircle}>
                      <Image 
                        source={require('../../../assets/logo.png')} 
                        style={styles.tokenLogo}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.tokenHospital}>GOVT CARDIAC CENTER</Text>
                    <Text style={styles.tokenSubtitle}>Patient Care Token</Text>
                  </View>

                  <View style={styles.divider} />
                  
                  <View style={styles.tokenNumberContainer}>
                    <Text style={styles.tokenLabel}>TOKEN NUMBER</Text>
                    <Text style={styles.tokenNumberDisplay}>#{tokenNumber}</Text>
                  </View>

                  <View style={styles.tokenInfo}>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>Patient Name:</Text>
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
                      <Text style={styles.tokenInfoLabel}>Phone:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.phone}</Text>
                    </View>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>Blood Group:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.bloodGroup}</Text>
                    </View>
                    <View style={styles.tokenInfoRow}>
                      <Text style={styles.tokenInfoLabel}>Doctor:</Text>
                      <Text style={styles.tokenInfoValue}>{patient?.doctor}</Text>
                    </View>
                  </View>

                  <View style={styles.waitTimeContainer}>
                    <Text style={styles.waitTimeLabel}>ESTIMATED WAIT TIME</Text>
                    <Text style={styles.waitTimeValue}>{Math.floor(15 + Math.random() * 45)} Minutes</Text>
                  </View>

                  <View style={styles.qrContainer}>
                    <Ionicons name="qr-code" size={100} color="#001D3D" />
                    <Text style={styles.qrText}>Scan at Patient Desk</Text>
                  </View>

                  <View style={styles.divider} />
                  
                  <Text style={styles.tokenFooter}>Valid for today only • Please keep this token</Text>
                  <Text style={styles.tokenDate}>{new Date().toLocaleString()}</Text>
                </LinearGradient>
              </ViewShot>

              {/* Action Buttons - Always visible */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn} onPress={printToken}>
                  <LinearGradient colors={['#001D3D', '#000B18']} style={styles.actionGradient}>
                    <Ionicons name="print-outline" size={20} color="#00EAFF" />
                    <Text style={styles.actionText}>Print</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionBtn} onPress={captureScreenshot}>
                  <LinearGradient colors={['#001D3D', '#000B18']} style={styles.actionGradient}>
                    <Ionicons name="camera-outline" size={20} color="#00EAFF" />
                    <Text style={styles.actionText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionBtn} onPress={completeAndNavigate}>
                  <LinearGradient colors={['#00EAFF', '#0077B6']} style={styles.actionGradientConfirm}>
                    <Ionicons name="checkmark-done-outline" size={20} color="#000" />
                    <Text style={[styles.actionText, {color: '#000'}]}>Done</Text>
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
  container: { flex: 1, backgroundColor: '#000814' },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: 15 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#001D3D', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoImage: { width: 35, height: 35, borderRadius: 17.5 },
  appName: { color: '#00EAFF', fontSize: 22, fontWeight: '900' },
  
  tagline: { color: '#00EAFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
  subtitle: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  
  content: { padding: 20, paddingBottom: 40 },
  
  card: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0, 234, 255, 0.2)' },
  cardTitle: { color: '#00EAFF', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  cardSubtitle: { color: '#888', fontSize: 13, marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  inputIcon: { padding: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 14, paddingRight: 12 },
  clearIcon: { padding: 12 },
  searchBtn: { borderRadius: 12, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 10 },
  btnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  
  registrationCard: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0, 234, 255, 0.3)' },
  registrationTitle: { color: '#00EAFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  registrationSubtitle: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  regInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 15, paddingHorizontal: 12 },
  regInput: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 12, marginLeft: 10 },
  registerBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  cancelRegBtn: { marginTop: 12, alignItems: 'center' },
  cancelRegText: { color: '#FF4D4D', fontSize: 14 },
  
  patientCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(0, 234, 255, 0.2)' },
  patientHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  patientInfo: { marginLeft: 15, flex: 1 },
  patientName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  patientMrn: { color: '#00EAFF', fontSize: 12, marginTop: 3 },
  editBtn: { padding: 8 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 12 },
  detailItem: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: 12, borderRadius: 10 },
  detailLabel: { color: '#888', fontSize: 10, marginTop: 4 },
  detailValue: { color: '#FFF', fontSize: 13, fontWeight: '500', marginTop: 2 },
  generateBtn: { borderRadius: 12, overflow: 'hidden' },
  generateGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 10 },
  generateText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: width * 0.95, 
    maxHeight: height * 0.9,
    backgroundColor: 'transparent',
    borderRadius: 24,
  },
  modalScroll: { 
    alignItems: 'center',
    paddingVertical: 10,
  },
  tokenContainer: { 
    width: width * 0.9, 
    borderRadius: 24, 
    padding: 20, 
    alignItems: 'center', 
    elevation: 10,
    marginBottom: 10,
  },
  tokenHeader: { alignItems: 'center', marginBottom: 15 },
  tokenLogoCircle: { width: 45, height: 45, borderRadius: 27.5, backgroundColor: '#001D3D', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  tokenLogo: { width: 35, height: 35, borderRadius: 22.5 },
  tokenHospital: { color: '#096e8d', fontSize: 16, fontWeight: 'bold' },
  tokenSubtitle: { color: '#096e8d', fontSize: 12, marginTop: 2 },
  divider: { width: '100%', height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  tokenNumberContainer: { alignItems: 'center', marginBottom: 20 },
  tokenLabel: { color: '#999', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  tokenNumberDisplay: { color: '#001D3D', fontSize: 28, fontWeight: '900', marginTop: 5, letterSpacing: 3 },
  tokenInfo: { width: '100%', marginBottom: 20, gap: 8 },
  tokenInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  tokenInfoLabel: { color: '#666', fontSize: 13, fontWeight: '500' },
  tokenInfoValue: { color: '#001D3D', fontSize: 13, fontWeight: '700' },
  waitTimeContainer: { backgroundColor: '#FFE5E5', padding: 12, borderRadius: 12, alignItems: 'center', width: '100%', marginBottom: 15 },
  waitTimeLabel: { color: '#FF4D6D', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  waitTimeValue: { color: '#FF4D6D', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  qrContainer: { alignItems: 'center', marginBottom: 15 },
  qrText: { color: '#999', fontSize: 11, marginTop: 5 },
  tokenFooter: { color: '#999', fontSize: 10, textAlign: 'center', marginTop: 2 },
  tokenDate: { color: '#4d4b4b', fontSize: 9, marginTop: 5 },
  
  actionButtons: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 5,
    marginBottom: 10,
    width: width * 0.92,
  },
  actionBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  actionGradientConfirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  actionText: { color: '#00EAFF', fontSize: 13, fontWeight: '600' }
});

export default EntryPointScreen;