// src/lib/services/authService.ts
const BASE_URL = "/api/auth";

const AuthService = {
  async registerAccountForEmployee(role: string, employee: any) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, employee }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Server error:", text);
      throw new Error(text || "Lỗi khi tạo tài khoản");
    }

    return res.json();
  },

  async login(username: string, password: string) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error || "Tên đăng nhập hoặc mật khẩu sai");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data.user;
  },
};

export default AuthService;
