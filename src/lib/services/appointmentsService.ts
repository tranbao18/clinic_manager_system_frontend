import { getSafeAuthHeaders } from "@/lib/authHeaderClient";

export interface Appointment {
    _id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string; // ISO string
    status: string;
    reason: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAppointmentData {
    patient_id: string;
    doctor_id: string;
    appointment_date: string; // ISO string
    status?: string;
    reason?: string;
}


export interface UpdateAppointmentData {
    patient_id?: string;
    doctor_id?: string;
    appointment_date?: string;
    status?: string;
    reason?: string;
}

export async function getAppointments(): Promise<Appointment[]> {
    try {
        const headers = getSafeAuthHeaders() as Record<string, string>;
        try { console.debug("🔁 getAppointments headers:", headers); } catch (e) { }

        const res = await fetch("/api/appointments", {
            cache: "no-store",
            headers
        });
        if (!res.ok) {
            // try to extract response body for better debugging
            let bodyText = "";
            try {
                bodyText = await res.text();
            } catch (e) { }
            console.error("getAppointments failed:", { status: res.status, body: bodyText });
            throw new Error(`Failed to fetch appointments: ${res.status}`);
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        console.error("❌ getAppointments errors:", error?.message || error);
        return [];
    }
}


export async function getAppointmentById(id: string): Promise<Appointment> {
    const res = await fetch(`/api/appointments/${id}`, {
        cache: "no-store",
        headers: getSafeAuthHeaders()
    });
    if (!res.ok) throw new Error("Không thể lấy thông tin lịch hẹn");
    return res.json();
}

export async function createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getSafeAuthHeaders()
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể tạo lịch hẹn" }));
        throw new Error(error.error || "Không thể tạo lịch hẹn");
    }
    return res.json();
}

export async function updateAppointment(
    id: string,
    data: UpdateAppointmentData
): Promise<Appointment> {

    const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getSafeAuthHeaders()
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể cập nhật lịch hẹn" }));
        throw new Error(error.error || "Không thể cập nhật lịch hẹn");
    }
    return res.json();
}

export async function deleteAppointment(id: string): Promise<void> {
    const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: getSafeAuthHeaders()
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể xóa lịch hẹn" }));
        throw new Error(error.error || "Không thể xóa lịch hẹn");
    }
}

export async function getDisabledAppointments(): Promise<Appointment[]> {
    const res = await fetch("/api/appointments?disabled=true", {
        cache: "no-store",
        headers: getSafeAuthHeaders()
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể lấy danh sách lịch hẹn đã xóa" }));
        throw new Error(error.error || "Không thể lấy danh sách lịch hẹn đã xóa");
    }
    return res.json();
}

export async function restoreAppointment(id: string): Promise<Appointment> {
    const res = await fetch(`/api/appointments/${id}/restore`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getSafeAuthHeaders()
        },
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Không thể khôi phục lịch hẹn" }));
        throw new Error(error.error || "Không thể khôi phục lịch hẹn");
    }
    return res.json();
}
