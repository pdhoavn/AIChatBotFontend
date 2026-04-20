// src/router/Router.jsx
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPrivate from "../pages/login/LoginPrivate.jsx";
import { AdminPage } from "../pages/admin/AdminPage.jsx";
import UserProfile from "../pages/profile/UserProfile.jsx";
import Home from "../pages/home/Home.jsx";
import { ConsulantPage } from "../pages/consulant/ConsulantPage.tsx";
import { ConsultantOverviewPage } from "../pages/consulant/ConsultantOverviewPage.tsx";
import { ConsultantAnalyticsPage } from "../pages/consulant/ConsultantAnalyticsPage.tsx";
import { ConsultantTrainingDataPage } from "../pages/consulant/ConsultantTrainingDataPage.tsx";
import { ConsultantIntentPage } from "../pages/consulant/ConsultantIntentPage.tsx";
import { ConsultantLeaderPage } from "../pages/consulant/ConsultantLeaderPage.tsx";
import { ContentManagerPage } from "../pages/contentManager/ContentManagerPage.jsx";
import LoginPage from "../pages/loginForAd/LoginPage.tsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.tsx";
import RoleGuard, { AdminGuard, ContentManagerGuard, ConsultantGuard, AdmissionOfficerGuard, StudentGuard, StaffGuard } from "../components/auth/RoleGuard.tsx";
import { AdminLayout } from "../components/admin/AdminLayout.jsx";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage.jsx";
import { QATemplateManagerPage } from "../pages/admin/QATemplateManagerPage.jsx";
import { UserManagementPage } from "../pages/admin/UserManagementPage.jsx";
import { AdminConsultationPage } from "../pages/admin/AdminConsultationPage.jsx";

import { AdminConsultantDashboardPage } from "../pages/admin/AdminConsultantDashboardPage.jsx";
import { AdminAnalyticsPage } from "../pages/admin/AdminAnalyticsPage.jsx";
import { AdminKnowledgeBasePage } from "../pages/admin/AdminKnowledgeBasePage.jsx";
import { AdminContentManagerDashboardPage } from "../pages/admin/AdminContentManagerDashboardPage.jsx";
import { AdminAllArticlesPage } from "../pages/admin/AdminAllArticlesPage.jsx";
import { AdminReviewQueuePage } from "../pages/admin/AdminReviewQueuePage.jsx";
import { AdminArticleEditorPage } from "../pages/admin/AdminArticleEditorPage.jsx";
import RiasecPage from "../pages/riasec/RiasecPage.jsx";
import ChatGuestPage from "../pages/chatbot/ChatGuestPage.jsx";
import { ManagerProfilePage } from "../pages/manager/ManagerProfilePage.tsx";
import { AdmissionOfficerLayout } from "../components/admission/AdmissionOfficerLayout.jsx";
import { RequestQueuePage } from "../components/admission/RequestQueuePage.jsx";
import { LiveChatView } from "../components/admission/chat/LiveChatView.jsx";
import { KnowledgeBaseViewer } from "../components/admission/knowledgebase/KnowledgeBaseViewer.jsx";
import { StudentListPage } from "../components/admission/StudentListPage.jsx";
import { StudentProfilePage } from "../components/admission/StudentProfilePage.jsx";

import ContentManagerLayOut from "../components/content/ContentManagerLayOut.jsx";
import { ContentManagerDashboardPage } from "../components/content/ContentManagerDashboardPage.jsx";
import { AllArticlesPage } from "../components/content/ArticleList/AllArticlesPage.jsx";
import ReviewQueue from "../components/content/ReviewQueue.jsx";
import { ArticleEditorPage } from "../components/content/ArticleEditorPage.jsx";
import ArticlePage from "../pages/article/ArticlePage.jsx";
import CustomerLiveChatPage from "../pages/livechat/CustomerLiveChatPage.jsx";
import NotFoundPage from "../pages/404/NotFoundPage.jsx";


export default function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/loginprivate" element={<LoginPrivate />} />
      <Route path="/loginforad" element={<LoginPage />} />
      <Route path="/chatbot" element={<ChatGuestPage />} />
      <Route path="/riasec" element={<RiasecPage />} />
      <Route path="/articles" element={<ArticlePage />} />
      <Route path="/404" element={<NotFoundPage />} />
      
      {/* Student-only routes */}
      <Route path="/profile" element={
 
          <UserProfile />
 
      } />
      <Route path="/live-chat" element={
 
          <CustomerLiveChatPage />
 
      } />
      
      {/* Consultant routes */}
      <Route path="/consultant" element={
        <ConsultantGuard>
          <ConsulantPage />
        </ConsultantGuard>
      }>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ConsultantOverviewPage />} />
        <Route path="analytics" element={<ConsultantAnalyticsPage />} />
        <Route path="trainingdata" element={<ConsultantTrainingDataPage />} />
        <Route path="intents" element={<ConsultantIntentPage />} />
        <Route path="leader" element={<ConsultantLeaderPage />} />
        <Route path="profile" element={<ManagerProfilePage />} />
      </Route>
      
      {/* Admission Officer routes */}
      <Route path="/admission" element={
        <AdmissionOfficerGuard>
          <AdmissionOfficerLayout />
        </AdmissionOfficerGuard>
      }>
        <Route index element={<Navigate to="students" replace />} />
        <Route path="request-queue" element={<RequestQueuePage />} />
        <Route path="consultation" element={<LiveChatView />} />
        <Route path="knowledge-base" element={<KnowledgeBaseViewer />} />
        <Route path="students" element={<StudentListPage />} />
        <Route path="students/:studentId" element={<StudentProfilePage />} />
        <Route path="profile" element={<ManagerProfilePage />} />
      </Route>
      
      {/* Content Manager routes */}
      <Route path="/content" element={
        <ContentManagerGuard>
          <ContentManagerLayOut />
        </ContentManagerGuard>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ContentManagerDashboardPage />} />
        <Route path="articles" element={<AllArticlesPage />} />
        <Route path="review" element={<ReviewQueue />} />
        <Route path="editor" element={<ArticleEditorPage />} />
        <Route path="profile" element={<ManagerProfilePage />} />
      </Route>
      
      {/* Admin routes - Only for System Admins */}
      <Route path="/admin" element={
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* Core Admin Routes */}
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="templates" element={<QATemplateManagerPage />} />
        <Route path="users" element={<UserManagementPage />} />
        {/* Admission Management Routes */}
        <Route path="content" element={<AdminContentManagerDashboardPage />} />
        <Route path="consultation" element={<AdminConsultationPage />} />
        {/* Consultant Management Routes */}
        <Route path="overview" element={<AdminConsultantDashboardPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="knowledge" element={<AdminKnowledgeBasePage />} />
        {/* Content Management Routes */}
        <Route path="dashboardcontent" element={<AdminContentManagerDashboardPage />} />
        <Route path="articles" element={<AdminAllArticlesPage />} />
        <Route path="review" element={<AdminReviewQueuePage />} />
        <Route path="editor" element={<AdminArticleEditorPage />} />
        <Route path="profile" element={<ManagerProfilePage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}