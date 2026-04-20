/**
 * Staff Pages Color Theme Constants
 * Centralized color configuration for all staff dashboards
 * Theme: Orange and White
 */

export const STAFF_COLORS = {
  // Primary Brand Colors
  primary: '#EB5A0D',           // Main orange color
  primaryLight: '#FFF3ED',      // Light orange background
  primaryLighter: '#FFF8F3',    // Very light orange hover
  
  // Sidebar Colors
  sidebar: {
    background: 'white',
    border: 'border-orange-200',
    borderColor: 'orange-200',
    shadow: 'shadow-sm',
  },
  
  // Logo/Brand Section
  brand: {
    logoBackground: 'bg-[#EB5A0D]',
    logoBackgroundColor: '#EB5A0D',
    titleText: 'text-gray-900',
    subtitleText: 'text-[#EB5A0D]',
    subtitleColor: '#EB5A0D',
    border: 'border-orange-100',
    borderColor: 'orange-100',
  },
  
  // Navigation Items
  navigation: {
    // Active state
    active: {
      background: 'bg-[#EB5A0D]',
      backgroundColor: '#EB5A0D',
      text: 'text-white',
      shadow: 'shadow-sm',
    },
    // Inactive state
    inactive: {
      text: 'text-gray-700',
      hoverBackground: 'hover:bg-[#FFF8F3]',
      hoverBackgroundColor: '#FFF8F3',
      hoverText: 'hover:text-[#EB5A0D]',
      hoverTextColor: '#EB5A0D',
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
    text: 'text-[#EB5A0D]',
    textColor: '#EB5A0D',
    font: 'font-medium',
  },
  
  // Buttons
  button: {
    hover: 'hover:bg-orange-50',
    hoverColor: 'orange-50',
  },
  
  // Dividers
  divider: {
    border: 'border-orange-100',
    borderColor: 'orange-100',
  },
  
  // Role Switching
  roleSwitching: {
    border: 'border-orange-100',
    headerText: 'text-[#EB5A0D]',
    // Active role button (current role)
    active: {
      background: 'bg-[#EB5A0D]',
      text: 'text-white',
      border: 'border-orange-300',
    },
    // Inactive role button
    inactive: {
      background: 'bg-white',
      text: 'text-gray-700',
      border: 'border-orange-200',
      hoverBackground: 'hover:bg-[#FFF8F3]',
      hoverText: 'hover:text-[#EB5A0D]',
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
