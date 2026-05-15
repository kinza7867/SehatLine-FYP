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
  ImageBackground,
  SafeAreaView,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

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
  const heightAnim = useRef(new Animated.Value(0)).current;

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
      'Privacy': '#04e1f5',
      'Terms': '#10B981',
      'Data': '#8B5CF6',
      'Cookie': '#F59E0B'
    };
    return colors[title] || color || '#04e1f5';
  };

  const itemColor = getColor();
  const delay = index * 100;

  return (
    <Animated.View 
      style={[
        styles.card,
        { 
          opacity: 1,
          transform: [{ translateY: 0 }]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.cardHeader} 
        onPress={toggleExpand} 
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <LinearGradient
            colors={[itemColor + '30', itemColor + '10']}
            style={[styles.iconGradient, { borderColor: itemColor + '50' }]}
          >
            <Ionicons name={icon} size={wp(5)} color={itemColor} />
          </LinearGradient>
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
        <Animated.View style={styles.cardContent}>
          <LinearGradient
            colors={['rgba(4, 225, 245, 0.05)', 'rgba(4, 225, 245, 0.02)']}
            style={styles.contentGradient}
          >
            <Text style={styles.policyText}>{content}</Text>
            <View style={[styles.contentFooter, { borderTopColor: itemColor + '30' }]}>
              <Ionicons name="checkmark-circle" size={wp(3.5)} color={itemColor} />
              <Text style={styles.contentFooterText}>Effective from April 2026</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const PoliciesScreen = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });

  const policyItems = [
    {
      title: "Privacy Policy",
      icon: "shield-checkmark",
      color: "#04e1f5",
      content: "At SehatLine, your medical privacy is our top priority. We encrypt all patient records using AES-256 bit encryption. Your data is only shared with authorized medical personnel during your active consultation. We do not sell your data to third-party advertisers. All conversations with HAMI AI are anonymous and used only to improve our services. You have the right to request deletion of your data at any time."
    },
    {
      title: "Terms of Service",
      icon: "document-text",
      color: "#10B981",
      content: "By using this app, you agree that SehatLine provides digital assistance and appointment management. In case of life-threatening emergencies, please bypass the app and call 1122 or visit the Emergency Ward immediately. The AI symptom checker is for informational purposes only and does not replace professional medical advice. We are not liable for misdiagnosis or delayed treatment based on app recommendations."
    },
    {
      title: "Data Security",
      icon: "lock-closed",
      color: "#8B5CF6",
      content: "We implement multi-factor authentication for sensitive medical reports. Your lab results are stored on secure local servers compliant with international healthcare data standards (HIPAA compliant). All data transmission uses TLS 1.3 encryption. We conduct regular security audits and vulnerability assessments. Your biometric data (fingerprint login) is stored locally on your device only."
    },
    {
      title: "Cookie Policy",
      icon: "cafe",
      color: "#F59E0B",
      content: "We use functional cookies to remember your login session and preferred hospital branch. These are essential for the app's performance. We do not use tracking cookies or share data with advertising networks. You can clear your local data anytime from Settings. Session cookies expire after 30 days of inactivity."
    },
    {
      title: "AI Usage Policy",
      icon: "brain",
      color: "#EF4444",
      content: "Our HAMI AI assistant uses machine learning to analyze symptoms. The AI is trained on medical datasets but may have limitations. Always consult a real doctor for final diagnosis. Your conversations with HAMI are encrypted and used to improve accuracy. You can opt out of data collection in Settings."
    },
    {
      title: "Telemedicine Guidelines",
      icon: "videocam",
      color: "#06B6D4",
      content: "Teleconsultations are available for non-emergency cases. Video calls are encrypted end-to-end. Consultations are recorded for quality assurance and stored securely for 30 days. Prescriptions issued via telemedicine are valid as per government regulations. Emergency cases will be redirected to physical hospitals."
    }
  ];

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
            {/* Animated Header */}
            <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
              <LinearGradient
                colors={['rgba(0, 29, 61, 0.98)', 'rgba(0, 8, 20, 0.95)']}
                style={styles.headerGradient}
              >
                <View style={styles.topHeader}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={wp(6)} color="#04e1f5" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Policies</Text>
                  <View style={{ width: wp(10) }} />
                </View>
              </LinearGradient>
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
              <LinearGradient
                colors={['rgba(4, 225, 245, 0.15)', 'rgba(4, 225, 245, 0.05)']}
                style={styles.heroSection}
              >
                <View style={styles.heroIcon}>
                  <Ionicons name="shield-checkmark" size={wp(12)} color="#04e1f5" />
                </View>
                <Text style={styles.heroTitle}>Your Privacy Matters</Text>
                <Text style={styles.heroSubtitle}>
                  We're committed to protecting your health information with enterprise-grade security
                </Text>
                <View style={styles.heroBadge}>
                  <Ionicons name="checkmark-circle" size={wp(4)} color="#10B981" />
                  <Text style={styles.heroBadgeText}>HIPAA Compliant</Text>
                </View>
              </LinearGradient>

              {/* Last Updated Badge */}
              <View style={styles.updateBadge}>
                <Ionicons name="calendar" size={wp(3.5)} color="#04e1f5" />
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
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']}
                style={styles.complianceCard}
              >
                <Text style={styles.complianceTitle}>🔒 Compliance & Certifications</Text>
                <View style={styles.complianceGrid}>
                  <View style={styles.complianceItem}>
                    <Ionicons name="shield" size={wp(5)} color="#10B981" />
                    <Text style={styles.complianceText}>ISO 27001</Text>
                  </View>
                  <View style={styles.complianceItem}>
                    <Ionicons name="medkit" size={wp(5)} color="#04e1f5" />
                    <Text style={styles.complianceText}>HIPAA</Text>
                  </View>
                  <View style={styles.complianceItem}>
                    <Ionicons name="cloud" size={wp(5)} color="#8B5CF6" />
                    <Text style={styles.complianceText}>GDPR Ready</Text>
                  </View>
                  <View style={styles.complianceItem}>
                    <Ionicons name="lock" size={wp(5)} color="#F59E0B" />
                    <Text style={styles.complianceText}>AES-256</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Contact Support */}
              <TouchableOpacity style={styles.supportCard}>
                <LinearGradient
                  colors={['rgba(4, 225, 245, 0.08)', 'rgba(4, 225, 245, 0.03)']}
                  style={styles.supportGradient}
                >
                  <Ionicons name="chatbubble-ellipses" size={wp(6)} color="#04e1f5" />
                  <View style={styles.supportContent}>
                    <Text style={styles.supportTitle}>Questions about our policies?</Text>
                    <Text style={styles.supportSubtitle}>Contact our Data Protection Officer</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={wp(5)} color="#04e1f5" />
                </LinearGradient>
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
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(5, 21, 65, 0.44)' },
  safeArea: { flex: 1 },

  headerContainer: {
    position: 'relative',
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(1.5),
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

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  heroSection: {
    marginTop: hp(2),
    marginBottom: hp(2),
    padding: wp(5),
    borderRadius: wp(5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.2)',
  },
  heroIcon: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'rgba(4, 225, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  heroTitle: {
    color: '#fff',
    fontSize: wp(5),
    fontWeight: 'bold',
    marginBottom: hp(0.8),
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: wp(3.2),
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    gap: wp(1),
  },
  heroBadgeText: {
    color: '#10B981',
    fontSize: wp(2.8),
    fontWeight: '600',
  },

  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    marginBottom: hp(2),
    gap: wp(2),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
  },
  updateText: {
    color: '#94A3B8',
    fontSize: wp(3),
  },
  versionChip: {
    backgroundColor: 'rgba(4, 225, 245, 0.15)',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  versionText: {
    color: '#04e1f5',
    fontSize: wp(2.5),
    fontWeight: '600',
  },

  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
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
    borderWidth: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: wp(2.3),
    marginTop: hp(0.2),
  },
  cardContent: {
    overflow: 'hidden',
  },
  contentGradient: {
    padding: wp(4),
    paddingTop: wp(2),
  },
  policyText: {
    color: '#B2DFDB',
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
    color: '#64748B',
    fontSize: wp(2.5),
  },

  complianceCard: {
    marginTop: hp(1),
    marginBottom: hp(2),
    padding: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  complianceTitle: {
    color: '#fff',
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
    color: '#94A3B8',
    fontSize: wp(2.5),
    fontWeight: '500',
  },

  supportCard: {
    borderRadius: wp(4),
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  supportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    gap: wp(3),
    borderWidth: 1,
    borderColor: 'rgba(4, 225, 245, 0.15)',
    borderRadius: wp(4),
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  supportSubtitle: {
    color: '#94A3B8',
    fontSize: wp(2.8),
    marginTop: hp(0.2),
  },

  footer: {
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  footerText: {
    color: '#64748B',
    fontSize: wp(3),
  },
  footerSub: {
    color: '#4B5563',
    fontSize: wp(2.5),
    marginTop: hp(0.5),
  },
});

export default PoliciesScreen;