import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../../ui/system_users/scroll-area';
import { UserManagementHeader } from './UserManagementHeader';
import { UserFilters } from './UserFilters';
import { UserStats } from './UserStats';
import { UserFormDialog } from './UserFormDialog';
import { UserTable } from './UserTable';
import { toast } from 'react-toastify';
import { loadPermissions } from '../../../constants/permissions';
import { rolesAPI } from '../../../services/fastapi';
import { API_CONFIG } from '../../../config/api.js';

let ROLE_ID_TO_NAME = {};
let ROLE_NAME_TO_FRONTEND = {};

let PERMISSION_NAME_TO_ID = {};
let PERMISSION_ID_TO_NAME = {};

const transformUserData = (apiUser) => {

  let roleName;
  if (apiUser.role_name) {

    roleName = ROLE_NAME_TO_FRONTEND[apiUser.role_name] || apiUser.role_name.toUpperCase().replace(/ /g, '_');
  } else if (apiUser.role_id && ROLE_ID_TO_NAME[apiUser.role_id]) {

    const dbRoleName = ROLE_ID_TO_NAME[apiUser.role_id];
    roleName = ROLE_NAME_TO_FRONTEND[dbRoleName] || dbRoleName.toUpperCase().replace(/ /g, '_');
  } else {

    roleName = 'CUSTOMER';
  }

  let permissions = [];
  
  if (apiUser.permissions && Array.isArray(apiUser.permissions) && apiUser.permissions.length > 0) {

    permissions = apiUser.permissions.map(perm => {
      if (typeof perm === 'object' && perm.permission_name) {

        const name = perm.permission_name.toLowerCase();
        if (name === 'admin' || name === 'system_admin') return 'admin';
        if (name === 'consultant') return 'consultant';
        if (name === 'content_manager' || name === 'contentmanager') return 'content_manager';
        if (name === 'admission_officer' || name === 'admission_official') return 'admission_officer';
        return name;
      } else if (typeof perm === 'object' && perm.permission_id) {
        return PERMISSION_ID_TO_NAME[perm.permission_id] || 'customer';
      } else if (typeof perm === 'string') {

        return perm.toLowerCase().replace('system_admin', 'admin');
      } else if (typeof perm === 'number') {
        return PERMISSION_ID_TO_NAME[perm] || 'customer';
      }
      return null;
    }).filter(Boolean);

    permissions = Array.from(new Set(permissions));
  }

  const customerRoles = ['CUSTOMER', 'STUDENT', 'PARENT'];
  if (permissions.length === 0 && !customerRoles.includes(roleName)) {
    permissions = [roleName.toLowerCase().replace('system_admin', 'admin')];
  }
  
  return {
    id: apiUser.user_id?.toString() || Date.now().toString(),
    name: apiUser.full_name || 'Unknown User',
    username: apiUser.email?.split('@')[0] || 'unknown',
    email: apiUser.email || '',
    role: roleName,
    permissions: permissions,
    status: apiUser.status ? 'active' : 'inactive',
    phone_number: apiUser.phone_number || '',
    lastActive: 'Recently',
    createdAt: new Date().toISOString().split('T')[0],
    isBanned: !apiUser.status,
    banReason: !apiUser.status ? 'Banned by admin' : null,
    consultant_is_leader: apiUser.consultant_is_leader || false,
    content_manager_is_leader: apiUser.content_manager_is_leader || false,
  };
};

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [staffPage, setStaffPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    permissions: [],
    phone_number: '',
    interest_desired_major: '',
    interest_region: '',
    consultant_is_leader: false,
    content_manager_is_leader: false,
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const initializePermissions = async () => {
      try {
        const permissions = await loadPermissions();

        const nameToId = {};
        const idToName = {};
        
        permissions.forEach(p => {
          const key = p.permission_name.toLowerCase().replace(/\s+/g, '_');
          nameToId[key] = p.permission_id;
          idToName[p.permission_id] = key;

          nameToId[p.permission_name.toUpperCase().replace(/\s+/g, '_')] = p.permission_id;
        });

        PERMISSION_NAME_TO_ID = nameToId;
        PERMISSION_ID_TO_NAME = idToName;
      } catch (error) {
        toast.error('Không thể tải dữ liệu quyền hạn');
      }
    };

    const initializeRoles = async () => {
      try {
        const roles = await rolesAPI.getAll();

        const idToName = {};
        const nameToFrontend = {};
        
        roles.forEach(r => {
          idToName[r.role_id] = r.role_name;

          let frontendName = r.role_name.toUpperCase().replace(/\s+/g, '_');

          if (r.role_name === 'Admin' || r.role_name === 'System Admin') {
            frontendName = 'SYSTEM_ADMIN';
          } else if (r.role_name === 'Consultant') {
            frontendName = 'CONSULTANT';
          } else if (r.role_name === 'Content Manager') {
            frontendName = 'CONTENT_MANAGER';
          } else if (r.role_name === 'Admission Official') {
            frontendName = 'ADMISSION_OFFICER';
          } else if (r.role_name === 'Student') {
            frontendName = 'STUDENT';
          } else if (r.role_name === 'Parent') {
            frontendName = 'PARENT';
          } else if (r.role_name === 'Customer') {
            frontendName = 'CUSTOMER';
          }

          nameToFrontend[r.role_name] = frontendName;
        });

        ROLE_ID_TO_NAME = idToName;
        ROLE_NAME_TO_FRONTEND = nameToFrontend;
      } catch (error) {
        toast.error('Không thể tải dữ liệu vai trò');
      }
    };

    const initialize = async () => {
      await Promise.all([initializePermissions(), initializeRoles()]);

      fetchUsers();
    };
    
    initialize();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp < currentTime) {
        toast.error('Token xác thực đã hết hạn. Vui lòng đăng nhập lại.');
        setUsers([]);
        setLoading(false);
        return;
      }
    } catch (e) {
      toast.error('Token xác thực không hợp lệ. Vui lòng đăng nhập lại.');
      setUsers([]);
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const tokenType = localStorage.getItem('token_type') || 'bearer';
    const baseUrl = API_CONFIG.FASTAPI_BASE_URL;

      const authHeader = `Bearer ${token}`;

      const [staffResponse, customersResponse] = await Promise.all([
        fetch(`${baseUrl}/users/staffs`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': authHeader
          }
        }),
        fetch(`${baseUrl}/users/students`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': authHeader
          }
        })
      ]);

      if (!staffResponse.ok) {
        const errorData = await staffResponse.text();
        
        let errorMessage;
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.detail || `HTTP ${staffResponse.status}: ${staffResponse.statusText}`;

          if (staffResponse.status === 403 && parsedError.detail === "Admin permission required") {
            errorMessage = "Access denied: Admin permissions required. Current user role may not have sufficient privileges.";
          }
        } catch (parseError) {
          errorMessage = `HTTP ${staffResponse.status}: ${errorData || staffResponse.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const staffData = await staffResponse.json();
      const customersData = customersResponse.ok ? await customersResponse.json() : [];

      const allUsers = [];
      
      if (Array.isArray(staffData)) {
        const transformedStaff = staffData.map(transformUserData);
        allUsers.push(...transformedStaff);
      }
      
      if (Array.isArray(customersData)) {
        const transformedCustomers = customersData.map(transformUserData);
        allUsers.push(...transformedCustomers);
      }
      
      setUsers(allUsers);

    } catch (err) {
      toast.error(`Không thể tải người dùng: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

  const baseUrl = API_CONFIG.FASTAPI_BASE_URL;

      const response = await fetch(`${baseUrl}/users/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: parseInt(userId)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        
        let errorMessage;
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.detail || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${errorData}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: 'inactive', banReason: 'Banned by admin' }
          : u
      ));
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const unbanUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

  const baseUrl = API_CONFIG.FASTAPI_BASE_URL;

      const response = await fetch(`${baseUrl}/users/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: parseInt(userId)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        
        let errorMessage;
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.detail || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${errorData}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: 'active', banReason: null }
          : u
      ));
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

  const baseUrl = API_CONFIG.FASTAPI_BASE_URL;

      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        
        let errorMessage;
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.detail || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${errorData}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const staffUsers = filteredUsers.filter(user => 
    user.permissions && user.permissions.length > 0
  );
  
  const customerUsers = filteredUsers.filter(user => 
    user.role_id === 5 || !user.permissions || user.permissions.length === 0
  );

  const totalStaffPages = Math.ceil(staffUsers.length / ITEMS_PER_PAGE);
  const totalCustomerPages = Math.ceil(customerUsers.length / ITEMS_PER_PAGE);

  const paginatedStaffUsers = staffUsers.slice(
    (staffPage - 1) * ITEMS_PER_PAGE,
    staffPage * ITEMS_PER_PAGE
  );

  const paginatedCustomerUsers = customerUsers.slice(
    (customerPage - 1) * ITEMS_PER_PAGE,
    customerPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setStaffPage(1);
    setCustomerPage(1);
  }, [searchQuery, sectionFilter]);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ 
      name: '', 
      email: '', 
      password: '',
      role: '', 
      permissions: [], 
      phone_number: '', 
      interest_desired_major: '', 
      interest_region: '',
      consultant_is_leader: false,
      content_manager_is_leader: false,
    });
    setIsDialogOpen(true);
  };

  const handleCreateOrUpdate = async () => {

    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Vui lòng điền tất cả các trường bắt buộc (Tên, Email, Vai trò)');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('Mật khẩu là bắt buộc cho người dùng mới');
      return;
    }
    if (!editingUser && !formData.phone_number) {
      toast.error('Số điện thoại là bắt buộc cho người dùng mới');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Địa chỉ email không hợp lệ');
      return;
    }

    if (formData.phone_number) {
      const phoneRegex = /^0\d{9,10}$/;
      if (!phoneRegex.test(formData.phone_number.replace(/[\s-]/g, ''))) {
        toast.error('Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số bắt đầu bằng 0');
        return;
      }
    }

    if (formData.password && formData.password.trim() !== '') {
      if (formData.password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      if (formData.password.length > 100) {
        toast.error('Mật khẩu không được vượt quá 100 ký tự');
        return;
      }
    }

    if (formData.name.trim().length < 2) {
      toast.error('Tên phải có ít nhất 2 ký tự');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('access_token');
  const baseUrl = API_CONFIG.FASTAPI_BASE_URL;

      if (editingUser) {

        const updatePayload = {
          full_name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number || null,
        };

        if (formData.password && formData.password.trim() !== '') {
          updatePayload.password = formData.password;
        }

        const response = await fetch(`${baseUrl}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatePayload)
        });

        if (!response.ok) {
          const errorData = await response.text();
          let errorMessage;
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.detail || `HTTP ${response.status}`;
          } catch (parseError) {
            errorMessage = `HTTP ${response.status}: ${errorData}`;
          }
          throw new Error(errorMessage);
        }

        const updatedUserData = await response.json();

        setUsers(users.map(u => 
          u.id === editingUser.id 
            ? {
                ...u,
                name: updatedUserData.full_name,
                email: updatedUserData.email,
                phone_number: updatedUserData.phone_number,
                status: updatedUserData.status ? 'active' : 'inactive',
              }
            : u
        ));
        
        toast.success('Cập nhật thông tin người dùng thành công!');
      } else {

        const roleNameToId = {
          'SYSTEM_ADMIN': 1,
          'CONSULTANT': 2,
          'CONTENT_MANAGER': 3,
          'ADMISSION_OFFICER': 4,
        };
        
        const roleId = roleNameToId[formData.role];
        if (!roleId) {
          throw new Error(`Invalid role: ${formData.role}`);
        }

        let permissionIds = [];

        const permissionsResponse = await fetch(`${baseUrl}/users/permissions`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (permissionsResponse.ok) {
          const allPermissions = await permissionsResponse.json();
          
          if (formData.role === 'SYSTEM_ADMIN') {

            permissionIds = allPermissions.map(p => p.permission_id);
          } else {

            const roleToPermissionName = {
              'CONSULTANT': 'Consultant',
              'CONTENT_MANAGER': 'ContentManager',
              'ADMISSION_OFFICER': 'AdmissionOfficial'
            };
            
            const targetPermissionName = roleToPermissionName[formData.role];
            if (targetPermissionName) {
              const matchingPermission = allPermissions.find(p => 
                p.permission_name === targetPermissionName || 
                p.permission_name.replace(/\s+/g, '') === targetPermissionName
              );
              
              if (matchingPermission) {
                permissionIds = [matchingPermission.permission_id];
              }
            }
          }
        }

        const requestBody = {
          full_name: formData.name,
          email: formData.email,
          status: true,
          password: formData.password,
          role_id: roleId,
          permissions: permissionIds,
          phone_number: formData.phone_number || '',
          consultant_is_leader: formData.consultant_is_leader || false,
          content_manager_is_leader: formData.content_manager_is_leader || false,
          interest_desired_major: formData.interest_desired_major || '',
          interest_region: formData.interest_region || ''
        };

        const response = await fetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.text();
          
          let errorMessage;
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.detail || `HTTP ${response.status}`;
          } catch (parseError) {
            errorMessage = `HTTP ${response.status}: ${errorData}`;
          }
          
          throw new Error(errorMessage);
        }

        const newUser = await response.json();

        let assignedPermissions = [];
        if (formData.role === 'SYSTEM_ADMIN') {
          assignedPermissions = ['admin'];
        } else {
          const roleToPermission = {
            'CONSULTANT': 'consultant',
            'CONTENT_MANAGER': 'content_manager',
            'ADMISSION_OFFICER': 'admission_officer'
          };
          const permission = roleToPermission[formData.role];
          if (permission) {
            assignedPermissions = [permission];
          }
        }

        setUsers([...users, {
          id: newUser.user_id?.toString() || Date.now().toString(),
          name: newUser.full_name,
          username: newUser.email?.split('@')[0] || 'user',
          email: newUser.email,
          role: formData.role,
          permissions: assignedPermissions,
          status: 'active',
          phone_number: newUser.phone_number || '',
          lastActive: 'Just now',
          createdAt: new Date().toISOString().split('T')[0],
          isBanned: false,
          banReason: null,
          consultant_is_leader: formData.consultant_is_leader || false,
          content_manager_is_leader: formData.content_manager_is_leader || false,
          interest_desired_major: newUser.interest_desired_major || '',
          interest_region: newUser.interest_region || ''
        }]);
        
        toast.success(`Tạo người dùng thành công với quyền ${assignedPermissions.join(', ')}!`);
      }

      setIsDialogOpen(false);
      await fetchUsers();

    } catch (error) {
      toast.error(`Không thể ${editingUser ? 'cập nhật' : 'tạo'} người dùng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      phone_number: user.phone_number || '',
      interest_desired_major: '',
      interest_region: '',
      consultant_is_leader: user.consultant_is_leader || false,
      content_manager_is_leader: user.content_manager_is_leader || false,
    });
    setIsDialogOpen(true);
  };

  const handleBanUser = async (userId, isCurrentlyBanned) => {
    try {
      setLoading(true);

      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (user.permissions && user.permissions.includes('admin')) {
        toast.error('Không thể cấm người dùng quản trị. Người dùng quản trị có đặc quyền đặc biệt.');
        return;
      }
      
      if (user.status === 'active') {

        await banUser(userId);
        toast.success('Vô hiệu hóa và cấm người dùng thành công');
      } else {

        await unbanUser(userId);
        toast.success('Kích hoạt và bỏ cấm người dùng thành công');
      }
      
    } catch (error) {
      const action = users.find(u => u.id === userId)?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
      toast.error(`Không thể ${action} người dùng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Trước
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded border ${
              currentPage === page
                ? 'bg-orange-500 text-white border-orange-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Sau
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {}
      <div className="border-b px-6 py-4 space-y-4">
        <UserManagementHeader onAddUser={handleAddUser} />

        {}
        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {}
        <div className="flex gap-2">
          <button
            onClick={() => setSectionFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sectionFilter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setSectionFilter('staff')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sectionFilter === 'staff'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Nhân Viên
          </button>
          <button
            onClick={() => setSectionFilter('customer')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sectionFilter === 'customer'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Khách Hàng
          </button>
        </div>

        {}
        {loading && (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm">Đang tải người dùng từ API...</span>
          </div>
        )}

        {}
        <UserStats users={users} />
      </div>

      {}
      <ScrollArea className="flex-1">
        <div className="p-6 pb-8 space-y-8">
          {}
          {(sectionFilter === 'all' || sectionFilter === 'staff') && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Nhân Viên
                </h2>
              </div>
              <UserTable
                users={paginatedStaffUsers}
                onEdit={handleEdit}
                onBanUser={handleBanUser}
                loading={loading}
                isCustomerSection={false}
              />
              <Pagination
                currentPage={staffPage}
                totalPages={totalStaffPages}
                onPageChange={setStaffPage}
              />
            </div>
          )}

          {}
          {(sectionFilter === 'all' || sectionFilter === 'customer') && (
            <div>
              <div className="mb-4 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Khách Hàng
                </h2>
              </div>
              <UserTable
                users={paginatedCustomerUsers}
                onEdit={null}
                onBanUser={handleBanUser}
                loading={loading}
                isCustomerSection={true}
              />
              <Pagination
                currentPage={customerPage}
                totalPages={totalCustomerPages}
                onPageChange={setCustomerPage}
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {}
      <UserFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingUser={editingUser}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleCreateOrUpdate}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
}