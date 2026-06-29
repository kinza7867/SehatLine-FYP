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
  StatusBar,
  Animated,
  Dimensions,
  Clipboard
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme';

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
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle',
          textColor: COLORS.white,
        };
      case 'error':
        return {
          backgroundColor: COLORS.danger,
          icon: 'close-circle',
          textColor: COLORS.white,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          icon: 'information-circle',
          textColor: COLORS.white,
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
        <View style={[styles.otpNotificationIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <Ionicons name="key-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.otpNotificationTextContainer}>
          <Text style={[styles.otpNotificationTitle, { color: COLORS.primary }]}>Verification Code Sent!</Text>
          <Text style={styles.otpNotificationMessage}>
            Your OTP code is: <Text style={[styles.otpCode, { color: COLORS.primary }]}>{otp}</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={() => onCopy(otp)} style={[styles.copyButton, { backgroundColor: COLORS.primary + '15' }]}>
          <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.copyText, { color: COLORS.primary }]}>Copy</Text>
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
            style={[styles.otpInput, { borderColor: COLORS.primary + '30' }]}
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
          <Text style={[styles.timerText, { color: COLORS.warning }]}>Resend in {countdown}s</Text>
        ) : (
          <TouchableOpacity onPress={onResendOTP} disabled={isResending}>
            <Text style={[styles.resendButton, { color: COLORS.primary }]}>
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

  // Format CNIC with dashes
  const formatCNIC = (text) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 5) {
      return digits;
    } else if (digits.length <= 12) {
      return digits.slice(0, 5) + '-' + digits.slice(5);
    } else {
      return digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12, 13);
    }
  };

  // Format phone number (remove leading 0)
  const formatPhone = (text) => {
    return text.replace(/^0+/, '').replace(/\D/g, '');
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
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      if (!phoneNumber) {
        showToast("Please enter your phone number", "error");
        return;
      }
      if (cleanedPhone.length !== 10) {
        showToast("Please enter 10 digits without 0", "error");
        return;
      }
      isValid = true;
      identifier = cleanedPhone;
    } else if (selectedOption === 'cnic') {
      const cleanedCnic = cnic.replace(/-/g, '');
      if (!cnic) {
        showToast("Please enter your CNIC number", "error");
        return;
      }
      if (cleanedCnic.length !== 13) {
        showToast("CNIC must be 13 digits", "error");
        return;
      }
      isValid = true;
      identifier = cleanedCnic;
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
      
      setShowOTPNotification(true);
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
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        
        <LinearGradient
          colors={[COLORS.primary, COLORS.background, COLORS.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBackground}
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
                  <Ionicons name="arrow-back" size={24} color={COLORS.navyDark} />
                </TouchableOpacity>

                {/* Logo Section */}
                <View style={styles.logoSection}>
                  <View style={[styles.logoCircle, { borderColor: COLORS.primary }]}>
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
                <View style={[styles.formCard, { borderColor: COLORS.primary + '46' }]}>
                  
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
                          <Ionicons name="mail-outline" size={24} color={selectedOption === 'email' ? COLORS.white : COLORS.primary} />
                          <Text style={[styles.optionText, selectedOption === 'email' && styles.optionTextActive]}>Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.optionButton, selectedOption === 'phone' && styles.optionButtonActive]}
                          onPress={() => setSelectedOption('phone')}
                        >
                          <Ionicons name="call-outline" size={24} color={selectedOption === 'phone' ? COLORS.white : COLORS.primary} />
                          <Text style={[styles.optionText, selectedOption === 'phone' && styles.optionTextActive]}>Phone</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.optionButton, selectedOption === 'cnic' && styles.optionButtonActive]}
                          onPress={() => setSelectedOption('cnic')}
                        >
                          <Ionicons name="card-outline" size={24} color={selectedOption === 'cnic' ? COLORS.white : COLORS.primary} />
                          <Text style={[styles.optionText, selectedOption === 'cnic' && styles.optionTextActive]}>CNIC</Text>
                        </TouchableOpacity>
                      </View>

                      {selectedOption === 'email' && (
                        <View>
                          <Text style={styles.inputLabel}>Email Address</Text>
                          <View style={[styles.inputWrapper, { borderColor: COLORS.primary + '42' }]}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                            <TextInput 
                              style={styles.input}
                              placeholder="example@email.com"
                              placeholderTextColor={COLORS.textLight}
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
                          <View style={[styles.inputWrapper, { borderColor: COLORS.primary + '42' }]}>
                            <View style={styles.countryCodeContainer}>
                              <Text style={styles.countryCode}>+92</Text>
                              <View style={styles.countryDivider} />
                            </View>
                            <TextInput 
                              style={[styles.input, styles.phoneInput]}
                              placeholder="3XXXXXXXXX"
                              placeholderTextColor={COLORS.textLight}
                              value={phoneNumber}
                              onChangeText={(text) => setPhoneNumber(formatPhone(text))}
                              keyboardType="phone-pad"
                              maxLength={10}
                            />
                          </View>
                          <Text style={[styles.hintText, { color: COLORS.textSecondary }]}>
                            Enter 10 digits without 0
                          </Text>
                        </View>
                      )}

                      {selectedOption === 'cnic' && (
                        <View>
                          <Text style={styles.inputLabel}>CNIC Number</Text>
                          <View style={[styles.inputWrapper, { borderColor: COLORS.primary + '42' }]}>
                            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
                            <TextInput 
                              style={styles.input}
                              placeholder="12345-1234567-1"
                              placeholderTextColor={COLORS.textLight}
                              value={cnic}
                              onChangeText={(text) => setCnic(formatCNIC(text))}
                              keyboardType="numeric"
                              maxLength={15}
                            />
                          </View>
                        </View>
                      )}

                      <Text style={styles.hintText}>
                        {selectedOption === 'email' && "Enter your registered email address"}
                        {selectedOption === 'phone' && "Enter your 10-digit mobile number without 0"}
                        {selectedOption === 'cnic' && "Enter your 13-digit CNIC number"}
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
                      <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError, { borderColor: COLORS.primary + '42' }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={passwordError ? COLORS.danger : COLORS.primary} />
                        <TextInput 
                          style={styles.input}
                          placeholder="Enter new password"
                          placeholderTextColor={COLORS.textLight}
                          secureTextEntry={!showNewPassword}
                          value={newPassword}
                          onChangeText={(text) => {
                            setNewPassword(text);
                            if (isPasswordStrong(text)) {
                              setPasswordError(false);
                            }
                          }}
                          autoComplete="off"
                          textContentType="none"
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                          <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                      </View>
                      {passwordError && (
                        <Text style={[styles.errorText, { color: COLORS.danger }]}>
                          Password must contain: 8+ chars, uppercase, lowercase, number & special character
                        </Text>
                      )}

                      <Text style={styles.inputLabel}>Confirm Password</Text>
                      <View style={[styles.inputWrapper, { borderColor: COLORS.primary + '42' }]}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                        <TextInput 
                          style={styles.input}
                          placeholder="Confirm new password"
                          placeholderTextColor={COLORS.textLight}
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          autoComplete="off"
                          textContentType="none"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                      </View>
                      
                      {confirmPassword.length > 0 && newPassword === confirmPassword && newPassword.length > 0 && !passwordError && (
                        <View style={styles.matchContainer}>
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                          <Text style={[styles.matchText, { color: COLORS.success }]}>✓ Passwords match</Text>
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
                    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.actionGradient}>
                      {loading ? (
                        <ActivityIndicator color={COLORS.white} />
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
    ...SHADOWS.medium,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastMessage: {
    flex: 1,
    fontSize: SIZES.body,
    fontWeight: '500',
  },

  // OTP Notification
  otpNotification: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.large,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpNotificationTextContainer: {
    flex: 1,
  },
  otpNotificationTitle: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  otpNotificationMessage: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    marginTop: 2,
  },
  otpCode: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyText: {
    fontSize: SIZES.small,
    fontWeight: '500',
  },

  // Back Button
  backButton: {
    paddingHorizontal: SIZES.xl,
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
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
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
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: 12,
  },
  appNameWhite: {
    color: COLORS.text,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: 1,
    marginTop: 4,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    ...SHADOWS.medium,
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
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
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
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.white,
  },

  // Input Styles
  inputLabel: {
    color: COLORS.text,
    fontSize: SIZES.small,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    borderWidth: 1,
    marginBottom: 8,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    marginLeft: 12,
    fontSize: SIZES.body,
  },
  phoneInput: {
    marginLeft: 6,
  },
  hintText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xSmall,
    marginBottom: 16,
    marginLeft: 8,
  },
  errorText: {
    fontSize: SIZES.small,
    marginBottom: 16,
    marginLeft: 8,
  },

  // Country Code
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  countryDivider: {
    width: 1.5,
    height: 22,
    backgroundColor: COLORS.border,
    marginLeft: 8,
  },

  // OTP Styles
  otpContainer: {
    alignItems: 'center',
  },
  otpTitle: {
    color: COLORS.text,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  otpSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
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
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: SIZES.h4,
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
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
  resendButton: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: SIZES.small,
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
    fontSize: SIZES.small,
    fontWeight: '500',
  },

  // Action Button
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 16,
    ...SHADOWS.button,
  },
  actionGradient: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.white,
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Cancel Link
  cancelLink: {
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;