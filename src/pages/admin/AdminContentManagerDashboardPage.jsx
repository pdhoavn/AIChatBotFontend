import { useNavigate } from 'react-router-dom';
import ContentManagerDashboard from '../../components/content/ContentManagerDashboard';

export function AdminContentManagerDashboardPage() {
  const navigate = useNavigate();
  
  const goToEditor = () => navigate('/admin/editor');
  
  return <ContentManagerDashboard onCreate={goToEditor} />;
}
