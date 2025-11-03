// lib/menu.tsx
import Link from "next/link";
import {
    DashboardOutlined,
    SolutionOutlined,
    TeamOutlined,
    ScheduleOutlined,
    AreaChartOutlined,
    UserOutlined,
    IdcardOutlined,
} from "@ant-design/icons";

export const getMenuByRole = (role: string) => {
    const allMenus = {
        admin: [
            { key: "1", icon: <DashboardOutlined />, label: "Dashboard", href: "/dashboard" },
            { key: "6", icon: <UserOutlined />, label: "Nhân viên", href: "/dashboard/employees" },
            { key: "4", icon: <ScheduleOutlined />, label: "Lịch hẹn", href: "/dashboard/appointments" },
            { key: "5", icon: <AreaChartOutlined />, label: "Báo cáo", href: "/dashboard/report" },
            { key: "7", icon: <ScheduleOutlined />, label: "Lịch trực", href: "/dashboard/schedules" },
        ],
        doctor: [
            { key: "1", icon: <IdcardOutlined />, label: "Khám bệnh", href: "/dashboard" },
            { key: "2", icon: <TeamOutlined />, label: "Bệnh nhân", href: "/dashboard/patients" },
            { key: "3", icon: <ScheduleOutlined />, label: "Lịch hẹn", href: "/dashboard/appointments" },
            { key: "4", icon: <ScheduleOutlined />, label: "Lịch trực", href: "/dashboard/schedules" },
        ],
        nurse: [
            { key: "7", icon: <ScheduleOutlined />, label: "Lịch trực", href: "/dashboard/schedules" },
        ],
        receptionist: [
            { key: "1", icon: <TeamOutlined />, label: "Bệnh nhân", href: "/dashboard/patients" },
            { key: "2", icon: <ScheduleOutlined />, label: "Lịch hẹn", href: "/dashboard/appointments" },
        ],
        accountant: [
            { key: "1", icon: <AreaChartOutlined />, label: "Hoá đơn", href:"/dashboard/invoices"},
            { key: "2", icon: <ScheduleOutlined />, label: "Bảng lương", href:"/dashboard/payroll"},
            { key: "1", icon: <AreaChartOutlined />, label: "Báo cáo", href:"/dashboard/report"},
        ],
    };

    if (role === "admin") return allMenus.admin;
    if (role === "doctor") return allMenus.doctor;
    if (role === "nurse") return allMenus.nurse;
    if (role === "receptionist") return allMenus.receptionist;
    if (role === "accountant") return allMenus.accountant;
    return [];
};
