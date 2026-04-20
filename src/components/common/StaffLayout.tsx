import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  PenSquare,
  Database,
  TrendingUp,
  MessageCircle,
  FileEdit,
  MessageSquareText,
  Users,
  Shield,
  User,
  GraduationCap,
  BookOpen,
  Clock,
  LogOut,
  Tag
} from 'lucide-react';
import { useAuth } from '../../contexts/Auth';
import { canAccessPage } from '../../constants/permissions';
import { STAFF_COLORS, getNavigationClasses, getSidebarClasses, getRoleSwitchingClasses } from '../../constants/staffColors';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
  permission?: string;
}

interface RoleNavigations {
  [key: string]: NavigationItem[];
}

interface StaffLayoutProps {
  roleKey: 'Admin' | 'Content Manager' | 'Consultant' | 'Admission Official';
}

export function StaffLayout({ roleKey }: StaffLayoutProps) {
  const { user, logout, activeRole, switchToRole, getAccessibleRoles, isContentManagerLeader } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get current route for active state
  const getCurrentRoute = () => {
    const path = location.pathname.split('/').pop();
    return path || 'dashboard';
  };

  // Define navigation for all roles - CENTRALIZED
  const roleNavigations: RoleNavigations = {
    Admin: [
      { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
      { id: 'templates', label: 'Mẫu Câu Hỏi Trả Lời', icon: MessageSquareText, path: '/admin/templates' },
      { id: 'users', label: 'Quản Lý Người Dùng', icon: Users, path: '/admin/users' },
      { id: 'profile', label: user?.name || 'Hồ Sơ', icon: User, path: '/admin/profile' },
    ],
    'Content Manager': [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard, path: '/content/dashboard', permission: "Content Manager" },
      { id: "articles", label: "Danh Sách Bài Viết", icon: FileText, path: '/content/articles', permission: "Content Manager" },
      { id: "editor", label: "Bài Viết Mới", icon: PenSquare, path: '/content/editor', permission: "Content Manager" },
      ...(isContentManagerLeader?.() ? [
        { id: "review", label: "Hàng Đợi Duyệt Bài", icon: ListChecks, path: "/content/review", permission: "Content Manager" }
      ] : []),
      { id: "profile", label: user?.name || "Hồ Sơ", icon: User, path: '/content/profile', permission: "Student" },
    ],
    'Admission Official': [
      { id: 'students', label: 'Danh Sách Học Sinh', icon: Users, path: '/admission/students' },
      { id: 'request-queue', label: 'Hàng Đợi Yêu Cầu', icon: Clock, path: '/admission/request-queue' },
      { id: 'consultation', label: 'Tư Vấn Trực Tiếp', icon: MessageCircle, path: '/admission/consultation' },
      { id: 'knowledge-base', label: 'Cơ Sở Tri Thức', icon: BookOpen, path: '/admission/knowledge-base' },
      { id: 'profile', label: user?.name || 'Hồ Sơ', icon: User, path: '/admission/profile' },
    ],
    Consultant: [
      { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/consultant/overview' },
      { id: 'analytics', label: 'Phân Tích Chatbot', icon: TrendingUp, path: '/consultant/analytics' },
      { id: 'trainingdata', label: 'Dữ Liệu Huấn Luyện', icon: Database, path: '/consultant/trainingdata' },
      { id: 'intents', label: 'Quản Lý Danh Mục', icon: Tag, path: '/consultant/intents' },
      ...(user?.isLeader ? [
        { id: 'leader', label: 'Duyệt Cơ Sở Tri Thức', icon: Shield, path: '/consultant/leader' }
      ] : []),
      { id: 'profile', label: user?.name || 'Hồ Sơ', icon: User, path: '/consultant/profile' }
    ]
  };

  // Get current navigation based on active role
  const currentNavigation = roleNavigations[activeRole || ''] || roleNavigations[roleKey] || [];

  // Get accessible roles for role switching
  const accessibleRoles = getAccessibleRoles();

  // Role labels and icons for switching buttons - CENTRALIZED
  const roleLabels = {
    Admin: { label: 'Quản Trị Viên', icon: Shield, color: 'bg-red-100 text-red-700 border-red-200' },
    'Content Manager': { label: 'Quản Lý Nội Dung', icon: FileEdit, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'Admission Official': { label: 'Cán Bộ Tuyển Sinh', icon: GraduationCap, color: 'bg-green-100 text-green-700 border-green-200' },
    Consultant: { label: 'Tư Vấn Viên', icon: TrendingUp, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    Parent: { label: 'Phụ Huynh', icon: User, color: 'bg-gray-100 text-gray-700 border-gray-200' }
  };

  // Handle role switching
  const handleRoleSwitch = (role: string) => {
    switchToRole(role as any);
    // Navigate to the main dashboard of the switched role
    const navigation = roleNavigations[role];
    if (navigation && navigation.length > 0) {
      navigate(navigation[0].path);
    }
  };

  return (
    <div className={`flex min-h-screen ${STAFF_COLORS.pageBackground}`}>
      {/* Sidebar */}
      <div className={`w-64 ${getSidebarClasses(false)} min-h-screen shadow-sm flex flex-col`}>
        {/* Logo Section */}
        <div className={`p-4 ${STAFF_COLORS.brand.border} border-b flex-shrink-0`}>
          <div className="flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/vi/thumb/2/2d/Logo_Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_FPT.svg/1200px-Logo_Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_FPT.svg.png"
              alt="FPTU Logo"
              className="w-full h-auto object-contain max-h-16"
            />
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-4 flex-grow overflow-y-auto">
          {/* Current Role Pages */}
          <div className="space-y-1">
            <h3 className={`px-3 text-xs ${STAFF_COLORS.sectionHeader.font} ${STAFF_COLORS.sectionHeader.text} uppercase tracking-wider mb-3`}>
              {roleLabels[activeRole || roleKey]?.label || 'Pages'}
            </h3>
            {currentNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = getCurrentRoute() === item.id;
              // Since we're in a role-specific layout, all items in that layout should be accessible
              const allowed = true;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={getNavigationClasses(isActive, false)}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Role Switching Buttons */}
          {accessibleRoles.length > 1 && (
            <div className={`space-y-2 border-t ${STAFF_COLORS.divider.border} pt-4`}>
              <h3 className={`px-3 text-xs ${STAFF_COLORS.sectionHeader.font} ${STAFF_COLORS.sectionHeader.text} uppercase tracking-wider mb-3`}>
                Chuyển Vai Trò
              </h3>
              {accessibleRoles.map((role) => {
                const roleInfo = roleLabels[role];
                if (!roleInfo) return null;

                const Icon = roleInfo.icon;
                const isCurrentRole = role === (activeRole || roleKey);

                return (
                  <button
                    key={role}
                    onClick={() => !isCurrentRole && handleRoleSwitch(role)}
                    className={getRoleSwitchingClasses(isCurrentRole)}
                    disabled={isCurrentRole}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{roleInfo.label}</span>
                  </button>
                );
              }).filter(Boolean)}
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className={`p-4 border-t ${STAFF_COLORS.divider.border} flex-shrink-0`}>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50"
            onClick={() => {
              if (confirm('Bạn có chắc muốn đăng xuất?')) {
                logout();
              }
            }}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
