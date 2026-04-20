import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentManagerDashboard from './ContentManagerDashboard';

export function ContentManagerDashboardPage() {
  const navigate = useNavigate();

  const handleNavigateToEditor = () => {
    navigate('/content/editor');
  };

  const handleNavigateToArticles = () => {
    navigate('/content/articles');
  };

  return (
    <ContentManagerDashboard 
      onNavigateToEditor={handleNavigateToEditor} 
      onNavigateToArticles={handleNavigateToArticles} 
    />
  );
}