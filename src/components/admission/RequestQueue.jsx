import { useState, useEffect } from 'react';
import {
  User,
  MessageCircle,
  Search,
  UserPlus,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/system_users/card';
import { Button } from '../ui/system_users/button';
import { ScrollArea } from '../ui/system_users/scroll-area';
import { Input } from '../ui/system_users/input';
import { Separator } from '../ui/system_users/separator';
import { Pagination } from '../common/Pagination';

export function RequestQueue({ requests, onTakeRequest, acceptingRequestId }) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 pb-8 space-y-6">
        {}
        <div>
          <h1 className="text-3xl font-bold">Hàng Đợi Yêu Cầu Tư Vấn</h1>
        </div>

        {}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Danh Sách Yêu Cầu ({filteredRequests.length})
            </h3>
          </div>

          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Không có yêu cầu nào trong hàng đợi.</p>
                  <p className="text-sm">
                    {searchQuery
                      ? 'Thử điều chỉnh bộ lọc của bạn.'
                      : 'Các yêu cầu mới sẽ hiển thị ở đây.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedRequests.map((request) => {
              return (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base mb-3">
                              {request.name}
                            </CardTitle>
                          </div>
                          <Button
                            onClick={() => onTakeRequest(request.id)}
                            className="gap-2 flex-shrink-0 bg-[#EB5A0D] hover:bg-[#d14f0a] text-white"
                            disabled={acceptingRequestId === request.id}
                          >
                            <UserPlus className="h-4 w-4" />
                            {acceptingRequestId === request.id ? 'Đang xử lý...' : 'Nhận Yêu Cầu'}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span className="truncate">{request.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-3 w-3" />
                              <span>{request.phone}</span>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Yêu cầu lúc:{' '}
                                {new Date(request.requestedAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
