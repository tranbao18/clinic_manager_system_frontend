import CalendarLayout from "@/components/layout/CalendarLayout";
export default async function AppointmentsPage() {
    // 🔹 Giả sử fetch từ API lịch hẹn của bác sĩ
    const appointments = [
        { date: "2025-09-22", type: "success", content: "Khám bệnh nhân A" },
        { date: "2025-09-23", type: "warning", content: "Khám bệnh nhân B" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Lịch hẹn khám</h1>
            <CalendarLayout appointments={appointments} />
        </div>
    );
}
