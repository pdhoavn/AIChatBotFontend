import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/system_users/button';
import { Input } from '../../ui/system_users/input';
import { Label } from '../../ui/system_users/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/system_users/dialog';
import { RoleSelector } from '../RoleSelector';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { loadPermissions } from '../../../constants/permissions';
import { API_CONFIG } from '../../../config/api.js';

const translatePermission = (permissionName) => {
  const translations = {
    'admin': 'Quản Trị Viên',
    'consultant': 'Quản Trị Viên',
    'content_manager': 'Quản Lý Nội Dung',
    'content manager': 'Quản Lý Nội Dung',
    'admission_official': 'Cán Bộ Tuyển Sinh',
    'admission official': 'Cán Bộ Tuyển Sinh',
    'customer': 'Khách Hàng',
    'student': 'Học Sinh',
    'parent': 'Phụ Huynh'
  };
  
  const key = permissionName.toLowerCase().replace(/\s+/g, '_');
  return translations[key] || translations[permissionName.toLowerCase()] || permissionName;
};

const getAvailablePermissions = async () => {
  const permissions = await loadPermissions();
  return permissions.map(p => p.permission_name.toLowerCase().replace(/\s+/g, '_'));
};

const getPermissionLabels = async () => {
  const permissions = await loadPermissions();
  const labels = {};
  permissions.forEach(p => {
    const key = p.permission_name.toLowerCase().replace(/\s+/g, '_');
    labels[key] = translatePermission(p.permission_name);
  });
  return labels;
};

const getPermissionNameToId = async () => {
  const permissions = await loadPermissions();
  const mapping = {};
  permissions.forEach(p => {
    const key = p.permission_name.toLowerCase().replace(/\s+/g, '_');
    mapping[key] = p.permission_id;
  });
  return mapping;
};

export function UserFormDialog({
  isOpen,
  onClose,
  editingUser,
  formData,
  onFormChange,
  onSubmit,
  onUserUpdated
}) {
  const [permissionsToRevoke, setPermissionsToRevoke] = useState([]);
  const [permissionsToGrant, setPermissionsToGrant] = useState([]);
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [availableToGrant, setAvailableToGrant] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const [permissionLabels, setPermissionLabels] = useState({});
  const [permissionNameToId, setPermissionNameToId] = useState({});
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  useEffect(() => {
    const loadPermissionsData = async () => {
      try {
        setLoadingPermissions(true);
        await loadPermissions();
        
        const [labels, nameToId] = await Promise.all([
          getPermissionLabels(),
          getPermissionNameToId()
        ]);
        
        setPermissionLabels(labels);
        setPermissionNameToId(nameToId);
        setPermissionsLoaded(true);
      } catch (error) {
        toast.error('Không thể tải dữ liệu quyền hạn');
      } finally {
        setLoadingPermissions(false);
      }
    };

    if (isOpen && !permissionsLoaded) {
      loadPermissionsData();
    }
  }, [isOpen, permissionsLoaded]);

  const getRevokablePermissions = (permissions) => {
    return permissions.filter(perm => perm !== 'admin' && perm !== 'customer');
  };

  const fetchUserPermissions = async (userId) => {
    if (!userId) return;
    
    try {
      setLoadingPermissions(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

  const baseUrl = API_CONFIG.FASTAPI_BASE_URL;

      const allPermissionsResponse = await fetch(`${baseUrl}/users/permissions`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!allPermissionsResponse.ok) {
        throw new Error(`Không thể tải danh sách quyền hệ thống: ${allPermissionsResponse.status}`);
      }

      const allSystemPermissions = await allPermissionsResponse.json();

      const allPermissionNames = allSystemPermissions.map(p => {
        const name = p.permission_name?.toLowerCase().replace(/\s+/g, '_');
        return name;
      });

      const userResponse = await fetch(`${baseUrl}/users/staffs`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Không thể tải danh sách người dùng: ${userResponse.status}`);
      }

      const staffUsers = await userResponse.json();

      const user = staffUsers.find(u => 
        u.user_id?.toString() === userId?.toString() || 
        u.id?.toString() === userId?.toString()
      );
      
      if (!user) {
        throw new Error('Không tìm thấy người dùng trong danh sách nhân viên');
      }

      let currentPermissionNames = [];
      
      if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
        currentPermissionNames = user.permissions.map(p => {
          const name = p.permission_name?.toLowerCase().replace(/\s+/g, '_');
          return name;
        }).filter(Boolean);
      }

      let availablePermissionNames = allPermissionNames.filter(perm => {

        if (currentPermissionNames.includes(perm)) return false;

        if (editingUser && (perm === 'admin' || perm === 'customer')) return false;

        if (perm === 'customer') return false;
        return true;
      });

      setCurrentPermissions(currentPermissionNames);
      setAvailableToGrant(availablePermissionNames);
      
    } catch (error) {
      toast.error(`Không thể tải quyền hạn người dùng: ${error.message}`);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (isOpen && editingUser) {
      setPermissionsToRevoke([]);
      setPermissionsToGrant([]);

      fetchUserPermissions(editingUser.id);
    } else {
      setPermissionsToRevoke([]);
      setPermissionsToGrant([]);
      setCurrentPermissions([]);
      setAvailableToGrant([]);
    }
  }, [isOpen, editingUser]);

  const handleNameChange = (e) => {
    onFormChange({ ...formData, name: e.target.value });
  };

  const handleEmailChange = (e) => {
    onFormChange({ ...formData, email: e.target.value });
  };

  const handlePasswordChange = (e) => {
    onFormChange({ ...formData, password: e.target.value });
  };

  const handlePhoneChange = (e) => {
    onFormChange({ ...formData, phone_number: e.target.value });
  };

  const handleRoleChange = (role) => {
    onFormChange({ ...formData, role });
  };

  const handleConsultantLeaderChange = (e) => {
    onFormChange({ ...formData, consultant_is_leader: e.target.checked });
  };

  const handleContentManagerLeaderChange = (e) => {
    onFormChange({ ...formData, content_manager_is_leader: e.target.checked });
  };

  const handleRevokePermissionToggle = (permission) => {

    if (permission === 'admin' || permission === 'customer') {
      return;
    }

    if (!permissionsToRevoke.includes(permission)) {

      const currentCount = currentPermissions.length;
      const revokeCount = permissionsToRevoke.length + 1;
      const grantCount = permissionsToGrant.length;
      const remainingCount = currentCount - revokeCount + grantCount;

      if (remainingCount < 1) {
        toast.error('Không thể thu hồi tất cả quyền. Nhân viên phải có ít nhất 1 quyền.');
        return;
      }
    }
    
    setPermissionsToRevoke(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleGrantPermissionToggle = (permission) => {
    setPermissionsToGrant(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)  
        : [...prev, permission]
    );
  };

  const callGrantAPI = async (userId, permissions) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

  const baseUrl = API_CONFIG.FASTAPI_BASE_URL;
      const permissionIds = permissions
        .map(permName => permissionNameToId[permName])
        .filter(id => id !== undefined);

      if (permissionIds.length === 0) {
        return { added: [], skipped: [] };
      }

      const requestBody = {
        user_id: parseInt(userId),
        permission_ids: permissionIds,
        consultant_is_leader: false,
        content_manager_is_leader: false
      };

      const response = await fetch(`${baseUrl}/users/permissions/grant`, {
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
          errorMessage = parsedError.detail || `Không thể cấp quyền: HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `Không thể cấp quyền: HTTP ${response.status}: ${errorData}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      throw error;
    }
  };

  const callRevokeAPI = async (userId, permissions) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

  const baseUrl = API_CONFIG.FASTAPI_BASE_URL;
      
      const permissionIds = permissions
        .map(permName => {
          const id = permissionNameToId[permName];
          return id;
        })
        .filter(id => id !== undefined);

      if (permissionIds.length === 0) {
        const availablePerms = Object.keys(permissionNameToId).join(', ');
        throw new Error(`Không tìm thấy ID quyền hợp lệ. Đã thử thu hồi: [${permissions.join(', ')}]. Quyền có sẵn: [${availablePerms}]`);
      }

      const requestBody = {
        user_id: parseInt(userId),
        permission_ids: permissionIds
      };

      const response = await fetch(`${baseUrl}/users/permissions/revoke`, {
        method: 'DELETE',
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
          errorMessage = parsedError.detail || `Không thể thu hồi quyền: HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `Không thể thu hồi quyền: HTTP ${response.status}: ${errorData}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingUser) {

      onSubmit(e);
      return;
    }

    try {
      const userId = editingUser.id;
      let results = [];

      const finalPermissionCount = currentPermissions.length - permissionsToRevoke.length + permissionsToGrant.length;
      if (finalPermissionCount < 1) {
        toast.error('Không thể lưu thay đổi. Nhân viên phải có ít nhất 1 quyền.');
        return;
      }

      if (permissionsToRevoke.length > 0) {
        const revokeResult = await callRevokeAPI(userId, permissionsToRevoke);
        results.push(`Đã thu hồi: ${revokeResult.removed?.length || 0} quyền`);
        if (revokeResult.skipped?.length > 0) {
          results.push(`Bỏ qua thu hồi: ${revokeResult.skipped.length} quyền`);
        }
      }

      if (permissionsToGrant.length > 0) {
        const grantResult = await callGrantAPI(userId, permissionsToGrant);
        results.push(`Đã cấp: ${grantResult.added?.length || 0} quyền`);
        if (grantResult.skipped?.length > 0) {
          results.push(`Bỏ qua cấp: ${grantResult.skipped.length} quyền`);
        }
      }

      const hasBasicChanges = 
        formData.name !== editingUser.name ||
        formData.email !== editingUser.email ||
        formData.phone_number !== editingUser.phone_number ||
        (formData.password && formData.password.trim() !== '');

      if (hasBasicChanges) {

        await onSubmit(e);
        results.push('Đã cập nhật thông tin cơ bản');
      }

      if (results.length > 0) {
        toast.success(`Cập nhật người dùng thành công! ${results.join(', ')}`);
      } else {
        toast.info('Không có thay đổi nào');
      }

      if (onUserUpdated) {
        await onUserUpdated();
      }

      onClose();

    } catch (error) {

      if (error.message && error.message.includes('live chat queue')) {
        toast.error(`⚠️ ${error.message}`, { autoClose: 8000 });
      } else if (error.message && error.message.includes('Foreign')) {
        toast.error('⚠️ Không thể xóa quyền: Người dùng này có dữ liệu liên quan trong hệ thống. Vui lòng kiểm tra các yêu cầu live chat hoặc dữ liệu khác.', { autoClose: 8000 });
      } else {
        toast.error(`Không thể cập nhật người dùng: ${error.message}`, { autoClose: 5000 });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
          </DialogTitle>
        </DialogHeader>

        {}
        {!permissionsLoaded && loadingPermissions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Đang tải quyền...</span>
          </div>
        ) : (
        <>
        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và Tên</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={handleNameChange}
                placeholder="Nhập họ và tên"
                minLength={2}
                maxLength={100}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={handleEmailChange}
                placeholder="Nhập email"
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                title="Vui lòng nhập địa chỉ email hợp lệ"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {editingUser ? 'Mật Khẩu Mới (tùy chọn)' : 'Mật Khẩu'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ''}
                onChange={handlePasswordChange}
                placeholder={editingUser ? 'Để trống nếu giữ nguyên mật khẩu hiện tại' : 'Nhập mật khẩu'}
                minLength={6}
                maxLength={100}
                title="Mật khẩu phải có ít nhất 6 ký tự"
                required={!editingUser}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Số Điện Thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone_number || ''}
                onChange={handlePhoneChange}
                placeholder="Nhập số điện thoại (VD: 0912345678)"
                pattern="0\d{9,10}"
                title="Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0"
              />
            </div>
          </div>

          {}
          {!editingUser && (
            <>
              <div className="space-y-2">
                <Label>Vai Trò</Label>
                <RoleSelector
                  selectedRole={formData.role || ''}
                  onRoleChange={handleRoleChange}
                />
              </div>

              {}
              {(formData.role === 'CONSULTANT' || 
                (editingUser && currentPermissions.includes('consultant'))) && (
                <div className="space-y-2 pl-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consultant_is_leader || false}
                      onChange={handleConsultantLeaderChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Giám Sát</span>
                  </label>
                </div>
              )}

              {}
              {(formData.role === 'CONTENT_MANAGER' || 
                (editingUser && (currentPermissions.includes('content_manager') || currentPermissions.includes('content manager')))) && (
                <div className="space-y-2 pl-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.content_manager_is_leader || false}
                      onChange={handleContentManagerLeaderChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Giám Sát</span>
                  </label>
                </div>
              )}
            </>
          )}

          {}
          {editingUser && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold">Quản Lý Quyền</h3>
              
              {loadingPermissions ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Đang tải quyền người dùng...</p>
                </div>
              ) : (
                <>
                  {}
                  {currentPermissions.length > 0 ? (
                    <div className="space-y-3">
                      {}
                      {currentPermissions.includes('admin') && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-blue-600">
                            Quyền Quản Trị Viên (Không thể thu hồi khi chỉnh sửa):
                          </Label>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <span className="text-sm text-blue-800 flex items-center">
                              <span className="mr-2">🔒</span>
                              {permissionLabels['admin'] || 'Admin'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {}
                      {getRevokablePermissions(currentPermissions).length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-red-600">
                            Quyền Hiện Tại (chọn để thu hồi):
                          </Label>
                          <div className="grid grid-cols-2 gap-2 p-3 bg-red-50 border border-red-200 rounded">
                            {getRevokablePermissions(currentPermissions).map(permission => (
                              <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={permissionsToRevoke.includes(permission)}
                                  onChange={() => handleRevokePermissionToggle(permission)}
                                  className="rounded border-red-300"
                                />
                                <span className="text-sm text-red-800">
                                  {permissionLabels[permission] || permission}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Không tìm thấy quyền hiện tại cho người dùng này.
                    </div>
                  )}

                  {}
                  {availableToGrant.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-green-600">
                        Quyền Có Sẵn (chọn để cấp):
                      </Label>
                      <div className="grid grid-cols-2 gap-2 p-3 bg-green-50 border border-green-200 rounded">
                        {availableToGrant.map(permission => (
                          <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissionsToGrant.includes(permission)}
                              onChange={() => handleGrantPermissionToggle(permission)}
                              className="rounded border-green-300"
                            />
                            <span className="text-sm text-green-800">
                              {permissionLabels[permission] || permission}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {}
                  <div className="text-sm text-gray-600">
                    {permissionsToRevoke.length > 0 && (
                      <p>Sẽ thu hồi: {permissionsToRevoke.map(p => permissionLabels[p] || p).join(', ')}</p>
                    )}
                    {permissionsToGrant.length > 0 && (
                      <p>Sẽ cấp: {permissionsToGrant.map(p => permissionLabels[p] || p).join(', ')}</p>
                    )}
                    {permissionsToRevoke.length === 0 && permissionsToGrant.length === 0 && (
                      <p>Không có thay đổi quyền nào được chọn</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" onClick={handleSubmit} className="bg-[#EB5A0D] hover:bg-[#d14f0a] text-white">
            {editingUser ? 'Cập Nhật Người Dùng' : 'Tạo Người Dùng'}
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}

UserFormDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingUser: PropTypes.object,
  formData: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onUserUpdated: PropTypes.func,
};

export default UserFormDialog;