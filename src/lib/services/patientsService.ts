// src/lib/services/patientsService.ts

export interface Patient {
    _id: string;
    fullname: string;
    dob: string; // ISO date string
    gender: string; // "Nam" | "Nữ"
    address: string;
    phone: string;
    email: string;
    medical_history: {
        khoa: string;
        description: string;
    }[];
    created_at: string;
    updated_at: string;
}

// 📦 Lấy danh sách bệnh nhân
export async function getPatients(): Promise<Patient[]> {
    const res = await fetch("/api/patients", { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy danh sách bệnh nhân");
    return res.json();
}

// 🔍 Lấy chi tiết bệnh nhân theo ID
export async function getPatientById(id: string): Promise<Patient> {
    const res = await fetch(`/api/patients/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy thông tin bệnh nhân");
    return res.json();
}

// ➕ Tạo bệnh nhân mới
export async function createPatient(data: Partial<Patient>): Promise<Patient> {
    const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể tạo bệnh nhân");
    return res.json();
}

// ✏️ Cập nhật thông tin bệnh nhân
export async function updatePatient(
    id: string,
    data: Partial<Patient>
): Promise<Patient> {
    const res = await fetch(`/api/patients/${id}`, {
        method: "PUT", // backend của bạn dùng PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể cập nhật bệnh nhân");
    return res.json();
}

// ❌ Xóa bệnh nhân
export async function deletePatient(id: string): Promise<void> {
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Không thể xóa bệnh nhân");
}
