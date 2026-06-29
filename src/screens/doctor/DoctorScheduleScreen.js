import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Platform, StatusBar,
  SafeAreaView, TextInput
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const isTablet = width >= 768;
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const DoctorScheduleScreen = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const schedules = [
    { 
      id: 1, name: 'Dr. Arshad Khan', dept: 'Cardiology', 
      days: ['Monday', 'Wednesday', 'Friday'], 
      time: '09:00 AM - 01:00 PM',
      room: 'Room 101-C',
      experience: '15+ years',
      qualification: 'FCPS Cardiology',
      patients: '12+ patients/day',
      image: '👨‍⚕️'
    },
    { 
      id: 2, name: 'Dr. Sarah Ahmed', dept: 'Neurology', 
      days: ['Tuesday', 'Thursday', 'Saturday'], 
      time: '11:00 AM - 04:00 PM',
      room: 'Room 108-N',
      experience: '10+ years',
      qualification: 'FCPS Neurology',
      patients: '10+ patients/day',
      image: '👩‍⚕️'
    },
    { 
      id: 3, name: 'Dr. Fatima Hassan', dept: 'Pediatrics', 
      days: ['Monday', 'Tuesday', 'Thursday'], 
      time: '10:00 AM - 02:00 PM',
      room: 'Room 201-P',
      experience: '8+ years',
      qualification: 'MBBS, FCPS Pediatrics',
      patients: '15+ patients/day',
      image: '👩‍⚕️'
    },
    { 
      id: 4, name: 'Dr. Omar Farooq', dept: 'Orthopedics', 
      days: ['Wednesday', 'Friday', 'Saturday'],
      time: '02:00 PM - 06:00 PM',
      room: 'Room 108-OR',
      experience: '12+ years',
      qualification: 'MS Orthopedics',
      patients: '8+ patients/day',
      image: '👨‍⚕️'
    },
    { 
      id: 5, name: 'Dr. Zainab Ali', dept: 'Gynecology', 
      days: ['Monday', 'Wednesday', 'Thursday'],
      time: '09:00 AM - 01:00 PM',
      room: 'Room 208-G',
      experience: '9+ years',
      qualification: 'FCPS Gynecology',
      patients: '18+ patients/day',
      image: '👩‍⚕️'
    },
    { 
      id: 6, name: 'Dr. Usman Chaudhry', dept: 'Dermatology', 
      days: ['Tuesday', 'Thursday', 'Friday'],
      time: '01:00 PM - 05:00 PM',
      room: 'Room 117-D',
      experience: '7+ years',
      qualification: 'FCPS Dermatology',
      patients: '20+ patients/day',
      image: '👨‍⚕️'
    },
    { 
      id: 7, name: 'Dr. Amna Tariq', dept: 'Ophthalmology', 
      days: ['Monday', 'Wednesday', 'Saturday'],
      time: '10:00 AM - 02:00 PM',
      room: 'Room 118-O',
      experience: '11+ years',
      qualification: 'FCPS Ophthalmology',
      patients: '14+ patients/day',
      image: '👩‍⚕️'
    },
    { 
      id: 8, name: 'Dr. Bilal Raza', dept: 'ENT', 
      days: ['Tuesday', 'Thursday', 'Friday'],
      time: '02:00 PM - 06:00 PM',
      room: 'Room 112-E',
      experience: '6+ years',
      qualification: 'FCPS ENT',
      patients: '10+ patients/day',
      image: '👨‍⚕️'
    },
  ];

  const filteredSchedules = schedules.filter(doctor => {
    const matchesDay = selectedDay === 'All' || doctor.days.includes(selectedDay);
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doctor.dept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesSearch;
  });

  const getDepartmentColor = (dept) => {
    const colors = {
      'Cardiology': COLORS.danger,
      'Neurology': COLORS.appointment,
      'Pediatrics': COLORS.success,
      'Orthopedics': COLORS.warning,
      'Gynecology': '#EC4899',
      'Dermatology': COLORS.info,
      'Ophthalmology': '#3B82F6',
      'ENT': '#F97316',
    };
    return colors[dept] || COLORS.primary;
  };

  const getDepartmentIcon = (dept) => {
    const icons = {
      'Cardiology': 'heart-outline',
      'Neurology': 'pulse-outline',
      'Pediatrics': 'happy-outline',
      'Orthopedics': 'fitness-outline',
      'Gynecology': 'female-outline',
      'Dermatology': 'color-palette-outline',
      'Ophthalmology': 'eye-outline',
      'ENT': 'ear-outline',
    };
    return icons[dept] || 'medical-outline';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.25 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Doctor Schedule</Text>
            <View style={{ width: wp(10) }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={wp(4.5)} color={COLORS.textSecondary} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by doctor name or department..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={wp(4)} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Day Filter */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.filterChip, selectedDay === day && styles.filterChipActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.filterText, selectedDay === day && styles.filterTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Schedule List */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((doctor) => (
              <TouchableOpacity key={doctor.id} style={[styles.doctorCard, styles.cardShadow]} activeOpacity={0.85}>
                <View style={styles.cardContent}>
                  {/* Doctor Avatar */}
                  <View style={[styles.avatarContainer, { backgroundColor: getDepartmentColor(doctor.dept) + '20' }]}>
                    <Text style={styles.doctorEmoji}>{doctor.image}</Text>
                  </View>

                  {/* Doctor Info */}
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <View style={styles.deptBadge}>
                      <Ionicons name={getDepartmentIcon(doctor.dept)} size={wp(3)} color={getDepartmentColor(doctor.dept)} />
                      <Text style={[styles.department, { color: getDepartmentColor(doctor.dept) }]}>
                        {doctor.dept}
                      </Text>
                    </View>
                    
                    {/* Schedule Details */}
                    <View style={styles.scheduleGrid}>
                      <View style={styles.scheduleItem}>
                        <Ionicons name="calendar-outline" size={wp(3)} color={COLORS.primary} />
                        <Text style={styles.scheduleText} numberOfLines={1}>
                          {doctor.days.join(', ')}
                        </Text>
                      </View>
                      <View style={styles.scheduleItem}>
                        <Ionicons name="time-outline" size={wp(3)} color={COLORS.primary} />
                        <Text style={styles.scheduleText}>{doctor.time}</Text>
                      </View>
                      <View style={styles.scheduleItem}>
                        <Ionicons name="location-outline" size={wp(3)} color={COLORS.primary} />
                        <Text style={styles.scheduleText}>{doctor.room}</Text>
                      </View>
                    </View>

                    {/* Qualification & Experience */}
                    <View style={styles.qualificationRow}>
                      <View style={styles.qualBadge}>
                        <Ionicons name="school-outline" size={wp(2.5)} color={COLORS.success} />
                        <Text style={styles.qualText}>{doctor.qualification}</Text>
                      </View>
                      <View style={styles.qualBadge}>
                        <Ionicons name="star-outline" size={wp(2.5)} color={COLORS.warning} />
                        <Text style={styles.qualText}>{doctor.experience}</Text>
                      </View>
                      <View style={styles.qualBadge}>
                        <Ionicons name="people-outline" size={wp(2.5)} color={COLORS.primary} />
                        <Text style={styles.qualText}>{doctor.patients}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Book Button */}
                  <TouchableOpacity 
                    style={[styles.bookButton, { backgroundColor: getDepartmentColor(doctor.dept) }]}
                    onPress={() => navigation.navigate('BookAppointmentScreen', { doctor: doctor })}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                    <Ionicons name="arrow-forward" size={wp(3)} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={wp(12)} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Doctors Found</Text>
              <Text style={styles.emptySubtitle}>Try selecting a different day or search term</Text>
            </View>
          )}
          
          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle" size={wp(4)} color={COLORS.primary} />
            <Text style={styles.infoNoteText}>
              Timings may vary on public holidays. Please call ahead to confirm.
            </Text>
          </View>
          
          <View style={{ height: hp(10) }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  safeArea: { 
    flex: 1 
  },

  cardShadow: { ...SHADOWS.medium },

  // Header
  headerContainer: {
    paddingBottom: hp(1),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
    paddingBottom: hp(1.5),
  },
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: wp(5),
    marginTop: hp(1.5),
    paddingHorizontal: wp(3.5),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: wp(2),
    ...SHADOWS.small,
  },
  searchInput: { 
    flex: 1, 
    color: COLORS.text, 
    fontSize: wp(3.5), 
    paddingVertical: hp(1.2),
  },

  filterContainer: {
    paddingVertical: hp(1),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScroll: {
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  filterChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },

  scrollContent: { 
    padding: wp(4), 
    paddingBottom: hp(5),
  },

  doctorCard: {
    marginBottom: hp(1.5),
    borderRadius: wp(4),
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    padding: wp(3.5),
    gap: wp(3),
  },

  avatarContainer: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(3.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorEmoji: {
    fontSize: wp(7),
  },

  doctorInfo: {
    flex: 1,
    gap: hp(0.5),
  },
  doctorName: {
    color: COLORS.text,
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  department: {
    fontSize: wp(3),
    fontWeight: '600',
  },

  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(1.5),
    marginTop: hp(0.3),
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  scheduleText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.5),
  },

  qualificationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    marginTop: hp(0.3),
  },
  qualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  qualText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.5),
  },

  bookButton: {
    alignSelf: 'center',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.6),
    borderRadius: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: wp(2.8),
    fontWeight: 'bold',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: wp(4),
    fontWeight: 'bold',
    marginTop: hp(2),
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: wp(3.2),
    marginTop: hp(1),
  },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: wp(3),
    borderRadius: wp(3),
    gap: wp(2),
    marginTop: hp(2),
  },
  infoNoteText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
    flex: 1,
  },
});

export default DoctorScheduleScreen;