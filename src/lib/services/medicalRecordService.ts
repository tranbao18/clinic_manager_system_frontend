import { getAuthHeaderClient } from "@/lib/authHeaderClient";

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

export async function getMedicalRecords(): Promise<MedicalRecord[]> {
    const res = await fetch("/api/medical-records", {
        cache: "no-store",
        headers: getAuthHeaderClient()
    });
    if (!res.ok) throw new Error("Không thể lấy danh sách hồ sơ y tế");
    return res.json();
}

export async function getMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecord[]> {
    const res = await fetch(`/api/medical-records/patient/${patientId}`, {
        cache: "no-store",
        headers: getAuthHeaderClient()
    });
    if (!res.ok) throw new Error("Không thể lấy hồ sơ y tế");
    return res.json();
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
    const res = await fetch(`/api/medical-records/${id}`, {
        cache: "no-store",
        headers: getAuthHeaderClient()
    });
    if (!res.ok) throw new Error("Không thể lấy thông tin hồ sơ y tế");
    return res.json();
}

export async function createMedicalRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaderClient()
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể tạo hồ sơ y tế");
    return res.json();
}

export async function updateMedicalRecord(
    id: string,
    data: Partial<MedicalRecord>
): Promise<MedicalRecord> {
    const res = await fetch(`/api/medical-records/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaderClient()
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể cập nhật hồ sơ y tế");
    return res.json();
}

export async function deleteMedicalRecord(id: string, permanent = false): Promise<void> {
    const url = `/api/medical-records/${id}` + (permanent ? "?hard=true" : "");
    const res = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaderClient()
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể xóa hồ sơ y tế" }));
        throw new Error(error.error || error.message || "Không thể xóa hồ sơ y tế");
    }
}

export async function getDisabledMedicalRecords(): Promise<MedicalRecord[]> {
    const res = await fetch("/api/medical-records?disabled=true", {
        cache: "no-store",
        headers: getAuthHeaderClient()
    });
    if (!res.ok) throw new Error("Không thể lấy danh sách hồ sơ y tế đã xóa");
    return res.json();
}

export async function getDisabledMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecord[]> {
    try {
        const allDisabled = await getDisabledMedicalRecords();
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

export async function restoreMedicalRecord(id: string): Promise<MedicalRecord> {
    const res = await fetch(`/api/medical-records/${id}/restore`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaderClient()
        },
    });
    if (!res.ok) throw new Error("Không thể khôi phục hồ sơ y tế");
    return res.json();
}

