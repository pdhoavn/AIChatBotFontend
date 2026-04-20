import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/Auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/system_users/card';
import { Label } from '../ui/system_users/label';
import { Badge } from '../ui/system_users/badge';
import { Avatar, AvatarFallback } from '../ui/system_users/avatar';
import { Separator } from '../ui/system_users/separator';
import { 
  User, 
  Mail, 
  Shield, 
  UserCheck,
  Settings,
  Phone
} from 'lucide-react';
import { fastAPIProfile } from '../../services/fastapi';

interface UserProfile {
  user_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  permission?: string[];
  consultant_profile?: {
    status: boolean;
    is_leader: boolean;
  };
  content_manager_profile?: {
    is_leader: boolean;
  };
  admission_official_profile?: {
    rating: number;
    current_sessions: number;
    max_sessions: number;
    status: string;
  };
  consultant_is_leader?: boolean;
  content_manager_is_leader?: boolean;
}

export function ManagerProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fastAPIProfile.getUserById(parseInt(user.id));
        setProfileData(response as UserProfile);
      } catch (err) {
        setError('Không thể tải dữ liệu hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const isLeader = (): boolean => {
    if (!profileData) return false;
    return profileData.consultant_is_leader || profileData.content_manager_is_leader || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Không có dữ liệu hồ sơ</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hồ Sơ Người Dùng</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <Card className="lg:col-span-3">
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold">{profileData.full_name}</h3>
                <p className="text-muted-foreground">{profileData.email}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và Tên</Label>
                <div className="p-3 bg-muted rounded-md">
                  {profileData.full_name || 'Chưa cung cấp'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Địa Chỉ Email</Label>
                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {profileData.email || 'Chưa cung cấp'}
                </div>
              </div>

              {profileData.phone_number && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Số Điện Thoại</Label>
                  <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {profileData.phone_number}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Thông Tin Tài Khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Mã Người Dùng</Label>
                <p className="text-sm text-muted-foreground">{profileData.user_id}</p>
              </div>
            </div>

            {}
            {profileData.consultant_profile && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hồ Sơ Tư Vấn Viên</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Trạng Thái</Label>
                      <Badge 
                        className={`text-xs ${profileData.consultant_profile.status ? 'bg-[#EB5A0D] text-white hover:bg-[#d14f0a]' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {profileData.consultant_profile.status ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Giám Sát</Label>
                      <Badge 
                        className={`text-xs ${profileData.consultant_profile.is_leader ? 'bg-[#EB5A0D] text-white hover:bg-[#d14f0a]' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {profileData.consultant_profile.is_leader ? "👑 Trưởng nhóm" : "👤 Thành viên"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}

            {profileData.content_manager_profile && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hồ Sơ Quản Lý Nội Dung</Label>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Giám Sát</Label>
                    <Badge 
                      className={`text-xs ${profileData.content_manager_profile.is_leader ? 'bg-[#EB5A0D] text-white hover:bg-[#d14f0a]' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {profileData.content_manager_profile.is_leader ? "👑 Trưởng nhóm" : "👤 Thành viên"}
                    </Badge>
                  </div>
                </div>
              </>
            )}

            {profileData.admission_official_profile && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hồ Sơ Nhân Viên Tuyển Sinh</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Đánh Giá</Label>
                      <p className="text-sm">⭐ {profileData.admission_official_profile.rating || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Trạng Thái</Label>
                      <Badge 
                        className={`text-xs ${profileData.admission_official_profile.status === "available" ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                      >
                        {profileData.admission_official_profile.status === "available" ? "Sẵn sàng" : "Không sẵn sàng"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}