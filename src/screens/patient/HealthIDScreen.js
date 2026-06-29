import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Platform, StatusBar, Animated, ActivityIndicator,
  ScrollView, SafeAreaView, Share, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const HealthIDScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [healthID, setHealthID] = useState({
    id: '',
    name: '',
    cdaCard: '',
    cnic: '',
    phone: '',
    dob: '',
    bloodGroup: '',
    joinDate: '',
    isVerified: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      let data = null;
      
      // First check route params (from navigation)
      if (route?.params?.userData) {
        data = route.params.userData;
      } else {
        // Then check AsyncStorage
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          data = JSON.parse(storedData);
        }
      }

      // If still no data, use fallback with demo data
      if (!data) {
        data = {
          name: 'Demo Patient',
          cdaCard: 'CDA-12345678',
          cnic: '42101-1234567-8',
          phone: '0300-1234567',
          dob: '15 Jan 1990',
          bloodGroup: 'A+',
          joinDate: new Date().toLocaleDateString(),
          isVerified: false,
        };
      }

      // Generate Health ID
      const healthId = generateHealthID(data);
      setHealthID({
        id: healthId,
        name: data.name || 'Patient',
        cdaCard: data.cdaCard || data.cdaCardOfficial || 'CDA-12345678',
        cnic: data.cnic || 'Not Provided',
        phone: data.phone || 'Not Provided',
        dob: data.dob || 'Not Provided',
        bloodGroup: data.bloodGroup || 'Not Set',
        joinDate: data.joinDate || new Date().toLocaleDateString(),
        isVerified: data.isVerified || false,
      });
      setUserData(data);

      // Save to AsyncStorage if from route
      if (route?.params?.userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      // Fallback data
      setHealthID({
        id: 'CDA-24-1234-8',
        name: 'Patient',
        cdaCard: 'CDA-12345678',
        cnic: 'Not Provided',
        phone: 'Not Provided',
        dob: 'Not Provided',
        bloodGroup: 'Not Set',
        joinDate: new Date().toLocaleDateString(),
        isVerified: false,
      });
    }
    setLoading(false);
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Generate unique Health ID
  const generateHealthID = (user) => {
    const prefix = 'CDA';
    const year = new Date().getFullYear().toString().slice(-2);
    const nameSeed = user?.name?.length || 5;
    const random = String(Math.floor(Math.random() * 9000) + 1000);
    const checkDigit = String((parseInt(random) + nameSeed) % 9 + 1);
    return `${prefix}-${year}-${random}-${checkDigit}`;
  };

  const handleShare = async () => {
    try {
      const message = `🏥 SEHATLINE HEALTH ID
━━━━━━━━━━━━━━━━━━━━━
🆔 ID: ${healthID.id}
👤 Name: ${healthID.name}
💳 CDA Card: ${healthID.cdaCard}
📋 CNIC: ${healthID.cnic}
📱 Phone: ${healthID.phone}
🎂 DOB: ${healthID.dob}
🩸 Blood Group: ${healthID.bloodGroup}
✅ Status: ${healthID.isVerified ? 'Verified' : 'Pending Verification'}
━━━━━━━━━━━━━━━━━━━━━
CDA Hospital Islamabad
SehatLine - Digital Health ID`;

      await Share.share({
        message: message,
        title: 'My Health ID'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share Health ID');
    }
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Health ID will be saved to your device as an image.');
  };

  // Render ID Card
  const renderIDCard = () => (
    <Animated.View 
      style={[
        styles.idCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.idCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.idHeader}>
          <View style={styles.idLogo}>
            <Text style={styles.idLogoText}>🏥</Text>
          </View>
          <View style={styles.idTitleContainer}>
            <Text style={styles.idTitle}>SEHATLINE</Text>
            <Text style={styles.idSubtitle}>HEALTH ID</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>
              {healthID.isVerified ? '✓' : '⏳'}
            </Text>
          </View>
        </View>

        {/* Status Line */}
        <View style={styles.idStatusRow}>
          <Text style={styles.idStatus}>
            {healthID.isVerified ? '✅ Verified Patient' : '⏳ Pending Verification'}
          </Text>
        </View>

        {/* Patient Info */}
        <View style={styles.idInfo}>
          <View style={styles.idInfoRow}>
            <Text style={styles.idInfoLabel}>Name</Text>
            <Text style={styles.idInfoValue}>{healthID.name}</Text>
          </View>
          <View style={styles.idInfoRow}>
            <Text style={styles.idInfoLabel}>CDA Card</Text>
            <Text style={[styles.idInfoValue, styles.idHighlight]}>{healthID.cdaCard}</Text>
          </View>
          <View style={styles.idInfoRow}>
            <Text style={styles.idInfoLabel}>CNIC</Text>
            <Text style={styles.idInfoValue}>{healthID.cnic}</Text>
          </View>
          <View style={styles.idInfoRow}>
            <Text style={styles.idInfoLabel}>Phone</Text>
            <Text style={styles.idInfoValue}>{healthID.phone}</Text>
          </View>
          <View style={styles.idInfoRow}>
            <Text style={styles.idInfoLabel}>DOB</Text>
            <Text style={styles.idInfoValue}>{healthID.dob}</Text>
          </View>
          <View style={styles.idInfoRow}>
            <Text style={styles.idInfoLabel}>Blood Group</Text>
            <Text style={styles.idInfoValue}>{healthID.bloodGroup}</Text>
          </View>
        </View>

        {/* ID Number */}
        <View style={styles.idFooter}>
          <Text style={styles.idNumberLabel}>Health ID</Text>
          <Text style={styles.idNumber}>{healthID.id}</Text>
          <Text style={styles.idDate}>Issued: {healthID.joinDate}</Text>
        </View>

        {/* QR Code Placeholder */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code-outline" size={60} color={COLORS.white} />
          </View>
          <Text style={styles.qrText}>Scan to verify</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // Render Action Buttons
  const renderActions = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={handleShare}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.actionGradient}
        >
          <Ionicons name="share-outline" size={20} color={COLORS.white} />
          <Text style={styles.actionText}>Share</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionBtn, styles.downloadBtn]}
        onPress={handleDownload}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[COLORS.secondary, COLORS.primary]}
          style={styles.actionGradient}
        >
          <Ionicons name="download-outline" size={20} color={COLORS.white} />
          <Text style={styles.actionText}>Download</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render Info Cards
  const renderInfoCards = () => (
    <View style={styles.infoCardsContainer}>
      <View style={styles.infoCard}>
        <View style={[styles.infoCardIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.infoCardTitle}>Secure</Text>
        <Text style={styles.infoCardDesc}>Your health data is secure</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={[styles.infoCardIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <Ionicons name="refresh-outline" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.infoCardTitle}>Always Updated</Text>
        <Text style={styles.infoCardDesc}>Real-time health record</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={[styles.infoCardIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <Ionicons name="scan-outline" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.infoCardTitle}>Easy Access</Text>
        <Text style={styles.infoCardDesc}>Scan at any counter</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Health ID...</Text>
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
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Health ID</Text>
        <TouchableOpacity 
          style={styles.helpBtn}
          onPress={() => Alert.alert('Health ID', 'This is your digital health card. Use it for identification at CDA Hospital.')}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ID Card */}
        {renderIDCard()}

        {/* Action Buttons */}
        {renderActions()}

        {/* Info Cards */}
        {renderInfoCards()}

        {/* Footer */}
        <Text style={styles.footerText}>
          CDA Hospital Islamabad • SehatLine v2.0
        </Text>
      </ScrollView>
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
  helpBtn: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
    paddingTop: hp(1),
    alignItems: 'center',
  },

  // ID Card
  idCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: wp(5),
    overflow: 'hidden',
    ...SHADOWS.large,
    marginBottom: hp(2),
  },
  idCardGradient: {
    padding: wp(5),
  },

  // Header
  idHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  idLogo: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.white + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idLogoText: {
    fontSize: wp(5),
  },
  idTitleContainer: {
    flex: 1,
    marginLeft: wp(3),
  },
  idTitle: {
    color: COLORS.white,
    fontSize: wp(4),
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  idSubtitle: {
    color: COLORS.white,
    fontSize: wp(2.5),
    letterSpacing: 1,
    marginTop: hp(0.1),
  },
  idBadge: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idBadgeText: {
    color: COLORS.white,
    fontSize: wp(4),
  },

  // Status
  idStatusRow: {
    marginBottom: hp(1.5),
  },
  idStatus: {
    color: COLORS.white,
    fontSize: wp(3),
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Info
  idInfo: {
    backgroundColor: COLORS.white + '15',
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(1.5),
  },
  idInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.white + '10',
  },
  idInfoLabel: {
    color: COLORS.white,
    fontSize: wp(2.8),
    fontWeight: '500',
  },
  idInfoValue: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  idHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },

  // Footer
  idFooter: {
    alignItems: 'center',
    marginBottom: hp(1),
  },
  idNumberLabel: {
    color: COLORS.white + '90',
    fontSize: wp(2.5),
    letterSpacing: 1,
  },
  idNumber: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: hp(0.2),
  },
  idDate: {
    color: COLORS.white,
    fontSize: wp(2.5),
    marginTop: hp(0.2),
  },

  // QR
  qrContainer: {
    alignItems: 'center',
    marginTop: hp(1),
  },
  qrBox: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(3),
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    color: COLORS.white,
    fontSize: wp(2.5),
    marginTop: hp(0.5),
  },

  // Actions
  actionContainer: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(2),
    width: '100%',
    maxWidth: 400,
  },
  actionBtn: {
    flex: 1,
    borderRadius: wp(3),
    overflow: 'hidden',
  },
  downloadBtn: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  actionText: {
    color: COLORS.white,
    fontSize: wp(3.8),
    fontWeight: '600',
  },

  // Info Cards
  infoCardsContainer: {
    flexDirection: 'row',
    gap: wp(2),
    marginBottom: hp(2),
    width: '100%',
    maxWidth: 400,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  infoCardIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  infoCardTitle: {
    fontSize: wp(3),
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  infoCardDesc: {
    fontSize: wp(2.5),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp(0.2),
  },

  // Footer
  footerText: {
    fontSize: wp(2.8),
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: hp(1),
  },
});

export default HealthIDScreen;