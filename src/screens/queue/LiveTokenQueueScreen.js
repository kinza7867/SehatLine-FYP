import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
  Dimensions, Platform, StatusBar, Animated, RefreshControl,
  TextInput, Modal, ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const isTablet = width >= 768;
const responsiveWidth = isTablet ? width * 0.9 : width * 0.95;
const cardPadding = isTablet ? 24 : 16;
const fontSize = {
  h1: isTablet ? 32 : 24,
  h2: isTablet ? 24 : 18,
  h3: isTablet ? 18 : 14,
  body: isTablet ? 16 : 13,
  small: isTablet ? 14 : 11,
};

const LiveTokenQueueScreen = ({ navigation }) => {
  const [queue, setQueue] = useState([
    { 
      id: '1', token: 'P-089', name: 'Fatima Bibi', type: 'New', 
      priority: true, status: 'Waiting', time: '2 min ago',
      estimatedWait: '15 min', checkInTime: '9:30 AM'
    },
    { 
      id: '2', token: 'A-045', name: 'Ahmed Khan', type: 'Follow-up', 
      priority: false, status: 'Waiting', time: '8 min ago',
      estimatedWait: '10 min', checkInTime: '9:35 AM'
    },
    { 
      id: '3', token: 'P-090', name: 'Bilal Ahmed', type: 'New', 
      priority: false, status: 'Waiting', time: '15 min ago',
      estimatedWait: '8 min', checkInTime: '9:40 AM'
    },
    { 
      id: '4', token: 'A-046', name: 'Sana Malik', type: 'Follow-up', 
      priority: true, status: 'Called', time: 'Now',
      estimatedWait: '0 min', checkInTime: '9:20 AM'
    },
  ]);

  const [currentCalling, setCurrentCalling] = useState(null);
  const [nowServing, setNowServing] = useState('A-045');
  const [refreshing, setRefreshing] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [selectedType, setSelectedType] = useState('New');
  const [announcement, setAnnouncement] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [stats, setStats] = useState({
    totalWaiting: 4,
    completed: 28,
    avgWaitTime: '12 min',
    peakHour: '10:00 AM - 12:00 PM'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time queue updates
      setQueue(prev => {
        const updated = prev.map(p => {
          if (p.status === 'Waiting') {
            const mins = parseInt(p.time) || 0;
            return { ...p, time: `${mins + 1} min ago` };
          }
          return p;
        });
        const waiting = updated.filter(p => p.status === 'Waiting').length;
        setStats(prevStats => ({ ...prevStats, totalWaiting: waiting }));
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to refresh queue
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const callNextPatient = (patient) => {
    setCurrentCalling(patient.token);
    // Animate the call
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    
    Alert.alert(
      "📢 Calling Patient",
      `Now calling ${patient.name} (${patient.token})\n\nPlease proceed to Room 3`,
      [
        { 
          text: "✅ Mark as Done", 
          onPress: () => {
            setQueue(prev => prev.filter(p => p.id !== patient.id));
            setNowServing(patient.token);
            setCurrentCalling(null);
            setStats(prev => ({ ...prev, completed: prev.completed + 1, totalWaiting: prev.totalWaiting - 1 }));
          }
        },
        { 
          text: "🔁 Call Again", 
          onPress: () => {
            Alert.alert("Re-calling", `${patient.name} (${patient.token}) - Please come to Room 3`);
          }
        },
        { text: "Cancel", onPress: () => setCurrentCalling(null), style: 'cancel' }
      ]
    );
  };

  const generateNewToken = () => {
    if (!newTokenName.trim()) {
      Alert.alert("Required", "Please enter patient name");
      return;
    }
    
    const newId = (queue.length + 1).toString();
    const newToken = `P-${String(queue.length + 90).padStart(3, '0')}`;
    const newPatient = {
      id: newId,
      token: newToken,
      name: newTokenName,
      type: selectedType,
      priority: selectedType === 'Emergency',
      status: 'Waiting',
      time: 'Just now',
      estimatedWait: `${Math.floor(Math.random() * 20) + 10} min`,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setQueue(prev => [...prev, newPatient]);
    setShowTokenModal(false);
    setNewTokenName('');
    Alert.alert("✅ Token Generated", `Token ${newToken} generated for ${newTokenName}`);
  };

  const playAnnouncement = () => {
    if (nowServing) {
      Alert.alert("🔊 Announcement", `Now serving token number ${nowServing}. Please proceed to the counter.`);
    }
  };

  const getStatusColor = (status, priority) => {
    if (priority) return '#EF4444';
    if (status === 'Called') return '#10B981';
    return '#F59E0B';
  };

  const renderQueueItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.tokenCard,
        item.priority && styles.priorityCard,
        currentCalling === item.token && styles.callingCard,
        { opacity: fadeAnim }
      ]}
    >
      {/* Token Section */}
      <View style={styles.tokenSection}>
        <View style={styles.tokenCircle}>
          <Text style={styles.tokenNumber}>{item.token}</Text>
          {item.priority && <View style={styles.priorityDot} />}
        </View>
      </View>

      {/* Patient Info */}
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <View style={styles.patientMeta}>
          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={12} color="#64748B" />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text style={styles.metaText}>{item.checkInTime}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="hourglass-outline" size={12} color="#64748B" />
            <Text style={styles.metaText}>Wait: {item.estimatedWait}</Text>
          </View>
        </View>
        <View style={styles.typeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'New' ? '#DBEAFE' : '#FEF3C7' }]}>
            <Text style={[styles.typeText, { color: item.type === 'New' ? '#1E3A8A' : '#B45309' }]}>
              {item.type}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {item.priority && (
          <View style={styles.priorityBadge}>
            <Ionicons name="alert-circle" size={14} color="#fff" />
            <Text style={styles.priorityText}>URGENT</Text>
          </View>
        )}
        <TouchableOpacity 
          style={[
            styles.callButton,
            currentCalling === item.token && styles.callingButton,
            item.priority && styles.priorityCallBtn
          ]}
          onPress={() => callNextPatient(item)}
        >
          <LinearGradient
            colors={item.priority ? ['#EF4444', '#DC2626'] : ['#00D4FF', '#0099CC']}
            style={styles.callGradient}
          >
            <Ionicons name={currentCalling === item.token ? "headset" : "megaphone"} size={18} color="#fff" />
            <Text style={styles.callText}>
              {currentCalling === item.token ? "CALLING..." : "CALL"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header with Now Serving Banner */}
      <LinearGradient
        colors={['#1E3A8A', '#1E40AF']}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Token Queue</Text>
          <TouchableOpacity onPress={() => setShowTokenModal(true)} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Now Serving Card */}
        <View style={styles.nowServingCard}>
          <Text style={styles.nowServingLabel}>NOW SERVING</Text>
          <Text style={styles.nowServingNumber}>{nowServing}</Text>
          <View style={styles.nowServingRow}>
            <View style={styles.liveDot} />
            <Text style={styles.nowServingSub}>Counter 3 • Cardiology</Text>
          </View>
          <TouchableOpacity style={styles.announceBtn} onPress={playAnnouncement}>
            <Ionicons name="volume-high" size={18} color="#1E3A8A" />
            <Text style={styles.announceBtnText}>Make Announcement</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={22} color="#60A5FA" />
            <Text style={styles.statValue}>{stats.totalWaiting}</Text>
            <Text style={styles.statLabel}>Waiting</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={22} color="#34D399" />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Today Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="hourglass" size={22} color="#FBBF24" />
            <Text style={styles.statValue}>{stats.avgWaitTime}</Text>
            <Text style={styles.statLabel}>Avg Wait</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Department Info */}
      <View style={styles.departmentBar}>
        <Ionicons name="business" size={18} color="#1E3A8A" />
        <Text style={styles.departmentText}>Cardiology Department</Text>
        <View style={styles.doctorBadge}>
          <Ionicons name="medkit" size={14} color="#10B981" />
          <Text style={styles.doctorText}>Dr. Sara Malik</Text>
        </View>
      </View>

      {/* Queue List */}
      <FlatList
        data={queue}
        keyExtractor={item => item.id}
        renderItem={renderQueueItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E3A8A']} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>Patient Queue</Text>
            <Text style={styles.listHeaderCount}>{queue.length} patients</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={60} color="#34D399" />
            <Text style={styles.emptyText}>Queue is Empty</Text>
            <Text style={styles.emptySubText}>All patients have been attended</Text>
          </View>
        }
      />

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#fff" />
        <Text style={styles.infoText}>
          Estimated wait times are calculated based on current queue. Updates every 60 seconds.
        </Text>
      </View>

      {/* Generate Token Modal */}
      <Modal visible={showTokenModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate New Token</Text>
              <TouchableOpacity onPress={() => setShowTokenModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Patient Name"
              placeholderTextColor="#9CA3AF"
              value={newTokenName}
              onChangeText={setNewTokenName}
            />
            
            <Text style={styles.modalLabel}>Visit Type</Text>
            <View style={styles.typeSelector}>
              {['New', 'Follow-up', 'Emergency'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, selectedType === type && styles.typeOptionActive]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.typeOptionText, selectedType === type && styles.typeOptionTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.generateBtn} onPress={generateNewToken}>
              <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.generateGradient}>
                <Text style={styles.generateBtnText}>Generate Token</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  
  headerTitle: { color: '#fff', fontSize: fontSize.h2, fontWeight: 'bold' },
  
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  
  nowServingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  nowServingLabel: { color: '#64748B', fontSize: fontSize.small, letterSpacing: 1 },
  nowServingNumber: { color: '#1E3A8A', fontSize: 48, fontWeight: 'bold', marginVertical: 8 },
  nowServingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  nowServingSub: { color: '#64748B', fontSize: fontSize.small },
  
  announceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
  },
  announceBtnText: { color: '#1E3A8A', fontSize: fontSize.small, fontWeight: '600' },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: '#fff', fontSize: fontSize.h3, fontWeight: 'bold', marginTop: 4 },
  statLabel: { color: '#93C5FD', fontSize: fontSize.small, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  
  departmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  departmentText: { fontSize: fontSize.body, fontWeight: '600', color: '#1E3A8A', flex: 1, marginLeft: 10 },
  doctorBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  doctorText: { fontSize: fontSize.small, fontWeight: '600', color: '#059669' },
  
  listContainer: { padding: 16, paddingBottom: 100 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listHeaderTitle: { fontSize: fontSize.h3, fontWeight: 'bold', color: '#1E293B' },
  listHeaderCount: { fontSize: fontSize.small, color: '#64748B' },
  
  tokenCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: cardPadding,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityCard: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  callingCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#10B981' },
  
  tokenSection: { marginRight: 16 },
  tokenCircle: { position: 'relative' },
  tokenNumber: { fontSize: isTablet ? 32 : 24, fontWeight: 'bold', color: '#1E3A8A' },
  priorityDot: { position: 'absolute', top: -4, right: -8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  
  patientInfo: { flex: 1 },
  patientName: { fontSize: fontSize.body, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  patientMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: fontSize.small, color: '#64748B' },
  typeContainer: { flexDirection: 'row' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeText: { fontSize: fontSize.small, fontWeight: '600' },
  
  actionSection: { alignItems: 'flex-end' },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8, gap: 4 },
  priorityText: { color: '#fff', fontSize: fontSize.small, fontWeight: 'bold' },
  callButton: { borderRadius: 25, overflow: 'hidden' },
  priorityCallBtn: { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  callingButton: { opacity: 0.8 },
  callGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  callText: { color: '#fff', fontSize: fontSize.small, fontWeight: 'bold' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: fontSize.body, fontWeight: 'bold', color: '#1E293B', marginTop: 16 },
  emptySubText: { fontSize: fontSize.small, color: '#64748B', marginTop: 6 },
  
  infoBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  infoText: { color: '#93C5FD', fontSize: fontSize.small, flex: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: width * 0.9, maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: fontSize.h3, fontWeight: 'bold', color: '#1E293B' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: fontSize.body, marginBottom: 16 },
  modalLabel: { fontSize: fontSize.small, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeOption: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  typeOptionActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  typeOptionText: { color: '#64748B', fontSize: fontSize.small },
  typeOptionTextActive: { color: '#fff' },
  generateBtn: { borderRadius: 12, overflow: 'hidden' },
  generateGradient: { paddingVertical: 14, alignItems: 'center' },
  generateBtnText: { color: '#fff', fontSize: fontSize.body, fontWeight: 'bold' },
});

export default LiveTokenQueueScreen;