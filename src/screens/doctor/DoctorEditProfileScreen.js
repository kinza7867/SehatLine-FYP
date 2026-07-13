// src/screens/doctor/DoctorEditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const USER_DATA_KEY = '@sehatline_userData';

const DoctorEditProfileScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [hospital, setHospital] = useState('');
  const [room, setRoom] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [pmdcRegistration, setPmdcRegistration] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (route.params?.doctor) {
      const doctor = route.params.doctor;
      setName(doctor.name || '');
      setDesignation(doctor.designation || doctor.specialty || '');
      setDepartment(doctor.department || '');
      setHospital(doctor.hospital || '');
      setRoom(doctor.room || '');
      setEmployeeId(doctor.employeeId || '');
      setQualification(doctor.qualification || '');
      setExperience(doctor.experience || '');
      setPmdcRegistration(doctor.pmdcRegistration || '');
      setWorkingHours(doctor.workingHours || doctor.shift || '');
      setProfileImage(doctor.profileImage || null);
      setAvatar(doctor.avatar || 'DR');
    }
  }, [route.params]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to your camera.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleChangeImage = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Remove Photo', onPress: () => setProfileImage(null), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    if (!designation.trim()) {
      Alert.alert('Error', 'Please enter your designation.');
      return;
    }

    setSaving(true);
    try {
      const existingData = await AsyncStorage.getItem(USER_DATA_KEY);
      let currentData = existingData ? JSON.parse(existingData) : {};

      const updatedDoctor = {
        ...currentData,
        name: name.trim(),
        specialty: designation.trim(),
        designation: designation.trim(),
        department: department.trim(),
        hospital: hospital.trim(),
        room: room.trim(),
        employeeId: employeeId.trim(),
        qualification: qualification.trim(),
        experience: experience.trim(),
        pmdcRegistration: pmdcRegistration.trim(),
        shift: workingHours.trim(),
        workingHours: workingHours.trim(),
        profileImage: profileImage,
        avatar: avatar || name.split(' ').map(n => n[0]).join('').toUpperCase(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedDoctor));

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (profileImage) return null;
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'DR';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image source={require('../../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.7}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.saveBtnGradient}>
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={wp(4)} color={COLORS.white} />
                  <Text style={styles.saveBtnText}>Save</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileImageSection}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={handleChangeImage} activeOpacity={0.8}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>{getInitials()}</Text>
                </LinearGradient>
              )}
              <View style={styles.cameraIconContainer}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.cameraIcon}>
                  <Ionicons name="camera-outline" size={wp(3)} color={COLORS.white} />
                </LinearGradient>
              </View>
            </TouchableOpacity>
            <Text style={styles.profileImageHint}>Tap to change profile picture</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Personal Information</Text>
            <View style={styles.formCard}>
              <FormField label="Full Name" value={name} onChangeText={setName} placeholder="Enter full name" icon="person-outline" />
              <FormField label="Designation" value={designation} onChangeText={setDesignation} placeholder="Enter designation" icon="medkit-outline" />
              <FormField label="Department" value={department} onChangeText={setDepartment} placeholder="Enter department" icon="people-outline" />
              <FormField label="Hospital" value={hospital} onChangeText={setHospital} placeholder="Enter hospital name" icon="business-outline" />
              <FormField label="Room" value={room} onChangeText={setRoom} placeholder="Enter room number" icon="location-outline" />
              <FormField label="Employee ID" value={employeeId} onChangeText={setEmployeeId} placeholder="Enter employee ID" icon="id-card-outline" editable={false} />
              <FormField label="Qualification" value={qualification} onChangeText={setQualification} placeholder="Enter qualification" icon="school-outline" />
              <FormField label="Experience" value={experience} onChangeText={setExperience} placeholder="Enter experience" icon="briefcase-outline" />
              <FormField label="PMDC Registration No." value={pmdcRegistration} onChangeText={setPmdcRegistration} placeholder="Enter PMDC registration" icon="id-card-outline" />
              <FormField label="Working Hours" value={workingHours} onChangeText={setWorkingHours} placeholder="e.g., 08:30 AM – 02:00 PM" icon="time-outline" />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Capital Hospital CDA</Text>
            <Text style={styles.footerSub}>SehatLine v2.0.1</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const FormField = ({ label, value, onChangeText, placeholder, icon, editable = true }) => (
  <View style={styles.fieldContainer}>
    <View style={styles.fieldIcon}>
      <Ionicons name={icon} size={wp(3.5)} color={COLORS.primary} />
    </View>
    <View style={styles.fieldContent}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, !editable && styles.fieldInputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        editable={editable}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '20',
  },
  menuBtn: { width: wp(9), height: wp(9), justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2) },
  headerLogo: { width: wp(10), height: wp(10), resizeMode: 'contain' },
  headerTitle: { fontSize: wp(4.8), fontWeight: '700', color: COLORS.text },
  saveBtn: { borderRadius: wp(2.5), overflow: 'hidden' },
  saveBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(3.5), paddingVertical: hp(0.6), gap: wp(1) },
  saveBtnText: { color: COLORS.white, fontSize: wp(3), fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: hp(4) },
  profileImageSection: { alignItems: 'center', marginTop: hp(2) },
  profileImageContainer: { position: 'relative' },
  profileImage: { width: wp(22), height: wp(22), borderRadius: wp(11), borderWidth: 3, borderColor: COLORS.primary + '30' },
  profileImagePlaceholder: { width: wp(22), height: wp(22), borderRadius: wp(11), justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.primary + '30' },
  profileImageText: { fontSize: wp(8), fontWeight: '700', color: COLORS.white },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0 },
  cameraIcon: { width: wp(6), height: wp(6), borderRadius: wp(3), justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  profileImageHint: { fontSize: wp(2.8), color: COLORS.textLight, marginTop: hp(1) },
  formSection: { paddingHorizontal: wp(4), marginTop: hp(2) },
  formTitle: { fontSize: wp(3.8), fontWeight: '700', color: COLORS.text, marginBottom: hp(1) },
  formCard: { backgroundColor: COLORS.white, borderRadius: wp(3.5), paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderWidth: 1, borderColor: COLORS.border },
  fieldContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(0.8), borderBottomWidth: 1, borderBottomColor: COLORS.border },
  fieldIcon: { width: wp(8), height: wp(8), borderRadius: wp(2), backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(2.5) },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: wp(2.4), color: COLORS.textLight, fontWeight: '500' },
  fieldInput: { fontSize: wp(3.2), color: COLORS.text, paddingVertical: hp(0.2), paddingRight: wp(2) },
  fieldInputDisabled: { color: COLORS.textLight },
  footer: { alignItems: 'center', marginTop: hp(3), paddingTop: hp(1.5), paddingBottom: hp(1), borderTopWidth: 1, borderTopColor: COLORS.border, marginHorizontal: wp(4) },
  footerText: { fontSize: wp(2.8), color: COLORS.textSecondary, fontWeight: '500' },
  footerSub: { fontSize: wp(2.4), color: COLORS.textLight, marginTop: hp(0.2) },
});

export default DoctorEditProfileScreen;