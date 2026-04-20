import { useNavigate } from 'react-router-dom';
import { DashboardOverview } from '../../components/consultant/DashboardOverview';

export function ConsultantOverviewPage() {
  const navigate = useNavigate();

  const handleNavigateToTemplates = (question: string, action: 'add') => {

    navigate('/consultant/templates', { state: { question, action } });
  };

  return <DashboardOverview onNavigateToTemplates={handleNavigateToTemplates} />;
}