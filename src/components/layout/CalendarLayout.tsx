"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  updateAppointment,
  deleteAppointment,
  createAppointment,
  type UpdateAppointmentData,
  type CreateAppointmentData,
} from "@/lib/services/appointmentsService";
import { getPatients, type Patient } from "@/lib/services/patientsService";

type Appointment = {
  id: string;
  _id?: string;
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
  doctors?: Array<{ _id: string; fullname: string }>;
  patients?: Array<{ _id: string; fullname: string }>;
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
  doctors = [],
  patients = [],
}: CalendarLayoutProps) {
  const router = useRouter();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointments, setSelectedAppointments] = useState<
    Appointment[]
  >([]);
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateAppointmentData>({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    status: "",
    reason: "",
  });

  const weeks = generateCalendar(currentYear, currentMonth);


  const getAppointmentByDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return appointments.filter((a) => {
      if (!a.appointmentDate) return false;
      const apptDate = getLocalDateOnlyString(a.appointmentDate);
      return apptDate === dateStr;
    });
  };

  const handleClickDate = (date: Date) => {
    const appts = getAppointmentByDate(date);
    if (appts.length > 0) {
      setSelectedDate(date);
      setSelectedAppointments(appts);
      setOpen(true);
      setIsEditing(false);
      setEditingAppointment(null);
    }
  };

  // Helper function để convert ISO string hoặc date string sang datetime-local format (xử lý timezone)
  const isoToLocalDateTime = (dateString: string): string => {
    if (!dateString) return "";

    // Nếu chỉ có date (yyyy-mm-dd), thêm time mặc định là 00:00 local
    let date: Date;
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Chỉ có date, không có time - tạo date với time 00:00 local
      const [year, month, day] = dateString.split("-").map(Number);
      date = new Date(year, month - 1, day, 0, 0);
    } else {
      // Có đầy đủ datetime ISO string
      date = new Date(dateString);
    }


    // Kiểm tra date hợp lệ
    if (isNaN(date.getTime())) return "";

    // Lấy local time và format thành YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Parse bất kỳ dạng chuỗi ngày giờ về đối tượng Date theo local timezone an toàn
  const parseToLocalDate = (value: string): Date | null => {
    if (!value) return null;
    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d, 0, 0, 0);
    }
    // yyyy-mm-ddTHH:mm (datetime-local)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      const [datePart, timePart] = value.split("T");
      const [y, m, d] = datePart.split("-").map(Number);
      const [hh, mm] = timePart.split(":").map(Number);
      return new Date(y, m - 1, d, hh, mm, 0);
    }
    // Fallback: let JS parse (handles full ISO with Z)
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  // Lấy phần yyyy-mm-dd theo local từ bất kỳ chuỗi ngày giờ
  const getLocalDateOnlyString = (value: string): string => {
    const d = parseToLocalDate(value);
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Chuyển giá trị input datetime-local sang chuỗi local đầy đủ giây (không timezone)
  const toLocalDateTimeSeconds = (value: string): string => {
    // value dạng yyyy-mm-ddTHH:mm
    if (!value) return value;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    return value;
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditing(true);
    // Tìm patient_id và doctor_id từ appointments gốc
    const fullAppointment = appointments.find((a) => a.id === appointment.id);
    setFormData({
      patient_id: appointment.patient_id || "",
      doctor_id: appointment.doctor_id || "",
      appointment_date: appointment.appointmentDate
        ? isoToLocalDateTime(appointment.appointmentDate)
        : "",
      status: appointment.status || "",
      reason: appointment.reason || "",
    });
  };

  const handleSave = async () => {
    if (!editingAppointment) return;

    // Validation
    if (
      !formData.patient_id ||
      !formData.doctor_id ||
      !formData.appointment_date ||
      !formData.status
    ) {
      alert(
        "Vui lòng điền đầy đủ thông tin bắt buộc (Bệnh nhân, Bác sĩ, Ngày giờ, Trạng thái)"
      );
      return;
    }

    try {
      setIsSaving(true);
      // Dùng chuỗi local không timezone để tránh lệch múi giờ
      const localDateTime = toLocalDateTimeSeconds(formData.appointment_date);

      // Map UI status -> API status
      const mapUiToApiStatus = (s: string) => {
        if (s === "Scheduled") return "warning";
        if (s === "Completed") return "success";
        if (s === "Cancelled") return "error";
        return s;
      };

      const updateData: UpdateAppointmentData = {
        ...formData,
        appointment_date: localDateTime,
        status: formData.status ? formData.status : undefined,
      };

      await updateAppointment(editingAppointment.id, updateData);
      // Refresh để cập nhật dữ liệu mới nhất
      router.refresh();
      setIsEditing(false);
      setEditingAppointment(null);
      setOpen(false);
      // Reset form data
      setFormData({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        status: "",
        reason: "",
      });
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      alert(error.message || "Không thể cập nhật lịch hẹn. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (appointmentId: string) => {
    setDeleteAppointmentId(appointmentId);
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteAppointmentId) return;

    try {
      setIsDeleting(true);
      await deleteAppointment(deleteAppointmentId);
      // Refresh để cập nhật danh sách
      router.refresh();
      // Đóng modal sau khi xóa thành công
      setOpen(false);
      setOpenDeleteConfirm(false);
      // Reset state
      setSelectedAppointments([]);
      setDeleteAppointmentId(null);
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      alert(error.message || "Không thể xóa lịch hẹn. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditingAppointment(null);
    setFormData({
      patient_id: "",
      doctor_id: "",
      appointment_date: "",
      status: "",
      reason: "",
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setOpenCreate(true);
    setFormData({
      patient_id: "",
      doctor_id: "",
      appointment_date: "",
      status: "Scheduled",
      reason: "",
    });
  };

  const handleSaveCreate = async () => {
    // Validation
    if (
      !formData.patient_id ||
      !formData.doctor_id ||
      !formData.appointment_date ||
      !formData.status
    ) {
      alert(
        "Vui lòng điền đầy đủ thông tin bắt buộc (Bệnh nhân, Bác sĩ, Ngày giờ, Trạng thái)"
      );
      return;
    }

    try {
      setIsSaving(true);
      // Dùng chuỗi local không timezone để tránh lệch múi giờ
      const localDateTime = toLocalDateTimeSeconds(formData.appointment_date);

      const createData: CreateAppointmentData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_date: localDateTime,
        status: formData.status as string,
        reason: formData.reason || "",
      };

      await createAppointment(createData);
      // Refresh để cập nhật dữ liệu mới nhất
      router.refresh();
      setIsCreating(false);
      setOpenCreate(false);
      // Reset form data
      setFormData({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        status: "",
        reason: "",
      });
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      alert(error.message || "Không thể tạo lịch hẹn. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Map UI status -> API status
  const mapUiToApiStatus = (s: string) => {
    if (s === "Scheduled") return "Đã lên lịch";
    if (s === "Completed") return "Hoàn thành";
    if (s === "Cancelled") return "Đã huỷ";
    return s;
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

          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateNew}
              className="bg-primary hover:bg-primary/90"
            >
              ➕ Tạo lịch hẹn mới
            </Button>
            <div className="flex gap-2">
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
                              a.status === "Pending" &&
                                "bg-yellow-100 text-yellow-700",
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

      {/* 🩺 Modal chi tiết lịch hẹn - Card Layout */}
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setIsEditing(false);
            setEditingAppointment(null);
            setFormData({
              patient_id: "",
              doctor_id: "",
              appointment_date: "",
              status: "",
              reason: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              📅 Lịch hẹn ngày{" "}
              {selectedDate &&
                selectedDate.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </DialogTitle>
            <DialogDescription>
              {selectedAppointments.length} cuộc hẹn trong ngày này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isEditing && editingAppointment ? (
              <Card className="p-6 border-2 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">
                    ✏️ Chỉnh sửa lịch hẹn
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    ✕
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bệnh nhân <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.patient_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, patient_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bệnh nhân" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient._id} value={patient._id}>
                              {patient.fullname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bác sĩ <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.doctor_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, doctor_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bác sĩ" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor._id} value={doctor._id}>
                              {doctor.fullname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ngày và giờ hẹn <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.appointment_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            appointment_date: e.target.value,
                          })
                        }
                      />
                    </div>


                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Trạng thái <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scheduled">Đã lên lịch</SelectItem>
                          <SelectItem value="Completed">Hoàn thành</SelectItem>
                          <SelectItem value="Cancelled">Đã huỷ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Lý do khám
                    </label>
                    <Input
                      value={formData.reason || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      placeholder="Nhập lý do khám"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : selectedAppointments.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Không có lịch hẹn nào trong ngày này
                </p>
              </Card>
            ) : (
              selectedAppointments.map((a) => {
                const time = new Date(a.appointmentDate).toLocaleTimeString(
                  "vi-VN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
                const statusColors = {
                  Scheduled: "bg-green-100 text-green-800 border-green-300",
                  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
                  Cancelled: "bg-red-100 text-red-800 border-red-300",
                  Completed: "bg-blue-100 text-blue-800 border-blue-300",
                };
                const statusColor =
                  statusColors[a.status as keyof typeof statusColors] ||
                  "bg-gray-100 text-gray-800 border-gray-300";

                return (
                  <Card
                    key={a.id}
                    className="p-5 border-2 hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "px-3 py-1 rounded-md text-xs font-bold border-2 uppercase",
                              statusColor
                            )}
                          >
                            {mapUiToApiStatus(a.status)}
                          </span>
                          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                            <span>🕐</span>
                            <span>{time}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary min-w-[80px]">
                              👨‍⚕️ Bác sĩ:
                            </span>
                            <span className="text-sm text-foreground">
                              {a.doctorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary min-w-[80px]">
                              👤 Bệnh nhân:
                            </span>
                            <span className="text-sm text-foreground">
                              {a.patientName}
                            </span>
                          </div>
                          {a.reason && (
                            <div className="flex items-start gap-2 pt-1">
                              <span className="text-sm font-semibold text-primary min-w-[80px]">
                                📝 Lý do:
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {a.reason}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEdit(a)}
                          className="min-w-[120px] bg-yellow-500 "
                        >
                          ✏️ Chỉnh sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(a.id)}
                          disabled={isDeleting}
                          className="min-w-[120px] bg-red-500 "
                        >
                          {isDeleting ? "⏳ Đang xóa..." : "🗑️ Xóa"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ➕ Dialog tạo lịch hẹn mới */}
      <Dialog
        open={openCreate}
        onOpenChange={(isOpen) => {
          setOpenCreate(isOpen);
          if (!isOpen) {
            setIsCreating(false);
            setFormData({
              patient_id: "",
              doctor_id: "",
              appointment_date: "",
              status: "",
              reason: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              ➕ Tạo lịch hẹn mới
            </DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo lịch hẹn mới cho bệnh nhân
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Card className="p-6 border-2 shadow-lg">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bệnh nhân <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.patient_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, patient_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bệnh nhân" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            {patient.fullname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bác sĩ <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.doctor_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, doctor_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bác sĩ" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor._id} value={doctor._id}>
                            {doctor.fullname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ngày và giờ hẹn <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.appointment_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointment_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Đã lên lịch</SelectItem>
                        <SelectItem value="Completed">Hoàn thành</SelectItem>
                        <SelectItem value="Cancelled">Đã huỷ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lý do khám
                  </label>
                  <Input
                    value={formData.reason || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Nhập lý do khám"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenCreate(false);
                      handleCancel();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleSaveCreate} disabled={isSaving}>
                    {isSaving ? "⏳ Đang tạo..." : "💾 Tạo lịch hẹn"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🗑️ Dialog xác nhận xóa lịch hẹn */}
      <Dialog
        open={openDeleteConfirm}
        onOpenChange={(isOpen) => {
          setOpenDeleteConfirm(isOpen);
          if (!isOpen) {
            setDeleteAppointmentId(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              ⚠️ Xác nhận xóa lịch hẹn
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa lịch hẹn này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteConfirm(false);
                setDeleteAppointmentId(null);
              }}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "⏳ Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
