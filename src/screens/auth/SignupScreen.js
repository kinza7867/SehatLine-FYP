import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, Dimensions, Modal,
  SafeAreaView, ActivityIndicator, Image, ImageBackground,
  StatusBar, Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

// Custom Toast Notification Component (using React Native Animated)
const ToastNotification = ({ visible, message, type, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  const getToastStyles = () => {
    switch(type) {
      case 'success':
        return {
          backgroundColor: 'rgba(0, 255, 136, 0.95)',
          icon: 'checkmark-circle',
          textColor: '#004D26',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(255, 77, 77, 0.95)',
          icon: 'close-circle',
          textColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: 'rgba(4, 225, 245, 0.95)',
          icon: 'information-circle',
          textColor: '#003344',
        };
    }
  };
  
  const toastStyle = getToastStyles();
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.toastContainer, { backgroundColor: toastStyle.backgroundColor, opacity: fadeAnim }]}>
      <View style={styles.toastContent}>
        <Ionicons name={toastStyle.icon} size={22} color={toastStyle.textColor} />
        <Text style={[styles.toastMessage, { color: toastStyle.textColor }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const SignupScreen = ({ navigation }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  // DOB States
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dobText, setDobText] = useState('Select Date of Birth');

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (event?.type === "set" && selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('en-GB');
      setDobText(formattedDate);
    } else if (event?.type === "dismissed") {
      setShowPicker(false);
    } else if (selectedDate && !event?.type) {
      // For older versions
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('en-GB');
      setDobText(formattedDate);
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      showToast("Please enter your full name", "error");
      return false;
    }
    if (cnic.length !== 13) {
      showToast("CNIC must be 13 digits", "error");
      return false;
    }
    if (!phone || phone.length < 10) {
      showToast("Please enter a valid mobile number", "error");
      return false;
    }
    if (dobText === 'Select Date of Birth') {
      showToast("Please select your date of birth", "error");
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }
    return true;
  };

  const handleVerify = () => {
    Keyboard.dismiss();
    if (validateForm()) {
      setShowOptions(true);
    }
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
          
          {/* Toast Notification */}
          <ToastNotification 
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onHide={() => setToast({ ...toast, visible: false })}
          />

          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="#04e1f5" />
                </TouchableOpacity>

                {/* Logo Section */}
                <View style={styles.logoSection}>
                  <View style={styles.logoCircle}>
                    <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
                  </View>
                  <Text style={styles.appName}>
                    SEHAT<Text style={styles.appNameWhite}>LINE</Text>
                  </Text>
                  <Text style={styles.tagline}>Create Your Account</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>PERSONAL INFORMATION</Text>

                  {/* Full Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color="#04e1f5" />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Enter your full name" 
                        placeholderTextColor="#a5a3a3" 
                        value={name}
                        onChangeText={setName}
                      />
                    </View>
                  </View>

                  {/* CNIC */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CNIC Number</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="card-outline" size={20} color="#04e1f5" />
                      <TextInput 
                        style={styles.input} 
                        placeholder="4210112345678" 
                        placeholderTextColor="#a5a3a3" 
                        keyboardType="number-pad"
                        maxLength={13}
                        value={cnic}
                        onChangeText={setCnic}
                      />
                    </View>
                    <Text style={styles.hintText}>13 digits without spaces</Text>
                  </View>

                  {/* Date of Birth */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Date of Birth</Text>
                    <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowPicker(true)}>
                      <Ionicons name="calendar-outline" size={20} color="#04e1f5" />
                      <Text style={[styles.input, { color: dobText === 'Select Date of Birth' ? '#a5a3a3' : '#FFF' }]}>
                        {dobText}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Mobile Number */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="call-outline" size={20} color="#04e1f5" />
                      <TextInput 
                        style={styles.input} 
                        placeholder="03XXXXXXXXX" 
                        placeholderTextColor="#a5a3a3" 
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                      />
                    </View>
                  </View>

                  {/* Email (Optional) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address <Text style={styles.optionalText}>(Optional)</Text></Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color="#04e1f5" />
                      <TextInput 
                        style={styles.input} 
                        placeholder="you@example.com" 
                        placeholderTextColor="#a5a3a3" 
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>
                  </View>

                  {/* Address (Optional) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address <Text style={styles.optionalText}>(Optional)</Text></Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="location-outline" size={20} color="#04e1f5" />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Your residential address" 
                        placeholderTextColor="#a5a3a3" 
                        value={address}
                        onChangeText={setAddress}
                      />
                    </View>
                  </View>

                  {/* Continue Button */}
                  <TouchableOpacity style={styles.continueButton} onPress={handleVerify}>
                    <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.continueGradient}>
                      <Text style={styles.continueText}>VERIFY & CONTINUE</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Login Link */}
                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>

          {/* Date Picker Modal for iOS */}
          {Platform.OS === 'ios' && showPicker && (
            <Modal transparent animationType="fade">
              <View style={styles.pickerOverlay}>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    themeVariant="dark"
                  />
                  <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.pickerDoneBtn}>
                    <Text style={styles.pickerDoneText}>Confirm Date</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
          
          {/* Android Date Picker */}
          {Platform.OS === 'android' && showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Role Selection Modal */}
          <Modal visible={showOptions} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose Your Access Type</Text>
                  <TouchableOpacity onPress={() => setShowOptions(false)}>
                    <Ionicons name="close" size={24} color="#888" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={[styles.accessCard, { borderColor: '#04e1f5' }]} 
                  onPress={() => { setShowOptions(false); navigation.navigate('PatientPortal'); }}
                >
                  <LinearGradient colors={['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)']} style={styles.accessGradient}>
                    <View style={[styles.accessIcon, { backgroundColor: '#04e1f5' }]}>
                      <Ionicons name="medical" size={28} color="#FFF" />
                    </View>
                    <View style={styles.accessInfo}>
                      <Text style={[styles.accessTitle, { color: '#04e1f5' }]}>PATIENT PORTAL</Text>
                      <Text style={styles.accessDesc}>Book appointments, view records & ID card</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#04e1f5" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.accessCard, { borderColor: '#FFB800' }]} 
                  onPress={() => { setShowOptions(false); navigation.navigate('VisitorHome'); }}
                >
                  <LinearGradient colors={['rgba(255, 184, 0, 0.15)', 'rgba(255, 184, 0, 0.05)']} style={styles.accessGradient}>
                    <View style={[styles.accessIcon, { backgroundColor: '#FFB800' }]}>
                      <Ionicons name="eye" size={28} color="#000" />
                    </View>
                    <View style={styles.accessInfo}>
                      <Text style={[styles.accessTitle, { color: '#FFB800' }]}>GENERAL VISITOR</Text>
                      <Text style={styles.accessDesc}>Browse hospitals, news & blood bank</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#FFB800" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.accessCard, { borderColor: '#FF4D6D' }]} 
                  onPress={() => { setShowOptions(false); navigation.navigate('ChronicPortal'); }}
                >
                  <LinearGradient colors={['rgba(255, 77, 109, 0.15)', 'rgba(255, 77, 109, 0.05)']} style={styles.accessGradient}>
                    <View style={[styles.accessIcon, { backgroundColor: '#FF4D6D' }]}>
                      <Ionicons name="pulse-outline" size={28} color="#FFF" />
                    </View>
                    <View style={styles.accessInfo}>
                      <Text style={[styles.accessTitle, { color: '#FF4D6D' }]}>CHRONIC PATIENT</Text>
                      <Text style={styles.accessDesc}>Diabetes, Asthma, Heart Disease care</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#FF4D6D" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowOptions(false)} style={styles.editLink}>
                  <Text style={styles.editLinkText}>← Edit My Information</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Back Button
  backButton: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 25,
    width: 60,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#04e1f5',
    shadowColor: '#04e1f5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#04e1f5',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: 12,
  },
  appNameWhite: {
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 13,
    color: '#CCE3E5',
    letterSpacing: 1,
    marginTop: 4,
  },

  // Form Card
  formCard: {
    backgroundColor: 'rgba(2, 4, 77, 0.75)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.37)',
  },
  formTitle: {
    color: '#04e1f5',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#CCE3E5',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  optionalText: {
    color: '#666',
    fontSize: 10,
    fontWeight: 'normal',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 242, 242, 0.19)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.2)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 14,
  },
  hintText: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
    marginLeft: 8,
  },

  // Continue Button
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 16,
  },
  continueGradient: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#888',
    fontSize: 13,
  },
  loginLink: {
    color: '#04e1f5',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Date Picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#0A1520',
    width: width * 0.9,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#04e1f5',
  },
  pickerDoneBtn: {
    backgroundColor: '#04e1f5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  pickerDoneText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#0A1520',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accessCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accessGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 15,
  },
  accessIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessInfo: {
    flex: 1,
  },
  accessTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  accessDesc: {
    color: '#888',
    fontSize: 11,
  },
  editLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  editLinkText: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;