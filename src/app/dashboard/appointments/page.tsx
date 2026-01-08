"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import CalendarLayout from "@/components/layout/CalendarLayout";
import { getPatients } from "@/lib/services/patientsService";

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
    initialAppointments = [],
    doctors: initialDoctors = [],
    patients: initialPatients = [],
}: AppointmentsClientProps) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
    const [patients, setPatients] = useState<Patient[]>(initialPatients);
    const [userRole, setUserRole] = useState<string>("");
    const [userEmployeeId, setUserEmployeeId] = useState<string | null>(null);
    const [canManage, setCanManage] = useState<boolean>(false);
    const router = useRouter();
    const normalizeId = (val: any): string | null => {
        if (val === undefined || val === null) return null;
        if (typeof val === "string") return val;
        if (typeof val === "object") {
            if (val._id) return String(val._id);
            if (val.toString) return String(val.toString());
        }
        return String(val);
    };
    const resolvePatientNameFromAppointment = (appt: any, patientsList: Patient[]) => {
        if (!appt || appt.patient_id === undefined || appt.patient_id === null) return "Không rõ";
        const pid = appt.patient_id;
        if (typeof pid === "object") {
            if (pid.fullname) return pid.fullname;
            const idFromObj = pid._id ? String(pid._id) : (pid.toString ? String(pid.toString()) : null);
            if (idFromObj) {
                const found = patientsList.find((p) => String(p._id) === idFromObj);
                if (found) return found.fullname;
            }
            return "Không rõ";
        }
        const found = patientsList.find((p) => String(p._id) === String(pid));
        return found ? found.fullname : "Không rõ";
    };

    // TỰ VIẾT
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userRes = await fetch("/api/users/me", { cache: "no-store" });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    const role = userData.role || "";
                    const employeeId = userData.employee_id || null;

                    setUserRole(role);
                    setUserEmployeeId(employeeId);
                    setCanManage(role === "Admin" || role === "Receptionist");

                    // Redirect pharmacist về trang phù hợp nếu truy cập trực tiếp URL
                    if (role === "pharmacist") {
                        router.push("/dashboard/medicines");
                        return;
                    }
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };
        fetchUserInfo();
    }, [router]);
    //

    // TỰ VIẾT
    useEffect(() => {
        // Chỉ fetch data nếu user có quyền truy cập
        if (userRole && userRole !== "pharmacist") {
            const fetchData = async () => {
                try {
                    let doctorsList: Doctor[] = [];
                    let allEmployeesData: any[] = [];
                    const employeesRes = await fetch("/api/employees", { cache: "no-store" });
                    if (employeesRes.ok) {
                        const employeesData = await employeesRes.json();
                        allEmployeesData = Array.isArray(employeesData) ? employeesData : [];
                        doctorsList = allEmployeesData
                            .filter((emp: any) => emp.position === "Bác sĩ")
                            .map((emp: any) => ({
                                _id: String(emp._id),
                                fullname: emp.fullname,
                                position: emp.position,
                            }));
                        setDoctors(doctorsList);
                    }

                    let mappedPatients: Patient[] = [];
                    try {
                        const patientsList = await getPatients();
                        mappedPatients = patientsList.map((p: any) => ({
                            _id: String(p._id),
                            fullname: p.fullname,
                        }));
                        setPatients(mappedPatients);
                    } catch (error) {
                        console.error("Error fetching patients:", error);
                    }

                    // Chỉ fetch appointments nếu user có quyền truy cập
                    if (userRole === "Admin" || userRole === "Receptionist" || userRole === "Doctor" || userRole === "Accountant") {
                        const appointmentsRes = await fetch("/api/appointments", { cache: "no-store" });
                        if (appointmentsRes.ok) {
                            const appointmentsData = await appointmentsRes.json();

                            const mapApiToUiStatus = (s: string) => {
                                if (s === "warning") return "Scheduled";
                                if (s === "success") return "Completed";
                                if (s === "error") return "Cancelled";
                                if (s === "Scheduled" || s === "Completed" || s === "Cancelled") return s;
                                return s;
                            };

                            const findDoctor = (doctorId: string | null): Doctor | null => {
                                if (!doctorId) return null;
                                const normalizedDoctorId = String(doctorId);

                                let doctor = doctorsList.find((d: Doctor) => {
                                    return String(d._id) === normalizedDoctorId;
                                });

                                if (!doctor) {
                                    const employee = allEmployeesData.find((emp: any) => {
                                        return String(emp._id) === normalizedDoctorId;
                                    });

                                    if (employee) {
                                        doctor = {
                                            _id: String(employee._id),
                                            fullname: employee.fullname,
                                            position: employee.position || "",
                                        };
                                        if (employee.position === "Bác sĩ") {
                                            doctorsList.push(doctor);
                                        }
                                    }
                                }

                                return doctor || null;
                            };

                            let mappedAppointments = appointmentsData.map((a: {
                                _id: string;
                                doctor_id?: string;
                                patient_id?: string;
                                appointment_date: string;
                                status: string;
                                reason?: string;
                                created_at?: string;
                            }) => {
                                const appointmentDoctorId = normalizeId(a.doctor_id);
                                const appointmentPatientId = normalizeId(a.patient_id);

                                const doctor = findDoctor(appointmentDoctorId);
                                const patientName = resolvePatientNameFromAppointment(a, mappedPatients);

                                return {
                                    id: a._id,
                                    doctor_id: appointmentDoctorId || undefined,
                                    patient_id: appointmentPatientId || undefined,
                                    doctorName: doctor ? doctor.fullname : "Không rõ",
                                    patientName: patientName,
                                    appointmentDate: a.appointment_date,
                                    status: mapApiToUiStatus(a.status),
                                    reason: a.reason,
                                    createdAt: a.created_at,
                                };
                            });

                            if (!canManage) {
                                if (userEmployeeId) {
                                    const normalizedUserEmployeeId = String(userEmployeeId);
                                    mappedAppointments = mappedAppointments.filter((a: Appointment) => {
                                        const appointmentDoctorId = normalizeId(a.doctor_id);
                                        return appointmentDoctorId === normalizedUserEmployeeId;
                                    });
                                } else {
                                    mappedAppointments = [];
                                }
                            }

                            setAppointments(mappedAppointments);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching appointments:", error);
                }
            }
        }
    }, [canManage, userRole, userEmployeeId]);

    const handleRefresh = async () => {
        try {
            const [appointmentsRes, employeesRes, patientsRes] = await Promise.all([
                fetch("/api/appointments", { cache: "no-store" }),
                fetch("/api/employees", { cache: "no-store" }),
                getPatients(),
            ]);

            if (!appointmentsRes.ok) throw new Error("Failed to refresh appointments");

            const appointmentsData = await appointmentsRes.json();

            let employeesData: any[] = [];
            if (employeesRes.ok) {
                employeesData = await employeesRes.json();
                const doctorsList = Array.isArray(employeesData)
                    ? employeesData
                        .filter((emp: any) => emp.position === "Bác sĩ")
                        .map((emp: any) => ({
                            _id: String(emp._id),
                            fullname: emp.fullname,
                            position: emp.position,
                        }))
                    : [];
                setDoctors(doctorsList);
            }

            const mappedPatients = patientsRes.map((p: any) => ({
                _id: String(p._id),
                fullname: p.fullname,
            }));
            setPatients(mappedPatients);

            const mapApiToUiStatus = (s: string) => {
                if (s === "warning") return "Scheduled";
                if (s === "success") return "Completed";
                if (s === "error") return "Cancelled";
                return s;
            };

            const findDoctorInRefresh = (doctorId: string | null): Doctor | null => {
                if (!doctorId) return null;
                const normalizedDoctorId = String(doctorId);

                const currentDoctors = Array.isArray(employeesData)
                    ? employeesData
                        .filter((emp: any) => emp.position === "Bác sĩ")
                        .map((emp: any) => ({
                            _id: String(emp._id),
                            fullname: emp.fullname,
                            position: emp.position,
                        }))
                    : doctors.map(d => ({ ...d, _id: String(d._id) }));

                let doctor = currentDoctors.find((d: Doctor) => {
                    return String(d._id) === normalizedDoctorId;
                });

                if (!doctor) {
                    const employee = employeesData.find((emp: any) => {
                        return String(emp._id) === normalizedDoctorId;
                    });

                    if (employee) {
                        doctor = {
                            _id: String(employee._id),
                            fullname: employee.fullname,
                            position: employee.position || "",
                        };
                    }
                }

                return doctor || null;
            };

            let mappedAppointments = appointmentsData.map((a: {
                _id: string;
                doctor_id?: string;
                patient_id?: string;
                appointment_date: string;
                status: string;
                reason?: string;
                created_at?: string;
            }) => {
                const appointmentDoctorId = normalizeId(a.doctor_id);
                const appointmentPatientId = normalizeId(a.patient_id);

                const doctor = findDoctorInRefresh(appointmentDoctorId);
                const patientName = resolvePatientNameFromAppointment(a, mappedPatients);

                return {
                    id: a._id,
                    doctor_id: appointmentDoctorId || undefined,
                    patient_id: appointmentPatientId || undefined,
                    doctorName: doctor ? doctor.fullname : "Không rõ",
                    patientName: patientName,
                    appointmentDate: a.appointment_date,
                    status: mapApiToUiStatus(a.status),
                    reason: a.reason,
                    createdAt: a.created_at,
                };
            });

            if (!canManage) {
                if (userEmployeeId) {
                    const normalizedUserEmployeeId = String(userEmployeeId);
                    mappedAppointments = mappedAppointments.filter((a: Appointment) => {
                        const appointmentDoctorId = normalizeId(a.doctor_id);
                        return appointmentDoctorId === normalizedUserEmployeeId;
                    });
                } else {
                    mappedAppointments = [];
                }
            }

            setAppointments(mappedAppointments);
        } catch (error) {
            console.error("Refresh error:", error);
            window.location.reload();
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return;

        const es = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);
        es.onmessage = (e) => {
            try {
                const notif = JSON.parse(e.data);
                if (notif && notif.related_type === "appointment") {
                    handleRefresh();
                }
            } catch (err) {
                console.error("SSE parse error:", err);
            }
        };
        es.onerror = (err) => {
            console.warn("SSE error:", err);
        };

        return () => {
            es.close();
        };
    }, [userRole, userEmployeeId]);



    return (
        <div>
            <div className="p-6 pb-0 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Lịch hẹn</h1>
            </div>
            <CalendarLayout
                appointments={appointments}
                doctors={doctors}
                patients={patients}
                onRefresh={handleRefresh}
                canManage={canManage}
            />
        </div>
    );
}

