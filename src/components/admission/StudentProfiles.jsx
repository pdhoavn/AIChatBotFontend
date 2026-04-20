import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Award,
  BookOpen,
  Target,
  Globe,
  ExternalLink,
  File,
  FileImage,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/system_users/card';
import { Button } from '../ui/system_users/button';
import { Badge } from '../ui/system_users/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/system_users/avatar';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/system_users/tabs';
import { Separator } from '../ui/system_users/separator';
import { Progress } from '../ui/system_users/progress';

export function StudentProfile({ studentId, onBack }) {

  const student = {
    id: studentId,
    name: 'Dữ liệu không khả dụng',
    email: 'N/A',
    phone: 'N/A',
    dateOfBirth: 'N/A',
    location: 'N/A',
    address: 'N/A',
    nationality: 'N/A',
    appliedDate: 'N/A',
    program: 'N/A',
    status: 'pending',
    gpa: 0,
    testScore: 0,
    languageScore: null,
    education: [],
    experience: [],
    awards: [],
    personalStatement: 'Tính năng này đang được phát triển. Vui lòng kết nối với API để hiển thị dữ liệu thực tế.',
    uploadedFiles: []
  };
  
  const [selectedTab, setSelectedTab] = useState('overview');

  const getStatusConfig = (status) => {
    const configs = {
      approved: { label: 'Đã Duyệt', variant: 'default', icon: CheckCircle2, color: 'bg-green-500' },
      rejected: { label: 'Từ Chối', variant: 'destructive', icon: XCircle, color: 'bg-red-500' },
      reviewing: { label: 'Đang Xét', variant: 'secondary', icon: Clock, color: 'bg-blue-500' },
      pending: { label: 'Chờ Xử Lý', variant: 'outline', icon: Clock, color: 'bg-orange-500' },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(student.status);
  const StatusIcon = statusConfig.icon;

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'image':
        return FileImage;
      case 'spreadsheet':
        return FileSpreadsheet;
      default:
        return File;
    }
  };

  const filesByCategory = student.uploadedFiles.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {});

  return (
    <ScrollArea className="h-full">
      <div className="p-6 pb-8 space-y-6">
        {}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2>Hồ Sơ Học Sinh</h2>
            <p className="text-muted-foreground">
              Thông tin chi tiết và tài liệu của học sinh
            </p>
          </div>
        </div>

        {}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h3 className="text-2xl">{student.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{student.id}</Badge>
                      <Badge variant={statusConfig.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Đăng ký: {new Date(student.appliedDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{student.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Sinh: {new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{student.nationality}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{student.program}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm">GPA: <span className="font-semibold">{student.gpa.toFixed(2)}</span></span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm">Điểm Test: <span className="font-semibold">{student.testScore}</span></span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm">{student.languageScore.test}: <span className="font-semibold">{student.languageScore.score}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-2">
                <Button className="gap-2 flex-1">
                  <Mail className="h-4 w-4" />
                  Gửi Email
                </Button>
                <Button variant="outline" className="gap-2 flex-1">
                  <Download className="h-4 w-4" />
                  Tải Hồ Sơ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="education">Học Vấn</TabsTrigger>
            <TabsTrigger value="documents">Tài Liệu ({student.uploadedFiles.length})</TabsTrigger>
            <TabsTrigger value="statement">Bản Tự Thuật</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Thành Tích Học Tập
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">GPA Tích Lũy</span>
                      <span className="font-semibold">{student.gpa.toFixed(2)}/4.0</span>
                    </div>
                    <Progress value={(student.gpa / 4.0) * 100} className="h-2" />
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Điểm Test Đầu Vào</span>
                      <span className="font-semibold">{student.testScore}/100</span>
                    </div>
                    <Progress value={student.testScore} className="h-2" />
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{student.languageScore.test}</span>
                      <span className="font-semibold">{student.languageScore.score}/9.0</span>
                    </div>
                    <Progress value={(student.languageScore.score / 9.0) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ngày thi: {new Date(student.languageScore.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Giải Thưởng & Thành Tích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {student.awards.map((award, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{award}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Kinh Nghiệm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.experience.map((exp, index) => (
                    <div key={index} className="space-y-2">
                      <div>
                        <div className="font-medium">{exp.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {exp.company} • {exp.duration}
                        </div>
                      </div>
                      <p className="text-sm">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Thông Tin Liên Hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Địa chỉ</div>
                    <div className="text-sm">{student.address}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    <div className="text-sm flex items-center gap-2">
                      {student.email}
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Điện thoại</div>
                    <div className="text-sm">{student.phone}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lịch Sử Học Tập
                </CardTitle>
                <CardDescription>
                  Thông tin về quá trình học tập của học sinh
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {student.education.map((edu, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-border pb-6 last:pb-0">
                    <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold">{edu.school}</h4>
                        <div className="text-sm text-muted-foreground">
                          {edu.degree} - {edu.major}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{edu.startDate} - {edu.endDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span>GPA: {edu.gpa}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tài Liệu Đã Tải Lên
                </CardTitle>
                <CardDescription>
                  Tất cả các tài liệu mà học sinh đã gửi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(filesByCategory).map(([category, files]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {category} ({files.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {files.map((file) => {
                        const FileIcon = getFileIcon(file.type);
                        return (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {file.size} • Tải lên: {new Date(file.uploadedDate).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statement" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bản Tự Thuật
                </CardTitle>
                <CardDescription>
                  Thư động lực và mục tiêu của học sinh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {student.personalStatement}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
