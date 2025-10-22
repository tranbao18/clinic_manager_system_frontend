"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

type Appointment = {
    id: string;
    doctorName: string;
    appointmentDate: string; // ISO
    status: "Scheduled" | "Cancelled" | "Pending" | string;
    reason: string;
    createdAt: string;
};

type CalendarLayoutProps = {
    appointments: Appointment[];
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

export default function CalendarLayout({ appointments }: CalendarLayoutProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedAppointments, setSelectedAppointments] = useState<Appointment[]>([]);
    const [open, setOpen] = useState(false);

    const weeks = generateCalendar(currentYear, currentMonth);

    const getAppointmentByDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return appointments.filter((a) => {
            if (!a.appointmentDate) return false;
            const apptDate = new Date(a.appointmentDate).toISOString().split("T")[0];
            return apptDate === dateStr;
        });
    };


    const handleClickDate = (date: Date) => {
        const appts = getAppointmentByDate(date);
        if (appts.length > 0) {
            setSelectedDate(date);
            setSelectedAppointments(appts);
            setOpen(true);
        }
    };

    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
        "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
        "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];

    const yearRange = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);

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
                                                            a.status === "Scheduled" && "bg-green-100 text-green-700",
                                                            a.status === "Pending" && "bg-yellow-100 text-yellow-700",
                                                            a.status === "Cancelled" && "bg-red-100 text-red-700"
                                                        )}
                                                    >
                                                        {a.doctorName}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-muted-foreground text-xs italic">&nbsp;</div>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Lịch hẹn ngày{" "}
                            {selectedDate &&
                                selectedDate.toLocaleDateString("vi-VN")}
                        </DialogTitle>
                        <DialogDescription>
                            Chi tiết các cuộc hẹn trong ngày này.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAppointments.map((a) => {
                        const time = new Date(a.appointmentDate).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        return (
                            <div key={a.id} className="border rounded p-3 mb-2">
                                <p><strong>Bác sĩ:</strong> {a.doctorName}</p>
                                <p><strong>Giờ hẹn:</strong> {time}</p>
                                <p><strong>Lý do:</strong> {a.reason}</p>
                                <p><strong>Trạng thái:</strong> {a.status}</p>
                            </div>
                        );
                    })}
                </DialogContent>
            </Dialog>
        </>
    );
}
