/**
 * @typedef {'SPARTANS' | 'MUGHALS' | 'VIKINGS' | 'RAJPUTS' | 'ARYANS'} House
 */
export const HOUSES = ["SPARTANS", "MUGHALS", "VIKINGS", "RAJPUTS", "ARYANS"];

/**
 * @typedef {'AEI' | 'AIDS' | 'CIVIL' | 'CSBS' | 'CS ALPHA' | 'CS BETA' | 'CS GAMMA' | 'CS DELTA' | 'EEE' | 'EC ALPHA' | 'EC BETA' | 'EC GAMMA' | 'IT' | 'MECH ALPHA' | 'MECH BETA'} ClassName
 */
export const CLASS_NAMES = [
  "AEI", "AIDS", "CIVIL", "CSBS", "CS ALPHA", "CS BETA", "CS GAMMA", "CS DELTA",
  "EEE", "EC ALPHA", "EC BETA", "EC GAMMA", "IT", "MECH ALPHA", "MECH BETA"
];

// House colors for visual representation
export const HOUSE_COLORS = {
  SPARTANS: '#DC2626',   // Red
  MUGHALS: '#7C3AED',    // Purple
  VIKINGS: '#2563EB',    // Blue
  RAJPUTS: '#EA580C',    // Orange
  ARYANS: '#16A34A'      // Green
};

// House themes and descriptions
export const HOUSE_THEMES = {
  SPARTANS: { 
    emoji: '⚔️', 
    description: 'Brave Warriors', 
    color: 'red' 
  },
  MUGHALS: { 
    emoji: '👑', 
    description: 'Royal Dynasty', 
    color: 'purple' 
  },
  VIKINGS: { 
    emoji: '🛡️', 
    description: 'Norse Legends', 
    color: 'blue' 
  },
  RAJPUTS: { 
    emoji: '🏰', 
    description: 'Noble Fighters', 
    color: 'orange' 
  },
  ARYANS: { 
    emoji: '🌟', 
    description: 'Ancient Heroes', 
    color: 'green' 
  }
};

// Onam theme colors
export const THEME_COLORS = {
  gold: '#FFD700',
  red: '#DC143C',
  green: '#228B22',
  orange: '#FF8C00',
  purple: '#8A2BE2',
  cream: '#FFF8DC',
  brown: '#8B4513'
};

/**
 * Represents a participant object.
 * @typedef {Object} Participant
 * @property {string} name
 * @property {string} college_id
 * @property {House} house
 * @property {ClassName} class
 * @property {string} registration_batch - UUID to group 30 participants together
 */
