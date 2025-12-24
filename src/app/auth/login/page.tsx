"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notification } from "antd";

export default function LoginPage() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();

  const handleLogin = async () => {
    if (!username || !password) {
      api.warning({
        message: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ username và password",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ XÓA TOKEN CŨ TRƯỚC KHI LOGIN MỚI
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        api.error({
          message: "Đăng nhập thất bại",
          description: data.error || "Tên đăng nhập hoặc mật khẩu không đúng",
        });
        return;
      }

      // ✅ Lưu token & user MỚI vào sessionStorage (xóa khi đóng tab)
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      api.success({
        message: "Đăng nhập thành công 🎉",
        description: `Xin chào ${data.user.username}, chào mừng bạn quay lại hệ thống!`,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      api.error({
        message: "Lỗi hệ thống",
        description: error.message || "Có lỗi xảy ra khi đăng nhập",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dff6ff] via-[#f7fcff] to-[#e8fff1] relative overflow-hidden">
      {contextHolder}

      {/* Decorative background elements */}
      <svg
        className="absolute -left-10 -top-10 opacity-20 w-72 h-72"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#g1)" />
      </svg>

      <div className="relative z-10 w-full max-w-5xl mx-4 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white">
        {/* Left hero - clinic themed */}
        <div className="hidden md:flex flex-col items-center justify-center gap-6 p-10 bg-gradient-to-b from-[#0ea5a4] to-[#60a5fa] text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              {/* Simple stethoscope + cross icon */}
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2v6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 8a4 4 0 1 0 8 0v6a4 4 0 1 1-8 0V8z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="16.5" y="3.5" width="4" height="4" rx="1" fill="white" opacity="0.95" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Phòng khám Tự động</h3>
              <p className="text-sm opacity-90">Quản lý khám chữa bệnh & dược phẩm</p>
            </div>
          </div>

          <div className="text-center px-6">
            <p className="opacity-95">
              Truy cập nhanh hồ sơ bệnh nhân, lịch khám và kho thuốc — an toàn, bảo mật và trực quan.
            </p>
          </div>
        </div>

        {/* Right - login form */}
        <div className="p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white overflow-hidden bg-white/5">
                <img
                  src="/logo_phong_kham.png"
                  alt="Logo Phòng khám"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Đăng nhập hệ thống</h2>
                <p className="text-sm text-gray-500">Nhập thông tin tài khoản phòng khám để tiếp tục</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="text-sm text-gray-600 block mb-1">Tên đăng nhập</label>
                <input
                  id="username"
                  type="text"
                  className="w-full mt-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60a5fa]"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  aria-label="username"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm text-gray-600 block mb-1">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  className="w-full mt-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60a5fa]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  aria-label="password"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#0ea5a4] text-white py-3 rounded-lg hover:bg-[#089191] disabled:opacity-60"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
