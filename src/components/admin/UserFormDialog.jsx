import { Button } from '../ui/system_users/button';
import { Input } from '../ui/system_users/input';
import { Label } from '../ui/system_users/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/system_users/dialog';
import { RoleSelector } from './RoleSelector';
import { PermissionSelector } from './PermissionSelector';
import { t } from '../../utils/i18n';
import PropTypes from 'prop-types';

export function UserFormDialog({
  isOpen,
  onClose,
  editingUser,
  formData,
  onFormChange,
  onSubmit
}) {
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
    onFormChange({ ...formData, role, permissions: [] });
  };

  const handlePermissionsChange = (permissions) => {
    onFormChange({ ...formData, permissions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingUser ? t('users.edit_user') : t('users.add_user')}</DialogTitle>
          <DialogDescription>
            {editingUser ? t('users.update_user_description') : t('users.create_user_description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            <Label htmlFor="name">{t('users.full_name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder={t('users.enter_full_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('users.email_address')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder={t('users.enter_email')}
            />
          </div>

          {!editingUser && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('users.password')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder={t('users.enter_password')}
              />
            </div>
          )}

          {editingUser && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('users.new_password_keep_current')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder={t('users.enter_new_password')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">{t('users.phone_number')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone_number || ''}
              onChange={handlePhoneChange}
              placeholder={t('users.enter_phone')}
            />
          </div>

          {!editingUser && (
            <>
              <div className="space-y-2">
                <Label htmlFor="interest_major">{t('users.interest_major')}</Label>
                <Input
                  id="interest_major"
                  value={formData.interest_desired_major || ''}
                  onChange={handleInterestMajorChange}
                  placeholder={t('users.interest_major_placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_region">{t('users.interest_region')}</Label>
                <Input
                  id="interest_region"
                  value={formData.interest_region || ''}
                  onChange={handleInterestRegionChange}
                  placeholder={t('users.interest_region_placeholder')}
                />
              </div>
            </>
          )}

          <div className="space-y-6">
            {}
            <RoleSelector
              selectedRole={formData.role}
              onRoleChange={handleRoleChange}
              isEditing={!!editingUser}
            />

            {}
            {formData.role && (
              <PermissionSelector
                role={formData.role}
                selectedPermissions={formData.permissions || []}
                onPermissionsChange={handlePermissionsChange}
                isEditing={!!editingUser}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={onSubmit}>
            {editingUser ? t('users.update_user') : t('users.create_new_user')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

UserFormDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingUser: PropTypes.object,
  formData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    role: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.string),
    phone_number: PropTypes.string,
    interest_desired_major: PropTypes.string,
    interest_region: PropTypes.string,
  }).isRequired,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};