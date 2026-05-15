import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

// --- EMERGENCY ---
import EmergencyHomeScreen from '../screens/emergency/EmergencyHomeScreen';
import AmbulanceTrackingScreen from '../screens/emergency/AmbulanceTrackingScreen';
import SOSScreen from '../screens/emergency/SOSScreen';

// --- AI & SMART ---
import AISymptomCheckerScreen from '../screens/ai/AISymptomCheckerScreen';
import AIHealthTipsScreen from '../screens/ai/AIHealthTipsScreen';
import VoiceHealthAssistantScreen from '../screens/ai/VoiceHealthAssistantScreen';

// --- PHARMACY & REPORTS ---
import MedicineListScreen from '../screens/pharmacy/MedicineListScreen';
import CartScreen from '../screens/pharmacy/CartScreen';
import InsurancePartnersScreen from '../screens/pharmacy/InsurancePartnersScreen';
import ReportsListScreen from '../screens/reports/ReportsListScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';
import LabTestsPriceScreen from '../screens/reports/LabTestsPriceScreen';

// --- PROFILE & SETTINGS ---
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import PoliciesScreen from '../screens/settings/PoliciesScreen'; 

// --- AR & NAVIGATION ---
import RoomDirectoryScreen from '../screens/ar/RoomDirectoryScreen';
import ARHospitalNavigationScreen from '../screens/ar/ARHospitalNavigationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome" 
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
        <Stack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
        <Stack.Screen name="ManageDoctorsScreen" component={ManageDoctorsScreen} />
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

        {/* Doctor Flow */}
        <Stack.Screen name="DoctorListScreen" component={DoctorListScreen} />
        <Stack.Screen name="DoctorDetailScreen" component={DoctorDetailScreen} />
        <Stack.Screen name="DoctorScheduleScreen" component={DoctorScheduleScreen} />
        <Stack.Screen name="DoctorDashboardScreen" component={DoctorDashboardScreen} />
        {/* TYPO FIXED BELOW: nawme changed to name */}
        <Stack.Screen name="CallNextPatientScreen" component={CallNextPatientScreen} />

        {/* Emergency Flow */}
        <Stack.Screen name="EmergencyHomeScreen" component={EmergencyHomeScreen} />
        <Stack.Screen name="AmbulanceTrackingScreen" component={AmbulanceTrackingScreen} />
        <Stack.Screen name="SOS" component={SOSScreen} />

        {/* AI Services */}
        <Stack.Screen name="AISymptomCheckerScreen" component={AISymptomCheckerScreen} />
        <Stack.Screen name="AIHealthTipsScreen" component={AIHealthTipsScreen} />
        <Stack.Screen name="VoiceAssistant" component={VoiceHealthAssistantScreen} />

        {/* Pharmacy, Insurance & Lab */}
        <Stack.Screen name="MedicineListScreen" component={MedicineListScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="InsurancePartnersScreen" component={InsurancePartnersScreen} />
        <Stack.Screen name="ReportsListScreen" component={ReportsListScreen} />
        <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
        <Stack.Screen name="LabTestsPriceScreen" component={LabTestsPriceScreen} />

        {/* Profile & Settings */}
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
        <Stack.Screen name="PoliciesScreen" component={PoliciesScreen} />

        {/* Indoor Navigation */}
        <Stack.Screen name="RoomDirectoryScreen" component={RoomDirectoryScreen} />
        <Stack.Screen name="ARNavigation" component={ARHospitalNavigationScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
