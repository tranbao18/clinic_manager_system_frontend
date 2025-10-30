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

      // ✅ Lưu token & user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      api.success({
        message: "Đăng nhập thành công 🎉",
        description: `Xin chào ${data.user.username}, chào mừng bạn quay lại hệ thống!`,
      });

      router.push("/dashboard");
    } catch (err: any) {
      api.error({
        message: "Lỗi hệ thống",
        description: err.message || "Có lỗi xảy ra khi đăng nhập",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-400">
      {contextHolder}
      <div className="bg-white rounded-2xl shadow-md w-[400px] p-8">
        <h2 className="text-center text-xl font-bold mb-2">Login to Account</h2>
        <p className="text-center text-gray-500 mb-6">
          Please enter your username and password to continue
        </p>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Username:</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded-md"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="yourusername"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
