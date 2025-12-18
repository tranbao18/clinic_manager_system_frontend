"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Spin, message } from "antd";

interface InventoryItem {
    medicine_id: string;
    name: string;
    unit: string;
    total_remaining: number;
    total_value: number;
}

interface ProfitLossMonthlyResponse {
    success: boolean;
    type: string;
    data: Record<
        string,
        {
            income: number;
            medicineCost: number;
            payrollCost: number;
            profit: number;
        }
    >;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [monthlyProfitLoss, setMonthlyProfitLoss] =
        useState<ProfitLossMonthlyResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Lấy năm hiện tại để tính lãi/lỗ theo tháng trong năm
                const now = new Date();
                const year = now.getFullYear();
                const startDate = `${year}-01-01`;
                const endDate = `${year}-12-31`;

                const [invRes, qtyRes, valRes, plRes] = await Promise.all([
                    fetch("/api/reports/medicine/inventory"),
                    fetch("/api/reports/medicine/inventory/quantity"),
                    fetch("/api/reports/medicine/inventory/value"),
                    fetch(
                        `/api/reports/profit-loss/monthly?startDate=${startDate}&endDate=${endDate}`
                    ),
                ]);

                const invData = await invRes.json();
                const qtyData = await qtyRes.json();
                const valData = await valRes.json();
                const plData = await plRes.json();

                if (!invRes.ok) {
                    throw new Error(invData.error || "Không thể lấy tồn kho thuốc");
                }
                if (!qtyRes.ok) {
                    throw new Error(
                        qtyData.error || "Không thể lấy tổng số lượng tồn kho"
                    );
                }
                if (!valRes.ok) {
                    throw new Error(
                        valData.error || "Không thể lấy tổng giá trị tồn kho"
                    );
                }
                if (!plRes.ok) {
                    throw new Error(
                        plData.error || "Không thể lấy báo cáo lãi/lỗ theo tháng"
                    );
                }

                setInventory(invData.data || []);
                setTotalQuantity(qtyData.total_quantity || 0);
                setTotalValue(valData.total_value || 0);
                setMonthlyProfitLoss(plData);
            } catch (err: any) {
                console.error("Fetch report data error:", err);
                message.error(err.message || "Không thể tải dữ liệu báo cáo");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Chuẩn bị dữ liệu cho LineChart (thu / chi theo tháng)
    const { xLabels, incomeSeries, expenseSeries } = useMemo(() => {
        if (!monthlyProfitLoss || !monthlyProfitLoss.data) {
            return { xLabels: [], incomeSeries: [], expenseSeries: [] };
        }

        const keys = Object.keys(monthlyProfitLoss.data).sort(); // YYYY-MM
        const incomeSeries = keys.map(
            (k) => monthlyProfitLoss.data[k].income || 0
        );
        const expenseSeries = keys.map((k) => {
            const d = monthlyProfitLoss.data[k];
            return (d.medicineCost || 0) + (d.payrollCost || 0);
        });

        // Hiển thị nhãn dạng Th1, Th2,...
        const xLabels = keys.map((k) => {
            const month = Number(k.slice(5, 7));
            return `Th${month}`;
        });

        return { xLabels, incomeSeries, expenseSeries };
    }, [monthlyProfitLoss]);

    // Chuẩn bị dữ liệu cho PieChart tồn kho (top 5 + Khác)
    const stockData = useMemo(() => {
        if (!inventory || inventory.length === 0) return [];
        const sorted = [...inventory].sort(
            (a, b) => b.total_remaining - a.total_remaining
        );
        const top = sorted.slice(0, 5);
        const others = sorted.slice(5);

        const total = inventory.reduce(
            (sum, item) => sum + (item.total_remaining || 0),
            0
        );

        const data = top.map((item, idx) => ({
            id: idx,
            value: item.total_remaining,
            label: item.name,
        }));

        const otherTotal = others.reduce(
            (sum, item) => sum + (item.total_remaining || 0),
            0
        );
        if (otherTotal > 0) {
            data.push({
                id: data.length,
                value: otherTotal,
                label: "Khác",
            });
        }

        // Nếu tổng = 0, tránh chia 0 khi hiển thị %
        if (total === 0) {
            return data;
        }

        return data;
    }, [inventory]);

    const reportData = [
        {
            title: "Tổng giá trị tồn kho",
            value: new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(totalValue || 0),
            icon: <DollarOutlined />,
            color: "#52c41a",
        },
        {
            title: "Tổng số lượng tồn kho",
            value: `${(totalQuantity || 0).toLocaleString()} đơn vị`,
            icon: <MedicineBoxOutlined />,
            color: "#faad14",
        },
        {
            title: "Tổng lợi nhuận năm",
            value: (() => {
                if (!monthlyProfitLoss || !monthlyProfitLoss.data) return "0 VND";
                const totalProfit = Object.values(monthlyProfitLoss.data).reduce(
                    (sum, d) => sum + (d.profit || 0),
                    0
                );
                return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(totalProfit);
            })(),
            icon: <TeamOutlined />,
            color: "#1890ff",
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Báo cáo tổng quan</h1>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Spin size="large" />
                </div>
            ) : (
                <>
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
                            <h2 className="text-lg font-semibold mb-4">
                                Thu - chi theo tháng ({new Date().getFullYear()})
                            </h2>
                            <LineChart
                                width={500}
                                height={300}
                                series={[
                                    {
                                        data: incomeSeries,
                                        label: "Thu nhập",
                                        yAxisId: "leftAxisId",
                                    },
                                    {
                                        data: expenseSeries,
                                        label: "Chi phí",
                                        yAxisId: "rightAxisId",
                                    },
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
                            <h2 className="text-lg font-semibold mb-4">
                                Cơ cấu tồn kho dược phẩm
                            </h2>
                            <PieChart
                                series={[
                                    {
                                        data: stockData,
                                        // Không hiển thị tên thuốc trực tiếp trên lát cắt,
                                        // chỉ dùng legend bên phải.
                                        arcLabel: undefined,
                                        arcLabelMinAngle: 15,
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
                </>
            )}
        </div>
    );
}
