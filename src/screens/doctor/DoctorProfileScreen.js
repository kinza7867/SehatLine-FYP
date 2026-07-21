// mobile/src/screens/doctor/DoctorProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../theme';
import FadeInView from '../../components/ui/FadeInView';

const { width } = Dimensions.get('window');

// ── Storage Keys ──────────────────────────────────────────────────────
const USER_DATA_KEY = '@sehatline_userData';
const PROFILE_IMAGE_KEY = '@sehatline_profile_image';

// ── Helper ────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'DR';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const DoctorProfileScreen = ({ navigation }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Load Data ──────────────────────────────────────────────────────
  const loadDoctorData = async () => {
    try {
      const profileImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      let doctorData = {
        id: 'DR-1024',
        name: 'Dr. Ahmed Khan',
        designation: 'Consultant Cardiologist',
        department: 'Cardiology Department',
        hospital: 'Capital Hospital CDA',
        room: 'Room 12',
        employeeId: 'DR-1024',
        qualification: 'MBBS, FCPS (Cardiology)',
        experience: '15 Years',
        pmdcRegistration: 'PMC-123456',
        workingHours: '09:00 AM – 01:00 PM',
        isOnline: true,
        color: COLORS.primary,
        color2: COLORS.secondary,
        profileImage: null,
      };

      if (userData) {
        const parsed = JSON.parse(userData);
        doctorData = { ...doctorData, ...parsed };
      }

      // Load profile image from storage
      if (profileImage) {
        doctorData.profileImage = profileImage;
      }

      // Set avatar from name
      doctorData.avatar = getInitials(doctorData.name);

      setDoctor(doctorData);
    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDoctorData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoctorData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // ── Profile Picture ────────────────────────────────────────────────
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' && galleryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please allow camera and gallery access to update your profile picture.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const handleUpdatePhoto = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose an option to update your profile picture',
      [
        { text: 'Take Photo', onPress: () => openCamera() },
        { text: 'Choose from Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await saveProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await saveProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const saveProfileImage = async (imageUri) => {
    setUploading(true);
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
      
      // Update state
      setDoctor(prev => ({ ...prev, profileImage: imageUri }));
      
      // Update user data
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.profileImage = imageUri;
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(parsed));
      }
      
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      console.error('Error saving profile image:', error);
      Alert.alert('Error', 'Failed to save profile photo. Please try again.');
      loadDoctorData();
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
              setDoctor(prev => ({ ...prev, profileImage: null }));
              
              const userData = await AsyncStorage.getItem(USER_DATA_KEY);
              if (userData) {
                const parsed = JSON.parse(userData);
                parsed.profileImage = null;
                await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(parsed));
              }
              
              Alert.alert('Success', 'Profile photo removed successfully!');
            } catch (error) {
              console.error('Error removing profile image:', error);
              Alert.alert('Error', 'Failed to remove profile photo.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No doctor data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary} 
          />
        }
      >
        {/* ═══ 1. HEADER - SCROLLABLE (like DoctorPortalScreen) ══════════ */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={26} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../../assets/logoo.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brand}>
              SEHAT<Text style={styles.brandAccent}>LINE</Text>
            </Text>
            <Text style={styles.tagline}>Doctor Profile</Text>
          </View>

          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('DoctorSettings')}
            activeOpacity={0.6}
          >
            <Ionicons name="settings-outline" size={25} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ═══ 2. DOCTOR IDENTITY CARD ════════════════════════════════════ */}
        <FadeInView delay={60}>
          <View style={styles.doctorCard}>
            <LinearGradient
              colors={[COLORS.primary + '06', '#FFFFFF']}
              style={styles.doctorCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handleUpdatePhoto}
                activeOpacity={0.8}
                disabled={uploading}
              >
                {doctor.profileImage ? (
                  <Image source={{ uri: doctor.profileImage }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient
                    colors={[doctor.color || COLORS.primary, doctor.color2 || COLORS.secondary]}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>{doctor.avatar || 'DR'}</Text>
                  </LinearGradient>
                )}
                
                <View style={styles.cameraOverlay}>
                  {uploading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons name="camera-outline" size={14} color={COLORS.white} />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={styles.doctorName}>{doctor.name}</Text>
              
              <View style={styles.specialtyContainer}>
                <Ionicons name="medical-outline" size={16} color={COLORS.primary} />
                <Text style={styles.doctorSpecialty}>{doctor.designation}</Text>
              </View>
              
              <Text style={styles.doctorDepartment}>{doctor.department}</Text>
              <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
              
              <View style={styles.doctorIdRow}>
                <View style={styles.doctorIdItem}>
                  <Text style={styles.doctorIdLabel}>Employee ID</Text>
                  <Text style={styles.doctorIdValue}>{doctor.employeeId}</Text>
                </View>
                <View style={styles.doctorIdDivider} />
                <View style={styles.doctorIdItem}>
                  <Text style={styles.doctorIdLabel}>Status</Text>
                  <Text style={[styles.doctorIdValue, { color: doctor.isOnline ? COLORS.success : COLORS.textLight }]}>
                    {doctor.isOnline ? 'On Duty' : 'Off Duty'}
                  </Text>
                </View>
              </View>

              {doctor.profileImage && (
                <TouchableOpacity 
                  style={styles.removePhotoBtn}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </FadeInView>

        {/* ═══ 3. PROFESSIONAL INFORMATION ════════════════════════════════ */}
        <FadeInView delay={100}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            <View style={styles.sectionRule} />
            <View style={styles.infoCard}>
              <InfoItem icon="medkit-outline" label="Designation" value={doctor.designation} />
              <InfoItem icon="school-outline" label="Qualification" value={doctor.qualification} />
              <InfoItem icon="briefcase-outline" label="Experience" value={doctor.experience} />
              <InfoItem icon="id-card-outline" label="PMDC Registration" value={doctor.pmdcRegistration} />
            </View>
          </View>
        </FadeInView>

        {/* ═══ 4. DEPARTMENT & DUTY ════════════════════════════════════════ */}
        <FadeInView delay={140}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Department & Duty</Text>
            <View style={styles.sectionRule} />
            <View style={styles.infoCard}>
              <InfoItem icon="business-outline" label="Hospital" value={doctor.hospital} />
              <InfoItem icon="people-outline" label="Department" value={doctor.department} />
              <InfoItem icon="location-outline" label="Room" value={doctor.room} />
              <InfoItem icon="time-outline" label="Working Hours" value={doctor.workingHours} />
            </View>
          </View>
        </FadeInView>

        {/* ═══ 5. EDIT BUTTON ══════════════════════════════════════════════ */}
        <FadeInView delay={180}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('DoctorEditProfileScreen', { doctor })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.editBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.white} />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </FadeInView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Capital Hospital CDA</Text>
          <Text style={styles.footerSub}>SehatLine v2.0.1</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ── Info Item ──────────────────────────────────────────────────────────
const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ─── HEADER - SCROLLABLE (like DoctorPortalScreen) ──────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 28) + 14,
    paddingBottom: 18,
    backgroundColor: '#F4F7FC',
  },
  iconBtn: {
    width: 30,
    alignItems: 'center',
    paddingTop: 24,
  },
  brandWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.6,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  brandAccent: {
    color: COLORS.text,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // ─── SCROLL CONTENT ──────────────────────────────────────────────
  scrollContent: {
    paddingBottom: 20,
  },

  // ─── SECTION ──────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionRule: {
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginBottom: 16,
  },

  // ─── 1. DOCTOR CARD ──────────────────────────────────────────────
  doctorCard: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  doctorCardGradient: {
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  doctorDepartment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  doctorHospital: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  doctorIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '04',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  doctorIdItem: {
    flex: 1,
    alignItems: 'center',
  },
  doctorIdLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorIdValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 1,
  },
  doctorIdDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E8EEF4',
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.danger + '10',
  },
  removePhotoText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
  },

  // ─── INFO CARD ─────────────────────────────────────────────────────
  infoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EEF4',
    backgroundColor: COLORS.white,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 1,
  },

  // ─── EDIT BUTTON ──────────────────────────────────────────────────
  editBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  editBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ─── FOOTER ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF4',
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerSub: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

export default DoctorProfileScreen;