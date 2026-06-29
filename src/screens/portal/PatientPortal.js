import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, SafeAreaView, Alert, KeyboardAvoidingView, 
  Platform, ScrollView, Dimensions, StatusBar, Image,
  Keyboard, TouchableWithoutFeedback, Modal, Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme';

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
    if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
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
    if (address.trim().length < 5) return 'Please enter at least 5 characters';
    if (address.trim().length > 100) return 'Address cannot exceed 100 characters';
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
    
    if (field === 'cnic') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 13) {
        formattedValue = formatCNIC(value);
      } else {
        return;
      }
    } else if (field === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 11) {
        formattedValue = formatPhoneNumber(value);
      } else {
        return;
      }
    } else if (field === 'name') {
      if (value.length <= 50) {
        formattedValue = value;
      } else {
        return;
      }
    } else if (field === 'address') {
      if (value.length <= 100) {
        formattedValue = value;
      } else {
        return;
      }
    } else {
      formattedValue = value;
    }
    
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
    saveUserDataToStorage();
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
    navigation.navigate('DoctorListScreen', { 
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
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={[COLORS.primary, COLORS.background, COLORS.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
          style={styles.gradientBackground}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
              </TouchableOpacity>
              
              <View style={styles.logoRow}>
                <Image 
                  source={require('../../../assets/logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>SEHAT<Text style={{color:COLORS.text}}>LINE</Text></Text>
              </View>
              
              <View style={{ width: 28 }}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.navyDark} opacity={0.9} />
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

                    <View style={[styles.formCard, { borderColor: COLORS.primary + '30' }]}>
                      {/* Full Name */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.label}>FULL NAME <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                          <Ionicons name="person-outline" size={20} color={errors.name ? COLORS.danger : COLORS.primary} />
                          <TextInput 
                            ref={nameRef}
                            style={styles.input}
                            placeholder="Enter your full name" 
                            placeholderTextColor={COLORS.textLight}
                            value={formData.name}
                            onChangeText={(v) => handleFieldChange('name', v, validateName)}
                            returnKeyType="next"
                            onSubmitEditing={() => cnicRef.current?.focus()}
                            maxLength={50}
                          />
                          {formData.name.length > 0 && !errors.name && (
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                          )}
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                      </View>

                      {/* CNIC Number */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.label}>CNIC NUMBER <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.cnic && styles.inputError]}>
                          <Ionicons name="card-outline" size={20} color={errors.cnic ? COLORS.danger : COLORS.primary} />
                          <TextInput 
                            ref={cnicRef}
                            style={styles.input}
                            placeholder="42101-1234567-1" 
                            placeholderTextColor={COLORS.textLight}
                            keyboardType="numeric"
                            value={formData.cnic}
                            onChangeText={(v) => handleFieldChange('cnic', v, validateCNIC)}
                            maxLength={15}
                            returnKeyType="next"
                            onSubmitEditing={() => phoneRef.current?.focus()}
                          />
                          {formData.cnic.length === 15 && !errors.cnic && (
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                          )}
                        </View>
                        {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
                      </View>

                      {/* Phone Number */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.label}>PHONE NUMBER <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                          <Ionicons name="call-outline" size={20} color={errors.phone ? COLORS.danger : COLORS.primary} />
                          <TextInput 
                            ref={phoneRef}
                            style={styles.input}
                            placeholder="0300-1234567" 
                            placeholderTextColor={COLORS.textLight}
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(v) => handleFieldChange('phone', v, validatePhone)}
                            maxLength={15}
                            returnKeyType="next"
                            onSubmitEditing={() => addressRef.current?.focus()}
                          />
                          {formData.phone.length >= 12 && !errors.phone && (
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                          )}
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                      </View>

                      {/* Address */}
                      <View style={styles.inputWrapper}>
                        <Text style={styles.label}>ADDRESS <Text style={styles.required}>*</Text></Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer, errors.address && styles.inputError]}>
                          <Ionicons name="location-outline" size={20} color={errors.address ? COLORS.danger : COLORS.primary} style={styles.locationIcon} />
                          <TextInput 
                            ref={addressRef}
                            style={[styles.input, styles.textArea]}
                            placeholder="House #, Street, Area" 
                            placeholderTextColor={COLORS.textLight}
                            multiline
                            numberOfLines={2}
                            value={formData.address}
                            onChangeText={(v) => handleFieldChange('address', v, validateAddress)}
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                            maxLength={100}
                          />
                        </View>
                        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                        <Text style={[styles.charCount, { color: COLORS.textLight }]}>
                          {formData.address.length}/100
                        </Text>
                      </View>

                      <TouchableOpacity style={styles.mainBtn} onPress={handleRegister}>
                        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.btnGrad}>
                          <Text style={styles.btnText}>GENERATE PASS</Text>
                          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={[styles.infoNote, { backgroundColor: COLORS.primary + '10' }]}>
                        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                        <Text style={[styles.infoNoteText, { color: COLORS.primary }]}>
                          This pass helps hospitals verify your identity quickly.
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.slipCenter}>
                    <View style={[styles.successAlert, { borderColor: COLORS.primary }]}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                      <Text style={[styles.successText, { color: COLORS.primary }]}>PASS GENERATED SUCCESSFULLY</Text>
                    </View>

                    {/* Beautiful ID Card with Light Outline */}
                    <View style={styles.idCardWrapper}>
                      <LinearGradient
                        colors={[COLORS.primary + '15', COLORS.secondary + '10', COLORS.background]}
                        style={styles.idCardBackground}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={[styles.idCard, styles.idCardShadow]}>
                          {/* Card Header with Gradient Border */}
                          <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            style={styles.cardHeaderGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            <View style={styles.idHeader}>
                              <View style={styles.idLogoRow}>
                                <Image 
                                  source={require('../../../assets/logo.png')} 
                                  style={styles.smallLogo}
                                  resizeMode="contain"
                                />
                                <Text style={styles.idLogoText}>SEHATLINE</Text>
                              </View>
                              <View style={styles.verifiedBadge}>
                                <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
                                <Text style={styles.idTag}>VERIFIED</Text>
                              </View>
                            </View>
                          </LinearGradient>

                          {/* Card Body */}
                          <View style={styles.idBody}>
                            <View style={styles.qrBox}>
                              <View style={styles.qrCodeContainer}>
                                <Ionicons name="qr-code" size={80} color={COLORS.primary} />
                              </View>
                              <Text style={styles.scanText}>SCAN TO VERIFY</Text>
                            </View>
                            
                            <View style={styles.infoBox}>
                              <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>PATIENT NAME</Text>
                                <Text style={styles.infoValue}>{formData.name.toUpperCase()}</Text>
                              </View>
                              
                              <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>CNIC</Text>
                                <Text style={styles.infoValue}>{formData.cnic}</Text>
                              </View>

                              <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>PHONE</Text>
                                <Text style={styles.infoValue}>{formData.phone}</Text>
                              </View>
                            </View>
                          </View>

                          {/* Card Footer */}
                          <View style={styles.idFooter}>
                            <View style={styles.footerItem}>
                              <Text style={styles.refLabel}>PASS ID</Text>
                              <Text style={styles.refNum}>{generatedPass?.id}</Text>
                            </View>
                            <View style={styles.footerDivider} />
                            <View style={styles.footerItem}>
                              <Text style={styles.refLabel}>ISSUED ON</Text>
                              <Text style={styles.dateText}>{generatedPass?.issueDate}</Text>
                            </View>
                          </View>

                          {/* Share Button */}
                          <TouchableOpacity style={styles.shareButton} onPress={handleSharePass}>
                            <LinearGradient
                              colors={[COLORS.primary + '10', COLORS.primary + '05']}
                              style={styles.shareGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            >
                              <Ionicons name="share-outline" size={18} color={COLORS.primary} />
                              <Text style={styles.shareText}>Share Pass</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>

                    <Text style={styles.nextTitle}>What would you like to do?</Text>
                    
                    <TouchableOpacity style={styles.actionCard} onPress={handleViewDoctors}>
                      <LinearGradient colors={[COLORS.primary + '15', COLORS.primary + '05']} style={styles.actionGradient}>
                        <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '39' }]}>
                          <Ionicons name="medical" size={28} color={COLORS.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                          <Text style={styles.actionTitle}>Find a Doctor</Text>
                          <Text style={styles.actionSub}>Book appointment with specialist</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={handleGoHome}>
                      <LinearGradient colors={[COLORS.secondary + '15', COLORS.secondary + '05']} style={styles.actionGradient}>
                        <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + '39' }]}>
                          <Ionicons name="home" size={28} color={COLORS.secondary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                          <Text style={styles.actionTitle}>Return to Home</Text>
                          <Text style={styles.actionSub}>Explore other services</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.secondary} />
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
                <View style={[styles.modalContainer, { borderColor: COLORS.primary }]}>
                  <View style={styles.modalIcon}>
                    <Ionicons name="checkmark-circle" size={60} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.modalTitle, { color: COLORS.primary }]}>Pass Generated!</Text>
                  <Text style={styles.modalText}>
                    Your digital pass is ready. Show this at hospital entry for quick verification.
                  </Text>
                  
                  <View style={[styles.passPreview, { backgroundColor: COLORS.backgroundSecondary }]}>
                    <Text style={[styles.passLabel, { color: COLORS.textSecondary }]}>PASS ID</Text>
                    <Text style={[styles.passValue, { color: COLORS.primary }]}>{generatedPass?.id}</Text>
                    <Text style={[styles.passLabel, { color: COLORS.textSecondary }]}>ISSUED ON</Text>
                    <Text style={[styles.passValue, { color: COLORS.primary }]}>{generatedPass?.issueDate}</Text>
                  </View>

                  <TouchableOpacity style={styles.modalButton} onPress={handleConfirmPass}>
                    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalButtonGradient}>
                      <Text style={styles.modalButtonText}>CONTINUE</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.xl, 
    paddingVertical: SIZES.md,
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
    width: 40, 
    height: 40, 
    borderRadius: 40, 
  },
  logoText: { 
    color: COLORS.primary, 
    fontWeight: '900', 
    fontSize: 22, 
    letterSpacing: 1 
  },
  scrollPadding: { 
    paddingHorizontal: SIZES.xl, 
    paddingBottom: 40, 
    flexGrow: 1 
  },

  welcomeText: { 
    color: COLORS.text, 
    fontSize: 28, 
    fontWeight: 'bold',
  },
  subText: { 
    color: COLORS.textSecondary, 
    fontSize: 13, 
    marginBottom: 20, 
    marginTop: 5 
  },

  formCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: SIZES.xl, 
    borderWidth: 1, 
    ...SHADOWS.medium,
  },
  inputWrapper: { 
    marginBottom: 15 
  },
  label: { 
    color: COLORS.text, 
    fontSize: SIZES.small, 
    fontWeight: 'bold', 
    marginBottom: 6, 
    letterSpacing: 1 
  },
  required: { 
    color: COLORS.danger, 
    fontSize: SIZES.small 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: { 
    flex: 1,
    color: COLORS.text, 
    fontSize: SIZES.body, 
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
    borderColor: COLORS.danger, 
    borderWidth: 2 
  },
  errorText: { 
    color: COLORS.danger, 
    fontSize: SIZES.small, 
    marginTop: 4, 
    marginLeft: 8 
  },
  charCount: {
    fontSize: SIZES.xSmall,
    textAlign: 'right',
    marginTop: 2,
  },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  infoNoteText: {
    fontSize: SIZES.small,
    flex: 1,
  },

  mainBtn: { 
    borderRadius: 15, 
    overflow: 'hidden', 
    marginTop: 10,
    ...SHADOWS.button,
  },
  btnGrad: { 
    height: 55, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  btnText: { 
    color: COLORS.white, 
    fontWeight: '900', 
    fontSize: SIZES.h5 
  },

  slipCenter: { 
    alignItems: 'center', 
    flex: 1 
  },
  successAlert: { 
    backgroundColor: COLORS.primary + '10', 
    width: '100%', 
    padding: 12, 
    borderRadius: 10, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 10, 
    marginBottom: 20,
    borderWidth: 1,
  },
  successText: { 
    fontWeight: '900', 
    fontSize: SIZES.small 
  },

  // Beautiful ID Card Styles
  idCardWrapper: {
    width: width - 40,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  idCardBackground: {
    padding: 3,
    borderRadius: 24,
  },
  idCard: {
    backgroundColor: COLORS.white,
    borderRadius: 21,
    overflow: 'hidden',
  },
  idCardShadow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeaderGradient: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  idHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  idLogoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  smallLogo: { 
    width: 28, 
    height: 28,
    borderRadius: 28,
  },
  idLogoText: { 
    color: COLORS.white, 
    fontWeight: '900', 
    fontSize: 16,
    letterSpacing: 0.5,
  },
  verifiedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
  },
  idTag: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: SIZES.xSmall 
  },
  
  idBody: { 
    flexDirection: 'row', 
    padding: 20,
    gap: 16,
    backgroundColor: COLORS.white,
  },
  qrBox: { 
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeContainer: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.primary + '08',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  scanText: { 
    color: COLORS.textSecondary, 
    fontSize: 8, 
    fontWeight: 'bold', 
    marginTop: 6,
    letterSpacing: 0.5,
  },
  infoBox: { 
    flex: 1,
    justifyContent: 'center',
  },
  infoRow: {
    marginBottom: 6,
  },
  infoLabel: { 
    color: COLORS.textSecondary, 
    fontSize: 8, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: { 
    color: COLORS.text, 
    fontSize: 13, 
    fontWeight: '700',
  },
  
  idFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  refLabel: { 
    color: COLORS.textLight, 
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  refNum: { 
    color: COLORS.primary, 
    fontSize: 11, 
    fontWeight: 'bold', 
    marginTop: 2,
  },
  dateText: { 
    color: COLORS.primary, 
    fontSize: 11, 
    fontWeight: 'bold', 
    marginTop: 2,
  },
  
  shareButton: { 
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  shareText: { 
    color: COLORS.primary, 
    fontSize: SIZES.small, 
    fontWeight: '600',
  },

  nextTitle: { 
    color: COLORS.text, 
    fontSize: SIZES.h4, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    alignSelf: 'flex-start' 
  },
  actionCard: { 
    width: '100%', 
    marginBottom: 12, 
    borderRadius: 15, 
    overflow: 'hidden',
    ...SHADOWS.small,
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
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionTextContainer: { 
    flex: 1 
  },
  actionTitle: { 
    color: COLORS.text, 
    fontSize: SIZES.h5, 
    fontWeight: 'bold' 
  },
  actionSub: { 
    color: COLORS.textSecondary, 
    fontSize: SIZES.small 
  },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: 25, 
    width: width - 40, 
    alignItems: 'center', 
    borderWidth: 1,
    ...SHADOWS.large,
  },
  modalIcon: { 
    marginBottom: 15 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  modalText: { 
    color: COLORS.textSecondary, 
    textAlign: 'center', 
    marginBottom: 20, 
    fontSize: SIZES.body 
  },
  passPreview: { 
    borderRadius: 12, 
    padding: 15, 
    width: '100%', 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  passLabel: { 
    fontSize: SIZES.small, 
    marginTop: 8 
  },
  passValue: { 
    fontSize: SIZES.body, 
    fontWeight: 'bold', 
    marginTop: 2 
  },
  modalButton: { 
    width: '100%', 
    borderRadius: 12, 
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  modalButtonGradient: { 
    padding: 15, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: SIZES.h5 
  }
});

export default PatientPortalScreen;