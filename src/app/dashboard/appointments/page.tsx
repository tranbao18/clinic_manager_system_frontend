import CalendarLayout from "@/components/layout/CalendarLayout";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";
import { env } from "process";

export default async function AppointmentsPage() {
    let appointments: any[] = [];
    let doctors: any[] = [];
    let patients: any[] = [];

    try {
        const headers = await getAuthHeaderServer();
        // ✅ 1. Gọi API nội bộ (Next.js route) — có tự động gắn token qua getAuthHeaderServer()
            const resAppt = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/appointments`, {
            cache: "no-store",
            headers,
        });
        if (!resAppt.ok) throw new Error(`Appointments HTTP ${resAppt.status}`);
        appointments = await resAppt.json();

        // ✅ Gọi API employees và lọc chỉ lấy Bác sĩ
            const resDoctors = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/employees`, {
            cache: "no-store",
            headers,
        });
        if (resDoctors.ok) {
            const allEmployees = await resDoctors.json();
            // Lọc chỉ lấy employees có position === "Bác sĩ"
            doctors = allEmployees.filter((emp: any) => emp.position === "Bác sĩ");
        }

        // ✅ Gọi API patients
            const resPatients = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/api/patients`, {
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
            <CalendarLayout 
                appointments={appointments} 
                doctors={doctors}
                patients={patients}
            />
        </div>
    );
}
