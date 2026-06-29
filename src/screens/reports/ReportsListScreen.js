import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const isTablet = width >= 768;

const LabReportsScreen = ({ navigation, route }) => {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const filterOptions = ['All', 'Blood Test', 'Urine Test', 'CBC', 'Lipid Profile', 'Liver Function'];

  // Sample Lab Reports with results as array
  const sampleLabReports = [
    {
      id: '1',
      title: 'Complete Blood Count (CBC)',
      date: '28 Mar 2026',
      type: 'Blood Test',
      status: 'Normal',
      doctor: 'Dr. Sara Malik',
      token: 'L-045',
      results: [
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', normal: '13.5-17.5', status: 'Normal' },
        { name: 'WBC', value: '7.5', unit: 'x10³/µL', normal: '4.5-11.0', status: 'Normal' },
        { name: 'Platelets', value: '250', unit: 'x10³/µL', normal: '150-400', status: 'Normal' },
        { name: 'Glucose', value: '95', unit: 'mg/dL', normal: '70-100', status: 'Normal' }
      ]
    },
    {
      id: '2',
      title: 'Lipid Profile Test',
      date: '25 Mar 2026',
      type: 'Lipid Profile',
      status: 'Abnormal',
      doctor: 'Dr. Ahmed Khan',
      token: 'L-056',
      results: [
        { name: 'Total Cholesterol', value: '240', unit: 'mg/dL', normal: '<200', status: 'High' },
        { name: 'Triglycerides', value: '180', unit: 'mg/dL', normal: '<150', status: 'High' },
        { name: 'HDL (Good)', value: '35', unit: 'mg/dL', normal: '>40', status: 'Low' },
        { name: 'LDL (Bad)', value: '160', unit: 'mg/dL', normal: '<130', status: 'High' }
      ]
    },
    {
      id: '3',
      title: 'Liver Function Test (LFT)',
      date: '20 Mar 2026',
      type: 'Liver Function',
      status: 'Normal',
      doctor: 'Dr. Fatima Noor',
      token: 'L-089',
      results: [
        { name: 'ALT', value: '25', unit: 'U/L', normal: '7-56', status: 'Normal' },
        { name: 'AST', value: '22', unit: 'U/L', normal: '10-40', status: 'Normal' },
        { name: 'ALP', value: '80', unit: 'U/L', normal: '44-147', status: 'Normal' },
        { name: 'Bilirubin', value: '0.8', unit: 'mg/dL', normal: '0.2-1.2', status: 'Normal' }
      ]
    },
    {
      id: '4',
      title: 'Urine Test Report',
      date: '15 Mar 2026',
      type: 'Urine Test',
      status: 'Normal',
      doctor: 'Dr. Sara Malik',
      token: 'L-034',
      results: [
        { name: 'Color', value: 'Yellow', unit: '', normal: 'Yellow', status: 'Normal' },
        { name: 'Appearance', value: 'Clear', unit: '', normal: 'Clear', status: 'Normal' },
        { name: 'pH', value: '6.5', unit: '', normal: '4.5-8.0', status: 'Normal' },
        { name: 'Protein', value: 'Negative', unit: '', normal: 'Negative', status: 'Normal' },
        { name: 'Glucose', value: 'Negative', unit: '', normal: 'Negative', status: 'Normal' }
      ]
    },
    {
      id: '5',
      title: 'Thyroid Function Test',
      date: '10 Mar 2026',
      type: 'Blood Test',
      status: 'Abnormal',
      doctor: 'Dr. Muhammad Hassan',
      token: 'L-012',
      results: [
        { name: 'TSH', value: '8.5', unit: 'mIU/L', normal: '0.4-4.0', status: 'High' },
        { name: 'T3', value: '1.2', unit: 'ng/mL', normal: '0.8-2.0', status: 'Normal' },
        { name: 'T4', value: '4.8', unit: 'µg/dL', normal: '5.0-12.0', status: 'Low' }
      ]
    },
    {
      id: '6',
      title: 'Vitamin D Test',
      date: '5 Mar 2026',
      type: 'Blood Test',
      status: 'Abnormal',
      doctor: 'Dr. Ayesha Khan',
      token: 'L-078',
      results: [
        { name: 'Vitamin D', value: '15', unit: 'ng/mL', normal: '30-100', status: 'Deficient' }
      ]
    }
  ];

  useEffect(() => {
    loadUserData();
    loadReports();
  }, []);

  const loadUserData = async () => {
    try {
      let data = null;
      if (route?.params?.userData) {
        data = route.params.userData;
      } else {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) data = JSON.parse(storedData);
      }
      setUserData(data);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadReports = () => {
    setLoading(true);
    setTimeout(() => {
      setReports(sampleLabReports);
      setLoading(false);
    }, 800);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Normal': return COLORS.success;
      case 'Abnormal': return COLORS.danger;
      case 'High': return COLORS.danger;
      case 'Low': return '#F59E0B';
      case 'Deficient': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case 'Normal': return COLORS.success + '15';
      case 'Abnormal': return COLORS.danger + '15';
      case 'High': return COLORS.danger + '15';
      case 'Low': return '#F59E0B15';
      case 'Deficient': return COLORS.danger + '15';
      default: return COLORS.border;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Blood Test': return 'water-outline';
      case 'Urine Test': return 'color-filter-outline';
      case 'Lipid Profile': return 'heart-outline';
      case 'Liver Function': return 'fitness-outline';
      default: return 'flask-outline';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Blood Test': return '#8B5CF6';
      case 'Urine Test': return '#F59E0B';
      case 'Lipid Profile': return '#EF4444';
      case 'Liver Function': return '#10B981';
      default: return COLORS.primary;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(search.toLowerCase()) ||
                         report.type.toLowerCase().includes(search.toLowerCase()) ||
                         report.doctor.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || report.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleReportPress = (report) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const handleUpload = () => {
    navigation.navigate('UploadReportScreen', { 
      userData: userData,
      reportType: 'Lab'
    });
  };

  // Safe check for results
  const getResultSummary = (results) => {
    if (!results || !Array.isArray(results) || results.length === 0) {
      return 'No results';
    }
    const abnormal = results.filter(r => r.status !== 'Normal');
    if (abnormal.length === 0) return 'All parameters normal';
    return `${abnormal.length} abnormal result${abnormal.length > 1 ? 's' : ''}`;
  };

  // Render Detail Modal
  const renderDetailModal = () => {
    if (!selectedReport) return null;

    const statusColor = getStatusColor(selectedReport.status);
    const typeColor = getTypeColor(selectedReport.type);
    const results = selectedReport.results || [];

    return (
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedReport.title}</Text>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMeta}>{selectedReport.date}</Text>
                    <Text style={styles.modalMeta}>•</Text>
                    <Text style={styles.modalMeta}>{selectedReport.doctor}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMeta}>Token: {selectedReport.token}</Text>
                    <Text style={styles.modalMeta}>•</Text>
                    <Text style={styles.modalMeta}>{selectedReport.type}</Text>
                  </View>
                </View>
                <View style={[styles.modalStatusBadge, { backgroundColor: getStatusBgColor(selectedReport.status) }]}>
                  <Text style={[styles.modalStatusText, { color: statusColor }]}>
                    {selectedReport.status}
                  </Text>
                </View>
              </View>

              {/* Results Table */}
              {results.length > 0 ? (
                <View style={styles.resultsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Test</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Result</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Normal Range</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                  </View>

                  {results.map((item, index) => {
                    const isAbnormal = item.status !== 'Normal';
                    return (
                      <View key={index} style={[styles.tableRow, isAbnormal && styles.abnormalRow]}>
                        <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{item.name}</Text>
                        <Text style={[styles.tableCell, { flex: 1, fontWeight: '600' }]}>
                          {item.value} {item.unit}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 1.5, color: COLORS.textLight }]}>{item.normal}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusDotText}>{item.status}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No results available</Text>
                </View>
              )}

              {/* Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryLabel}>Summary</Text>
                <Text style={styles.summaryText}>
                  {selectedReport.status === 'Normal' 
                    ? '✅ All test results are within normal range.' 
                    : `⚠️ ${results.filter(r => r.status !== 'Normal').length || 0} abnormal result(s) found. Please consult your doctor.`}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionBtn} onPress={() => setDetailModalVisible(false)}>
                  <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalActionGradient}>
                    <Text style={styles.modalActionText}>Close</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalActionBtn, styles.modalActionSecondary]}>
                  <View style={styles.modalActionSecondaryGradient}>
                    <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                    <Text style={[styles.modalActionText, { color: COLORS.primary }]}>Download</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Render Report Card
  const renderReportCard = ({ item }) => {
    const results = item.results || [];
    
    return (
      <TouchableOpacity
        style={[styles.reportCard, styles.cardShadow]}
        onPress={() => handleReportPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '15' }]}>
            <Ionicons 
              name={getTypeIcon(item.type)} 
              size={isTablet ? 32 : 28} 
              color={getTypeColor(item.type)} 
            />
          </View>
        </View>

        <View style={styles.cardCenter}>
          <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={isTablet ? 14 : 12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={isTablet ? 14 : 12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.doctor}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.resultSummary}>{getResultSummary(results)}</Text>
          <Ionicons name="chevron-forward" size={isTablet ? 20 : 16} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  // Render Filter Chips
  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={filterOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === item && styles.filterChipActive]}
            onPress={() => setSelectedFilter(item)}
          >
            <Text style={[styles.filterChipText, selectedFilter === item && styles.filterChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  // Render Empty State
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flask-outline" size={isTablet ? 80 : 60} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No Lab Reports</Text>
      <Text style={styles.emptySubtext}>
        {search ? 'Try adjusting your search' : 'Your lab test reports will appear here'}
      </Text>
      {!search && (
        <TouchableOpacity style={styles.emptyUploadBtn} onPress={handleUpload}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.emptyUploadGradient}>
            <Ionicons name="cloud-upload-outline" size={isTablet ? 24 : 20} color={COLORS.white} />
            <Text style={styles.emptyUploadText}>Upload Lab Report</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading lab reports...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[COLORS.primary + '08', COLORS.background, COLORS.background]}
        style={styles.gradientBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={isTablet ? 28 : 24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Reports</Text>
        <TouchableOpacity 
          style={styles.uploadBtn}
          onPress={handleUpload}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-upload-outline" size={isTablet ? 28 : 24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {reports.filter(r => r.status === 'Normal').length}
          </Text>
          <Text style={styles.statLabel}>Normal</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.danger }]}>
            {reports.filter(r => r.status === 'Abnormal').length}
          </Text>
          <Text style={styles.statLabel}>Abnormal</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={isTablet ? 24 : 20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lab tests..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={isTablet ? 24 : 20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          filteredReports.length > 0 && (
            <View style={styles.resultHeader}>
              <Text style={styles.resultText}>
                {filteredReports.length} test{filteredReports.length > 1 ? 's' : ''} found
              </Text>
            </View>
          )
        }
        ListEmptyComponent={renderEmpty}
      />

      {renderDetailModal()}
    </SafeAreaView>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
    paddingBottom: hp(1.5),
    gap: wp(3),
  },
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  uploadBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  statNumber: {
    fontSize: wp(4.5),
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: wp(2.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: wp(4),
    borderRadius: wp(3.5),
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    height: hp(5.5),
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: wp(3.5),
    height: '100%',
    marginLeft: wp(2),
  },

  filterContainer: {
    marginBottom: hp(1.5),
  },
  filterList: {
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  filterChip: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.6),
    borderRadius: wp(4),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: wp(3),
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },

  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(10),
  },
  resultHeader: {
    marginBottom: hp(1),
  },
  resultText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  reportCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(3.5),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cardShadow: {
    ...SHADOWS.small,
  },
  cardLeft: {
    marginRight: wp(3),
  },
  iconContainer: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenter: {
    flex: 1,
  },
  reportTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    marginTop: hp(0.2),
  },
  metaText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: hp(0.3),
  },
  statusBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  statusText: {
    fontSize: wp(2.5),
    fontWeight: '600',
  },
  resultSummary: {
    fontSize: wp(2.5),
    color: COLORS.textLight,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
  },
  emptyTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: hp(2),
  },
  emptySubtext: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
  emptyUploadBtn: {
    marginTop: hp(3),
    borderRadius: wp(3.5),
    overflow: 'hidden',
  },
  emptyUploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  emptyUploadText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(2),
    maxHeight: height * 0.85,
  },
  modalHandle: {
    width: wp(12),
    height: hp(0.5),
    backgroundColor: COLORS.border,
    borderRadius: wp(1),
    alignSelf: 'center',
    marginBottom: hp(1),
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  modalTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    marginTop: hp(0.2),
  },
  modalMeta: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
  },
  modalStatusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  modalStatusText: {
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  resultsTable: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1.5),
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(2),
  },
  tableHeaderText: {
    fontSize: wp(2.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  abnormalRow: {
    backgroundColor: COLORS.danger + '05',
  },
  tableCell: {
    fontSize: wp(2.8),
    color: COLORS.text,
  },
  statusDot: {
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.1),
    borderRadius: wp(1.5),
    alignSelf: 'flex-start',
  },
  statusDotText: {
    fontSize: wp(2.2),
    color: COLORS.white,
    fontWeight: '600',
  },

  noResultsContainer: {
    padding: wp(4),
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(3),
    marginBottom: hp(1.5),
  },
  noResultsText: {
    fontSize: wp(3.5),
    color: COLORS.textLight,
  },

  summaryContainer: {
    backgroundColor: COLORS.primary + '05',
    padding: wp(3),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  summaryLabel: {
    fontSize: wp(3.2),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },
  summaryText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    lineHeight: hp(2.5),
  },

  modalActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  modalActionBtn: {
    flex: 1,
    borderRadius: wp(3),
    overflow: 'hidden',
  },
  modalActionGradient: {
    padding: hp(1.2),
    alignItems: 'center',
  },
  modalActionSecondary: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  modalActionSecondaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp(1.2),
    gap: wp(1.5),
  },
  modalActionText: {
    color: COLORS.white,
    fontSize: wp(3.8),
    fontWeight: '700',
  },
});

export default LabReportsScreen;