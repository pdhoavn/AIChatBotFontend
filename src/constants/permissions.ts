// Define Role type to match backend roles (with spaces as they appear in backend)
export type Role = "Admin" | "Consultant" | "Content Manager" | "Admission Official" | "Student" | "Parent";

/** All possible permissions in the system - will be dynamically loaded from backend */
export type Permission = string;

// API interface for permissions from backend
export interface PermissionData {
  permission_id: number;
  permission_name: string;
  description?: string;
}

// Global permissions cache
let permissionsCache: PermissionData[] = [];
let permissionsCacheLoaded = false;

/** Fetch and cache all permissions from the backend */
export async function loadPermissions(): Promise<PermissionData[]> {
  if (permissionsCacheLoaded) {
    return permissionsCache;
  }

  try {
    const { permissionsAPI } = await import('../services/fastapi');
    const permissions = await permissionsAPI.getAll();
    permissionsCache = permissions;
    permissionsCacheLoaded = true;
    return permissions;
  } catch (error) {
    // Check if user is logged in (has token)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    // Silent fail - fallback to hardcoded permissions if API fails
    
    // Fallback to hardcoded permissions if API fails
    const fallbackPermissions: PermissionData[] = [
      { permission_id: 1, permission_name: "Admin", description: "System administrator" },
      { permission_id: 2, permission_name: "Consultant", description: "Educational consultant" },
      { permission_id: 3, permission_name: "Content Manager", description: "Content management" },
      { permission_id: 4, permission_name: "Admission Official", description: "Admission processing" },
      { permission_id: 5, permission_name: "Student", description: "Student access" },
      { permission_id: 6, permission_name: "Parent", description: "Parent access" }
    ];
    permissionsCache = fallbackPermissions;
    permissionsCacheLoaded = true;
    return fallbackPermissions;
  }
}

/** Get cached permissions (must call loadPermissions first) */
export function getCachedPermissions(): PermissionData[] {
  return permissionsCache;
}

/** Update PAGE_PERMISSIONS dynamically */
export function updatePagePermissions(newMappings: Partial<Record<PagePermission, Permission>>) {
  PAGE_PERMISSIONS = { ...PAGE_PERMISSIONS, ...newMappings };
}

/** Update ROLE_PERMISSIONS dynamically */
export function updateRolePermissions(newMappings: Partial<Record<Role, Permission[]>>) {
  ROLE_PERMISSIONS = { ...ROLE_PERMISSIONS, ...newMappings };
}

/** Update PERMISSION_HIERARCHY dynamically */
export function updatePermissionHierarchy(newHierarchy: Partial<Record<Permission, Permission[]>>) {
  PERMISSION_HIERARCHY = { ...PERMISSION_HIERARCHY, ...newHierarchy };
}

/** Get current PAGE_PERMISSIONS (for readonly access) */
export function getPagePermissions(): Record<PagePermission, Permission> {
  return { ...PAGE_PERMISSIONS };
}

/** Get current ROLE_PERMISSIONS (for readonly access) */
export function getRolePermissionMappings(): Record<Role, Permission[]> {
  return { ...ROLE_PERMISSIONS };
}

/** Get current PERMISSION_HIERARCHY (for readonly access) */
export function getPermissionHierarchy(): Record<Permission, Permission[]> {
  return { ...PERMISSION_HIERARCHY };
}

// Export constants for backward compatibility
export { PAGE_PERMISSIONS, ROLE_PERMISSIONS, PERMISSION_HIERARCHY };

/**
 * Initialize the permission system by loading permissions from API
 * and optionally updating role mappings
 */
export async function initializePermissions(): Promise<void> {
  try {
    await loadPermissions();
  } catch (error) {
    // Fallback to hardcoded permissions - silent fail expected
  }
}

/** Get all permission names as an array */
export async function getAllPermissionNames(): Promise<string[]> {
  const permissions = await loadPermissions();
  return permissions.map(p => p.permission_name);
}

/** Get available permissions for editing (excludes admin) */
export async function getEditablePermissionNames(): Promise<string[]> {
  const permissions = await loadPermissions();
  return permissions
    .filter(p => p.permission_name.toLowerCase() !== 'admin')
    .map(p => p.permission_name);
}

/** Page/Component identifiers that need permission checks */
export type PagePermission = 
  // Admin-only pages
  | "dashboard" | "templates" | "users" | "activity"
  // Admission Officer pages  
  | "admissions" | "content" | "consultation" | "insights"
  // Consultant pages
  | "overview" | "analytics" | "knowledge" | "optimization"
  // Content Manager pages
  | "dashboardcontent" | "articles" | "review" | "editor"
  // Shared/Student pages
  | "profile" | "riasec" | "chatbot";

/** Map each page to its required permission - can be updated dynamically */
let PAGE_PERMISSIONS: Record<PagePermission, Permission> = {
  // Admin-only pages
  "dashboard": "Admin",
  "templates": "Admin", 
  "users": "Admin",
  "activity": "Admin",
  
  // Admission Official pages
  "admissions": "Admission Official",
  "content": "Admission Official", 
  "consultation": "Admission Official",
  "insights": "Admission Official",
  
  // Consultant pages
  "overview": "Consultant",
  "analytics": "Consultant",
  "knowledge": "Consultant", 
  "optimization": "Consultant",
  
  // Content Manager pages
  "dashboardcontent": "Content Manager",
  "articles": "Content Manager",
  "review": "Content Manager", 
  "editor": "Content Manager",
  
  // Shared pages (accessible by all roles - no specific permission required)
  "profile": "Admission Official", // Minimum staff permission level
  "riasec": "Admission Official",
  "chatbot": "Admission Official"
};

/** Base permissions for each role - can be updated dynamically */
let ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: ["Admin", "Content Manager", "Admission Official", "Consultant"],
  "Content Manager": ["Content Manager"],
  "Admission Official": ["Admission Official"], 
  Consultant: ["Consultant"],
  Student: [], // Students don't have staff permissions (kept for auth, but not for sidebar switching)
  Parent: [] // Parents don't have staff permissions
};

/** Permission hierarchy - higher levels include lower levels - can be updated dynamically */
let PERMISSION_HIERARCHY: Record<Permission, Permission[]> = {
  "Admin": ["Admin", "Content Manager", "Admission Official", "Consultant"],
  "Content Manager": ["Content Manager"],
  "Admission Official": ["Admission Official"],
  "Consultant": ["Consultant"],
  "Student": ["Student"], // Kept for auth, but not for sidebar switching
  "Parent": ["Parent"]
};

/** Check if a user has access to a specific page */
export function canAccessPage(
  userPermissions: Permission[] | undefined,
  pageId: PagePermission
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  const requiredPermission = PAGE_PERMISSIONS[pageId];
  if (!requiredPermission) return false;
  
  // Check if user has the required permission or a higher one
  return userPermissions.some(permission => 
    PERMISSION_HIERARCHY[permission]?.includes(requiredPermission) || permission === requiredPermission
  );
}

/** Check if a user has a specific permission */
export function hasPermission(
  userPermissions: Permission[] | undefined,
  requiredPermission: Permission
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  return userPermissions.some(permission => 
    PERMISSION_HIERARCHY[permission]?.includes(requiredPermission) || permission === requiredPermission
  );
}

/** Get all permissions for a role */
export function getRolePermissions(role: Role, isLeader: boolean = false): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Legacy function for backward compatibility with existing code that checks roles
export function canAccess(role: Role | null | undefined, pageId: string): boolean {
  if (!role) return false;
  
  const userPermissions = getRolePermissions(role);
  return canAccessPage(userPermissions, pageId as PagePermission);
}