/**
 * TEMPORARY ROLE MAPPING (frontend-only, no backend validation)
 * ------------------------------------------------------------------
 * A small set of hardcoded demo accounts route the signed-in user
 * straight into the matching staff module. Any other email is
 * treated as a regular Patient. This is purely local/mock logic —
 * nothing here talks to a server or database.
 */

export const ROLE_ACCOUNTS = {
  'doctor@sehatline.com': 'doctor',
  'laboratorist@sehatline.com': 'laboratorist',
  'pharmacist@sehatline.com': 'pharmacist',
  'admin@sehatline.com': 'admin',
};

export const ROLE_META = {
  patient: {
    label: 'Patient',
    icon: 'person-outline',
    color: '#0BAA9D',
    homeScreen: 'MainApp',
  },
  doctor: {
    label: 'Doctor',
    icon: 'medkit-outline',
    color: '#0B7DAA',
    homeScreen: 'DoctorDashboardScreen',
  },
  laboratorist: {
    label: 'Laboratorist',
    icon: 'flask-outline',
    color: '#7C3AED',
    homeScreen: 'LaboratoryDashboardScreen',
  },
  pharmacist: {
    label: 'Pharmacist',
    icon: 'medical-outline',
    color: '#0F9D6C',
    homeScreen: 'PharmacyDashboardScreen',
  },
  admin: {
    label: 'Admin',
    icon: 'shield-checkmark-outline',
    color: '#B45309',
    homeScreen: 'AdminDashboardScreen',
  },
};

/**
 * Resolve a role purely from the email address used to sign in.
 * Falls back to 'patient' for every other (registered) email.
 */
export function resolveRoleFromEmail(email = '') {
  const normalized = String(email).trim().toLowerCase();
  return ROLE_ACCOUNTS[normalized] || 'patient';
}

export function roleHomeScreen(role) {
  return (ROLE_META[role] || ROLE_META.patient).homeScreen;
}