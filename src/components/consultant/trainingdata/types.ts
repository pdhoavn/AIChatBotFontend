
import { 
  TrainingQuestion as APITrainingQuestion, 
  KnowledgeDocument as APIKnowledgeDocument,
  Intent as APIIntent
} from '../../../utils/fastapi-client';

export interface TrainingQuestion extends APITrainingQuestion {
  intent_name?: string;
}

export interface TrainingDocument extends APIKnowledgeDocument {
  intent_name?: string;
  intent_id?: number;
  file_size?: number;
  file_type?: string;
}

export interface Intent extends APIIntent {
  description?: string;
}

export type TabType = 'questions' | 'documents';

