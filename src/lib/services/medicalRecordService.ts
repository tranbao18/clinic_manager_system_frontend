// src/lib/services/medicalRecordService.ts

export interface Prescription {
    medicine_id: string | { _id: string; name: string; unit: string; price: number };
    quantity: number;
    dosage: string;
}

export interface MedicalRecord {
    _id: string;
    appointment_id?: string | { _id: string };
    patient_id: string | { _id: string };
    doctor_id: string | { _id: string; fullname?: string };
    diagnosis: string;
    treatment?: string;
    prescriptions: Prescription[];
    notes?: string;
    created_at: string;
    updated_at: string;
}

// 📦 Lấy danh sách hồ sơ y tế
export async function getMedicalRecords(): Promise<MedicalRecord[]> {
    const res = await fetch("/api/medical-records", { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy danh sách hồ sơ y tế");
    return res.json();
}

// 🔍 Lấy hồ sơ y tế theo patient_id
export async function getMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecord[]> {
    const res = await fetch(`/api/medical-records/patient/${patientId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy hồ sơ y tế");
    return res.json();
}

// 🔍 Lấy chi tiết hồ sơ y tế theo ID
export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
    const res = await fetch(`/api/medical-records/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy thông tin hồ sơ y tế");
    return res.json();
}

// ➕ Tạo hồ sơ y tế mới
export async function createMedicalRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể tạo hồ sơ y tế");
    return res.json();
}

// ✏️ Cập nhật hồ sơ y tế
export async function updateMedicalRecord(
    id: string,
    data: Partial<MedicalRecord>
): Promise<MedicalRecord> {
    const res = await fetch(`/api/medical-records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể cập nhật hồ sơ y tế");
    return res.json();
}

// ❌ Xóa hồ sơ y tế
export async function deleteMedicalRecord(id: string): Promise<void> {
    const res = await fetch(`/api/medical-records/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Không thể xóa hồ sơ y tế");
}

