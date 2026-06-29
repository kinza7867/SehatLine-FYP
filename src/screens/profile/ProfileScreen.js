import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, StatusBar, SafeAreaView,
  Platform, Alert, Dimensions, Modal, TextInput,
  KeyboardAvoidingView, ActivityIndicator,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const ProfileScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'patient',
    profileImage: null,
    joinDate: '',
    age: '',
    address: '',
    cdaCard: '',
    cnic: '',
    dob: '',
    isVerified: false,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    address: '',
  });

  useEffect(() => {
    loadUserData();
    const unsubscribe = navigation.addListener('focus', () => loadUserData());
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Calculate age from DOB
        let calculatedAge = data.age || '';
        if (data.dob) {
          const dob = new Date(data.dob);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          calculatedAge = age.toString();
        }

        const updatedUser = {
          name: data.name || 'User',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'patient',
          profileImage: data.profileImage || null,
          joinDate: data.joinDate || new Date().toLocaleDateString(),
          age: calculatedAge,
          address: data.address || '',
          cdaCard: data.cdaCard || data.cdaCardOfficial || '',
          cnic: data.cnic || '',
          dob: data.dob || '',
          isVerified: data.isVerified || false,
        };
        setUser(updatedUser);
        setEditForm({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          age: updatedUser.age || '',
          address: updatedUser.address || '',
        });
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
    setLoading(false);
  };

  const saveUserDataToStorage = async (updatedUser) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.log('Error saving user data:', error);
      return false;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant gallery access');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const updatedUser = { ...user, profileImage: result.assets[0].uri };
      setUser(updatedUser);
      await saveUserDataToStorage(updatedUser);
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const updatedUser = { ...user, profileImage: result.assets[0].uri };
      setUser(updatedUser);
      await saveUserDataToStorage(updatedUser);
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Profile Picture', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleEditProfile = () => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      age: user.age || '',
      address: user.address || '',
    });
    setEditModalVisible(true);
  };

  const saveProfileChanges = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!editForm.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!editForm.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setSaving(true);
    
    try {
      const updatedUser = { 
        ...user, 
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        age: editForm.age,
        address: editForm.address,
      };
      
      const success = await saveUserDataToStorage(updatedUser);
      
      if (success) {
        setUser(updatedUser);
        setEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
        await loadUserData();
      } else {
        Alert.alert('Error', 'Failed to save changes. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userData');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('isLoggedIn');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const navigateTo = (screen, params = {}) => {
    if (!screen) {
      Alert.alert('Coming Soon', 'This feature is being updated.');
      return;
    }
    navigation.navigate(screen, { ...params, userData: user });
  };

  // Quick Actions
  const mainMenuItems = [
    { 
      id: 'book-appointment',
      name: 'Book Appointment', 
      icon: 'calendar-outline', 
      screen: 'BookAppointmentScreen', 
      desc: 'Schedule new appointment',
      color: '#10B981',
      bgColor: '#10B98115',
    },
    { 
      id: 'generate-token',
      name: 'Generate Token', 
      icon: 'ticket-outline', 
      screen: 'GenerateTokenScreen', 
      desc: 'Get queue token',
      color: '#8B5CF6',
      bgColor: '#8B5CF615',
    },
    { 
      id: 'live-queue',
      name: 'Live Queue', 
      icon: 'timer-outline', 
      screen: 'LiveTokenQueueScreen', 
      desc: 'Check queue position',
      color: '#F59E0B',
      bgColor: '#F59E0B15',
    },
    { 
      id: 'my-reports',
      name: 'My Reports', 
      icon: 'document-text-outline', 
      screen: 'ReportsListScreen', 
      desc: 'View reports & prescriptions',
      color: '#EF4444',
      bgColor: '#EF444415',
    },
  ];

  // Health & Records - with Health Metrics added
  const healthMenuItems = [
    { 
      id: 'appointments',
      name: 'Appointment History', 
      icon: 'list-outline', 
      screen: 'AppointmentList', 
      desc: 'View past appointments',
      color: '#3B82F6',
      bgColor: '#3B82F615',
      params: { tab: 'past' } // Directly past tab
    },
    { 
      id: 'prescriptions',
      name: 'My Prescriptions', 
      icon: 'document-text-outline', 
      screen: 'MyPrescriptionsScreen', 
      desc: 'View all prescriptions',
      color: '#8B5CF6',
      bgColor: '#8B5CF615',
    },
    { 
      id: 'lab-reports',
      name: 'Lab Reports', 
      icon: 'flask-outline', 
      screen: 'ReportsListScreen', 
      desc: 'Test results & reports',
      color: '#10B981',
      bgColor: '#10B98115',
    },
    { 
      id: 'health-metrics',
      name: 'Health Metrics', 
      icon: 'pulse-outline', 
      screen: 'HealthMetricsScreen', 
      desc: 'Track BP, Sugar, Weight',
      color: '#EF4444',
      bgColor: '#EF444415',
    },
  ];

  // Hospital Services
  const hospitalMenuItems = [
    { 
      id: 'chronic-opd',
      name: 'Chronic OPD', 
      icon: 'medical-outline', 
      screen: 'ChronicDashboardScreen', 
      desc: 'Chronic disease care',
      color: '#8B5CF6',
      bgColor: '#8B5CF615',
    },
    { 
      id: 'laboratory',
      name: 'Laboratory', 
      icon: 'flask-outline', 
      screen: 'LabDashboardScreen', 
      desc: 'Tests & reports',
      color: '#10B981',
      bgColor: '#10B98115',
    },
    { 
      id: 'pharmacy',
      name: 'Pharmacy', 
      icon: 'medkit-outline', 
      screen: 'PharmacyDashboardScreen', 
      desc: 'Medicine collection',
      color: '#F59E0B',
      bgColor: '#F59E0B15',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.loadingGradient} />
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!user.name) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient colors={[COLORS.primary, COLORS.secondary, COLORS.background]} style={styles.gradientBackground} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.noDataContainer}>
            <Ionicons name="person-circle-outline" size={80} color={COLORS.textLight} />
            <Text style={styles.noDataText}>Guest Mode</Text>
            <Text style={styles.noDataSub}>Please login to access your profile</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.replace('Login')}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.loginGradient}>
                <Text style={styles.loginButtonText}>Go to Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient colors={[COLORS.secondary, COLORS.primary + '10', COLORS.background]} style={styles.gradientBackground} />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.titleWrap}>
                <Text style={styles.headerTitle}>My Profile</Text>
                <Text style={styles.headerSub}>{user.role?.toUpperCase() || 'Patient'}</Text>
              </View>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigateTo('SettingsScreen')}>
                <Ionicons name="settings-outline" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            bounces={true}
          >
            {/* Profile Hero Card */}
            <View style={styles.heroWrap}>
              <LinearGradient 
                colors={[COLORS.white, COLORS.backgroundSecondary]} 
                style={[styles.heroCard, styles.cardShadow]}
              >
                <TouchableOpacity style={styles.editIconTop} onPress={handleEditProfile}>
                  <LinearGradient 
                    colors={[COLORS.primary, COLORS.secondary]} 
                    style={styles.editIconGradient}
                  >
                    <Ionicons name="create-outline" size={18} color={COLORS.white} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={showImagePickerOptions} style={styles.avatarWrap}>
                  {user.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarRing}>
                      <View style={styles.avatarInner}>
                        <Ionicons name="person" size={50} color={COLORS.primary} />
                      </View>
                    </View>
                  )}
                  <View style={styles.avatarEdit}>
                    <Ionicons name="camera" size={14} color={COLORS.white} />
                  </View>
                </TouchableOpacity>

                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>

                <View style={styles.verificationContainer}>
                  {user.isVerified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={[styles.verifiedText, { color: COLORS.success }]}>Verified Patient</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <Ionicons name="time-outline" size={16} color={COLORS.warning} />
                      <Text style={[styles.verifiedText, { color: COLORS.warning }]}>Pending Verification</Text>
                    </View>
                  )}
                </View>

                {user.cdaCard && (
                  <View style={styles.cdaCardContainer}>
                    <LinearGradient
                      colors={[COLORS.primary + '15', COLORS.secondary + '10']}
                      style={styles.cdaCardBadge}
                    >
                      <Ionicons name="id-card" size={16} color={COLORS.primary} />
                      <Text style={styles.cdaCardLabel}>CDA Card</Text>
                      <Text style={styles.cdaCardNumber}>{user.cdaCard}</Text>
                    </LinearGradient>
                  </View>
                )}

                {/* Sirf Signup Data - Removed Blood Group & Emergency */}
                <View style={styles.userInfoContainer}>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{user.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>DOB:</Text>
                    <Text style={styles.infoValue}>{user.dob || 'Not provided'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>Age:</Text>
                    <Text style={styles.infoValue}>{user.age || 'Not provided'} years</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="card-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>CNIC:</Text>
                    <Text style={styles.infoValue}>{user.cnic || 'Not provided'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>{user.address || 'Not provided'}</Text>
                  </View>
                </View>

                <View style={styles.affiliationCard}>
                  <View style={styles.hospitalLogoCircle}>
                    <Image source={require('../../../assets/logo.png')} style={styles.hospitalLogo} resizeMode="cover" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.affiliationLabel, { color: COLORS.primary }]}>
                      {user.role === 'doctor' ? 'DOCTOR' : user.role === 'admin' ? 'ADMINISTRATOR' : 'VERIFIED PATIENT'}
                    </Text>
                    <Text style={styles.affiliationName}>CDA Hospital, Islamabad</Text>
                    <Text style={styles.affiliationSub}>Healthcare Partner</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.menuGrid}>
                {mainMenuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.gridItem, styles.cardShadow]}
                    onPress={() => navigateTo(item.screen, { userData: user })}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.gridIconWrap, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon} size={24} color={item.color} />
                    </View>
                    <Text style={styles.gridItemName}>{item.name}</Text>
                    <Text style={styles.gridItemDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Health & Records - with Health Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health & Records</Text>
              <View style={styles.menuList}>
                {healthMenuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, styles.cardShadow]}
                    onPress={() => navigateTo(item.screen, { ...item.params, userData: user })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconWrap, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon} size={22} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuTitle}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hospital Services */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hospital Services</Text>
              <View style={styles.menuList}>
                {hospitalMenuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, styles.cardShadow]}
                    onPress={() => navigateTo(item.screen, { userData: user })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconWrap, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon} size={22} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuTitle}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.7}>
                <LinearGradient colors={[COLORS.danger + '20', COLORS.danger + '05']} style={styles.logoutGradient}>
                  <View style={styles.logoutIconWrap}>
                    <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logoutTitle}>Sign Out</Text>
                    <Text style={styles.logoutSub}>Securely logout from your account</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.danger} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>SehatLine v2.0.0 | CDA Healthcare Portal</Text>
            <View style={{ height: hp(10) }} />
          </ScrollView>

          {/* Bottom Navigation */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomTab} onPress={() => navigateTo('HomeScreen')}>
              <Ionicons name="home-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.bottomLabel}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bottomTab} onPress={() => navigateTo('BookAppointmentScreen')}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.bottomLabel}>Book</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bottomTabCenter} onPress={() => navigateTo('GenerateTokenScreen')}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.bottomCenterCircle}>
                <Ionicons name="ticket-outline" size={24} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bottomTab} onPress={() => navigateTo('LiveTokenQueueScreen')}>
              <Ionicons name="timer-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.bottomLabel}>Queue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bottomTab}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
              <Text style={[styles.bottomLabel, styles.activeLabel]}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Profile Modal - Updated */}
          <Modal 
            visible={editModalVisible} 
            animationType="slide" 
            transparent={true}
            onRequestClose={() => setEditModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <KeyboardAvoidingView 
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                  style={styles.modalContainer}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                >
                  <View style={[styles.modalContent, styles.cardShadow]}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Edit Profile</Text>
                      <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                        <Ionicons name="close" size={26} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView 
                      showsVerticalScrollIndicator={false} 
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={styles.modalScrollContent}
                    >
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder="Enter your full name" 
                          placeholderTextColor={COLORS.textLight} 
                          value={editForm.name} 
                          onChangeText={(text) => setEditForm({ ...editForm, name: text })} 
                          returnKeyType="next"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address *</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder="Enter your email" 
                          placeholderTextColor={COLORS.textLight} 
                          value={editForm.email} 
                          onChangeText={(text) => setEditForm({ ...editForm, email: text })} 
                          keyboardType="email-address" 
                          autoCapitalize="none"
                          returnKeyType="next"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder="Enter your phone number" 
                          placeholderTextColor={COLORS.textLight} 
                          value={editForm.phone} 
                          onChangeText={(text) => setEditForm({ ...editForm, phone: text })} 
                          keyboardType="phone-pad"
                          returnKeyType="next"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Age</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder="Enter your age" 
                          placeholderTextColor={COLORS.textLight} 
                          value={editForm.age} 
                          onChangeText={(text) => setEditForm({ ...editForm, age: text })} 
                          keyboardType="numeric"
                          returnKeyType="next"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput 
                          style={[styles.input, styles.textArea]} 
                          placeholder="Enter your address" 
                          placeholderTextColor={COLORS.textLight} 
                          value={editForm.address} 
                          onChangeText={(text) => setEditForm({ ...editForm, address: text })} 
                          multiline 
                          numberOfLines={2}
                          textAlignVertical="top"
                          returnKeyType="done"
                          onSubmitEditing={saveProfileChanges}
                        />
                      </View>

                      <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={saveProfileChanges}
                        disabled={saving}
                      >
                        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.saveGradient}>
                          {saving ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                          ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <View style={styles.modalFooterSpacing} />
                    </ScrollView>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradientBackground: { 
    ...StyleSheet.absoluteFillObject 
  },
  safeArea: { 
    flex: 1 
  },

  cardShadow: { 
    ...SHADOWS.medium 
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '600',
    marginTop: hp(2),
  },

  headerContainer: { 
    paddingBottom: hp(1) 
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
    paddingBottom: hp(1.5),
  },
  headerBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  titleWrap: { 
    flex: 1, 
    alignItems: 'center' 
  },
  headerTitle: { 
    color: COLORS.white, 
    fontSize: wp(4.5), 
    fontWeight: '800' 
  },
  headerSub: { 
    color: COLORS.white, 
    fontSize: wp(2.8), 
    opacity: 0.8, 
    marginTop: hp(0.2) 
  },

  scrollContent: { 
    paddingBottom: hp(10),
    paddingTop: hp(0.5),
  },

  heroWrap: { 
    paddingHorizontal: wp(4), 
    marginTop: hp(1.5), 
    marginBottom: hp(2) 
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(6),
    padding: wp(5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  
  editIconTop: {
    position: 'absolute',
    top: wp(3),
    right: wp(3),
    zIndex: 10,
  },
  editIconGradient: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },

  avatarWrap: { 
    position: 'relative', 
    marginBottom: hp(1) 
  },
  avatarRing: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarInner: {
    width: wp(22.5),
    height: wp(22.5),
    borderRadius: wp(11.25),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  name: { 
    color: COLORS.text, 
    fontSize: wp(6), 
    fontWeight: '800', 
    textAlign: 'center' 
  },
  email: { 
    color: COLORS.textSecondary, 
    fontSize: wp(3.5), 
    marginTop: hp(0.5) 
  },

  verificationContainer: {
    marginVertical: hp(0.5),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  verifiedText: {
    fontSize: wp(3),
    fontWeight: '600',
  },

  cdaCardContainer: {
    width: '100%',
    marginVertical: hp(0.5),
  },
  cdaCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    justifyContent: 'center',
    gap: wp(1.5),
  },
  cdaCardLabel: {
    color: COLORS.primary,
    fontSize: wp(2.8),
    fontWeight: '600',
  },
  cdaCardNumber: {
    color: COLORS.text,
    fontSize: wp(3.2),
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Sirf Signup Data - Removed Blood Group & Emergency
  userInfoContainer: {
    width: '100%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(3),
    padding: hp(1.2),
    marginBottom: hp(1),
    gap: hp(0.2),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  infoLabel: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    fontWeight: '600',
    width: wp(15),
  },
  infoValue: {
    fontSize: wp(2.8),
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },

  affiliationCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
    padding: hp(1.2),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hospitalLogoCircle: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  hospitalLogo: { 
    width: wp(12), 
    height: wp(12) 
  },
  affiliationLabel: { 
    fontSize: wp(2.5), 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  affiliationName: { 
    color: COLORS.text, 
    fontSize: wp(3.5), 
    fontWeight: '700', 
    marginTop: hp(0.2) 
  },
  affiliationSub: { 
    color: COLORS.textSecondary, 
    fontSize: wp(2.8), 
    marginTop: hp(0.2) 
  },

  section: { 
    paddingHorizontal: wp(4), 
    marginBottom: hp(2.5) 
  },
  sectionTitle: { 
    color: COLORS.text, 
    fontSize: wp(4.5), 
    fontWeight: '800', 
    marginBottom: hp(1.5) 
  },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: hp(1.2),
  },
  gridItem: {
    width: (width - wp(12)) / 2,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridIconWrap: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  gridItemName: {
    color: COLORS.text,
    fontSize: wp(3.5),
    fontWeight: '700',
    textAlign: 'center',
  },
  gridItemDesc: {
    color: COLORS.textSecondary,
    fontSize: wp(2.5),
    textAlign: 'center',
    marginTop: hp(0.2),
  },

  menuList: { 
    gap: hp(1) 
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(3.5),
    gap: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuIconWrap: {
    width: wp(11.5),
    height: wp(11.5),
    borderRadius: wp(3.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { 
    color: COLORS.text, 
    fontSize: wp(3.8), 
    fontWeight: '700' 
  },
  menuDesc: { 
    color: COLORS.textSecondary, 
    fontSize: wp(3), 
    marginTop: hp(0.2) 
  },

  logoutCard: { 
    borderRadius: wp(4), 
    overflow: 'hidden' 
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    gap: wp(3),
    borderWidth: 1,
    borderColor: COLORS.danger + '40',
    borderRadius: wp(4),
  },
  logoutIconWrap: {
    width: wp(11.5),
    height: wp(11.5),
    borderRadius: wp(3.5),
    backgroundColor: COLORS.danger + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTitle: { 
    color: COLORS.danger, 
    fontSize: wp(3.8), 
    fontWeight: '800' 
  },
  logoutSub: { 
    color: COLORS.textSecondary, 
    fontSize: wp(3), 
    marginTop: hp(0.2) 
  },

  versionText: { 
    color: COLORS.textLight, 
    fontSize: wp(2.8), 
    textAlign: 'center', 
    marginTop: hp(2) 
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: hp(0.8),
    paddingBottom: Platform.OS === 'ios' ? hp(3) : hp(1),
    paddingHorizontal: wp(1.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  bottomTab: { 
    flex: 1, 
    alignItems: 'center', 
    gap: hp(0.2) 
  },
  bottomTabCenter: { 
    flex: 1, 
    alignItems: 'center', 
    marginTop: -hp(2.5) 
  },
  bottomCenterCircle: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    ...SHADOWS.large,
  },
  bottomLabel: { 
    color: COLORS.textSecondary, 
    fontSize: wp(2.5), 
    fontWeight: '600' 
  },
  activeLabel: { 
    color: COLORS.primary, 
    fontWeight: '800' 
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 40 : 20,
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    marginHorizontal: wp(5),
    maxHeight: height * 0.9,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: wp(6),
    padding: wp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: height * 0.85,
  },
  modalScrollContent: {
    paddingBottom: hp(2),
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: hp(2) 
  },
  modalTitle: { 
    color: COLORS.text, 
    fontSize: wp(5.5), 
    fontWeight: 'bold' 
  },
  modalFooterSpacing: {
    height: hp(1),
  },

  inputGroup: { 
    marginBottom: hp(1.5) 
  },
  inputLabel: { 
    color: COLORS.textSecondary, 
    fontSize: wp(3.2), 
    fontWeight: '600', 
    marginBottom: hp(0.5) 
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    color: COLORS.text,
    fontSize: wp(3.8),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { 
    height: hp(8), 
    textAlignVertical: 'top',
    paddingTop: wp(3.5),
  },

  saveButton: { 
    marginTop: hp(2), 
    borderRadius: wp(3.5), 
    overflow: 'hidden' 
  },
  saveGradient: { 
    padding: hp(1.5), 
    alignItems: 'center' 
  },
  saveButtonText: { 
    color: COLORS.white, 
    fontSize: wp(4.2), 
    fontWeight: 'bold' 
  },

  noDataContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: wp(5) 
  },
  noDataText: { 
    color: COLORS.text, 
    fontSize: wp(5), 
    fontWeight: 'bold', 
    marginTop: hp(1.5) 
  },
  noDataSub: { 
    color: COLORS.textSecondary, 
    fontSize: wp(3.5), 
    marginTop: hp(0.8), 
    textAlign: 'center' 
  },
  loginButton: { 
    marginTop: hp(2), 
    borderRadius: wp(3.5), 
    overflow: 'hidden' 
  },
  loginGradient: { 
    paddingHorizontal: wp(8), 
    paddingVertical: hp(1.5) 
  },
  loginButtonText: { 
    color: COLORS.white, 
    fontSize: wp(4), 
    fontWeight: 'bold' 
  },
});

export default ProfileScreen;