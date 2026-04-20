import { useState } from 'react';
import { HelpCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/system_users/card';
import { Button } from '../../ui/system_users/button';
import { Badge } from '../../ui/system_users/badge';
import { UnansweredQuestion } from '../../../services/fastapi';

interface KnowledgeGapsSectionProps {
  unansweredQuestions: UnansweredQuestion[];
  loading: boolean;
  error: string | null;
}

export function KnowledgeGapsSection({ 
  unansweredQuestions, 
  loading, 
  error
}: KnowledgeGapsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#EF4444]" />
              Những Câu Hỏi Chưa Trả Lời
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải câu hỏi chưa trả lời...</span>
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
        ) : !unansweredQuestions || unansweredQuestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Không có câu hỏi chưa trả lời nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unansweredQuestions.slice(0, visibleCount).map((question) => (
              <div
                key={question.question_id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{question.question_text}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        {question.fail_reason}
                      </Badge>
                      <span>
                        {new Date(question.timestamp).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {question.bot_response && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        <span className="font-medium">Phản hồi bot: </span>
                        <span className="text-muted-foreground">{question.bot_response}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {}
            {unansweredQuestions && visibleCount < unansweredQuestions.length && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setVisibleCount(prev => Math.min(prev + 5, unansweredQuestions.length))}
                  className="flex items-center gap-2"
                >
                  Hiển Thị Thêm ({Math.min(5, unansweredQuestions.length - visibleCount)} mục khác)
                </Button>
              </div>
            )}
            
            {}
            {visibleCount > 5 && (
              <div className="flex justify-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setVisibleCount(5)}
                  className="text-muted-foreground"
                >
                  Ẩn Bớt
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
