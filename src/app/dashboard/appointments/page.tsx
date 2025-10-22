import CalendarLayout from "@/components/layout/CalendarLayout";

export default async function AppointmentsPage() {
    let appointments: any[] = [];

    try {
        const res = await fetch(
            "https://68f086550b966ad5003328d8.mockapi.io/appointments",
            { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        appointments = await res.json();
    } catch (err: any) {
        console.error("❌ getAppointments error:", err.message);
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Lịch hẹn khám</h1>
            {/* 👇 Truyền nguyên dữ liệu JSON từ API */}
            <CalendarLayout appointments={appointments} />
        </div>
    );
}
