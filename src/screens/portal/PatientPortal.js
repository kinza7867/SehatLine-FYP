import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, SafeAreaView, Alert, KeyboardAvoidingView, 
  Platform, ScrollView, Dimensions, StatusBar, Image,
  Keyboard, TouchableWithoutFeedback, Modal, Share, ImageBackground
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const PatientPortalScreen = ({ navigation }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [formData, setFormData] = useState({
    name: '', cnic: '', phone: '', address: ''
  });
  const [errors, setErrors] = useState({});

  // Refs for input fields
  const nameRef = useRef(null);
  const cnicRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login'); 
    }
  };

  // Simple Validation Functions
  const validateName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 3) return 'Name must be at least 3 characters';
    return '';
  };

  const validateCNIC = (cnic) => {
    if (!cnic.trim()) return 'CNIC number is required';
    const cnicWithDash = /^\d{5}-\d{7}-\d{1}$/;
    const cnicWithoutDash = /^\d{13}$/;
    if (!cnicWithDash.test(cnic) && !cnicWithoutDash.test(cnic)) {
      return 'Enter valid CNIC (e.g., 42101-1234567-1)';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    const cleanPhone = phone.replace(/-/g, '');
    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return 'Enter valid number (e.g., 03001234567)';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 5) return 'Please enter your address';
    return '';
  };

  // Formatting functions
  const formatCNIC = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  };

  const formatPhoneNumber = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleFieldChange = (field, value, validator) => {
    let formattedValue = value;
    let error = '';
    
    if (field === 'cnic') formattedValue = formatCNIC(value);
    else if (field === 'phone') formattedValue = formatPhoneNumber(value);
    else formattedValue = value;
    
    error = validator(formattedValue);
    
    setFormData({ ...formData, [field]: formattedValue });
    setErrors({ ...errors, [field]: error });
  };

  const generateUniquePass = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const cnicLast4 = formData.cnic.replace(/\D/g, '').slice(-4);
    return {
      id: `SHL-${timestamp.toString().slice(-6)}-${random}`,
      qrData: `${formData.name}|${formData.cnic}|${timestamp}`,
      issueDate: new Date().toLocaleDateString(),
      token: btoa(`${formData.cnic}:${timestamp}`)
    };
  };

  // After generating pass, save user data
const saveUserDataToStorage = async () => {
  try {
    const userData = {
      name: formData.name,
      email: formData.email || '',
      phone: formData.phone,
      role: 'patient',
      joinDate: new Date().toLocaleDateString(),
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.log('Error:', error);
  }
};


  const handleRegister = () => {
    const nameError = validateName(formData.name);
    const cnicError = validateCNIC(formData.cnic);
    const phoneError = validatePhone(formData.phone);
    const addressError = validateAddress(formData.address);
    
    const newErrors = {
      name: nameError,
      cnic: cnicError,
      phone: phoneError,
      address: addressError
    };
    
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      const pass = generateUniquePass();
      setGeneratedPass(pass);
      setShowPassModal(true);
    } else {
      const firstError = Object.values(newErrors).find(error => error !== '');
      Alert.alert('Validation Error', firstError);
    }
  };

  const handleConfirmPass = () => {
    setShowPassModal(false);
    setIsRegistered(true);
    Alert.alert(
      '✅ Pass Generated Successfully!',
      'Your digital pass is ready. You can now access hospital services.',
      [{ text: 'Continue', onPress: () => {} }]
    );
  };

  const handleSharePass = async () => {
    try {
      await Share.share({
        message: `🏥 SEHATLINE DIGITAL PASS\n\nPatient: ${formData.name}\nCNIC: ${formData.cnic}\nPhone: ${formData.phone}\nPass ID: ${generatedPass.id}\nIssue Date: ${generatedPass.issueDate}\n\nPresent this pass at hospital entry.`,
        title: 'My SehatLine Digital Pass'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share pass');
    }
  };

  const handleViewDoctors = () => {
    navigation.navigate('DoctorDetailScreen', { 
      patientData: formData,
      passData: generatedPass 
    });
  };

  const handleGoHome = () => {
    navigation.navigate('MainApp', { 
      patientData: formData,
      passData: generatedPass 
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ImageBackground
          source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={28} color="#04e1f5" />
                </TouchableOpacity>
                
                <View style={styles.logoRow}>
                  <Image 
                    source={require('../../../assets/logo.png')} 
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.logoText}>SEHAT<Text style={{color:'#FFF'}}>LINE</Text></Text>
                </View>
                
                <View style={{ width: 28 }}>
                  <Ionicons name="shield-checkmark" size={24} color="#04e1f5" opacity={0.5} />
                </View>
              </View>

              <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
              >
                <ScrollView 
                  contentContainerStyle={styles.scrollPadding}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {!isRegistered ? (
                    <View>
                      <Text style={styles.welcomeText}>Get Hospital Pass</Text>
                      <Text style={styles.subText}>Quick entry pass for government hospitals</Text>

                      <View style={styles.formCard}>
                        {/* Full Name */}
                        <View style={styles.inputWrapper}>
                          <Text style={styles.label}>FULL NAME <Text style={styles.required}>*</Text></Text>
                          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                            <Ionicons name="person-outline" size={20} color="#04e1f5" />
                            <TextInput 
                              ref={nameRef}
                              style={styles.input}
                              placeholder="Enter your full name" 
                              placeholderTextColor="#999"
                              value={formData.name}
                              onChangeText={(v) => handleFieldChange('name', v, validateName)}
                              returnKeyType="next"
                              onSubmitEditing={() => cnicRef.current?.focus()}
                            />
                          </View>
                          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        {/* CNIC Number */}
                        <View style={styles.inputWrapper}>
                          <Text style={styles.label}>CNIC NUMBER <Text style={styles.required}>*</Text></Text>
                          <View style={[styles.inputContainer, errors.cnic && styles.inputError]}>
                            <Ionicons name="card-outline" size={20} color="#04e1f5" />
                            <TextInput 
                              ref={cnicRef}
                              style={styles.input}
                              placeholder="42101-1234567-1" 
                              placeholderTextColor="#999"
                              keyboardType="numeric"
                              value={formData.cnic}
                              onChangeText={(v) => handleFieldChange('cnic', v, validateCNIC)}
                              maxLength={15}
                              returnKeyType="next"
                              onSubmitEditing={() => phoneRef.current?.focus()}
                            />
                          </View>
                          {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputWrapper}>
                          <Text style={styles.label}>PHONE NUMBER <Text style={styles.required}>*</Text></Text>
                          <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                            <Ionicons name="call-outline" size={20} color="#04e1f5" />
                            <TextInput 
                              ref={phoneRef}
                              style={styles.input}
                              placeholder="0300-1234567" 
                              placeholderTextColor="#999"
                              keyboardType="phone-pad"
                              value={formData.phone}
                              onChangeText={(v) => handleFieldChange('phone', v, validatePhone)}
                              maxLength={15}
                              returnKeyType="next"
                              onSubmitEditing={() => addressRef.current?.focus()}
                            />
                          </View>
                          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                        </View>

                        {/* Address */}
                        <View style={styles.inputWrapper}>
                          <Text style={styles.label}>ADDRESS <Text style={styles.required}>*</Text></Text>
                          <View style={[styles.inputContainer, styles.textAreaContainer, errors.address && styles.inputError]}>
                            <Ionicons name="location-outline" size={20} color="#04e1f5" style={styles.locationIcon} />
                            <TextInput 
                              ref={addressRef}
                              style={[styles.input, styles.textArea]}
                              placeholder="House #, Street, Area" 
                              placeholderTextColor="#999"
                              multiline
                              numberOfLines={2}
                              value={formData.address}
                              onChangeText={(v) => handleFieldChange('address', v, validateAddress)}
                              returnKeyType="done"
                              onSubmitEditing={handleRegister}
                            />
                          </View>
                          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                        </View>

                        <TouchableOpacity style={styles.mainBtn} onPress={handleRegister}>
                          <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.btnGrad}>
                            <Text style={styles.btnText}>GENERATE PASS</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                          </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.infoNote}>
                          <Ionicons name="information-circle" size={20} color="#04e1f5" />
                          <Text style={styles.infoNoteText}>
                            This pass helps hospitals verify your identity quickly.
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.slipCenter}>
                      <View style={styles.successAlert}>
                        <Ionicons name="checkmark-circle" size={24} color="#04e1f5" />
                        <Text style={styles.successText}>PASS GENERATED SUCCESSFULLY</Text>
                      </View>

                      <View style={styles.idCardShadow}>
                        <LinearGradient colors={['#FFF', '#F0FDFF']} style={styles.idCard}>
                          <View style={styles.idHeader}>
                            <View style={styles.idLogoRow}>
                              <Image 
                                source={require('../../../assets/logo.png')} 
                                style={styles.smallLogo}
                                resizeMode="contain"
                              />
                              <Text style={styles.idLogoText}>SEHATLINE<Text style={{fontWeight:'400'}}> PASS</Text></Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                              <Ionicons name="shield-checkmark" size={16} color="#04e1f5" />
                              <Text style={styles.idTag}>VERIFIED</Text>
                            </View>
                          </View>

                          <View style={styles.idBody}>
                            <View style={styles.qrBox}>
                              <Ionicons name="qr-code" size={90} color="#04e1f5" />
                              <Text style={styles.scanText}>SCAN AT HOSPITAL</Text>
                            </View>
                            
                            <View style={styles.infoBox}>
                              <Text style={styles.infoLabel}>PATIENT NAME</Text>
                              <Text style={styles.infoValue}>{formData.name.toUpperCase()}</Text>
                              
                              <Text style={[styles.infoLabel, {marginTop: 8}]}>CNIC</Text>
                              <Text style={styles.infoValue}>{formData.cnic}</Text>

                              <Text style={[styles.infoLabel, {marginTop: 8}]}>PHONE</Text>
                              <Text style={styles.infoValue}>{formData.phone}</Text>
                            </View>
                          </View>

                          <View style={styles.idFooter}>
                            <View>
                              <Text style={styles.refLabel}>PASS ID</Text>
                              <Text style={styles.refNum}>{generatedPass?.id}</Text>
                            </View>
                            <View>
                              <Text style={styles.refLabel}>ISSUED ON</Text>
                              <Text style={styles.dateText}>{generatedPass?.issueDate}</Text>
                            </View>
                          </View>

                          <TouchableOpacity style={styles.shareButton} onPress={handleSharePass}>
                            <Ionicons name="share-outline" size={20} color="#04e1f5" />
                            <Text style={styles.shareText}>Share Pass</Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>

                      <Text style={styles.nextTitle}>What would you like to do?</Text>
                      
                      <TouchableOpacity style={styles.actionCard} onPress={handleViewDoctors}>
                        <LinearGradient colors={['rgba(4,225,245,0.15)', 'rgba(4,225,245,0.05)']} style={styles.actionGradient}>
                          <View style={styles.actionIcon}>
                            <Ionicons name="medical" size={28} color="#04e1f5" />
                          </View>
                          <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Find a Doctor</Text>
                            <Text style={styles.actionSub}>Book appointment with specialist</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={24} color="#04e1f5" />
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.actionCard} onPress={handleGoHome}>
                        <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} style={styles.actionGradient}>
                          <View style={[styles.actionIcon, {backgroundColor: 'rgba(255,255,255,0.1)'}]}>
                            <Ionicons name="home" size={28} color="#FFF" />
                          </View>
                          <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Return to Home</Text>
                            <Text style={styles.actionSub}>Explore other services</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={24} color="#FFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </KeyboardAvoidingView>

              {/* Pass Confirmation Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={showPassModal}
                onRequestClose={() => setShowPassModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalIcon}>
                      <Ionicons name="checkmark-circle" size={60} color="#04e1f5" />
                    </View>
                    <Text style={styles.modalTitle}>Pass Generated!</Text>
                    <Text style={styles.modalText}>
                      Your digital pass is ready. Show this at hospital entry for quick verification.
                    </Text>
                    
                    <View style={styles.passPreview}>
                      <Text style={styles.passLabel}>PASS ID</Text>
                      <Text style={styles.passValue}>{generatedPass?.id}</Text>
                      <Text style={styles.passLabel}>ISSUED ON</Text>
                      <Text style={styles.passValue}>{generatedPass?.issueDate}</Text>
                    </View>

                    <TouchableOpacity style={styles.modalButton} onPress={handleConfirmPass}>
                      <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.modalButtonGradient}>
                        <Text style={styles.modalButtonText}>CONTINUE</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </SafeAreaView>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  backBtn: { 
    padding: 5, 
    zIndex: 10 
  },
  logoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  logoImage: { 
    width: 35, 
    height: 35, 
    borderRadius: 35 
  },
  logoText: { 
    color: '#04e1f5', 
    fontWeight: '900', 
    fontSize: 22, 
    letterSpacing: 1 
  },
  scrollPadding: { 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    flexGrow: 1 
  },

  welcomeText: { 
    color: '#FFF', 
    fontSize: 28, 
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subText: { 
    color: '#B2DFDB', 
    fontSize: 13, 
    marginBottom: 20, 
    marginTop: 5 
  },

  formCard: { 
    backgroundColor: 'rgba(2, 4, 77, 0.75)', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(4, 225, 245, 0.3)' 
  },
  inputWrapper: { 
    marginBottom: 15 
  },
  label: { 
    color: '#f6f8f8', 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 6, 
    letterSpacing: 1 
  },
  required: { 
    color: '#FF4D4D', 
    fontSize: 12 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.17)',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  input: { 
    flex: 1,
    color: '#FFF', 
    fontSize: 14, 
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginLeft: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: { 
    height: 70, 
    textAlignVertical: 'top',
  },
  locationIcon: {
    marginTop: 4,
  },
  inputError: { 
    borderColor: '#FF4D4D', 
    borderWidth: 2 
  },
  errorText: { 
    color: '#FF4D4D', 
    fontSize: 11, 
    marginTop: 4, 
    marginLeft: 8 
  },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  infoNoteText: {
    color: '#04e1f5',
    fontSize: 11,
    flex: 1,
  },

  mainBtn: { 
    borderRadius: 15, 
    overflow: 'hidden', 
    marginTop: 10 
  },
  btnGrad: { 
    height: 55, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  btnText: { 
    color: '#FFF', 
    fontWeight: '900', 
    fontSize: 14 
  },

  slipCenter: { 
    alignItems: 'center', 
    flex: 1 
  },
  successAlert: { 
    backgroundColor: 'rgba(4,225,245,0.1)', 
    width: '100%', 
    padding: 12, 
    borderRadius: 10, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 10, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#04e1f5'
  },
  successText: { 
    color: '#04e1f5', 
    fontWeight: '900', 
    fontSize: 12 
  },
  
  idCardShadow: { 
    elevation: 20, 
    shadowColor: '#04e1f5', 
    shadowOpacity: 0.4, 
    shadowRadius: 15, 
    marginBottom: 20 
  },
  idCard: { 
    width: width - 40, 
    borderRadius: 20, 
    padding: 20 
  },
  idHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  idLogoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5 
  },
  smallLogo: { 
    width: 30, 
    height: 30 
  },
  idLogoText: { 
    color: '#0284c7', 
    fontWeight: '900', 
    fontSize: 16 
  },
  verifiedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 5 
  },
  idTag: { 
    color: '#04e1f5', 
    fontWeight: 'bold', 
    fontSize: 10 
  },
  
  idBody: { 
    flexDirection: 'row', 
    marginTop: 25, 
    gap: 20 
  },
  qrBox: { 
    alignItems: 'center' 
  },
  scanText: { 
    color: '#0284c7', 
    fontSize: 8, 
    fontWeight: 'bold', 
    marginTop: 5 
  },
  infoBox: { 
    flex: 1 
  },
  infoLabel: { 
    color: '#777', 
    fontSize: 9, 
    fontWeight: 'bold' 
  },
  infoValue: { 
    color: '#000', 
    fontSize: 14, 
    fontWeight: '900' 
  },
  
  idFooter: { 
    marginTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#DDD', 
    paddingTop: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  refLabel: { 
    color: '#999', 
    fontSize: 9 
  },
  refNum: { 
    color: '#0284c7', 
    fontSize: 11, 
    fontWeight: 'bold', 
    marginTop: 2 
  },
  dateText: { 
    color: '#0284c7', 
    fontSize: 11, 
    fontWeight: 'bold', 
    marginTop: 2 
  },
  
  shareButton: { 
    marginTop: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    paddingVertical: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#DDD' 
  },
  shareText: { 
    color: '#04c5f5', 
    fontSize: 12, 
    fontWeight: '500' 
  },

  nextTitle: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    alignSelf: 'flex-start' 
  },
  actionCard: { 
    width: '100%', 
    marginBottom: 12, 
    borderRadius: 15, 
    overflow: 'hidden' 
  },
  actionGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    gap: 15 
  },
  actionIcon: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    backgroundColor: 'rgba(4, 225, 245, 0.39)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionTextContainer: { 
    flex: 1 
  },
  actionTitle: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  actionSub: { 
    color: '#d2e7e6', 
    fontSize: 12 
  },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(10, 10, 10, 0.9)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    backgroundColor: '#0A1520', 
    borderRadius: 20, 
    padding: 25, 
    width: width - 40, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#04e1f5' 
  },
  modalIcon: { 
    marginBottom: 15 
  },
  modalTitle: { 
    color: '#04e1f5', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  modalText: { 
    color: '#FFF', 
    textAlign: 'center', 
    marginBottom: 20, 
    fontSize: 14 
  },
  passPreview: { 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 12, 
    padding: 15, 
    width: '100%', 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  passLabel: { 
    color: '#B2DFDB', 
    fontSize: 11, 
    marginTop: 8 
  },
  passValue: { 
    color: '#04e1f5', 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginTop: 2 
  },
  modalButton: { 
    width: '100%', 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  modalButtonGradient: { 
    padding: 15, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 14 
  }
});

export default PatientPortalScreen;