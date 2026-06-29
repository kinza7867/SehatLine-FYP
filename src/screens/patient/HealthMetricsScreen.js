import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, SafeAreaView, Dimensions, Alert, TextInput,
  Modal, TouchableWithoutFeedback, Keyboard, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const HealthMetricsScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    sugarLevel: '',
    weight: '',
    heartRate: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [history, setHistory] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    sugarLevel: '',
    weight: '',
    heartRate: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user data
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }

      // Load health metrics history
      const storedMetrics = await AsyncStorage.getItem('healthMetrics');
      if (storedMetrics) {
        const parsed = JSON.parse(storedMetrics);
        setHistory(parsed);
        if (parsed.length > 0) {
          setMetrics(parsed[0]);
        }
      }
    } catch (error) {
      console.log('Error loading health metrics:', error);
    }
    setLoading(false);
  };

  const saveMetrics = async () => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        ...metrics,
        date: new Date().toISOString(),
        dateFormatted: new Date().toLocaleDateString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [newEntry, ...history];
      await AsyncStorage.setItem('healthMetrics', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setMetrics(newEntry);
      setAddModalVisible(false);
      Alert.alert('Success', 'Health metrics saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save health metrics');
    }
  };

  const deleteMetric = async (id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = history.filter(item => item.id !== id);
            await AsyncStorage.setItem('healthMetrics', JSON.stringify(updated));
            setHistory(updated);
            if (history.length > 0 && history[0].id === id) {
              setMetrics(updated.length > 0 ? updated[0] : {
                bloodPressure: { systolic: '', diastolic: '' },
                sugarLevel: '',
                weight: '',
                heartRate: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
              });
            }
            Alert.alert('Success', 'Record deleted successfully');
          }
        }
      ]
    );
  };

  const getStatusColor = (value, type) => {
    if (!value) return COLORS.textSecondary;
    
    const num = parseFloat(value);
    switch(type) {
      case 'systolic':
        if (num < 90) return '#EF4444';
        if (num < 120) return '#34D399';
        if (num < 140) return '#F59E0B';
        return '#EF4444';
      case 'diastolic':
        if (num < 60) return '#EF4444';
        if (num < 80) return '#34D399';
        if (num < 90) return '#F59E0B';
        return '#EF4444';
      case 'sugar':
        if (num < 70) return '#EF4444';
        if (num < 100) return '#34D399';
        if (num < 140) return '#F59E0B';
        return '#EF4444';
      case 'weight':
        return '#3B82F6';
      case 'heartRate':
        if (num < 40 || num > 120) return '#EF4444';
        if (num < 60 || num > 100) return '#F59E0B';
        return '#34D399';
      default:
        return COLORS.primary;
    }
  };

  const getStatusText = (value, type) => {
    if (!value) return 'Not recorded';
    
    const num = parseFloat(value);
    switch(type) {
      case 'systolic':
        if (num < 90) return 'Low';
        if (num < 120) return 'Normal';
        if (num < 140) return 'Elevated';
        return 'High';
      case 'diastolic':
        if (num < 60) return 'Low';
        if (num < 80) return 'Normal';
        if (num < 90) return 'Elevated';
        return 'High';
      case 'sugar':
        if (num < 70) return 'Low';
        if (num < 100) return 'Normal';
        if (num < 140) return 'Elevated';
        return 'High';
      case 'heartRate':
        if (num < 40 || num > 120) return 'Abnormal';
        if (num < 60 || num > 100) return 'Moderate';
        return 'Normal';
      default:
        return 'Normal';
    }
  };

  const renderMetricCard = (icon, label, value, unit, type, color) => {
    const statusColor = getStatusColor(value, type);
    const statusText = getStatusText(value, type);
    
    return (
      <View style={[styles.metricCard, { borderLeftColor: color || COLORS.primary }]}>
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: (color || COLORS.primary) + '15' }]}>
            <Ionicons name={icon} size={22} color={color || COLORS.primary} />
          </View>
          <Text style={styles.metricLabel}>{label}</Text>
        </View>
        <View style={styles.metricValueContainer}>
          <Text style={[styles.metricValue, { color: statusColor }]}>
            {value || '--'}
          </Text>
          <Text style={styles.metricUnit}>{unit}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            ● {statusText}
          </Text>
        </View>
      </View>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={addModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setAddModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Health Metrics</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Blood Pressure */}
              <Text style={styles.sectionLabel}>Blood Pressure (mmHg)</Text>
              <View style={styles.rowInput}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Systolic</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 120"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    value={metrics.bloodPressure.systolic}
                    onChangeText={(text) => setMetrics({
                      ...metrics,
                      bloodPressure: { ...metrics.bloodPressure, systolic: text }
                    })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: wp(2) }]}>
                  <Text style={styles.inputLabel}>Diastolic</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 80"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    value={metrics.bloodPressure.diastolic}
                    onChangeText={(text) => setMetrics({
                      ...metrics,
                      bloodPressure: { ...metrics.bloodPressure, diastolic: text }
                    })}
                  />
                </View>
              </View>

              {/* Sugar Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Blood Sugar (mg/dL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 95"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  value={metrics.sugarLevel}
                  onChangeText={(text) => setMetrics({ ...metrics, sugarLevel: text })}
                />
              </View>

              {/* Weight */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 70"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  value={metrics.weight}
                  onChangeText={(text) => setMetrics({ ...metrics, weight: text })}
                />
              </View>

              {/* Heart Rate */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 72"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  value={metrics.heartRate}
                  onChangeText={(text) => setMetrics({ ...metrics, heartRate: text })}
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any notes or symptoms..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={metrics.notes}
                  onChangeText={(text) => setMetrics({ ...metrics, notes: text })}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={saveMetrics}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.saveGradient}>
                  <Text style={styles.saveBtnText}>Save Metrics</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading health metrics...</Text>
        </View>
      </SafeAreaView>
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Metrics</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.addGradient}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Today's Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Today's Metrics</Text>
          <Text style={styles.sectionSub}>{new Date().toLocaleDateString()}</Text>

          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'heart-outline',
              'Blood Pressure',
              metrics.bloodPressure.systolic && metrics.bloodPressure.diastolic
                ? `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic}`
                : '',
              'mmHg',
              'systolic',
              '#EF4444'
            )}
            
            {renderMetricCard(
              'water-outline',
              'Blood Sugar',
              metrics.sugarLevel,
              'mg/dL',
              'sugar',
              '#F59E0B'
            )}
            
            {renderMetricCard(
              'fitness-outline',
              'Weight',
              metrics.weight,
              'kg',
              'weight',
              '#3B82F6'
            )}
            
            {renderMetricCard(
              'pulse-outline',
              'Heart Rate',
              metrics.heartRate,
              'bpm',
              'heartRate',
              '#8B5CF6'
            )}
          </View>

          {metrics.notes && (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>📝 Notes</Text>
              <Text style={styles.notesText}>{metrics.notes}</Text>
            </View>
          )}
        </View>

        {/* History */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 History</Text>
            {history.slice(0, 10).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.historyItem, index === 0 && styles.latestItem]}
                onPress={() => {
                  setMetrics(item);
                  Alert.alert('View Record', `Date: ${item.dateFormatted || 'N/A'}`);
                }}
                onLongPress={() => deleteMetric(item.id)}
              >
                <View style={styles.historyLeft}>
                  <View style={[styles.historyDot, { backgroundColor: COLORS.primary }]} />
                  <View>
                    <Text style={styles.historyDate}>
                      {item.dateFormatted || new Date(item.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.historyTime}>
                      {item.timeFormatted || new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyValues}>
                  {item.sugarLevel && (
                    <Text style={styles.historyValue}>🍬 {item.sugarLevel} mg/dL</Text>
                  )}
                  {item.bloodPressure?.systolic && (
                    <Text style={styles.historyValue}>❤️ {item.bloodPressure.systolic}/{item.bloodPressure.diastolic}</Text>
                  )}
                  {item.weight && (
                    <Text style={styles.historyValue}>⚖️ {item.weight} kg</Text>
                  )}
                  {item.heartRate && (
                    <Text style={styles.historyValue}>💓 {item.heartRate} bpm</Text>
                  )}
                </View>
                {index === 0 && (
                  <View style={styles.latestBadge}>
                    <Text style={styles.latestBadgeText}>Latest</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {history.length > 10 && (
              <Text style={styles.moreText}>+{history.length - 10} more records</Text>
            )}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <LinearGradient colors={[COLORS.primary + '10', COLORS.secondary + '05']} style={styles.tipsGradient}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
              <Text style={styles.tipsTitle}>Health Tips</Text>
            </View>
            <Text style={styles.tipsText}>
              • Track your vitals regularly for better health monitoring
            </Text>
            <Text style={styles.tipsText}>
              • Normal BP: 120/80 mmHg, Sugar: 70-100 mg/dL (fasting)
            </Text>
            <Text style={styles.tipsText}>
              • Normal Heart Rate: 60-100 bpm at rest
            </Text>
            <Text style={styles.tipsText}>
              • Long press on history to delete records
            </Text>
          </LinearGradient>
        </View>

        <View style={{ height: hp(4) }} />
      </ScrollView>

      {/* Add Modal */}
      {renderAddModal()}
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
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },

  // Header
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
  addBtn: {
    borderRadius: wp(3.5),
    overflow: 'hidden',
  },
  addGradient: {
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },

  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(0.2),
  },
  sectionSub: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    marginBottom: hp(1.5),
  },

  metricsGrid: {
    gap: hp(1.2),
  },

  metricCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(0.3),
  },
  metricIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: wp(1),
  },
  metricValue: {
    fontSize: wp(5.5),
    fontWeight: '800',
  },
  metricUnit: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
    marginTop: hp(0.3),
  },
  statusText: {
    fontSize: wp(2.5),
    fontWeight: '600',
  },

  notesCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    marginTop: hp(1.5),
    ...SHADOWS.small,
  },
  notesLabel: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },
  notesText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    lineHeight: hp(2.2),
  },

  historyItem: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(3.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.8),
    ...SHADOWS.small,
  },
  latestItem: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  historyDot: {
    width: wp(1.5),
    height: wp(4),
    borderRadius: wp(0.75),
  },
  historyDate: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  historyTime: {
    fontSize: wp(2.5),
    color: COLORS.textLight,
  },
  historyValues: {
    flex: 1,
    marginLeft: wp(2),
    gap: hp(0.1),
  },
  historyValue: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
  },
  latestBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.15),
    borderRadius: wp(2),
  },
  latestBadgeText: {
    fontSize: wp(2.2),
    color: COLORS.primary,
    fontWeight: '600',
  },
  moreText: {
    textAlign: 'center',
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: hp(0.5),
  },

  tipsCard: {
    borderRadius: wp(4),
    overflow: 'hidden',
    marginTop: hp(1),
  },
  tipsGradient: {
    padding: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(4),
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(0.5),
  },
  tipsTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  tipsText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    lineHeight: hp(2.5),
    marginTop: hp(0.3),
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: wp(6),
    padding: wp(5),
    maxHeight: height * 0.85,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: '700',
    color: COLORS.text,
  },

  sectionLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },

  rowInput: {
    flexDirection: 'row',
    gap: wp(2),
  },

  inputGroup: {
    marginBottom: hp(1.2),
  },
  inputLabel: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: hp(0.3),
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(3),
    padding: wp(3),
    color: COLORS.text,
    fontSize: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: hp(8),
    textAlignVertical: 'top',
    paddingTop: wp(3),
  },

  saveBtn: {
    borderRadius: wp(3.5),
    overflow: 'hidden',
    marginTop: hp(1.5),
  },
  saveGradient: {
    padding: hp(1.5),
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '700',
  },
});

export default HealthMetricsScreen;