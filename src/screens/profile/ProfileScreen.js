import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, StatusBar, SafeAreaView, ImageBackground,
  Platform, Alert, Dimensions, Modal, TextInput,
  KeyboardAvoidingView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

/* ============================================================================
   THEME
============================================================================ */
const C = {
  bg:            '#0A1520',
  card:          'rgba(0, 0, 0, 0.55)',
  cardAlt:       'rgba(0, 0, 0, 0.45)',
  primary:       '#04e1f5',
  primaryDeep:   '#0284c7',
  primarySoft:   'rgba(4, 225, 245, 0.15)',
  primaryTint:   'rgba(4, 225, 245, 0.10)',
  accent:        '#FFB800',
  accentSoft:    'rgba(255, 184, 0, 0.15)',
  emergency:     '#FF4D4D',
  emergencySoft: 'rgba(255, 77, 77, 0.15)',
  text:          '#FFFFFF',
  textSub:       '#B2DFDB',
  textMuted:     '#94A3B8',
  borderSoft:    'rgba(4, 225, 245, 0.15)',
  white:         '#FFFFFF',
  overlayDark:   'rgba(11, 31, 28, 0.55)',
};

const HEADER_TOP_PADDING =
  Platform.OS === 'ios' ? 6 : (StatusBar.currentHeight || 24) + 4;

const ProfileScreen = ({ navigation, route }) => {
  // State for logged-in user data
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'patient',
    profileImage: null,
    joinDate: '',
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    age: '',
    address: '',
    emergencyContact: '',
  });

  // Load user data when screen opens
  useEffect(() => {
    loadUserData();
    
    // Reload when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      // First check if data was passed via navigation (from login/register)
      if (route?.params?.userData) {
        const data = route.params.userData;
        setUser({
          name: data.name || 'User',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'patient',
          profileImage: data.profileImage || null,
          joinDate: data.joinDate || new Date().toLocaleDateString(),
        });
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bloodGroup: data.bloodGroup || '',
          age: data.age || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
        });
        // Save to storage for persistence
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      } else {
        // Try to get from storage
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const data = JSON.parse(storedData);
          setUser(data);
          setEditForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            bloodGroup: data.bloodGroup || '',
            age: data.age || '',
            address: data.address || '',
            emergencyContact: data.emergencyContact || '',
          });
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  // Save updated user data
  const saveUserDataToStorage = async (updatedUser) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

  // Pick image from gallery
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
    }
  };

  // Take photo with camera
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
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup || '',
      age: user.age || '',
      address: user.address || '',
      emergencyContact: user.emergencyContact || '',
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

    const updatedUser = {
      ...user,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      bloodGroup: editForm.bloodGroup,
      age: editForm.age,
      address: editForm.address,
      emergencyContact: editForm.emergencyContact,
    };
    
    setUser(updatedUser);
    await saveUserDataToStorage(updatedUser);
    setEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const navigateToScreen = (screenName, params = {}) => {
    if (!screenName) return Alert.alert('Coming Soon', 'This section is being updated.');
    navigation.navigate(screenName, params);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            navigation.replace('Login');
          } 
        },
      ]
    );
  };

  // Menu items based on role
  const getPersonalMenu = () => {
    const commonMenu = [
      { name: 'Medical Records', icon: 'folder-open', screen: 'ReportsListScreen', desc: 'View your reports & prescriptions' },
      { name: 'My Appointments', icon: 'calendar', screen: 'AppointmentList', desc: 'View appointment history' },
      { name: 'Medicine Reminders', icon: 'notifications', screen: 'MedsReminderConfig', desc: 'Set daily medication alerts' },
      { name: 'Edit Profile', icon: 'create', screen: null, desc: 'Update your information', action: handleEditProfile },
    ];
    
    if (user.role === 'doctor') {
      return [
        { name: 'My Schedule', icon: 'calendar', screen: 'DoctorScheduleScreen', desc: 'Manage your availability' },
        { name: 'My Patients', icon: 'people', screen: 'AppointmentList', desc: 'View your patients' },
        ...commonMenu,
      ];
    }
    if (user.role === 'admin') {
      return [
        { name: 'Manage Doctors', icon: 'medkit', screen: 'DoctorListScreen', desc: 'Add, edit, remove doctors' },
        { name: 'Manage Patients', icon: 'people', screen: 'AppointmentList', desc: 'Patient registry' },
        { name: 'Announcements', icon: 'megaphone', screen: 'Announcements', desc: 'Publish hospital news' },
        ...commonMenu,
      ];
    }
    return commonMenu;
  };

  // Public hospital menu - visible to ALL users
  const hospitalMenu = [
    { name: 'About Hospital', icon: 'information-circle', screen: 'AboutHospitalScreen', desc: 'Hospital info & timings' },
    { name: 'Doctor Directory', icon: 'people-circle', screen: 'DoctorListScreen', desc: 'Browse all doctors' },
    { name: 'Departments', icon: 'grid', screen: 'HospitalDirectoryScreen', desc: 'All hospital departments' },
    { name: 'Contact & Location', icon: 'call', screen: 'ContactScreen', desc: 'Reach us anytime' },
  ];

  const personalMenu = getPersonalMenu();

  // If no user data (guest mode)
  if (!user.name) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ImageBackground
          source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.bgOverlay} />
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.noDataContainer}>
              <Ionicons name="person-circle" size={80} color={C.textMuted} />
              <Text style={styles.noDataText}>Guest Mode</Text>
              <Text style={styles.noDataSub}>Please login to access your profile</Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.replace('Login')}
              >
                <LinearGradient colors={[C.primary, C.primaryDeep]} style={styles.loginGradient}>
                  <Text style={styles.loginButtonText}>Go to Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <LinearGradient
            colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
            style={styles.headerGradient}
          >
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack?.()}>
                <Ionicons name="chevron-back" size={22} color={C.primary} />
              </TouchableOpacity>
              <View style={styles.titleWrap}>
                <Text style={styles.headerTitle}>My Profile</Text>
                <Text style={styles.headerSub}>
                  {user.role === 'doctor' ? 'Doctor Account' : user.role === 'admin' ? 'Admin Account' : 'Patient Account'}
                </Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigateToScreen('SettingsScreen')}>
                <Ionicons name="settings-outline" size={20} color={C.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Profile Hero - Shows ACTUAL USER NAME */}
            <View style={styles.heroWrap}>
              <LinearGradient
                colors={[C.primary + '40', 'rgba(0, 0, 0, 0.6)']}
                style={styles.heroCard}
              >
                <TouchableOpacity onPress={showImagePickerOptions} style={styles.avatarWrap}>
                  {user.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarRing}>
                      <View style={styles.avatarInner}>
                        <Ionicons
                          name={user.role === 'doctor' ? 'medkit' : user.role === 'admin' ? 'shield' : 'person'}
                          size={50}
                          color={C.primary}
                        />
                      </View>
                    </View>
                  )}
                  <View style={[styles.avatarEdit, { backgroundColor: C.primary }]}>
                    <Ionicons name="camera" size={14} color={C.white} />
                  </View>
                </TouchableOpacity>
                
                {/* THIS SHOWS THE LOGGED-IN USER'S NAME */}
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.phone || 'Not set'}</Text>
                    <Text style={styles.statLabel}>Phone</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.role?.toUpperCase()}</Text>
                    <Text style={styles.statLabel}>Role</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.joinDate}</Text>
                    <Text style={styles.statLabel}>Joined</Text>
                  </View>
                </View>

                {/* Hospital Affiliation */}
                <View style={styles.affiliationCard}>
                  <View style={styles.hospitalLogoCircle}>
                    <Image
                      source={require('../../../assets/logo.png')}
                      style={styles.hospitalLogo}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.affiliationLabel, { color: C.primary }]}>
                      {user.role === 'doctor' ? 'DOCTOR' : user.role === 'admin' ? 'ADMINISTRATOR' : 'VERIFIED PATIENT'}
                    </Text>
                    <Text style={styles.affiliationName}>CDA Hospital, Islamabad</Text>
                    <Text style={styles.affiliationSub}>Healthcare Partner</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Personal Menu - Role Based */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {user.role === 'patient' ? 'My Health' : user.role === 'doctor' ? 'Practice Management' : 'Administration'}
              </Text>
              <View style={styles.menuList}>
                {personalMenu.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.menuItem}
                    onPress={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.screen) {
                        navigateToScreen(item.screen);
                      }
                    }}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon} size={22} color={C.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuTitle}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hospital Information - Public */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hospital Information</Text>
              <View style={styles.menuList}>
                {hospitalMenu.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.menuItem}
                    onPress={() => navigateToScreen(item.screen)}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon} size={22} color={C.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuTitle}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
                <LinearGradient
                  colors={['rgba(255, 77, 77, 0.25)', 'rgba(255, 77, 77, 0.05)']}
                  style={styles.logoutGradient}
                >
                  <View style={styles.logoutIconWrap}>
                    <Ionicons name="log-out" size={22} color={C.emergency} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logoutTitle}>Sign Out</Text>
                    <Text style={styles.logoutSub}>Securely logout from your account</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.emergency} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>SehatLine v2.0.0 | CDA Healthcare Portal</Text>
            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Bottom Tab Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomTab} onPress={() => navigation.navigate('HospitalHomeScreen')}>
              <Ionicons name="home" size={22} color={C.textSub} />
              <Text style={styles.bottomLabel}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomTab} onPress={() => navigateToScreen('BookAppointmentScreen')}>
              <Ionicons name="calendar" size={22} color={C.textSub} />
              <Text style={styles.bottomLabel}>Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomTabCenter} onPress={() => navigateToScreen('AISymptomCheckerScreen')}>
              <LinearGradient colors={[C.primary, C.primaryDeep]} style={styles.bottomCenterCircle}>
                <Ionicons name="medical" size={26} color={C.white} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomTab} onPress={() => navigateToScreen('LiveTokenQueueScreen')}>
              <Ionicons name="timer" size={22} color={C.textSub} />
              <Text style={styles.bottomLabel}>Queue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomTab}>
              <Ionicons name="person" size={24} color={C.primary} />
              <Text style={[styles.bottomLabel, styles.activeLabel]}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Profile Modal */}
          <Modal visible={editModalVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView behavior="padding" style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                      <Ionicons name="close" size={26} color={C.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        placeholderTextColor={C.textMuted}
                        value={editForm.name}
                        onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={C.textMuted}
                        value={editForm.email}
                        onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Phone Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor={C.textMuted}
                        value={editForm.phone}
                        onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                        keyboardType="phone-pad"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Blood Group (Optional)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., A+, B+, O+, AB+"
                        placeholderTextColor={C.textMuted}
                        value={editForm.bloodGroup}
                        onChangeText={(text) => setEditForm({ ...editForm, bloodGroup: text })}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Age (Optional)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your age"
                        placeholderTextColor={C.textMuted}
                        value={editForm.age}
                        onChangeText={(text) => setEditForm({ ...editForm, age: text })}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Address (Optional)</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter your address"
                        placeholderTextColor={C.textMuted}
                        value={editForm.address}
                        onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Emergency Contact (Optional)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Emergency contact number"
                        placeholderTextColor={C.textMuted}
                        value={editForm.emergencyContact}
                        onChangeText={(text) => setEditForm({ ...editForm, emergencyContact: text })}
                        keyboardType="phone-pad"
                      />
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={saveProfileChanges}>
                      <LinearGradient colors={[C.primary, C.primaryDeep]} style={styles.saveGradient}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlayDark },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: HEADER_TOP_PADDING,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.borderSoft,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { color: C.text, fontSize: 18, fontWeight: '800' },
  headerSub: { color: C.textSub, fontSize: 11, marginTop: 2 },

  scrollContent: { paddingBottom: 20 },

  heroWrap: { paddingHorizontal: 16, marginTop: 16, marginBottom: 22 },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1, borderColor: C.borderSoft,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 2, borderColor: C.primary,
  },
  avatarInner: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#001D3D',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: C.primary,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 4, right: 4,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#001D3D',
  },
  name: { color: C.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  email: { color: C.textSub, fontSize: 14, marginTop: 6, marginBottom: 16 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: C.text, fontSize: 14, fontWeight: '700' },
  statLabel: { color: C.textSub, fontSize: 10, marginTop: 4 },
  statDivider: { width: 1, height: 35, backgroundColor: C.borderSoft },

  affiliationCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  hospitalLogoCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: C.primary,
  },
  hospitalLogo: { width: 48, height: 48 },
  affiliationLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  affiliationName: { color: C.text, fontSize: 14, fontWeight: '700', marginTop: 2 },
  affiliationSub: { color: C.textSub, fontSize: 11, marginTop: 2 },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },

  menuList: { gap: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1, borderColor: C.borderSoft,
  },
  menuIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: C.primaryTint,
    justifyContent: 'center', alignItems: 'center',
  },
  menuTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  menuDesc: { color: C.textSub, fontSize: 12, marginTop: 2 },

  logoutCard: { borderRadius: 16, overflow: 'hidden' },
  logoutGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
    borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.4)',
    borderRadius: 16,
  },
  logoutIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255, 77, 77, 0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoutTitle: { color: C.emergency, fontSize: 15, fontWeight: '800' },
  logoutSub: { color: C.textSub, fontSize: 12, marginTop: 2 },
  versionText: { color: C.textMuted, fontSize: 11, textAlign: 'center', marginTop: 16 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    paddingHorizontal: 8,
    borderTopWidth: 1, borderTopColor: C.borderSoft,
  },
  bottomTab: { flex: 1, alignItems: 'center', gap: 3 },
  bottomTabCenter: { flex: 1, alignItems: 'center', marginTop: -28 },
  bottomCenterCircle: {
    width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(0, 0, 0, 0.92)',
  },
  bottomLabel: { color: C.textSub, fontSize: 11, fontWeight: '600' },
  activeLabel: { color: C.primary, fontWeight: '800' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#0A1520',
    borderRadius: 24,
    padding: 20,
    maxHeight: height * 0.85,
    borderWidth: 1,
    borderColor: C.borderSoft,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: C.text, fontSize: 22, fontWeight: 'bold' },

  inputGroup: { marginBottom: 16 },
  inputLabel: { color: C.textSub, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14,
    padding: 14,
    color: C.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.borderSoft,
  },
  textArea: { height: 90, textAlignVertical: 'top' },

  saveButton: { marginTop: 10, borderRadius: 14, overflow: 'hidden' },
  saveGradient: { padding: 16, alignItems: 'center' },
  saveButtonText: { color: C.white, fontSize: 17, fontWeight: 'bold' },

  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noDataText: { color: C.text, fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  noDataSub: { color: C.textSub, fontSize: 14, marginTop: 8, textAlign: 'center' },
  loginButton: { marginTop: 20, borderRadius: 14, overflow: 'hidden' },
  loginGradient: { paddingHorizontal: 32, paddingVertical: 14 },
  loginButtonText: { color: C.white, fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;