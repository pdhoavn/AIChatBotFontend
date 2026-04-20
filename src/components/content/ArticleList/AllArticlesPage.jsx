import React from 'react';
import { useNavigate } from 'react-router-dom';
import AllArticles from './AllArticles';

export function AllArticlesPage() {
  const navigate = useNavigate();

  const handleNavigateToEditor = () => {
    navigate('/content/editor');
  };

  const handleNavigateToEditorWithData = (articleData) => {

    navigate('/content/editor', { state: articleData });
  };

  return (
    <AllArticles 
      onNavigateToEditor={handleNavigateToEditor} 
      onNavigateToEditorWithData={handleNavigateToEditorWithData} 
    />
  );
}