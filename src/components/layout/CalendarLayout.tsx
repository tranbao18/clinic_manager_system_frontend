"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    type CreateAppointmentData,
    type UpdateAppointmentData,
} from "@/lib/services/appointmentsService";

type Appointment = {
    id: string;
    doctor_id?: string;
    patient_id?: string;
    doctorName: string;
    patientName: string;
    appointmentDate: string; // ISO
    status: "Scheduled" | "Cancelled" | "Pending" | "Completed" | string;
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

type CalendarLayoutProps = {
    appointments: Appointment[];
    userRole?: string;
    doctors?: Doctor[];
    patients?: Patient[];
    onRefresh?: () => void;
};

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function generateCalendar(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let i = 0; i < (firstDay.getDay() + 6) % 7; i++) currentWeek.push(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
        currentWeek.push(new Date(year, month, day));
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    return weeks;
}

export default function CalendarLayout({
    appointments,
    userRole = "",
    doctors = [],
    patients = [],
    onRefresh,
}: CalendarLayoutProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedAppointments, setSelectedAppointments] = useState<
        Appointment[]
    >([]);
    const [open, setOpen] = useState(false);
    const [showOldAppointments, setShowOldAppointments] = useState(true);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{
        open: boolean;
        type: "success" | "error" | "warning";
        message: string;
    }>({ open: false, type: "success", message: "" });

    // Form state
    const [formDoctorId, setFormDoctorId] = useState("");
    const [formPatientId, setFormPatientId] = useState("");
    const [formDate, setFormDate] = useState("");
    const [formTime, setFormTime] = useState("");
    const [formReason, setFormReason] = useState("");
    const [formStatus, setFormStatus] = useState<"Scheduled" | "Cancelled" | "Pending" | "Completed">("Scheduled");

    const isReceptionist = userRole?.toLowerCase() === "receptionist";

    // Helper function to convert status to Vietnamese
    const getStatusLabel = (status: string): string => {
        const statusMap: Record<string, string> = {
            Scheduled: "Đã đặt",
            Cancelled: "Đã hủy",
            Completed: "Hoàn thành",
            Pending: "Chờ xử lý",
        };
        return statusMap[status] || status;
    };

    const weeks = generateCalendar(currentYear, currentMonth);

    // Filter appointments based on showOldAppointments
    const filteredAppointments = showOldAppointments
        ? appointments
        : appointments.filter((a) => {
            if (!a.appointmentDate) return false;
            const apptDate = new Date(a.appointmentDate);
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            apptDate.setHours(0, 0, 0, 0);
            return apptDate >= todayStart;
        });

    // Helper function to get local date string (YYYY-MM-DD) without timezone issues
    const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Helper function to get local date string from ISO string
    const getLocalDateStringFromISO = (isoString: string): string => {
        const date = new Date(isoString);
        return getLocalDateString(date);
    };

    const getAppointmentByDate = (date: Date) => {
        const dateStr = getLocalDateString(date);
        return filteredAppointments.filter((a) => {
            if (!a.appointmentDate) return false;
            const apptDateStr = getLocalDateStringFromISO(a.appointmentDate);
            return apptDateStr === dateStr;
        });
    };

    // Refresh selectedAppointments when appointments change and dialog is open
    useEffect(() => {
        if (open && selectedDate) {
            const dateStr = getLocalDateString(selectedDate);
            const appts = filteredAppointments.filter((a) => {
                if (!a.appointmentDate) return false;
                const apptDateStr = getLocalDateStringFromISO(a.appointmentDate);
                return apptDateStr === dateStr;
            });
            setSelectedAppointments(appts);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appointments, open, selectedDate, showOldAppointments]);

    const handleClickDate = (date: Date) => {
        const appts = getAppointmentByDate(date);
        if (appts.length > 0 || isReceptionist) {
            setSelectedDate(date);
            setSelectedAppointments(appts);
            setOpen(true);
        }
    };

    const handleCreateAppointment = () => {
        setEditingAppointment(null);
        setFormDoctorId("");
        setFormPatientId("");
        // Set today's date as default if no date selected
        const defaultDate = selectedDate || new Date();
        setFormDate(formatDateInput(defaultDate));
        setFormTime("09:00");
        setFormReason("");
        setFormStatus("Scheduled");
        setOpenFormDialog(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setFormDoctorId(appointment.doctor_id || "");
        setFormPatientId(appointment.patient_id || "");
        // Parse date in local timezone to avoid timezone offset issues
        const apptDate = new Date(appointment.appointmentDate);
        // Create a new date using local components to avoid timezone conversion
        const localDate = new Date(
            apptDate.getFullYear(),
            apptDate.getMonth(),
            apptDate.getDate()
        );
        setFormDate(formatDateInput(localDate));
        setFormTime(
            apptDate.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
        );
        setFormReason(appointment.reason || "");
        setFormStatus(appointment.status as "Scheduled" | "Cancelled" | "Pending" | "Completed");
        setOpenFormDialog(true);
    };

    const handleDeleteAppointment = (appointment: Appointment) => {
        setDeletingAppointment(appointment);
        setOpenDeleteDialog(true);
    };

    const formatDateInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const showNotification = (
        type: "success" | "error" | "warning",
        message: string
    ) => {
        setNotification({ open: true, type, message });
    };

    const handleSubmitForm = async () => {
        if (!formDoctorId || !formPatientId || !formDate || !formTime) {
            showNotification("error", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            setLoading(true);
            const [hours, minutes] = formTime.split(":");
            // Create date in local timezone to avoid timezone offset issues
            const [year, month, day] = formDate.split("-").map(Number);
            const appointmentDateTime = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0);

            if (editingAppointment) {
                const updateData: UpdateAppointmentData = {
                    doctor_id: formDoctorId,
                    patient_id: formPatientId,
                    appointment_date: appointmentDateTime.toISOString(),
                    reason: formReason,
                    status: formStatus,
                };
                await updateAppointment(editingAppointment.id, updateData);
                
                // Refresh data before showing notification
                if (onRefresh) {
                    await onRefresh();
                } else {
                    window.location.reload();
                    return; // Exit early if reloading
                }
                
                showNotification("success", "Cập nhật lịch hẹn thành công");
            } else {
                const createData: CreateAppointmentData = {
                    doctor_id: formDoctorId,
                    patient_id: formPatientId,
                    appointment_date: appointmentDateTime.toISOString(),
                    reason: formReason,
                    status: formStatus,
                };
                await createAppointment(createData);
                
                // Refresh data before showing notification
                if (onRefresh) {
                    await onRefresh();
                } else {
                    window.location.reload();
                    return; // Exit early if reloading
                }
                
                showNotification("success", "Tạo lịch hẹn thành công");
            }

            setOpenFormDialog(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
            showNotification("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingAppointment) return;

        try {
            setLoading(true);
            await deleteAppointment(deletingAppointment.id);
            
            // Refresh data before showing notification
            if (onRefresh) {
                await onRefresh();
            } else {
                window.location.reload();
                return; // Exit early if reloading
            }
            
            showNotification("success", "Xóa lịch hẹn thành công");
            setOpenDeleteDialog(false);
            setDeletingAppointment(null);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
            showNotification("error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
    ];

    const yearRange = Array.from(
        { length: 11 },
        (_, i) => today.getFullYear() - 5 + i
    );

    return (
        <>
            {isReceptionist && (
                <div className="mb-4 flex justify-end">
                    <Button onClick={handleCreateAppointment} size="sm">
                        + Thêm lịch hẹn
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setCurrentMonth((prevMonth) => {
                                    let newMonth = prevMonth - 1;
                                    let newYear = currentYear;

                                    if (newMonth < 0) {
                                        newMonth = 11;
                                        newYear = currentYear - 1;
                                    }

                                    setCurrentYear(newYear);
                                    return newMonth;
                                });
                            }}
                            className="px-3 py-1 border rounded hover:bg-muted"
                        >
                            ←
                        </button>

                        <CardTitle>
                            {monthNames[currentMonth]}, {currentYear}
                        </CardTitle>

                        <button
                            onClick={() => {
                                setCurrentMonth((prevMonth) => {
                                    let newMonth = prevMonth + 1;
                                    let newYear = currentYear;

                                    if (newMonth > 11) {
                                        newMonth = 0;
                                        newYear = currentYear + 1;
                                    }

                                    setCurrentYear(newYear);
                                    return newMonth;
                                });
                            }}
                            className="px-3 py-1 border rounded hover:bg-muted"
                        >
                            →
                        </button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOldAppointments}
                                onChange={(e) => setShowOldAppointments(e.target.checked)}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <span>Hiển thị lịch hẹn cũ</span>
                        </label>

                        <Select
                            value={currentMonth.toString()}
                            onValueChange={(v) => setCurrentMonth(parseInt(v))}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Chọn tháng" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthNames.map((m, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={currentYear.toString()}
                            onValueChange={(v) => setCurrentYear(parseInt(v))}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Chọn năm" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearRange.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center font-semibold">
                        {weekdays.map((day) => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 mt-2">
                        {weeks.map((week, wi) =>
                            week.map((date, di) => {
                                if (!date)
                                    return (
                                        <div
                                            key={wi + "-" + di}
                                            className="p-4 border rounded bg-muted"
                                        ></div>
                                    );

                                const dayAppointments = getAppointmentByDate(date);

                                return (
                                    <div
                                        key={wi + "-" + di}
                                        onClick={() => handleClickDate(date)}
                                        className={cn(
                                            "p-2 border rounded text-sm min-h-[80px] text-left cursor-pointer hover:bg-blue-50 transition",
                                            date.toDateString() === today.toDateString() &&
                                            "bg-blue-100 font-bold"
                                        )}
                                    >
                                        <div className="font-medium">{date.getDate()}</div>
                                        <div className="space-y-1 mt-1">
                                            {dayAppointments.length > 0 ? (
                                                dayAppointments.map((a, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "p-1 rounded text-xs truncate",
                                                            a.status === "Scheduled" &&
                                                            "bg-green-100 text-green-700",
                                                            a.status === "Cancelled" &&
                                                            "bg-red-100 text-red-700",
                                                            a.status === "Completed" &&
                                                            "bg-blue-100 text-blue-700"
                                                        )}
                                                    >
                                                        {a.patientName}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-muted-foreground text-xs italic">
                                                    &nbsp;
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 🩺 Modal chi tiết lịch hẹn */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Lịch hẹn ngày{" "}
                            {selectedDate && selectedDate.toLocaleDateString("vi-VN")}
                        </DialogTitle>
                        <DialogDescription>
                            Chi tiết các cuộc hẹn trong ngày này.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAppointments.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                            Không có lịch hẹn nào trong ngày này.
                        </p>
                    ) : (
                        selectedAppointments.map((a) => {
                            const time = new Date(a.appointmentDate).toLocaleTimeString(
                                "vi-VN",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                }
                            );
                            return (
                                <div key={a.id} className="border rounded p-3 mb-2">
                                    <p>
                                        <strong>Bác sĩ:</strong> {a.doctorName}
                                    </p>
                                    <p>
                                        <strong>Bệnh nhân:</strong> {a.patientName}
                                    </p>
                                    <p>
                                        <strong>Giờ hẹn:</strong> {time}
                                    </p>
                                    <p>
                                        <strong>Lý do:</strong> {a.reason || "Không có"}
                                    </p>
                                    <p>
                                        <strong>Trạng thái:</strong> {getStatusLabel(a.status)}
                                    </p>
                                    {isReceptionist && (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditAppointment(a)}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="bg-red-500 text-white hover:bg-red-600"
                                                onClick={() => handleDeleteAppointment(a)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </DialogContent>
            </Dialog>

            {/* 📝 Form Dialog - Create/Edit */}
            {isReceptionist && (
                <Dialog open={openFormDialog} onOpenChange={setOpenFormDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingAppointment ? "Chỉnh sửa lịch hẹn" : "Thêm lịch hẹn"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingAppointment
                                    ? "Cập nhật thông tin lịch hẹn."
                                    : "Điền thông tin để tạo lịch hẹn mới."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Bác sĩ *
                                </label>
                                <Select
                                    value={formDoctorId}
                                    onValueChange={setFormDoctorId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn bác sĩ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors
                                            .filter((d) => d.position === "Bác sĩ" || d.position === "Doctor")
                                            .map((doc) => (
                                                <SelectItem key={doc._id} value={doc._id}>
                                                    {doc.fullname}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Bệnh nhân *
                                </label>
                                <Select
                                    value={formPatientId}
                                    onValueChange={setFormPatientId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn bệnh nhân" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((pat) => (
                                            <SelectItem key={pat._id} value={pat._id}>
                                                {pat.fullname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Ngày hẹn *
                                </label>
                                <Input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Giờ hẹn * (24h format)
                                </label>
                                <Input
                                    type="time"
                                    value={formTime}
                                    onChange={(e) => setFormTime(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Lý do
                                </label>
                                <Input
                                    value={formReason}
                                    onChange={(e) => setFormReason(e.target.value)}
                                    placeholder="Nhập lý do khám"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Trạng thái
                                </label>
                                <Select
                                    value={formStatus}
                                    onValueChange={(v) =>
                                        setFormStatus(
                                            v as "Scheduled" | "Cancelled" | "Completed"
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Scheduled">Đã đặt</SelectItem>
                                        <SelectItem value="Completed">Hoàn thành</SelectItem>
                                        <SelectItem value="Cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpenFormDialog(false)}
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                                <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSubmitForm} disabled={loading}>
                                    {loading ? "Đang xử lý..." : editingAppointment ? "Cập nhật" : "Tạo"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* 🗑️ Delete Confirmation Dialog */}
            {isReceptionist && (
                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xác nhận xóa lịch hẹn</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn xóa lịch hẹn này? Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </DialogHeader>
                        {deletingAppointment && (
                            <div className="border rounded p-3 mb-4">
                                <p>
                                    <strong>Bác sĩ:</strong> {deletingAppointment.doctorName}
                                </p>
                                <p>
                                    <strong>Bệnh nhân:</strong> {deletingAppointment.patientName}
                                </p>
                                <p>
                                    <strong>Ngày:</strong>{" "}
                                    {(() => {
                                        const date = new Date(deletingAppointment.appointmentDate);
                                        return date.toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        });
                                    })()}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpenDeleteDialog(false);
                                    setDeletingAppointment(null);
                                }}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                className="bg-red-500 text-white hover:bg-red-600"
                                onClick={handleConfirmDelete}
                                disabled={loading}
                            >
                                {loading ? "Đang xóa..." : "Xóa"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* 🔔 Notification Dialog */}
            <Dialog
                open={notification.open}
                onOpenChange={(open) =>
                    setNotification({ ...notification, open })
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {notification.type === "success"
                                ? "Thành công"
                                : notification.type === "error"
                                ? "Lỗi"
                                : "Cảnh báo"}
                        </DialogTitle>
                        <DialogDescription>{notification.message}</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => setNotification({ ...notification, open: false })}>
                            Đóng
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
