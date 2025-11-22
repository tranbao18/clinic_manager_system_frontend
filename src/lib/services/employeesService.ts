import { getAuthHeaderClient } from "@/lib/authHeaderClient";

const BASE_URL = "/api/employees";

const EmployeesService = {
  async getAll() {
    try {
      const res = await fetch(BASE_URL, {
        cache: "no-store",
        headers: getAuthHeaderClient(),
      });
      if (!res.ok) throw new Error("Lỗi khi tải danh sách nhân viên");
      return await res.json();
    } catch (error: any) {
      console.error("getAll error:", error.message);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        cache: "no-store",
        headers: getAuthHeaderClient(),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Lỗi khi tải nhân viên: ${text}`);
      return JSON.parse(text);
    } catch (error: any) {
      console.error("getById error:", error.message);
      throw error;
    }
  },

  async createEmployee(data: any) {
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaderClient(),
        },
        body: JSON.stringify(data),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Backend error:", text);
        throw new Error(`Lỗi khi tạo nhân viên: ${text}`);
      }

      try {
        return JSON.parse(text);
      } catch (err) {
        console.error("❌ Response không phải JSON:", text);
        throw new Error("Phản hồi backend không hợp lệ (không phải JSON)");
      }
    } catch (error: any) {
      console.error("createEmployee error:", error.message);
      throw error;
    }
  },

  async updateEmployee(id: string, data: any) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaderClient(),
        },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Lỗi khi cập nhật nhân viên: ${text}`);
      return JSON.parse(text);
    } catch (error: any) {
      console.error("updateEmployee error:", error.message);
      throw error;
    }
  },

  async deleteEmployee(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaderClient(),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Lỗi khi xóa nhân viên: ${text}`);
      return JSON.parse(text);
    } catch (error: any) {
      console.error("deleteEmployee error:", error.message);
      throw error;
    }
  },

  // 📦 Lấy danh sách nhân viên đã xóa (disabled: true)
  async getDisabledEmployees() {
    try {
      const res = await fetch(`${BASE_URL}?disabled=true`, {
        cache: "no-store",
        headers: getAuthHeaderClient(),
      });
      if (!res.ok) throw new Error("Lỗi khi tải danh sách nhân viên đã xóa");
      return await res.json();
    } catch (error: any) {
      console.error("getDisabledEmployees error:", error.message);
      throw error;
    }
  },

  // ♻️ Khôi phục nhân viên (set disabled: false)
  async restoreEmployee(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaderClient(),
        },
        body: JSON.stringify({ disabled: false }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Lỗi khi khôi phục nhân viên: ${text}`);
      return JSON.parse(text);
    } catch (error: any) {
      console.error("restoreEmployee error:", error.message);
      throw error;
    }
  },
};

export default EmployeesService;
