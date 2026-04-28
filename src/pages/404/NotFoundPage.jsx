// src/pages/404Page.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-xl w-full text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-yellow-50 px-4 py-1 mb-4 border border-yellow-100">
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-[#facb01] tracking-tight mb-3">
            4
            <span className="text-[#facb01]">0</span>
            4
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-2">
            Ôi, có vẻ bạn đã lạc đường rồi.
          </p>
          <p className="text-sm md:text-base text-gray-500 mb-8">
            Trang bạn truy cập không tồn tại hoặc đã được di chuyển.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Quay lại trang trước
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#facb01] text-white text-sm font-semibold hover:bg-[#e0b500] shadow-sm hover:shadow-md transition"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
