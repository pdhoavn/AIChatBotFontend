import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/Auth";
import axios from "axios";
import { API_CONFIG } from "../../config/api.js";

const API_BASE_URL = API_CONFIG.FASTAPI_BASE_URL;

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TRAIT_LABEL = {
  R: "Realistic (Thực tế)",
  I: "Investigative (Nghiên cứu)",
  A: "Artistic (Nghệ thuật)",
  S: "Social (Xã hội)",
  E: "Enterprising (Quản trị/Kinh doanh)",
  C: "Conventional (Quy củ/Hệ thống)",
};

const TRAIT_SUMMARY = {
  R: "Thực hành, thích làm việc với máy móc, công cụ, môi trường ngoài trời.",
  I: "Phân tích, thích tìm hiểu nguyên lý, dữ liệu, nghiên cứu.",
  A: "Sáng tạo, thẩm mỹ, thích thiết kế/biểu đạt.",
  S: "Giúp đỡ, giao tiếp, đào tạo, chăm sóc cộng đồng.",
  E: "Dẫn dắt, thuyết phục, kinh doanh, lập chiến lược.",
  C: "Tổ chức, quy trình, chi tiết, dữ liệu – thích làm việc theo chuẩn.",
};

// Để dành nếu sau này muốn render ngành theo từng trait
const TRAIT_MAJORS = {
  R: ["Kỹ thuật cơ khí", "Xây dựng", "Kỹ thuật điện - điện tử", "Logistics vận hành"],
  I: ["Khoa học máy tính / AI", "Phân tích dữ liệu", "Sinh học / Hóa học ứng dụng"],
  A: ["Thiết kế đồ họa", "Thiết kế UX/UI", "Truyền thông đa phương tiện", "Kiến trúc"],
  S: ["Sư phạm / Đào tạo", "Công tác xã hội", "Y tế cộng đồng", "Tâm lý học"],
  E: ["Quản trị kinh doanh", "Marketing", "Tài chính - Khởi nghiệp", "Quản trị du lịch"],
  C: ["Kế toán - Kiểm toán", "Quản trị hệ thống thông tin", "Thư ký - Hành chính"],
};

// 2 lựa chọn: Đồng ý = 1, Không đồng ý = 0
const LIKERT = [
  { value: 1, label: "Đồng ý" },
  { value: 0, label: "Không đồng ý" },
];

// 30 câu – 5 câu cho mỗi nhóm
const QUESTIONS = [
  // R – Realistic
  { id: "q1", trait: "R", text: "Tôi thích sửa chữa hoặc lắp ráp máy móc, đồ vật." },
  { id: "q2", trait: "R", text: "Tôi thích các hoạt động ngoài trời, vận động thể chất." },
  { id: "q3", trait: "R", text: "Tôi thích dùng công cụ để tạo ra thứ gì đó hữu ích." },
  { id: "q4", trait: "R", text: "Tôi thích vận hành máy móc, thiết bị kỹ thuật." },
  { id: "q5", trait: "R", text: "Tôi thấy hứng thú với các công việc yêu cầu thao tác tay khéo léo." },

  // I – Investigative
  { id: "q6", trait: "I", text: "Tôi thích phân tích vấn đề và tìm ra nguyên lý đằng sau." },
  { id: "q7", trait: "I", text: "Tôi hứng thú với nghiên cứu khoa học / dữ liệu." },
  { id: "q8", trait: "I", text: "Tôi thích viết code, giải thuật hoặc thí nghiệm." },
  { id: "q9", trait: "I", text: "Tôi thường đặt nhiều câu hỏi 'vì sao' về mọi thứ xung quanh." },
  { id: "q10", trait: "I", text: "Tôi thích đọc sách/chuyên mục chuyên sâu để hiểu vấn đề đến gốc rễ." },

  // A – Artistic
  { id: "q11", trait: "A", text: "Tôi thích vẽ, thiết kế, chụp ảnh hoặc sáng tác." },
  { id: "q12", trait: "A", text: "Tôi quan tâm thẩm mỹ và cách thể hiện ý tưởng." },
  { id: "q13", trait: "A", text: "Tôi thích những công việc không quá gò bó, có tự do sáng tạo." },
  { id: "q14", trait: "A", text: "Tôi thích tham gia biểu diễn, kể chuyện hoặc đóng vai." },
  { id: "q15", trait: "A", text: "Tôi thấy hứng thú với việc sắp xếp bố cục, màu sắc cho ấn phẩm/không gian." },

  // S – Social
  { id: "q16", trait: "S", text: "Tôi thích hỗ trợ, lắng nghe và hướng dẫn người khác." },
  { id: "q17", trait: "S", text: "Tôi làm việc nhóm tốt và muốn tạo giá trị cho cộng đồng." },
  { id: "q18", trait: "S", text: "Tôi kiên nhẫn khi giải thích điều khó cho người khác." },
  { id: "q19", trait: "S", text: "Mọi người thường tìm đến tôi để xin lời khuyên hoặc chia sẻ." },
  { id: "q20", trait: "S", text: "Tôi thích tham gia hoạt động tình nguyện, CLB hoặc chương trình hỗ trợ người khác." },

  // E – Enterprising
  { id: "q21", trait: "E", text: "Tôi thích dẫn dắt nhóm và đưa ra quyết định." },
  { id: "q22", trait: "E", text: "Tôi quan tâm kinh doanh/khởi nghiệp, thuyết phục người khác." },
  { id: "q23", trait: "E", text: "Tôi thích thương lượng, xây dựng quan hệ và đạt mục tiêu." },
  { id: "q24", trait: "E", text: "Tôi thích đặt mục tiêu doanh số/kết quả và tìm cách đạt được." },
  { id: "q25", trait: "E", text: "Tôi cảm thấy tự tin khi thuyết trình hoặc nói trước đám đông." },

  // C – Conventional
  { id: "q26", trait: "C", text: "Tôi chú ý chi tiết và làm việc có trình tự rõ ràng." },
  { id: "q27", trait: "C", text: "Tôi thấy thoải mái với số liệu, biểu mẫu, quy trình." },
  { id: "q28", trait: "C", text: "Tôi thích công việc ổn định, quy củ và có hướng dẫn rõ ràng." },
  { id: "q29", trait: "C", text: "Tôi hài lòng khi hoàn thành giấy tờ, bảng biểu gọn gàng, không sai sót." },
  { id: "q30", trait: "C", text: "Tôi thích sắp xếp dữ liệu/hồ sơ để dễ tra cứu và quản lý." },
];

const CHATBOT_PREFILL_KEY = "chatbot_prefill_message";
const GUEST_ID_KEY = "riasec_guest_id";

export default function RiasecGuestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);

  // summary & điểm lấy từ BE
  const [serverSummary, setServerSummary] = useState(null);
  const [serverScores, setServerScores] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ===== LẤY KẾT QUẢ =====
  useEffect(() => {
  const fetchLastRiasec = async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/riasec/users/${user.id}/riasec/results`,
        { headers: authHeaders() }
      );
      const items = res.data;

      if (Array.isArray(items) && items.length > 0) {
        //  API đang trả bản mới nhất ở ĐẦU mảng
        const latest = items[0];

        setServerScores({
          R: latest.score_realistic,
          I: latest.score_investigative,
          A: latest.score_artistic,
          S: latest.score_social,
          E: latest.score_enterprising,
          C: latest.score_conventional,
        });

        setServerSummary(latest.result || latest.summary || null);
        setSubmitted(true);
        setLoadedAt(
          latest.created_at
            ? new Date(latest.created_at).toLocaleDateString('vi-VN')
            : null
        );
      }
    } catch (err) {
    }
  };

  fetchLastRiasec();
}, [user]);

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  // Điểm tính từ câu trả lời hiện tại trên FE
  const localScores = useMemo(() => {
    const init = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const q of QUESTIONS) {
      const v = answers[q.id] ?? 0;
      init[q.trait] += v;
    }
    return init;
  }, [answers]);

  // Nếu đã có điểm từ server thì ưu tiên dùng, còn không thì dùng local
  const scores = serverScores || localScores;

  const ranking = useMemo(
    () =>
      Object.keys(scores)
        .map((t) => ({ trait: t, score: scores[t] }))
        .sort((a, b) => b.score - a.score),
    [scores]
  );

  const top3 = ranking.slice(0, 3).map((r) => r.trait).join("");

  // Helper: lấy student_id (user.id hoặc guest-<timestamp>)
  const getStudentId = () => {
    if (user && user.id != null) return String(user.id);

    let existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;

    const newId = `guest-${Date.now()}`;
    localStorage.setItem(GUEST_ID_KEY, newId);
    return newId;
  };

  // JSON cho chatbot
  const buildRiasecJson = () => {
    return {
      student_id: getStudentId(),
      answers: {
        R: scores.R,
        I: scores.I,
        A: scores.A,
        S: scores.S,
        E: scores.E,
        C: scores.C,
      },
    };
  };

  // === HÀM CHUNG GỌI BE, DÙNG CHO CẢ SAVE & CHATBOT ===
  const postRiasecToServer = async () => {
    if (!submitted) {
      alert("Bạn cần xem kết quả trước khi gửi.");
      return null;
    }

    const riasecPayload = {
      score_realistic: scores.R,
      score_investigative: scores.I,
      score_artistic: scores.A,
      score_social: scores.S,
      score_enterprising: scores.E,
      score_conventional: scores.C,
      // BE bắt buộc field result trong RiasecResultCreate
      result:
        `Top 3: ${top3}. ` +
        Object.keys(scores)
          .map((t) => `${t}=${scores[t]}`)
          .join(", "),
    };

    try {
      setIsSaving(true);
      const res = await axios.post(
        `${API_BASE_URL}/riasec/submit`,
        riasecPayload,
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        }
      );

      const summaryFromServer =
        res.data.summary ?? res.data.result ?? null;
      if (summaryFromServer) {
        setServerSummary(summaryFromServer);
      }

      // cập nhật lại điểm từ server / payload
      setServerScores({
        R: riasecPayload.score_realistic,
        I: riasecPayload.score_investigative,
        A: riasecPayload.score_artistic,
        S: riasecPayload.score_social,
        E: riasecPayload.score_enterprising,
        C: riasecPayload.score_conventional,
      });

      setSubmitted(true);
      return res.data;
    } catch (err) {
      alert("Có lỗi khi gửi kết quả RIASEC. Thử lại sau nhé.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // --- gửi cho chatbot ---
  const handleSendToChatbot = async () => {
    if (!submitted) {
      alert("Bạn cần xem kết quả trước khi gửi cho chatbot.");
      return;
    }

    await postRiasecToServer();

    const json = buildRiasecJson();
    localStorage.setItem(CHATBOT_PREFILL_KEY, JSON.stringify(json));

    if (user) {
      navigate("/profile?tab=chatbot");
    } else {
      navigate("/chatbot");
    }
  };

  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allAnswered) {
      alert("Bạn cần trả lời tất cả câu hỏi trước khi xem kết quả.");
      return;
    }
    setSubmitted(true);
    setLoadedAt(null);
    // khi submit lần đầu từ form, xoá result cũ nếu có
    setServerScores(null);
    setServerSummary(null);
  };

  // --- Save: lưu thẳng DB qua BE ---
  const handleSave = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để lưu kết quả vào hệ thống.");
      return;
    }
    if (!submitted) {
      alert("Hãy hoàn thành bài test rồi hãy lưu.");
      return;
    }

    const data = await postRiasecToServer();
    if (data) {
      alert("Đã lưu kết quả RIASEC vào hệ thống!");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setAnswers({});
    setServerScores(null);
    setServerSummary(null);
    setLoadedAt(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <div className="mb-10">
        </div>
        <h1 className="text-2xl font-semibold">Trắc nghiệm RIASEC</h1>
        <p className="text-gray-600">
          Đánh giá xu hướng nghề nghiệp theo 6 nhóm: Realistic, Investigative,
          Artistic, Social, Enterprising, Conventional.
        </p>
        {loadedAt && (
          <p className="text-xs text-gray-400 mt-1">
            Đã tải kết quả gần nhất lúc: {loadedAt}
          </p>
        )}
      </header>

      {!submitted && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <div key={q.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">
                  {idx + 1}. {q.text}
                </div>
                <span className="text-xs text-gray-500">
                  {TRAIT_LABEL[q.trait]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {LIKERT.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-gray-50 ${
                      answers[q.id] === opt.value
                        ? "border-[#EB5A0D]"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="accent-[#EB5A0D]"
                      checked={answers[q.id] === opt.value}
                      onChange={() => handleChange(q.id, opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Đã trả lời: {Object.keys(answers).length}/{QUESTIONS.length}
            </div>
            <button
              type="submit"
              disabled={!allAnswered}
              className={`px-4 py-2 rounded-md text-white ${
                allAnswered
                  ? "bg-[#EB5A0D] hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Xem kết quả
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="space-y-6">
          {/* Tóm tắt nhanh cho mọi đối tượng */}
          <section className="rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold mb-2">Kết quả tóm tắt</h2>
            <p className="text-sm text-gray-600">
              Điểm chi tiết (0–5 mỗi nhóm):{" "}
              {Object.keys(scores)
                .map((t) => `${t} = ${scores[t]}`)
                .join(", ")}
            </p>

            {serverSummary && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <div className="font-semibold mb-1">
                  Gợi ý phân tích từ hệ thống:
                </div>
                <p>{serverSummary}</p>
              </div>
            )}
          </section>

          {/* Guest (chưa login) */}
          {!user && (
            <section className="rounded-xl border bg-white p-5">
              <h3 className="font-semibold mb-2">
                Gợi ý ngành phù hợp (chi tiết từ Chatbot)
              </h3>
              <p className="text-gray-600">
                Kết quả là {top3} – {ranking[0].trait}: {ranking[0].score} điểm,{" "}
                {ranking[1].trait}: {ranking[1].score} điểm, {ranking[2].trait}:{" "}
                {ranking[2].score} điểm.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  className="px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
                  onClick={handleSendToChatbot}
                  disabled={isSaving}
                >
                  {isSaving ? "Đang xử lý..." : "Đưa kết quả cho chatbot"}
                </button>
                <button
                  className="px-4 py-2 rounded-md border hover:bg-gray-50"
                  onClick={handleReset}
                >
                  Làm lại bài
                </button>
              </div>
            </section>
          )}

          {/* User đã login */}
          {user && (
            <section className="rounded-xl border bg-white p-5">
              <h3 className="font-semibold mb-4">
                Gợi ý ngành học theo điểm mạnh của bạn
              </h3>

              <div className="mt-4 flex gap-3">
                <button
                  className="px-4 py-2 rounded-md bg-black text-white hover:opacity-90"
                  onClick={handleSendToChatbot}
                  disabled={isSaving}
                >
                  {isSaving ? "Đang xử lý..." : "Đưa kết quả cho chatbot"}
                </button>

                <button
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Đang lưu..." : "Lưu kết quả"}
                </button>

                <button
                  className="px-4 py-2 rounded-md border hover:bg-gray-50"
                  onClick={handleReset}
                >
                  Làm lại bài
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
