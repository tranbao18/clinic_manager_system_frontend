"use client";

import ReportCard from "@/components/layout/ReportCard";
import {
    DollarOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
} from "@ant-design/icons";
import {
    LineChart,
    PieChart,
    pieArcLabelClasses,
} from "@mui/x-charts";
import { Box } from "@mui/material";

// Dữ liệu giả
const xLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const incomeData = [100, 120, 90, 140, 180, 200, 170, 210, 230, 190, 220, 250]; // Thu
const expenseData = [80, 100, 70, 120, 150, 160, 140, 180, 200, 160, 180, 210]; // Chi

// Tồn kho dược phẩm
const stockData = [
    { id: 0, value: 40, label: "Thuốc A" },
    { id: 1, value: 25, label: "Thuốc B" },
    { id: 2, value: 20, label: "Thuốc C" },
    { id: 3, value: 15, label: "Khác" },
];

export default function ReportsPage() {
    const reportData = [
        {
            title: "Thu chi hàng tháng",
            value: "120,000,000 VND",
            icon: <DollarOutlined />,
            color: "#52c41a",
        },
        {
            title: "Tổng số nhân viên",
            value: 35,
            icon: <TeamOutlined />,
            color: "#1890ff",
        },
        {
            title: "Tồn kho dược phẩm",
            value: "250 sản phẩm",
            icon: <MedicineBoxOutlined />,
            color: "#faad14",
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Báo cáo tổng quan</h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {reportData.map((item, index) => (
                    <ReportCard
                        key={index}
                        title={item.title}
                        value={item.value}
                        icon={item.icon}
                        color={item.color}
                    />
                ))}
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Line Chart - Thu Chi */}
                <Box className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Thu chi hàng tháng</h2>
                    <LineChart
                        width={500}
                        height={300}
                        series={[
                            { data: incomeData, label: "Thu nhập", yAxisId: "leftAxisId" },
                            { data: expenseData, label: "Chi phí", yAxisId: "rightAxisId" },
                        ]}
                        xAxis={[{ scaleType: "point", data: xLabels }]}
                        yAxis={[
                            { id: "leftAxisId", width: 50 },
                            { id: "rightAxisId", position: "right" },
                        ]}
                    />
                </Box>

                {/* Pie Chart - Tồn kho */}
                <Box className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Tồn kho dược phẩm</h2>
                    <PieChart
                        series={[
                            {
                                data: stockData,
                                arcLabel: (item) => `${item.value}%`,
                                arcLabelMinAngle: 35,
                                arcLabelRadius: "60%",
                            },
                        ]}
                        width={400}
                        height={300}
                        sx={{
                            [`& .${pieArcLabelClasses.root}`]: {
                                fontWeight: "bold",
                            },
                        }}
                    />
                </Box>
            </div>
        </div>
    );
}
