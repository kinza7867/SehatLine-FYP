import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, TextInput, Platform, StatusBar, ImageBackground,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const isTablet = width >= 768;
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const HospitalDirectoryScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const floors = [
    { 
      floor: 'Basement', 
      icon: 'layers-outline',
      depts: [
        { name: 'Radiology', room: 'B-101', icon: 'scan-outline', description: 'X-Ray, CT Scan, MRI' },
        { name: 'MRI/CT Scan', room: 'B-105', icon: 'medical-outline', description: 'Advanced Imaging' },
        { name: 'Mortuary', room: 'B-LL', icon: 'fitness-outline', description: '24/7 Service' },
        { name: 'Parking', room: 'P1-P3', icon: 'car-outline', description: 'Patient & Visitor Parking' }
      ] 
    },
    { 
      floor: 'Ground Floor', 
      icon: 'business-outline',
      depts: [
        { name: 'Emergency', room: 'ER-Main', icon: 'flash-outline', description: '24/7 Emergency Care' },
        { name: 'OPD Registration', room: 'G-20', icon: 'clipboard-outline', description: 'New Patient Registration' },
        { name: 'Pharmacy', room: 'G-12', icon: 'medkit-outline', description: '24/7 Medicine Dispensary' },
        { name: 'Lab Collection', room: 'G-05', icon: 'flask-outline', description: 'Blood & Sample Collection' }
      ] 
    },
    { 
      floor: '1st Floor', 
      icon: 'chevron-up-circle-outline',
      depts: [
        { name: 'Cardiology', room: '101-C', icon: 'heart-outline', description: 'Heart Specialist' },
        { name: 'Neurology', room: '108-N', icon: 'pulse-outline', description: 'Brain & Nerve Specialist' },
        { name: 'Dialysis Unit', room: '115-D', icon: 'water-outline', description: 'Kidney Dialysis' },
        { name: 'Cafeteria', room: 'C-Wing', icon: 'restaurant-outline', description: 'Food & Refreshments' }
      ] 
    },
    {
      floor: '2nd Floor',
      icon: 'chevron-up-circle-outline',
      depts: [
        { name: 'Pediatrics', room: '201-P', icon: 'happy-outline', description: 'Child Specialist' },
        { name: 'Gynecology', room: '208-G', icon: 'female-outline', description: 'Women\'s Health' },
        { name: 'Physiotherapy', room: '215-PT', icon: 'fitness-outline', description: 'Rehabilitation' },
        { name: 'Laboratory', room: '220-L', icon: 'flask-outline', description: 'Pathology Tests' }
      ]
    },
    {
      floor: '3rd Floor',
      icon: 'chevron-up-circle-outline',
      depts: [
        { name: 'ICU', room: '301-ICU', icon: 'alert-circle-outline', description: 'Intensive Care Unit' },
        { name: 'Operation Theatre', room: '305-OT', icon: 'medical-outline', description: 'Surgical Suites' },
        { name: 'Recovery Room', room: '310-RR', icon: 'bed-outline', description: 'Post-op Care' },
        { name: 'Administration', room: '315-AD', icon: 'business-outline', description: 'Hospital Management' }
      ]
    }
  ];

  // Filter departments based on search
  const filteredFloors = floors.map(floor => ({
    ...floor,
    depts: floor.depts.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(floor => floor.depts.length > 0);

  const getFloorIcon = (floorName) => {
    if (floorName.includes('Basement')) return 'layers-outline';
    if (floorName.includes('Ground')) return 'business-outline';
    return 'chevron-up-circle-outline';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/3d/01/5f/3d015f0c3c861532da0215caa8207a15.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <LinearGradient
              colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
              style={styles.headerGradient}
            >
              <View style={styles.topHeader}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hospital Directory</Text>
                <View style={{ width: wp(10) }} />
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={wp(5)} color="#04e1f5" />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search departments, services..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={wp(4.5)} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Info Banner */}
              <View style={styles.infoBanner}>
                <Ionicons name="location-outline" size={wp(4)} color="#04e1f5" />
                <Text style={styles.infoText}>Tap on any department for AR Navigation</Text>
              </View>
            </LinearGradient>

            {/* Directory List */}
            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
            >
              {filteredFloors.length > 0 ? (
                filteredFloors.map((item, index) => (
                  <View key={index} style={styles.floorCard}>
                    {/* Floor Header */}
                    <LinearGradient
                      colors={['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)']}
                      style={styles.floorHeader}
                    >
                      <Ionicons name={item.icon} size={wp(5)} color="#04e1f5" />
                      <Text style={styles.floorText}>{item.floor.toUpperCase()}</Text>
                      <View style={styles.floorBadge}>
                        <Text style={styles.floorBadgeText}>{item.depts.length} Services</Text>
                      </View>
                    </LinearGradient>
                    
                    {/* Departments Grid */}
                    <View style={styles.deptGrid}>
                      {item.depts.map((dept, i) => (
                        <TouchableOpacity 
                          key={i} 
                          style={styles.deptCard}
                          activeOpacity={0.85}
                          onPress={() => navigation.navigate('ARNavigation', { 
                            room: dept.room,
                            department: dept.name 
                          })}
                        >
                          <View style={styles.deptIconWrapper}>
                            <LinearGradient
                              colors={['rgba(4, 225, 245, 0.2)', 'rgba(4, 225, 245, 0.05)']}
                              style={styles.deptIconGradient}
                            >
                              <Ionicons name={dept.icon} size={wp(5.5)} color="#04e1f5" />
                            </LinearGradient>
                          </View>
                          
                          <View style={styles.deptInfo}>
                            <Text style={styles.deptName}>{dept.name}</Text>
                            <Text style={styles.deptDescription}>{dept.description}</Text>
                            <View style={styles.roomRow}>
                              <Ionicons name="location-outline" size={wp(3)} color="#64748B" />
                              <Text style={styles.roomText}>Room: {dept.room}</Text>
                            </View>
                          </View>
                          
                          <View style={styles.navIcon}>
                            <Ionicons name="navigate-circle-outline" size={wp(6)} color="#04e1f5" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={wp(15)} color="#4B5563" />
                  <Text style={styles.emptyTitle}>No Results Found</Text>
                  <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
                </View>
              )}
              
              {/* Help Section */}
              <View style={styles.helpSection}>
                <LinearGradient
                  colors={['rgba(4, 225, 245, 0.08)', 'rgba(4, 225, 245, 0.03)']}
                  style={styles.helpCard}
                >
                  <Ionicons name="help-circle-outline" size={wp(6)} color="#04e1f5" />
                  <View style={styles.helpContent}>
                    <Text style={styles.helpTitle}>Need Help?</Text>
                    <Text style={styles.helpText}>Visit the information desk on Ground Floor or call our helpline</Text>
                    <TouchableOpacity style={styles.helpButton}>
                      <Text style={styles.helpButtonText}>Contact Reception →</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
              
              <View style={{ height: hp(10) }} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(2.5),
    borderBottomLeftRadius: wp(6),
    borderBottomRightRadius: wp(6),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  iconBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: wp(5), 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginHorizontal: wp(5),
    marginTop: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
    gap: wp(2.5),
  },
  searchInput: { 
    flex: 1, 
    color: '#fff', 
    fontSize: wp(3.5), 
    paddingVertical: hp(1.5),
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 225, 245, 0.08)',
    marginHorizontal: wp(5),
    marginTop: hp(1.5),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(4),
    gap: wp(2),
  },
  infoText: { color: '#04e1f5', fontSize: wp(3), fontWeight: '500' },

  scrollContent: { 
    padding: wp(4), 
    paddingBottom: hp(15),
  },
  
  floorCard: { 
    marginBottom: hp(2.5),
  },
  floorHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: hp(1.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(4),
    gap: wp(2),
  },
  floorText: { 
    color: '#04e1f5', 
    fontWeight: 'bold', 
    fontSize: wp(3.5), 
    letterSpacing: 1,
    flex: 1,
  },
  floorBadge: {
    backgroundColor: 'rgba(4, 225, 245, 0.15)',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
  },
  floorBadgeText: { color: '#04e1f5', fontSize: wp(2.5), fontWeight: '600' },
  
  deptGrid: { 
    gap: hp(1.2),
  },
  deptCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.45)', 
    padding: wp(3.5), 
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  deptIconWrapper: {
    marginRight: wp(3),
  },
  deptIconGradient: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  deptInfo: { 
    flex: 1,
  },
  deptName: { 
    color: '#fff', 
    fontSize: wp(3.8), 
    fontWeight: 'bold',
  },
  deptDescription: { 
    color: '#94A3B8', 
    fontSize: wp(2.8), 
    marginTop: hp(0.3),
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    marginTop: hp(0.5),
  },
  roomText: { 
    color: '#64748B', 
    fontSize: wp(2.5),
  },
  navIcon: {
    marginLeft: wp(2),
  },

  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: hp(10),
  },
  emptyTitle: { 
    color: '#9CA3AF', 
    fontSize: wp(4), 
    fontWeight: 'bold', 
    marginTop: hp(2),
  },
  emptySubtitle: { 
    color: '#6B7280', 
    fontSize: wp(3.2), 
    marginTop: hp(1),
  },

  helpSection: {
    marginTop: hp(3),
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.2)',
    gap: wp(3),
  },
  helpContent: {
    flex: 1,
    gap: hp(0.5),
  },
  helpTitle: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  helpText: {
    color: '#94A3B8',
    fontSize: wp(3),
    lineHeight: wp(4),
  },
  helpButton: {
    marginTop: hp(0.8),
  },
  helpButtonText: {
    color: '#04e1f5',
    fontSize: wp(3),
    fontWeight: '600',
  },
});

export default HospitalDirectoryScreen;