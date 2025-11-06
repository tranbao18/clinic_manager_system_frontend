import CalendarLayout from "@/components/layout/CalendarLayout";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import AppointmentsClient from "./AppointmentsClient";

export default async function AppointmentsPage() {
    let appointments: any[] = [];
    let doctors: any[] = [];
    let patients: any[] = [];
    let userRole = "";

    try {
        // Lấy user role từ session
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        userRole = session?.user?.role || "";

        const headers = await getAuthHeaderServer();
        // ✅ 1. Gọi API nội bộ (Next.js route) — có tự động gắn token qua getAuthHeaderServer()
        const resAppt = await fetch(`http://localhost:5050/api/appointments`, {
            cache: "no-store",
            headers,
        });
        if (!resAppt.ok) throw new Error(`Appointments HTTP ${resAppt.status}`);
        appointments = await resAppt.json();

        // ✅ Gọi API doctors
        const resDoctors = await fetch(`http://localhost:5050/api/employees`, {
            cache: "no-store",
            headers,
        });
        if (resDoctors.ok) doctors = await resDoctors.json();

        // ✅ Gọi API patients
        const resPatients = await fetch(`http://localhost:5050/api/patients`, {
            cache: "no-store",
            headers,
        });
        if (resPatients.ok) patients = await resPatients.json();

        // 🔗 Gắn tên bác sĩ và bệnh nhân
        appointments = appointments.map((a) => {
            const doctor = doctors.find((d) => d._id === a.doctor_id);
            const patient = patients.find((p) => p._id === a.patient_id);

            return {
                id: a._id,
                doctor_id: a.doctor_id,
                patient_id: a.patient_id,
                doctorName: doctor ? doctor.fullname : "Không rõ",
                patientName: patient ? patient.fullname : "Không rõ",
                appointmentDate: a.appointment_date,
                status: a.status,
                reason: a.reason,
                createdAt: a.created_at,
            };
        });
    } catch (err: any) {
        console.error("❌ getAppointments error:", err.message);
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">📅 Lịch hẹn khám</h1>
            <AppointmentsClient
                initialAppointments={appointments}
                userRole={userRole}
                doctors={doctors}
                patients={patients}
            />
        </div>
    );
}
