import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Share,
  Modal,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const BookAppointmentScreen = ({ navigation, route }) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Cardiology fields
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [doctor, setDoctor] = useState('');
  const [visitType, setVisitType] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Cardiology');

  // Visit type description
  const [showVisitTypeInfo, setShowVisitTypeInfo] = useState(false);
  const [selectedVisitInfo, setSelectedVisitInfo] = useState(null);

  // Token modal
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  // ── Config ──────────────────────────────────────────────────────────────────
  // ✅ Cardiology Department - Based on CDA Hospital Website
  const cardiologyDoctors = [
    'Dr. Ahmed Hassan - Interventional Cardiologist',
    'Dr. Fatima Noor - Pediatric Cardiologist',
    'Dr. Zain Akhtar - Cardiothoracic Surgeon',
    'Dr. Ayesha Tariq - Cardiac Electrophysiologist',
    'Dr. Usman Riaz - Clinical Cardiologist',
  ];

  // ✅ Visit Types with Descriptions - Emergency Removed
  const visitTypes = [
    { 
      id: 'routine', 
      label: 'Routine Check-up', 
      description: 'Preventive health check for maintaining good heart health. Includes BP, ECG, and basic blood work.',
      duration: '30 min',
      tests: ['Blood Pressure', 'ECG', 'Lipid Profile', 'Blood Sugar']
    },
    { 
      id: 'followup', 
      label: 'Follow-up Visit', 
      description: 'Review of existing heart condition. Monitoring progress of treatment plan.',
      duration: '20 min',
      tests: ['Condition-specific tests', 'Medication review', 'Progress assessment']
    },
    { 
      id: 'medication', 
      label: 'Medication Review', 
      description: 'Review and refill of heart medications. Check for side effects and effectiveness.',
      duration: '15 min',
      tests: ['Medication list review', 'Side effect check', 'Dosage adjustment']
    },
    { 
      id: 'testresults', 
      label: 'Test Results Review', 
      description: 'Discussion of recent test results including ECG, Echo, Stress Test, or Blood Work.',
      duration: '20 min',
      tests: ['Report discussion', 'Treatment plan adjustment', 'Next steps']
    },
    { 
      id: 'postsurgery', 
      label: 'Post-Surgery Follow-up', 
      description: 'Follow-up after cardiac surgery. Monitor recovery and healing progress.',
      duration: '30 min',
      tests: ['Wound check', 'Vital signs', 'Recovery assessment', 'Medication adjustment']
    },
  ];

  const timeSlots = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM',
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      let data = route?.params?.userData || null;
      if (!data) {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) data = JSON.parse(storedData);
      }
      if (data) setUserData(data);
    } catch (e) {
      console.log('Error loading user data:', e);
    }
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const resetForm = () => {
    setDoctor('');
    setVisitType('');
    setSelectedTime('');
    setDate(new Date());
  };

  const isSlotPassed = (slot) => {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    if (!isToday) return false;

    const [timePart, meridiem] = slot.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;

    const slotDate = new Date(today);
    slotDate.setHours(h, m, 0, 0);
    return slotDate <= today;
  };

  const generateUniqueTokenNumber = (existingTokens) => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const num = Math.floor(Math.random() * 90) + 10;
      const candidate = `C-${String(num).padStart(3, '0')}`;
      if (!existingTokens.includes(candidate)) {
        return { num, token: candidate };
      }
    }
    const fallbackNum = Number(String(Date.now()).slice(-2)) || 10;
    return { num: fallbackNum, token: `C-${String(fallbackNum).padStart(3, '0')}` };
  };

  // ── Token generation ───────────────────────────────────────────────────────
  const generateToken = (existingTokens) => {
    const { num, token } = generateUniqueTokenNumber(existingTokens);

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const [timePart, meridiem] = selectedTime.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    const apptDate = new Date(date);
    apptDate.setHours(hours, minutes, 0, 0);

    const selectedVisit = visitTypes.find(v => v.label === visitType);

    return {
      token,
      prefix: 'C',
      number: num,
      department: 'Cardiology',
      patientName: userData?.name || 'Patient',
      patientEmail: userData?.email || '',
      date: formatted,
      time: selectedTime,
      dateTimeISO: apptDate.toISOString(),
      departmentData: {
        doctor,
        visitType,
        visitDuration: selectedVisit?.duration || '30 min',
        testsOrdered: selectedVisit?.tests || [],
      },
      bookedAt: new Date().toISOString(),
      status: 'Confirmed',
      id: Date.now(),
    };
  };

  const validateForm = () => {
    if (!doctor) {
      Alert.alert('Missing Info', 'Please select a cardiologist.');
      return false;
    }
    if (!visitType) {
      Alert.alert('Missing Info', 'Please select visit type.');
      return false;
    }
    if (!selectedTime) {
      Alert.alert('Missing Info', 'Please select a time slot.');
      return false;
    }
    if (isSlotPassed(selectedTime)) {
      Alert.alert('Invalid Time', 'That time slot has already passed today. Please choose a later slot.');
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const existing = await AsyncStorage.getItem('appointments');
      const appts = existing ? JSON.parse(existing) : [];
      const existingTokens = appts.map((a) => a.token).filter(Boolean);

      setTimeout(() => {
        setLoading(false);
        const tokenData = generateToken(existingTokens);
        setGeneratedToken(tokenData);
        setShowTokenModal(true);
      }, 1500);
    } catch (e) {
      setLoading(false);
      console.log('Error preparing booking:', e);
      const tokenData = generateToken([]);
      setGeneratedToken(tokenData);
      setShowTokenModal(true);
    }
  };

  const handleSaveToken = async () => {
    if (!generatedToken) return;
    try {
      const existing = await AsyncStorage.getItem('appointments');
      let appts = existing ? JSON.parse(existing) : [];
      appts.push(generatedToken);
      await AsyncStorage.setItem('appointments', JSON.stringify(appts));

      setShowTokenModal(false);
      setShowThankYou(true);
      resetForm();
      setTimeout(() => {
        setShowThankYou(false);
        navigation.navigate('AppointmentList', {
          userData,
          refresh: true,
          highlightToken: generatedToken.token,
          department: 'Cardiology',
        });
      }, 2000);
    } catch (e) {
      console.log('Error saving appointment:', e);
      Alert.alert('Error', 'Failed to save appointment');
    }
  };

  const handleShareToken = async () => {
    if (!generatedToken) return;
    const msg =
      `🏥 CDA HOSPITAL - Cardiology Appointment\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Patient: ${generatedToken.patientName}\n` +
      `🏥 Department: Cardiology\n` +
      `👨‍⚕️ Cardiologist: ${generatedToken.departmentData.doctor}\n` +
      `📋 Visit: ${generatedToken.departmentData.visitType}\n` +
      `📅 Date: ${generatedToken.date}\n` +
      `⏰ Time: ${generatedToken.time}\n` +
      `🎫 Token: ${generatedToken.token}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `CDA Hospital Islamabad\n` +
      `Heart Care - Our Priority ❤️`;

    try {
      await Share.share({ message: msg, title: 'Cardiology Appointment Token' });
    } catch (e) {
      Alert.alert('Error', 'Unable to share token');
    }
  };

  const handleViewAppointments = () => {
    setShowTokenModal(false);
    navigation.navigate('AppointmentList', {
      userData,
      refresh: true,
      highlightToken: generatedToken?.token,
    });
  };

  // ─── Visit Type Info ──────────────────────────────────────────────────────
  const showVisitInfo = (visit) => {
    setSelectedVisitInfo(visit);
    setShowVisitTypeInfo(true);
  };

  const VisitTypeInfoModal = () => (
    <Modal
      visible={showVisitTypeInfo}
      transparent
      animationType="fade"
      onRequestClose={() => setShowVisitTypeInfo(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.infoModalContainer}>
          <View style={styles.infoModalHeader}>
            <Text style={styles.infoModalTitle}>{selectedVisitInfo?.label}</Text>
            <TouchableOpacity onPress={() => setShowVisitTypeInfo(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.infoModalBody}>
            <Text style={styles.infoModalDescription}>
              {selectedVisitInfo?.description}
            </Text>
            <View style={styles.infoModalDetail}>
              <Text style={styles.infoModalLabel}>⏱️ Duration:</Text>
              <Text style={styles.infoModalValue}>{selectedVisitInfo?.duration}</Text>
            </View>
            <Text style={styles.infoModalSubLabel}>📋 Tests/Checks:</Text>
            {selectedVisitInfo?.tests?.map((test, index) => (
              <View key={index} style={styles.infoModalTestItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.infoModalTestText}>{test}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.infoModalCloseBtn}
            onPress={() => setShowVisitTypeInfo(false)}
          >
            <Text style={styles.infoModalCloseText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ── Calendar ───────────────────────────────────────────────────────────────
  const renderCustomCalendar = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const m = date.getMonth(),
      y = date.getFullYear();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();

    const changeMonth = (inc) => {
      const n = new Date(date);
      n.setMonth(n.getMonth() + inc);
      const today = new Date();
      if (
        n.getFullYear() < today.getFullYear() ||
        (n.getFullYear() === today.getFullYear() &&
          n.getMonth() < today.getMonth())
      ) {
        Alert.alert('Invalid Month', 'Cannot go to previous months.');
        return;
      }
      setDate(n);
    };

    const selectDay = (d) => {
      const sel = new Date(y, m, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (sel < today) {
        Alert.alert('Invalid Date', 'Please select today or a future date.');
        return;
      }
      setDate(sel);
      setShowDatePicker(false);
    };

    const isDisabled = (d) => {
      const s = new Date(y, m, d);
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return s < t;
    };
    const isSelected = (d) =>
      date.getDate() === d &&
      date.getMonth() === m &&
      date.getFullYear() === y;

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            style={styles.calendarNav}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {monthNames[m]} {y}
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={styles.calendarNav}
          >
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarDaysHeader}>
          {dayNames.map((d) => (
            <Text key={d} style={styles.calendarDayName}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`e${i}`} style={styles.calendarEmptyCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1,
              dis = isDisabled(d),
              sel = isSelected(d);
            return (
              <TouchableOpacity
                key={`d${d}`}
                style={[
                  styles.calendarCell,
                  sel && styles.calendarCellSelected,
                  dis && styles.calendarCellDisabled,
                ]}
                onPress={() => selectDay(d)}
                disabled={dis}
              >
                <Text
                  style={[
                    styles.calendarCellText,
                    sel && styles.calendarCellTextSelected,
                    dis && styles.calendarCellTextDisabled,
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ── Render sections ──────────────────────────────────────────────────────
  const renderAppointmentForm = () => (
    <View style={styles.formContainer}>
      {/* Department Header */}
      <View style={styles.departmentHeader}>
        <Ionicons name="heart-outline" size={wp(5)} color={COLORS.primary} />
        <Text style={styles.departmentTitle}>Cardiology</Text>
        <View style={styles.departmentBadge}>
          <Text style={styles.departmentBadgeText}>Heart Care</Text>
        </View>
      </View>

      <Text style={styles.label}>Select Cardiologist</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {cardiologyDoctors.map((doc) => (
          <TouchableOpacity
            key={doc}
            style={[styles.chip, doctor === doc && styles.chipActive]}
            onPress={() => setDoctor(doc)}
          >
            <Ionicons
              name="person-outline"
              size={14}
              color={doctor === doc ? COLORS.white : COLORS.primary}
            />
            <Text
              style={[styles.chipText, doctor === doc && styles.chipTextActive]}
            >
              {doc}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Visit Type with Info Button */}
      <View style={styles.visitTypeHeader}>
        <Text style={styles.label}>Visit Type</Text>
        <TouchableOpacity 
          style={styles.infoIconBtn}
          onPress={() => {
            if (visitType) {
              const visit = visitTypes.find(v => v.label === visitType);
              if (visit) showVisitInfo(visit);
            } else {
              Alert.alert('Select a Visit Type', 'Please select a visit type first to see details.');
            }
          }}
        >
          <Ionicons name="information-circle-outline" size={wp(5)} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {visitTypes.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={[styles.chip, visitType === v.label && styles.chipActive]}
            onPress={() => setVisitType(v.label)}
          >
            <Text
              style={[styles.chipText, visitType === v.label && styles.chipTextActive]}
            >
              {v.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {visitType && (
        <View style={styles.visitTypeHint}>
          <Text style={styles.visitTypeHintText}>
            ℹ️ Tap the ℹ️ icon to see visit details
          </Text>
        </View>
      )}

      <Text style={styles.label}>Select Date</Text>
      <TouchableOpacity
        style={styles.inputBox}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.dateValue}>{date.toDateString()}</Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      {showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.calendarModalOverlay}>
            <View style={styles.calendarModalContent}>
              <View style={styles.calendarModalHeader}>
                <Text style={styles.calendarModalTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              {renderCustomCalendar()}
              <TouchableOpacity
                style={[styles.calendarConfirmBtn]}
                onPress={() => setShowDatePicker(false)}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.calendarConfirmGradient}
                >
                  <Text style={styles.calendarConfirmText}>Confirm Date</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <Text style={styles.label}>Select Time (8:00 AM – 3:00 PM)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {timeSlots.map((t) => {
          const passed = isSlotPassed(t);
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.chip,
                selectedTime === t && styles.chipActive,
                passed && styles.chipDisabled,
              ]}
              onPress={() => !passed && setSelectedTime(t)}
              disabled={passed}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedTime === t && styles.chipTextActive,
                  passed && styles.chipTextDisabled,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleBooking}
        disabled={loading}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.btnGradient}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Text style={styles.btnText}>BOOK APPOINTMENT</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ── Token Modal ──────────────────────────────────────────────────────────
  const renderTokenModal = () => (
    <Modal
      visible={showTokenModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTokenModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalSuccessIcon}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color={COLORS.success || '#2ECC71'}
            />
          </View>
          <Text style={styles.modalTitle}>Appointment Confirmed! ❤️</Text>
          <Text style={styles.modalSubtitle}>Your Cardiology appointment has been booked</Text>

          {generatedToken && (
            <View style={styles.tokenCard}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.tokenCardGradient}
              >
                <View style={styles.tokenCardHeader}>
                  <Text style={styles.tokenCardTitle}>CDA HOSPITAL</Text>
                  <Text style={styles.tokenCardSub}>Cardiology Department</Text>
                </View>
                <Text style={styles.tokenCardNumber}>
                  {generatedToken.token}
                </Text>
                <View style={styles.tokenCardDetails}>
                  {[
                    ['Patient', generatedToken.patientName],
                    ['Cardiologist', generatedToken.departmentData.doctor],
                    ['Visit Type', generatedToken.departmentData.visitType],
                    ['Duration', generatedToken.departmentData.visitDuration || '30 min'],
                    ['Date', generatedToken.date],
                    ['Time', generatedToken.time],
                  ].map(([label, value]) => (
                    <View key={label} style={styles.tokenCardRow}>
                      <Text style={styles.tokenCardLabel}>{label}</Text>
                      <Text
                        style={styles.tokenCardValue}
                        numberOfLines={2}
                      >
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>
          )}

          {/* ✅ Single Action - View Appointment */}
          <TouchableOpacity
            style={[styles.modalActionBtn, styles.modalSaveBtn, { width: '100%', marginBottom: hp(1) }]}
            onPress={handleSaveToken}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.modalSaveGradient}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
              <Text style={styles.modalSaveText}>View My Appointment</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={[styles.modalActionBtn, styles.modalShareBtn, { width: '100%' }]}
            onPress={handleShareToken}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.primary} />
            <Text style={styles.modalShareText}>Share Appointment Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderThankYou = () => (
    <Modal
      visible={showThankYou}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.thankYouOverlay}>
        <View style={styles.thankYouContainer}>
          <Ionicons name="heart-circle" size={80} color={COLORS.primary} />
          <Text style={styles.thankYouTitle}>Thank You! ❤️</Text>
          <Text style={styles.thankYouSubtitle}>
            Your Cardiology appointment has been confirmed successfully.
          </Text>
          <Text style={styles.thankYouToken}>Token: {generatedToken?.token}</Text>
          <Text style={styles.thankYouDept}>Cardiology Department</Text>
          <View style={styles.thankYouDetails}>
            <Text style={styles.thankYouDetailText}>
              📅 {generatedToken?.date} at {generatedToken?.time}
            </Text>
            <Text style={styles.thankYouDetailText}>
              👨‍⚕️ {generatedToken?.departmentData?.doctor}
            </Text>
            <Text style={styles.thankYouDetailText}>
              📋 {generatedToken?.departmentData?.visitType}
            </Text>
          </View>
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginTop: hp(1.5) }}
          />
          <Text style={styles.thankYouRedirect}>
            Redirecting to your appointments...
          </Text>
        </View>
      </View>
    </Modal>
  );

  // ── Root ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Cardiology</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* User Info */}
          {userData && (
            <View style={styles.userInfo}>
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.userName}>{userData.name}</Text>
            </View>
          )}

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="heart-outline" size={24} color="#EF4444" />
            <Text style={styles.infoText}>
              Book your Cardiology consultation with our specialist heart doctors
            </Text>
          </View>

          {/* Appointment Form */}
          {renderAppointmentForm()}

          {/* Note */}
          <View style={styles.serviceNote}>
            <Text style={styles.serviceNoteText}>
              ❤️ Our cardiologists are available Mon-Sat for heart consultations.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderTokenModal()}
      {renderThankYou()}
      {VisitTypeInfoModal()}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: wp(5), paddingBottom: hp(4) },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(5),
    fontWeight: 'bold',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: 20,
    marginBottom: hp(1.5),
    alignSelf: 'flex-start',
  },
  userName: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: wp(3.5),
    borderRadius: 12,
    marginBottom: hp(2),
    gap: 10,
    ...SHADOWS.small,
  },
  infoText: {
    flex: 1,
    color: COLORS.text,
    fontSize: wp(3.2),
    lineHeight: wp(4.5),
  },

  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: wp(4),
    ...SHADOWS.medium,
  },

  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
    gap: 10,
  },
  departmentTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  departmentBadge: {
    backgroundColor: '#EF444415',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  departmentBadgeText: {
    color: '#EF4444',
    fontSize: wp(2.2),
    fontWeight: '600',
  },

  label: {
    color: COLORS.text,
    fontSize: wp(3.8),
    fontWeight: '600',
    marginBottom: hp(0.8),
    marginTop: hp(1.5),
  },

  visitTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoIconBtn: {
    padding: wp(1),
  },
  visitTypeHint: {
    marginTop: hp(0.3),
    marginBottom: hp(0.5),
  },
  visitTypeHintText: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  chipScroll: {
    flexDirection: 'row',
    marginBottom: hp(0.5),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border || '#E8EDF2',
    ...SHADOWS.small,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  chipDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border || '#E8EDF2',
    opacity: 0.5,
  },
  chipTextDisabled: {
    color: COLORS.textLight,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: wp(3.5),
    height: hp(6.5),
    borderWidth: 1,
    borderColor: COLORS.border || '#E8EDF2',
    marginBottom: hp(1),
  },
  dateValue: {
    color: COLORS.text,
    marginLeft: wp(2.5),
    fontSize: wp(3.5),
    flex: 1,
  },

  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: wp(5),
    width: width * 0.92,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  calendarModalTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  calendarNav: {
    padding: wp(2),
  },
  calendarMonthText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: COLORS.text,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp(1),
  },
  calendarDayName: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.textLight || '#aaa',
    width: wp(10),
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  calendarCellSelected: {
    backgroundColor: COLORS.primary,
  },
  calendarCellDisabled: {
    opacity: 0.3,
  },
  calendarEmptyCell: {
    width: wp(10),
    height: wp(10),
  },
  calendarCellText: {
    fontSize: wp(3.5),
    color: COLORS.text,
  },
  calendarCellTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  calendarCellTextDisabled: {
    color: COLORS.textLight || '#aaa',
  },
  calendarConfirmBtn: {
    marginTop: hp(2),
    borderRadius: 12,
    overflow: 'hidden',
  },
  calendarConfirmGradient: {
    paddingVertical: hp(1.2),
    alignItems: 'center',
  },
  calendarConfirmText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '600',
  },

  confirmBtn: {
    marginTop: hp(3),
    borderRadius: 15,
    overflow: 'hidden',
  },
  btnGradient: {
    height: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  btnText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },

  serviceNote: {
    marginTop: hp(2),
    padding: wp(3),
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  serviceNoteText: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
    lineHeight: wp(4.5),
  },

  // Token modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: wp(5),
    width: width * 0.92,
    maxHeight: height * 0.9,
  },
  modalSuccessIcon: {
    alignItems: 'center',
    marginBottom: hp(1),
  },
  modalTitle: {
    fontSize: wp(5.5),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: hp(1.5),
  },

  tokenCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: hp(1.5),
  },
  tokenCardGradient: {
    padding: wp(4),
  },
  tokenCardHeader: {
    alignItems: 'center',
    marginBottom: hp(1),
  },
  tokenCardTitle: {
    color: '#FFFFFF',
    fontSize: wp(4),
    fontWeight: '700',
    letterSpacing: 2,
  },
  tokenCardSub: {
    color: '#FFFFFF',
    fontSize: wp(2.5),
    letterSpacing: 1,
    opacity: 0.8,
  },
  tokenCardNumber: {
    color: '#FFFFFF',
    fontSize: wp(8),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  tokenCardDetails: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: hp(1.2),
    marginTop: hp(1),
  },
  tokenCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.3),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tokenCardLabel: {
    color: '#FFFFFF',
    fontSize: wp(2.8),
    opacity: 0.7,
  },
  tokenCardValue: {
    color: '#FFFFFF',
    fontSize: wp(3),
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  modalActionBtn: {
    paddingVertical: hp(1.2),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    marginBottom: hp(0.8),
  },
  modalShareBtn: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  modalShareText: {
    color: COLORS.primary,
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  modalSaveBtn: {
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    width: '100%',
    gap: 8,
  },
  modalSaveText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // Info Modal
  infoModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: wp(4),
    width: width * 0.88,
    maxHeight: height * 0.7,
    ...SHADOWS.large,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
    paddingBottom: hp(0.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoModalTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  infoModalBody: {
    marginBottom: hp(1),
  },
  infoModalDescription: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    lineHeight: wp(4.5),
    marginBottom: hp(1),
  },
  infoModalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
    gap: 8,
  },
  infoModalLabel: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
  },
  infoModalValue: {
    fontSize: wp(3),
    color: COLORS.primary,
    fontWeight: '500',
  },
  infoModalSubLabel: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },
  infoModalTestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: hp(0.2),
  },
  infoModalTestText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  infoModalCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(0.8),
    borderRadius: 12,
    alignItems: 'center',
  },
  infoModalCloseText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // Thank you
  thankYouOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: wp(8),
    width: width * 0.85,
    alignItems: 'center',
  },
  thankYouTitle: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: hp(1),
  },
  thankYouSubtitle: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  thankYouToken: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: hp(1),
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
    borderRadius: 8,
  },
  thankYouDept: {
    fontSize: wp(3.5),
    color: COLORS.textLight || '#aaa',
    marginTop: hp(0.3),
  },
  thankYouDetails: {
    marginTop: hp(0.5),
    alignItems: 'center',
  },
  thankYouDetailText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    marginTop: hp(0.2),
  },
  thankYouRedirect: {
    fontSize: wp(3),
    color: COLORS.textLight || '#aaa',
    marginTop: hp(0.5),
  },
});

export default BookAppointmentScreen;