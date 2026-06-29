/**
 * MOCK TOKEN DATA
 * ------------------------------------------------------------------
 * Pure data + helper functions for the Digital Token System.
 * Three modules are supported: OPD, LAB (Laboratory), PHR (Pharmacy).
 * Everything here is local/mock — there is no server or database.
 */

export const MODULES = {
  OPD: { code: 'OPD', label: 'OPD / Doctor Consultation', icon: 'medkit-outline' },
  LAB: { code: 'LAB', label: 'Laboratory', icon: 'flask-outline' },
  PHR: { code: 'PHR', label: 'Pharmacy', icon: 'medical-outline' },
};

export const MODULE_LIST = Object.values(MODULES);

// Minutes of estimated wait added per patient ahead in the queue.
export const MINUTES_PER_PATIENT = 3;

// Seed "now serving" + "last issued" numbers per module so the demo
// numbers line up nicely out of the box (e.g. OPD-015 now serving,
// next generated token becomes OPD-021 → 6 patients ahead → 18 min).
export const INITIAL_MODULE_STATE = {
  OPD: { nowServing: 15, lastIssued: 20 },
  LAB: { nowServing: 4, lastIssued: 6 },
  PHR: { nowServing: 2, lastIssued: 3 },
};

// Three service counters per module for the staff-facing live queue.
export function buildInitialCounters() {
  return {
    OPD: [
      { id: 'OPD-C1', label: 'Counter 1', servingToken: 'OPD-015', waiting: 3, completed: 12, active: true },
      { id: 'OPD-C2', label: 'Counter 2', servingToken: 'OPD-014', waiting: 2, completed: 15, active: true },
      { id: 'OPD-C3', label: 'Counter 3', servingToken: 'OPD-013', waiting: 1, completed: 9, active: true },
    ],
    LAB: [
      { id: 'LAB-C1', label: 'Counter 1', servingToken: 'LAB-004', waiting: 2, completed: 8, active: true },
      { id: 'LAB-C2', label: 'Counter 2', servingToken: 'LAB-003', waiting: 1, completed: 6, active: true },
      { id: 'LAB-C3', label: 'Counter 3', servingToken: '—', waiting: 0, completed: 4, active: false },
    ],
    PHR: [
      { id: 'PHR-C1', label: 'Counter 1', servingToken: 'PHR-002', waiting: 4, completed: 21, active: true },
      { id: 'PHR-C2', label: 'Counter 2', servingToken: 'PHR-001', waiting: 2, completed: 18, active: true },
      { id: 'PHR-C3', label: 'Counter 3', servingToken: '—', waiting: 0, completed: 11, active: false },
    ],
  };
}

export function formatTokenNumber(moduleCode, number) {
  return `${moduleCode}-${String(number).padStart(3, '0')}`;
}

export function makeToken({ moduleCode, number, patientName }) {
  return {
    id: `${moduleCode}-${number}-${Date.now()}`,
    code: formatTokenNumber(moduleCode, number),
    number,
    module: moduleCode,
    status: 'waiting', // waiting | serving | completed | cancelled
    patientName: patientName || 'Walk-in Patient',
    createdAt: Date.now(),
  };
}

export const STATUS_LABEL = {
  waiting: 'Waiting',
  serving: 'Serving',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_ICON = {
  waiting: 'time-outline',
  serving: 'megaphone-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
};