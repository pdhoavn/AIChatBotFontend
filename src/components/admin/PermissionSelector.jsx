import { Settings, Crown, Plus, Minus, Check, X, FileText, MessageCircle, GraduationCap, User } from 'lucide-react';
import { Label } from '../ui/system_users/label';
import { Checkbox } from '../ui/system_users/checkbox';
import { Button } from '../ui/system_users/button';
import { Badge } from '../ui/system_users/badge';
import { Separator } from '../ui/system_users/separator';
import PropTypes from 'prop-types';

export function PermissionSelector({ role, selectedPermissions, onPermissionsChange, isEditing = false }) {

  const availableRolePermissions = [
    {
      id: 'SYSTEM_ADMIN',
      name: 'Quản Trị Hệ Thống',
      description: 'Toàn quyền quản trị hệ thống - quản lý người dùng, cài đặt hệ thống, tất cả các mô-đun',
      icon: Crown,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      id: 'CONTENT_MANAGER',
      name: 'Quản Lý Nội Dung',
      description: 'Tạo và quản lý nội dung - bài viết, đánh giá, xuất bản',
      icon: FileText,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'CONSULTANT',
      name: 'Tư Vấn Viên',
      description: 'Dịch vụ tư vấn - phân tích, cơ sở tri thức, mẫu câu hỏi trả lời',
      icon: MessageCircle,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'ADMISSION_OFFICER',
      name: 'Nhân Viên Tuyển Sinh',
      description: 'Quản lý tuyển sinh khách hàng - tư vấn, quản lý hàng đợi, thông tin chi tiết',
      icon: GraduationCap,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'CUSTOMER',
      name: 'Truy Cập Khách Hàng',
      description: 'Quyền khách hàng cơ bản - truy cập hồ sơ, tính năng giới hạn',
      icon: User,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  ];

  const handlePermissionToggle = (permissionId) => {
    const currentPermissions = selectedPermissions || [];
    const isSelected = currentPermissions.includes(permissionId);

    let newPermissions;
    if (isSelected) {

      newPermissions = currentPermissions.filter(p => p !== permissionId);
    } else {

      newPermissions = [...currentPermissions, permissionId];
    }

    onPermissionsChange(newPermissions);
  };

  const selectAllPermissions = () => {
    const allPermissions = availableRolePermissions.map(p => p.id);
    onPermissionsChange(allPermissions);
  };

  const clearAllPermissions = () => {
    onPermissionsChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Quyền Vai Trò
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllPermissions}
            className="text-xs border-[#EB5A0D] text-[#EB5A0D] hover:bg-[#FFF8F3]"
          >
            <Plus className="h-3 w-3 mr-1" />Tất Cả</Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllPermissions}
            className="text-xs border-[#EB5A0D] text-[#EB5A0D] hover:bg-[#FFF8F3]"
          >
            <Minus className="h-3 w-3 mr-1" />Xóa</Button>
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <div className="font-medium mb-1">Quyền Dựa Trên Vai Trò</div>
        <div>Mỗi quyền cấp toàn quyền truy cập vào khả năng của vai trò đó. Người dùng có thể có nhiều quyền vai trò để truy cập các khu vực khác nhau của hệ thống.</div>
      </div>

      <Separator />

      {}
      {role && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Vai Trò Chính</div>
          <div className="text-xs text-gray-600">
            Vai trò chính của người dùng này là <span className="font-medium">{role}</span>.
            Các quyền bổ sung bên dưới cấp quyền truy cập vào khả năng của vai trò khác.
          </div>
        </div>
      )}

      {}
      <div className="grid gap-3">
        {availableRolePermissions.map((permission) => {
          const isSelected = selectedPermissions?.includes(permission.id);
          const Icon = permission.icon;
          const isPrimaryRole = role === permission.id;

          return (
            <div
              key={permission.id}
              className={`border rounded-lg p-4 transition-all ${isSelected
                ? `${permission.color} border-2`
                : 'border-gray-200 hover:border-gray-300'
                } ${isPrimaryRole ? 'ring-2 ring-blue-200' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{permission.name}</span>
                    {isPrimaryRole && (
                      <Badge variant="outline" className="text-xs">
                        Vai Trò Chính
                      </Badge>
                    )}
                    {isSelected && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {permission.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {}
      {selectedPermissions && selectedPermissions.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-2">
            Quyền Đã Chọn ({selectedPermissions.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedPermissions.map((permId) => {
              const permission = availableRolePermissions.find(p => p.id === permId);
              return permission ? (
                <Badge key={permId} variant="secondary" className="text-xs">
                  {permission.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {}
      {(!selectedPermissions || selectedPermissions.length === 0) && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <div className="text-sm text-amber-800">
            <X className="h-4 w-4 inline mr-1" />
            Không có quyền bổ sung nào được chọn. Người dùng sẽ chỉ có quyền truy cập vào khả năng vai trò chính của họ.
          </div>
        </div>
      )}
    </div>
  );
}

PermissionSelector.propTypes = {
  role: PropTypes.string,
  selectedPermissions: PropTypes.arrayOf(PropTypes.string),
  onPermissionsChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};
