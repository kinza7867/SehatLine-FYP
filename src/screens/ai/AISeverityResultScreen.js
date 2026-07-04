import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, StatusBar, SafeAreaView, Platform,
  Animated, Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ─── COMPACT LINE CHART ─────────────────────────────────────────
const CompactLineChart = ({ data, color, label }) => {
  const chartWidth = width - wp(20);
  const chartHeight = hp(10);
  const maxValue = Math.max(...data) + 10;
  const minValue = Math.min(...data) - 10;
  const range = maxValue - minValue || 1;

  const getYPosition = (value) => {
    return chartHeight - ((value - minValue) / range) * (chartHeight - 20);
  };

  const getXPosition = (index) => {
    return (index / (data.length - 1)) * (chartWidth - 20) + 10;
  };

  const points = data.map((value, index) => ({
    x: getXPosition(index),
    y: getYPosition(value),
    value: value
  }));

  // Calculate trend
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
  const trendColor = trend === 'up' ? '#EF4444' : trend === 'down' ? '#10B981' : '#F59E0B';
  const trendIcon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';

  return (
    <View style={styles.compactChartContainer}>
      <View style={styles.compactChartHeader}>
        <Text style={styles.compactChartLabel}>{label}</Text>
        <View style={[styles.compactTrendBadge, { backgroundColor: trendColor + '15' }]}>
          <Ionicons name={trendIcon} size={wp(2.5)} color={trendColor} />
          <Text style={[styles.compactTrendText, { color: trendColor }]}>
            {trend === 'up' ? '+' : ''}{Math.round(((lastValue - firstValue) / firstValue) * 100)}%
          </Text>
        </View>
      </View>

      <View style={[styles.compactChartArea, { height: chartHeight }]}>
        {/* Line segments */}
        {points.length > 1 && points.map((point, index) => {
          if (index === points.length - 1) return null;
          const nextPoint = points[index + 1];
          return (
            <View
              key={`line-${index}`}
              style={{
                position: 'absolute',
                left: point.x,
                top: point.y,
                width: nextPoint.x - point.x,
                height: 2.5,
                backgroundColor: color,
                transform: [
                  {
                    rotate: `${Math.atan2(
                      nextPoint.y - point.y,
                      nextPoint.x - point.x
                    )}rad`,
                  },
                ],
                transformOrigin: 'left center',
              }}
            />
          );
        })}

        {/* Points */}
        {points.map((point, index) => (
          <View
            key={index}
            style={[
              styles.compactChartPoint,
              {
                left: point.x - 3.5,
                top: point.y - 3.5,
                backgroundColor: index === points.length - 1 ? color : color + '80',
                borderWidth: index === points.length - 1 ? 2 : 1,
                width: index === points.length - 1 ? 8 : 5,
                height: index === points.length - 1 ? 8 : 5,
                borderRadius: index === points.length - 1 ? 4 : 2.5,
              }
            ]}
          />
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => (
          <Text
            key={`label-${index}`}
            style={[
              styles.compactChartXLabel,
              {
                left: point.x - wp(1.5),
                top: chartHeight - 12,
                color: index === points.length - 1 ? color : COLORS.textLight,
                fontWeight: index === points.length - 1 ? '700' : '400',
              }
            ]}
          >
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
          </Text>
        ))}

        {/* Current value highlight */}
        <View style={[styles.compactCurrentValue, { backgroundColor: color + '15' }]}>
          <Text style={[styles.compactCurrentText, { color }]}>
            Current: {data[data.length - 1]}%
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── COMPACT BAR CHART ──────────────────────────────────────────
const CompactBarChart = ({ data, colors, labels }) => {
  const maxValue = Math.max(...data) || 1;
  const barWidth = (width - wp(20)) / data.length;

  return (
    <View style={styles.compactBarContainer}>
      {data.map((value, index) => {
        const percentage = (value / maxValue) * 100;
        return (
          <View key={index} style={styles.compactBarItem}>
            <View style={styles.compactBarWrapper}>
              <View
                style={[
                  styles.compactBar,
                  {
                    height: Math.max((value / maxValue) * 45, 6),
                    width: barWidth * 0.5,
                    backgroundColor: colors[index % colors.length],
                    opacity: percentage > 50 ? 1 : 0.7,
                  },
                ]}
              />
              {percentage > 30 && (
                <Text style={[styles.compactBarValue, { color: colors[index % colors.length] }]}>
                  {value}
                </Text>
              )}
            </View>
            <Text style={styles.compactBarLabel}>{labels[index]}</Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────
const AISeverityResultScreen = ({ navigation, route }) => {
  const [selectedModule, setSelectedModule] = useState('chronic');
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [fadeAnim] = useState(new Animated.Value(0));

  // ─── COMPLETE AI DATA FOR 3 MODULES ──────────────────────────
  const severityData = {
    chronic: {
      id: 'chronic',
      name: 'Chronic OPD',
      icon: 'medical-outline',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#6D28D9'],
      emoji: '🏥',
      description: 'Chronic Disease Management',
      
      // Severity Metrics
      currentSeverity: 'Moderate',
      severityScore: 68,
      trend: 'decreasing',
      change: -8,
      
      // Patient Statistics
      totalPatients: 142,
      critical: 12,
      high: 28,
      medium: 45,
      low: 57,
      
      // Timeline Data
      weeklyData: [72, 70, 68, 65, 62, 60, 58],
      monthlyData: [75, 72, 68, 65, 62, 60, 58, 55, 52, 50, 48, 45],
      
      // AI Insights
      topSymptoms: ['Chest Pain', 'Shortness of Breath', 'Chronic Fatigue', 'Dizziness', 'Palpitations'],
      aiObservation: 'Significant improvement in chronic care management. Respiratory cases showing positive response to treatment. Continue current protocol.',
      prediction: 'Severity expected to decrease by 12% over next month with current treatment plan.',
      riskLevel: 'Moderate',
      
      // Recommendations
      recommendations: [
        'Increase staff in respiratory unit by 2 nurses',
        'Schedule follow-up for high-risk patients',
        'Implement telemedicine for stable patients'
      ],
      
      // Department Info
      departments: ['Cardiology', 'Respiratory', 'General Medicine', 'Endocrinology'],
      waitTime: '15-20 min',
      capacity: '85%',
      
      // AI Confidence
      aiConfidence: 94,
      
      // Smart Insights
      smartInsights: [
        { icon: 'trending-down', label: 'Improving', value: '8% decrease', color: '#10B981' },
        { icon: 'people', label: 'Active Patients', value: '142', color: '#8B5CF6' },
        { icon: 'time', label: 'Peak Hours', value: '11AM-1PM', color: '#F59E0B' },
      ]
    },
    
    laboratory: {
      id: 'laboratory',
      name: 'Laboratory',
      icon: 'flask-outline',
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      emoji: '🔬',
      description: 'Diagnostic & Testing Services',
      
      // Severity Metrics
      currentSeverity: 'Low',
      severityScore: 32,
      trend: 'stable',
      change: 2,
      
      // Patient Statistics
      totalPatients: 89,
      critical: 3,
      high: 12,
      medium: 28,
      low: 46,
      
      // Timeline Data
      weeklyData: [30, 32, 35, 33, 34, 35, 32],
      monthlyData: [28, 30, 32, 35, 33, 34, 35, 32, 30, 28, 26, 25],
      
      // AI Insights
      topSymptoms: ['Fever', 'Persistent Cough', 'Fatigue', 'Body Aches', 'Headache'],
      aiObservation: 'Stable low severity maintained. Most cases are routine diagnostic tests. Lab efficiency is optimal.',
      prediction: 'Severity expected to remain low. Consider expanding testing capacity for routine checkups.',
      riskLevel: 'Low',
      
      // Recommendations
      recommendations: [
        'Maintain current staffing levels',
        'Add express testing for routine cases',
        'Consider weekend slots for working patients'
      ],
      
      // Department Info
      departments: ['Pathology', 'Microbiology', 'Biochemistry', 'Hematology'],
      waitTime: '10-15 min',
      capacity: '65%',
      
      // AI Confidence
      aiConfidence: 97,
      
      // Smart Insights
      smartInsights: [
        { icon: 'checkmark-circle', label: 'Stable', value: '2% change', color: '#10B981' },
        { icon: 'people', label: 'Active Patients', value: '89', color: '#10B981' },
        { icon: 'time', label: 'Peak Hours', value: '8AM-10AM', color: '#F59E0B' },
      ]
    },
    
    pharmacy: {
      id: 'pharmacy',
      name: 'Pharmacy',
      icon: 'medkit-outline',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
      emoji: '💊',
      description: 'Medication & Prescription Services',
      
      // Severity Metrics
      currentSeverity: 'Moderate-High',
      severityScore: 72,
      trend: 'increasing',
      change: 12,
      
      // Patient Statistics
      totalPatients: 78,
      critical: 8,
      high: 22,
      medium: 30,
      low: 18,
      
      // Timeline Data
      weeklyData: [55, 60, 65, 68, 72, 75, 72],
      monthlyData: [45, 48, 52, 55, 60, 65, 68, 72, 75, 78, 80, 78],
      
      // AI Insights
      topSymptoms: ['Fever', 'Severe Cough', 'Vomiting', 'Headache', 'Nausea'],
      aiObservation: 'Rising severity trend detected, particularly in pediatric prescriptions. Antibiotic stock levels need monitoring.',
      prediction: 'Severity likely to increase further by 8-10% next week. Immediate restocking recommended.',
      riskLevel: 'High',
      
      // Recommendations
      recommendations: [
        'URGENT: Restock pediatric antibiotics',
        'Add 2 additional pharmacists for peak hours',
        'Implement automated prescription system',
        'Prepare for increased demand next week'
      ],
      
      // Department Info
      departments: ['Outpatient', 'Inpatient', 'Pediatric', 'Emergency'],
      waitTime: '20-25 min',
      capacity: '92%',
      
      // AI Confidence
      aiConfidence: 89,
      
      // Smart Insights
      smartInsights: [
        { icon: 'trending-up', label: 'Critical Rise', value: '+12%', color: '#EF4444' },
        { icon: 'people', label: 'Active Patients', value: '78', color: '#F59E0B' },
        { icon: 'time', label: 'Peak Hours', value: '2PM-5PM', color: '#EF4444' },
      ]
    }
  };

  const modules = [
    { id: 'chronic', name: 'Chronic OPD', icon: 'medical-outline', color: '#8B5CF6' },
    { id: 'laboratory', name: 'Laboratory', icon: 'flask-outline', color: '#10B981' },
    { id: 'pharmacy', name: 'Pharmacy', icon: 'medkit-outline', color: '#F59E0B' },
  ];

  const currentData = severityData[selectedModule];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedModule]);

  const getSeverityColor = (sev) => {
    const map = { 
      'Critical': '#EF4444', 
      'High': '#EF4444',
      'Moderate-High': '#EF4444',
      'Moderate': '#F59E0B', 
      'Low': '#10B981' 
    };
    return map[sev] || '#3B82F6';
  };

  const getSeverityBgColor = (sev) => {
    const color = getSeverityColor(sev);
    return color + '12';
  };

  const getSeverityLevel = (score) => {
    if (score >= 75) return 'Critical';
    if (score >= 60) return 'Moderate-High';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Low';
    return 'Very Low';
  };

  // ─── RENDER FUNCTIONS ──────────────────────────────────────

  // Header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={wp(5)} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Severity Intelligence</Text>
          <Text style={styles.headerSub}>Real-time Module Analysis</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshBtn}
          onPress={() => {
            Animated.sequence([
              Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
              Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
            ]).start();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={wp(4.5)} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Module Selector
  const renderModuleSelector = () => (
    <View style={styles.moduleSelector}>
      {modules.map((module) => (
        <TouchableOpacity
          key={module.id}
          style={[
            styles.moduleTab,
            selectedModule === module.id && styles.moduleTabActive,
            { borderColor: selectedModule === module.id ? module.color : COLORS.border }
          ]}
          onPress={() => setSelectedModule(module.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.moduleTabIcon,
            { backgroundColor: selectedModule === module.id ? module.color + '20' : 'transparent' }
          ]}>
            <Ionicons 
              name={module.icon} 
              size={wp(4)} 
              color={selectedModule === module.id ? module.color : COLORS.textSecondary} 
            />
          </View>
          <Text style={[
            styles.moduleTabText,
            selectedModule === module.id && styles.moduleTabTextActive,
            { color: selectedModule === module.id ? module.color : COLORS.textSecondary }
          ]}>
            {module.name}
          </Text>
          {selectedModule === module.id && (
            <View style={[styles.moduleTabIndicator, { backgroundColor: module.color }]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  // Main Severity Card
  const renderSeverityCard = () => {
    const color = currentData.color;
    const severityColor = getSeverityColor(currentData.currentSeverity);
    const bgColor = getSeverityBgColor(currentData.currentSeverity);

    return (
      <Animated.View 
        style={[
          styles.severityCard,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <LinearGradient
          colors={currentData.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.severityGradient}
        >
          <View style={styles.severityHeader}>
            <View style={styles.severityTitleRow}>
              <Text style={styles.severityEmoji}>{currentData.emoji}</Text>
              <View>
                <Text style={styles.severityName}>{currentData.name}</Text>
                <Text style={styles.severityDesc}>{currentData.description}</Text>
              </View>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: severityColor + '25' }]}>
              <Text style={[styles.severityBadgeText, { color: severityColor }]}>
                {currentData.currentSeverity}
              </Text>
            </View>
          </View>

          <View style={styles.severityMain}>
            <View style={styles.severityScoreContainer}>
              <View style={styles.severityScoreCircle}>
                <LinearGradient
                  colors={[currentData.color, severityColor]}
                  style={styles.severityScoreGradient}
                >
                  <Text style={styles.severityScoreValue}>{currentData.severityScore}%</Text>
                  <Text style={styles.severityScoreLabel}>AI Score</Text>
                </LinearGradient>
              </View>
              <View style={styles.severityConfidence}>
                <Ionicons name="checkmark-circle" size={wp(3)} color="#10B981" />
                <Text style={styles.severityConfidenceText}>
                  {currentData.aiConfidence}% confidence
                </Text>
              </View>
            </View>

            <View style={styles.severityStats}>
              <View style={styles.severityStat}>
                <Text style={styles.severityStatValue}>{currentData.totalPatients}</Text>
                <Text style={styles.severityStatLabel}>Total Patients</Text>
              </View>
              <View style={styles.severityStatDivider} />
              <View style={styles.severityStat}>
                <Text style={[styles.severityStatValue, { color: '#EF4444' }]}>
                  {currentData.critical}
                </Text>
                <Text style={styles.severityStatLabel}>Critical</Text>
              </View>
              <View style={styles.severityStatDivider} />
              <View style={styles.severityStat}>
                <Text style={styles.severityStatValue}>{currentData.waitTime}</Text>
                <Text style={styles.severityStatLabel}>Wait Time</Text>
              </View>
              <View style={styles.severityStatDivider} />
              <View style={styles.severityStat}>
                <Text style={styles.severityStatValue}>{currentData.capacity}</Text>
                <Text style={styles.severityStatLabel}>Capacity</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Smart Insights
  const renderSmartInsights = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>AI Smart Insights</Text>
      <View style={styles.insightsGrid}>
        {currentData.smartInsights.map((insight, index) => (
          <View key={index} style={[styles.insightItem, { borderColor: insight.color + '30' }]}>
            <View style={[styles.insightIconBox, { backgroundColor: insight.color + '15' }]}>
              <Ionicons name={insight.icon} size={wp(4.5)} color={insight.color} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>{insight.label}</Text>
              <Text style={[styles.insightValue, { color: insight.color }]}>{insight.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Trend Graph
  const renderTrendGraph = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Severity Trend Analysis</Text>
      <CompactLineChart
        data={currentData.weeklyData}
        color={currentData.color}
        label="Weekly Severity Pattern"
      />
    </View>
  );

  // Severity Distribution
  const renderDistribution = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Patient Severity Distribution</Text>
      <CompactBarChart
        data={[currentData.critical, currentData.high, currentData.medium, currentData.low]}
        colors={['#EF4444', '#F59E0B', '#3B82F6', '#10B981']}
        labels={['Critical', 'High', 'Medium', 'Low']}
      />
    </View>
  );

  // Top Symptoms
  const renderSymptoms = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Top Reported Symptoms</Text>
      <View style={styles.symptomGrid}>
        {currentData.topSymptoms.map((symptom, idx) => (
          <View key={idx} style={[styles.symptomItem, { backgroundColor: currentData.color + '08' }]}>
            <View style={[styles.symptomDot, { backgroundColor: currentData.color }]} />
            <Text style={styles.symptomText}>{symptom}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // AI Observation & Recommendations
  const renderAIRecommendations = () => (
    <View style={styles.sectionCard}>
      <View style={styles.aiHeader}>
        <Ionicons name="bulb-outline" size={wp(4.5)} color={COLORS.primary} />
        <Text style={styles.aiTitle}>AI Observation & Recommendations</Text>
      </View>
      
      <View style={styles.aiObservationBox}>
        <Text style={styles.aiObservationText}>{currentData.aiObservation}</Text>
        <View style={styles.aiPredictionBox}>
          <Ionicons name="trending-up-outline" size={wp(3.5)} color={COLORS.primary} />
          <Text style={styles.aiPredictionText}>🔮 {currentData.prediction}</Text>
        </View>
      </View>

      <View style={styles.recommendationList}>
        <Text style={styles.recommendationTitle}>Recommended Actions:</Text>
        {currentData.recommendations.map((rec, idx) => (
          <View key={idx} style={styles.recommendationItem}>
            <View style={[styles.recommendationDot, { backgroundColor: currentData.color }]} />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Department Info
  const renderDepartmentInfo = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Department Information</Text>
      <View style={styles.departmentGrid}>
        {currentData.departments.map((dept, idx) => (
          <View key={idx} style={[styles.departmentItem, { borderColor: currentData.color + '30' }]}>
            <Ionicons name="business-outline" size={wp(3.5)} color={currentData.color} />
            <Text style={styles.departmentText}>{dept}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ─── MAIN RENDER ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderModuleSelector()}
          {renderSeverityCard()}
          {renderSmartInsights()}
          {renderTrendGraph()}
          {renderDistribution()}
          {renderSymptoms()}
          {renderAIRecommendations()}
          {renderDepartmentInfo()}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>AI Severity Intelligence v2.0</Text>
            <Text style={styles.footerSub}>Powered by SehatLine AI Analytics</Text>
          </View>
        </ScrollView>
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
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // ─── HEADER ──────────────────────────────────────────────────
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : 0,
    paddingBottom: hp(0.5),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  backBtn: {
    width: wp(8.5),
    height: wp(8.5),
    borderRadius: wp(2.5),
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  refreshBtn: {
    width: wp(8.5),
    height: wp(8.5),
    borderRadius: wp(2.5),
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: COLORS.white,
    fontSize: wp(2.2),
    opacity: 0.8,
    marginTop: hp(0.05),
  },

  // ─── SCROLL ──────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    paddingTop: hp(0.5),
  },

  // ─── MODULE SELECTOR ────────────────────────────────────────
  moduleSelector: {
    flexDirection: 'row',
    gap: wp(2),
    marginBottom: hp(1),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: wp(3),
    padding: wp(0.8),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moduleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(1.5),
    paddingVertical: hp(0.6),
    borderRadius: wp(2.5),
    borderWidth: 1.5,
    position: 'relative',
  },
  moduleTabActive: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  moduleTabIcon: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTabText: {
    fontSize: wp(2.8),
    fontWeight: '500',
  },
  moduleTabTextActive: {
    fontWeight: '700',
  },
  moduleTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '30%',
    right: '30%',
    height: 2.5,
    borderRadius: 1,
  },

  // ─── SEVERITY CARD ─────────────────────────────────────────
  severityCard: {
    borderRadius: wp(3.5),
    overflow: 'hidden',
    marginBottom: hp(1),
    ...SHADOWS.medium,
  },
  severityGradient: {
    padding: wp(3.5),
  },
  severityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  severityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  severityEmoji: {
    fontSize: wp(6),
  },
  severityName: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  severityDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: wp(2.6),
    marginTop: hp(0.05),
  },
  severityBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(3),
  },
  severityBadgeText: {
    fontSize: wp(2.8),
    fontWeight: '700',
  },
  severityMain: {
    flexDirection: 'row',
    marginTop: hp(0.8),
    gap: wp(4),
  },
  severityScoreContainer: {
    alignItems: 'center',
  },
  severityScoreCircle: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    overflow: 'hidden',
  },
  severityScoreGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityScoreValue: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  severityScoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: wp(2.2),
  },
  severityConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.8),
    marginTop: hp(0.2),
  },
  severityConfidenceText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: wp(2.4),
  },
  severityStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: wp(2.5),
    padding: wp(2),
  },
  severityStat: {
    alignItems: 'center',
    flex: 1,
  },
  severityStatValue: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  severityStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: wp(2.2),
    marginTop: hp(0.05),
  },
  severityStatDivider: {
    width: 1,
    height: hp(2.5),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // ─── SECTION CARDS ─────────────────────────────────────────
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(3.5),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: wp(3.5),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(0.6),
  },

  // ─── SMART INSIGHTS ────────────────────────────────────────
  insightsGrid: {
    flexDirection: 'row',
    gap: wp(2),
  },
  insightItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    padding: wp(2),
    borderRadius: wp(2),
    borderWidth: 1,
    backgroundColor: COLORS.white,
  },
  insightIconBox: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
  },
  insightValue: {
    fontSize: wp(3.2),
    fontWeight: '700',
  },

  // ─── CHARTS ──────────────────────────────────────────────────
  compactChartContainer: {
    width: '100%',
  },
  compactChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.3),
  },
  compactChartLabel: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },
  compactTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.8),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.1),
    borderRadius: wp(2),
  },
  compactTrendText: {
    fontSize: wp(2.4),
    fontWeight: '600',
  },
  compactChartArea: {
    position: 'relative',
    width: '100%',
  },
  compactChartPoint: {
    position: 'absolute',
  },
  compactChartXLabel: {
    position: 'absolute',
    fontSize: wp(2),
  },
  compactCurrentValue: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.1),
    borderRadius: wp(1.5),
  },
  compactCurrentText: {
    fontSize: wp(2.2),
    fontWeight: '600',
  },

  // ─── BAR CHART ──────────────────────────────────────────────
  compactBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: hp(9),
    paddingTop: hp(0.5),
  },
  compactBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  compactBarWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: hp(7),
  },
  compactBar: {
    borderRadius: wp(0.5),
    minHeight: 4,
  },
  compactBarValue: {
    fontSize: wp(2),
    fontWeight: '600',
    marginTop: hp(0.1),
  },
  compactBarLabel: {
    fontSize: wp(2.2),
    color: COLORS.textSecondary,
    marginTop: hp(0.2),
  },

  // ─── SYMPTOMS ──────────────────────────────────────────────
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  symptomDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
  },
  symptomText: {
    fontSize: wp(2.8),
    color: COLORS.text,
  },

  // ─── AI OBSERVATION ────────────────────────────────────────
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(0.4),
  },
  aiTitle: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: COLORS.text,
  },
  aiObservationBox: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(2.5),
    padding: wp(2.5),
    marginBottom: hp(0.6),
  },
  aiObservationText: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary,
    lineHeight: hp(1.8),
  },
  aiPredictionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginTop: hp(0.3),
    paddingTop: hp(0.3),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  aiPredictionText: {
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },
  recommendationList: {
    marginTop: hp(0.2),
  },
  recommendationTitle: {
    fontSize: wp(2.8),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(0.2),
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(0.2),
  },
  recommendationDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
  },
  recommendationText: {
    flex: 1,
    fontSize: wp(2.6),
    color: COLORS.textSecondary,
  },

  // ─── DEPARTMENT INFO ───────────────────────────────────────
  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  departmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.3),
    borderRadius: wp(3),
    borderWidth: 1.5,
  },
  departmentText: {
    fontSize: wp(2.8),
    color: COLORS.text,
  },

  // ─── FOOTER ─────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: hp(1),
    marginTop: hp(0.5),
  },
  footerText: {
    color: COLORS.primary,
    fontSize: wp(2.8),
    fontWeight: '600',
  },
  footerSub: {
    color: COLORS.textSecondary,
    fontSize: wp(2.2),
    marginTop: hp(0.05),
  },
});

export default AISeverityResultScreen;