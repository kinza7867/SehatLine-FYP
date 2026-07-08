// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../theme';

// --- ADMIN ---
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';

// --- AUTH ---
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PortalSelectionScreen from '../screens/auth/PortalSelectionScreen';

// --- MAIN SHELL & HOME ---
import DrawerNavigator from './DrawerNavigator';
import HomeScreen from '../screens/home/HomeScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import AnnouncementsScreen from '../screens/home/AnnouncementsScreen';
import HospitalTimingsScreen from '../screens/home/HospitalTimingsScreen';
import AboutHospitalScreen from '../screens/home/AboutHospitalScreen';
import ContactScreen from '../screens/home/ContactScreen';
import HospitalDirectoryScreen from '../screens/home/HospitalDirectoryScreen';

// --- PORTALS ---
import PatientPortal from '../screens/portal/PatientPortal';
import ChronicPortal from '../screens/portal/ChronicPortal';
import VisitorHome from '../screens/portal/VisitorHome';

// --- APPOINTMENT & QUEUE ---
import BookAppointmentScreen from '../screens/appointment/BookAppointmentScreen';
import AppointmentListScreen from '../screens/appointment/AppointmentListScreen';
import AppointmentDetailScreen from '../screens/appointment/AppointmentDetailScreen';
import LiveTokenQueueScreen from '../screens/queue/LiveTokenQueueScreen';
import TokenDisplayScreen from '../screens/queue/TokenDisplayScreen';
import OccupancyHeatmapScreen from '../screens/queue/OccupancyHeatmapScreen';
import CheckInQRScreen from '../screens/appointment/CheckInQRScreen';
import LiveQueueTrackerScreen from '../screens/appointment/LiveQueueTrackerScreen';
import RescheduleScreen from '../screens/appointment/RescheduleScreen';
import TokenTransferScreen from '../screens/appointment/TokenTransferScreen';

// --- DOCTOR ---
// Only import the Drawer Navigator - all doctor screens are managed inside it
import DoctorDrawerNavigator from '../screens/doctor/navigation/DoctorDrawerNavigator';

// --- DOCTOR SCREENS (REMOVED - Now managed inside DoctorDrawerNavigator) ---
// The following screens are now exclusively managed by DoctorDrawerNavigator:
// - DoctorListScreen (kept - shared with patient)
// - DoctorDetailScreen (kept - shared with patient)
// - DoctorScheduleScreen (kept - shared with patient)
// - DoctorPortalScreen
// - DoctorDashboardScreen
// - CallNextPatientScreen
// - TodayQueueScreen
// - ConsultationScreen
// - PatientHistoryScreen
// - PrescriptionScreen
// - PrescriptionTemplatesScreen
// - DoctorProfileScreen
// - DoctorSettingsScreen
// - DoctorNotificationsScreen
// - DoctorAvailabilityScreen

// --- DOCTOR SCREENS THAT ARE SHARED WITH PATIENT MODULE (KEPT) ---
import DoctorListScreen from '../screens/doctor/DoctorListScreen';
import DoctorDetailScreen from '../screens/doctor/DoctorDetailScreen';
import DoctorScheduleScreen from '../screens/doctor/DoctorScheduleScreen';

// --- AI & SMART ---
import AISymptomCheckerScreen from '../screens/ai/AISymptomCheckerScreen';
import AIHealthTipsScreen from '../screens/ai/AIHealthTipsScreen';
import PredictiveWaitScreen from '../screens/ai/PredictiveWaitScreen';
import AISeverityResultScreen from '../screens/ai/AISeverityResultScreen';
import AIChronicMonitoringScreen from '../screens/ai/AIChronicMonitoringScreen';
import AIPostConsultationScreen from '../screens/ai/AIPostConsultationScreen';

// --- PHARMACY & REPORTS ---
import PharmacyDashboardScreen from '../screens/pharmacy/PharmacyDashboardScreen';
import LabDashboardScreen from '../screens/lab/LabDashboardScreen';
import ChronicDashboardScreen from '../screens/chronic/ChronicDashboardScreen';
import MedicineListScreen from '../screens/pharmacy/MedicineListScreen';
import CartScreen from '../screens/pharmacy/CartScreen';
import InsurancePartnersScreen from '../screens/pharmacy/InsurancePartnersScreen';
import ReportsListScreen from '../screens/reports/ReportsListScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';
import LabTestsPriceScreen from '../screens/reports/LabTestsPriceScreen';
import MyPrescriptionsScreen from '../screens/prescription/MyPrescriptionsScreen';
import OrderMedicineScreen from '../screens/pharmacy/OrderMedicineScreen';
import DietPrecautionScreen from '../screens/pharmacy/DietPrecautionScreen';
import UploadReportScreen from '../screens/reports/UploadReportScreen';
import VitalsLoggerScreen from '../screens/reports/VitalsLoggerScreen';

// --- PROFILE & SETTINGS ---
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HealthIDScreen from '../screens/patient/HealthIDScreen';
import HealthMetricsScreen from '../screens/patient/HealthMetricsScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import PoliciesScreen from '../screens/settings/PoliciesScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
import FeedbackScreen from '../screens/settings/FeedbackScreen';
import ActivityScreen from '../screens/profile/ActivityScreen';

// --- AR & NAVIGATION ---
import RoomDirectoryScreen from '../screens/ar/RoomDirectoryScreen';
import ARHospitalNavigationScreen from '../screens/ar/ARHospitalNavigationScreen';
import HospitalIndoorMapScreen from '../screens/ar/HospitalIndoorMapScreen';
import QRScannerForARScreen from '../screens/ar/QRScannerForARScreen';

// --- TOKEN ---
import GenerateTokenScreen from '../screens/token/GenerateTokenScreen';
import PriorityTokenAlertScreen from '../screens/queue/PriorityTokenAlertScreen';
import DoctorLoadBalancerScreen from '../screens/queue/DoctorLoadBalancerScreen';

// --- CONTEXT ---
import { AppointmentProvider } from '../context/AppointmentContext';

const Stack = createNativeStackNavigator();

// Maps a persisted user role to the screen they should land on
const ROLE_HOME_SCREEN = {
  patient: 'PatientPortal',
  doctor: 'DoctorModule',  // Doctor navigates to DoctorDrawerNavigator
  admin: 'AdminDashboardScreen',
};

// ─── MAIN NAVIGATOR ──────────────────────────────────────────────────────────
function MainStack({ initialRouteName, initialParams }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName || 'Welcome'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Auth Group */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PortalSelection" component={PortalSelectionScreen} />

      {/* Admin Flow */}
      <Stack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageUsersScreen" component={ManageUsersScreen} />

      {/* The Main App Entrance - DrawerNavigator contains all screens */}
      <Stack.Screen name="MainApp" component={DrawerNavigator} />

      {/* Home & General */}
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="HospitalTimingsScreen" component={HospitalTimingsScreen} />
      <Stack.Screen name="AboutHospitalScreen" component={AboutHospitalScreen} />
      <Stack.Screen name="ContactScreen" component={ContactScreen} />
      <Stack.Screen name="HospitalDirectoryScreen" component={HospitalDirectoryScreen} />

      {/* Portals */}
      <Stack.Screen name="PatientPortal" component={PatientPortal} />
      <Stack.Screen name="ChronicPortal" component={ChronicPortal} />
      <Stack.Screen name="VisitorHome" component={VisitorHome} />

      {/* Appointment & Queue Flow */}
      <Stack.Screen name="BookAppointmentScreen" component={BookAppointmentScreen} />
      <Stack.Screen name="AppointmentList" component={AppointmentListScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="LiveTokenQueueScreen" component={LiveTokenQueueScreen} />
      <Stack.Screen name="TokenDisplay" component={TokenDisplayScreen} />
      <Stack.Screen name="OccupancyHeatmapScreen" component={OccupancyHeatmapScreen} />
      <Stack.Screen name="CheckInQRScreen" component={CheckInQRScreen} />
      <Stack.Screen name="LiveQueueTrackerScreen" component={LiveQueueTrackerScreen} />
      <Stack.Screen name="RescheduleScreen" component={RescheduleScreen} />
      <Stack.Screen name="TokenTransferScreen" component={TokenTransferScreen} />

      {/* Doctor Module - All doctor screens are now managed inside this Drawer */}
      <Stack.Screen name="DoctorModule" component={DoctorDrawerNavigator} />

      {/* Doctor screens that are shared with Patient Module */}
      <Stack.Screen name="DoctorListScreen" component={DoctorListScreen} />
      <Stack.Screen name="DoctorDetailScreen" component={DoctorDetailScreen} />
      <Stack.Screen name="DoctorScheduleScreen" component={DoctorScheduleScreen} />

      {/* AI Services */}
      <Stack.Screen name="AISymptomCheckerScreen" component={AISymptomCheckerScreen} />
      <Stack.Screen name="AIHealthTipsScreen" component={AIHealthTipsScreen} />
      <Stack.Screen name="PredictiveWaitScreen" component={PredictiveWaitScreen} />
      <Stack.Screen name="AISeverityResultScreen" component={AISeverityResultScreen} />
      <Stack.Screen name="AIChronicMonitoringScreen" component={AIChronicMonitoringScreen} />
      <Stack.Screen name="AIPostConsultationScreen" component={AIPostConsultationScreen} />

      {/* Dashboards */}
      <Stack.Screen name="PharmacyDashboardScreen" component={PharmacyDashboardScreen} />
      <Stack.Screen name="LabDashboardScreen" component={LabDashboardScreen} />
      <Stack.Screen name="ChronicDashboardScreen" component={ChronicDashboardScreen} />

      {/* Pharmacy, Insurance & Lab */}
      <Stack.Screen name="MedicineListScreen" component={MedicineListScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="InsurancePartnersScreen" component={InsurancePartnersScreen} />
      <Stack.Screen name="ReportsListScreen" component={ReportsListScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <Stack.Screen name="LabTestsPriceScreen" component={LabTestsPriceScreen} />
      <Stack.Screen name="MyPrescriptionsScreen" component={MyPrescriptionsScreen} />
      <Stack.Screen name="OrderMedicineScreen" component={OrderMedicineScreen} />
      <Stack.Screen name="DietPrecautionScreen" component={DietPrecautionScreen} />
      <Stack.Screen name="UploadReportScreen" component={UploadReportScreen} />
      <Stack.Screen name="VitalsLoggerScreen" component={VitalsLoggerScreen} />

      {/* Profile & Settings */}
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="HealthIDScreen" component={HealthIDScreen} />
      <Stack.Screen name="HealthMetricsScreen" component={HealthMetricsScreen} />
      <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
      <Stack.Screen name="PoliciesScreen" component={PoliciesScreen} />
      <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <Stack.Screen name="ActivityScreen" component={ActivityScreen} />

      {/* Indoor Navigation */}
      <Stack.Screen name="RoomDirectoryScreen" component={RoomDirectoryScreen} />
      <Stack.Screen name="ARNavigation" component={ARHospitalNavigationScreen} />
      <Stack.Screen name="HospitalIndoorMapScreen" component={HospitalIndoorMapScreen} />
      <Stack.Screen name="QRScannerForARScreen" component={QRScannerForARScreen} />

      {/* Token */}
      <Stack.Screen name="GenerateTokenScreen" component={GenerateTokenScreen} />
      <Stack.Screen name="PriorityTokenAlertScreen" component={PriorityTokenAlertScreen} />
      <Stack.Screen name="DoctorLoadBalancerScreen" component={DoctorLoadBalancerScreen} />
    </Stack.Navigator>
  );
}

// ─── ROOT WITH CONTEXT PROVIDER ─────────────────────────────────────────────
export default function AppNavigator() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');

  useEffect(() => {
    // Always show Welcome screen first
    setInitialRoute('Welcome');
    setCheckingSession(false);
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <AppointmentProvider>
      <MainStack initialRouteName={initialRoute} />
    </AppointmentProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#FFFFFF',
  },
});