// src/lib/services/invoiceService.ts

export interface Invoice {
  _id: string;
  patient_id:
  | string
  | { _id: string; fullname?: string; phone?: string; email?: string };
  appointment_id:
  | string
  | {
    _id: string;
    appointment_date?: string;
    status?: string;
    reason?: string;
  };
  total_amount: number;
  status: "Unpaid" | "Paid" | "Partial";
  created_at: string;
  updated_at: string;
  disabled?: boolean;
  paid_amount?: number; // Từ API khi getById
  remaining_amount?: number; // Từ API khi getById
}

export interface CreateInvoiceData {
  patient_id: string;
  appointment_id: string;
  total_amount: number;
  status?: "Unpaid" | "Paid" | "Partial";
}

export interface CreateInvoiceFromMedicalRecordData {
  medicalRecordId: string;
}

// 📦 Lấy danh sách hóa đơn
export async function getInvoices(filters?: {
  patient_id?: string;
  appointment_id?: string;
  status?: string;
}): Promise<Invoice[]> {
  try {
    const res = await fetch("/api/invoices", { cache: "no-store" });

    if (!res.ok) {
      // Đọc response body để lấy thông tin lỗi chi tiết
      let errorMessage = "Không thể lấy danh sách hóa đơn";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
        console.error("getInvoices API error:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
      } catch (e) {
        // Nếu không parse được JSON, lấy text
        const errorText = await res.text();
        console.error("getInvoices API error (text):", {
          status: res.status,
          statusText: res.statusText,
          error: errorText,
        });
        errorMessage = errorText || errorMessage;
      }
      // Không throw error, chỉ log và return [] để không làm crash app
      console.warn("⚠️ Không thể lấy danh sách hóa đơn, trả về mảng rỗng");
      return [];
    }

    let invoices = await res.json();

    // Đảm bảo invoices là array
    if (!Array.isArray(invoices)) {
      console.warn("⚠️ Response không phải array, trả về mảng rỗng");
      return [];
    }

    // Filter ở client side vì backend không hỗ trợ filter
    if (filters) {
      if (filters.patient_id) {
        invoices = invoices.filter((inv: Invoice) => {
          const pid =
            typeof inv.patient_id === "object"
              ? inv.patient_id._id
              : inv.patient_id;
          return pid === filters.patient_id;
        });
      }
      if (filters.appointment_id) {
        invoices = invoices.filter((inv: Invoice) => {
          const aid =
            typeof inv.appointment_id === "object"
              ? inv.appointment_id._id
              : inv.appointment_id;
          return aid === filters.appointment_id;
        });
      }
      if (filters.status) {
        invoices = invoices.filter(
          (inv: Invoice) => inv.status?.trim() === filters.status
        );
      }
    }

    return invoices;
  } catch (error: any) {
    console.error("getInvoices exception:", error);
    // Trả về mảng rỗng thay vì throw error để không làm crash app
    return [];
  }
}

// 🔍 Lấy chi tiết hóa đơn theo ID
export async function getInvoiceById(id: string): Promise<Invoice> {
  try {
    const res = await fetch(`/api/invoices/${id}`, { cache: "no-store" });

    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.json()).error;
      } catch { }
      throw new Error(detail || "Không thể lấy thông tin hóa đơn");
    }

    return res.json();
  } catch (err: any) {
    console.error("getInvoiceById error:", err);
    throw err;
  }
}

// 🔍 Lấy hóa đơn theo patient_id
export async function getInvoicesByPatientId(
  patientId: string
): Promise<Invoice[]> {
  try {
    // Sử dụng endpoint riêng cho patient_id (hỗ trợ Doctor role)
    const res = await fetch(`/api/invoices/patient/${patientId}`, { cache: "no-store" });

    if (!res.ok) {
      // Nếu lỗi, trả về mảng rỗng thay vì throw error
      console.warn("getInvoicesByPatientId: Không thể lấy hóa đơn, trả về mảng rỗng");
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data ? [data] : []);
  } catch (error: any) {
    console.error("getInvoicesByPatientId error:", error);
    return [];
  }
}

// 🔍 Lấy hóa đơn theo appointment_id
export async function getInvoiceByAppointmentId(
  appointmentId: string
): Promise<Invoice[]> {
  try {
    // Sử dụng GET /api/invoices với query param appointment_id
    return await getInvoices({ appointment_id: appointmentId });
  } catch (error: any) {
    console.error("getInvoiceByAppointmentId error:", error);
    return [];
  }
}

// ➕ Tạo hóa đơn thủ công
export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  const res = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Không thể tạo hóa đơn");
  }
  return res.json();
}

// ➕ Tạo hóa đơn từ Medical Record (sử dụng endpoint backend)
export async function createInvoiceFromMedicalRecord(
  data: CreateInvoiceFromMedicalRecordData
): Promise<Invoice> {
  try {
    const res = await fetch(
      `/api/invoices/from-medical-record/${data.medicalRecordId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.detail || "Không thể tạo hóa đơn từ hồ sơ y tế");
    }

    return await res.json();
  } catch (err: any) {
    console.error("createInvoiceFromMedicalRecord error:", err);
    throw err;
  }
}

// ✏️ Cập nhật hóa đơn
export async function updateInvoice(
  id: string,
  data: Partial<CreateInvoiceData>
): Promise<Invoice> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Không thể cập nhật hóa đơn");
  }
  return res.json();
}

// 🔄 Cập nhật status tự động (dựa trên payments)
export async function updateInvoiceStatus(id: string): Promise<Invoice> {
  // Lấy invoice và payments để tính status
  const invoice = await getInvoiceById(id);
  const { getPaymentsByInvoiceId } = await import("./paymentService");
  const payments = await getPaymentsByInvoiceId(id);

  // Tính tổng tiền đã thanh toán
  const paidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalAmount = invoice.total_amount || 0;

  // Xác định status mới
  let newStatus: "Unpaid" | "Paid" | "Partial" = "Unpaid";
  if (paidAmount >= totalAmount) {
    newStatus = "Paid";
  } else if (paidAmount > 0) {
    newStatus = "Partial";
  }

  // Cập nhật status
  return await updateInvoice(id, { status: newStatus });
}

// ❌ Xóa hóa đơn (soft delete)
export async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error;
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Không thể xóa hóa đơn");
  }
}
