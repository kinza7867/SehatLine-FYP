import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../theme';

// --- ADMIN ---
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageDoctorsScreen from '../screens/admin/ManageDoctorsScreen';
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

// --- DOCTOR ---
import DoctorListScreen from '../screens/doctor/DoctorListScreen';
import DoctorDetailScreen from '../screens/doctor/DoctorDetailScreen';
import DoctorScheduleScreen from '../screens/doctor/DoctorScheduleScreen';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import CallNextPatientScreen from '../screens/doctor/CallNextPatientScreen';


// --- AI & SMART ---
import AISymptomCheckerScreen from '../screens/ai/AISymptomCheckerScreen';
import AIHealthTipsScreen from '../screens/ai/AIHealthTipsScreen';
import PredictiveWaitScreen from '../screens/ai/PredictiveWaitScreen';
import AISeverityResultScreen from '../screens/ai/AISeverityResultScreen';

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

// --- PROFILE & SETTINGS ---
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HealthIDScreen from '../screens/patient/HealthIDScreen';
import HealthMetricsScreen from '../screens/patient/HealthMetricsScreen'
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import PoliciesScreen from '../screens/settings/PoliciesScreen'; 

// --- AR & NAVIGATION ---
import RoomDirectoryScreen from '../screens/ar/RoomDirectoryScreen';
import ARHospitalNavigationScreen from '../screens/ar/ARHospitalNavigationScreen';

// --- TOKEN ---
import GenerateTokenScreen from '../screens/token/GenerateTokenScreen';

// --- CONTEXT ---
import { AppointmentProvider } from '../context/AppointmentContext';

const Stack = createNativeStackNavigator();

// Maps a persisted user role to the screen they should land on when the
// app is relaunched while already logged in. Mirrors the roleConfig
// mapping used inside LoginScreen so behavior stays consistent.
const ROLE_HOME_SCREEN = {
  patient: 'PatientPortal',
  doctor: 'ManageDoctorsScreen',
  admin: 'AdminDashboardScreen',
};

// ─── MAIN NAVIGATOR ──────────────────────────────────────────────────────────
function MainStack({ initialRouteName, initialParams }) {
  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName || 'Welcome'} 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right' 
      }}
    >
      {/* Auth Group */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PortalSelection" component={PortalSelectionScreen} />

      {/* Admin Flow */}
      <Stack.Screen
        name="AdminDashboardScreen"
        component={AdminDashboardScreen}
        initialParams={initialRouteName === 'AdminDashboardScreen' ? initialParams : undefined}
      />
      <Stack.Screen
        name="ManageDoctorsScreen"
        component={ManageDoctorsScreen}
        initialParams={initialRouteName === 'ManageDoctorsScreen' ? initialParams : undefined}
      />
      <Stack.Screen name="ManageUsersScreen" component={ManageUsersScreen} />

      {/* The Main App Entrance */}
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
      <Stack.Screen
        name="PatientPortal"
        component={PatientPortal}
        initialParams={initialRouteName === 'PatientPortal' ? initialParams : undefined}
      />
      <Stack.Screen name="ChronicPortal" component={ChronicPortal} />
      <Stack.Screen name="VisitorHome" component={VisitorHome} />

      {/* Appointment & Queue Flow */}
      <Stack.Screen name="BookAppointmentScreen" component={BookAppointmentScreen} />
      <Stack.Screen name="AppointmentList" component={AppointmentListScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="LiveTokenQueueScreen" component={LiveTokenQueueScreen} />
      <Stack.Screen name="TokenDisplay" component={TokenDisplayScreen} />
      <Stack.Screen name="OccupancyHeatmapScreen" component={OccupancyHeatmapScreen} />

      {/* Doctor Flow */}
      <Stack.Screen name="DoctorListScreen" component={DoctorListScreen} />
      <Stack.Screen name="DoctorDetailScreen" component={DoctorDetailScreen} />
      <Stack.Screen name="DoctorScheduleScreen" component={DoctorScheduleScreen} />
      <Stack.Screen name="DoctorDashboardScreen" component={DoctorDashboardScreen} />
      <Stack.Screen name="CallNextPatientScreen" component={CallNextPatientScreen} />

      {/* AI Services */}
      <Stack.Screen name="AISymptomCheckerScreen" component={AISymptomCheckerScreen} />
      <Stack.Screen name="AIHealthTipsScreen" component={AIHealthTipsScreen} />
      <Stack.Screen name="PredictiveWaitScreen" component={PredictiveWaitScreen} />
      <Stack.Screen name="AISeverityResultScreen" component={AISeverityResultScreen} />

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

      {/* Profile & Settings */}
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="HealthIDScreen" component={HealthIDScreen} />
      <Stack.Screen name="HealthMetricsScreen" component={HealthMetricsScreen} />
      <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
      <Stack.Screen name="PoliciesScreen" component={PoliciesScreen} />

      {/* Indoor Navigation */}
      <Stack.Screen name="RoomDirectoryScreen" component={RoomDirectoryScreen} />
      <Stack.Screen name="ARNavigation" component={ARHospitalNavigationScreen} />

      {/* Token */}
      <Stack.Screen name="GenerateTokenScreen" component={GenerateTokenScreen} />
    </Stack.Navigator>
  );
}

// ─── ROOT WITH CONTEXT PROVIDER ─────────────────────────────────────────────
export default function AppNavigator() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const [initialParams, setInitialParams] = useState(undefined);

  // On every app launch, check whether a user is already logged in
  // (persisted via AsyncStorage during Login/Signup). If so, skip the
  // Welcome/Login/Signup screens entirely and drop the user straight
  // back into their portal - this is what keeps a signed-up/logged-in
  // account "remembered" instead of asking them to sign up again.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const userDataString = await AsyncStorage.getItem('userData');

        if (isLoggedIn === 'true' && userDataString) {
          const userData = JSON.parse(userDataString);
          const storedRole = await AsyncStorage.getItem('userRole');
          const role = storedRole || userData.role || 'patient';
          const homeScreen = ROLE_HOME_SCREEN[role] || 'PatientPortal';

          setInitialRoute(homeScreen);
          setInitialParams({ userData });
        } else {
          setInitialRoute('Welcome');
        }
      } catch (error) {
        // If anything goes wrong reading storage, fail safe to Welcome
        setInitialRoute('Welcome');
      } finally {
        setCheckingSession(false);
      }
    };

    restoreSession();
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
      <MainStack initialRouteName={initialRoute} initialParams={initialParams} />
    </AppointmentProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});