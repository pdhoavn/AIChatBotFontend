import { Label } from '../ui/system_users/label';
import PropTypes from 'prop-types';

export function RoleSelector({ selectedRole, onRoleChange, isEditing = false }) {
  const roles = [
    {
      id: 'SYSTEM_ADMIN',
      label: 'Quản Trị Hệ Thống',
      color: 'text-red-500'
    },
    {
      id: 'CONTENT_MANAGER',
      label: 'Quản Lý Nội Dung',
      color: 'text-blue-500'
    },
    {
      id: 'CONSULTANT',
      label: 'Tư Vấn Viên',
      color: 'text-green-500'
    },
    {
      id: 'ADMISSION_OFFICER',
      label: 'Nhân Viên Tuyển Sinh',
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Vai Trò Tài Khoản</Label>
      </div>
      
      <div className="space-y-3">
        {roles.map((role) => {
          return (
            <div key={role.id} className="flex items-start space-x-3">
              <input
                type="radio"
                id={`role-${role.id}`}
                name="role"
                value={role.id}
                checked={selectedRole === role.id}
                onChange={(e) => onRoleChange(e.target.value)}
                disabled={isEditing}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <Label 
                htmlFor={`role-${role.id}`} 
                className={`flex-1 cursor-pointer ${isEditing ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{role.label}</span>
                </div>
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

RoleSelector.propTypes = {
  selectedRole: PropTypes.string,
  onRoleChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};