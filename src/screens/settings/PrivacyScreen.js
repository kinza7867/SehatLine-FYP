// src/screens/doctor/PrivacyScreen.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const PrivacyScreen = ({ navigation }) => {
  const handleManageSharing = () => {
    Alert.alert(
      'Manage Data Sharing',
      'Select what data you want to share:',
      [
        { text: 'Basic Profile', onPress: () => {} },
        { text: 'Recent Vitals', onPress: () => {} },
        { text: 'Appointment History', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.') 
        },
      ]
    );
  };

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
            <Text style={styles.headerTitle}>Privacy & Security</Text>
          </View>

          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          {/* ─── DATA PROTECTION CARD ──────────────────────────────────── */}
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name="shield-checkmark-outline" size={wp(5)} color={COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>Data Protection</Text>
            </View>
            <Text style={styles.description}>
              Your health data is encrypted and stored securely. We never share your personal 
              medical information without your explicit consent.
            </Text>
            <View style={styles.protectionBadges}>
              <View style={[styles.badge, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={wp(3)} color={COLORS.success} />
                <Text style={[styles.badgeText, { color: COLORS.success }]}>Encrypted</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="checkmark-circle" size={wp(3)} color={COLORS.primary} />
                <Text style={[styles.badgeText, { color: COLORS.primary }]}>Secure</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="checkmark-circle" size={wp(3)} color={COLORS.warning} />
                <Text style={[styles.badgeText, { color: COLORS.warning }]}>GDPR Compliant</Text>
              </View>
            </View>
          </View>

          {/* ─── PERMISSION SETTINGS ───────────────────────────────────── */}
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="settings-outline" size={wp(5)} color={COLORS.warning} />
              </View>
              <Text style={styles.cardTitle}>Permission Settings</Text>
            </View>

            <TouchableOpacity style={styles.permissionItem} activeOpacity={0.7}>
              <View style={styles.permissionIcon}>
                <Ionicons name="camera-outline" size={wp(4.5)} color={COLORS.primary} />
              </View>
              <Text style={styles.permissionText}>Camera Access</Text>
              <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '15' }]}>
                <Text style={[styles.statusText, { color: COLORS.success }]}>Enabled</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.permissionItem} activeOpacity={0.7}>
              <View style={styles.permissionIcon}>
                <Ionicons name="mic-outline" size={wp(4.5)} color={COLORS.primary} />
              </View>
              <Text style={styles.permissionText}>Microphone Access</Text>
              <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '15' }]}>
                <Text style={[styles.statusText, { color: COLORS.success }]}>Enabled</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.permissionItem} activeOpacity={0.7}>
              <View style={styles.permissionIcon}>
                <Ionicons name="location-outline" size={wp(4.5)} color={COLORS.primary} />
              </View>
              <Text style={styles.permissionText}>Location Access</Text>
              <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '15' }]}>
                <Text style={[styles.statusText, { color: COLORS.warning }]}>Ask Next Time</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ─── DATA SHARING ──────────────────────────────────────────── */}
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Ionicons name="share-social-outline" size={wp(5)} color={COLORS.info} />
              </View>
              <Text style={styles.cardTitle}>Data Sharing</Text>
            </View>
            <Text style={styles.description}>
              You control what data is shared with doctors and hospitals.
            </Text>
            <View style={styles.sharingList}>
              <View style={styles.sharingItem}>
                <Ionicons name="checkmark-circle" size={wp(3.5)} color={COLORS.success} />
                <Text style={styles.sharingText}>Basic Profile</Text>
              </View>
              <View style={styles.sharingItem}>
                <Ionicons name="checkmark-circle" size={wp(3.5)} color={COLORS.success} />
                <Text style={styles.sharingText}>Recent Vitals</Text>
              </View>
              <View style={styles.sharingItem}>
                <Ionicons name="checkmark-circle" size={wp(3.5)} color={COLORS.success} />
                <Text style={styles.sharingText}>Appointment History</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.manageButton, SHADOWS.small]}
              onPress={handleManageSharing}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.manageGradient}
              >
                <Ionicons name="settings-outline" size={wp(4)} color={COLORS.white} />
                <Text style={styles.manageText}>Manage Data Sharing</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ─── DELETE ACCOUNT ────────────────────────────────────────── */}
          <TouchableOpacity 
            style={[styles.deleteButton, SHADOWS.small]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={wp(4.5)} color={COLORS.danger} />
            <Text style={styles.deleteText}>Delete My Account</Text>
          </TouchableOpacity>

          {/* ─── FOOTER ────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>SehatLine v2.0.1</Text>
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
  headerRight: {
    width: wp(9),
  },

  // ── Scroll ────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },

  // ── Card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    padding: wp(4),
    marginTop: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(0.5),
  },
  cardIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: COLORS.text,
  },
  description: {
    fontSize: wp(3.2),
    lineHeight: hp(2.5),
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
  },

  // ── Protection Badges ────────────────────────────────────────────
  protectionBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    marginTop: hp(1.5),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(3),
    gap: wp(1),
  },
  badgeText: {
    fontSize: wp(2.4),
    fontWeight: '600',
  },

  // ── Permission Items ─────────────────────────────────────────────
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.8),
  },
  permissionIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  permissionText: {
    flex: 1,
    fontSize: wp(3.2),
    color: COLORS.text,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(2),
  },
  statusText: {
    fontSize: wp(2.4),
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  // ── Sharing ──────────────────────────────────────────────────────
  sharingList: {
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  sharingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(0.3),
  },
  sharingText: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
  },

  // ── Manage Button ───────────────────────────────────────────────
  manageButton: {
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  manageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  manageText: {
    color: COLORS.white,
    fontSize: wp(3.2),
    fontWeight: '600',
  },

  // ── Delete Button ──────────────────────────────────────────────
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    gap: wp(2),
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: wp(3.5),
    fontWeight: '600',
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: hp(2.5),
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: wp(2.6),
    color: COLORS.textLight,
  },
});

export default PrivacyScreen;