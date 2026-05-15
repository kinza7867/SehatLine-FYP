import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  Dimensions, TouchableOpacity, Platform 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height} = Dimensions.get('window');

const AboutHospitalScreen = ({ navigation }) => {
  const highlights = [
    { id: 1, label: 'Beds', value: '500+', icon: 'bed' },
    { id: 2, label: 'Doctors', value: '120+', icon: 'people' },
    { id: 3, label: 'Years', value: '45+', icon: 'ribbon' },
    { id: 4, label: 'Rating', value: '4.8', icon: 'star' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section with Image */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1587350859728-117699f8aae6?auto=format&fit=crop&w=800&q=80' }} 
            style={styles.hospitalImage}
          />
          <LinearGradient 
            colors={['transparent', 'rgba(2, 9, 20, 0.95)', '#020914']} 
            style={styles.heroOverlay}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.heroTitleContainer}>
            <Text style={styles.heroTag}>ESTABLISHED 1981</Text>
            <Text style={styles.heroTitle}>SehatLine Islamabad</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          {highlights.map((item) => (
            <View key={item.id} style={styles.statItem}>
              <Ionicons name={item.icon} size={22} color="#00EAFF" />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Our Legacy</Text>
          <Text style={styles.description}>
            SehatLine Digital Healthcare (CDA Hospital) has been the cornerstone of medical excellence in Islamabad for over four decades. 
            We combine state-of-the-art technology with compassionate care to ensure the best health outcomes for our community.
          </Text>

          <View style={styles.missionCard}>
            <LinearGradient colors={['#00EAFF20', '#00EAFF05']} style={styles.missionGradient}>
              <Ionicons name="eye-outline" size={30} color="#00EAFF" />
              <Text style={styles.missionTitle}>Our Vision</Text>
              <Text style={styles.missionText}>
                To be the leading digital healthcare provider in Pakistan, making quality medical services accessible to every citizen.
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>Accreditations</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="checkmark-seal" size={20} color="#FFD60A" />
              <Text style={styles.badgeText}>ISO 9001</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="checkmark-seal" size={20} color="#FFD60A" />
              <Text style={styles.badgeText}>JCIA Certified</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="checkmark-seal" size={20} color="#FFD60A" />
              <Text style={styles.badgeText}>WHO Partner</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => navigation.navigate('ContactScreen')}
          >
            <Text style={styles.contactBtnText}>Visit Our Location</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020914' },
  scrollContent: { paddingBottom: 20 },
  
  heroSection: { height: height * 0.45, position: 'relative' },
  hospitalImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  backBtn: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 30, 
    left: 20, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 8, 
    borderRadius: 12 
  },
  heroTitleContainer: { position: 'absolute', bottom: 20, left: 20 },
  heroTag: { color: '#00EAFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  heroTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 5 },

  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#0A192F', 
    marginHorizontal: 20, 
    marginTop: -30, 
    borderRadius: 20, 
    padding: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,234,255,0.1)'
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  statLabel: { color: '#888', fontSize: 11, marginTop: 2 },

  content: { padding: 20 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15, marginTop: 20 },
  description: { color: '#CCC', fontSize: 15, lineHeight: 24, opacity: 0.8 },

  missionCard: { marginTop: 25, borderRadius: 20, overflow: 'hidden' },
  missionGradient: { padding: 25, alignItems: 'center' },
  missionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  missionText: { color: '#AAA', textAlign: 'center', fontSize: 14, lineHeight: 20 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10,
    gap: 8
  },
  badgeText: { color: '#DDD', fontSize: 13 },

  contactBtn: { 
    backgroundColor: '#00EAFF', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 15, 
    marginTop: 40,
    gap: 10
  },
  contactBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});

export default AboutHospitalScreen;