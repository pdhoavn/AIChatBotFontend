// src/components/auth/LoginPage.tsx
import { useState } from "react";
import { useAuth, type Role } from "@/contexts/Auth";
import { Shield } from "lucide-react";
import { useNavigate ,useLocation } from "react-router-dom";
import bgImage from "@/assets/images/toiyeufpt.jpg";

export default function LoginPage() {

  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { login, getDefaultRoute } = useAuth();   // 👈 LẤY TỪ AUTH
  const navigate = useNavigate(); 
 const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErr(null);
  setLoading(true);

  const res = await login(email.trim(), password);
  setLoading(false);

  if (!res.ok) {
    setErr(res.message || "Đăng nhập thất bại");
    return;
  }

  // 👉 Lấy role đã map trả về từ Auth; mặc định Student nếu undefined
  const role: Role = (res.role as Role) ?? "Student";

  const defaultRoute = getDefaultRoute(role);
  navigate(defaultRoute, { replace: true });
};


  return (
    <div className="min-h-screen grid place-items-center bg-cover bg-center p-4"
    style={{
    backgroundImage: `url(${bgImage})`,
  }}
  
  >
      <div className="w-full max-w-md bg-white rounded-2xl shadow border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-orange-600" />
          <div>
            <div className="text-lg font-semibold text-[#f97316]">Đăng nhập</div>
            <div className="text-xs text-gray-500">Nền tảng FPT</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Mật khẩu</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f97316] text-white rounded-md py-2.5 text-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white text-black rounded-md py-2.5 text-sm border border-gray-300 hover:bg-gray-50"
          >
            Trang chủ
          </button>
        </div>

      </div>
    </div>
  );
}