// src/screens/doctor/PatientHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const COMPLETED_PATIENTS_KEY = '@sehatline_completed_patients';

const PatientHistoryScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pharmacy', label: 'Pharmacy' },
    { id: 'lab', label: 'Lab' },
  ];

  useEffect(() => {
    loadPatientHistory();
  }, []);

  const loadPatientHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(COMPLETED_PATIENTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setPatients(parsed);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientHistory();
    setRefreshing(false);
  };

  const getFilteredPatients = () => {
    if (selectedFilter === 'all') return patients;
    return patients.filter(p => p.type === selectedFilter);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPatientCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyCard, SHADOWS.small]}
      activeOpacity={0.7}
      onPress={() => {
        // Navigate to patient detail
        Alert.alert(
          'Patient Details',
          `${item.patientName}\n\nDiagnosis: ${item.diagnosis}\nMedicines: ${item.medicines}\nDate: ${formatDate(item.completedAt)}`
        );
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.patientAvatar}>
          <Text style={styles.avatarText}>
            {item.patientName?.charAt(0) || 'P'}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.patientToken}>Token #{item.patientToken || '—'}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: item.type === 'pharmacy' ? COLORS.success + '15' : COLORS.info + '15' }]}>
          <Text style={[styles.typeText, { color: item.type === 'pharmacy' ? COLORS.success : COLORS.info }]}>
            {item.type === 'pharmacy' ? '💊 Pharmacy' : '🧪 Lab'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="clipboard-outline" size={wp(3.5)} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Diagnosis:</Text>
          <Text style={styles.detailValue}>{item.diagnosis || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="medkit-outline" size={wp(3.5)} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Medicines:</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {item.medicines?.split('\n').slice(0, 2).join(', ') || 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={wp(3.5)} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formatDate(item.completedAt)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.doctorName}>👨‍⚕️ {item.doctorName || 'Dr. Unknown'}</Text>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View Details</Text>
          <Ionicons name="chevron-forward" size={wp(3)} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading History...</Text>
      </View>
    );
  }

  const filteredPatients = getFilteredPatients();

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
            <Text style={styles.headerTitle}>Patient History</Text>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={wp(5)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── FILTERS ─────────────────────────────────────────────────── */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, selectedFilter === filter.id && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── PATIENT LIST ───────────────────────────────────────────── */}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderPatientCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={wp(15)} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No History Found</Text>
              <Text style={styles.emptySub}>Patients you attend will appear here</Text>
            </View>
          }
        />

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SehatLine v2.0.1</Text>
        </View>
      </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: hp(1),
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
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

  // ─── Filters ──────────────────────────────────────────────────────
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  filterScroll: {
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  filterChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
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

  // ─── List ─────────────────────────────────────────────────────────
  listContent: {
    padding: wp(4),
    paddingBottom: hp(2),
  },

  // ─── History Card ──────────────────────────────────────────────────
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    marginBottom: hp(1.2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  patientAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2.5),
  },
  avatarText: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  patientToken: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },
  typeBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  typeText: {
    fontSize: wp(2.4),
    fontWeight: '600',
  },

  cardBody: {
    paddingVertical: hp(0.3),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginVertical: hp(0.2),
  },
  detailLabel: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: wp(2.6),
    color: COLORS.text,
    fontWeight: '500',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(0.5),
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  doctorName: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.5),
  },
  viewBtnText: {
    fontSize: wp(2.6),
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ─── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginTop: hp(10),
    paddingHorizontal: wp(4),
  },
  emptyTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: hp(1),
  },
  emptySub: {
    fontSize: wp(3.2),
    color: COLORS.textLight,
    marginTop: hp(0.5),
    textAlign: 'center',
  },

  // ─── Footer ──────────────────────────────────────────────────────
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

export default PatientHistoryScreen;