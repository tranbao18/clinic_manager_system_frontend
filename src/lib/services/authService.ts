// src/lib/services/authService.ts
import { getAuthHeaderClient } from "@/lib/authHeaderClient";
const BASE_URL = "/api/auth";

const AuthService = {
  async registerAccountForEmployee(
    role: string,
    employee: {
      fullname: string;
      dob?: string | null;
      gender: string;
      phone: string;
      email: string;
      position: string;
      specialization?: string;
      address?: string;
    }
  ) {
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

    // Lưu token vào sessionStorage thay vì localStorage
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

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
    try {
      const authHeaders = getAuthHeaderClient();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
      
      const res = await fetch(`${BASE_URL}/employee/${employeeId}`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (res.status === 404) {
        // chỉ có user chưa tồn tại, vẫn trả employee=null
        return { employee: null, user: null };
      }

      if (!res.ok) throw new Error("Lỗi server");
      return res.json();
    } catch (err) {
      console.error(err);
      return { employee: null, user: null };
    }
  },

  async logout() {
    try {
      const authHeaders = getAuthHeaderClient();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
      
      const res = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      // Xóa token và user từ cả localStorage và sessionStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lỗi khi đăng xuất");
      }

      const data = await res.json();
      return data;
    } catch (err: unknown) {
      // Vẫn xóa storage ngay cả khi có lỗi
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      throw err;
    }
  },
};

export default AuthService;
