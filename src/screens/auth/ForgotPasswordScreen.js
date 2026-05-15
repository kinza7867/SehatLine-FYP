import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  Image,
  ImageBackground,
  StatusBar,
  Animated,
  Dimensions,
  Clipboard
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Custom Toast Notification Component
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

// Custom Notification Component for OTP
const OTPNotification = ({ visible, otp, onClose, onCopy }) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onClose());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.otpNotification, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.otpNotificationContent}>
        <View style={styles.otpNotificationIcon}>
          <Ionicons name="key-outline" size={24} color="#04e1f5" />
        </View>
        <View style={styles.otpNotificationTextContainer}>
          <Text style={styles.otpNotificationTitle}>Verification Code Sent!</Text>
          <Text style={styles.otpNotificationMessage}>
            Your OTP code is: <Text style={styles.otpCode}>{otp}</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={() => onCopy(otp)} style={styles.copyButton}>
          <Ionicons name="copy-outline" size={20} color="#04e1f5" />
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// OTP Input Component
const OTPInput = ({ code, setCode, onResendOTP, isResending, countdown }) => {
  const inputs = Array(6).fill(0);
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    if (text.length <= 1) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      if (text.length === 1 && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      <Text style={styles.otpTitle}>Enter Verification Code</Text>
      <Text style={styles.otpSubtitle}>
        Please check your registered contact for the 6-digit code
      </Text>
      
      <View style={styles.otpInputsContainer}>
        {inputs.map((_, index) => (
          <TextInput
            key={index}
            ref={ref => inputRefs.current[index] = ref}
            style={styles.otpInput}
            value={code[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive code? </Text>
        {countdown > 0 ? (
          <Text style={styles.timerText}>Resend in {countdown}s</Text>
        ) : (
          <TouchableOpacity onPress={onResendOTP} disabled={isResending}>
            <Text style={styles.resendButton}>
              {isResending ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cnic, setCnic] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [currentOTP, setCurrentOTP] = useState('');
  const [showOTPNotification, setShowOTPNotification] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const isPasswordStrong = (password) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
  };

  const handleCopyOTP = (otp) => {
    Clipboard.setString(otp);
    showToast("OTP copied to clipboard!", "success");
  };

  const handleSendOTP = () => {
    Keyboard.dismiss();
    
    if (!selectedOption) {
      showToast("Please select an option (Email, Phone, or CNIC)", "error");
      return;
    }

    let isValid = false;
    let identifier = '';

    if (selectedOption === 'email') {
      if (!email) {
        showToast("Please enter your email address", "error");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address", "error");
        return;
      }
      isValid = true;
      identifier = email;
    } else if (selectedOption === 'phone') {
      if (!phoneNumber) {
        showToast("Please enter your phone number", "error");
        return;
      }
      const phoneRegex = /^\d{10,11}$/;
      if (!phoneRegex.test(phoneNumber)) {
        showToast("Please enter a valid 10-11 digit phone number", "error");
        return;
      }
      isValid = true;
      identifier = phoneNumber;
    } else if (selectedOption === 'cnic') {
      if (!cnic) {
        showToast("Please enter your CNIC number", "error");
        return;
      }
      const cnicRegex = /^\d{13}$/;
      if (!cnicRegex.test(cnic)) {
        showToast("Please enter a valid 13-digit CNIC number", "error");
        return;
      }
      isValid = true;
      identifier = cnic;
    }

    if (!isValid) return;

    setLoading(true);
    
    const newOTP = generateOTP();
    setCurrentOTP(newOTP);
    
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setResendCountdown(30);
      startResendTimer();
      
      // Show OTP notification
      setShowOTPNotification(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowOTPNotification(false);
      }, 5000);
    }, 1500);
  };

  const startResendTimer = () => {
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = () => {
    setIsResendingOTP(true);
    
    const newOTP = generateOTP();
    setCurrentOTP(newOTP);
    
    setTimeout(() => {
      setIsResendingOTP(false);
      setResendCountdown(30);
      startResendTimer();
      
      // Show new OTP notification
      setShowOTPNotification(true);
      setTimeout(() => {
        setShowOTPNotification(false);
      }, 5000);
      
      showToast("New verification code sent successfully", "success");
    }, 1000);
  };

  const handleVerifyOTP = () => {
    const otpString = otpCode.join('');
    
    if (otpString.length !== 6) {
      showToast("Please enter the complete 6-digit code", "error");
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      if (otpString === currentOTP) {
        showToast("OTP verified successfully!", "success");
        setStep(3);
      } else {
        showToast("Invalid verification code. Please try again.", "error");
        setOtpCode(['', '', '', '', '', '']);
      }
    }, 1500);
  };

  const handleResetPassword = () => {
    Keyboard.dismiss();
    
    let hasError = false;
    
    if (!newPassword || !confirmPassword) {
      showToast("Please fill in all fields", "error");
      hasError = true;
    }
    
    if (!isPasswordStrong(newPassword)) {
      setPasswordError(true);
      showToast("Password must be at least 8 characters with uppercase, lowercase, number & special character", "error");
      hasError = true;
    } else {
      setPasswordError(false);
    }
    
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      hasError = true;
    }
    
    if (hasError) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      showToast("Password updated successfully! Redirecting to login...", "success");
      setTimeout(() => navigation.navigate('Login'), 2000);
    }, 1500);
  };

  const getActiveStep = () => {
    if (step === 1) return 'Verify Identity';
    if (step === 2) return 'Verify OTP';
    return 'Reset Password';
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
          
          <ToastNotification 
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onHide={() => setToast({ ...toast, visible: false })}
          />

          <OTPNotification
            visible={showOTPNotification}
            otp={currentOTP}
            onClose={() => setShowOTPNotification(false)}
            onCopy={handleCopyOTP}
          />

          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={{ flex: 1 }}
            >
              <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                
                {/* Back Button */}
                <TouchableOpacity 
                  onPress={() => {
                    if (step === 2) {
                      setStep(1);
                      setOtpCode(['', '', '', '', '', '']);
                    } else if (step === 3) {
                      setStep(2);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(false);
                    } else {
                      navigation.goBack();
                    }
                  }} 
                  style={styles.backButton}
                >
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
                  <Text style={styles.tagline}>
                    {getActiveStep()}
                  </Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                  
                  {/* Step Indicator */}
                  <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                    <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                    <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                    <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
                    <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
                  </View>
                  
                  <Text style={styles.stepText}>
                    Step {step} of 3: {getActiveStep()}
                  </Text>

                  {/* STEP 1: IDENTIFICATION */}
                  {step === 1 && (
                    <View>
                      <Text style={styles.inputLabel}>Select Recovery Method</Text>
                      
                      <View style={styles.optionsContainer}>
                        <TouchableOpacity 
                          style={[styles.optionButton, selectedOption === 'email' && styles.optionButtonActive]}
                          onPress={() => setSelectedOption('email')}
                        >
                          <Ionicons name="mail-outline" size={24} color={selectedOption === 'email' ? "#FFF" : "#04e1f5"} />
                          <Text style={[styles.optionText, selectedOption === 'email' && styles.optionTextActive]}>Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.optionButton, selectedOption === 'phone' && styles.optionButtonActive]}
                          onPress={() => setSelectedOption('phone')}
                        >
                          <Ionicons name="call-outline" size={24} color={selectedOption === 'phone' ? "#FFF" : "#04e1f5"} />
                          <Text style={[styles.optionText, selectedOption === 'phone' && styles.optionTextActive]}>Phone</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.optionButton, selectedOption === 'cnic' && styles.optionButtonActive]}
                          onPress={() => setSelectedOption('cnic')}
                        >
                          <Ionicons name="card-outline" size={24} color={selectedOption === 'cnic' ? "#FFF" : "#04e1f5"} />
                          <Text style={[styles.optionText, selectedOption === 'cnic' && styles.optionTextActive]}>CNIC</Text>
                        </TouchableOpacity>
                      </View>

                      {selectedOption === 'email' && (
                        <View>
                          <Text style={styles.inputLabel}>Email Address</Text>
                          <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#04e1f5" />
                            <TextInput 
                              style={styles.input}
                              placeholder="example@email.com"
                              placeholderTextColor="#666"
                              value={email}
                              onChangeText={setEmail}
                              autoCapitalize="none"
                              keyboardType="email-address"
                              autoComplete="email"
                            />
                          </View>
                        </View>
                      )}

                      {selectedOption === 'phone' && (
                        <View>
                          <Text style={styles.inputLabel}>Phone Number</Text>
                          <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={20} color="#04e1f5" />
                            <TextInput 
                              style={styles.input}
                              placeholder="03XXXXXXXXX"
                              placeholderTextColor="#666"
                              value={phoneNumber}
                              onChangeText={setPhoneNumber}
                              keyboardType="phone-pad"
                              maxLength={11}
                            />
                          </View>
                        </View>
                      )}

                      {selectedOption === 'cnic' && (
                        <View>
                          <Text style={styles.inputLabel}>CNIC Number</Text>
                          <View style={styles.inputWrapper}>
                            <Ionicons name="card-outline" size={20} color="#04e1f5" />
                            <TextInput 
                              style={styles.input}
                              placeholder="4210112345678"
                              placeholderTextColor="#666"
                              value={cnic}
                              onChangeText={setCnic}
                              keyboardType="numeric"
                              maxLength={13}
                            />
                          </View>
                        </View>
                      )}

                      <Text style={styles.hintText}>
                        {selectedOption === 'email' && "Enter your registered email address"}
                        {selectedOption === 'phone' && "Enter your 10-11 digit mobile number"}
                        {selectedOption === 'cnic' && "Enter your 13-digit CNIC number without dashes"}
                        {!selectedOption && "Select an option above to continue"}
                      </Text>
                    </View>
                  )}

                  {/* STEP 2: OTP VERIFICATION */}
                  {step === 2 && (
                    <OTPInput
                      code={otpCode}
                      setCode={setOtpCode}
                      onResendOTP={handleResendOTP}
                      isResending={isResendingOTP}
                      countdown={resendCountdown}
                    />
                  )}

                  {/* STEP 3: RESET PASSWORD */}
                  {step === 3 && (
                    <View>
                      <Text style={styles.inputLabel}>New Password</Text>
                      <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
                        <Ionicons name="lock-closed-outline" size={20} color={passwordError ? "#FF4D4D" : "#04e1f5"} />
                        <TextInput 
                          style={styles.input}
                          placeholder="Enter new password"
                          placeholderTextColor="#666"
                          secureTextEntry={!showNewPassword}
                          value={newPassword}
                          onChangeText={(text) => {
                            setNewPassword(text);
                            if (isPasswordStrong(text)) {
                              setPasswordError(false);
                            }
                          }}
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                          <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                      {passwordError && (
                        <Text style={styles.errorText}>
                          Password must contain: 8+ chars, uppercase, lowercase, number & special character
                        </Text>
                      )}

                      <Text style={styles.inputLabel}>Confirm Password</Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#04e1f5" />
                        <TextInput 
                          style={styles.input}
                          placeholder="Confirm new password"
                          placeholderTextColor="#666"
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                      
                      {confirmPassword.length > 0 && newPassword === confirmPassword && newPassword.length > 0 && !passwordError && (
                        <View style={styles.matchContainer}>
                          <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
                          <Text style={styles.matchText}>✓ Passwords match</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Action Button */}
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={
                      step === 1 ? handleSendOTP : 
                      step === 2 ? handleVerifyOTP : 
                      handleResetPassword
                    } 
                    disabled={loading}
                  >
                    <LinearGradient colors={['#04e1f5', '#0284c7']} style={styles.actionGradient}>
                      {loading ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.actionText}>
                          {step === 1 ? "SEND VERIFICATION CODE" : 
                           step === 2 ? "VERIFY OTP" : 
                           "RESET PASSWORD"}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Navigation Links */}
                  <TouchableOpacity 
                    onPress={() => {
                      if (step === 2) {
                        setStep(1);
                        setOtpCode(['', '', '', '', '', '']);
                      } else if (step === 3) {
                        setStep(2);
                      } else {
                        navigation.navigate('Login');
                      }
                    }} 
                    style={styles.cancelLink}
                  >
                    <Text style={styles.cancelText}>
                      {step === 2 ? "← Use different account" : 
                       step === 3 ? "← Back to verification" : 
                       "← Back to Login"}
                    </Text>
                  </TouchableOpacity>

                </View>

              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
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

  // OTP Notification
  otpNotification: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(8, 9, 37, 0.98)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#04e1f5',
    shadowColor: '#04e1f5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  otpNotificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  otpNotificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpNotificationTextContainer: {
    flex: 1,
  },
  otpNotificationTitle: {
    color: '#04e1f5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  otpNotificationMessage: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 2,
  },
  otpCode: {
    color: '#04e1f5',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyText: {
    color: '#04e1f5',
    fontSize: 12,
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
    color: '#e1eff0',
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
    borderColor: 'rgba(4, 225, 245, 0.46)',
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(4, 225, 245, 0.48)',
  },
  stepDotActive: {
    backgroundColor: '#12e4f7',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: 'rgba(4, 225, 245, 0.51)',
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: '#04e1f5',
  },
  stepText: {
    color: '#b9b6b6',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Options Container
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  optionButtonActive: {
    backgroundColor: '#04e1f5',
    borderColor: '#04e1f5',
  },
  optionText: {
    color: '#04e1f5',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFF',
  },

  // Input Styles
  inputLabel: {
    color: '#CCE3E5',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.42)',
    marginBottom: 8,
  },
  inputWrapperError: {
    borderColor: '#FF4D4D',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 14,
  },
  hintText: {
    color: '#cccbcb',
    fontSize: 10,
    marginBottom: 16,
    marginLeft: 8,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 11,
    marginBottom: 16,
    marginLeft: 8,
  },

  // OTP Styles
  otpContainer: {
    alignItems: 'center',
  },
  otpTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  otpSubtitle: {
    color: '#b4b3b3',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  otpInput: {
    width: 45,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#bdbcbc',
    fontSize: 12,
  },
  resendButton: {
    color: '#04e1f5',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#FFB800',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Match Indicator
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginLeft: 8,
  },
  matchText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '500',
  },

  // Action Button
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 16,
  },
  actionGradient: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Cancel Link
  cancelLink: {
    alignItems: 'center',
  },
  cancelText: {
    color: '#b9b9b9',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;