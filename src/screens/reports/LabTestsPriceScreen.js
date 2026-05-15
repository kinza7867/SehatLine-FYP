import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Platform, StatusBar, ImageBackground,
  SafeAreaView, TextInput, ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const isTablet = width >= 768;
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const LabTestsPriceScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Urinalysis'];

  const tests = [
    // Hematology
    { id: '1', name: 'Complete Blood Count (CBC)', price: 'Rs. 850', category: 'Hematology', description: '24 parameters', turnaround: '4 hours' },
    { id: '2', name: 'Hemoglobin (Hb)', price: 'Rs. 200', category: 'Hematology', description: 'Single test', turnaround: '2 hours' },
    { id: '3', name: 'Platelet Count', price: 'Rs. 300', category: 'Hematology', description: 'Thrombocyte count', turnaround: '3 hours' },
    { id: '4', name: 'ESR', price: 'Rs. 250', category: 'Hematology', description: 'Erythrocyte Sedimentation Rate', turnaround: '4 hours' },
    { id: '5', name: 'Malaria Parasite', price: 'Rs. 400', category: 'Hematology', description: 'Blood smear', turnaround: '6 hours' },
    
    // Biochemistry
    { id: '6', name: 'Lipid Profile', price: 'Rs. 2,200', category: 'Biochemistry', description: 'Cholesterol, Triglycerides, HDL, LDL', turnaround: '8 hours' },
    { id: '7', name: 'Blood Sugar (Fasting)', price: 'Rs. 350', category: 'Biochemistry', description: 'Fasting glucose', turnaround: '3 hours' },
    { id: '8', name: 'HbA1c', price: 'Rs. 1,200', category: 'Biochemistry', description: '3 months average glucose', turnaround: '6 hours' },
    { id: '9', name: 'Kidney Function Test', price: 'Rs. 1,800', category: 'Biochemistry', description: 'Urea, Creatinine, Uric acid', turnaround: '8 hours' },
    { id: '10', name: 'Liver Function Test', price: 'Rs. 2,000', category: 'Biochemistry', description: 'ALT, AST, ALP, Bilirubin', turnaround: '8 hours' },
    { id: '11', name: 'Thyroid Profile (T3,T4,TSH)', price: 'Rs. 2,500', category: 'Biochemistry', description: 'Complete thyroid panel', turnaround: '12 hours' },
    { id: '12', name: 'Vitamin D', price: 'Rs. 3,500', category: 'Biochemistry', description: '25-Hydroxy Vitamin D', turnaround: '24 hours' },
    { id: '13', name: 'Vitamin B12', price: 'Rs. 2,800', category: 'Biochemistry', description: 'Cobalamin', turnaround: '24 hours' },
    { id: '14', name: 'Ferritin', price: 'Rs. 1,500', category: 'Biochemistry', description: 'Iron stores', turnaround: '12 hours' },
    
    // Microbiology
    { id: '15', name: 'Blood Culture', price: 'Rs. 1,500', category: 'Microbiology', description: 'Bacterial identification', turnaround: '3-5 days' },
    { id: '16', name: 'Urine Culture', price: 'Rs. 800', category: 'Microbiology', description: 'UTI diagnosis', turnaround: '48 hours' },
    { id: '17', name: 'Sputum Culture', price: 'Rs. 1,000', category: 'Microbiology', description: 'Respiratory infection', turnaround: '3 days' },
    { id: '18', name: 'Widal Test', price: 'Rs. 600', category: 'Microbiology', description: 'Typhoid fever', turnaround: '24 hours' },
    
    // Immunology
    { id: '19', name: 'Hepatitis B Surface Antigen', price: 'Rs. 1,200', category: 'Immunology', description: 'HBsAg', turnaround: '8 hours' },
    { id: '20', name: 'Anti-HCV', price: 'Rs. 1,500', category: 'Immunology', description: 'Hepatitis C antibody', turnaround: '8 hours' },
    { id: '21', name: 'HIV 1 & 2', price: 'Rs. 1,800', category: 'Immunology', description: 'Rapid test', turnaround: '4 hours' },
    { id: '22', name: 'Dengue NS1 Antigen', price: 'Rs. 2,000', category: 'Immunology', description: 'Early detection', turnaround: '6 hours' },
    { id: '23', name: 'Dengue IgG/IgM', price: 'Rs. 1,800', category: 'Immunology', description: 'Antibody test', turnaround: '8 hours' },
    
    // Urinalysis
    { id: '24', name: 'Urine Examination', price: 'Rs. 400', category: 'Urinalysis', description: 'Routine exam', turnaround: '3 hours' },
    { id: '25', name: 'Urine Microscopy', price: 'Rs. 500', category: 'Urinalysis', description: 'Detailed analysis', turnaround: '4 hours' },
    { id: '26', name: 'Urine Pregnancy Test', price: 'Rs. 300', category: 'Urinalysis', description: 'HCG test', turnaround: '1 hour' },
  ];

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Hematology': '#EF4444',
      'Biochemistry': '#10B981',
      'Microbiology': '#8B5CF6',
      'Immunology': '#F59E0B',
      'Urinalysis': '#06B6D4',
    };
    return colors[category] || '#04e1f5';
  };

  const totalTests = tests.length;
  const avgPrice = Math.round(tests.reduce((sum, test) => {
    const price = parseInt(test.price.replace(/[^0-9]/g, ''));
    return sum + price;
  }, 0) / totalTests);

  const CategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
      style={styles.filterContainer}
    >
      {categories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[styles.filterText, selectedCategory === category && styles.filterTextActive]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTestItem = ({ item }) => (
    <TouchableOpacity style={styles.testCard} activeOpacity={0.85}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0.45)']}
        style={styles.cardGradient}
      >
        <View style={styles.testInfo}>
          <View style={styles.testHeader}>
            <Text style={styles.testName}>{item.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
              <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                {item.category}
              </Text>
            </View>
          </View>
          <Text style={styles.testDescription}>{item.description}</Text>
          <View style={styles.testMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={wp(3)} color="#64748B" />
              <Text style={styles.metaText}>Turnaround: {item.turnaround}</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{item.price}</Text>
          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>Book</Text>
          </TouchableOpacity>
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
                  <Text style={styles.headerTitle}>Lab Test Prices</Text>
                  <View style={{ width: wp(10) }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={wp(5)} color="#04e1f5" />
                  <TextInput 
                    style={styles.searchInput}
                    placeholder="Search by test name..."
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

              {/* Stats Banner */}
              <View style={styles.statsBanner}>
                <View style={styles.statItem}>
                  <Ionicons name="flask" size={wp(4.5)} color="#10B981" />
                  <View>
                    <Text style={styles.statValue}>{totalTests}</Text>
                    <Text style={styles.statLabel}>Total Tests</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="cash" size={wp(4.5)} color="#F59E0B" />
                  <View>
                    <Text style={styles.statValue}>Rs. {avgPrice.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Average Price</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="time" size={wp(4.5)} color="#04e1f5" />
                  <View>
                    <Text style={styles.statValue}>24-48h</Text>
                    <Text style={styles.statLabel}>Results Time</Text>
                  </View>
                </View>
              </View>

              {/* Category Filter */}
              <CategoryFilter />

              {/* Tests List */}
              <FlatList
                data={filteredTests}
                keyExtractor={item => item.id}
                renderItem={renderTestItem}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={wp(15)} color="#4B5563" />
                    <Text style={styles.emptyTitle}>No Tests Found</Text>
                    <Text style={styles.emptySubtitle}>Try adjusting your search or filter</Text>
                  </View>
                }
              />

              {/* Info Note */}
              <View style={styles.infoNote}>
                <Ionicons name="information-circle" size={wp(4.5)} color="#04e1f5" />
                <Text style={styles.infoText}>
                  Home sample collection available for selected tests. Additional charges may apply.
                </Text>
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
  overlay: { flex: 1, backgroundColor: 'rgba(13, 6, 73, 0.38)' },
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

  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: wp(4),
    marginTop: hp(2),
    marginBottom: hp(1),
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

  filterContainer: {
    maxHeight: hp(7),
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

  listContent: {
    padding: wp(4),
    gap: hp(1.2),
  },

  testCard: {
    borderRadius: wp(4),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  cardGradient: {
    flexDirection: 'row',
    padding: wp(3.5),
    gap: wp(2),
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  testInfo: {
    flex: 1,
    gap: hp(0.5),
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: wp(1.5),
  },
  testName: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  categoryText: {
    fontSize: wp(2.2),
    fontWeight: '600',
  },
  testDescription: {
    color: '#94A3B8',
    fontSize: wp(2.8),
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.3),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  metaText: {
    color: '#64748B',
    fontSize: wp(2.5),
  },

  priceSection: {
    alignItems: 'flex-end',
    gap: hp(0.8),
  },
  price: {
    color: '#04e1f5',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  bookBtn: {
    backgroundColor: '#04e1f5',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },
  bookBtnText: {
    color: '#000',
    fontSize: wp(2.5),
    fontWeight: 'bold',
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
    color: '#94A3B8',
    fontSize: wp(2.8),
    flex: 1,
  },
});

export default LabTestsPriceScreen;