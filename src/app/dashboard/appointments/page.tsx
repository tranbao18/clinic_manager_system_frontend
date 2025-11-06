import AppointmentsClient from "./AppointmentsClient";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5050";

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

        const authHeaders = await getAuthHeaderServer();
        const headers: HeadersInit = authHeaders.Authorization 
            ? { Authorization: authHeaders.Authorization }
            : {};
        
        // ✅ 1. Gọi API appointments
        const resAppt = await fetch(`${API_URL}/api/appointments`, {
            cache: "no-store",
            headers,
        });
        if (!resAppt.ok) throw new Error(`Appointments HTTP ${resAppt.status}`);
        appointments = await resAppt.json();

        // ✅ 2. Gọi API employees và lọc chỉ lấy Bác sĩ
        const resDoctors = await fetch(`${API_URL}/api/employees`, {
            cache: "no-store",
            headers,
        });
        if (resDoctors.ok) {
            const allEmployees = await resDoctors.json();
            // Lọc chỉ lấy employees có position === "Bác sĩ"
            doctors = allEmployees.filter((emp: any) => emp.position === "Bác sĩ");
        }

        // ✅ 3. Gọi API patients
        const resPatients = await fetch(`${API_URL}/api/patients`, {
            cache: "no-store",
            headers,
        });
        if (resPatients.ok) patients = await resPatients.json();

        // 🔗 Gắn tên bác sĩ và bệnh nhân + chuẩn hoá status về UI values
        const mapApiToUiStatus = (s: string) => {
            if (s === "warning") return "Scheduled";
            if (s === "success") return "Completed";
            if (s === "error") return "Cancelled";
            return s;
        };

        appointments = appointments.map((a) => {
            const doctor = doctors.find((d) => d._id === a.doctor_id);
            const patient = patients.find((p) => p._id === a.patient_id);

            return {
                id: a._id,
                _id: a._id,
                doctor_id: a.doctor_id,
                patient_id: a.patient_id,
                doctorName: doctor ? doctor.fullname : "Không rõ",
                patientName: patient ? patient.fullname : "Không rõ",
                appointmentDate: a.appointment_date,
                status: mapApiToUiStatus(a.status),
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
                doctors={doctors}
                patients={patients}
            />
        </div>
    );
}
