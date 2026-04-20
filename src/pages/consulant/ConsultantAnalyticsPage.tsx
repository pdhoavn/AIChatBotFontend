import { useNavigate } from 'react-router-dom';
import { AnalyticsStatistics } from '../../components/consultant/chatbotAnalytics/AnalyticsStatistics';

export function ConsultantAnalyticsPage() {
  const navigate = useNavigate();

  const handleNavigateToKnowledgeBase = (question: string) => {

    navigate('/consultant/trainingdata', { state: { question, action: 'add' } });
  };

  return <AnalyticsStatistics onNavigateToKnowledgeBase={handleNavigateToKnowledgeBase} />;
}