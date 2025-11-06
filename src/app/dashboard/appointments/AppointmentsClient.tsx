"use client";

import { useState } from "react";
import CalendarLayout from "@/components/layout/CalendarLayout";

type Appointment = {
    id: string;
    doctor_id?: string;
    patient_id?: string;
    doctorName: string;
    patientName: string;
    appointmentDate: string;
    status: string;
    reason: string;
    createdAt: string;
};

type Doctor = {
    _id: string;
    fullname: string;
    position: string;
};

type Patient = {
    _id: string;
    fullname: string;
};

type AppointmentsClientProps = {
    initialAppointments: Appointment[];
    doctors: Doctor[];
    patients: Patient[];
};

export default function AppointmentsClient({
    initialAppointments,
    doctors,
    patients,
}: AppointmentsClientProps) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

    const handleRefresh = async () => {
        try {
            const res = await fetch("/api/appointments", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to refresh");
            const data = await res.json();

            // Map status từ API về UI values
            const mapApiToUiStatus = (s: string) => {
                if (s === "warning") return "Scheduled";
                if (s === "success") return "Completed";
                if (s === "error") return "Cancelled";
                return s;
            };

            // Map lại với doctors và patients
            const mappedAppointments = data.map((a: {
                _id: string;
                doctor_id?: string;
                patient_id?: string;
                appointment_date: string;
                status: string;
                reason?: string;
                created_at?: string;
            }) => {
                const doctor = doctors.find((d) => d._id === a.doctor_id);
                const patient = patients.find((p) => p._id === a.patient_id);

                return {
                    id: a._id,
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

            setAppointments(mappedAppointments);
        } catch (error) {
            console.error("Refresh error:", error);
            // Fallback: reload page
            window.location.reload();
        }
    };

    return (
        <CalendarLayout
            appointments={appointments}
            doctors={doctors}
            patients={patients}
        />
    );
}

