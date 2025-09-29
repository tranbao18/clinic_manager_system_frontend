import CalendarLayout from "@/components/layout/CalendarLayout";
import { getServerSession } from "next-auth"; // nếu bạn dùng NextAuth

export default async function SchedulesPage() {
    // 🔹 Lấy session từ NextAuth
    // const session = await getServerSession(authOptions);

    // // Nếu chưa login
    // if (!session) {
    //     return <div className="p-6">Vui lòng đăng nhập để xem lịch trực</div>;
    // }

    // 🔹 Lấy role từ session user
    // const role = session.user.role as "doctor" | "nurse" | "receptionist";

    // 🔹 Dữ liệu lịch trực (ví dụ fetch từ API)
    const schedules = [
        { date: "2025-09-22", type: "success", content: "Trực phòng khám", role: "doctor" },
        { date: "2025-09-22", type: "warning", content: "Hỗ trợ cấp cứu", role: "nurse" },
        { date: "2025-09-23", type: "info", content: "Tiếp nhận bệnh nhân", role: "receptionist" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Lịch trực của bạn</h1>
            <CalendarLayout appointments={schedules} />
        </div>
    );
}
