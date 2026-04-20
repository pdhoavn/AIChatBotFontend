import { TrainingQuestion } from './types';

interface QuestionListProps {
  questions: TrainingQuestion[];
  selectedQuestion: TrainingQuestion | null;
  onSelectQuestion: (question: TrainingQuestion) => void;
}

export function QuestionList({ questions, selectedQuestion, onSelectQuestion }: QuestionListProps) {
  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Nháp' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
      deleted: { color: 'bg-gray-100 text-gray-800', label: 'Đã xóa' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <div
          key={question.question_id}
          onClick={() => onSelectQuestion(question)}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedQuestion?.question_id === question.question_id
              ? 'bg-orange-50 border-[#EB5A0D] shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 flex-1 line-clamp-2">
              {question.question}
            </h3>
            {getStatusBadge(question.status)}
          </div>
          
          {question.intent_name && (
            <p className="text-xs text-gray-500 mb-2">
              Intent: {question.intent_name}
            </p>
          )}
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {question.answer}
          </p>
          
          {question.status === 'rejected' && question.reject_reason && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700">
                <span className="font-semibold">Lý do từ chối:</span> {question.reject_reason}
              </p>
            </div>
          )}
          
          {question.created_at && (
            <p className="text-xs text-gray-400 mt-2">
              {new Date(question.created_at).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      ))}
      
      {questions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Không có câu hỏi nào</p>
        </div>
      )}
    </div>
  );
}
