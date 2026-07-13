// src/screens/doctor/DoctorAvailabilityScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Switch,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const AVAILABILITY_KEY = '@sehatline_doctor_availability';

const DoctorAvailabilityScreen = ({ navigation }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const data = await AsyncStorage.getItem(AVAILABILITY_KEY);
      if (data) {
        setAvailability(JSON.parse(data));
      } else {
        // Default availability
        const defaultAvailability = [
          { day: 'Monday', start: '09:00', end: '17:00', available: true },
          { day: 'Tuesday', start: '09:00', end: '17:00', available: true },
          { day: 'Wednesday', start: '09:00', end: '17:00', available: true },
          { day: 'Thursday', start: '09:00', end: '17:00', available: true },
          { day: 'Friday', start: '09:00', end: '13:00', available: true },
          { day: 'Saturday', start: '--:--', end: '--:--', available: false },
          { day: 'Sunday', start: '--:--', end: '--:--', available: false },
        ];
        setAvailability(defaultAvailability);
        await AsyncStorage.setItem(AVAILABILITY_KEY, JSON.stringify(defaultAvailability));
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async (updated) => {
    try {
      await AsyncStorage.setItem(AVAILABILITY_KEY, JSON.stringify(updated));
      setAvailability(updated);
      Alert.alert('✅ Saved', 'Availability updated successfully.');
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability.');
    }
  };

  const toggleAvailability = (index) => {
    const updated = [...availability];
    updated[index].available = !updated[index].available;
    if (!updated[index].available) {
      updated[index].start = '--:--';
      updated[index].end = '--:--';
    } else {
      updated[index].start = '09:00';
      updated[index].end = '17:00';
    }
    saveAvailability(updated);
  };

  const openTimeModal = (index) => {
    const item = availability[index];
    setSelectedDay(index);
    setTempStart(item.start || '09:00');
    setTempEnd(item.end || '17:00');
    setShowTimeModal(true);
  };

  const saveTime = () => {
    if (!tempStart || !tempEnd) {
      Alert.alert('Error', 'Please enter both start and end time.');
      return;
    }
    const updated = [...availability];
    updated[selectedDay].start = tempStart;
    updated[selectedDay].end = tempEnd;
    saveAvailability(updated);
    setShowTimeModal(false);
  };

  const getDayStatus = (item) => {
    if (!item.available) return { text: 'Off', color: COLORS.textLight };
    return { text: 'Available', color: COLORS.success };
  };

  const renderTimeModal = () => (
    <Modal visible={showTimeModal} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimeModal(false)}>
        <View style={[styles.modalContainer, SHADOWS.large]}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⏰ Edit Time</Text>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <Ionicons name="close" size={wp(5)} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.modalBody}>
            <Text style={styles.modalDay}>
              {selectedDay !== null ? availability[selectedDay]?.day : ''}
            </Text>

            <View style={styles.timeRow}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Start</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="e.g., 09:00"
                  placeholderTextColor={COLORS.textLight}
                  value={tempStart}
                  onChangeText={setTempStart}
                />
              </View>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>End</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="e.g., 17:00"
                  placeholderTextColor={COLORS.textLight}
                  value={tempEnd}
                  onChangeText={setTempEnd}
                />
              </View>
            </View>

            <Text style={styles.timeHint}>Use 24-hour format (e.g., 09:00, 17:30)</Text>

            <TouchableOpacity style={styles.saveTimeBtn} onPress={saveTime}>
              <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.saveTimeGradient}>
                <Ionicons name="save-outline" size={wp(4)} color={COLORS.white} />
                <Text style={styles.saveTimeText}>Save Time</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea}>
        {/* ─── HEADER ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.headerTitle}>Availability</Text>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={loadAvailability}>
            <Ionicons name="refresh-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── INFO CARD ───────────────────────────────────────────────── */}
        <View style={[styles.infoCard, SHADOWS.small]}>
          <Ionicons name="information-circle-outline" size={wp(4.5)} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Toggle days on/off and tap time to edit working hours.
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {availability.map((item, index) => {
            const status = getDayStatus(item);
            return (
              <View key={item.day} style={[styles.availabilityItem, SHADOWS.small]}>
                <View style={styles.availabilityLeft}>
                  <Text style={[styles.dayText, !item.available && styles.dayTextDisabled]}>
                    {item.day}
                  </Text>
                  <TouchableOpacity 
                    style={styles.timeContainer}
                    onPress={() => item.available && openTimeModal(index)}
                    disabled={!item.available}
                  >
                    {item.available ? (
                      <Text style={styles.timeText}>
                        <Ionicons name="time-outline" size={wp(3)} color={COLORS.primary} /> {item.start} - {item.end}
                      </Text>
                    ) : (
                      <Text style={styles.unavailableText}>Unavailable</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.availabilityRight}>
                  <View style={[styles.statusBadge, { backgroundColor: item.available ? COLORS.success + '15' : COLORS.textLight + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: item.available ? COLORS.success : COLORS.textLight }]} />
                    <Text style={[styles.statusText, { color: item.available ? COLORS.success : COLORS.textLight }]}>
                      {status.text}
                    </Text>
                  </View>
                  <Switch
                    value={item.available}
                    onValueChange={() => toggleAvailability(index)}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor={item.available ? COLORS.white : COLORS.white}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SehatLine v2.0.1</Text>
        </View>
      </SafeAreaView>

      {renderTimeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────────
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
  menuBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  headerLogo: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: wp(4.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  refreshBtn: {
    width: wp(9),
    height: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(4),
  },

  // ── Info Card ────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    flex: 1,
  },

  // ── Availability Item ────────────────────────────────────────────
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    marginBottom: hp(0.8),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  availabilityLeft: {
    flex: 1,
  },
  dayText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text,
  },
  dayTextDisabled: {
    color: COLORS.textLight,
  },
  timeContainer: {
    marginTop: hp(0.1),
  },
  timeText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  unavailableText: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    fontStyle: 'italic',
  },

  availabilityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
    gap: wp(0.8),
  },
  statusDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
  },
  statusText: {
    fontSize: wp(2.2),
    fontWeight: '500',
  },

  // ── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.92,
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  modalBody: {
    padding: wp(4),
  },
  modalDay: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  timeRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(0.5),
  },
  timeInputGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: hp(0.2),
  },
  timeInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.5),
    padding: wp(2.5),
    fontSize: wp(3.2),
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSecondary,
  },
  timeHint: {
    fontSize: wp(2.4),
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: hp(0.3),
  },
  saveTimeBtn: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
    marginTop: hp(1),
  },
  saveTimeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  saveTimeText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: '700',
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: wp(4),
  },
  footerText: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },
});

export default DoctorAvailabilityScreen;