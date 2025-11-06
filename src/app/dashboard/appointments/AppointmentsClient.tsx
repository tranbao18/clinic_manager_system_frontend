"use client";

import { useState, useEffect } from "react";
import CalendarLayout from "@/components/layout/CalendarLayout";
import { getAppointments } from "@/lib/services/appointmentsService";
import { getAuthHeaderServer } from "@/lib/authHeaderServer";

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
    userRole: string;
    doctors: Doctor[];
    patients: Patient[];
};

export default function AppointmentsClient({
    initialAppointments,
    userRole,
    doctors,
    patients,
}: AppointmentsClientProps) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

    const handleRefresh = async () => {
        try {
            const res = await fetch("/api/appointments", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to refresh");
            const data = await res.json();

            // Map lại với doctors và patients
            const mappedAppointments = data.map((a: any) => {
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
            userRole={userRole}
            doctors={doctors}
            patients={patients}
            onRefresh={handleRefresh}
        />
    );
}

