import { Card, CardContent, CardHeader, CardTitle } from '../../ui/system_users/card';
import PropTypes from 'prop-types';

export function UserStats({ users }) {

  const staffCount = users.filter(u => u.permissions && u.permissions.length > 0).length;

  const customerCount = users.filter(u => 
    u.role_id === 5 || !u.permissions || u.permissions.length === 0
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Nhân Viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{staffCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Khách Hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{customerCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}

UserStats.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
};