import { useMemo, useState, useEffect } from "react";
import { fastAPIArticles, majorsAPI } from '../../../services/fastapi';
import { useAuth } from '../../../contexts/Auth';
import { isAuthError } from '../../../utils/fastapi-client';
import { toast } from 'react-toastify';
import ArticleToolbar from './ArticleToolbar';
import ArticleTable from './ArticleTable';
import ArticleDetailsModal from './ArticleDetailsModal';
import EditArticleModal from './EditArticleModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Pagination } from '../../common/Pagination';

export default function AllArticles({ onCreate, onNavigateToEditor, onNavigateToEditorWithData }) { {
  const { user, hasPermission, isContentManagerLeader } = useAuth();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất Cả Trạng Thái");
  const [categoryFilter, setCategoryFilter] = useState("Tất Cả Ngành");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleDetailsLoading, setArticleDetailsLoading] = useState(false);
  const [articleDetailsError, setArticleDetailsError] = useState(null);
  const [majors, setMajors] = useState([]);
  const [majorsLoading, setMajorsLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deleteConfirmArticle, setDeleteConfirmArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const isAdmin = hasPermission("Admin");
        const isLeader = isContentManagerLeader();
        
        let data;
        
        if (isAdmin || isLeader) {

          data = await fastAPIArticles.getAll();
        } else if (hasPermission("Content Manager") && user?.id) {

          data = await fastAPIArticles.getByUserId(parseInt(user.id));
        } else {

          setError('You do not have permission to view articles.');
          return;
        }
        
        setArticles(data);
      } catch (err) {

        if (isAuthError(err)) {
          return;
        }
        setError('Failed to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchArticles();
    }
  }, [user, hasPermission, isContentManagerLeader]);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        setMajorsLoading(true);
        const data = await majorsAPI.getAll();
        setMajors(data);
      } catch (err) {

      } finally {
        setMajorsLoading(false);
      }
    };

    fetchMajors();
  }, []);

  const filtered = useMemo(
    () => articles.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = statusFilter === "Tất Cả Trạng Thái" || 
        (statusFilter === "Bản Nháp" && article.status === "draft") ||
        (statusFilter === "Bị Từ Chối" && article.status === "rejected") ||
        (statusFilter === "Đã Xuất Bản" && article.status === "published");
      const matchesCategory = categoryFilter === "Tất Cả Ngành" || 
        article.major_name === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    }),
    [articles, q, statusFilter, categoryFilter]
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, statusFilter, categoryFilter]);

  const fetchArticleDetails = async (articleId) => {
    setArticleDetailsLoading(true);
    setArticleDetailsError(null);
    
    try {

      const articleDetails = await fastAPIArticles.getById(articleId);
      
      setSelectedArticle(articleDetails);
    } catch (err) {

      if (isAuthError(err)) {
        return;
      }
      setArticleDetailsError(err instanceof Error ? err.message : 'Failed to load article details');
    } finally {
      setArticleDetailsLoading(false);
    }
  };

  const handleArticleClick = (article, event) => {

    if (event) {
      const target = event.target;
      if (
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('[role="menu"]') ||
        target.closest('[data-radix-menu-content]')
      ) {
        return;
      }
    }
    
    fetchArticleDetails(article.article_id);
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setArticleDetailsError(null);
  };

  const handleCloseDropdowns = () => {
    setShowStatusDropdown(false);
    setShowCategoryDropdown(false);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const handleCategoryFilterChange = (category) => {
    setCategoryFilter(category);
    setShowCategoryDropdown(false);
  };

  const handleToggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
    setShowCategoryDropdown(false);
  };

  const handleToggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowStatusDropdown(false);
  };

  const refreshArticles = async () => {
    try {
      const isAdmin = hasPermission("Admin");
      const isLeader = isContentManagerLeader();
      let data;
      if (isAdmin || isLeader) {
        data = await fastAPIArticles.getAll();
      } else if (hasPermission("Content Manager") && user?.id) {
        data = await fastAPIArticles.getByUserId(parseInt(user.id));
      } else {
        return;
      }
      setArticles(data);
    } catch (err) {

      if (isAuthError(err)) {
        return;
      }

      console.error('Failed to refresh articles:', err);
    }
  };

  return (
    <div className="p-6">
      {}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xl font-semibold">
            Danh Sách Bài Viết
          </div>
        </div>
        {onCreate ? (
          <button
            onClick={onCreate}
            className="px-3 py-2 rounded-md bg-black text-white text-sm hover:opacity-90"
          >
            + Create Article
          </button>
        ) : onNavigateToEditor ? (
          <button
            onClick={onNavigateToEditor}
            className="px-3 py-2 rounded-md text-white text-sm transition-colors bg-[#EB5A0D] hover:bg-[#d14f0a]"
          >
            + Tạo Bài Viết
          </button>
        ) : (
          <a
            href="/content?tab=editor"
            className="px-3 py-2 rounded-md text-white text-sm transition-colors bg-[#EB5A0D] hover:bg-[#d14f0a]"
          >
            + Tạo Bài Viết
          </a>
        )}
      </div>

      {}
      <ArticleToolbar
        searchQuery={q}
        onSearchChange={setQ}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={handleCategoryFilterChange}
        showStatusDropdown={showStatusDropdown}
        onToggleStatusDropdown={handleToggleStatusDropdown}
        showCategoryDropdown={showCategoryDropdown}
        onToggleCategoryDropdown={handleToggleCategoryDropdown}
        majors={majors}
        majorsLoading={majorsLoading}
        onClickOutside={handleCloseDropdowns}
      />

      {}
      <ArticleTable
        articles={paginatedArticles}
        loading={loading}
        error={error}
        canEdit={hasPermission("Admin") || isContentManagerLeader()}
        onArticleClick={handleArticleClick}
        onView={(article) => fetchArticleDetails(article.article_id)}
        onEdit={setEditingArticle}
        onDelete={setDeleteConfirmArticle}
      />

      {}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {}
      <ArticleDetailsModal
        article={selectedArticle}
        loading={articleDetailsLoading}
        error={articleDetailsError}
        onClose={closeModal}
        onRetry={() => selectedArticle && fetchArticleDetails(selectedArticle.article_id)}
      />

      {}
      {editingArticle && (
        <EditArticleModal
          article={editingArticle}
          majors={majors}
          onClose={() => setEditingArticle(null)}
          onSave={async (updatedData) => {
            try {
              await fastAPIArticles.update(editingArticle.article_id, updatedData);
              toast.success('Cập nhật bài viết thành công!');
              await refreshArticles();
              setEditingArticle(null);
            } catch (err) {

              if (isAuthError(err)) {
                return;
              }
              toast.error('Không thể cập nhật bài viết. Vui lòng thử lại.');
            }
          }}
        />
      )}

      {}
      {deleteConfirmArticle && (
        <DeleteConfirmModal
          article={deleteConfirmArticle}
          onClose={() => setDeleteConfirmArticle(null)}
          onConfirm={async () => {
            try {
              await fastAPIArticles.delete(deleteConfirmArticle.article_id);
              toast.success('Xóa bài viết thành công!');
              await refreshArticles();
              setDeleteConfirmArticle(null);
            } catch (err) {

              if (isAuthError(err)) {
                return;
              }
              toast.error('Không thể xóa bài viết. Vui lòng thử lại.');
            }
          }}
        />
      )}
    </div>
  );
}
}
