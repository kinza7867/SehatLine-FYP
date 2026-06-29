// screens/ai/AIQueueDashboardScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const AIQueueDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeToken, setActiveToken] = useState(null);

  // ─── AI Data ──────────────────────────────────────────────────────────
  const [aiData, setAiData] = useState({
    overview: {
      status: 'Online',
      accuracy: '96',
      patientsAssisted: 213,
      timeSaved: 18,
      confidence: 92,
      lastUpdate: 'Just now',
    },
    queueIntelligence: {
      chronicOPD: { waitTime: 13, confidence: 95, trend: 'decreasing', heat: '🟢 Low' },
      laboratory: { waitTime: 22, confidence: 88, trend: 'increasing', heat: '🔴 High' },
      pharmacy: { waitTime: 10, confidence: 95, trend: 'stable', heat: '🟡 Medium' },
    },
    crowdForecast: {
      now: 'Low',
      in30min: 'Medium',
      in1hour: 'High',
      in2hours: 'Low',
    },
    recommendations: [
      { icon: 'time-outline', text: 'Visit Pharmacy after 2:00 PM', detail: 'Expected waiting reduced by 18 minutes', priority: 'high' },
      { icon: 'flask-outline', text: 'Laboratory currently overloaded', detail: 'Recommended to visit after 3:30 PM', priority: 'medium' },
      { icon: 'medkit-outline', text: 'Queue speed increasing', detail: 'Proceed to Counter 3 for faster service', priority: 'low' },
    ],
    analytics: {
      dailyPatients: 156,
      peakHour: '11:00 AM - 1:00 PM',
      avgWaitTime: 14,
      queueSpeed: '4 patients / 10 min',
      serviceEfficiency: 94,
    },
    tokenAnalysis: {
      position: 4,
      waitTime: 13,
      priorityScore: 85,
      servingSpeed: '2 min/token',
      expectedFinish: '10:42 AM',
      chanceOfDelay: '8%',
      progress: 80,
    },
    pharmacyAssistant: {
      medicineReady: 'Predicted in 12 min',
      collectionTime: '2:15 PM',
      crowdLevel: '🟡 Medium',
      repeatAlert: 'Refill due in 3 days',
    },
    laboratoryAssistant: {
      sampleWait: '18 min',
      reportReady: '2:30 PM',
      processingProgress: 65,
      workload: '78%',
    },
  });

  // ─── Animated Values ──────────────────────────────────────────────────
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    animateProgress();
  }, []);

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: aiData.tokenAnalysis.progress / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  // ─── Load Data ──────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
      }

      const appointments = await AsyncStorage.getItem('appointments');
      if (appointments) {
        const all = JSON.parse(appointments);
        const latest = all.filter(a => 
          a.department === 'Chronic OPD' || 
          a.department === 'Pharmacy' || 
          a.department === 'Laboratory'
        );
        if (latest.length > 0) {
          setActiveToken(latest[latest.length - 1]);
        }
      }

      // Simulate AI data update
      setTimeout(() => {
        setAiData(prev => ({
          ...prev,
          queueIntelligence: {
            chronicOPD: { 
              waitTime: Math.floor(10 + Math.random() * 10), 
              confidence: Math.floor(85 + Math.random() * 15),
              trend: ['decreasing', 'increasing', 'stable'][Math.floor(Math.random() * 3)],
              heat: ['🟢 Low', '🟡 Medium', '🔴 High'][Math.floor(Math.random() * 3)]
            },
            laboratory: { 
              waitTime: Math.floor(18 + Math.random() * 12), 
              confidence: Math.floor(85 + Math.random() * 15),
              trend: ['decreasing', 'increasing', 'stable'][Math.floor(Math.random() * 3)],
              heat: ['🟢 Low', '🟡 Medium', '🔴 High'][Math.floor(Math.random() * 3)]
            },
            pharmacy: { 
              waitTime: Math.floor(8 + Math.random() * 8), 
              confidence: Math.floor(85 + Math.random() * 15),
              trend: ['decreasing', 'increasing', 'stable'][Math.floor(Math.random() * 3)],
              heat: ['🟢 Low', '🟡 Medium', '🔴 High'][Math.floor(Math.random() * 3)]
            },
          }
        }));
        animateProgress();
      }, 500);

    } catch (error) {
      console.log('Error loading data:', error);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ─── Navigation ──────────────────────────────────────────────────────────
  const navigateToScreen = (screenName, params = {}) => {
    if (screenName && navigation) {
      try {
        navigation.navigate(screenName, params);
      } catch (error) {
        console.log('Navigation error:', error);
      }
    }
  };

  // ─── Render Header ──────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>AI Queue Intelligence</Text>
              <Text style={styles.headerSub}>Smart Wait Time Prediction</Text>
            </View>

            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => navigateToScreen('ProfileScreen')}
            >
              <Ionicons name="person-circle-outline" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  // ─── 1. AI Overview ──────────────────────────────────────────────────
  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI Overview</Text>
      <View style={[styles.overviewGrid, styles.cardShadow]}>
        <View style={[styles.overviewCard, { borderColor: '#34D39940' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: '#34D39915' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#34D399" />
          </View>
          <Text style={styles.overviewValue}>Online</Text>
          <Text style={styles.overviewLabel}>AI Status</Text>
        </View>
        <View style={[styles.overviewCard, { borderColor: COLORS.primary + '40' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: COLORS.primary + '15' }]}>
            <Ionicons name="analytics" size={20} color={COLORS.primary} />
          </View>
          <Text style={[styles.overviewValue, { color: COLORS.primary }]}>{aiData.overview.accuracy}%</Text>
          <Text style={styles.overviewLabel}>Accuracy</Text>
        </View>
        <View style={[styles.overviewCard, { borderColor: '#8B5CF640' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: '#8B5CF615' }]}>
            <Ionicons name="people" size={20} color="#8B5CF6" />
          </View>
          <Text style={[styles.overviewValue, { color: '#8B5CF6' }]}>{aiData.overview.patientsAssisted}</Text>
          <Text style={styles.overviewLabel}>Patients Assisted</Text>
        </View>
        <View style={[styles.overviewCard, { borderColor: '#F59E0B40' }]}>
          <View style={[styles.overviewIcon, { backgroundColor: '#F59E0B15' }]}>
            <Ionicons name="time" size={20} color="#F59E0B" />
          </View>
          <Text style={[styles.overviewValue, { color: '#F59E0B' }]}>{aiData.overview.timeSaved}m</Text>
          <Text style={styles.overviewLabel}>Time Saved</Text>
        </View>
      </View>
    </View>
  );

  // ─── 2. Queue Intelligence ──────────────────────────────────────────
  const renderQueueIntelligence = () => {
    const departments = [
      { key: 'chronicOPD', label: 'Chronic OPD', icon: 'medical-outline', color: '#8B5CF6' },
      { key: 'laboratory', label: 'Laboratory', icon: 'flask-outline', color: '#10B981' },
      { key: 'pharmacy', label: 'Pharmacy', icon: 'medkit-outline', color: '#F59E0B' },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Intelligence</Text>
        {departments.map((dept) => {
          const data = aiData.queueIntelligence[dept.key];
          const trendIcon = data.trend === 'increasing' ? 'arrow-up' : data.trend === 'decreasing' ? 'arrow-down' : 'remove';
          const trendColor = data.trend === 'increasing' ? '#EF4444' : data.trend === 'decreasing' ? '#34D399' : '#F59E0B';

          return (
            <View key={dept.key} style={[styles.queueCard, styles.cardShadow, { borderColor: dept.color + '40' }]}>
              <View style={styles.queueHeader}>
                <View style={[styles.queueIcon, { backgroundColor: dept.color + '15' }]}>
                  <Ionicons name={dept.icon} size={22} color={dept.color} />
                </View>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueDept}>{dept.label}</Text>
                  <Text style={styles.queueHeat}>{data.heat}</Text>
                </View>
                <View style={styles.queueWait}>
                  <Text style={styles.queueWaitValue}>{data.waitTime} min</Text>
                  <Ionicons name={trendIcon} size={16} color={trendColor} />
                </View>
              </View>
              <View style={styles.queueFooter}>
                <View style={styles.confidenceBar}>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <View style={styles.confidenceTrack}>
                    <View style={[styles.confidenceFill, { width: data.confidence + '%', backgroundColor: dept.color }]} />
                  </View>
                  <Text style={styles.confidenceValue}>{data.confidence}%</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.viewBtn, { borderColor: dept.color }]}
                  onPress={() => navigateToScreen('LiveTokenQueueScreen', { department: dept.label })}
                >
                  <Text style={[styles.viewBtnText, { color: dept.color }]}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // ─── 3. Crowd Forecast ──────────────────────────────────────────────
  const renderCrowdForecast = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Crowd Forecast</Text>
      <View style={[styles.forecastCard, styles.cardShadow]}>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastLabel}>Now</Text>
          <View style={[styles.forecastBadge, { backgroundColor: '#34D39915' }]}>
            <Text style={[styles.forecastBadgeText, { color: '#34D399' }]}>🟢 Low</Text>
          </View>
        </View>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastLabel}>30 Min</Text>
          <View style={[styles.forecastBadge, { backgroundColor: '#F59E0B15' }]}>
            <Text style={[styles.forecastBadgeText, { color: '#F59E0B' }]}>🟡 Medium</Text>
          </View>
        </View>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastLabel}>1 Hour</Text>
          <View style={[styles.forecastBadge, { backgroundColor: '#EF444415' }]}>
            <Text style={[styles.forecastBadgeText, { color: '#EF4444' }]}>🔴 High</Text>
          </View>
        </View>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastLabel}>2 Hours</Text>
          <View style={[styles.forecastBadge, { backgroundColor: '#34D39915' }]}>
            <Text style={[styles.forecastBadgeText, { color: '#34D399' }]}>🟢 Low</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ─── 4. Token Analysis ──────────────────────────────────────────────
  const renderTokenAnalysis = () => {
    const progress = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Token Analysis</Text>
        <View style={[styles.tokenCard, styles.cardShadow, { borderColor: COLORS.primary + '40' }]}>
          <View style={styles.tokenCardHeader}>
            <View>
              <Text style={styles.tokenNumber}>{activeToken?.token || 'No Token'}</Text>
              <Text style={styles.tokenDept}>{activeToken?.department || 'No Active Token'}</Text>
            </View>
            <View style={styles.tokenPosition}>
              <Text style={styles.tokenPositionLabel}>Position</Text>
              <Text style={styles.tokenPositionValue}>#{aiData.tokenAnalysis.position}</Text>
            </View>
          </View>
          <View style={styles.tokenProgress}>
            <Text style={styles.tokenProgressLabel}>Progress</Text>
            <View style={styles.tokenProgressTrack}>
              <Animated.View style={[styles.tokenProgressFill, { width: progress }]} />
            </View>
            <Text style={styles.tokenProgressValue}>{aiData.tokenAnalysis.progress}%</Text>
          </View>
          <View style={styles.tokenStats}>
            <View style={styles.tokenStat}>
              <Text style={styles.tokenStatLabel}>Wait Time</Text>
              <Text style={[styles.tokenStatValue, { color: COLORS.primary }]}>{aiData.tokenAnalysis.waitTime} min</Text>
            </View>
            <View style={styles.tokenStat}>
              <Text style={styles.tokenStatLabel}>Priority Score</Text>
              <Text style={[styles.tokenStatValue, { color: '#8B5CF6' }]}>{aiData.tokenAnalysis.priorityScore}%</Text>
            </View>
            <View style={styles.tokenStat}>
              <Text style={styles.tokenStatLabel}>Delay Chance</Text>
              <Text style={[styles.tokenStatValue, { color: '#F59E0B' }]}>{aiData.tokenAnalysis.chanceOfDelay}</Text>
            </View>
            <View style={styles.tokenStat}>
              <Text style={styles.tokenStatLabel}>Finish Time</Text>
              <Text style={[styles.tokenStatValue, { color: '#34D399' }]}>{aiData.tokenAnalysis.expectedFinish}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.tokenTrackBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigateToScreen('LiveTokenQueueScreen')}
          >
            <Text style={styles.tokenTrackBtnText}>Track Your Token</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── 5. Pharmacy Assistant ──────────────────────────────────────────
  const renderPharmacyAssistant = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pharmacy Assistant</Text>
      <View style={[styles.assistantCard, styles.cardShadow]}>
        <View style={styles.assistantGrid}>
          <View style={styles.assistantItem}>
            <Ionicons name="medkit-outline" size={20} color="#F59E0B" />
            <Text style={styles.assistantLabel}>Medicine Ready</Text>
            <Text style={[styles.assistantValue, { color: '#F59E0B' }]}>{aiData.pharmacyAssistant.medicineReady}</Text>
          </View>
          <View style={styles.assistantItem}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={styles.assistantLabel}>Collection Time</Text>
            <Text style={[styles.assistantValue, { color: '#F59E0B' }]}>{aiData.pharmacyAssistant.collectionTime}</Text>
          </View>
          <View style={styles.assistantItem}>
            <Ionicons name="people-outline" size={20} color="#F59E0B" />
            <Text style={styles.assistantLabel}>Crowd Level</Text>
            <Text style={[styles.assistantValue, { color: '#F59E0B' }]}>{aiData.pharmacyAssistant.crowdLevel}</Text>
          </View>
          <View style={styles.assistantItem}>
            <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
            <Text style={styles.assistantLabel}>Refill Alert</Text>
            <Text style={[styles.assistantValue, { color: '#F59E0B' }]}>{aiData.pharmacyAssistant.repeatAlert}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ─── 6. Laboratory Assistant ──────────────────────────────────────────
  const renderLaboratoryAssistant = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Laboratory Assistant</Text>
      <View style={[styles.assistantCard, styles.cardShadow]}>
        <View style={styles.assistantGrid}>
          <View style={styles.assistantItem}>
            <Ionicons name="flask-outline" size={20} color="#10B981" />
            <Text style={styles.assistantLabel}>Sample Wait</Text>
            <Text style={[styles.assistantValue, { color: '#10B981' }]}>{aiData.laboratoryAssistant.sampleWait}</Text>
          </View>
          <View style={styles.assistantItem}>
            <Ionicons name="document-text-outline" size={20} color="#10B981" />
            <Text style={styles.assistantLabel}>Report Ready</Text>
            <Text style={[styles.assistantValue, { color: '#10B981' }]}>{aiData.laboratoryAssistant.reportReady}</Text>
          </View>
          <View style={styles.assistantItem}>
            <Ionicons name="time-outline" size={20} color="#10B981" />
            <Text style={styles.assistantLabel}>Processing</Text>
            <Text style={[styles.assistantValue, { color: '#10B981' }]}>{aiData.laboratoryAssistant.processingProgress}%</Text>
          </View>
          <View style={styles.assistantItem}>
            <Ionicons name="analytics-outline" size={20} color="#10B981" />
            <Text style={styles.assistantLabel}>Workload</Text>
            <Text style={[styles.assistantValue, { color: '#10B981' }]}>{aiData.laboratoryAssistant.workload}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ─── 7. Smart Recommendations ──────────────────────────────────────────
  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Smart Recommendations</Text>
      {aiData.recommendations.map((item, index) => (
        <View key={index} style={[styles.recommendCard, styles.cardShadow, { borderColor: COLORS.primary + '40' }]}>
          <View style={styles.recommendIcon}>
            <Ionicons name={item.icon} size={20} color={COLORS.primary} />
          </View>
          <View style={styles.recommendContent}>
            <Text style={styles.recommendText}>{item.text}</Text>
            <Text style={styles.recommendDetail}>{item.detail}</Text>
          </View>
          <View style={[styles.priorityBadge, { 
            backgroundColor: item.priority === 'high' ? '#EF444415' : item.priority === 'medium' ? '#F59E0B15' : '#34D39915'
          }]}>
            <Text style={[styles.priorityText, {
              color: item.priority === 'high' ? '#EF4444' : item.priority === 'medium' ? '#F59E0B' : '#34D399'
            }]}>{item.priority}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  // ─── 8. Quick AI Actions ──────────────────────────────────────────────
  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={[styles.actionCard, styles.cardShadow]} onPress={() => Alert.alert('Predict', 'Analyzing wait time...')}>
          <Ionicons name="time-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>Predict Wait</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, styles.cardShadow]} onPress={() => navigateToScreen('LiveTokenQueueScreen')}>
          <Ionicons name="ticket-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>Analyze Token</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, styles.cardShadow]} onPress={() => Alert.alert('Best Time', 'Finding best time...')}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>Best Time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, styles.cardShadow]} onPress={() => navigateToScreen('LiveTokenQueueScreen')}>
          <Ionicons name="people-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>Queue Heatmap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading AI intelligence...</Text>
      </View>
    );
  }

  // ─── ROOT ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />
      
      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderOverview()}
        {renderQueueIntelligence()}
        {renderCrowdForecast()}
        {renderTokenAnalysis()}
        {renderPharmacyAssistant()}
        {renderLaboratoryAssistant()}
        {renderRecommendations()}
        {renderQuickActions()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI predictions update in real-time</Text>
          <Text style={styles.footerSub}>Last updated: {aiData.overview.lastUpdate}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: hp(2),
    color: COLORS.textSecondary,
    fontSize: wp(3.5),
  },

  // ─── Header ────────────────────────────────────────────────────────────
  headerContainer: {
    marginBottom: hp(0.5),
  },
  headerGradient: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(3),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? hp(2) : hp(1.5),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  headerSub: {
    color: COLORS.white + '70',
    fontSize: wp(2.8),
    marginTop: hp(0.1),
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  content: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(2),
  },

  cardShadow: { ...SHADOWS.small },

  // ─── Section ────────────────────────────────────────────────────────────
  section: {
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(0.8),
  },

  // ─── Overview ────────────────────────────────────────────────────────────
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overviewCard: {
    width: (width - wp(8) - 20) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: wp(2.5),
    alignItems: 'center',
    margin: wp(0.5),
    borderWidth: 1,
  },
  overviewIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(0.2),
  },
  overviewValue: {
    fontSize: wp(4.5),
    fontWeight: '800',
    color: COLORS.text,
  },
  overviewLabel: {
    fontSize: wp(2.4),
    color: COLORS.textSecondary,
    marginTop: hp(0.03),
  },

  // ─── Queue Intelligence ────────────────────────────────────────────────
  queueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(0.8),
    borderWidth: 1,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueInfo: {
    flex: 1,
    marginLeft: wp(2.5),
  },
  queueDept: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.text,
  },
  queueHeat: {
    fontSize: wp(2.5),
    marginTop: hp(0.02),
  },
  queueWait: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  queueWaitValue: {
    fontSize: wp(4),
    fontWeight: '800',
    color: COLORS.text,
  },
  queueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(0.5),
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confidenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  confidenceLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
  },
  confidenceTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceValue: {
    fontSize: wp(2.4),
    fontWeight: '600',
    color: COLORS.text,
  },
  viewBtn: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: 6,
    borderWidth: 1,
  },
  viewBtnText: {
    fontSize: wp(2.5),
    fontWeight: '500',
  },

  // ─── Crowd Forecast ────────────────────────────────────────────────────
  forecastCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  forecastLabel: {
    fontSize: wp(3),
    fontWeight: '500',
    color: COLORS.text,
  },
  forecastBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.1),
    borderRadius: 6,
  },
  forecastBadgeText: {
    fontSize: wp(2.5),
    fontWeight: '500',
  },

  // ─── Token Analysis ────────────────────────────────────────────────────
  tokenCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(3),
    borderWidth: 1,
  },
  tokenCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenNumber: {
    fontSize: wp(5),
    fontWeight: '900',
    color: COLORS.text,
  },
  tokenDept: {
    fontSize: wp(2.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.02),
  },
  tokenPosition: {
    alignItems: 'center',
  },
  tokenPositionLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
  },
  tokenPositionValue: {
    fontSize: wp(4),
    fontWeight: '800',
    color: COLORS.text,
  },
  tokenProgress: {
    marginTop: hp(0.5),
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tokenProgressLabel: {
    fontSize: wp(2.5),
    color: COLORS.textSecondary,
  },
  tokenProgressTrack: {
    height: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: hp(0.1),
  },
  tokenProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  tokenProgressValue: {
    fontSize: wp(2.5),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: hp(0.05),
    textAlign: 'right',
  },
  tokenStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp(0.5),
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tokenStat: {
    width: '50%',
    paddingVertical: hp(0.2),
  },
  tokenStatLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
  },
  tokenStatValue: {
    fontSize: wp(3),
    fontWeight: '700',
    marginTop: hp(0.02),
  },
  tokenTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(0.6),
    borderRadius: 8,
    marginTop: hp(0.5),
    gap: 6,
  },
  tokenTrackBtnText: {
    color: COLORS.white,
    fontSize: wp(3),
    fontWeight: '600',
  },

  // ─── Assistant Cards ──────────────────────────────────────────────────
  assistantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  assistantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  assistantItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: hp(0.3),
  },
  assistantLabel: {
    fontSize: wp(2.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.02),
  },
  assistantValue: {
    fontSize: wp(3.2),
    fontWeight: '700',
    marginTop: hp(0.02),
  },

  // ─── Recommendations ──────────────────────────────────────────────────
  recommendCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: wp(2.5),
    marginBottom: hp(0.6),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  recommendIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2),
  },
  recommendContent: {
    flex: 1,
  },
  recommendText: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
  },
  recommendDetail: {
    fontSize: wp(2.3),
    color: COLORS.textSecondary,
    marginTop: hp(0.02),
  },
  priorityBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.05),
    borderRadius: 4,
  },
  priorityText: {
    fontSize: wp(2),
    fontWeight: '500',
    textTransform: 'uppercase',
  },

  // ─── Quick Actions ────────────────────────────────────────────────────
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - wp(12)) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: wp(2.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: hp(0.5),
  },
  actionText: {
    fontSize: wp(2.6),
    color: COLORS.text,
    fontWeight: '500',
    marginTop: hp(0.1),
  },

  // ─── Footer ────────────────────────────────────────────────────────────
  footer: {
    marginTop: hp(1),
    marginBottom: hp(2),
    alignItems: 'center',
  },
  footerText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
  },
  footerSub: {
    fontSize: wp(2.2),
    color: COLORS.textLight,
    marginTop: hp(0.1),
  },
});

export default AIQueueDashboardScreen;