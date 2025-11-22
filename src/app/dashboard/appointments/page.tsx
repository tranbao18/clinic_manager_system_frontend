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

    // Fetch user info và set permissions
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
                    // Chỉ Admin và Receptionist được quản lý appointments
                    setCanManage(role === "Admin" || role === "Receptionist");
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };
        fetchUserInfo();
    }, []);

    // Fetch doctors và patients khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch doctors từ employees (filter position = "Bác sĩ")
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

                // Fetch patients (luôn fetch để hiển thị tên trong appointments)
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

                // Fetch appointments để hiển thị ngay
                try {
                    const appointmentsRes = await fetch("/api/appointments", { cache: "no-store" });
                    if (appointmentsRes.ok) {
                        const appointmentsData = await appointmentsRes.json();
                        
                        // Map status từ API về UI values (API có thể trả về "warning"/"success"/"error" hoặc "Scheduled"/"Completed"/"Cancelled")
                        const mapApiToUiStatus = (s: string) => {
                            if (s === "warning") return "Scheduled";
                            if (s === "success") return "Completed";
                            if (s === "error") return "Cancelled";
                            // Nếu API đã trả về đúng format thì giữ nguyên
                            if (s === "Scheduled" || s === "Completed" || s === "Cancelled") return s;
                            return s;
                        };

                        // Helper function to find doctor, với fallback từ allEmployeesData nếu cần
                        const findDoctor = (doctorId: string | null): Doctor | null => {
                            if (!doctorId) return null;
                            const normalizedDoctorId = String(doctorId);
                            
                            // Tìm trong doctorsList trước
                            let doctor = doctorsList.find((d: Doctor) => {
                                return String(d._id) === normalizedDoctorId;
                            });
                            
                            // Nếu không tìm thấy, thử tìm trong allEmployeesData (có thể doctor chưa được filter vào doctorsList)
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
                                    // Thêm vào doctorsList nếu là bác sĩ
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
                            // Normalize IDs to strings for comparison
                            const appointmentDoctorId = a.doctor_id ? String(a.doctor_id) : null;
                            const appointmentPatientId = a.patient_id ? String(a.patient_id) : null;
                            
                            const doctor = findDoctor(appointmentDoctorId);
                            const patient = mappedPatients.find((p: Patient) => {
                                const patientId = String(p._id);
                                return patientId === appointmentPatientId;
                            });

                            return {
                                id: a._id,
                                doctor_id: appointmentDoctorId || undefined,
                                patient_id: appointmentPatientId || undefined,
                                doctorName: doctor ? doctor.fullname : "Không rõ",
                                patientName: patient ? patient.fullname : "Không rõ",
                                appointmentDate: a.appointment_date,
                                status: mapApiToUiStatus(a.status),
                                reason: a.reason,
                                createdAt: a.created_at,
                            };
                        });

                        // Filter appointments dựa trên role
                        // Nếu không phải Admin hoặc Receptionist, chỉ hiển thị appointments của chính mình
                        // Nếu không có employee_id và không phải Admin/Receptionist, không hiển thị gì
                        if (!canManage) {
                            if (userEmployeeId) {
                                const normalizedUserEmployeeId = String(userEmployeeId);
                                mappedAppointments = mappedAppointments.filter((a: Appointment) => {
                                    const appointmentDoctorId = a.doctor_id ? String(a.doctor_id) : null;
                                    return appointmentDoctorId === normalizedUserEmployeeId;
                                });
                            } else {
                                // Không có employee_id và không phải Admin/Receptionist -> không hiển thị appointments
                                mappedAppointments = [];
                            }
                        }

                        setAppointments(mappedAppointments);
                    }
                } catch (error) {
                    console.error("Error fetching appointments:", error);
                }
            } catch (error) {
                console.error("Error fetching doctors/patients:", error);
            }
        };

        // Chỉ fetch khi đã có user info
        if (userRole || userEmployeeId !== null) {
            fetchData();
        }
    }, [canManage, userRole, userEmployeeId]);

    const handleRefresh = async () => {
        try {
            // Fetch tất cả data cùng lúc
            const [appointmentsRes, employeesRes, patientsRes] = await Promise.all([
                fetch("/api/appointments", { cache: "no-store" }),
                fetch("/api/employees", { cache: "no-store" }),
                getPatients(),
            ]);

            if (!appointmentsRes.ok) throw new Error("Failed to refresh appointments");

            const appointmentsData = await appointmentsRes.json();
            
            // Parse employees data một lần
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

            // Update patients
            const mappedPatients = patientsRes.map((p: any) => ({
                _id: String(p._id),
                fullname: p.fullname,
            }));
            setPatients(mappedPatients);

            // Map status từ API về UI values
            const mapApiToUiStatus = (s: string) => {
                if (s === "warning") return "Scheduled";
                if (s === "success") return "Completed";
                if (s === "error") return "Cancelled";
                return s;
            };

            // Helper function to find doctor
            const findDoctorInRefresh = (doctorId: string | null): Doctor | null => {
                if (!doctorId) return null;
                const normalizedDoctorId = String(doctorId);
                
                // Tìm trong currentDoctors trước
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
                
                // Nếu không tìm thấy, thử tìm trong toàn bộ employeesData
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
                // Normalize IDs to strings for comparison
                const appointmentDoctorId = a.doctor_id ? String(a.doctor_id) : null;
                const appointmentPatientId = a.patient_id ? String(a.patient_id) : null;
                
                const doctor = findDoctorInRefresh(appointmentDoctorId);
                const patient = mappedPatients.find((p: Patient) => {
                    const patientId = String(p._id);
                    return patientId === appointmentPatientId;
                });

                return {
                    id: a._id,
                    doctor_id: appointmentDoctorId || undefined,
                    patient_id: appointmentPatientId || undefined,
                    doctorName: doctor ? doctor.fullname : "Không rõ",
                    patientName: patient ? patient.fullname : "Không rõ",
                    appointmentDate: a.appointment_date,
                    status: mapApiToUiStatus(a.status),
                    reason: a.reason,
                    createdAt: a.created_at,
                };
            });

            // Filter appointments dựa trên role
            // Nếu không phải Admin hoặc Receptionist, chỉ hiển thị appointments của chính mình
            // Nếu không có employee_id và không phải Admin/Receptionist, không hiển thị gì
            if (!canManage) {
                if (userEmployeeId) {
                    const normalizedUserEmployeeId = String(userEmployeeId);
                    mappedAppointments = mappedAppointments.filter((a: Appointment) => {
                        const appointmentDoctorId = a.doctor_id ? String(a.doctor_id) : null;
                        return appointmentDoctorId === normalizedUserEmployeeId;
                    });
                } else {
                    // Không có employee_id và không phải Admin/Receptionist -> không hiển thị appointments
                    mappedAppointments = [];
                }
            }

            setAppointments(mappedAppointments);
        } catch (error) {
            console.error("Refresh error:", error);
            // Fallback: reload page
            window.location.reload();
        }
    };

    // Refresh doctors và patients khi cần
    const refreshDoctorsAndPatients = async () => {
        try {
            // Refresh doctors
            const employeesRes = await fetch("/api/employees", { cache: "no-store" });
            if (employeesRes.ok) {
                const employeesData = await employeesRes.json();
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

            // Refresh patients
            const patientsList = await getPatients();
            const mappedPatients = patientsList.map((p: any) => ({
                _id: String(p._id),
                fullname: p.fullname,
            }));
            setPatients(mappedPatients);
        } catch (error) {
            console.error("Error refreshing doctors/patients:", error);
        }
    };

    return (
        <div>
            <div className="p-6 pb-0 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Lịch hẹn</h1>
                {canManage && (
                    <Button
                        onClick={() => router.push("/dashboard/appointments/disabled")}
                    >
                        Thùng rác
                    </Button>
                )}
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

