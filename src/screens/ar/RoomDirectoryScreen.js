import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, SafeAreaView,
  TouchableOpacity, Dimensions, Platform, StatusBar,
  ScrollView, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const isTablet = width >= 768;
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const RoomDirectoryScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('All');

  const floors = ['All', 'Basement', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];

  const rooms = [
    // Basement
    { id: '1', name: 'Radiology Department', floor: 'Basement', room: 'B-101', icon: 'scan-outline', description: 'X-Ray, CT Scan, MRI Services' },
    { id: '2', name: 'MRI/CT Scan Center', floor: 'Basement', room: 'B-105', icon: 'medical-outline', description: 'Advanced Imaging Center' },
    { id: '3', name: 'Parking Area', floor: 'Basement', room: 'P1-P3', icon: 'car-outline', description: 'Patient & Visitor Parking' },
    
    // Ground Floor
    { id: '4', name: 'Emergency Department', floor: 'Ground Floor', room: 'ER-Main', icon: 'flash-outline', description: '24/7 Emergency Services' },
    { id: '5', name: 'OPD Registration', floor: 'Ground Floor', room: 'G-20', icon: 'clipboard-outline', description: 'New Patient Registration' },
    { id: '6', name: 'Main Pharmacy', floor: 'Ground Floor', room: 'G-12', icon: 'medkit-outline', description: '24/7 Medicine Dispensary' },
    { id: '7', name: 'Lab Collection Center', floor: 'Ground Floor', room: 'G-05', icon: 'flask-outline', description: 'Blood & Sample Collection' },
    { id: '8', name: 'Information Desk', floor: 'Ground Floor', room: 'Main Lobby', icon: 'information-circle-outline', description: 'Hospital Guidance' },
    { id: '9', name: 'Cash Counter', floor: 'Ground Floor', room: 'G-08', icon: 'card-outline', description: 'Billing & Payments' },
    
    // 1st Floor
    { id: '10', name: 'Cardiology OPD', floor: '1st Floor', room: '101-C', icon: 'heart-outline', description: 'Heart Specialist Clinic' },
    { id: '11', name: 'Neurology OPD', floor: '1st Floor', room: '108-N', icon: 'pulse-outline', description: 'Brain & Nerve Clinic' },
    { id: '12', name: 'Dialysis Unit', floor: '1st Floor', room: '115-D', icon: 'water-outline', description: 'Kidney Dialysis Center' },
    { id: '13', name: 'Cafeteria', floor: '1st Floor', room: 'C-Wing', icon: 'restaurant-outline', description: 'Food & Refreshments' },
    { id: '14', name: 'Physiotherapy', floor: '1st Floor', room: '120-PT', icon: 'fitness-outline', description: 'Rehabilitation Center' },
    
    // 2nd Floor
    { id: '15', name: 'Pediatrics OPD', floor: '2nd Floor', room: '201-P', icon: 'happy-outline', description: 'Child Specialist Clinic' },
    { id: '16', name: 'Gynecology OPD', floor: '2nd Floor', room: '208-G', icon: 'female-outline', description: "Women's Health Clinic" },
    { id: '17', name: 'Laboratory', floor: '2nd Floor', room: '220-L', icon: 'flask-outline', description: 'Pathology & Diagnostics' },
    { id: '18', name: 'Ultrasound Center', floor: '2nd Floor', room: '215-U', icon: 'scan-outline', description: 'Ultrasound Services' },
    
    // 3rd Floor
    { id: '19', name: 'ICU', floor: '3rd Floor', room: '301-ICU', icon: 'alert-circle-outline', description: 'Intensive Care Unit' },
    { id: '20', name: 'Operation Theatre', floor: '3rd Floor', room: '305-OT', icon: 'medical-outline', description: 'Surgical Suites' },
    { id: '21', name: 'Recovery Room', floor: '3rd Floor', room: '310-RR', icon: 'bed-outline', description: 'Post-operative Care' },
    { id: '22', name: 'Administration Office', floor: '3rd Floor', room: '315-AD', icon: 'business-outline', description: 'Hospital Management' },
    { id: '23', name: 'Doctors Lounge', floor: '3rd Floor', room: '320-DL', icon: 'people-outline', description: 'Staff Lounge' },
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = selectedFloor === 'All' || room.floor === selectedFloor;
    return matchesSearch && matchesFloor;
  });

  const getFloorColor = (floor) => {
    const colors = {
      'Basement': '#6B7280',
      'Ground Floor': '#10B981',
      '1st Floor': COLORS.primary,
      '2nd Floor': COLORS.appointment,
      '3rd Floor': COLORS.warning,
    };
    return colors[floor] || COLORS.primary;
  };

  const FloorFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
      style={styles.filterContainer}
    >
      {floors.map((floor, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.filterChip, selectedFloor === floor && styles.filterChipActive]}
          onPress={() => setSelectedFloor(floor)}
        >
          <Text style={[styles.filterText, selectedFloor === floor && styles.filterTextActive]}>
            {floor}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.roomCard, styles.cardShadow]}
      activeOpacity={0.85}
      onPress={() => Alert.alert('Navigation', `Navigate to ${item.name} - ${item.room}`)}
    >
      <View style={styles.cardContent}>
        <View style={[styles.floorIcon, { backgroundColor: getFloorColor(item.floor) + '15' }]}>
          <Ionicons name={item.icon} size={wp(5.5)} color={getFloorColor(item.floor)} />
        </View>
        
        <View style={styles.roomDetails}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomDescription} numberOfLines={1}>{item.description}</Text>
          <View style={styles.roomMeta}>
            <View style={styles.metaBadge}>
              <Ionicons name="location-outline" size={wp(2.5)} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>Room: {item.room}</Text>
            </View>
            <View style={[styles.floorBadge, { backgroundColor: getFloorColor(item.floor) + '15' }]}>
              <Ionicons name="layers-outline" size={wp(2)} color={getFloorColor(item.floor)} />
              <Text style={[styles.floorText, { color: getFloorColor(item.floor) }]}>{item.floor}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.navIcon}>
          <Ionicons name="chevron-forward" size={wp(4.5)} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <ScrollView 
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Room Directory</Text>
              <View style={{ width: wp(10) }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={wp(4.5)} color={COLORS.textSecondary} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search by room name, number or service..."
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

          {/* Floor Filter */}
          <FloorFilter />

          {/* Stats Banner */}
          <View style={[styles.statsBanner, styles.cardShadow]}>
            <View style={styles.statItem}>
              <Ionicons name="business-outline" size={wp(4)} color={COLORS.success} />
              <View>
                <Text style={styles.statValue}>{rooms.length}</Text>
                <Text style={styles.statLabel}>Locations</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={wp(4)} color={COLORS.primary} />
              <View>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Floors</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="navigate-outline" size={wp(4)} color={COLORS.warning} />
              <View>
                <Text style={styles.statValue}>AR</Text>
                <Text style={styles.statLabel}>Navigation</Text>
              </View>
            </View>
          </View>

          {/* Room List */}
          <FlatList
            data={filteredRooms}
            keyExtractor={item => item.id}
            renderItem={renderRoomItem}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={wp(12)} color={COLORS.border} />
                <Text style={styles.emptyTitle}>No Locations Found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or filter</Text>
              </View>
            }
          />

          {/* Legend */}
          <View style={[styles.legend, styles.cardShadow]}>
            <Text style={styles.legendTitle}>Floor Guide</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Ground Floor</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>1st Floor</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.appointment }]} />
                <Text style={styles.legendText}>2nd Floor</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.legendText}>3rd Floor</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
                <Text style={styles.legendText}>Basement</Text>
              </View>
            </View>
          </View>

          <View style={{ height: hp(5) }} />
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
  mainScroll: { 
    flex: 1 
  },
  scrollContent: { 
    paddingBottom: hp(5) 
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
    maxHeight: hp(7),
    marginVertical: hp(1.5),
  },
  filterScroll: {
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  filterChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
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

  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    paddingVertical: hp(1.2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  statValue: {
    color: COLORS.text,
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: wp(2.5),
  },
  statDivider: {
    width: 1,
    height: hp(3),
    backgroundColor: COLORS.border,
  },

  listContent: {
    padding: wp(4),
    gap: hp(1),
  },

  roomCard: {
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
    alignItems: 'center',
  },
  floorIcon: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },

  roomDetails: {
    flex: 1,
    gap: hp(0.3),
  },
  roomName: {
    color: COLORS.text,
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  roomDescription: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(0.2),
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.5),
  },
  floorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.8),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  floorText: {
    fontSize: wp(2.3),
    fontWeight: '600',
  },

  navIcon: {
    marginLeft: wp(1),
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

  legend: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
    padding: wp(3.5),
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendTitle: {
    color: COLORS.text,
    fontSize: wp(3.5),
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  legendDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
  },
});

export default RoomDirectoryScreen;