// Default Operating Code principles
export const defaultOperatingCode = {
  principles: [
    "I do not negotiate with comfort. Comfort is the enemy of progress.",
    "I show up every single day regardless of how I feel.",
    "I take 10X action on everything I commit to.",
    "I refuse to make excuses. Results or reasons—never both.",
    "I protect my time like it's my most valuable asset—because it is.",
    "I invest in myself before I invest in anything else.",
    "I burn the boats. There is no Plan B."
  ],
  dailySacrifice: "",
  dailyCommitment: "",
  comfortRefused: ""
};

export const coreManifesto = {
  statement: "EVERYBODY WANTS THE RESULTS,",
  continuation: "BUT NOBODY WANTS TO MAKE THE SACRIFICES.",
  commitment: "I choose to be the exception."
};

export const phases = {
  FOUNDATION: { months: [1, 2, 3], color: '#6B7280' },
  TRACTION: { months: [4, 5, 6], color: '#3B82F6' },
  EXPANSION: { months: [7, 8, 9], color: '#10B981' },
  DOMINATION: { months: [10, 11, 12], color: '#F59E0B' }
};

export const getPhaseForMonth = (month: number): 'FOUNDATION' | 'TRACTION' | 'EXPANSION' | 'DOMINATION' => {
  if (month >= 1 && month <= 3) return 'FOUNDATION';
  if (month >= 4 && month <= 6) return 'TRACTION';
  if (month >= 7 && month <= 9) return 'EXPANSION';
  return 'DOMINATION';
};

export const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'FOUNDATION': return '#6B7280';
    case 'TRACTION': return '#3B82F6';
    case 'EXPANSION': return '#10B981';
    case 'DOMINATION': return '#F59E0B';
    default: return '#F59E0B';
  }
};
