import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  RefreshControl, Alert, Dimensions, Image, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const AIHealthTipsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Patient');
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // ─── Load user data ──────────────────────────────────────────────────
  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) {
        const data = JSON.parse(stored);
        setUserName(data.name || 'Patient');
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  // ─── AI Modules ──────────────────────────────────────────────────────
  const aiModules = [
    {
      id: '1',
      title: 'Symptom Checker',
      subtitle: 'AI preliminary assessment',
      icon: 'medkit-outline',
      color: '#EF4444',
      screen: 'AISymptomCheckerScreen',
      bg: '#EF444415',
    },
    {
      id: '2',
      title: 'Severity Analysis',
      subtitle: 'AI-based severity assessment',
      icon: 'analytics-outline',
      color: '#F59E0B',
      screen: 'AISeverityResultScreen',
      bg: '#F59E0B15',
    },
    {
      id: '3',
      title: 'Predictive Wait',
      subtitle: 'AI queue time prediction',
      icon: 'timer-outline',
      color: COLORS.primary,
      screen: 'PredictiveWaitScreen',
      bg: COLORS.primary + '15',
    },
  ];

  // ─── Health Tips ──────────────────────────────────────────────────────
  const [tips] = useState([
    {
      id: 1,
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to maintain optimal health and energy levels.',
      icon: 'water-outline',
      color: '#3B82F6',
      bg: '#3B82F615',
      category: 'Wellness',
    },
    {
      id: 2,
      title: 'Daily Walking',
      description: 'Walk 30 minutes every day to improve heart health and boost your immune system.',
      icon: 'walk-outline',
      color: '#10B981',
      bg: '#10B98115',
      category: 'Fitness',
    },
    {
      id: 3,
      title: 'Medication Adherence',
      description: 'Take medicines on time as prescribed by your doctor. Set reminders for consistency.',
      icon: 'medkit-outline',
      color: '#EF4444',
      bg: '#EF444415',
      category: 'Medication',
    },
    {
      id: 4,
      title: 'Quality Sleep',
      description: 'Aim for 7-8 hours of quality sleep. Maintain a consistent sleep schedule.',
      icon: 'bed-outline',
      color: '#6366F1',
      bg: '#6366F115',
      category: 'Wellness',
    },
    {
      id: 5,
      title: 'Stress Management',
      description: 'Practice deep breathing or meditation for 10 minutes daily to reduce stress.',
      icon: 'leaf-outline',
      color: '#8B5CF6',
      bg: '#8B5CF615',
      category: 'Mental Health',
    },
    {
      id: 6,
      title: 'Healthy Diet',
      description: 'Include fresh fruits, vegetables, and whole grains in your daily diet.',
      icon: 'nutrition-outline',
      color: '#F59E0B',
      bg: '#F59E0B15',
      category: 'Nutrition',
    },
  ]);

  const generateNewTips = () => {
    const tipOptions = [
      { title: 'Reduce Sugar', description: 'Cut down on sugary drinks and processed foods.', icon: 'barbell-outline', color: '#F59E0B', category: 'Nutrition' },
      { title: 'Regular Checkups', description: 'Schedule regular health checkups to catch issues early.', icon: 'calendar-outline', color: '#06B6D4', category: 'Preventive' },
      { title: 'Stay Active', description: 'Take short breaks every hour to stretch and move around.', icon: 'fitness-outline', color: '#10B981', category: 'Fitness' },
      { title: 'Protect Your Skin', description: 'Apply sunscreen when going out and stay hydrated.', icon: 'sunny-outline', color: '#F59E0B', category: 'Wellness' },
      { title: 'Monitor Blood Pressure', description: 'Regularly check your blood pressure if you have hypertension.', icon: 'heart-outline', color: '#EF4444', category: 'Monitoring' },
      { title: 'Stay Connected', description: 'Maintain social connections for better mental health.', icon: 'people-outline', color: '#8B5CF6', category: 'Mental Health' },
      { title: 'Limit Screen Time', description: 'Reduce screen time before bed for better sleep quality.', icon: 'phone-portrait-outline', color: '#6366F1', category: 'Wellness' },
    ];

    const shuffled = [...tipOptions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    Alert.alert('✨ New Tips', 'AI has personalized new health tips for you!');
  };

  const onRefresh = () => {
    setRefreshing(true);
    generateNewTips();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const navigateTo = (screen) => {
    if (navigation) {
      try {
        navigation.navigate(screen);
      } catch (error) {
        Alert.alert('Coming Soon', 'This feature is being updated.');
      }
    }
  };

  // ─── Render Header ────────────────────────────────────────────────────
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
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../../assets/logo.png')} 
                  style={styles.logoImage} 
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>SehatLine</Text>
                <Text style={styles.headerSub}>AI Health Assistant</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => navigation.navigate('ProfileScreen')}
            >
              <Ionicons name="person-circle-outline" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  // ─── Render Greeting ──────────────────────────────────────────────────
  const renderGreeting = () => (
    <View style={styles.greetingContainer}>
      <Text style={styles.greetingHello}>Hello,</Text>
      <Text style={styles.greetingName}>{userName} 👋</Text>
      <Text style={styles.greetingSub}>AI-powered health assistant at your service</Text>
    </View>
  );

  // ─── Render AI Modules (SINGLE ROW) ──────────────────────────────────
  const renderAIModules = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI Services</Text>
      <View style={styles.modulesRow}>
        {aiModules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={[styles.moduleCard, styles.cardShadow, { borderColor: module.color + '30' }]}
            onPress={() => navigateTo(module.screen)}
            activeOpacity={0.85}
          >
            <View style={[styles.moduleIcon, { backgroundColor: module.bg }]}>
              <Ionicons name={module.icon} size={24} color={module.color} />
            </View>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ─── Render Health Tips ──────────────────────────────────────────────
  const renderHealthTips = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Tips</Text>
        <TouchableOpacity onPress={generateNewTips} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
          <Text style={styles.viewAllText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Tip Card */}
      <LinearGradient
        colors={[COLORS.primary + '12', COLORS.secondary + '08']}
        style={styles.featuredTipCard}
      >
        <View style={styles.featuredTipHeader}>
          <View style={[styles.featuredTipIcon, { backgroundColor: tips[activeTipIndex].color + '18' }]}>
            <Ionicons name={tips[activeTipIndex].icon} size={wp(6)} color={tips[activeTipIndex].color} />
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: tips[activeTipIndex].color + '15' }]}>
            <Text style={[styles.categoryText, { color: tips[activeTipIndex].color }]}>
              {tips[activeTipIndex].category}
            </Text>
          </View>
        </View>
        <Text style={styles.featuredTipTitle}>{tips[activeTipIndex].title}</Text>
        <Text style={styles.featuredTipDescription}>{tips[activeTipIndex].description}</Text>
        
        <View style={styles.featuredTipFooter}>
          <View style={styles.dotsContainer}>
            {tips.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeTipIndex === index && styles.dotActive,
                  { backgroundColor: activeTipIndex === index ? tips[index].color : COLORS.border }
                ]}
              />
            ))}
          </View>
          <TouchableOpacity 
            style={[styles.nextBtn, { backgroundColor: tips[activeTipIndex].color }]}
            onPress={() => setActiveTipIndex((activeTipIndex + 1) % tips.length)}
          >
            <Text style={styles.nextBtnText}>Next Tip</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* All Tips List */}
      <View style={styles.tipsList}>
        {tips.map((tip) => (
          <TouchableOpacity
            key={tip.id}
            style={[styles.tipCard, styles.cardShadow, { borderLeftColor: tip.color, borderLeftWidth: 4 }]}
            activeOpacity={0.85}
            onPress={() => {
              setActiveTipIndex(tip.id - 1);
              Alert.alert(tip.title, tip.description);
            }}
          >
            <View style={[styles.tipIcon, { backgroundColor: tip.bg }]}>
              <Ionicons name={tip.icon} size={22} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription} numberOfLines={2}>
                {tip.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ─── Render Footer ──────────────────────────────────────────────────
  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>SehatLine • CDA Hospital Islamabad</Text>
      <Text style={styles.footerSub}>AI-Powered Healthcare</Text>
    </View>
  );

  // ─── ROOT ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.2 }}
        style={styles.gradientBackground}
      />

      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {renderGreeting()}
        {renderAIModules()}
        {renderHealthTips()}
        {renderFooter()}
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

  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(20),
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },

  cardShadow: { ...SHADOWS.small },

  // ─── Header ────────────────────────────────────────────────────────────
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : (StatusBar.currentHeight || 24) + hp(0.5),
    marginBottom: hp(0.5),
  },
  headerGradient: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2.5),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? hp(1) : hp(0.5),
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  headerSub: {
    color: COLORS.white + '70',
    fontSize: wp(2.8),
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

  // ─── Greeting ──────────────────────────────────────────────────────────
  greetingContainer: {
    marginTop: hp(0.5),
    marginBottom: hp(1.5),
  },
  greetingHello: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },
  greetingName: {
    fontSize: wp(5.5),
    fontWeight: '800',
    color: COLORS.text,
    marginTop: hp(0.05),
  },
  greetingSub: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    marginTop: hp(0.1),
  },

  // ─── Section ──────────────────────────────────────────────────────────
  section: {
    marginBottom: hp(1.5),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  sectionTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1),
  },
  viewAllText: {
    fontSize: wp(3),
    color: COLORS.primary,
    fontWeight: '600',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // ─── AI Modules (SINGLE ROW - 3 cards in one row) ──────────────────
  modulesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  moduleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: wp(2.5),
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.small,
    paddingVertical: hp(1.5),
  },
  moduleIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(0.3),
  },
  moduleTitle: {
    fontSize: wp(2.8),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  moduleSubtitle: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp(0.05),
  },

  // ─── Featured Tip ──────────────────────────────────────────────────
  featuredTipCard: {
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  featuredTipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  featuredTipIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  categoryText: {
    fontSize: wp(2.4),
    fontWeight: '600',
  },
  featuredTipTitle: {
    fontSize: wp(4.5),
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: hp(0.3),
  },
  featuredTipDescription: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    lineHeight: hp(2),
    marginBottom: hp(0.8),
  },
  featuredTipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(2.5),
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  // ─── Health Tips ──────────────────────────────────────────────────────
  tipsList: {
    marginTop: hp(0.5),
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(0.6),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2.5),
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: COLORS.text,
  },
  tipDescription: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    marginTop: hp(0.05),
  },

  // ─── Footer ────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: wp(3.2),
    color: COLORS.primary,
    fontWeight: '700',
  },
  footerSub: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    marginTop: hp(0.2),
  },
});

export default AIHealthTipsScreen;