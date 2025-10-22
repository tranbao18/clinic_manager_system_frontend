// src/lib/services/patientsService.ts

export interface Patient {
    id: string;
    fullName: string;
    dob: string; // ISO date string
    gender: string;
    address: string;
    phone: string;
    email: string;
    medicalHistory: string;
    createdAt: string;
}

// Lấy danh sách bệnh nhân
export async function getPatients(): Promise<Patient[]> {
    const res = await fetch("/api/patients", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch patients");
    return res.json();
}

// Lấy chi tiết bệnh nhân theo ID
export async function getPatientById(id: string): Promise<Patient> {
    const res = await fetch(`/api/patients/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch patient detail");
    return res.json();
}

// Tạo bệnh nhân mới
export async function createPatient(data: Partial<Patient>): Promise<Patient> {
    const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create patient");
    return res.json();
}

// Cập nhật thông tin bệnh nhân (PATCH)
export async function updatePatient(
    id: string,
    data: Partial<Patient>
): Promise<Patient> {
    const res = await fetch(`/api/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update patient");
    return res.json();
}

// Xóa bệnh nhân
export async function deletePatient(id: string): Promise<void> {
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete patient");
}
