import { MoreVertical, Edit, Mail, User, Ban, UserCheck } from 'lucide-react';
import { Button } from '../../ui/system_users/button';
import { Badge } from '../../ui/system_users/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/system_users/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/system_users/dropdown-menu';
import { Card } from '../../ui/system_users/card';
import PropTypes from 'prop-types';

const getRoleLabel = (role) => {
  const labelMap = {
    SYSTEM_ADMIN: 'Quản Trị Viên',
    ADMIN: 'Quản Trị Viên',
    CONTENT_MANAGER: 'Quản Lý Nội Dung',
    ADMISSION_OFFICER: 'Nhân Viên Tuyển Sinh',
    CONSULTANT: 'Tư Vấn Viên',
    CUSTOMER: 'Khách Hàng',
    STUDENT: 'Sinh Viên',
    PARENT: 'Phụ Huynh',
  };

  if (labelMap[role]) {
    return labelMap[role];
  }

  return role
    ? role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    : 'Không xác định';
};

export function UserTable({ 
  users, 
  onEdit, 
  onBanUser,
  loading,
  isCustomerSection = false,
  showActions = true,
}) {
  const isAdminUser = (user) => {
    return user.permissions && user.permissions.includes('admin');
  };

  if (users.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Không tìm thấy người dùng.</p>
          <p className="text-sm">Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Người Dùng</TableHead>
            <TableHead className="w-[25%]">Trạng Thái</TableHead>
            {showActions && <TableHead className="text-right w-[25%]">Thao Tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="w-[50%]">
                <div className="flex items-center gap-3">
                  <div>
                    <div>{user.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-[25%]">
                <Badge 
                  variant={user.status === 'active' ? 'default' : 'secondary'}
                  className={user.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                >
                  {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right w-[25%]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {}
                      {!isCustomerSection && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(user)} disabled={loading}>
                          <Edit className="h-4 w-4 mr-2" />Chỉnh Sửa</DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => user.status === 'active' ? onBanUser(user.id, false) : onBanUser(user.id, true)} 
                        disabled={loading || isAdminUser(user)}
                        className={
                          isAdminUser(user) 
                            ? "text-gray-400 cursor-not-allowed" 
                            : user.status === 'active' 
                              ? "text-orange-600" 
                              : "text-green-600"
                        }
                      >
                        {user.status === 'active' ? (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            {isAdminUser(user) ? 'Không thể vô hiệu Admin' : 'Vô Hiệu Hóa (Cấm)'}
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {isAdminUser(user) ? 'Không thể kích hoạt Admin' : 'Kích Hoạt (Bỏ cấm)'}
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

UserTable.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    permissions: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string.isRequired,
    lastActive: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    isBanned: PropTypes.bool,
    banReason: PropTypes.string,
  })).isRequired,
  onEdit: PropTypes.func,
  onBanUser: PropTypes.func,
  loading: PropTypes.bool,
  isCustomerSection: PropTypes.bool,
  showActions: PropTypes.bool,
};