import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  StatusBar, Dimensions, Image, Platform, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

const DoctorDashboardScreen = ({ navigation }) => {
  // Mock doctor data with real-time stats
  const doctorData = {
    name: 'Dr. Sara Malik',
    specialization: 'Interventional Cardiologist',
    department: 'Cardiology',
    todayPatients: 18,
    waitingPatients: 4,
    completedPatients: 14,
    priorityPatients: 2,
    rating: 4.8,
    experience: '12 Years',
    totalPatients: 1247,
    successRate: 98,
    availableSlots: 3,
    nextPatient: 'Ahmed Khan',
    nextToken: 'A-145',
    queuePosition: 4,
  };

  const stats = [
    { 
      label: 'Today\'s Patients', 
      value: doctorData.todayPatients, 
      icon: 'people-outline', 
      color: COLORS.primary,
      bgColor: COLORS.primary + '15'
    },
    { 
      label: 'Waiting', 
      value: doctorData.waitingPatients, 
      icon: 'time-outline', 
      color: COLORS.warning,
      bgColor: COLORS.warning + '15'
    },
    { 
      label: 'Completed', 
      value: doctorData.completedPatients, 
      icon: 'checkmark-done-outline', 
      color: COLORS.success,
      bgColor: COLORS.success + '15'
    },
    { 
      label: 'Priority', 
      value: doctorData.priorityPatients, 
      icon: 'alert-circle-outline', 
      color: COLORS.danger,
      bgColor: COLORS.danger + '15'
    },
  ];

  const quickActions = [
    { 
      id: 1,
      title: 'Call Next', 
      desc: 'Call next patient',
      icon: 'call-outline', 
      color: COLORS.primary,
      screen: 'CallNextPatientScreen'
    },
    { 
      id: 2,
      title: 'Queue', 
      desc: 'View queue',
      icon: 'people-outline', 
      color: COLORS.warning,
      screen: 'RealTimeQueueScreen'
    },
    { 
      id: 3,
      title: 'Load Balance', 
      desc: 'Distribute patients',
      icon: 'git-branch-outline', 
      color: COLORS.appointment,
      screen: 'DoctorLoadBalancerScreen'
    },
    { 
      id: 4,
      title: 'Availability', 
      desc: 'Set schedule',
      icon: 'calendar-outline', 
      color: COLORS.success,
      screen: 'DoctorAvailabilityScreen'
    },
    { 
      id: 5,
      title: 'Occupancy', 
      desc: 'Hospital map',
      icon: 'stats-chart-outline', 
      color: COLORS.danger,
      screen: 'OccupancyHeatmapScreen'
    },
    { 
      id: 6,
      title: 'Records', 
      desc: 'Patient history',
      icon: 'document-text-outline', 
      color: COLORS.info,
      screen: 'PatientHistoryScreen'
    },
    { 
      id: 7,
      title: 'Profile', 
      desc: 'My profile',
      icon: 'person-outline', 
      color: COLORS.appointment,
      screen: 'DoctorProfileScreen'
    },
    { 
      id: 8,
      title: 'Reports', 
      desc: 'View reports',
      icon: 'bar-chart-outline', 
      color: COLORS.reports,
      screen: 'ReportsScreen'
    },
  ];

  const handleActionPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Good Morning,</Text>
                <Text style={styles.doctorName}>{doctorData.name}</Text>
                <Text style={styles.specialization}>{doctorData.specialization}</Text>
                <Text style={styles.department}>{doctorData.department}</Text>
              </View>
              <View style={styles.profileCircle}>
                <Image 
                  source={require('../../../assets/logo.png')} 
                  style={styles.profileImage}
                />
              </View>
            </View>
            
            {/* Rating & Experience */}
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, styles.cardShadow]}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.badgeText}>{doctorData.rating} ★</Text>
              </View>
              <View style={[styles.badge, styles.cardShadow]}>
                <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
                <Text style={styles.badgeText}>{doctorData.experience}</Text>
              </View>
              <View style={[styles.badge, styles.cardShadow]}>
                <Ionicons name="time-outline" size={14} color={COLORS.success} />
                <Text style={styles.badgeText}>Available Slots: {doctorData.availableSlots}</Text>
              </View>
            </View>
          </View>

          {/* Next Patient Alert */}
          <View style={[styles.nextPatientCard, styles.cardShadow]}>
            <LinearGradient
              colors={[COLORS.primary + '15', COLORS.secondary + '10']}
              style={styles.nextPatientGradient}
            >
              <View style={styles.nextPatientLeft}>
                <View style={styles.nextPatientIcon}>
                  <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.nextPatientLabel}>Next Patient</Text>
                  <Text style={styles.nextPatientName}>{doctorData.nextPatient}</Text>
                  <Text style={styles.nextPatientToken}>Token: {doctorData.nextToken}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.nextPatientBtn, styles.cardShadow]}
                onPress={() => handleActionPress('CallNextPatientScreen')}
              >
                <Text style={styles.nextPatientBtnText}>Call Now</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Stats Cards Row */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={[styles.statCard, styles.cardShadow]}>
                <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions Section */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id}
                style={[styles.actionCard, styles.cardShadow]}
                activeOpacity={0.8}
                onPress={() => handleActionPress(action.screen)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDesc}>{action.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's Schedule */}
          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <View style={[styles.scheduleCard, styles.cardShadow]}>
              <View style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.scheduleTimeText}>09:00 AM - 01:00 PM</Text>
                </View>
                <View style={[styles.scheduleStatusBadge, { backgroundColor: COLORS.success + '15' }]}>
                  <Text style={[styles.scheduleStatusText, { color: COLORS.success }]}>Active</Text>
                </View>
              </View>
              <View style={styles.scheduleDivider} />
              <View style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.scheduleTimeText}>02:00 PM - 06:00 PM</Text>
                </View>
                <View style={[styles.scheduleStatusBadge, { backgroundColor: COLORS.warning + '15' }]}>
                  <Text style={[styles.scheduleStatusText, { color: COLORS.warning }]}>Upcoming</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stats Footer */}
          <View style={[styles.footerStats, styles.cardShadow]}>
            <View style={styles.footerStatItem}>
              <Ionicons name="medkit-outline" size={18} color={COLORS.primary} />
              <Text style={styles.footerStatText}>Total: {doctorData.totalPatients}</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerStatItem}>
              <Ionicons name="thumbs-up-outline" size={18} color={COLORS.success} />
              <Text style={styles.footerStatText}>Success: {doctorData.successRate}%</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerStatItem}>
              <Ionicons name="people-outline" size={18} color={COLORS.warning} />
              <Text style={styles.footerStatText}>Queue: {doctorData.queuePosition}</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Header Section
  header: {
    paddingHorizontal: SIZES.xl,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: SIZES.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '500',
    opacity: 0.8,
  },
  doctorName: {
    color: COLORS.white,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginTop: 4,
  },
  specialization: {
    color: COLORS.white,
    fontSize: SIZES.body,
    marginTop: 2,
    opacity: 0.9,
  },
  department: {
    color: COLORS.white,
    fontSize: SIZES.small,
    opacity: 0.7,
    marginTop: 2,
  },
  profileCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  cardShadow: { ...SHADOWS.medium },
  badgeText: {
    color: COLORS.text,
    fontSize: SIZES.small,
  },

  // Next Patient Card
  nextPatientCard: {
    marginHorizontal: SIZES.xl,
    marginBottom: SIZES.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextPatientGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextPatientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextPatientIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  nextPatientLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  nextPatientName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  nextPatientToken: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  nextPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  nextPatientBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: SIZES.small,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.xl,
    gap: 10,
    marginBottom: SIZES.xl,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2 - 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Quick Actions
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginHorizontal: SIZES.xl,
    marginBottom: SIZES.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.xl,
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2 - 6,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xSmall,
  },

  // Schedule Section
  scheduleSection: {
    marginTop: SIZES.xl,
  },
  scheduleCard: {
    marginHorizontal: SIZES.xl,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleTimeText: {
    color: COLORS.text,
    fontSize: SIZES.body,
  },
  scheduleStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleStatusText: {
    fontSize: SIZES.xSmall,
    fontWeight: '500',
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },

  // Footer Stats
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginHorizontal: SIZES.xl,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  footerDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  footerStatText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    fontWeight: '500',
  },
});

export default DoctorDashboardScreen;