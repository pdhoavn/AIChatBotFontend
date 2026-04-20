import { useNavigate } from 'react-router-dom';
import { AnalyticsStatistics } from '../../components/consultant/chatbotAnalytics/AnalyticsStatistics';

export function AdminAnalyticsPage() {
  const navigate = useNavigate();

  const handleNavigateToKnowledgeBase = (question) => {

    navigate('/admin/knowledge', { state: { question, action: 'add' } });
  };

  return <AnalyticsStatistics onNavigateToKnowledgeBase={handleNavigateToKnowledgeBase} />;
}
