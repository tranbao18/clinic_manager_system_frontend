// src/lib/services/usersService.ts
import { getAuthHeaderServer } from "@/lib/authHeaderServer";
import { getAuthHeaderClient } from "@/lib/authHeaderClient";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";
const API_URL = `${BASE_URL}/api/users`;

// ✅ Auto chọn header phù hợp (server hoặc client)
async function getAuthHeaders() {
  if (typeof window === "undefined") {
    // SSR (Next.js server component)
    return await getAuthHeaderServer();
  } else {
    // Client (browser)
    return getAuthHeaderClient();
  }
}

const UsersService = {
  // src/lib/services/usersService.ts
  async getByEmployeeId(employeeId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/auth/employee/${employeeId}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Không thể tải thông tin tài khoản");

    const data = await response.json(); // { user, employee }
    return data; // trả nguyên object
  },

  async getById(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Không thể tải thông tin người dùng");
    return response.json();
  },

  async create(data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Không thể tạo tài khoản");
    return response.json();
  },

  async update(id: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Không thể cập nhật tài khoản");
    return response.json();
  },

  async delete(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) throw new Error("Không thể xóa tài khoản");
    return response.json();
  },
};

export default UsersService;
