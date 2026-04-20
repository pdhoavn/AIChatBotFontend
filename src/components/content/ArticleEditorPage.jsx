import { useLocation } from 'react-router-dom';
import ArticleEditor from './ArticleEditor';

export function ArticleEditorPage() {
  const location = useLocation();

  const initialData = location.state || null;

  return (
    <ArticleEditor initialData={initialData} />
  );
}