/**
 * Staff Pages Color Theme Constants
 * Centralized color configuration for all staff dashboards
 * Theme: Yellow and White
 */

export const STAFF_COLORS = {
  // Primary Brand Colors
  primary: '#facb01',           // Main yellow color
  primaryLight: '#FFFDE7',      // Light yellow background
  primaryLighter: '#FFFFF0',    // Very light yellow hover
  
  // Sidebar Colors
  sidebar: {
    background: 'white',
    border: 'border-yellow-200',
    borderColor: 'yellow-200',
    shadow: 'shadow-sm',
  },
  
  // Logo/Brand Section
  brand: {
    logoBackground: 'bg-[#facb01]',
    logoBackgroundColor: '#facb01',
    titleText: 'text-gray-900',
    subtitleText: 'text-[#facb01]',
    subtitleColor: '#facb01',
    border: 'border-yellow-100',
    borderColor: 'yellow-100',
  },
  
  // Navigation Items
  navigation: {
    // Active state
    active: {
      background: 'bg-[#facb01]',
      backgroundColor: '#facb01',
      text: 'text-white',
      shadow: 'shadow-sm',
    },
    // Inactive state
    inactive: {
      text: 'text-gray-700',
      hoverBackground: 'hover:bg-[#FFFFF0]',
      hoverBackgroundColor: '#FFFFF0',
      hoverText: 'hover:text-[#facb01]',
      hoverTextColor: '#facb01',
    },
    // Disabled state
    disabled: {
      opacity: 'opacity-50',
      cursor: 'cursor-not-allowed',
      text: 'text-gray-400',
    }
  },
  
  // Section Headers
  sectionHeader: {
    text: 'text-[#facb01]',
    textColor: '#facb01',
    font: 'font-medium',
  },
  
  // Buttons
  button: {
    hover: 'hover:bg-yellow-50',
    hoverColor: 'yellow-50',
  },
  
  // Dividers
  divider: {
    border: 'border-yellow-100',
    borderColor: 'yellow-100',
  },
  
  // Role Switching
  roleSwitching: {
    border: 'border-yellow-100',
    headerText: 'text-[#facb01]',
    // Active role button (current role)
    active: {
      background: 'bg-[#facb01]',
      text: 'text-white',
      border: 'border-yellow-300',
    },
    // Inactive role button
    inactive: {
      background: 'bg-white',
      text: 'text-gray-700',
      border: 'border-yellow-200',
      hoverBackground: 'hover:bg-[#FFFFF0]',
      hoverText: 'hover:text-[#facb01]',
    }
  },
  
  // Transitions
  transition: 'transition-all duration-200',
  transitionColors: 'transition-colors',
  
  // Backgrounds
  pageBackground: 'bg-[#F8FAFC]',
  pageBackgroundColor: '#F8FAFC',
  
  // Text Colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    light: 'text-gray-400',
  }
} as const;

/**
 * Helper function to get full Tailwind class string for navigation item
 */
export const getNavigationClasses = (isActive: boolean, isDisabled: boolean = false) => {
  if (isDisabled) {
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${STAFF_COLORS.transition} ${STAFF_COLORS.navigation.disabled.opacity} ${STAFF_COLORS.navigation.disabled.cursor} ${STAFF_COLORS.navigation.disabled.text}`;
  }
  
  if (isActive) {
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${STAFF_COLORS.transition} ${STAFF_COLORS.navigation.active.background} ${STAFF_COLORS.navigation.active.text} ${STAFF_COLORS.navigation.active.shadow}`;
  }
  
  return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${STAFF_COLORS.transition} ${STAFF_COLORS.navigation.inactive.text} ${STAFF_COLORS.navigation.inactive.hoverBackground} ${STAFF_COLORS.navigation.inactive.hoverText}`;
};

/**
 * Helper function to get sidebar container classes
 */
export const getSidebarClasses = (collapsed: boolean = false) => {
  return `bg-${STAFF_COLORS.sidebar.background} ${STAFF_COLORS.sidebar.border} flex flex-col min-h-screen transition-all duration-300 ${STAFF_COLORS.sidebar.shadow} ${collapsed ? 'w-16' : 'w-64'}`;
};

/**
 * Helper function to get role switching button classes
 */
export const getRoleSwitchingClasses = (isCurrentRole: boolean) => {
  if (isCurrentRole) {
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${STAFF_COLORS.transitionColors} border ${STAFF_COLORS.roleSwitching.active.background} ${STAFF_COLORS.roleSwitching.active.text} ${STAFF_COLORS.roleSwitching.active.border} font-medium cursor-default`;
  }
  
  return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${STAFF_COLORS.transitionColors} border ${STAFF_COLORS.roleSwitching.inactive.background} ${STAFF_COLORS.roleSwitching.inactive.text} ${STAFF_COLORS.roleSwitching.inactive.border} ${STAFF_COLORS.roleSwitching.inactive.hoverBackground} ${STAFF_COLORS.roleSwitching.inactive.hoverText} cursor-pointer`;
};

export default STAFF_COLORS;
