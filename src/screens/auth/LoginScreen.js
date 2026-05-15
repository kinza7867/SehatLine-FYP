import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, ActivityIndicator, Platform, Dimensions,
  KeyboardAvoidingView, Modal, StatusBar, ImageBackground,
  ScrollView, TouchableWithoutFeedback, Keyboard, Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Custom Toast Notification Component
const ToastNotification = ({ visible, message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();
      
      setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3000);
    }
  }, [visible]);
  
  const getToastStyles = () => {
    switch(type) {
      case 'success':
        return {
          backgroundColor: 'rgba(0, 255, 136, 0.95)',
          icon: 'checkmark-circle',
          textColor: '#004D26',
          borderColor: '#00FF88',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(255, 77, 77, 0.95)',
          icon: 'close-circle',
          textColor: '#FFFFFF',
          borderColor: '#FF4D4D',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 184, 0, 0.95)',
          icon: 'warning',
          textColor: '#332200',
          borderColor: '#FFB800',
        };
      default:
        return {
          backgroundColor: 'rgba(4, 225, 245, 0.95)',
          icon: 'information-circle',
          textColor: '#003344',
          borderColor: '#04e1f5',
        };
    }
  };
  
  const toastStyle = getToastStyles();
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[
      styles.toastContainer,
      {
        transform: [{ translateY }],
        backgroundColor: toastStyle.backgroundColor,
        borderLeftColor: toastStyle.borderColor,
      }
    ]}>
      <View style={styles.toastContent}>
        <Ionicons name={toastStyle.icon} size={24} color={toastStyle.textColor} />
        <Text style={[styles.toastMessage, { color: toastStyle.textColor }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  
  const passwordInputRef = useRef(null);

  const roleConfig = {
    patient: {
      name: 'Patient',
      icon: 'person-outline',
      color: '#04e1f5',
      bgColor: 'rgba(4, 225, 245, 0.1)',
      navigateTo: 'PatientPortal',
      gradientColors: ['#04e1f5', '#0284c7'],
    },
    doctor: {
      name: 'Doctor',
      icon: 'medkit-outline',
      color: '#FFB800',
      bgColor: 'rgba(255, 184, 0, 0.1)',
      navigateTo: 'ManageDoctorsScreen',
      gradientColors: ['#FFB800', '#FF9500'],
    },
    admin: {
      name: 'Admin',
      icon: 'shield-checkmark-outline',
      color: '#A855F7',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      navigateTo: 'AdminDashboardScreen',
      gradientColors: ['#A855F7', '#7C3AED'],
    }
  };

  const currentRole = roleConfig[selectedRole];

  // Show Toast Notification
  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  // Strong Password Validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Enter a valid email (e.g., name@example.com)';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character (!@#$%^&*)';
    
    return '';
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 2) return { text: 'Weak', color: '#FF4D4D' };
    if (strength <= 3) return { text: 'Medium', color: '#FFB800' };
    if (strength <= 4) return { text: 'Strong', color: '#04e1f5' };
    return { text: 'Very Strong', color: '#00FF88' };
  };

  const handleLogin = () => {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  
  setErrors({ email: emailError, password: passwordError });
  
  if (!emailError && !passwordError) {
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      
      // Extract name from email (before @) or you can add a name field in your form
      const userName = email.split('@')[0]; // This takes "john" from "john@example.com"
      
      // Save user data to storage for profile screen
      await saveUserData(userName, email, '', selectedRole);
      
      showToast(`Welcome ${currentRole.name}! Login Successful`, 'success');
      setTimeout(() => {
        // Pass user data to next screen
        navigation.replace(currentRole.navigateTo, {
          userData: {
            name: userName,
            email: email,
            phone: '',
            role: selectedRole,
            joinDate: new Date().toLocaleDateString(),
          }
        });
      }, 1500);
    }, 1500);
  } else {
    if (emailError) showToast(emailError, 'error');
    else if (passwordError) showToast(passwordError, 'error');
  }
};

  const handleFingerprintLogin = () => {
  showToast(`Authenticating as ${currentRole.name}...`, 'info');
  setTimeout(async () => {
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      
      // For fingerprint, use a demo name or get from somewhere
      const demoName = `${currentRole.name}User`;
      const demoEmail = `${currentRole.name}@example.com`;
      
      await saveUserData(demoName, demoEmail, '', selectedRole);
      
      showToast(`Welcome ${currentRole.name}! Biometric Login Successful`, 'success');
      setTimeout(() => {
        navigation.replace(currentRole.navigateTo, {
          userData: {
            name: demoName,
            email: demoEmail,
            phone: '',
            role: selectedRole,
            joinDate: new Date().toLocaleDateString(),
          }
        });
      }, 1500);
    }, 1500);
  }, 500);
};

  // Save user data to storage for profile screen
    const saveUserData = async (name, email, phone, role) => {
      try {
        const userData = {
          name: name,
          email: email,
          phone: phone,
          role: role,
          joinDate: new Date().toLocaleDateString(),
        };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('User data saved:', userData);
      } catch (error) {
        console.log('Error saving user data:', error);
      }
    };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleModal(false);
    setEmail('');
    setPassword('');
    setErrors({});
    showToast(`Switched to ${roleConfig[role].name} mode`, 'info');
  };

  const passwordStrength = getPasswordStrength();

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
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              
              {/* Role Selector Button - Top Right */}
              <View style={styles.topBar}>
                <TouchableOpacity 
                  style={[styles.roleSelector, { borderColor: currentRole.color }]} 
                  onPress={() => setShowRoleModal(true)}
                >
                  <View style={[styles.roleSelectorBadge, { backgroundColor: currentRole.bgColor }]}>
                    <Ionicons name={currentRole.icon} size={14} color={currentRole.color} />
                  </View>
                  <Text style={[styles.roleSelectorText, { color: currentRole.color }]}>
                    {currentRole.name}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={currentRole.color} />
                </TouchableOpacity>
              </View>

              {/* Logo Section - Circular Logo */}
              <View style={styles.logoSection}>
                <View style={[styles.logoCircle, { borderColor: currentRole.color }]}>
                  <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
                </View>
                <Text style={styles.appName}>
                  SEHAT<Text style={styles.appNameWhite}>LINE</Text>
                </Text>
                <Text style={styles.tagline}>CDA Healthcare Portal</Text>
              </View>

              {/* Login Form */}
              <View style={styles.formContainer}>
                <View style={[styles.formCard, { borderColor: `${currentRole.color}30` }]}>
                  
                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <View style={[styles.inputWrapper, errors.email && styles.inputError, { borderColor: `${currentRole.color}30` }]}>
                      <Ionicons name="mail-outline" size={20} color={currentRole.color} />
                      <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#a5a3a3"
                        value={email}
                        onChangeText={(text) => { setEmail(text); errors.email && setErrors({...errors, email: ''}); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={[styles.inputWrapper, errors.password && styles.inputError, { borderColor: `${currentRole.color}30` }]}>
                      <Ionicons name="lock-closed-outline" size={20} color={currentRole.color} />
                      <TextInput
                        ref={passwordInputRef}
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#a5a3a3"
                        value={password}
                        onChangeText={(text) => { setPassword(text); errors.password && setErrors({...errors, password: ''}); }}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#a5a3a3" />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Password Strength Indicator - Only the bar and strength text */}
                    {password.length > 0 && !errors.password && (
                      <View style={styles.strengthContainer}>
                        <View style={styles.strengthBar}>
                          <View style={[
                            styles.strengthFill, 
                            { 
                              width: `${(passwordStrength?.text === 'Weak' ? 25 : 
                                       passwordStrength?.text === 'Medium' ? 50 : 
                                       passwordStrength?.text === 'Strong' ? 75 : 100)}%`,
                              backgroundColor: passwordStrength?.color 
                            }
                          ]} />
                        </View>
                        <Text style={[styles.strengthText, { color: passwordStrength?.color }]}>
                          {passwordStrength?.text} Password
                        </Text>
                      </View>
                    )}
                    
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity 
                    style={styles.forgotLink} 
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={[styles.forgotText, { color: currentRole.color }]}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                    <LinearGradient colors={currentRole.gradientColors} style={styles.loginGradient}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginText}>LOGIN</Text>}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Sign Up Link */}
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                      <Text style={[styles.signupLink, { color: currentRole.color }]}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Fingerprint - Outside Container */}
              <TouchableOpacity style={styles.fingerprintContainer} onPress={handleFingerprintLogin} activeOpacity={0.7}>
                <View style={[styles.fingerprintCircle, { borderColor: `${currentRole.color}50` }]}>
                  <Ionicons name="finger-print" size={32} color={currentRole.color} />
                </View>
                <Text style={[styles.fingerprintText, { color: currentRole.color }]}>Use Fingerprint</Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>

          {/* Role Selection Modal */}
          <Modal visible={showRoleModal} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRoleModal(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Role</Text>
                    <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                      <Ionicons name="close" size={24} color="#888" />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.modalRoleItem, selectedRole === 'patient' && styles.modalRoleSelected]} 
                    onPress={() => handleRoleSelect('patient')}
                  >
                    <View style={[styles.modalRoleIcon, { backgroundColor: roleConfig.patient.bgColor }]}>
                      <Ionicons name="person-outline" size={22} color={roleConfig.patient.color} />
                    </View>
                    <Text style={styles.modalRoleName}>Patient</Text>
                    {selectedRole === 'patient' && <Ionicons name="checkmark" size={20} color={roleConfig.patient.color} />}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalRoleItem, selectedRole === 'doctor' && styles.modalRoleSelected]} 
                    onPress={() => handleRoleSelect('doctor')}
                  >
                    <View style={[styles.modalRoleIcon, { backgroundColor: roleConfig.doctor.bgColor }]}>
                      <Ionicons name="medkit-outline" size={22} color={roleConfig.doctor.color} />
                    </View>
                    <Text style={styles.modalRoleName}>Doctor</Text>
                    {selectedRole === 'doctor' && <Ionicons name="checkmark" size={20} color={roleConfig.doctor.color} />}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalRoleItem, selectedRole === 'admin' && styles.modalRoleSelected]} 
                    onPress={() => handleRoleSelect('admin')}
                  >
                    <View style={[styles.modalRoleIcon, { backgroundColor: roleConfig.admin.bgColor }]}>
                      <Ionicons name="shield-checkmark-outline" size={22} color={roleConfig.admin.color} />
                    </View>
                    <Text style={styles.modalRoleName}>Admin</Text>
                    {selectedRole === 'admin' && <Ionicons name="checkmark" size={20} color={roleConfig.admin.color} />}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },

  // Toast Notification Styles
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
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

  // Top Bar
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 25,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 4, 56, 0.99)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  roleSelectorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSelectorText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Logo Section - Perfect Circle
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#04e1f5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 11,
    color: '#f8fafa',
    letterSpacing: 1,
    marginTop: 4,
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'rgba(2, 4, 77, 0.75)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 242, 242, 0.19)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    marginLeft: 12,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 8,
  },

  // Password Strength
  strengthContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Forgot Password
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Login Button
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginGradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Sign Up
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#888',
    fontSize: 13,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Fingerprint - Outside Container
  fingerprintContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  fingerprintCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 21, 32, 0.5)',
    marginBottom: 8,
  },
  fingerprintText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
  },
  modalCard: {
    backgroundColor: '#022141',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.48)',
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
  modalRoleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.21)',
  },
  modalRoleSelected: {
    borderWidth: 1,
    borderColor: '#04e1f5',
  },
  modalRoleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalRoleName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

export default LoginScreen;