import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  ImageBackground, StatusBar, Dimensions, Image, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const DoctorDashboardScreen = ({ navigation }) => {
  // Mock doctor data
  const doctorData = {
    name: 'Dr. Sara Malik',
    specialization: 'Cardiologist',
    todayPatients: 18,
    waitingPatients: 4,
    completedPatients: 14,
    priorityPatients: 2,
    rating: 4.8,
    experience: '8+ years'
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/76/55/87/765587e389328e851fb9b1a5528fec76.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)']}
          style={StyleSheet.absoluteFill}
        />

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
              </View>
              <View style={styles.profileCircle}>
                <Ionicons name="person-circle" size={55} color="#04e1f5" />
              </View>
            </View>
            
            {/* Rating & Experience */}
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.badgeText}>{doctorData.rating} ★</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="briefcase" size={14} color="#04e1f5" />
                <Text style={styles.badgeText}>{doctorData.experience}</Text>
              </View>
            </View>
          </View>

          {/* Stats Cards Row */}
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)']}
              style={[styles.statCard, { borderColor: '#04e1f5' }]}
            >
              <View style={[styles.statIcon, { backgroundColor: 'rgba(4, 225, 245, 0.2)' }]}>
                <Ionicons name="people" size={28} color="#04e1f5" />
              </View>
              <Text style={styles.statNumber}>{doctorData.todayPatients}</Text>
              <Text style={styles.statLabel}>Today's Patients</Text>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(255, 77, 77, 0.15)', 'rgba(255, 77, 77, 0.05)']}
              style={[styles.statCard, { borderColor: '#FF4D4D' }]}
            >
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 77, 77, 0.2)' }]}>
                <Ionicons name="time" size={28} color="#FF4D4D" />
              </View>
              <Text style={[styles.statNumber, { color: '#FF4D4D' }]}>{doctorData.waitingPatients}</Text>
              <Text style={styles.statLabel}>Waiting</Text>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(0, 255, 136, 0.15)', 'rgba(0, 255, 136, 0.05)']}
              style={[styles.statCard, { borderColor: '#00FF88' }]}
            >
              <View style={[styles.statIcon, { backgroundColor: 'rgba(0, 255, 136, 0.2)' }]}>
                <Ionicons name="checkmark-done" size={28} color="#00FF88" />
              </View>
              <Text style={[styles.statNumber, { color: '#00FF88' }]}>{doctorData.completedPatients}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </LinearGradient>
          </View>

          {/* Priority Alert */}
          {doctorData.priorityPatients > 0 && (
            <TouchableOpacity style={styles.priorityAlert} activeOpacity={0.9}>
              <LinearGradient
                colors={['rgba(255, 77, 77, 0.9)', 'rgba(255, 77, 77, 0.7)']}
                style={styles.priorityGradient}
              >
                <Ionicons name="warning" size={24} color="#FFF" />
                <View style={styles.priorityTextContainer}>
                  <Text style={styles.priorityTitle}>Priority Patients Waiting</Text>
                  <Text style={styles.priorityDesc}>{doctorData.priorityPatients} critical patients need immediate attention</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Quick Actions Section */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CallNextPatientScreen')}
            >
              <LinearGradient
                colors={['rgba(4, 225, 245, 0.1)', 'rgba(4, 225, 245, 0.05)']}
                style={styles.actionGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(4, 225, 245, 0.15)' }]}>
                  <Ionicons name="call" size={32} color="#04e1f5" />
                </View>
                <Text style={styles.actionTitle}>Call Next</Text>
                <Text style={styles.actionDesc}>Call next patient</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RealTimeQueueScreen')}
            >
              <LinearGradient
                colors={['rgba(255, 184, 0, 0.1)', 'rgba(255, 184, 0, 0.05)']}
                style={styles.actionGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 184, 0, 0.15)' }]}>
                  <Ionicons name="people" size={32} color="#FFB800" />
                </View>
                <Text style={styles.actionTitle}>Queue</Text>
                <Text style={styles.actionDesc}>View queue</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DoctorLoadBalancerScreen')}
            >
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.1)', 'rgba(168, 85, 247, 0.05)']}
                style={styles.actionGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                  <Ionicons name="git-branch" size={32} color="#A855F7" />
                </View>
                <Text style={styles.actionTitle}>Load Balance</Text>
                <Text style={styles.actionDesc}>Distribute patients</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DoctorAvailabilityScreen')}
            >
              <LinearGradient
                colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.05)']}
                style={styles.actionGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(0, 255, 136, 0.15)' }]}>
                  <Ionicons name="calendar" size={32} color="#00FF88" />
                </View>
                <Text style={styles.actionTitle}>Availability</Text>
                <Text style={styles.actionDesc}>Set schedule</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('OccupancyHeatmapScreen')}
            >
              <LinearGradient
                colors={['rgba(255, 77, 109, 0.1)', 'rgba(255, 77, 109, 0.05)']}
                style={styles.actionGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 77, 109, 0.15)' }]}>
                  <Ionicons name="stats-chart" size={32} color="#FF4D6D" />
                </View>
                <Text style={styles.actionTitle}>Occupancy</Text>
                <Text style={styles.actionDesc}>Hospital map</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PatientHistoryScreen')}
            >
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                style={styles.actionGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Ionicons name="document-text" size={32} color="#3B82F6" />
                </View>
                <Text style={styles.actionTitle}>Records</Text>
                <Text style={styles.actionDesc}>Patient history</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DoctorProfileScreen')}
            >
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                style={styles.actionGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Ionicons name="person" size={32} color="#EC4899" />
                </View>
                <Text style={styles.actionTitle}>Profile</Text>
                <Text style={styles.actionDesc}>My profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Today's Schedule Preview */}
          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <LinearGradient
              colors={['rgba(4, 225, 245, 0.1)', 'rgba(4, 225, 245, 0.05)']}
              style={styles.scheduleCard}
            >
              <View style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Ionicons name="time-outline" size={16} color="#04e1f5" />
                  <Text style={styles.scheduleTimeText}>09:00 AM - 01:00 PM</Text>
                </View>
                <Text style={styles.scheduleStatus}>Morning Shift</Text>
              </View>
              <View style={styles.scheduleDivider} />
              <View style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Ionicons name="time-outline" size={16} color="#04e1f5" />
                  <Text style={styles.scheduleTimeText}>02:00 PM - 06:00 PM</Text>
                </View>
                <Text style={styles.scheduleStatus}>Evening Shift</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Stats Footer */}
          <View style={styles.footerStats}>
            <View style={styles.footerStatItem}>
              <Ionicons name="medkit" size={20} color="#04e1f5" />
              <Text style={styles.footerStatText}>Total Patients: 1,247</Text>
            </View>
            <View style={styles.footerStatItem}>
              <Ionicons name="thumbs-up" size={20} color="#00FF88" />
              <Text style={styles.footerStatText}>Success Rate: 98%</Text>
            </View>
          </View>

        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Header Section
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 25,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#CCE3E5',
    fontSize: 14,
    fontWeight: '500',
  },
  doctorName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  specialization: {
    color: '#04e1f5',
    fontSize: 14,
    marginTop: 2,
  },
  profileCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#04e1f5',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#CCE3E5',
    fontSize: 12,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#CCE3E5',
    marginTop: 4,
  },

  // Priority Alert
  priorityAlert: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  priorityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  priorityTextContainer: {
    flex: 1,
  },
  priorityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priorityDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },

  // Quick Actions
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  actionIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDesc: {
    color: '#888',
    fontSize: 11,
  },

  // Schedule Section
  scheduleSection: {
    marginTop: 20,
  },
  scheduleCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
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
    color: '#CCE3E5',
    fontSize: 13,
  },
  scheduleStatus: {
    color: '#04e1f5',
    fontSize: 12,
    fontWeight: '500',
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },

  // Footer Stats
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
  },
  footerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerStatText: {
    color: '#888',
    fontSize: 11,
  },
});

export default DoctorDashboardScreen;