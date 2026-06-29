import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PolicyItem = ({ title, content, icon, color, index }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const getColor = () => {
    const colors = {
      'Privacy Policy': COLORS.primary,
      'Terms of Service': COLORS.success,
      'Data Security': COLORS.appointment,
      'Cookie Policy': COLORS.warning,
      'AI Usage Policy': COLORS.danger,
      'Telemedicine Guidelines': COLORS.info
    };
    return colors[title] || COLORS.primary;
  };

  const itemColor = getColor();

  return (
    <Animated.View style={[styles.card, styles.cardShadow]}>
      <TouchableOpacity 
        style={styles.cardHeader} 
        onPress={toggleExpand} 
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <View style={[styles.iconGradient, { backgroundColor: itemColor + '15' }]}>
            <Ionicons name={icon} size={wp(5)} color={itemColor} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>Tap to {expanded ? 'collapse' : 'read more'}</Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="chevron-down" size={wp(5)} color={itemColor} />
        </Animated.View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.cardContent}>
          <View style={styles.contentGradient}>
            <Text style={styles.policyText}>{content}</Text>
            <View style={[styles.contentFooter, { borderTopColor: itemColor + '30' }]}>
              <Ionicons name="checkmark-circle" size={wp(3.5)} color={itemColor} />
              <Text style={styles.contentFooterText}>Effective from April 2026</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const PoliciesScreen = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp'
  });

  const policyItems = [
    {
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
      color: COLORS.primary,
      content: "At SehatLine, your medical privacy is our top priority. We encrypt all patient records using AES-256 bit encryption. Your data is only shared with authorized medical personnel during your active consultation. We do not sell your data to third-party advertisers. All conversations with HAMI AI are anonymous and used only to improve our services. You have the right to request deletion of your data at any time."
    },
    {
      title: "Terms of Service",
      icon: "document-text-outline",
      color: COLORS.success,
      content: "By using this app, you agree that SehatLine provides digital assistance and appointment management. In case of life-threatening emergencies, please bypass the app and call 1122 or visit the Emergency Ward immediately. The AI symptom checker is for informational purposes only and does not replace professional medical advice. We are not liable for misdiagnosis or delayed treatment based on app recommendations."
    },
    {
      title: "Data Security",
      icon: "lock-closed-outline",
      color: COLORS.appointment,
      content: "We implement multi-factor authentication for sensitive medical reports. Your lab results are stored on secure local servers compliant with international healthcare data standards (HIPAA compliant). All data transmission uses TLS 1.3 encryption. We conduct regular security audits and vulnerability assessments. Your biometric data (fingerprint login) is stored locally on your device only."
    },
    {
      title: "Cookie Policy",
      icon: "cafe-outline",
      color: COLORS.warning,
      content: "We use functional cookies to remember your login session and preferred hospital branch. These are essential for the app's performance. We do not use tracking cookies or share data with advertising networks. You can clear your local data anytime from Settings. Session cookies expire after 30 days of inactivity."
    },
    {
      title: "AI Usage Policy",
      icon: "brain-outline",
      color: COLORS.danger,
      content: "Our HAMI AI assistant uses machine learning to analyze symptoms. The AI is trained on medical datasets but may have limitations. Always consult a real doctor for final diagnosis. Your conversations with HAMI are encrypted and used to improve accuracy. You can opt out of data collection in Settings."
    },
    {
      title: "Telemedicine Guidelines",
      icon: "videocam-outline",
      color: COLORS.info,
      content: "Teleconsultations are available for non-emergency cases. Video calls are encrypted end-to-end. Consultations are recorded for quality assurance and stored securely for 30 days. Prescriptions issued via telemedicine are valid as per government regulations. Emergency cases will be redirected to physical hospitals."
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.25 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Animated Header */}
        <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={wp(5.5)} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Policies</Text>
            <View style={{ width: wp(10) }} />
          </View>
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={wp(12)} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>Your Privacy Matters</Text>
            <Text style={styles.heroSubtitle}>
              We're committed to protecting your health information with enterprise-grade security
            </Text>
            <View style={styles.heroBadge}>
              <Ionicons name="checkmark-circle" size={wp(4)} color={COLORS.success} />
              <Text style={styles.heroBadgeText}>HIPAA Compliant</Text>
            </View>
          </View>

          {/* Last Updated Badge */}
          <View style={styles.updateBadge}>
            <Ionicons name="calendar-outline" size={wp(3.5)} color={COLORS.primary} />
            <Text style={styles.updateText}>Last Updated: April 2026</Text>
            <View style={styles.versionChip}>
              <Text style={styles.versionText}>v2.4.0</Text>
            </View>
          </View>

          {/* Policy Items */}
          {policyItems.map((item, index) => (
            <PolicyItem 
              key={index}
              index={index}
              title={item.title}
              icon={item.icon}
              color={item.color}
              content={item.content}
            />
          ))}

          {/* Compliance Section */}
          <View style={styles.complianceCard}>
            <Text style={styles.complianceTitle}>Compliance & Certifications</Text>
            <View style={styles.complianceGrid}>
              <View style={styles.complianceItem}>
                <Ionicons name="shield-checkmark" size={wp(5)} color={COLORS.success} />
                <Text style={styles.complianceText}>ISO 27001</Text>
              </View>
              <View style={styles.complianceItem}>
                <Ionicons name="medkit" size={wp(5)} color={COLORS.primary} />
                <Text style={styles.complianceText}>HIPAA</Text>
              </View>
              <View style={styles.complianceItem}>
                <Ionicons name="cloud" size={wp(5)} color={COLORS.appointment} />
                <Text style={styles.complianceText}>GDPR Ready</Text>
              </View>
              <View style={styles.complianceItem}>
                <Ionicons name="lock-closed" size={wp(5)} color={COLORS.warning} />
                <Text style={styles.complianceText}>AES-256</Text>
              </View>
            </View>
          </View>

          {/* Contact Support */}
          <TouchableOpacity style={styles.supportCard}>
            <View style={styles.supportGradient}>
              <Ionicons name="chatbubble-ellipses-outline" size={wp(6)} color={COLORS.primary} />
              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>Questions about our policies?</Text>
                <Text style={styles.supportSubtitle}>Contact our Data Protection Officer</Text>
              </View>
              <Ionicons name="chevron-forward" size={wp(5)} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 SehatLine Digital Health</Text>
            <Text style={styles.footerSub}>All rights reserved</Text>
          </View>

          <View style={{ height: hp(5) }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  safeArea: { 
    flex: 1 
  },

  cardShadow: { ...SHADOWS.medium },

  // Header
  headerContainer: {
    paddingBottom: hp(1),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'ios' ? hp(1) : StatusBar.currentHeight + hp(1),
    paddingBottom: hp(1.5),
  },
  backBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { 
    color: COLORS.white, 
    fontSize: wp(5), 
    fontWeight: 'bold',
  },

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  // Hero Section
  heroSection: {
    marginTop: hp(2),
    marginBottom: hp(2),
    padding: wp(5),
    borderRadius: wp(5),
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  heroIcon: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: wp(5),
    fontWeight: 'bold',
    marginBottom: hp(0.8),
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: wp(3.2),
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    gap: wp(1),
  },
  heroBadgeText: {
    color: COLORS.success,
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  // Update Badge
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    marginBottom: hp(2),
    gap: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  updateText: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
  },
  versionChip: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  versionText: {
    color: COLORS.primary,
    fontSize: wp(2.5),
    fontWeight: '600',
  },

  // Policy Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp(4),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  iconGradient: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: wp(2.3),
    marginTop: hp(0.2),
  },
  cardContent: {
    overflow: 'hidden',
  },
  contentGradient: {
    padding: wp(4),
    paddingTop: wp(2),
    backgroundColor: COLORS.backgroundSecondary,
  },
  policyText: {
    color: COLORS.textSecondary,
    fontSize: wp(3.2),
    lineHeight: wp(4.5),
    marginBottom: hp(1.2),
  },
  contentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    paddingTop: hp(1),
    borderTopWidth: 1,
  },
  contentFooterText: {
    color: COLORS.textLight,
    fontSize: wp(2.5),
  },

  // Compliance
  complianceCard: {
    marginTop: hp(1),
    marginBottom: hp(2),
    padding: wp(4),
    borderRadius: wp(4),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  complianceTitle: {
    color: COLORS.text,
    fontSize: wp(3.8),
    fontWeight: 'bold',
    marginBottom: hp(1.5),
  },
  complianceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  complianceItem: {
    alignItems: 'center',
    gap: hp(0.5),
  },
  complianceText: {
    color: COLORS.textSecondary,
    fontSize: wp(2.5),
    fontWeight: '500',
  },

  // Support
  supportCard: {
    borderRadius: wp(4),
    overflow: 'hidden',
    marginBottom: hp(2),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  supportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    gap: wp(3),
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    color: COLORS.text,
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  supportSubtitle: {
    color: COLORS.textSecondary,
    fontSize: wp(2.8),
    marginTop: hp(0.2),
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: wp(3),
  },
  footerSub: {
    color: COLORS.textLight,
    fontSize: wp(2.5),
    marginTop: hp(0.5),
  },
});

export default PoliciesScreen;