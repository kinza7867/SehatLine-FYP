// src/screens/doctor/PrescriptionTemplatesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

const PrescriptionTemplatesScreen = ({ navigation }) => {
  const [templates] = useState([
    { id: '1', name: 'Common Cold', category: 'Respiratory', medicines: ['Paracetamol 500mg', 'Vitamin C 1000mg'] },
    { id: '2', name: 'Hypertension', category: 'Cardiology', medicines: ['Amlodipine 5mg', 'Lisinopril 10mg'] },
    { id: '3', name: 'Diabetes Type 2', category: 'Endocrinology', medicines: ['Metformin 500mg', 'Glimepiride 1mg'] },
  ]);

  const useTemplate = (template) => {
    Alert.alert(
      'Use Template',
      `Apply "${template.name}" template?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply', onPress: () => navigation.navigate('Prescription', { template }) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.primary || '#1a73e8', COLORS.secondary || '#0d47a1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(5)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescription Templates</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={wp(5)} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateCard, SHADOWS?.medium || {}]}
              onPress={() => useTemplate(template)}
            >
              <View style={styles.templateHeader}>
                <View style={styles.templateIcon}>
                  <Ionicons name="document-text-outline" size={wp(5)} color={COLORS.primary || '#1a73e8'} />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateCategory}>{template.category}</Text>
                </View>
              </View>
              <View style={styles.templateMedicines}>
                {template.medicines.map((med, index) => (
                  <Text key={index} style={styles.medicineText}>• {med}</Text>
                ))}
              </View>
              <View style={styles.templateActions}>
                <TouchableOpacity style={styles.useTemplateBtn} onPress={() => useTemplate(template)}>
                  <Text style={styles.useTemplateText}>Use Template</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f7fa',
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: wp(4),
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border || '#e0e0e0',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  templateIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    backgroundColor: COLORS.primary + '18' || '#1a73e818',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: COLORS.text || '#1a1a1a',
  },
  templateCategory: {
    fontSize: wp(2.8),
    color: COLORS.textSecondary || '#666',
  },
  templateMedicines: {
    paddingVertical: hp(0.3),
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#e0e0e0',
  },
  medicineText: {
    fontSize: wp(3),
    color: COLORS.text || '#1a1a1a',
    paddingVertical: hp(0.1),
  },
  templateActions: {
    marginTop: hp(0.5),
  },
  useTemplateBtn: {
    backgroundColor: COLORS.primary || '#1a73e8',
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
    alignItems: 'center',
  },
  useTemplateText: {
    fontSize: wp(3),
    fontWeight: '600',
    color: '#fff',
  },
});

export default PrescriptionTemplatesScreen;