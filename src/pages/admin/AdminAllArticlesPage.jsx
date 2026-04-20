import { useNavigate } from 'react-router-dom';
import AllArticles from '../../components/content/ArticleList/AllArticles';

export function AdminAllArticlesPage() {
  const navigate = useNavigate();
  
  const goToEditor = () => navigate('/admin/editor');
  
  return <AllArticles onCreate={goToEditor} />;
}
