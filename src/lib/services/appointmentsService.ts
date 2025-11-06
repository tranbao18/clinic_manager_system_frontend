// src/lib/services/appointmentsService.ts
import { getAuthHeaderClient } from "../authHeaderClient";

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
    status?: string;
    reason?: string;
    appointment_date?: string;
    doctor_id?: string;
    patient_id?: string;
}

export async function getAppointments(): Promise<Appointment[]> {
    try {
        // ✳️ Chú ý: phải có dấu "/" ở đầu để fetch route nội bộ
        const res = await fetch("/api/appointments", { cache: "no-store" });

        if (!res.ok) {
            throw new Error(`Failed to fetch appointments: ${res.status}`);
        }

        const data = await res.json();
        // đảm bảo luôn trả về mảng
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        console.error("❌ getAppointments errors:", error?.message || error);
        return [];
    }
}

export async function createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
        const headers = getAuthHeaderClient();
        const res = await fetch("/api/appointments", {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Failed to create appointment: ${res.status}`);
        }

        return await res.json();
    } catch (error: any) {
        console.error("❌ createAppointment error:", error?.message || error);
        throw error;
    }
}

export async function updateAppointment(
    id: string,
    data: UpdateAppointmentData
): Promise<Appointment> {
    try {
        const headers = getAuthHeaderClient();
        const res = await fetch(`/api/appointments/${id}`, {
            method: "PUT",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Failed to update appointment: ${res.status}`);
        }

        return await res.json();
    } catch (error: any) {
        console.error("❌ updateAppointment error:", error?.message || error);
        throw error;
    }
}

export async function deleteAppointment(id: string): Promise<void> {
    try {
        const headers = getAuthHeaderClient();
        const res = await fetch(`/api/appointments/${id}`, {
            method: "DELETE",
            headers,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Failed to delete appointment: ${res.status}`);
        }
    } catch (error: any) {
        console.error("❌ deleteAppointment error:", error?.message || error);
        throw error;
    }
}
