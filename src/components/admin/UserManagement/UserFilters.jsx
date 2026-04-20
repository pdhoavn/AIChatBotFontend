import { Search } from 'lucide-react';
import { Input } from '../../ui/system_users/input';
import PropTypes from 'prop-types';

export function UserFilters({ 
  searchQuery, 
  onSearchChange
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm người dùng..."
          className="pl-10"
        />
      </div>
    </div>
  );
}

UserFilters.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};