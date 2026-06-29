import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, Dimensions, Modal,
  SafeAreaView, ActivityIndicator, Image,
  StatusBar, Animated, Alert, Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Toast Notification Component
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
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toastGradient}
      >
        <View style={styles.toastContent}>
          <Ionicons name={type === 'error' ? 'alert-circle' : 'checkmark-circle'} size={22} color={COLORS.white} />
          <Text style={styles.toastMessage}>{message}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Progress Indicator
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressSteps}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.progressStepWrapper}>
            <View style={[
              styles.progressStep,
              index < currentStep && styles.progressStepCompleted,
              index === currentStep && styles.progressStepActive,
            ]}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              ) : (
                <Text style={[styles.progressStepText, index === currentStep && styles.progressStepTextActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View style={[styles.progressLine, index < currentStep && styles.progressLineCompleted]} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.progressLabel}>Step {currentStep + 1} of {totalSteps}</Text>
    </View>
  );
};

// ─── STEP 1: Personal Information ──────────────────────────────────────────

const PersonalInfoStep = ({ formData, setFormData, errors, setErrors, onNext, showToast }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [isDobSelected, setIsDobSelected] = useState(false);
  const [dobText, setDobText] = useState('Select Date of Birth');
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    
    if (event?.type === "set" && selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setDobText(formattedDate);
      setIsDobSelected(true);
      setFormData({ ...formData, dob: formattedDate });
      setErrors({ ...errors, dob: '' });
    } else if (event?.type === "dismissed") {
      setShowPicker(false);
    } else if (selectedDate && !event?.type) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setDobText(formattedDate);
      setIsDobSelected(true);
      setFormData({ ...formData, dob: formattedDate });
      setErrors({ ...errors, dob: '' });
      if (Platform.OS === 'android') setShowPicker(false);
    }
  };

  // ─── CNIC Validation ──────────────────────────────────────────────────────
  const validateField = useCallback((field, value) => {
    let error = '';
    switch(field) {
      case 'name':
        if (!value || value.length < 3) error = 'Name must be at least 3 characters';
        break;
      case 'cnic':
        const cleanCnic = value.replace(/-/g, '');
        if (!value || cleanCnic.length !== 13) error = 'CNIC must be 13 digits';
        break;
      case 'cdaCard':
        const clean = value.replace(/[^0-9]/g, '');
        if (!value || clean.length !== 4) error = 'Enter 4 digits for CDA Card';
        break;
      case 'phone':
        const cleanPhone = value.replace(/^0+/, '');
        if (!value || cleanPhone.length !== 10) error = 'Enter 10 digits without 0';
        break;
      case 'password':
        if (!value || value.length < 8) error = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter valid email';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [formData.password]);

  // ─── Field Changes ──────────────────────────────────────────────────────
  const handleFieldChange = useCallback((field, value) => {
    let processedValue = value;
    
    // CNIC: format with dashes
    if (field === 'cnic') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 5) {
        processedValue = digits;
      } else if (digits.length <= 12) {
        processedValue = digits.slice(0, 5) + '-' + digits.slice(5);
      } else {
        processedValue = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12, 13);
      }
      setFormData(prev => ({ ...prev, [field]: processedValue }));
      validateField(field, digits);
      return;
    }
    
    // ─── CDA CARD: Only accept digits, RB added automatically ──────────
    if (field === 'cdaCard') {
      const digits = value.replace(/[^0-9]/g, '');
      if (digits.length <= 4) {
        processedValue = digits;
      } else {
        processedValue = digits.slice(0, 4);
      }
      setFormData(prev => ({ ...prev, [field]: processedValue }));
      validateField(field, processedValue);
      return;
    }
    
    // Phone: remove leading 0
    if (field === 'phone') {
      processedValue = value.replace(/^0+/, '').replace(/\D/g, '');
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    validateField(field, processedValue);
  }, [validateField]);

  const handleNext = useCallback(() => {
    const fieldsToValidate = ['name', 'cnic', 'cdaCard', 'phone', 'email', 'password', 'confirmPassword'];
    let isValid = true;
    let errorMessages = [];
    
    fieldsToValidate.forEach(field => {
      let value = formData[field];
      if (field === 'cnic') value = value.replace(/-/g, '');
      if (field === 'cdaCard') {
        const digits = value.replace(/[^0-9]/g, '');
        if (digits.length !== 4) {
          setErrors(prev => ({ ...prev, cdaCard: 'Enter 4 digits for CDA Card' }));
          isValid = false;
          errorMessages.push('CDA Card');
          return;
        }
        const valid = validateField(field, digits);
        if (!valid) {
          isValid = false;
          errorMessages.push('CDA Card');
        }
        return;
      }
      const valid = validateField(field, value);
      if (!valid) {
        isValid = false;
        const labels = {
          name: 'Name',
          cnic: 'CNIC',
          cdaCard: 'CDA Card',
          phone: 'Phone',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password'
        };
        if (errors[field]) {
          errorMessages.push(labels[field]);
        }
      }
    });

    if (!formData.dob) {
      setErrors(prev => ({ ...prev, dob: 'Date of Birth is required' }));
      isValid = false;
      errorMessages.push('Date of Birth');
    }

    if (!isValid) {
      const errorMsg = errorMessages.length > 0 
        ? `Please fix: ${errorMessages.join(', ')}` 
        : 'Please complete all required fields';
      
      if (showToast) {
        showToast(errorMsg, 'error');
      }
      return;
    }

    onNext();
  }, [formData, errors, validateField, showToast, onNext]);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Enter your personal details to get started</Text>

      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name <Text style={styles.requiredStar}>*</Text></Text>
        <View style={[styles.inputWrapper, errors.name ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="person-outline" size={20} color={errors.name ? COLORS.danger : COLORS.primary} />
          <TextInput 
            style={styles.input} 
            placeholder="Enter your full name" 
            placeholderTextColor={COLORS.textLight} 
            value={formData.name}
            onChangeText={(text) => handleFieldChange('name', text)}
            maxLength={50}
          />
          {formData.name.length > 0 && !errors.name && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          )}
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* CNIC */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>CNIC Number <Text style={styles.requiredStar}>*</Text></Text>
        <View style={[styles.inputWrapper, errors.cnic ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="card-outline" size={20} color={errors.cnic ? COLORS.danger : COLORS.primary} />
          <TextInput 
            style={styles.input} 
            placeholder="12345-1234567-1" 
            placeholderTextColor={COLORS.textLight} 
            keyboardType="number-pad"
            maxLength={15}
            value={formData.cnic}
            onChangeText={(text) => handleFieldChange('cnic', text)}
          />
          {formData.cnic.replace(/-/g, '').length === 13 && !errors.cnic && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          )}
        </View>
        {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
      </View>

      {/* ─── CDA CARD - Auto RB suffix ────────────────────────────────────── */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>CDA Card Number <Text style={styles.requiredStar}>*</Text></Text>
        <View style={[styles.inputWrapper, errors.cdaCard ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="id-card-outline" size={20} color={errors.cdaCard ? COLORS.danger : COLORS.primary} />
          <TextInput 
            style={styles.input} 
            placeholder="Enter 4 digits (e.g., 1234)" 
            placeholderTextColor={COLORS.textLight} 
            keyboardType="number-pad"
            maxLength={4}
            value={formData.cdaCard}
            onChangeText={(text) => handleFieldChange('cdaCard', text)}
          />
          {formData.cdaCard.length === 4 && !errors.cdaCard && (
            <View style={styles.cdaSuffixContainer}>
              <Text style={styles.cdaSuffix}>-RB</Text>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={{ marginLeft: 4 }} />
            </View>
          )}
          {formData.cdaCard.length === 4 && !errors.cdaCard && (
            <View style={styles.cdaPreview}>
              <Text style={styles.cdaPreviewText}>{formData.cdaCard}-RB</Text>
            </View>
          )}
        </View>
        {errors.cdaCard && <Text style={styles.errorText}>{errors.cdaCard}</Text>}
        {formData.cdaCard.length === 4 && !errors.cdaCard && (
          <View style={styles.cdaHelpContainer}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.primary} />
            <Text style={styles.cdaHelpText}>Your CDA Card: <Text style={styles.cdaHelpHighlight}>{formData.cdaCard}-RB</Text></Text>
          </View>
        )}
      </View>

      {/* Date of Birth */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Birth <Text style={styles.requiredStar}>*</Text></Text>
        <TouchableOpacity 
          style={[styles.dobWrapper, errors.dob ? styles.inputError : (isDobSelected ? styles.dobSelected : styles.dobDefault)]} 
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.dobLeft}>
            <Ionicons name="calendar-outline" size={20} color={errors.dob ? COLORS.danger : (isDobSelected ? COLORS.primary : COLORS.textLight)} />
            <Text style={[styles.dobText, isDobSelected ? styles.dobTextSelected : styles.dobTextPlaceholder, errors.dob && styles.dobTextError]}>
              {dobText}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
      </View>

      {/* Mobile Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mobile Number <Text style={styles.requiredStar}>*</Text></Text>
        <View style={[styles.inputWrapper, errors.phone ? styles.inputError : styles.inputDefault]}>
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCode}>+92</Text>
            <View style={styles.countryDivider} />
          </View>
          <TextInput 
            style={[styles.input, styles.phoneInput]} 
            placeholder="3XXXXXXXXX" 
            placeholderTextColor={COLORS.textLight} 
            keyboardType="number-pad"
            maxLength={10}
            value={formData.phone}
            onChangeText={(text) => handleFieldChange('phone', text)}
          />
          {formData.phone.length === 10 && !errors.phone && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          )}
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address <Text style={styles.requiredStar}>*</Text></Text>
        <View style={[styles.inputWrapper, errors.email ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="mail-outline" size={20} color={errors.email ? COLORS.danger : COLORS.primary} />
          <TextInput 
            style={styles.input} 
            placeholder="you@example.com" 
            placeholderTextColor={COLORS.textLight} 
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleFieldChange('email', text)}
          />
          {formData.email.length > 0 && !errors.email && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          )}
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Create Password <Text style={styles.requiredStar}>*</Text></Text>
        <View style={[styles.inputWrapper, errors.password ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="lock-closed-outline" size={20} color={errors.password ? COLORS.danger : COLORS.primary} />
          <TextInput 
            ref={passwordInputRef}
            style={styles.input} 
            placeholder="Create a strong password" 
            placeholderTextColor={COLORS.textLight} 
            secureTextEntry={!formData.showPassword}
            value={formData.password}
            onChangeText={(text) => handleFieldChange('password', text)}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            maxLength={30}
            autoComplete="off"
            textContentType="none"
          />
          <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}>
            <Ionicons name={formData.showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Confirm Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm Password <Text style={styles.requiredStar}>*</Text></Text>
        <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="lock-closed-outline" size={20} color={errors.confirmPassword ? COLORS.danger : COLORS.primary} />
          <TextInput 
            ref={confirmPasswordInputRef}
            style={styles.input} 
            placeholder="Confirm your password" 
            placeholderTextColor={COLORS.textLight} 
            secureTextEntry={!formData.showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(text) => handleFieldChange('confirmPassword', text)}
            returnKeyType="done"
            maxLength={30}
            autoComplete="off"
            textContentType="none"
          />
          <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}>
            <Ionicons name={formData.showConfirmPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        {formData.password.length > 0 && formData.confirmPassword.length > 0 && !errors.confirmPassword && formData.password === formData.confirmPassword && (
          <View style={styles.passwordMatchContainer}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={[styles.passwordMatchText, { color: COLORS.success }]}>Passwords match</Text>
          </View>
        )}
      </View>

      {/* Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address <Text style={[styles.optionalText, { color: COLORS.textSecondary }]}>(Optional)</Text></Text>
        <View style={[styles.inputWrapper, styles.inputDefault]}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <TextInput 
            style={styles.input} 
            placeholder="Your residential address" 
            placeholderTextColor={COLORS.textLight} 
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            maxLength={100}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.nextGradient}>
          <Text style={styles.nextText}>CONTINUE</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Date Picker Modal */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent animationType="fade">
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
            <View style={[styles.pickerContainer, styles.pickerContainerShadow]}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date of Birth</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
                textColor={COLORS.text}
                style={styles.datePicker}
              />
              <TouchableOpacity onPress={() => setShowPicker(false)} style={[styles.pickerDoneBtn, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.pickerDoneText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

// ─── STEP 2: CNIC Verification ─────────────────────────────────────────────
// UPDATED: CNIC Frame - Horizontal/Landscape (Pakistani CNIC style)
// FIXED: Permission handling with Linking

const CnicVerificationStep = ({ formData, setFormData, onNext, onBack, showToast }) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontError, setFrontError] = useState('');
  const [backError, setBackError] = useState('');

  const pickImage = async (side) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please grant gallery access to upload images',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }}
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (side === 'front') {
        setFrontImage(result.assets[0].uri);
        setFrontError('');
      } else {
        setBackImage(result.assets[0].uri);
        setBackError('');
      }
    }
  };

  const takePhoto = async (side) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos. Please enable it in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }}
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (side === 'front') {
        setFrontImage(result.assets[0].uri);
        setFrontError('');
      } else {
        setBackImage(result.assets[0].uri);
        setBackError('');
      }
    }
  };

  const showImageOptions = (side) => {
    Alert.alert(
      'Upload CNIC Image',
      'Choose option',
      [
        { text: ' Take Photo', onPress: () => takePhoto(side) },
        { text: ' Choose from Gallery', onPress: () => pickImage(side) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleVerify = () => {
    let isValid = true;
    if (!frontImage) {
      setFrontError('Please upload front side of CNIC');
      isValid = false;
    }
    if (!backImage) {
      setBackError('Please upload back side of CNIC');
      isValid = false;
    }

    if (!isValid) {
      if (showToast) {
        const errorMsg = !frontImage && !backImage 
          ? 'Please upload both sides of CNIC' 
          : !frontImage ? 'Please upload front side of CNIC' : 'Please upload back side of CNIC';
        showToast(errorMsg, 'error');
      }
      return;
    }

    setFormData({ ...formData, cnicFront: frontImage, cnicBack: backImage });
    onNext();
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>CNIC Verification</Text>
      <Text style={styles.stepSubtitle}>Upload both sides of your CNIC for verification</Text>

      {/* CNIC Front - Horizontal/Landscape Frame */}
      <View style={styles.uploadSection}>
        <Text style={styles.uploadLabel}>Front Side of CNIC <Text style={styles.requiredStar}>*</Text></Text>
        <TouchableOpacity 
          style={[styles.uploadBox, frontError && styles.uploadError]} 
          onPress={() => showImageOptions('front')}
          activeOpacity={0.7}
        >
          {frontImage ? (
            <View style={styles.uploadPreview}>
              <Image source={{ uri: frontImage }} style={styles.uploadImage} resizeMode="cover" />
              <View style={styles.uploadOverlay}>
                <Ionicons name="camera" size={24} color={COLORS.white} />
                <Text style={styles.uploadOverlayText}>Tap to change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.cnicFrameIcon}>
                <Ionicons name="card-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadPlaceholderText}>Tap to upload front side</Text>
              <Text style={styles.uploadPlaceholderSubtext}>JPG, PNG supported</Text>
              <View style={styles.cnicSizeHint}>
                <Ionicons name="scan-outline" size={14} color={COLORS.textLight} />
              </View>
            </View>
          )}
        </TouchableOpacity>
        {frontError && <Text style={styles.errorText}>{frontError}</Text>}
      </View>

      {/* CNIC Back - Horizontal/Landscape Frame */}
      <View style={styles.uploadSection}>
        <Text style={styles.uploadLabel}>Back Side of CNIC <Text style={styles.requiredStar}>*</Text></Text>
        <TouchableOpacity 
          style={[styles.uploadBox, backError && styles.uploadError]} 
          onPress={() => showImageOptions('back')}
          activeOpacity={0.7}
        >
          {backImage ? (
            <View style={styles.uploadPreview}>
              <Image source={{ uri: backImage }} style={styles.uploadImage} resizeMode="cover" />
              <View style={styles.uploadOverlay}>
                <Ionicons name="camera" size={24} color={COLORS.white} />
                <Text style={styles.uploadOverlayText}>Tap to change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.cnicFrameIcon}>
                <Ionicons name="card-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadPlaceholderText}>Tap to upload back side</Text>
              <Text style={styles.uploadPlaceholderSubtext}>JPG, PNG supported</Text>
              <View style={styles.cnicSizeHint}>
                <Ionicons name="scan-outline" size={14} color={COLORS.textLight} />
              </View>
            </View>
          )}
        </TouchableOpacity>
        {backError && <Text style={styles.errorText}>{backError}</Text>}
      </View>

      <View style={styles.verificationNotice}>
        <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
        <Text style={styles.verificationNoticeText}>
          Your CNIC will be verified within 24 hours. You'll receive a notification once verified.
        </Text>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity style={styles.backButtonStep} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.verifyGradient}>
            <Text style={styles.verifyText}>VERIFY & CONTINUE</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── STEP 3: Account Created ───────────────────────────────────────────────

const AccountCreatedStep = ({ formData, onComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleViewProfile = async () => {
    setLoading(true);
    try {
      const userData = {
        ...formData,
        cdaCardFull: formData.cdaCard ? `${formData.cdaCard}-RB` : '',
        isVerified: false,
        joinDate: new Date().toISOString(),
        role: 'patient',
        accountStatus: 'active'
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userRole', 'patient');

      setLoading(false);
      onComplete(userData);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save account. Please try again.');
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.successIconContainer}>
        <LinearGradient colors={[COLORS.success, COLORS.secondary]} style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color={COLORS.white} />
        </LinearGradient>
      </View>

      <Text style={styles.successTitle}>Account Created Successfully!</Text>
      <Text style={styles.successSubtitle}>Your SehatLine account has been created. Please complete your profile to get started.</Text>

      <View style={styles.accountSummary}>
        <Text style={styles.summaryTitle}>Account Details</Text>
        
        <View style={styles.summaryItem}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Name</Text>
          <Text style={styles.summaryValue}>{formData.name}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="card-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>CNIC</Text>
          <Text style={styles.summaryValue}>{formData.cnic}</Text>
        </View>

        <View style={[styles.summaryItem, styles.highlightItem]}>
          <Ionicons name="id-card" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>CDA Card</Text>
          <Text style={[styles.summaryValue, styles.highlightValue]}>{formData.cdaCard}-RB</Text>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Phone</Text>
          <Text style={styles.summaryValue}>+92 {formData.phone}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Date of Birth</Text>
          <Text style={styles.summaryValue}>{formData.dob}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>Email</Text>
          <Text style={styles.summaryValue}>{formData.email}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <Ionicons name="time-outline" size={16} color={COLORS.warning} />
            <Text style={[styles.statusText, { color: COLORS.warning }]}>Pending Verification</Text>
          </View>
          <Text style={styles.statusSubtext}>Your account will be fully activated after CNIC verification</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.profileButtonMain} onPress={handleViewProfile} disabled={loading}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.profileGradient}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Ionicons name="person-circle-outline" size={24} color={COLORS.white} />
              <Text style={styles.profileButtonText}>VIEW MY PROFILE</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ─── MAIN SIGNUP SCREEN ─────────────────────────────────────────────────────

const SignupScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    cdaCard: '',
    dob: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    showPassword: false,
    showConfirmPassword: false,
    cnicFront: null,
    cnicBack: null,
  });
  const [errors, setErrors] = useState({});
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    setToast({ visible: true, message, type });
    
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  const handleComplete = useCallback((userData) => {
    navigation.replace('ProfileScreen', {
      userData: userData,
      fromSignup: true
    });
  }, [navigation]);

  const steps = useMemo(() => [
    { component: PersonalInfoStep },
    { component: CnicVerificationStep },
    { component: AccountCreatedStep },
  ], []);

  const CurrentStepComponent = steps[currentStep].component;

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
            onHide={() => setToast(prev => ({ ...prev, visible: false }))}
          />

          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"} 
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
              <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={true}
              >

                {currentStep === 0 ? (
                  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.backButtonPlaceholder} />
                )}

                <View style={styles.logoSection}>
                  <View style={[styles.logoCircle, { borderColor: COLORS.primary }]}>
                    <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
                  </View>
                  <Text style={styles.appName}>
                    SEHAT<Text style={styles.appNameWhite}>LINE</Text>
                  </Text>
                </View>

                <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

                <View style={styles.stepWrapper}>
                  <CurrentStepComponent
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    onNext={handleNext}
                    onBack={handleBack}
                    onComplete={handleComplete}
                    showToast={showToast}
                  />
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
    paddingTop: 10,
  },

  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  toastGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
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
    color: COLORS.white,
  },

  backButton: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    width: 60,
  },
  backButtonPlaceholder: {
    height: Platform.OS === 'ios' ? 45 : 35,
  },

  logoSection: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    marginTop: 6,
  },
  appNameWhite: {
    color: COLORS.text,
  },

  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressStepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepCompleted: {
    backgroundColor: COLORS.success,
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  progressStepText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressStepTextActive: {
    color: COLORS.white,
  },
  progressLine: {
    width: 35,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 3,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.success,
  },
  progressLabel: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },

  stepWrapper: {
    paddingHorizontal: 16,
    flex: 1,
  },
  stepContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },

  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 5,
    marginLeft: 4,
  },
  requiredStar: {
    color: COLORS.danger,
    fontSize: 14,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: 'normal',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
  },
  inputDefault: {
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    marginLeft: 10,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  phoneInput: {
    marginLeft: 6,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 3,
    marginLeft: 8,
  },

  // ─── CDA Card Styles ─────────────────────────────────────────────────────
  cdaSuffixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cdaSuffix: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cdaPreview: {
    marginLeft: 4,
  },
  cdaPreviewText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cdaHelpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 8,
    gap: 4,
  },
  cdaHelpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cdaHelpHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },

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

  dobWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
  },
  dobDefault: {
    borderColor: COLORS.border,
  },
  dobSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  dobLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobText: {
    fontSize: 14,
    marginLeft: 10,
  },
  dobTextPlaceholder: {
    color: COLORS.textLight,
  },
  dobTextSelected: {
    color: COLORS.text,
  },
  dobTextError: {
    color: COLORS.danger,
  },

  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginLeft: 8,
    gap: 5,
  },
  passwordMatchText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ─── CNIC Upload - Horizontal/Landscape Frame (Pakistani CNIC) ──────
  uploadSection: {
    marginBottom: 18,
  },
  uploadLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  uploadBox: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadError: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  uploadPlaceholderText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  uploadPlaceholderSubtext: {
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  uploadPreview: {
    flex: 1,
    position: 'relative',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlayText: {
    color: COLORS.white,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  cnicFrameIcon: {
    width: 60,
    height: 45,
    borderRadius: 6,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
  },
  cnicSizeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  cnicSizeHintText: {
    fontSize: 11,
    color: COLORS.textLight,
  },

  verificationNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    gap: 10,
  },
  verificationNoticeText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },

  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    ...SHADOWS.button,
  },
  nextGradient: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  stepButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  backButtonStep: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  verifyGradient: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  verifyText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  successIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },

  accountSummary: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 8,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  highlightItem: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 6,
    paddingHorizontal: 6,
    marginVertical: 2,
    borderBottomWidth: 0,
  },
  highlightValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.warning + '10',
    borderRadius: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusSubtext: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },

  profileButtonMain: {
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  profileGradient: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  profileButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    width: width * 0.9,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerContainerShadow: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  datePicker: {
    height: 180,
  },
  pickerDoneBtn: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  pickerDoneText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SignupScreen;