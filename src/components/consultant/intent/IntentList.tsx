import { Trash2, Tag, Ban } from 'lucide-react';
import { Button } from '../../ui/system_users/button';
import { Card } from '../../ui/system_users/card';
import { Intent } from '../../../utils/fastapi-client';

interface IntentListProps {
  intents: Intent[];
  onEdit: (intent: Intent) => void;
  onDelete: (intent: Intent) => void;
  onClick: (intent: Intent) => void;
  isLeader: boolean;
}

export function IntentList({ intents, onEdit, onDelete, onClick, isLeader }: IntentListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {intents.map((intent) => (
        <Card 
          key={intent.intent_id} 
          className="p-4 hover:shadow-md transition-shadow cursor-pointer relative"
          onClick={() => onClick(intent)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <div className={`p-2 rounded-lg ${intent.is_deleted ? 'bg-gray-100' : 'bg-orange-50'}`}>
                <Tag className={`h-4 w-4 ${intent.is_deleted ? 'text-gray-400' : 'text-[#EB5A0D]'}`} />
              </div>
              <h3 className={`font-semibold ${intent.is_deleted ? 'text-gray-400' : 'text-gray-900'}`}>
                {intent.intent_name}
              </h3>
            </div>
            {isLeader && !intent.is_deleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(intent);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {intent.description && (
            <p className={`text-sm mb-3 line-clamp-2 ${intent.is_deleted ? 'text-gray-400' : 'text-gray-600'}`}>
              {intent.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>ID: {intent.intent_id}</span>
            {}
            {intent.is_deleted && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                <Ban className="h-3 w-3" />
                Vô Hiệu Hóa
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
