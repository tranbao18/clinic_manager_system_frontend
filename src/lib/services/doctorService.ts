export interface Doctor {
    id: string;
    name: string;
    avatar: string;
    gender: string;
    email: string;
    city: string;
    birthdate: string;
    address: string;
    createdAt: string;
}


// Lấy danh sách bác sĩ
export async function getDoctors(): Promise<Doctor[]> {
    const res = await fetch("/api/doctors", { cache: "no-store" });
    return res.json();
}

// Lấy chi tiết bác sĩ
export async function getDoctorById(id: string): Promise<Doctor> {
    const res = await fetch(`/api/doctors/${id}`, { cache: "no-store" });
    return res.json();
}

// Tạo bác sĩ mới
export async function createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Cập nhật bác sĩ (PATCH)
export async function updateDoctor(
    id: string,
    data: Partial<Doctor>
): Promise<Doctor> {
    const res = await fetch(`/api/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Xóa bác sĩ
export async function deleteDoctor(id: string): Promise<void> {
    await fetch(`/api/doctors/${id}`, { method: "DELETE" });
}

