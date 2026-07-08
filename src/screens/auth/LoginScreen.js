// src/screens/auth/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, ActivityIndicator, Platform, Dimensions,
  KeyboardAvoidingView, StatusBar,
  ScrollView, TouchableWithoutFeedback, Keyboard, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Custom Toast Notification Component
const ToastNotification = ({ visible, message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => onHide());
      }, 3000);
    }
  }, [visible]);
  
  const getToastStyles = () => {
    switch(type) {
      case 'success':
        return {
          backgroundColor: COLORS.success,
          icon: 'checkmark-circle',
          textColor: COLORS.white,
          borderColor: COLORS.success,
        };
      case 'error':
        return {
          backgroundColor: COLORS.danger,
          icon: 'close-circle',
          textColor: COLORS.white,
          borderColor: COLORS.danger,
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warning,
          icon: 'warning',
          textColor: COLORS.white,
          borderColor: COLORS.warning,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          icon: 'information-circle',
          textColor: COLORS.white,
          borderColor: COLORS.primary,
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
        opacity: opacity,
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
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const passwordInputRef = useRef(null);

  // 🔥 FIX: Reset form when screen comes into focus (after logout)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset all fields
      setEmailOrPhone('');
      setPassword('');
      setShowPassword(false);
      setErrors({});
      setToast({ visible: false, message: '', type: '' });
    });

    return unsubscribe;
  }, [navigation]);

  // Detect role from email - Updated with all modules
  const detectRole = (email) => {
    if (!email) return 'patient';
    
    const emailLower = email.toLowerCase();
    
    // Admin detection
    if (emailLower.includes('admin') || 
        emailLower.includes('administrator') ||
        emailLower.includes('manager')) {
      return 'admin';
    }
    
    // Doctor detection - Now using sehatline.com domain
    if (emailLower.includes('doctor@sehatline.com') || 
        emailLower.includes('doctor') || 
        emailLower.includes('dr.')) {
      return 'doctor';
    }
    
    // Lab detection
    if (emailLower.includes('lab@sehatline.com') || 
        emailLower.includes('lab') || 
        emailLower.includes('laboratory')) {
      return 'lab';
    }
    
    // Pharmacy detection
    if (emailLower.includes('pharmacy@sehatline.com') || 
        emailLower.includes('pharmacy') || 
        emailLower.includes('pharma')) {
      return 'pharmacy';
    }
    
    // Chronic/Cardiology detection
    if (emailLower.includes('chronic@sehatline.com') || 
        emailLower.includes('cardio@sehatline.com') || 
        emailLower.includes('chronic') || 
        emailLower.includes('cardiology') ||
        emailLower.includes('cardio')) {
      return 'chronic';
    }
    
    return 'patient';
  };

  const roleConfig = {
    patient: {
      name: 'Patient',
      icon: 'person-outline',
      color: COLORS.primary,
      bgColor: COLORS.primary + '15',
      navigateTo: 'PatientPortal',
      gradientColors: [COLORS.primary, COLORS.secondary],
      requiresSignup: true,
    },
    doctor: {
      name: 'Doctor',
      icon: 'medkit-outline',
      color: COLORS.warning,
      bgColor: COLORS.warning + '15',
      navigateTo: 'DoctorModule',  // ✅ FIXED: Changed from DoctorPortalScreen to DoctorDashboardScreen
      gradientColors: [COLORS.warning, '#F59E0B'],
      requiresSignup: false,
    },
    lab: {
      name: 'Lab',
      icon: 'flask-outline',
      color: '#8B5CF6',
      bgColor: '#8B5CF6' + '15',
      navigateTo: 'LabDashboardScreen',
      gradientColors: ['#8B5CF6', '#6D28D9'],
      requiresSignup: false,
    },
    pharmacy: {
      name: 'Pharmacy',
      icon: 'medal-outline',
      color: '#10B981',
      bgColor: '#10B981' + '15',
      navigateTo: 'PharmacyDashboardScreen',
      gradientColors: ['#10B981', '#059669'],
      requiresSignup: false,
    },
    chronic: {
      name: 'Chronic/Cardiology',
      icon: 'heart-outline',
      color: '#EF4444',
      bgColor: '#EF4444' + '15',
      navigateTo: 'ChronicDashboardScreen',
      gradientColors: ['#EF4444', '#DC2626'],
      requiresSignup: false,
    },
    admin: {
      name: 'Admin',
      icon: 'shield-checkmark-outline',
      color: COLORS.appointment,
      bgColor: COLORS.appointment + '15',
      navigateTo: 'AdminDashboardScreen',
      gradientColors: [COLORS.appointment, '#7C3AED'],
      requiresSignup: false,
    }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const validateEmailOrPhone = (value) => {
    if (!value) return 'Email or Phone is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) return '';
    
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (phoneRegex.test(value)) return '';
    
    return 'Enter a valid email or phone number';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    return '';
  };

  // Check if user account exists in AsyncStorage
  const checkUserAccount = async (emailOrPhone) => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.email && userData.email.toLowerCase() === emailOrPhone.toLowerCase()) {
          return true;
        }
        if (userData.phone && userData.phone === emailOrPhone) {
          return true;
        }
      }
      
      const registeredUsersString = await AsyncStorage.getItem('registeredUsers');
      if (registeredUsersString) {
        const registeredUsers = JSON.parse(registeredUsersString);
        return registeredUsers.some(user => 
          user.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          user.phone === emailOrPhone
        );
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  // Get user data by email or phone
  const getUserData = async (emailOrPhone) => {
    try {
      const registeredUsersString = await AsyncStorage.getItem('registeredUsers');
      if (registeredUsersString) {
        const registeredUsers = JSON.parse(registeredUsersString);
        const user = registeredUsers.find(u => 
          u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          u.phone === emailOrPhone
        );
        if (user) return user;
      }
      
      const emailLower = emailOrPhone.toLowerCase();
      
      // Doctor check
      if (emailLower.includes('doctor@sehatline.com') || emailLower.includes('doctor')) {
        return {
          name: emailOrPhone.split('@')[0] || 'Doctor',
          email: emailOrPhone,
          phone: '',
          role: 'doctor',
          joinDate: new Date().toLocaleDateString(),
        };
      }
      
      // Lab check
      if (emailLower.includes('lab@sehatline.com') || emailLower.includes('lab')) {
        return {
          name: emailOrPhone.split('@')[0] || 'Lab',
          email: emailOrPhone,
          phone: '',
          role: 'lab',
          joinDate: new Date().toLocaleDateString(),
        };
      }
      
      // Pharmacy check
      if (emailLower.includes('pharmacy@sehatline.com') || emailLower.includes('pharmacy')) {
        return {
          name: emailOrPhone.split('@')[0] || 'Pharmacy',
          email: emailOrPhone,
          phone: '',
          role: 'pharmacy',
          joinDate: new Date().toLocaleDateString(),
        };
      }
      
      // Chronic/Cardiology check
      if (emailLower.includes('chronic@sehatline.com') || 
          emailLower.includes('cardio@sehatline.com') || 
          emailLower.includes('chronic') || 
          emailLower.includes('cardiology')) {
        return {
          name: emailOrPhone.split('@')[0] || 'Chronic',
          email: emailOrPhone,
          phone: '',
          role: 'chronic',
          joinDate: new Date().toLocaleDateString(),
        };
      }
      
      // Admin check
      if (emailLower.includes('admin') || emailLower.includes('administrator') || emailLower.includes('manager')) {
        return {
          name: 'Administrator',
          email: emailOrPhone,
          phone: '',
          role: 'admin',
          joinDate: new Date().toLocaleDateString(),
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Save user to registered users list
  const saveUserToRegistered = async (userData) => {
    try {
      let registeredUsers = [];
      const existing = await AsyncStorage.getItem('registeredUsers');
      if (existing) {
        registeredUsers = JSON.parse(existing);
      }
      
      const exists = registeredUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (!exists) {
        registeredUsers.push(userData);
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleLogin = async () => {
    const emailOrPhoneError = validateEmailOrPhone(emailOrPhone);
    const passwordError = validatePassword(password);
    
    setErrors({ emailOrPhone: emailOrPhoneError, password: passwordError });
    
    if (!emailOrPhoneError && !passwordError) {
      setLoading(true);
      
      const isEmail = emailOrPhone.includes('@');
      const loginValue = isEmail ? emailOrPhone : emailOrPhone;
      
      let user = await getUserData(loginValue);
      
      if (!user) {
        setLoading(false);
        showToast('No account found. Please sign up first.', 'warning');
        setTimeout(() => {
          navigation.navigate('Signup');
        }, 1500);
        return;
      }
      
      if (!user.role) {
        user.role = detectRole(user.email);
      }
      
      const detectedRole = user.role || detectRole(user.email);
      const currentRole = roleConfig[detectedRole] || roleConfig.patient;
      
      if (detectedRole === 'patient' && currentRole.requiresSignup) {
        const accountExists = await checkUserAccount(loginValue);
        if (!accountExists) {
          setLoading(false);
          showToast('No patient account found. Please sign up first.', 'warning');
          setTimeout(() => {
            navigation.navigate('Signup');
          }, 1500);
          return;
        }
      }
      
      setTimeout(async () => {
        setLoading(false);
        const userData = {
          name: user.name || user.email.split('@')[0],
          email: user.email,
          phone: user.phone || '',
          role: detectedRole,
          joinDate: user.joinDate || new Date().toLocaleDateString(),
        };
        
        await saveUserData(userData.name, userData.email, userData.phone, detectedRole);
        
        if (detectedRole === 'patient') {
          await saveUserToRegistered(userData);
        }
        
        showToast(`Welcome ${currentRole.name}! Login Successful`, 'success');
        
        // ✅ FIX: Use navigation.replace with correct screen name
        setTimeout(() => {
          navigation.replace(currentRole.navigateTo, {
            userData: userData,
          });
        }, 1500);
      }, 1500);
    } else {
      if (emailOrPhoneError) showToast(emailOrPhoneError, 'error');
      else if (passwordError) showToast(passwordError, 'error');
    }
  };

  const handleFingerprintLogin = async () => {
    const defaultRole = 'patient';
    const currentRole = roleConfig[defaultRole];
    
    showToast(`Authenticating as ${currentRole.name}...`, 'info');
    setTimeout(async () => {
      setLoading(true);
      setTimeout(async () => {
        setLoading(false);
        const demoName = `${currentRole.name}User`;
        const demoEmail = `${currentRole.name}@example.com`;
        
        const accountExists = await checkUserAccount(demoEmail);
        if (!accountExists) {
          showToast('No account found. Please sign up first.', 'warning');
          setTimeout(() => {
            navigation.navigate('Signup');
          }, 1500);
          return;
        }
        
        await saveUserData(demoName, demoEmail, '', defaultRole);
        showToast(`Welcome ${currentRole.name}! Biometric Login Successful`, 'success');
        setTimeout(() => {
          navigation.replace(currentRole.navigateTo, {
            userData: {
              name: demoName,
              email: demoEmail,
              phone: '',
              role: defaultRole,
              joinDate: new Date().toLocaleDateString(),
            }
          });
        }, 1500);
      }, 1500);
    }, 500);
  };

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
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userRole', role);
    } catch (error) {
      // Silent fail
    }
  };

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              contentContainerStyle={[
                styles.scrollContainer,
                isKeyboardVisible && styles.scrollContainerKeyboard
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoBacklight}>
                  <LinearGradient
                    colors={[COLORS.primary + '30', COLORS.primary + '10', 'transparent']}
                    style={styles.backlightGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                </View>
                
                <View style={[styles.logoCircle, { borderColor: COLORS.primary }]}>
                  <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
                </View>
                
                <Text style={styles.appName}>
                  SEHAT<Text style={styles.appNameWhite}>LINE</Text>
                </Text>
                <Text style={styles.tagline}>CDA Healthcare Portal</Text>
              </View>

              {/* Login Form */}
              <View style={styles.formContainer}>
                <View style={[styles.formCard, { borderColor: COLORS.primary + '20' }]}>
                  
                  {/* Email/Phone Input */}
                  <View style={styles.inputGroup}>
                    <View style={[styles.inputWrapper, errors.emailOrPhone && styles.inputError, { borderColor: COLORS.primary + '30' }]}>
                      <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                      <TextInput
                        style={styles.input}
                        placeholder="Email or Phone Number"
                        placeholderTextColor={COLORS.textLight}
                        value={emailOrPhone}
                        onChangeText={(text) => { setEmailOrPhone(text); errors.emailOrPhone && setErrors({...errors, emailOrPhone: ''}); }}
                        keyboardType="default"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                    {errors.emailOrPhone && <Text style={styles.errorText}>{errors.emailOrPhone}</Text>}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={[styles.inputWrapper, errors.password && styles.inputError, { borderColor: COLORS.primary + '30' }]}>
                      <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
                      <TextInput
                        ref={passwordInputRef}
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={COLORS.textLight}
                        value={password}
                        onChangeText={(text) => { setPassword(text); errors.password && setErrors({...errors, password: ''}); }}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity 
                    style={styles.forgotLink} 
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={[styles.forgotText, { color: COLORS.primary }]}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.loginGradient}>
                      {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.loginText}>LOGIN</Text>}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Sign Up Link */}
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                      <Text style={[styles.signupLink, { color: COLORS.primary }]}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Fingerprint */}
              <TouchableOpacity style={styles.fingerprintContainer} onPress={handleFingerprintLogin} activeOpacity={0.7}>
                <View style={[styles.fingerprintCircle, { borderColor: COLORS.primary + '40' }]}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.fingerprintGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="finger-print" size={30} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <Text style={[styles.fingerprintText, { color: COLORS.primary }]}>Use Fingerprint</Text>
              </TouchableOpacity>

              <Text style={styles.versionText}>Version 2.0.0</Text>

            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  scrollContainerKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
  },

  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    ...SHADOWS.medium,
    minHeight: 52,
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
    lineHeight: 20,
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: height * 0.04,
    position: 'relative',
  },
  logoBacklight: {
    position: 'absolute',
    top: -20,
    width: 200,
    height: 150,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backlightGradient: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  logoCircle: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: width * 0.11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 12,
    zIndex: 1,
  },
  logoImage: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: width * 0.08,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: width * 0.095,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
    zIndex: 1,
  },
  appNameWhite: {
    color: COLORS.text,
  },
  tagline: {
    fontSize: width * 0.032,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    zIndex: 1,
  },

  formContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SIZES.xl,
    borderWidth: 1.5,
    ...SHADOWS.medium,
  },

  inputGroup: {
    marginBottom: SIZES.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: SIZES.md,
    height: 52,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    marginLeft: 12,
    fontSize: SIZES.body,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    height: '100%',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },

  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.xl,
    marginTop: 2,
  },
  forgotText: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },

  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SIZES.lg,
    ...SHADOWS.button,
  },
  loginGradient: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
  signupLink: {
    fontSize: SIZES.body,
    fontWeight: '700',
  },

  fingerprintContainer: {
    alignItems: 'center',
    marginTop: height * 0.035,
    marginBottom: height * 0.015,
  },
  fingerprintCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  fingerprintGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 0.3,
  },

  versionText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});

export default LoginScreen;