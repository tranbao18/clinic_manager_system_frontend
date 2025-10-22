// lib/menu.tsx
import Link from "next/link";
import {
    DashboardOutlined,
    SolutionOutlined,
    TeamOutlined,
    ScheduleOutlined,
    AreaChartOutlined,
    UserOutlined,
} from "@ant-design/icons";

export const getMenuByRole = (role: string) => {
    const allMenus = {
        admin: [
            { key: "1", icon: <DashboardOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
            { key: "2", icon: <SolutionOutlined />, label: <Link href="/dashboard/doctors">Bác sĩ</Link> },
            { key: "3", icon: <TeamOutlined />, label: <Link href="/dashboard/patients">Bệnh nhân</Link> },
            { key: "4", icon: <ScheduleOutlined />, label: <Link href="/dashboard/appointments">Lịch hẹn</Link> },
            { key: "5", icon: <AreaChartOutlined />, label: <Link href="/dashboard/report">Báo cáo</Link> },
            { key: "6", icon: <UserOutlined />, label: <Link href="/dashboard/employees">Nhân viên</Link> },
            { key: "7", icon: <ScheduleOutlined />, label: <Link href="/dashboard/schedules">Lịch trực</Link> },
            { key: "8", icon: <UserOutlined />, label: <Link href="/dashboard/settings">Cài đặt</Link> },
        ],
        role2: [
            { key: "3", icon: <TeamOutlined />, label: <Link href="/dashboard/patients">Bệnh nhân</Link> },
            { key: "4", icon: <ScheduleOutlined />, label: <Link href="/dashboard/appointments">Lịch hẹn</Link> },
        ],
        role3: [
            { key: "5", icon: <AreaChartOutlined />, label: <Link href="/dashboard/report">Báo cáo</Link> },
            { key: "7", icon: <ScheduleOutlined />, label: <Link href="/dashboard/schedules">Lịch trực</Link> },
        ],
        role4: [
            { key: "5", icon: <AreaChartOutlined />, label: <Link href="/dashboard/report">Báo cáo</Link> },
            { key: "7", icon: <ScheduleOutlined />, label: <Link href="/dashboard/schedules">Lịch trực</Link> },
        ],
        role5: [
            { key: "5", icon: <AreaChartOutlined />, label: <Link href="/dashboard/report">Báo cáo</Link> },
            { key: "7", icon: <ScheduleOutlined />, label: <Link href="/dashboard/schedules">Lịch trực</Link> },
        ],
    };

    if (role === "Admin") return allMenus.admin;
    if (role === "Doctor") return allMenus.role2;
    if (role === "Nurse") return allMenus.role3;
    if (role === "Receptionist") return allMenus.role4;
    if (role === "Accountant") return allMenus.role5;
    return [];
};
