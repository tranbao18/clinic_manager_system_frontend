// src/lib/services/appointmentsService.ts
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
