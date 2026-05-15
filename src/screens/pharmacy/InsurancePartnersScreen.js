import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity,
  Dimensions, Platform, StatusBar, ImageBackground, TextInput, ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const InsurancePartnersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const insuranceTypes = ['All', 'Govt Panel', 'Private', 'Corporate', 'International'];

  const partners = [
    // Govt Panel
    { id: '1', name: 'State Life Insurance Corporation', type: 'Govt Panel', coverage: 'Full Coverage', color: '#10B981', discount: '100%', network: 'All Hospitals', cashless: true, phone: '0800-12345' },
    { id: '2', name: 'Pakistan Bait-ul-Mal', type: 'Govt Panel', coverage: 'Full Coverage', color: '#10B981', discount: '100%', network: 'Govt Hospitals', cashless: true, phone: '0800-67890' },
    { id: '3', name: 'Employees Old-Age Benefits', type: 'Govt Panel', coverage: 'Standard', color: '#10B981', discount: '80%', network: 'Selected Hospitals', cashless: true, phone: '051-111-123' },
    
    // Private
    { id: '4', name: 'Jubilee General Insurance', type: 'Private', coverage: 'Comprehensive', color: '#FF4D6D', discount: '70%', network: 'Nationwide', cashless: true, phone: '0800-77777' },
    { id: '5', name: 'EFU Life Assurance', type: 'Private', coverage: 'Standard Plus', color: '#F59E0B', discount: '60%', network: 'Major Hospitals', cashless: true, phone: '0800-33333' },
    { id: '6', name: 'Allianz EFU Health', type: 'Private', coverage: 'Premium', color: '#F59E0B', discount: '75%', network: 'All Hospitals', cashless: true, phone: '0800-44444' },
    { id: '7', name: 'Pak Qatar Takaful', type: 'Private', coverage: 'Standard', color: '#FF4D6D', discount: '65%', network: 'Selected Hospitals', cashless: false, phone: '0800-55555' },
    
    // Corporate
    { id: '8', name: 'Adamjee Insurance', type: 'Corporate', coverage: 'Platinum Plus', color: '#04e1f5', discount: '80%', network: 'All Major Hospitals', cashless: true, phone: '0800-88888' },
    { id: '9', name: 'ICICI Lombard', type: 'Corporate', coverage: 'Corporate Elite', color: '#04e1f5', discount: '85%', network: 'Nationwide', cashless: true, phone: '0800-99999' },
    { id: '10', name: 'HBL Insurance', type: 'Corporate', coverage: 'Business Secure', color: '#04e1f5', discount: '75%', network: 'Selected Hospitals', cashless: true, phone: '0800-11111' },
    
    // International
    { id: '11', name: 'Aga Khan Health', type: 'International', coverage: 'Worldwide', color: '#8B5CF6', discount: '90%', network: 'International Network', cashless: true, phone: '0800-22222' },
    { id: '12', name: 'Cigna Global', type: 'International', coverage: 'Global Elite', color: '#8B5CF6', discount: '85%', network: 'Worldwide', cashless: true, phone: '0800-66666' },
    { id: '13', name: 'Allied Global Health', type: 'International', coverage: 'International Plus', color: '#8B5CF6', discount: '80%', network: 'International', cashless: false, phone: '0800-77788' },
  ];

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          partner.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || partner.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch(type) {
      case 'Govt Panel': return '#10B981';
      case 'Private': return '#FF4D6D';
      case 'Corporate': return '#04e1f5';
      case 'International': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Govt Panel': return 'shield-checkmark';
      case 'Private': return 'business';
      case 'Corporate': return 'briefcase';
      case 'International': return 'globe';
      default: return 'medkit';
    }
  };

  const TypeFilter = () => (
    <View style={styles.filterWrapper}>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
      style={styles.filterContainer}
    >
      {insuranceTypes.map((type, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
          onPress={() => setSelectedType(type)}
        >
          <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    </View>
  );

  const renderPartnerCard = ({ item }) => (
    <View style={styles.partnerCard}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0.45)']}
        style={styles.cardGradient}
      >
        <View style={[styles.statusLine, { backgroundColor: item.color }]} />
        
        <View style={styles.partnerContent}>
          <View style={styles.partnerHeader}>
            <View style={[styles.partnerIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={getTypeIcon(item.type)} size={wp(5)} color={item.color} />
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{item.name}</Text>
              <View style={styles.typeBadge}>
                <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>{item.type}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="shield-checkmark" size={wp(3)} color="#64748B" />
              <Text style={styles.detailLabel}>Coverage:</Text>
              <Text style={styles.detailValue}>{item.coverage}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="percent" size={wp(3)} color="#64748B" />
              <Text style={styles.detailLabel}>Discount:</Text>
              <Text style={styles.detailValue}>{item.discount}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={wp(3)} color="#64748B" />
              <Text style={styles.detailLabel}>Network:</Text>
              <Text style={styles.detailValue}>{item.network}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name={item.cashless ? "card" : "alert-circle"} size={wp(3)} color={item.cashless ? "#10B981" : "#F59E0B"} />
              <Text style={styles.detailLabel}>Cashless:</Text>
              <Text style={[styles.detailValue, { color: item.cashless ? "#10B981" : "#F59E0B" }]}>
                {item.cashless ? "Yes" : "Reimbursement"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.contactBtn}>
            <LinearGradient colors={[item.color, item.color + 'CC']} style={styles.contactGradient}>
              <Ionicons name="call" size={wp(3.5)} color="#fff" />
              <Text style={styles.contactText}>Contact: {item.phone}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
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
            {/* Header */}
            <LinearGradient
              colors={['rgba(0, 29, 61, 0.95)', 'rgba(0, 8, 20, 0.85)']}
              style={styles.headerGradient}
            >
              <View style={styles.topHeader}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Insurance Partners</Text>
                <View style={{ width: wp(10) }} />
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={wp(5)} color="#04e1f5" />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search by insurance company..."
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

            {/* Type Filter */}
            <TypeFilter />

            {/* Stats Banner */}
            <View style={styles.statsBanner}>
              <View style={styles.statItem}>
                <Ionicons name="business" size={wp(4)} color="#10B981" />
                <View>
                  <Text style={styles.statValue}>{filteredPartners.length}</Text>
                  <Text style={styles.statLabel}>Partners</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="shield" size={wp(4)} color="#04e1f5" />
                <View>
                  <Text style={styles.statValue}>13+</Text>
                  <Text style={styles.statLabel}>Companies</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="cash" size={wp(4)} color="#F59E0B" />
                <View>
                  <Text style={styles.statValue}>90%</Text>
                  <Text style={styles.statLabel}>Max Discount</Text>
                </View>
              </View>
            </View>

            {/* Partners List */}
            <FlatList
              data={filteredPartners}
              keyExtractor={item => item.id}
              renderItem={renderPartnerCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="shield-outline" size={wp(15)} color="#4B5563" />
                  <Text style={styles.emptyTitle}>No Insurance Partners Found</Text>
                  <Text style={styles.emptySubtitle}>Try adjusting your search or filter</Text>
                </View>
              }
            />

            {/* Info Note */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle" size={wp(4)} color="#04e1f5" />
              <Text style={styles.infoText}>
                Direct billing available for all partnered insurance companies. Present your insurance card at reception.
              </Text>
            </View>

            <View style={{ height: hp(1) }} />
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(11, 21, 65, 0.4)' },
  safeArea: { flex: 1 },

  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(2),
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
    marginTop: hp(1.5),
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
    marginVertical: hp(1),
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
    paddingVertical: hp(1),
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
    fontSize: wp(3.8),
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
    paddingBottom: hp(2),
    gap: hp(1.2),
  },

  partnerCard: {
    borderRadius: wp(4),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
    marginBottom: hp(1.2),
  },
  cardGradient: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statusLine: {
    width: wp(1.5),
  },
  partnerContent: {
    flex: 1,
    padding: wp(3.5),
    paddingLeft: wp(3),
  },

  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
    marginBottom: hp(1.2),
  },
  partnerIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  typeBadge: {
    marginTop: hp(0.3),
  },
  typeText: {
    fontSize: wp(2.5),
    fontWeight: '600',
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(1.5),
    marginBottom: hp(1.5),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.8),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(2),
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: wp(2.3),
  },
  detailValue: {
    color: '#fff',
    fontSize: wp(2.5),
    fontWeight: '500',
  },

  contactBtn: {
    borderRadius: wp(3),
    overflow: 'hidden',
    marginTop: hp(0.5),
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.8),
    gap: wp(1.5),
  },
  contactText: {
    color: '#fff',
    fontSize: wp(3),
    fontWeight: '600',
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

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(4),
    marginTop: hp(1),
    padding: wp(3),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: wp(3),
    gap: wp(2),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  infoText: {
    color: '#ced7e4',
    fontSize: wp(2.8),
    flex: 1,
  },
});

export default InsurancePartnersScreen;