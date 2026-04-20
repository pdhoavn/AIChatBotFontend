import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { API_CONFIG } from "../../config/api.js";

const API_BASE_URL = API_CONFIG.FASTAPI_BASE_URL;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

function translateStatus(status) {
  const statusMap = {
    'draft': 'Nháp',
    'review': 'Đang Xem Xét',
    'rejected': 'Bị Từ Chối',
    'published': 'Đã Xuất Bản'
  };
  return statusMap[status] || status;
}

export default function ArticlePage() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function fetchArticles() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/articles`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Fetch articles failed: ${res.status}`);
        }

        const data = await res.json();

        const normalized = (data || []).filter(
          (item) => item.status === "published"
        );

        setArticles(normalized);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Đã xảy ra lỗi khi tải bài viết");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();

    return () => controller.abort();
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-20">
        </div>
        {loading && (
          <p className="text-center text-gray-500 mt-10">
            Đang tải bài viết...
          </p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 mt-10">{error}</p>
        )}

        {/* Danh sách bài viết */}
        {!loading && !error && !selected && (
          <>
            <h1 className="text-3xl mt-10 font-semibold mb-6 text-center text-[#EB5A0D]">
              Tin tức & Bài viết
            </h1>

            {articles.length === 0 ? (
              <p className="text-center text-gray-500">
                Hiện chưa có bài viết nào.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((a) => (
                  <div
                    key={a.article_id}
                    className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer bg-white"
                    onClick={() => setSelected(a)}
                  >
                    {a.link_image && (
                      <img
                        src={a.link_image.startsWith('http://') || a.link_image.startsWith('https://') 
                          ? a.link_image 
                          : `https://${a.link_image}`}
                        alt={a.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-1 line-clamp-2">
                        {a.title}
                      </h2>

                      {a.author_name && (
                        <p className="text-xs text-gray-500 mb-1">
                          Tác giả: {a.author_name}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 line-clamp-3">
                        {a.description}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {formatDate(a.create_at)}
                        </p>
                        <span className="text-[10px] uppercase px-2 py-1 rounded-full bg-green-100 text-green-700">
                          {translateStatus(a.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Chi tiết bài viết */}
        {!loading && !error && selected && (
          <article className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-10">
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mb-4 text-sm text-[#EB5A0D] hover:underline"
            >
              ← Quay lại danh sách
            </button>

            {selected.link_image && (
              <img
                src={selected.link_image.startsWith('http://') || selected.link_image.startsWith('https://') 
                  ? selected.link_image 
                  : `https://${selected.link_image}`}
                alt={selected.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}

            <h1 className="text-2xl font-semibold mb-1">
              {selected.title}
            </h1>

<div className="text-sm text-gray-500 mb-4">
  <div>Ngày: {formatDate(selected.create_at)}</div>

  {selected.author_name && (
    <div>Tác giả: {selected.author_name}</div>
  )}
</div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {selected.description}
            </p>
{selected.url && (
  <div className="mt-6 text-sm">
    <span className="font-smal">Link: </span>
    <a
      href={selected.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#EB5A0D] underline break-all"
    >
      {selected.url}
    </a>
  </div>
)}
          </article>
        )}
      </div>
      <Footer />
    </>
  );
}
