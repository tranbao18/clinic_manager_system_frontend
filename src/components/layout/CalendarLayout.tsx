"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Appointment = {
    date: string; // YYYY-MM-DD
    type: "success" | "warning" | "error" | "info";
    content: string;
    role: "doctor" | "nurse" | "receptionist"; // 🔹 Ai trực
};

type CalendarLayoutProps = {
    appointments: Appointment[];
    role: "doctor" | "nurse" | "receptionist"; // 🔹 Role user đang đăng nhập
};

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// Hàm tạo lịch tháng
function generateCalendar(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Fill ngày trống đầu tuần
    for (let i = 0; i < (firstDay.getDay() + 6) % 7; i++) {
        currentWeek.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        currentWeek.push(new Date(year, month, day));
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Fill ngày trống cuối tuần
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    return weeks;
}

export default function CalendarLayout({ appointments, role }: CalendarLayoutProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const weeks = generateCalendar(currentYear, currentMonth);

    // 🔹 Lọc theo role
    const filteredAppointments = appointments.filter((a) => a.role === role);

    const getAppointment = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return filteredAppointments.filter((a) => a.date === dateStr);
    };

    const handlePrev = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const handleNext = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle>
                    {`Tháng ${currentMonth + 1}/${currentYear}`}
                </CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handlePrev}>Tháng trước</Button>
                    <Button onClick={handleNext}>Tháng sau</Button>
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
                            if (!date) return <div key={wi + "-" + di} className="p-4 border rounded bg-muted"></div>;

                            const dayAppointments = getAppointment(date);

                            return (
                                <div
                                    key={wi + "-" + di}
                                    className={cn(
                                        "p-2 border rounded text-sm min-h-[80px] text-left",
                                        date.toDateString() === today.toDateString() && "bg-blue-100 font-bold"
                                    )}
                                >
                                    <div className="font-medium">{date.getDate()}</div>
                                    <div className="space-y-1 mt-1">
                                        {dayAppointments.map((a, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "p-1 rounded text-xs",
                                                    a.type === "success" && "bg-green-100 text-green-700",
                                                    a.type === "warning" && "bg-yellow-100 text-yellow-700",
                                                    a.type === "error" && "bg-red-100 text-red-700",
                                                    a.type === "info" && "bg-blue-100 text-blue-700"
                                                )}
                                            >
                                                {a.content}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
