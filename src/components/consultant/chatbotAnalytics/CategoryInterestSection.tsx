import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/system_users/card';
import { Button } from '../../ui/system_users/button';
import { Badge } from '../../ui/system_users/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/system_users/table';
import { IntentAskedStatistic } from '../../../services/fastapi';

interface CategoryInterestSectionProps {
  intentStats: IntentAskedStatistic[];
  loading: boolean;
  error: string | null;
}

export function CategoryInterestSection({ intentStats, loading, error }: CategoryInterestSectionProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh Mục</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải danh mục...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>Lỗi: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Thử Lại
            </Button>
          </div>
        ) : intentStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Không có danh mục nào.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="h-12">
                  <TableHead className="py-3 font-medium">
                    Danh Mục
                  </TableHead>
                  <TableHead className="text-right py-3 font-medium">
                    Số Lần Được Hỏi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intentStats.slice(0, visibleCount).map((stat) => (
                  <TableRow key={stat.intent_id} className="h-14">
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-sm px-2.5 py-1">{stat.intent_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right py-3 text-base font-medium">
                      {stat.question_count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {}
            <div className="p-4 border-t">
              {intentStats && visibleCount < intentStats.length && (
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setVisibleCount(prev => Math.min(prev + 10, intentStats.length))}
                    className="flex items-center gap-2"
                  >
                    Hiển Thị Thêm ({Math.min(10, intentStats.length - visibleCount)} mục khác)
                  </Button>
                </div>
              )}
              
              {visibleCount > 10 && (
                <div className="flex justify-center mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setVisibleCount(10)}
                    className="text-muted-foreground"
                  >
                    Ẩn Bớt
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
