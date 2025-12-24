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

// ❌ Xóa hồ sơ y tế (soft delete - set disabled: true)
export async function deleteMedicalRecord(id: string, permanent = false): Promise<void> {
    const url = `/api/medical-records/${id}` + (permanent ? "?hard=true" : "");
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể xóa hồ sơ y tế" }));
        throw new Error(error.error || error.message || "Không thể xóa hồ sơ y tế");
    }
}

// 📦 Lấy danh sách hồ sơ y tế đã xóa (disabled: true)
export async function getDisabledMedicalRecords(): Promise<MedicalRecord[]> {
    const res = await fetch("/api/medical-records?disabled=true", { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể lấy danh sách hồ sơ y tế đã xóa");
    return res.json();
}

// 📦 Lấy danh sách hồ sơ y tế đã xóa theo patient_id
export async function getDisabledMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecord[]> {
    try {
        const allDisabled = await getDisabledMedicalRecords();
        // Filter theo patient_id (xử lý cả trường hợp patient_id là object hoặc string)
        return allDisabled.filter((record) => {
            const recordPatientId = typeof record.patient_id === 'object' && record.patient_id
                ? (record.patient_id as any)._id
                : record.patient_id;
            return recordPatientId === patientId;
        });
    } catch (error: any) {
        console.error("getDisabledMedicalRecordsByPatientId error:", error);
        return [];
    }
}

// ♻️ Khôi phục hồ sơ y tế (set disabled: false)
export async function restoreMedicalRecord(id: string): Promise<MedicalRecord> {
    const res = await fetch(`/api/medical-records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: false }),
    });
    if (!res.ok) throw new Error("Không thể khôi phục hồ sơ y tế");
    return res.json();
}

