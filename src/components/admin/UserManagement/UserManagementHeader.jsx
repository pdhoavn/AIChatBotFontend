import { Plus } from 'lucide-react';
import { Button } from '../../ui/system_users/button';
import { Dialog, DialogTrigger } from '../../ui/system_users/dialog';
import PropTypes from 'prop-types';

export function UserManagementHeader({ onAddUser }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Quản Lý Người Dùng</h1>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={onAddUser} className="bg-[#EB5A0D] hover:bg-[#d14f0a] text-white">
            <Plus className="h-4 w-4 mr-2" />Thêm Người Dùng</Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}

UserManagementHeader.propTypes = {
  onAddUser: PropTypes.func.isRequired,
};