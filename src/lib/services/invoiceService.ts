// src/lib/services/invoiceService.ts

export interface Invoice {
    _id: string;
    patient_id: string | { _id: string; fullname?: string; phone?: string; email?: string };
    appointment_id: string | { _id: string; appointment_date?: string; status?: string; reason?: string };
    total_amount: number;
    status: 'Unpaid' | 'Paid' | 'Partial';
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
    status?: 'Unpaid' | 'Paid' | 'Partial';
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
                    error: errorData
                });
            } catch (e) {
                // Nếu không parse được JSON, lấy text
                const errorText = await res.text();
                console.error("getInvoices API error (text):", {
                    status: res.status,
                    statusText: res.statusText,
                    error: errorText
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
                    const pid = typeof inv.patient_id === 'object' ? inv.patient_id._id : inv.patient_id;
                    return pid === filters.patient_id;
                });
            }
            if (filters.appointment_id) {
                invoices = invoices.filter((inv: Invoice) => {
                    const aid = typeof inv.appointment_id === 'object' ? inv.appointment_id._id : inv.appointment_id;
                    return aid === filters.appointment_id;
                });
            }
            if (filters.status) {
                invoices = invoices.filter((inv: Invoice) => inv.status === filters.status);
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
    const res = await fetch(`/api/invoices/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy thông tin hóa đơn");
    return res.json();
}

// 🔍 Lấy hóa đơn theo patient_id
export async function getInvoicesByPatientId(patientId: string): Promise<Invoice[]> {
    try {
        // Sử dụng GET /api/invoices với query param patient_id
        return await getInvoices({ patient_id: patientId });
    } catch (error: any) {
        console.error("getInvoicesByPatientId error:", error);
        return [];
    }
}

// 🔍 Lấy hóa đơn theo appointment_id
export async function getInvoiceByAppointmentId(appointmentId: string): Promise<Invoice[]> {
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

// ➕ Tạo hóa đơn từ Medical Record (tự động tính tổng tiền từ prescriptions)
export async function createInvoiceFromMedicalRecord(
    data: CreateInvoiceFromMedicalRecordData
): Promise<Invoice> {
    // Lấy medical record để tính tổng tiền
    const { getMedicalRecordById } = await import('./medicalRecordService');
    const medicalRecord = await getMedicalRecordById(data.medicalRecordId);
    
    // Kiểm tra có appointment_id không (bắt buộc vì backend validator yêu cầu)
    if (!medicalRecord.appointment_id) {
        throw new Error('Hồ sơ y tế phải có lịch hẹn để tạo hóa đơn. Vui lòng liên kết hồ sơ với lịch hẹn trước.');
    }
    
    // Kiểm tra có prescriptions không
    if (!medicalRecord.prescriptions || medicalRecord.prescriptions.length === 0) {
        throw new Error('Hồ sơ y tế phải có toa thuốc để tạo hóa đơn');
    }
    
    // Tính tổng tiền từ prescriptions
    let totalAmount = 0;
    for (const prescription of medicalRecord.prescriptions) {
        const medicine = prescription.medicine_id;
        if (typeof medicine === 'object' && medicine?.price && prescription.quantity) {
            totalAmount += medicine.price * prescription.quantity;
        }
    }
    
    if (totalAmount === 0) {
        throw new Error('Tổng tiền bằng 0. Vui lòng kiểm tra giá thuốc và số lượng.');
    }
    
    // Lấy patient_id và appointment_id
    const patientId = typeof medicalRecord.patient_id === 'object' 
        ? medicalRecord.patient_id._id 
        : medicalRecord.patient_id;
    
    const appointmentId = typeof medicalRecord.appointment_id === 'object'
        ? medicalRecord.appointment_id._id
        : medicalRecord.appointment_id;
    
    // Kiểm tra appointment_id có hợp lệ không
    if (!appointmentId || appointmentId === '') {
        throw new Error('Lịch hẹn không hợp lệ. Vui lòng kiểm tra lại hồ sơ y tế.');
    }
    
    // Kiểm tra xem đã có invoice cho appointment này chưa
    const existingInvoices = await getInvoices({ appointment_id: appointmentId });
    if (existingInvoices.length > 0) {
        throw new Error('Hóa đơn đã tồn tại cho lịch hẹn này');
    }
    
    // Tạo invoice mới
    return await createInvoice({
        patient_id: patientId,
        appointment_id: appointmentId,
        total_amount: totalAmount,
        status: 'Unpaid'
    });
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
    const { getPaymentsByInvoiceId } = await import('./paymentService');
    const payments = await getPaymentsByInvoiceId(id);
    
    // Tính tổng tiền đã thanh toán
    const paidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalAmount = invoice.total_amount || 0;
    
    // Xác định status mới
    let newStatus: 'Unpaid' | 'Paid' | 'Partial' = 'Unpaid';
    if (paidAmount >= totalAmount) {
        newStatus = 'Paid';
    } else if (paidAmount > 0) {
        newStatus = 'Partial';
    }
    
    // Cập nhật status
    return await updateInvoice(id, { status: newStatus });
}

// ❌ Xóa hóa đơn (soft delete)
export async function deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Không thể xóa hóa đơn");
}

