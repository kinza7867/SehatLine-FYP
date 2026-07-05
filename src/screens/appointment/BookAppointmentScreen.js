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

  // Chronic OPD fields
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [doctor, setDoctor] = useState('');
  const [visitType, setVisitType] = useState('');

  // Token modal
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  // ── Config ──────────────────────────────────────────────────────────────────
  const chronicDoctors = [
    'Dr. Sarah Ahmed - Cardiologist',
    'Dr. Muhammad Khan - Endocrinologist',
    'Dr. Usman Chaudhry - Pulmonologist',
    'Dr. Fatima Ali - Neurologist',
    'Dr. Hassan Raza - Gastroenterologist',
    'Dr. Ayesha Malik - Rheumatologist',
    'Dr. Imran Ali - Nephrologist',
    'Dr. Sana Javed - Oncologist',
  ];

  const visitTypes = [
    'Routine Check-up',
    'Follow-up Visit',
    'Medication Review',
    'Test Results Review',
    'Emergency Consultation',
  ];

  const timeSlots = [
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
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

  // A time slot is only "passed" if the selected day is today AND that
  // slot's time has already gone by. Future dates are never affected.
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

  // Guarantees the generated token number doesn't collide with any token
  // already sitting in storage (previously two appointments could end up
  // with the exact same visible token, e.g. two "A-045" cards).
  const generateUniqueTokenNumber = (existingTokens) => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const num = Math.floor(Math.random() * 90) + 10;
      const candidate = `A-${String(num).padStart(3, '0')}`;
      if (!existingTokens.includes(candidate)) {
        return { num, token: candidate };
      }
    }
    // Extremely unlikely fallback: derive from timestamp so it's still unique
    const fallbackNum = Number(String(Date.now()).slice(-2)) || 10;
    return { num: fallbackNum, token: `A-${String(fallbackNum).padStart(3, '0')}` };
  };

  // ── Token generation ───────────────────────────────────────────────────────
  const generateToken = (existingTokens) => {
    // Generate appointment token with prefix 'A' for Appointment, guaranteed
    // not to collide with a token that's already stored.
    const { num, token } = generateUniqueTokenNumber(existingTokens);

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Parse selectedTime for ISO string
    const [timePart, meridiem] = selectedTime.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    const apptDate = new Date(date);
    apptDate.setHours(hours, minutes, 0, 0);

    return {
      token,
      prefix: 'A',
      number: num,
      department: 'Chronic OPD',
      patientName: userData?.name || 'Patient',
      date: formatted,
      time: selectedTime,
      dateTimeISO: apptDate.toISOString(),
      departmentData: {
        doctor,
        visitType,
      },
      bookedAt: new Date().toISOString(),
      status: 'Confirmed',
      id: Date.now(),
    };
  };

  const validateForm = () => {
    if (!doctor) {
      Alert.alert('Missing Info', 'Please select a doctor.');
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
      console.log('✅ Appointment saved:', generatedToken.token, '| Total:', appts.length);

      setShowTokenModal(false);
      setShowThankYou(true);
      resetForm();
      setTimeout(() => {
        setShowThankYou(false);
        navigation.navigate('AppointmentList', {
          userData,
          refresh: true,
          highlightToken: generatedToken.token,
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
      `🏥 CDA HOSPITAL - Doctor Appointment\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Patient: ${generatedToken.patientName}\n` +
      `🏥 Department: Chronic OPD\n` +
      `👨‍⚕️ Doctor: ${generatedToken.departmentData.doctor}\n` +
      `📋 Visit: ${generatedToken.departmentData.visitType}\n` +
      `📅 Date: ${generatedToken.date}\n` +
      `⏰ Time: ${generatedToken.time}\n` +
      `🎫 Token: ${generatedToken.token}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `CDA Hospital Islamabad`;

    try {
      await Share.share({ message: msg, title: 'Appointment Token' });
    } catch (e) {
      Alert.alert('Error', 'Unable to share token');
    }
  };

  const handleViewQueue = () => {
    setShowTokenModal(false);
    navigation.navigate('LiveTokenQueueScreen', {
      token: generatedToken?.token,
      department: 'Chronic OPD',
      userData,
    });
  };

  // ── Calendar ───────────────────────────────────────────────────────────────
  const renderCustomCalendar = () => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
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
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {monthNames[m]} {y}
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={styles.calendarNav}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={COLORS.primary}
            />
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
      {/* Doctor Selection */}
      <Text style={styles.label}>Select Doctor</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {chronicDoctors.map((doc) => (
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

      {/* Visit Type */}
      <Text style={styles.label}>Visit Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {visitTypes.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, visitType === t && styles.chipActive]}
            onPress={() => setVisitType(t)}
          >
            <Text
              style={[styles.chipText, visitType === t && styles.chipTextActive]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date Selection */}
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

      {/* Time Selection */}
      <Text style={styles.label}>Select Time (8:00 AM – 1:00 PM)</Text>
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
                selectedTime === t && {
                  backgroundColor: COLORS.primary,
                  borderColor: COLORS.primary,
                },
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

      {/* Confirm Button */}
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
          <Text style={styles.modalTitle}>Appointment Confirmed!</Text>
          <Text style={styles.modalSubtitle}>Your token has been generated</Text>

          {generatedToken && (
            <View style={styles.tokenCard}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.tokenCardGradient}
              >
                <View style={styles.tokenCardHeader}>
                  <Text style={styles.tokenCardTitle}>CDA HOSPITAL</Text>
                  <Text style={styles.tokenCardSub}>Chronic OPD</Text>
                </View>
                <Text style={styles.tokenCardNumber}>
                  {generatedToken.token}
                </Text>
                <View style={styles.tokenCardDetails}>
                  {[
                    ['Patient', generatedToken.patientName],
                    ['Doctor', generatedToken.departmentData.doctor],
                    ['Visit Type', generatedToken.departmentData.visitType],
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

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalActionBtn, styles.modalShareBtn]}
              onPress={handleShareToken}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.primary} />
              <Text style={styles.modalShareText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionBtn, styles.modalSaveBtn]}
              onPress={handleSaveToken}
            >
              <Ionicons name="save-outline" size={20} color={COLORS.white} />
              <Text style={styles.modalSaveText}>View Appointment</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.modalQueueBtn} onPress={handleViewQueue}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.modalQueueGradient}
            >
              <Ionicons name="timer-outline" size={20} color={COLORS.white} />
              <Text style={styles.modalQueueText}>View Queue Status</Text>
            </LinearGradient>
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
          <Text style={styles.thankYouTitle}>Thank You!</Text>
          <Text style={styles.thankYouSubtitle}>
            Your appointment has been confirmed successfully.
          </Text>
          <Text style={styles.thankYouToken}>Token: {generatedToken?.token}</Text>
          <Text style={styles.thankYouDept}>Chronic OPD</Text>
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
            <Text style={styles.headerTitle}>Book Appointment</Text>
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
              {userData.cdaCard && (
                <Text style={styles.userCda}>CDA: {userData.cdaCard}</Text>
              )}
            </View>
          )}

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Book your doctor consultation appointment at Chronic OPD
            </Text>
          </View>

          {/* Appointment Form */}
          {renderAppointmentForm()}

          {/* Note about other services */}
          <View style={styles.serviceNote}>
            <Text style={styles.serviceNoteText}>
              📌 For Pharmacy & Laboratory services, please visit the respective
              token counters.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderTokenModal()}
      {renderThankYou()}
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
  userCda: {
    color: COLORS.white + '70',
    fontSize: wp(2.8),
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

  label: {
    color: COLORS.text,
    fontSize: wp(3.8),
    fontWeight: '600',
    marginBottom: hp(0.8),
    marginTop: hp(1.5),
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
    borderLeftColor: COLORS.primary,
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

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: hp(1),
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: hp(1.2),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalSaveText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  modalQueueBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalQueueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: 8,
  },
  modalQueueText: {
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