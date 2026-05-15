import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, SafeAreaView,
  TouchableOpacity, Dimensions, Platform, StatusBar, ImageBackground,
  ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

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
    { id: '23', name: 'Doctors Lounge', floor: '3rd Floor', room: '320-DL', icon: 'people-outline', description: 'Staff休息室' },
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
      '1st Floor': '#04e1f5',
      '2nd Floor': '#8B5CF6',
      '3rd Floor': '#F59E0B',
    };
    return colors[floor] || '#04e1f5';
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
      style={styles.roomCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ARNavigation', { room: item.room, department: item.name })}
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0.45)']}
        style={styles.cardGradient}
      >
        <View style={[styles.floorIcon, { backgroundColor: getFloorColor(item.floor) + '15' }]}>
          <Ionicons name={item.icon} size={wp(6)} color={getFloorColor(item.floor)} />
        </View>
        
        <View style={styles.roomDetails}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomDescription} numberOfLines={1}>{item.description}</Text>
          <View style={styles.roomMeta}>
            <View style={styles.metaBadge}>
              <Ionicons name="location-outline" size={wp(3)} color="#04e1f5" />
              <Text style={styles.metaText}>Room: {item.room}</Text>
            </View>
            <View style={[styles.floorBadge, { backgroundColor: getFloorColor(item.floor) + '20' }]}>
              <Ionicons name="layers-outline" size={wp(2.5)} color={getFloorColor(item.floor)} />
              <Text style={[styles.floorText, { color: getFloorColor(item.floor) }]}>{item.floor}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.navIcon}>
          <Ionicons name="navigate-circle" size={wp(8)} color="#04e1f5" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            <ScrollView 
              style={styles.mainScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <LinearGradient
                colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
                style={styles.headerGradient}
              >
                <View style={styles.topHeader}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Room Directory</Text>
                  <View style={{ width: wp(10) }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={wp(5)} color="#04e1f5" />
                  <TextInput 
                    style={styles.searchInput}
                    placeholder="Search by room name, number or service..."
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
              </LinearGradient>

              {/* Floor Filter */}
              <FloorFilter />

              {/* Stats Banner */}
              <View style={styles.statsBanner}>
                <View style={styles.statItem}>
                  <Ionicons name="business" size={wp(4)} color="#10B981" />
                  <View>
                    <Text style={styles.statValue}>{rooms.length}</Text>
                    <Text style={styles.statLabel}>Locations</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="layers" size={wp(4)} color="#04e1f5" />
                  <View>
                    <Text style={styles.statValue}>5</Text>
                    <Text style={styles.statLabel}>Floors</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="navigate" size={wp(4)} color="#F59E0B" />
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
                    <Ionicons name="search-outline" size={wp(15)} color="#4B5563" />
                    <Text style={styles.emptyTitle}>No Locations Found</Text>
                    <Text style={styles.emptySubtitle}>Try adjusting your search or filter</Text>
                  </View>
                }
              />

              {/* Legend */}
              <View style={styles.legend}>
                <Text style={styles.legendTitle}>Floor Guide</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Ground Floor</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#04e1f5' }]} />
                    <Text style={styles.legendText}>1st Floor</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={styles.legendText}>2nd Floor</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
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
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(5, 44, 82, 0.36)' },
  safeArea: { flex: 1 },
  mainScroll: { flex: 1 },
  scrollContent: { paddingBottom: hp(5) },

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

  filterContainer: {
    maxHeight: hp(7),
    marginVertical: hp(1.5),
  },
  filterScroll: {
    paddingHorizontal: wp(4),
    gap: wp(2.5),
  },
  filterChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.3)',
  },
  filterChipActive: {
    backgroundColor: '#04e1f5',
    borderColor: '#04e1f5',
  },
  filterText: {
    color: '#04e1f5',
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },

  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: wp(4),
    paddingVertical: hp(1.2),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  statValue: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: wp(2.5),
  },
  statDivider: {
    width: 1,
    height: hp(3),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  listContent: {
    padding: wp(4),
    gap: hp(1.2),
  },

  roomCard: {
    borderRadius: wp(4),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  cardGradient: {
    flexDirection: 'row',
    padding: wp(3.5),
    gap: wp(3),
    alignItems: 'center',
  },
  floorIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },

  roomDetails: {
    flex: 1,
    gap: hp(0.5),
  },
  roomName: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  roomDescription: {
    color: '#94A3B8',
    fontSize: wp(2.8),
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(0.3),
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  metaText: {
    color: '#64748B',
    fontSize: wp(2.5),
  },
  floorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.8),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
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

  legend: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
    padding: wp(3.5),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  legendTitle: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
    marginBottom: hp(1.2),
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
    color: '#94A3B8',
    fontSize: wp(2.8),
  },
});

export default RoomDirectoryScreen;