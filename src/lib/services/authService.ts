// src/lib/services/authService.ts
import { getAuthHeaderClient } from "@/lib/authHeaderClient";
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


  async getAccountByUserId(id: string) {
    const res = await fetch(`${BASE_URL}/account/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Không thể tải thông tin tài khoản");
    return res.json();
  },

  async getEmployeeById(employeeId: string) {
    const res = await fetch(`${BASE_URL}/employee/${employeeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaderClient(),
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Không thể tải thông tin nhân viên và tài khoản");
    return res.json(); // trả về { user, employee }
  }



};

export default AuthService;
