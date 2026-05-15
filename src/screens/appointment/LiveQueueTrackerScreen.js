import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';

const QueueTrackerScreen = ({ navigation }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.2, { duration: 1500 }), -1, true);
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.2], [0.8, 0.3]),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#000033', '#000022']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#00EAFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LIVE QUEUE</Text>
          <Ionicons name="notifications-outline" size={24} color="#00EAFF" />
        </View>

        {/* 🏥 Doctor Info Card */}
        <View style={styles.doctorBrief}>
          <Text style={styles.docName}>Dr. Sarah Ahmed</Text>
          <Text style={styles.deptText}>Cardiology Dept | Room 402</Text>
        </View>

        {/* 🔢 Main Queue Display */}
        <View style={styles.mainDisplay}>
          <Animated.View style={[styles.pulseCircle, animatedPulse]} />
          <View style={styles.tokenCircle}>
            <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
            <Text style={styles.tokenNumber}>A-12</Text>
          </View>
        </View>

        {/* 📊 Status Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Ahead of You" value="04" icon="people" color="#00EAFF" />
          <StatBox label="Est. Wait" value="25m" icon="time" color="#FFD700" />
        </View>

        {/* 🕒 Timeline of Current Progress */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Queue Progress</Text>
          
          <TimelineItem 
            token="A-09" status="Currently with Doctor" 
            isCurrent={true} isDone={false} 
          />
          <TimelineItem 
            token="A-10" status="At the Door" 
            isCurrent={false} isDone={false} 
          />
          <TimelineItem 
            token="A-11" status="Waiting" 
            isCurrent={false} isDone={false} 
          />
          <View style={styles.yourTurnMarker}>
            <Text style={styles.yourTurnText}>YOUR TURN NEXT</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Helper Components ---

const StatBox = ({ label, value, icon, color }) => (
  <View style={styles.statBox}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const TimelineItem = ({ token, status, isCurrent, isDone }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.dot, isCurrent && styles.activeDot]} />
      <View style={styles.line} />
    </View>
    <View style={[styles.timelineCard, isCurrent && styles.activeCard]}>
      <Text style={[styles.timelineToken, isCurrent && styles.activeText]}>{token}</Text>
      <Text style={[styles.timelineStatus, isCurrent && styles.activeText]}>{status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000033' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  
  doctorBrief: { alignItems: 'center', marginBottom: 30 },
  docName: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  deptText: { color: '#00EAFF', fontSize: 13, opacity: 0.8 },

  mainDisplay: { alignItems: 'center', justifyContent: 'center', height: 250 },
  pulseCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 234, 255, 0.2)',
  },
  tokenCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#00EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#00EAFF',
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  tokenLabel: { color: '#000033', fontSize: 12, fontWeight: '900', opacity: 0.6 },
  tokenNumber: { color: '#000033', fontSize: 52, fontWeight: '900' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statBox: { 
    width: '47%', backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 15, borderRadius: 15, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0, 234, 255, 0.1)'
  },
  statValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginVertical: 5 },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  timelineSection: { marginTop: 40 },
  sectionTitle: { color: '#00EAFF', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  
  timelineItem: { flexDirection: 'row', height: 70 },
  timelineLeft: { alignItems: 'center', width: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { backgroundColor: '#00EAFF', width: 14, height: 14, borderRadius: 7 },
  line: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  timelineCard: { 
    flex: 1, marginLeft: 15, backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 12, paddingHorizontal: 15, justifyContent: 'center', height: 55 
  },
  activeCard: { backgroundColor: 'rgba(0, 234, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 234, 255, 0.3)' },
  timelineToken: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  timelineStatus: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  activeText: { color: '#00EAFF' },

  yourTurnMarker: { 
    backgroundColor: '#00EAFF', padding: 10, borderRadius: 10, 
    alignSelf: 'center', marginTop: 10, width: '100%', alignItems: 'center' 
  },
  yourTurnText: { color: '#000', fontWeight: '900', letterSpacing: 1 }
});

export default QueueTrackerScreen;