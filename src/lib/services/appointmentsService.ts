// src/lib/services/appointmentsService.ts
export interface Appointment {
    id: string;
    patientId: number;
    doctorId: number;
    // API trả về ISO string, nên để string
    appointmentDate: string;
    status: string;
    reason: string;
    createdAt: string;
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
        console.error("❌ getAppointments error:", error?.message || error);
        return [];
    }
}
